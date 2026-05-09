import LZString from "lz-string";
import { createRowFromPayload } from "./hooks/useSemesterCalculator/rowModel";

export const TEMPLATE_SHARE_PARAM = "cc_tpl";
export const TEMPLATE_SHARE_VERSION = 1;

const V6_PREFIX = "V6:";
const V5_PREFIX = "V5:";
const V4_PREFIX = "V4:";
const V3_PREFIX = "V3:";
const V2_PREFIX = "V2:";
const LEGACY_HEADER_SEPARATOR = "|";
const LEGACY_ROW_SEPARATOR = "|";
const LEGACY_FIELD_SEPARATOR = "~";
const V6_RECORD_SEPARATOR = "\u001e";
const V6_FIELD_SEPARATOR = "\u001f";
const V6_ESCAPE = "\u001d";

const hasCompactValue = (value) => value !== "" && value !== undefined;

const encNum = (n) => {
  if (n === "" || n === undefined || n === null) return "";
  if (Number.isInteger(Number(n))) return Number(n).toString(36);
  return String(n).replace(/^0\./, ".");
};

const decNum = (s) => {
  if (s === "" || s === undefined) return undefined;
  if (s.startsWith(".")) return Number("0" + s);
  if (s.includes(".")) return Number(s);
  return parseInt(s, 36);
};

function decodeOptionalNum(value) {
  if (!hasCompactValue(value)) return undefined;
  const decoded = decNum(value);
  return Number.isFinite(decoded) ? decoded : undefined;
}

function decodeNumWithFallback(value, fallback) {
  const decoded = decodeOptionalNum(value);
  return decoded === undefined ? fallback : decoded;
}

function escapeV6Text(value) {
  return String(value ?? "")
    .split(V6_ESCAPE)
    .join(`${V6_ESCAPE}e`)
    .split(V6_RECORD_SEPARATOR)
    .join(`${V6_ESCAPE}r`)
    .split(V6_FIELD_SEPARATOR)
    .join(`${V6_ESCAPE}f`);
}

function unescapeV6Text(value) {
  const text = String(value ?? "");
  let result = "";

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character !== V6_ESCAPE) {
      result += character;
      continue;
    }

    index += 1;
    const escapeCode = text[index];
    if (escapeCode === "e") result += V6_ESCAPE;
    else if (escapeCode === "r") result += V6_RECORD_SEPARATOR;
    else if (escapeCode === "f") result += V6_FIELD_SEPARATOR;
    else {
      result += V6_ESCAPE;
      if (escapeCode !== undefined) result += escapeCode;
    }
  }

  return result;
}

function compactV6Text(value, fallback) {
  return value === fallback ? "" : escapeV6Text(value);
}

function restoreV6Text(value, fallback) {
  const restored = unescapeV6Text(value);
  return restored || fallback;
}

function trimTrailingEmptyFields(fields) {
  while (fields.length > 0 && fields[fields.length - 1] === "") {
    fields.pop();
  }

  return fields;
}

function serializePayloadV6(payload) {
  const header = [
    encNum(payload.rows.length),
    payload.includeGrades ? "1" : "",
    compactV6Text(payload.name, "Imported Template"),
    compactV6Text(payload.year, "Custom"),
    compactV6Text(payload.semester, "--"),
  ].join(V6_FIELD_SEPARATOR);

  const rows = payload.rows
    .map((row) => {
      const rowFlags = (row.includeExam ? 1 : 0) | (row.includeCa ? 2 : 0);
      const examWeight = row.examWeight ?? 0.6;
      const expectedCaWeight = Math.round((1 - examWeight) * 100) / 100;
      const fields = [
        compactV6Text(row.name, "New module"),
        row.coef === 1 ? "" : encNum(row.coef),
        row.examWeight === 0.6 ? "" : encNum(row.examWeight),
        row.caWeight === expectedCaWeight ? "" : encNum(row.caWeight),
        rowFlags === 3 ? "" : encNum(rowFlags),
      ];

      if (payload.includeGrades) {
        fields.push(encNum(row.exam), encNum(row.ca));
      }

      return trimTrailingEmptyFields(fields).join(V6_FIELD_SEPARATOR);
    })
    .join(V6_RECORD_SEPARATOR);

  return V6_PREFIX + header + V6_RECORD_SEPARATOR + rows;
}

