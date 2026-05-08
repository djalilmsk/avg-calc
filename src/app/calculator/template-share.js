import LZString from "lz-string";
import { createRowFromPayload } from "./hooks/useSemesterCalculator/rowModel";

export const TEMPLATE_SHARE_PARAM = "cc_tpl";
export const TEMPLATE_SHARE_VERSION = 1;

const V5_PREFIX = "V5:";
const V4_PREFIX = "V4:";
const V3_PREFIX = "V3:";
const V2_PREFIX = "V2:";

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

function serializePayloadV5(payload) {
  const name = payload.name === "Imported Template" ? "" : (payload.name || "").replace(/\||~/g, "");
  const year = payload.year === "Custom" ? "" : (payload.year || "").replace(/\||~/g, "");
  const semester = payload.semester === "--" ? "" : (payload.semester || "").replace(/\||~/g, "");
  const flags = payload.includeGrades ? 1 : 0;

  const headerArr = [name, year, semester, flags];
  while (headerArr.length > 0 && headerArr[headerArr.length - 1] === "") {
    headerArr.pop();
  }
  const header = headerArr.join("|");

  const rows = payload.rows
    .map((r) => {
      const rowFlags = (r.includeExam ? 1 : 0) | (r.includeCa ? 2 : 0);
      const coef = r.coef === 1 ? "" : encNum(r.coef);
      const ew = r.examWeight === 0.6 ? "" : encNum(r.examWeight);
      const expectedCw = r.examWeight !== undefined ? Math.round((1 - r.examWeight) * 100) / 100 : 0.4;
      const cw = r.caWeight === expectedCw ? "" : encNum(r.caWeight);

      const arr = [
        r.name === "New module" ? "" : (r.name || "").replace(/\||~/g, ""),
        coef,
        ew,
        cw,
        rowFlags === 3 ? "" : rowFlags,
        encNum(r.exam),
        encNum(r.ca),
      ];
      while (arr.length > 0 && arr[arr.length - 1] === "") {
        arr.pop();
      }
      return arr.join("~");
    })
    .join("|");

  return V5_PREFIX + header + "||" + rows;
}

function deserializePayloadV5(str) {
  const payloadStr = str.slice(V5_PREFIX.length);
  const [headerStr, rowsStr] = payloadStr.split("||");
  const [name, year, semester, flagsStr] = headerStr.split("|");
  const flags = parseInt(flagsStr || "0", 10);

  const rows = rowsStr
    ? rowsStr.split("|").map((r) => {
        const [rowName, coefStr, ewStr, cwStr, flagsStr, examStr, caStr] = r.split("~");
        const rowFlags = flagsStr !== undefined && flagsStr !== "" ? parseInt(flagsStr, 10) : 3;
        
        const examWeight = ewStr !== undefined && ewStr !== "" ? decNum(ewStr) : 0.6;
        const expectedCw = Math.round((1 - examWeight) * 100) / 100;
        
        return {
          name: rowName || "New module",
          coef: coefStr !== undefined && coefStr !== "" ? decNum(coefStr) : 1,
          examWeight,
          caWeight: cwStr !== undefined && cwStr !== "" ? decNum(cwStr) : expectedCw,
          includeExam: (rowFlags & 1) !== 0,
          includeCa: (rowFlags & 2) !== 0,
          exam: decNum(examStr),
          ca: decNum(caStr),
        };
      })
    : [];

  return {
    v: 1,
    name: name || "Imported Template",
    year: year || "Custom",
    semester: semester || "--",
    includeGrades: (flags & 1) !== 0,
    rows,
  };
}

function serializePayloadV4(payload) {
  const name = payload.name === "Imported Template" ? "" : (payload.name || "").replace(/\||~/g, "");
  const year = payload.year === "Custom" ? "" : (payload.year || "").replace(/\||~/g, "");
  const semester = payload.semester === "--" ? "" : (payload.semester || "").replace(/\||~/g, "");
  const flags = payload.includeGrades ? 1 : 0;

  const headerArr = [name, year, semester, flags];
  while (headerArr.length > 0 && headerArr[headerArr.length - 1] === "") {
    headerArr.pop();
  }
  const header = headerArr.join("|");

  const rows = payload.rows
    .map((r) => {
      const rowFlags = (r.includeExam ? 1 : 0) | (r.includeCa ? 2 : 0);
      const coef = r.coef === 1 ? "" : (r.coef ?? "");
      const ew = r.examWeight === 0.6 ? "" : (r.examWeight ?? "");
      const cw = r.caWeight === 0.4 ? "" : (r.caWeight ?? "");

      const arr = [
        r.name === "New module" ? "" : (r.name || "").replace(/\||~/g, ""),
        coef,
        ew,
        cw,
        rowFlags === 3 ? "" : rowFlags,
        r.exam ?? "",
        r.ca ?? "",
      ];
      while (arr.length > 0 && arr[arr.length - 1] === "") {
        arr.pop();
      }
      return arr.join("~");
    })
    .join("|");

  return V4_PREFIX + header + "||" + rows;
}

function deserializePayloadV4(str) {
  const payloadStr = str.slice(V4_PREFIX.length);
  const [headerStr, rowsStr] = payloadStr.split("||");
  const [name, year, semester, flagsStr] = headerStr.split("|");
  const flags = parseInt(flagsStr || "0", 10);

  const rows = rowsStr
    ? rowsStr.split("|").map((r) => {
        const [rowName, coefStr, ewStr, cwStr, flagsStr, exam, ca] = r.split("~");
        const rowFlags = flagsStr !== undefined && flagsStr !== "" ? parseInt(flagsStr, 10) : 3;
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
      })
    : [];

  return {
    v: 1,
    name: name || "Imported Template",
    year: year || "Custom",
    semester: semester || "--",
    includeGrades: (flags & 1) !== 0,
    rows,
  };
}

