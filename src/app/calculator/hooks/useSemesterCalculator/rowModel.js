import { clampNumber, round2 } from "../../utils";
import { GRADE_MAX, GRADE_MIN } from "./constants";

export function clampRange(value, min, max) {
  return Math.min(max, Math.max(min, clampNumber(value)));
}

function round2Value(value) {
  return Math.round(value * 100) / 100;
}

export function normalizeRowHiddenStats(row) {
  let includeExam = row?.includeExam !== false;
  let includeCa = row?.includeCa !== false;

  if (!includeExam && !includeCa) {
    includeExam = true;
  }

  let examWeight = clampRange(row?.examWeight ?? 0.6, 0, 1);
  let caWeight = clampRange(row?.caWeight ?? 0.4, 0, 1);

  if (!includeExam) {
    examWeight = 0;
    caWeight = 1;
  } else if (!includeCa) {
    examWeight = 1;
    caWeight = 0;
  } else {
    const totalWeight = examWeight + caWeight;
    if (totalWeight <= 0) {
      examWeight = 0.6;
      caWeight = 0.4;
    } else {
      examWeight = round2Value(examWeight / totalWeight);
      caWeight = round2Value(1 - examWeight);
    }
  }

  return {
    ...row,
    includeExam,
    includeCa,
    examWeight,
    caWeight
  };
}

export function createRowFromPayload(payload, options = {}) {
  const { clearScores = false } = options;
  const name = String(payload?.name ?? "New module").trim() || "New module";
  const coef = Math.max(0, clampNumber(payload?.coef ?? 1));

  const baseRow = {
    name,
    coef,
    exam: clearScores ? "" : payload?.exam ?? "",
    ca: clearScores ? "" : payload?.ca ?? "",
    examWeight: clampRange(payload?.examWeight ?? 0.6, 0, 1),
    caWeight: clampRange(payload?.caWeight ?? 0.4, 0, 1),
    includeExam: payload?.includeExam ?? true,
    includeCa: payload?.includeCa ?? true
  };

  return normalizeRowHiddenStats(baseRow);
}

export function isSameRow(left, right) {
  if (!left || !right) return false;
  return (
    left.name === right.name &&
    left.coef === right.coef &&
    left.exam === right.exam &&
    left.ca === right.ca &&
    left.examWeight === right.examWeight &&
    left.caWeight === right.caWeight &&
    left.includeExam === right.includeExam &&
    left.includeCa === right.includeCa
  );
}

export function rowsEqual(leftRows, rightRows) {
  if (leftRows === rightRows) return true;
  if (!Array.isArray(leftRows) || !Array.isArray(rightRows)) return false;
  if (leftRows.length !== rightRows.length) return false;

  for (let index = 0; index < leftRows.length; index += 1) {
    const left = leftRows[index];
    const right = rightRows[index];
    if (!left || !right) return false;
    if (left.name !== right.name) return false;
    if (left.coef !== right.coef) return false;
    if (left.exam !== right.exam) return false;
    if (left.ca !== right.ca) return false;
    if (left.examWeight !== right.examWeight) return false;
    if (left.caWeight !== right.caWeight) return false;
    if (left.includeExam !== right.includeExam) return false;
    if (left.includeCa !== right.includeCa) return false;
  }

  return true;
}

export function computeSummary(rows) {
  const perRow = [];
  let sumWeighted = 0;
  let sumCoef = 0;

  for (const row of rows) {
    const coef = clampNumber(row.coef);
    const exam = clampRange(row.exam, GRADE_MIN, GRADE_MAX);
    const ca = clampRange(row.ca, GRADE_MIN, GRADE_MAX);
    const examWeightNum = clampRange(row.examWeight, 0, 1);
    const caWeightNum = clampRange(row.caWeight, 0, 1);
    const includeExam = row.includeExam !== false;
    const includeCa = row.includeCa !== false;
    const activeWeight =
      (includeExam ? examWeightNum : 0) + (includeCa ? caWeightNum : 0);

    const hasExamGrade = includeExam && String(row.exam).trim() !== "";
    const hasCaGrade = includeCa && String(row.ca).trim() !== "";
    const hasAnyGrade = hasExamGrade || hasCaGrade;
    const rawFinal =
      (includeExam ? exam * examWeightNum : 0) +
      (includeCa ? ca * caWeightNum : 0);
    const moduleFinalValue = activeWeight > 0 ? rawFinal / activeWeight : 0;

    if (hasAnyGrade && coef > 0) {
      sumWeighted += moduleFinalValue * coef;
      sumCoef += coef;
    }

    perRow.push({
      ...row,
      moduleFinal: hasAnyGrade ? round2(moduleFinalValue) : ""
    });
  }

  return {
    perRow,
    sumCoef,
    semesterAvg: sumCoef > 0 ? round2(sumWeighted / sumCoef) : ""
  };
}