function deserializePayloadV6(str) {
  const payloadStr = str.slice(V6_PREFIX.length);
  const headerEndIndex = payloadStr.indexOf(V6_RECORD_SEPARATOR);
  if (headerEndIndex === -1) return null;

  const header = payloadStr.slice(0, headerEndIndex).split(V6_FIELD_SEPARATOR);
  const [rowCountStr, flagsStr, name, year, semester] = header;
  const rowCount = decodeNumWithFallback(rowCountStr, 0);
  const flags = decodeNumWithFallback(flagsStr, 0);
  const rowsStr = payloadStr.slice(headerEndIndex + 1);
  const rowRecords =
    rowCount === 0 ? [] : rowsStr === "" ? [""] : rowsStr.split(V6_RECORD_SEPARATOR);

  while (rowRecords.length < rowCount) {
    rowRecords.push("");
  }

  const rows = rowRecords.slice(0, rowCount).map((record) => {
    const [rowName, coefStr, ewStr, cwStr, flagsStr, examStr, caStr] =
      record.split(V6_FIELD_SEPARATOR);
    const rowFlags = decodeNumWithFallback(flagsStr, 3);
    const examWeight = decodeNumWithFallback(ewStr, 0.6);
    const expectedCaWeight = Math.round((1 - examWeight) * 100) / 100;

    return {
      name: restoreV6Text(rowName, "New module"),
      coef: decodeNumWithFallback(coefStr, 1),
      examWeight,
      caWeight: decodeNumWithFallback(cwStr, expectedCaWeight),
      includeExam: (rowFlags & 1) !== 0,
      includeCa: (rowFlags & 2) !== 0,
      exam: decodeOptionalNum(examStr),
      ca: decodeOptionalNum(caStr),
    };
  });

  return {
    v: 1,
    name: restoreV6Text(name, "Imported Template"),
    year: restoreV6Text(year, "Custom"),
    semester: restoreV6Text(semester, "--"),
    includeGrades: (flags & 1) !== 0,
    rows,
  };
}

function parseLegacyPayload(str, prefix, headerFieldCount) {
  const payloadStr = str.slice(prefix.length);
  const header = [];
  let cursor = 0;

  for (let index = 0; index < headerFieldCount - 1; index += 1) {
    const nextSeparator = payloadStr.indexOf(LEGACY_HEADER_SEPARATOR, cursor);
    if (nextSeparator === -1) {
      return { header: [], rowRecords: [] };
    }

    header.push(payloadStr.slice(cursor, nextSeparator));
    cursor = nextSeparator + LEGACY_HEADER_SEPARATOR.length;
  }

  const rowDelimiterIndex = payloadStr.indexOf("||", cursor);
  if (rowDelimiterIndex === -1) {
    return { header: [], rowRecords: [] };
  }

  header.push(payloadStr.slice(cursor, rowDelimiterIndex));

  const rowsStr = payloadStr.slice(rowDelimiterIndex + 2);
  const rowRecords =
    rowsStr === "" ? [""] : rowsStr.split(LEGACY_ROW_SEPARATOR);

  return { header, rowRecords };
}

function deserializePayloadV5(str) {
  const { header, rowRecords } = parseLegacyPayload(str, V5_PREFIX, 4);
  const [name, year, semester, flagsStr] = header;
  const flags = parseInt(flagsStr || "0", 10);

  const rows = rowRecords.map((record) => {
    const [rowName, coefStr, ewStr, cwStr, flagsStr, examStr, caStr] =
      record.split(LEGACY_FIELD_SEPARATOR);
    const rowFlags =
      flagsStr !== undefined && flagsStr !== "" ? parseInt(flagsStr, 10) : 3;
    const examWeight = decodeNumWithFallback(ewStr, 0.6);
    const expectedCaWeight = Math.round((1 - examWeight) * 100) / 100;

    return {
      name: rowName || "New module",
      coef: decodeNumWithFallback(coefStr, 1),
      examWeight,
      caWeight: decodeNumWithFallback(cwStr, expectedCaWeight),
      includeExam: (rowFlags & 1) !== 0,
      includeCa: (rowFlags & 2) !== 0,
      exam: decodeOptionalNum(examStr),
      ca: decodeOptionalNum(caStr),
    };
  });

  return {
    v: 1,
    name: name || "Imported Template",
    year: year || "Custom",
    semester: semester || "--",
    includeGrades: (flags & 1) !== 0,
    rows,
  };
}

