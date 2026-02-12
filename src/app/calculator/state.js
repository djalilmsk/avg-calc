import {
  DEFAULT_CA_WEIGHT,
  DEFAULT_EXAM_WEIGHT,
  DEFAULT_ROWS,
  MAX_TEMPLATE_STORAGE,
  START_TEMPLATES
} from "./constants";

function normalizeNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeBoolean(value, fallback) {
  if (typeof value === "boolean") return value;
  return fallback;
}

function normalizeRow(row, options = {}) {
  const { clearScores = false } = options;

  return {
    name: String(row?.name ?? "New module").trim() || "New module",
    coef: Math.max(0, normalizeNumber(row?.coef, 1)),
    exam: clearScores ? "" : row?.exam ?? "",
    ca: clearScores ? "" : row?.ca ?? "",
    examWeight: normalizeNumber(row?.examWeight, DEFAULT_EXAM_WEIGHT),
    caWeight: normalizeNumber(row?.caWeight, DEFAULT_CA_WEIGHT),
    includeExam: normalizeBoolean(row?.includeExam, true),
    includeCa: normalizeBoolean(row?.includeCa, true)
  };
}

function normalizeTemplate(template, fallbackId) {
  const templateId = String(template?.id ?? fallbackId ?? "").trim();
  if (!templateId) return null;

  const templateName =
    String(template?.name ?? template?.title ?? "Custom Template").trim() ||
    "Custom Template";
  const templateRows = Array.isArray(template?.rows)
    ? template.rows.map((row) => normalizeRow(row, { clearScores: true }))
    : createDefaultState().rows.map((row) =>
        normalizeRow(row, { clearScores: true })
      );

  return {
    id: templateId,
    name: templateName,
    year: String(template?.year ?? "Custom"),
    semester: String(template?.semester ?? "--"),
    rows: templateRows
  };
}

function normalizeHistory(history, fallbackId) {
  const historyId = String(history?.id ?? fallbackId ?? "").trim();
  if (!historyId) return null;

  const historyName =
    String(history?.name ?? "Untitled History").trim() || "Untitled History";
  const historyRows = Array.isArray(history?.rows)
    ? history.rows.map((row) => normalizeRow(row))
    : createDefaultState().rows;

  return {
    id: historyId,
    name: historyName,
    pinned: Boolean(history?.pinned),
    rows: historyRows,
    createdAt: normalizeNumber(history?.createdAt, Date.now()),
    updatedAt: normalizeNumber(history?.updatedAt, Date.now()),
    sourceTemplateId:
      typeof history?.sourceTemplateId === "string"
        ? history.sourceTemplateId
        : null
  };
}

function mergeTemplates(defaultTemplates, persistedTemplates) {
  const byId = new Map();

  for (const template of defaultTemplates) {
    const normalized = normalizeTemplate(template, template?.id);
    if (!normalized) continue;
    byId.set(normalized.id, normalized);
  }

  for (const template of persistedTemplates) {
    const normalized = normalizeTemplate(template, template?.id);
    if (!normalized) continue;
    byId.set(normalized.id, normalized);
  }

  return Array.from(byId.values()).slice(0, MAX_TEMPLATE_STORAGE);
}

function normalizeHistories(histories) {
  if (!Array.isArray(histories)) return [];
  return histories
    .map((history) => normalizeHistory(history, history?.id))
    .filter(Boolean);
}

function sanitizeLegacyHistoryName(templateId, templates) {
  const matchedTemplate = templates.find((template) => template.id === templateId);
  return matchedTemplate?.name ?? "Migrated History";
}

function migrateLegacyStore(parsed, templates) {
  if (!parsed?.present || !Array.isArray(parsed.present.rows)) {
    return {
      histories: [],
      selectedHistoryId: null,
      historyCount: 0
    };
  }

  const migratedId = "history-migrated-0";
  const migratedHistory = normalizeHistory(
    {
      id: migratedId,
      name: sanitizeLegacyHistoryName(parsed.templateId, templates),
      rows: parsed.present.rows,
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sourceTemplateId: parsed.templateId ?? null
    },
    migratedId
  );

  return {
    histories: migratedHistory ? [migratedHistory] : [],
    selectedHistoryId: migratedHistory?.id ?? null,
    historyCount: migratedHistory ? 1 : 0
  };
}

export function createDefaultState(rows = DEFAULT_ROWS) {
  return {
    rows: rows.map((row) => normalizeRow({ ...row }))
  };
}

export function createEmptyStore() {
  return {
    templates: START_TEMPLATES.map((template) =>
      normalizeTemplate(template, template.id)
    )
      .filter(Boolean)
      .slice(0, MAX_TEMPLATE_STORAGE),
    histories: [],
    selectedHistoryId: null,
    historyCount: 0
  };
}

export function normalizePersistedStore(parsed) {
  if (!parsed) {
    return createEmptyStore();
  }

  const defaultTemplates = START_TEMPLATES;
  const persistedTemplates = Array.isArray(parsed.templates) ? parsed.templates : [];
  const templates = mergeTemplates(defaultTemplates, persistedTemplates);

  if (!Array.isArray(parsed.histories)) {
    const migrated = migrateLegacyStore(parsed, templates);
    return {
      templates,
      histories: migrated.histories,
      selectedHistoryId: migrated.selectedHistoryId,
      historyCount: migrated.historyCount
    };
  }

  const histories = normalizeHistories(parsed.histories);
  const historyCountNumber = Number(parsed.historyCount);
  const selectedHistoryIdRaw = String(parsed.selectedHistoryId ?? "").trim();
  const selectedHistoryExists = histories.some(
    (history) => history.id === selectedHistoryIdRaw
  );

  return {
    templates,
    histories,
    selectedHistoryId: selectedHistoryExists ? selectedHistoryIdRaw : null,
    historyCount: Number.isFinite(historyCountNumber)
      ? Math.max(0, Math.floor(historyCountNumber))
      : histories.length
  };
}
