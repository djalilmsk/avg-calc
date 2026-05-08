import { createRowFromPayload } from "./hooks/useSemesterCalculator/rowModel";

export const TEMPLATE_SHARE_PARAM = "cc_tpl";
export const TEMPLATE_SHARE_VERSION = 1;

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

  return encodeBase64Url(JSON.stringify(sharePayload));
}

export function decodeTemplateSharePayload(value) {
  try {
    const rawPayload = JSON.parse(decodeBase64Url(value));
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