function deserializePayloadV4(str) {
  const { header, rowRecords } = parseLegacyPayload(str, V4_PREFIX, 4);
  const [name, year, semester, flagsStr] = header;
  const flags = parseInt(flagsStr || "0", 10);

  const rows = rowRecords.map((record) => {
    const [rowName, coefStr, ewStr, cwStr, flagsStr, exam, ca] =
      record.split(LEGACY_FIELD_SEPARATOR);
    const rowFlags =
      flagsStr !== undefined && flagsStr !== "" ? parseInt(flagsStr, 10) : 3;

    return {
      name: rowName || "New module",
      coef: coefStr !== undefined && coefStr !== "" ? Number(coefStr) : 1,
      examWeight: ewStr !== undefined && ewStr !== "" ? Number(ewStr) : 0.6,
      caWeight: cwStr !== undefined && cwStr !== "" ? Number(cwStr) : 0.4,
      includeExam: (rowFlags & 1) !== 0,
      includeCa: (rowFlags & 2) !== 0,
      exam: exam !== undefined && exam !== "" ? Number(exam) : undefined,
      ca: ca !== undefined && ca !== "" ? Number(ca) : undefined,
    };
  });

  return {
    v: 1,
    name: name || "Imported Template",
    year: year || "Custom",
    semester: semester || "--",
    includeGrades: (flags & 1) !== 0,
    rows,
  };
}

function deserializePayloadV3(str) {
  const { header, rowRecords } = parseLegacyPayload(str, V3_PREFIX, 4);
  const [name, year, semester, flagsStr] = header;
  const flags = parseInt(flagsStr || "0", 10);

  const rows = rowRecords.map((record) => {
    const [rowName, coef, examWeight, caWeight, rowFlagsStr, exam, ca] =
      record.split(LEGACY_FIELD_SEPARATOR);
    const rowFlags =
      rowFlagsStr !== undefined && rowFlagsStr !== ""
        ? parseInt(rowFlagsStr, 10)
        : 3;

    return {
      name: rowName,
      coef: coef !== undefined && coef !== "" ? Number(coef) : undefined,
      examWeight:
        examWeight !== undefined && examWeight !== "" ? Number(examWeight) : undefined,
      caWeight:
        caWeight !== undefined && caWeight !== "" ? Number(caWeight) : undefined,
      includeExam: (rowFlags & 1) !== 0,
      includeCa: (rowFlags & 2) !== 0,
      exam: exam !== undefined && exam !== "" ? Number(exam) : undefined,
      ca: ca !== undefined && ca !== "" ? Number(ca) : undefined,
    };
  });

  return {
    v: 1,
    name: name || "Imported Template",
    year: year || "Custom",
    semester: semester || "--",
    includeGrades: (flags & 1) !== 0,
    rows,
  };
}

function deserializePayloadV2(str) {
  const { header, rowRecords } = parseLegacyPayload(str, V2_PREFIX, 5);
  const [v, name, year, semester, includeGrades] = header;

  const rows = rowRecords.map((record) => {
    const [rowName, coef, examWeight, caWeight, includeExam, includeCa, exam, ca] =
      record.split(LEGACY_FIELD_SEPARATOR);

    return {
      name: rowName,
      coef: hasCompactValue(coef) ? Number(coef) : undefined,
      examWeight: hasCompactValue(examWeight) ? Number(examWeight) : undefined,
      caWeight: hasCompactValue(caWeight) ? Number(caWeight) : undefined,
      includeExam: includeExam === "1",
      includeCa: includeCa === "1",
      exam: hasCompactValue(exam) ? Number(exam) : undefined,
      ca: hasCompactValue(ca) ? Number(ca) : undefined,
    };
  });

  return {
    v: Number(v),
    name,
    year,
    semester,
    includeGrades: includeGrades === "1",
    rows,
  };
}

