function sanitizeSegment(value) {
  const sanitized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "item";
}

function createHistoryId(historyName, count) {
  const safeCount = Number.isFinite(Number(count))
    ? Math.max(0, Math.floor(Number(count)))
    : 0;
  return `history-${sanitizeSegment(historyName)}-${safeCount}`;
}

function createTemplateId(templateName, count) {
  const safeCount = Number.isFinite(Number(count))
    ? Math.max(0, Math.floor(Number(count)))
    : 0;
  return `template-${sanitizeSegment(templateName)}-${safeCount}`;
}

export function findTemplateById(templateId, templates) {
  const normalizedId = String(templateId ?? "").trim();
  if (!normalizedId) return null;
  return templates.find((template) => template.id === normalizedId) ?? null;
}

export function findHistoryById(historyId, histories) {
  const normalizedId = String(historyId ?? "").trim();
  if (!normalizedId) return null;
  return histories.find((history) => history.id === normalizedId) ?? null;
}

export function getNextUniqueHistory(historyName, startCount, histories) {
  const existingIds = new Set(histories.map((history) => history.id));
  let nextCount = Number.isFinite(Number(startCount))
    ? Math.max(0, Math.floor(Number(startCount)))
    : 0;
  let historyId = createHistoryId(historyName, nextCount);

  while (existingIds.has(historyId)) {
    nextCount += 1;
    historyId = createHistoryId(historyName, nextCount);
  }

  return { historyId, usedCount: nextCount };
}

export function getNextUniqueTemplate(templateName, templates) {
  const existingIds = new Set(templates.map((template) => template.id));
  let nextCount = templates.length;
  let templateId = createTemplateId(templateName, nextCount);

  while (existingIds.has(templateId)) {
    nextCount += 1;
    templateId = createTemplateId(templateName, nextCount);
  }

  return templateId;
}

export function isTemplateHistoryEmpty(history, rowsOverride = null) {
  if (!history || !history.sourceTemplateId) return false;

  const rows = Array.isArray(rowsOverride) ? rowsOverride : history.rows;
  if (!Array.isArray(rows) || rows.length === 0) return true;

  return rows.every((row) => {
    const examEmpty =
      row?.includeExam === false || String(row?.exam ?? "").trim() === "";
    const caEmpty =
      row?.includeCa === false || String(row?.ca ?? "").trim() === "";
    return examEmpty && caEmpty;
  });
}

export function sortHistories(histories) {
  const historiesCopy = [...histories];
  historiesCopy.sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1;
    }
    return right.updatedAt - left.updatedAt;
  });
  return historiesCopy;
}
