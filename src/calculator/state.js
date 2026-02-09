import { DEFAULT_CA_WEIGHT, DEFAULT_EXAM_WEIGHT, DEFAULT_ROWS, START_TEMPLATES, STORAGE_KEY } from "./constants";
import { safeParse } from "./utils";

function normalizeRow(row) {
  return {
    name: row.name ?? "New module",
    coef: row.coef ?? 1,
    exam: row.exam ?? "",
    ca: row.ca ?? "",
    examWeight: row.examWeight ?? DEFAULT_EXAM_WEIGHT,
    caWeight: row.caWeight ?? DEFAULT_CA_WEIGHT,
    includeExam: row.includeExam ?? true,
    includeCa: row.includeCa ?? true,
  };
}

export function createDefaultState(rows = DEFAULT_ROWS) {
  return {
    rows: rows.map((row) => normalizeRow({ ...row }))
  };
}

export function createEmptyStore() {
  return {
    present: createDefaultState(),
    past: [],
    future: [],
    snapshots: []
  };
}

export function loadPersisted() {
  if (typeof window === "undefined") {
    return createEmptyStore();
  }

  const parsed = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (!parsed?.present) {
    return createEmptyStore();
  }

  return {
    present: {
      rows: Array.isArray(parsed.present.rows)
        ? parsed.present.rows.map((row) => normalizeRow(row))
        : createDefaultState().rows,
    },
    past: Array.isArray(parsed.past) ? parsed.past : [],
    future: Array.isArray(parsed.future) ? parsed.future : [],
    snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots : []
  };
}

export function getTemplateById(templateId) {
  return START_TEMPLATES.find((template) => template.id === templateId) ?? START_TEMPLATES[0];
}