const KEY_MAP = {
  v: "v",
  name: "n",
  year: "y",
  semester: "s",
  includeGrades: "ig",
  rows: "r",
  coef: "c",
  examWeight: "ew",
  caWeight: "cw",
  includeExam: "ie",
  includeCa: "ic",
  exam: "e",
  ca: "a",
};

const REVERSE_KEY_MAP = Object.entries(KEY_MAP).reduce((acc, [key, val]) => {
  acc[val] = key;
  return acc;
}, {});

function restoreKeys(obj) {
  if (Array.isArray(obj)) return obj.map(restoreKeys);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [REVERSE_KEY_MAP[k] || k, restoreKeys(v)])
    );
  }
  return obj;
}

function decodeBase64Url(value) {
  const padded = String(value ?? "")
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(String(value ?? "").length / 4) * 4, "=");
  const binary = globalThis.atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function normalizeTemplateText(value, fallback) {
  return String(value ?? fallback).trim() || fallback;
}

export function normalizeImportedTemplatePayload(payload) {
  if (!payload || Number(payload.v) !== TEMPLATE_SHARE_VERSION) return null;
  if (!Array.isArray(payload.rows) || payload.rows.length === 0) return null;

  const includeGrades = payload.includeGrades === true;
  const rows = payload.rows
    .map((row) =>
      createRowFromPayload(row, {
        clearScores: !includeGrades,
      }),
    )
    .filter(Boolean);

  if (rows.length === 0) return null;

  return {
    v: TEMPLATE_SHARE_VERSION,
    name: normalizeTemplateText(payload.name, "Imported Template"),
    year: normalizeTemplateText(payload.year, "Custom"),
    semester: normalizeTemplateText(payload.semester, "--"),
    includeGrades,
    rows,
  };
}

export function encodeTemplateSharePayload(payload) {
  const normalizedPayload = normalizeImportedTemplatePayload({
    ...payload,
    v: TEMPLATE_SHARE_VERSION,
  });
  if (!normalizedPayload) return "";

  const sharePayload = {
    ...normalizedPayload,
    rows: normalizedPayload.rows.map((row) => ({
      name: row.name,
      coef: row.coef,
      examWeight: row.examWeight,
      caWeight: row.caWeight,
      includeExam: row.includeExam,
      includeCa: row.includeCa,
      ...(normalizedPayload.includeGrades
        ? {
            exam: row.exam,
            ca: row.ca,
          }
        : {}),
    })),
  };

  const v6String = serializePayloadV6(sharePayload);
  return LZString.compressToEncodedURIComponent(v6String);
}

export function decodeTemplateSharePayload(value) {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(value);
    let rawPayload;

    if (decompressed) {
      if (decompressed.startsWith(V6_PREFIX)) {
        rawPayload = deserializePayloadV6(decompressed);
      } else if (decompressed.startsWith(V5_PREFIX)) {
        rawPayload = deserializePayloadV5(decompressed);
      } else if (decompressed.startsWith(V4_PREFIX)) {
        rawPayload = deserializePayloadV4(decompressed);
      } else if (decompressed.startsWith(V3_PREFIX)) {
        rawPayload = deserializePayloadV3(decompressed);
      } else if (decompressed.startsWith(V2_PREFIX)) {
        rawPayload = deserializePayloadV2(decompressed);
      } else {
        try {
          rawPayload = JSON.parse(decompressed);
          // If it looks minified (has 'n' instead of 'name'), restore keys
          if (rawPayload && rawPayload.n !== undefined && rawPayload.name === undefined) {
            rawPayload = restoreKeys(rawPayload);
          }
        } catch {
          rawPayload = JSON.parse(decodeBase64Url(value));
        }
      }
    } else {
      rawPayload = JSON.parse(decodeBase64Url(value));
    }

    return normalizeImportedTemplatePayload(rawPayload);
  } catch {
    return null;
  }
}

export function buildTemplateShareUrl(payload) {
  const encodedPayload = encodeTemplateSharePayload(payload);
  if (!encodedPayload) return "";

  const shareUrl =
    typeof window === "undefined"
      ? new URL("/", "https://cookedcalc.djalilmsk.dev")
      : new URL("/", window.location.origin);

  shareUrl.searchParams.set(TEMPLATE_SHARE_PARAM, encodedPayload);
  return shareUrl.toString();
}
