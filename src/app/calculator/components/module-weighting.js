export function formatCompactWeights(row) {
  const includeExam = row?.includeExam !== false;
  const includeCa = row?.includeCa !== false;

  if (includeExam && includeCa) {
    const examPercent = Math.round(Number(row?.examWeight ?? 0.6) * 100);
    const tdPercent = Math.round(Number(row?.caWeight ?? 0.4) * 100);
    return `EX-${examPercent}/TD-${tdPercent}`;
  }

  if (includeExam) return "EX-1/TD-0";
  if (includeCa) return "EX-0/TD-1";
  return "EX-1/TD-0";
}

export function createDraftFromRow(row) {
  const includeExam = row?.includeExam !== false;
  const includeCa = row?.includeCa !== false;
  const examWeight = Number(row?.examWeight ?? 0.6);
  const caWeight = Number(row?.caWeight ?? 0.4);

  return {
    includeExam,
    includeCa,
    examWeight: Number.isFinite(examWeight) ? examWeight : 0.6,
    caWeight: Number.isFinite(caWeight) ? caWeight : 0.4,
  };
}

function clamp01(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(1, Math.max(0, numeric));
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

export function normalizeDraft(draft) {
  let includeExam = draft.includeExam;
  let includeCa = draft.includeCa;

  if (!includeExam && !includeCa) {
    includeExam = true;
  }

  if (!includeExam) {
    return {
      includeExam: false,
      includeCa: true,
      examWeight: 0,
      caWeight: 1,
    };
  }

  if (!includeCa) {
    return {
      includeExam: true,
      includeCa: false,
      examWeight: 1,
      caWeight: 0,
    };
  }

  const examWeight = clamp01(draft.examWeight, 0.6);
  const caWeight = round2(1 - examWeight);
  return {
    includeExam: true,
    includeCa: true,
    examWeight: round2(examWeight),
    caWeight,
  };
}

export function updateWeightDraft(draft, key, value) {
  if (key === "includeExam") {
    const includeExam = Boolean(value);
    if (!includeExam) {
      return {
        ...draft,
        includeExam: false,
        includeCa: true,
        examWeight: 0,
        caWeight: 1,
      };
    }

    const nextExamWeight =
      draft.includeCa && Number(draft.examWeight) > 0
        ? round2(clamp01(draft.examWeight, 0.6))
        : 0.6;

    return {
      ...draft,
      includeExam: true,
      includeCa: true,
      examWeight: nextExamWeight,
      caWeight: round2(1 - nextExamWeight),
    };
  }

  if (key === "includeCa") {
    const includeCa = Boolean(value);
    if (!includeCa) {
      return {
        ...draft,
        includeExam: true,
        includeCa: false,
        examWeight: 1,
        caWeight: 0,
      };
    }

    const nextCaWeight =
      draft.includeExam && Number(draft.caWeight) > 0
        ? round2(clamp01(draft.caWeight, 0.4))
        : 0.4;

    return {
      ...draft,
      includeExam: true,
      includeCa: true,
      caWeight: nextCaWeight,
      examWeight: round2(1 - nextCaWeight),
    };
  }

  if (key === "examWeight") {
    const examWeight = round2(clamp01(value, 0.6));
    return {
      ...draft,
      includeExam: true,
      includeCa: true,
      examWeight,
      caWeight: round2(1 - examWeight),
    };
  }

  if (key === "caWeight") {
    const caWeight = round2(clamp01(value, 0.4));
    return {
      ...draft,
      includeExam: true,
      includeCa: true,
      caWeight,
      examWeight: round2(1 - caWeight),
    };
  }

  return {
    ...draft,
    [key]: value,
  };
}
