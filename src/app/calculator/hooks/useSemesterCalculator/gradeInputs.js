import { GRADE_MAX, GRADE_MIN } from "./constants";

function round2Value(value) {
  return Math.round(value * 100) / 100;
}

function formatGradeValue(value) {
  if (!Number.isFinite(value)) return "";
  if (Number.isInteger(value)) return String(value);
  return String(round2Value(value)).replace(/\.?0+$/, "");
}

function hasTrailingFractionZero(text) {
  const valueText = String(text ?? "");
  const dotIndex = valueText.indexOf(".");
  if (dotIndex < 0) return false;
  const fraction = valueText.slice(dotIndex + 1);
  return fraction.length > 0 && fraction.endsWith("0");
}

function normalizeNumericText(rawValue, previousValue = "") {
  const previousText = String(previousValue ?? "");
  const nextText = String(rawValue ?? "").trim().replace(",", ".");

  if (nextText === "") return { mode: "empty", text: "" };
  if (!/^\d*\.?\d*$/.test(nextText)) {
    return { mode: "invalid", text: previousText };
  }

  if (nextText === ".") return { mode: "partial", text: "0." };
  if (nextText.endsWith(".")) {
    return { mode: "trailing-dot", text: nextText };
  }

  const numeric = Number(nextText);
  if (!Number.isFinite(numeric)) return { mode: "invalid", text: previousText };

  return { mode: "numeric", value: numeric, text: nextText };
}

export function normalizeCoefInput(rawValue, previousValue = "") {
  const normalized = normalizeNumericText(rawValue, previousValue);
  if (normalized.mode === "empty") return "";
  if (normalized.mode === "invalid") return normalized.text;

  if (normalized.mode === "partial") return "0.";
  if (normalized.mode === "trailing-dot") {
    const wholePart = normalized.text.slice(0, -1);
    if (wholePart === "") return "0.";
    const wholeNumber = Number(wholePart);
    if (!Number.isFinite(wholeNumber)) return String(previousValue ?? "");
    return `${formatGradeValue(Math.max(0, wholeNumber))}.`;
  }

  const clamped = Math.max(0, normalized.value);
  if (clamped === normalized.value && hasTrailingFractionZero(normalized.text)) {
    return normalized.text;
  }

  return formatGradeValue(clamped);
}

export function normalizeGradeInput(rawValue, previousValue = "") {
  const normalized = normalizeNumericText(rawValue, previousValue);
  if (normalized.mode === "empty") return "";
  if (normalized.mode === "invalid") return normalized.text;

  if (normalized.mode === "partial") return "0.";
  if (normalized.mode === "trailing-dot") {
    const wholePart = normalized.text.slice(0, -1);
    if (wholePart === "") return "0.";
    const wholeNumber = Number(wholePart);
    if (!Number.isFinite(wholeNumber)) return String(previousValue ?? "");
    const clampedWhole = Math.min(GRADE_MAX, Math.max(GRADE_MIN, wholeNumber));
    return `${formatGradeValue(clampedWhole)}.`;
  }

  const clamped = Math.min(GRADE_MAX, Math.max(GRADE_MIN, normalized.value));
  if (clamped === normalized.value && hasTrailingFractionZero(normalized.text)) {
    return normalized.text;
  }

  return formatGradeValue(clamped);
}