function serializePayloadV3(payload) {
  const name = payload.name === "Imported Template" ? "" : (payload.name || "").replace(/\||~/g, "");
  const year = payload.year === "Custom" ? "" : (payload.year || "").replace(/\||~/g, "");
  const semester = payload.semester === "--" ? "" : (payload.semester || "").replace(/\||~/g, "");
  const flags = payload.includeGrades ? 1 : 0;

  const headerArr = [name, year, semester, flags];
  while (headerArr.length > 0 && headerArr[headerArr.length - 1] === "") {
    headerArr.pop();
  }
  const header = headerArr.join("|");

  const rows = payload.rows
    .map((r) => {
      const rowFlags = (r.includeExam ? 1 : 0) | (r.includeCa ? 2 : 0);
      const arr = [
        (r.name || "").replace(/\||~/g, ""),
        r.coef ?? "",
        r.examWeight ?? "",
        r.caWeight ?? "",
        rowFlags,
        r.exam ?? "",
        r.ca ?? "",
      ];
      while (arr.length > 0 && arr[arr.length - 1] === "") {
        arr.pop();
      }
      return arr.join("~");
    })
    .join("|");

  return V3_PREFIX + header + "||" + rows;
}

function deserializePayloadV3(str) {
  const payloadStr = str.slice(V3_PREFIX.length);
  const [headerStr, rowsStr] = payloadStr.split("||");
  const [name, year, semester, flagsStr] = headerStr.split("|");
  const flags = parseInt(flagsStr || "0", 10);

  const rows = rowsStr
    ? rowsStr.split("|").map((r) => {
        const [rowName, coef, examWeight, caWeight, rowFlagsStr, exam, ca] = r.split("~");
        const rowFlags = rowFlagsStr !== undefined && rowFlagsStr !== "" ? parseInt(rowFlagsStr, 10) : 3;
        return {
          name: rowName,
          coef: coef !== undefined && coef !== "" ? Number(coef) : undefined,
          examWeight: examWeight !== undefined && examWeight !== "" ? Number(examWeight) : undefined,
          caWeight: caWeight !== undefined && caWeight !== "" ? Number(caWeight) : undefined,
          includeExam: (rowFlags & 1) !== 0,
          includeCa: (rowFlags & 2) !== 0,
          exam: exam !== undefined && exam !== "" ? Number(exam) : undefined,
          ca: ca !== undefined && ca !== "" ? Number(ca) : undefined,
        };
      })
    : [];

  return {
    v: 1,
    name: name || "Imported Template",
    year: year || "Custom",
    semester: semester || "--",
    includeGrades: (flags & 1) !== 0,
    rows,
  };
}

function serializePayloadV2(payload) {
  const header = [
    payload.v,
    (payload.name || "").replace(/\||~/g, ""),
    (payload.year || "").replace(/\||~/g, ""),
    (payload.semester || "").replace(/\||~/g, ""),
    payload.includeGrades ? 1 : 0,
  ].join("|");

  const rows = payload.rows
    .map((r) => {
      return [
        (r.name || "").replace(/\||~/g, ""),
        r.coef ?? "",
        r.examWeight ?? "",
        r.caWeight ?? "",
        r.includeExam ? 1 : 0,
        r.includeCa ? 1 : 0,
        r.exam ?? "",
        r.ca ?? "",
      ].join("~");
    })
    .join("|");

  return V2_PREFIX + header + "||" + rows;
}

function deserializePayloadV2(str) {
  const payloadStr = str.slice(V2_PREFIX.length);
  const [headerStr, rowsStr] = payloadStr.split("||");
  const [v, name, year, semester, includeGrades] = headerStr.split("|");
  
  const rows = rowsStr
    ? rowsStr.split("|").map((r) => {
        const [rowName, coef, examWeight, caWeight, includeExam, includeCa, exam, ca] = r.split("~");
        return {
          name: rowName,
          coef: coef !== "" ? Number(coef) : undefined,
          examWeight: examWeight !== "" ? Number(examWeight) : undefined,
          caWeight: caWeight !== "" ? Number(caWeight) : undefined,
          includeExam: includeExam === "1",
          includeCa: includeCa === "1",
          exam: exam !== "" ? Number(exam) : undefined,
          ca: ca !== "" ? Number(ca) : undefined,
        };
      })
    : [];

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

function minifyKeys(obj) {
  if (Array.isArray(obj)) return obj.map(minifyKeys);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [KEY_MAP[k] || k, minifyKeys(v)])
    );
  }
  return obj;
}

function restoreKeys(obj) {
  if (Array.isArray(obj)) return obj.map(restoreKeys);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [REVERSE_KEY_MAP[k] || k, restoreKeys(v)])
    );
  }
  return obj;
}

function encodeBase64Url(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const padded = String(value ?? "")
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(String(value ?? "").length / 4) * 4, "=");
  const binary = window.atob(padded);
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

  const v5String = serializePayloadV5(sharePayload);
  return LZString.compressToEncodedURIComponent(v5String);
}

export function decodeTemplateSharePayload(value) {
  try {
    let decompressed = LZString.decompressFromEncodedURIComponent(value);
    let rawPayload;
    
    if (decompressed) {
      if (decompressed.startsWith(V5_PREFIX)) {
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
        } catch (e) {
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
