import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HISTORY_LIMIT, MAX_TEMPLATE_STORAGE } from "../constants";
import { createDefaultState, normalizePersistedStore } from "../state";
import { clampNumber, round2 } from "../utils";
import { useCalculatorStorageApi } from "../context/useCalculatorStorageApi";

const HISTORY_DEBOUNCE_MS = 160;
const PERSIST_DEBOUNCE_MS = 180;
const GRADE_MIN = 0;
const GRADE_MAX = 20;
const GRADE_STEP = 0.01;

function clampRange(value, min, max) {
  return Math.min(max, Math.max(min, clampNumber(value)));
}

function round2Value(value) {
  return Math.round(value * 100) / 100;
}

function roundToGradeStep(value) {
  return round2Value(Math.round(value / GRADE_STEP) * GRADE_STEP);
}

function formatGradeValue(value) {
  if (!Number.isFinite(value)) return "";
  if (Number.isInteger(value)) return String(value);
  return String(round2Value(value)).replace(/\.?0+$/, "");
}

function normalizeCoefInput(rawValue, previousValue = "") {
  const previousText = String(previousValue ?? "");
  const nextText = String(rawValue ?? "").trim().replace(",", ".");
  if (nextText === "") return "";
  if (!/^\d*\.?\d*$/.test(nextText)) return previousText;

  if (nextText === ".") return "0.";
  if (nextText.endsWith(".")) {
    const wholePart = nextText.slice(0, -1);
    if (wholePart === "") return "0.";
    const wholeNumber = Number(wholePart);
    if (!Number.isFinite(wholeNumber)) return previousText;
    return `${formatGradeValue(Math.max(0, wholeNumber))}.`;
  }

  const numeric = Number(nextText);
  if (!Number.isFinite(numeric)) return previousText;
  return formatGradeValue(Math.max(0, numeric));
}

function normalizeGradeInput(rawValue, previousValue = "") {
  const previousText = String(previousValue ?? "");
  const nextText = String(rawValue ?? "").trim().replace(",", ".");
  if (nextText === "") return "";
  if (!/^\d*\.?\d*$/.test(nextText)) return previousText;

  if (nextText === ".") return "0.";
  if (nextText.endsWith(".")) {
    const wholePart = nextText.slice(0, -1);
    if (wholePart === "") return "0.";
    const wholeNumber = Number(wholePart);
    if (!Number.isFinite(wholeNumber)) return previousText;
    const clampedWhole = Math.min(GRADE_MAX, Math.max(GRADE_MIN, wholeNumber));
    return `${formatGradeValue(clampedWhole)}.`;
  }

  const numeric = Number(nextText);
  if (!Number.isFinite(numeric)) return previousText;

  const clamped = Math.min(GRADE_MAX, Math.max(GRADE_MIN, numeric));
  const stepped = roundToGradeStep(clamped);
  return formatGradeValue(stepped);
}

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

function findTemplateById(templateId, templates) {
  const normalizedId = String(templateId ?? "").trim();
  if (!normalizedId) return null;
  return templates.find((template) => template.id === normalizedId) ?? null;
}

function findHistoryById(historyId, histories) {
  const normalizedId = String(historyId ?? "").trim();
  if (!normalizedId) return null;
  return histories.find((history) => history.id === normalizedId) ?? null;
}

function createRowFromPayload(payload, options = {}) {
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

function normalizeRowHiddenStats(row) {
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

function isSameRow(left, right) {
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

function rowsEqual(leftRows, rightRows) {
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

function normalizeTimelineState(historyState) {
  if (!historyState || !Array.isArray(historyState.rows)) return null;
  return createDefaultState(historyState.rows);
}

function normalizeTimelinePayload(payload) {
  const past = Array.isArray(payload?.past)
    ? payload.past.map((state) => normalizeTimelineState(state)).filter(Boolean)
    : [];
  const future = Array.isArray(payload?.future)
    ? payload.future
        .map((state) => normalizeTimelineState(state))
        .filter(Boolean)
    : [];

  return { past, future };
}

function computeSummary(rows) {
  const perRow = [];
  let sumWeighted = 0;
  let sumCoef = 0;

  for (const row of rows) {
    const coef = clampNumber(row.coef);
    const exam = clampRange(row.exam, 0, 20);
    const ca = clampRange(row.ca, 0, 20);
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

function getNextUniqueHistory(historyName, startCount, histories) {
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

function getNextUniqueTemplate(templateName, templates) {
  const existingIds = new Set(templates.map((template) => template.id));
  let nextCount = templates.length;
  let templateId = createTemplateId(templateName, nextCount);

  while (existingIds.has(templateId)) {
    nextCount += 1;
    templateId = createTemplateId(templateName, nextCount);
  }

  return templateId;
}

function isTemplateHistoryEmpty(history, rowsOverride = null) {
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

export function useSemesterCalculator() {
  const storageApi = useCalculatorStorageApi();
  const initialStore = useMemo(
    () => normalizePersistedStore(storageApi.loadStore()),
    [storageApi]
  );

  const initialHistories = initialStore.histories;
  const initialSelectedHistoryId =
    typeof initialStore.selectedHistoryId === "string"
      ? initialStore.selectedHistoryId
      : null;
  const initialSelectedHistory = findHistoryById(
    initialSelectedHistoryId,
    initialHistories
  );
  const initialTimeline = initialSelectedHistory
    ? normalizeTimelinePayload(
        storageApi.loadHistoryTimeline(initialSelectedHistory.id)
      )
    : { past: [], future: [] };
  const initialPresent = initialSelectedHistory
    ? createDefaultState(initialSelectedHistory.rows)
    : createDefaultState();

  const [templates, setTemplates] = useState(initialStore.templates);
  const [histories, setHistories] = useState(initialHistories);
  const [historyCount, setHistoryCount] = useState(initialStore.historyCount);
  const [selectedHistoryId, setSelectedHistoryId] = useState(
    initialSelectedHistoryId
  );
  const [present, setPresent] = useState(initialPresent);
  const [past, setPast] = useState(initialTimeline.past);
  const [future, setFuture] = useState(initialTimeline.future);

  const rows = present.rows;
  const presentRef = useRef(initialPresent);
  const historiesRef = useRef(initialHistories);
  const templatesRef = useRef(initialStore.templates);
  const selectedHistoryIdRef = useRef(initialSelectedHistoryId);
  const historyCountRef = useRef(initialStore.historyCount);
  const isRestoringRef = useRef(false);
  const pushTimerRef = useRef(null);
  const persistStoreTimerRef = useRef(null);
  const persistTimelineTimerRef = useRef(null);
  const lastStoreSerializedRef = useRef("");
  const lastTimelineSerializedRef = useRef({});
  const latestStorePayloadRef = useRef({
    templates: initialStore.templates,
    histories: initialHistories,
    selectedHistoryId: initialSelectedHistoryId,
    historyCount: initialStore.historyCount
  });
  const latestTimelinePayloadRef = useRef({
    historyId: initialSelectedHistoryId,
    past: initialTimeline.past,
    future: initialTimeline.future
  });

  useEffect(() => {
    presentRef.current = present;
  }, [present]);

  useEffect(() => {
    historiesRef.current = histories;
  }, [histories]);

  useEffect(() => {
    templatesRef.current = templates;
  }, [templates]);

  useEffect(() => {
    selectedHistoryIdRef.current = selectedHistoryId;
  }, [selectedHistoryId]);

  useEffect(() => {
    historyCountRef.current = historyCount;
  }, [historyCount]);

  const persistStoreNow = useCallback(
    (payload) => {
      const serialized = JSON.stringify(payload);
      if (serialized === lastStoreSerializedRef.current) return;
      storageApi.saveStore(payload);
      lastStoreSerializedRef.current = serialized;
    },
    [storageApi]
  );

  const persistTimelineNow = useCallback(
    (historyId, timelinePayload) => {
      const normalizedHistoryId = String(historyId ?? "").trim();
      if (!normalizedHistoryId) return;

      const serialized = JSON.stringify(timelinePayload);
      if (lastTimelineSerializedRef.current[normalizedHistoryId] === serialized) {
        return;
      }

      storageApi.saveHistoryTimeline(normalizedHistoryId, timelinePayload);
      lastTimelineSerializedRef.current[normalizedHistoryId] = serialized;
    },
    [storageApi]
  );

  function clearPendingHistoryPush() {
    if (!pushTimerRef.current) return;
    window.clearTimeout(pushTimerRef.current);
    pushTimerRef.current = null;
  }

  function pushToHistory(previousState) {
    if (!selectedHistoryIdRef.current) return;
    if (isRestoringRef.current) return;

    clearPendingHistoryPush();
    pushTimerRef.current = window.setTimeout(() => {
      setPast((historyStack) => {
        const nextHistory = [...historyStack, previousState];
        return nextHistory.length > HISTORY_LIMIT
          ? nextHistory.slice(nextHistory.length - HISTORY_LIMIT)
          : nextHistory;
      });
      setFuture((queue) => (queue.length === 0 ? queue : []));
      pushTimerRef.current = null;
    }, HISTORY_DEBOUNCE_MS);
  }

  useEffect(() => {
    const payload = {
      templates,
      histories,
      selectedHistoryId,
      historyCount
    };
    latestStorePayloadRef.current = payload;

    if (persistStoreTimerRef.current) {
      window.clearTimeout(persistStoreTimerRef.current);
    }
    persistStoreTimerRef.current = window.setTimeout(() => {
      persistStoreNow(payload);
    }, PERSIST_DEBOUNCE_MS);
  }, [histories, historyCount, persistStoreNow, selectedHistoryId, templates]);

  useEffect(() => {
    latestTimelinePayloadRef.current = {
      historyId: selectedHistoryId,
      past,
      future
    };

    if (!selectedHistoryId) return;

    const timelinePayload = { past, future };
    if (persistTimelineTimerRef.current) {
      window.clearTimeout(persistTimelineTimerRef.current);
    }
    persistTimelineTimerRef.current = window.setTimeout(() => {
      persistTimelineNow(selectedHistoryId, timelinePayload);
    }, PERSIST_DEBOUNCE_MS);
  }, [future, past, persistTimelineNow, selectedHistoryId]);

  useEffect(() => {
    return () => {
      if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current);
      if (persistStoreTimerRef.current) {
        window.clearTimeout(persistStoreTimerRef.current);
        persistStoreTimerRef.current = null;
      }
      if (persistTimelineTimerRef.current) {
        window.clearTimeout(persistTimelineTimerRef.current);
        persistTimelineTimerRef.current = null;
      }

      persistStoreNow(latestStorePayloadRef.current);
      const latestTimeline = latestTimelinePayloadRef.current;
      persistTimelineNow(latestTimeline.historyId, {
        past: latestTimeline.past,
        future: latestTimeline.future
      });
    };
  }, [persistStoreNow, persistTimelineNow]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const flushOnUnload = () => {
      if (persistStoreTimerRef.current) {
        window.clearTimeout(persistStoreTimerRef.current);
        persistStoreTimerRef.current = null;
      }
      if (persistTimelineTimerRef.current) {
        window.clearTimeout(persistTimelineTimerRef.current);
        persistTimelineTimerRef.current = null;
      }

      persistStoreNow(latestStorePayloadRef.current);
      const latestTimeline = latestTimelinePayloadRef.current;
      persistTimelineNow(latestTimeline.historyId, {
        past: latestTimeline.past,
        future: latestTimeline.future
      });
    };

    window.addEventListener("beforeunload", flushOnUnload);
    return () => {
      window.removeEventListener("beforeunload", flushOnUnload);
    };
  }, [persistStoreNow, persistTimelineNow]);

  useEffect(() => {
    if (!selectedHistoryId) return;

    setHistories((currentHistories) => {
      const historyIndex = currentHistories.findIndex(
        (history) => history.id === selectedHistoryId
      );
      if (historyIndex < 0) return currentHistories;

      const currentHistory = currentHistories[historyIndex];
      if (rowsEqual(currentHistory.rows, rows)) return currentHistories;

      const nextHistories = currentHistories.slice();
      nextHistories[historyIndex] = {
        ...currentHistory,
        rows: rows.map((row) => ({ ...row })),
        updatedAt: Date.now()
      };
      return nextHistories;
    });
  }, [rows, selectedHistoryId]);

  const computed = useMemo(() => computeSummary(rows), [rows]);

  const sortedHistories = useMemo(() => {
    const historiesCopy = [...histories];
    historiesCopy.sort((left, right) => {
      if (left.pinned !== right.pinned) {
        return left.pinned ? -1 : 1;
      }
      return right.updatedAt - left.updatedAt;
    });
    return historiesCopy;
  }, [histories]);

  const getTemplateById = useCallback(
    (templateId) => findTemplateById(templateId, templates),
    [templates]
  );

  const getHistoryById = useCallback(
    (historyId) => findHistoryById(historyId, histories),
    [histories]
  );

  const selectHistory = useCallback(
    (historyId, options = {}) => {
      const history = findHistoryById(historyId, historiesRef.current);
      if (!history) return false;

      clearPendingHistoryPush();

      const previousSelectedId = selectedHistoryIdRef.current;
      if (previousSelectedId && previousSelectedId !== history.id) {
        const previousHistory = findHistoryById(
          previousSelectedId,
          historiesRef.current
        );
        if (isTemplateHistoryEmpty(previousHistory, presentRef.current.rows)) {
          setHistories((currentHistories) =>
            currentHistories.filter(
              (currentHistory) => currentHistory.id !== previousSelectedId
            )
          );
          storageApi.clearHistoryTimeline(previousSelectedId);
        }
      }

      isRestoringRef.current = true;
      setSelectedHistoryId(history.id);
      setPresent(createDefaultState(history.rows));

      if (options.resetTimeline) {
        setPast([]);
        setFuture([]);
        persistTimelineNow(history.id, { past: [], future: [] });
      } else {
        const timelinePayload = normalizeTimelinePayload(
          storageApi.loadHistoryTimeline(history.id)
        );
        setPast(timelinePayload.past);
        setFuture(timelinePayload.future);
      }

      queueMicrotask(() => {
        isRestoringRef.current = false;
      });
      return true;
    },
    [persistTimelineNow, storageApi]
  );

  const discardSelectedTemplateHistoryIfEmpty = useCallback(() => {
    const currentHistoryId = selectedHistoryIdRef.current;
    if (!currentHistoryId) return false;

    const currentHistory = findHistoryById(currentHistoryId, historiesRef.current);
    if (!isTemplateHistoryEmpty(currentHistory, presentRef.current.rows)) {
      return false;
    }

    clearPendingHistoryPush();
    storageApi.clearHistoryTimeline(currentHistoryId);
    setHistories((currentHistories) =>
      currentHistories.filter((history) => history.id !== currentHistoryId)
    );

    isRestoringRef.current = true;
    setSelectedHistoryId(null);
    setPresent(createDefaultState());
    setPast([]);
    setFuture([]);
    queueMicrotask(() => {
      isRestoringRef.current = false;
    });
    return true;
  }, [storageApi]);

  const createHistoryFromTemplate = useCallback(
    (templateId) => {
      const template = findTemplateById(templateId, templatesRef.current);
      if (!template) return null;

      const baseCount = historyCountRef.current;
      const { historyId, usedCount } = getNextUniqueHistory(
        template.name,
        baseCount,
        historiesRef.current
      );
      const now = Date.now();
      const newHistory = {
        id: historyId,
        name: template.name,
        pinned: false,
        rows: template.rows.map((row) =>
          createRowFromPayload(row, { clearScores: false })
        ),
        createdAt: now,
        updatedAt: now,
        sourceTemplateId: template.id
      };

      setHistories((currentHistories) => [newHistory, ...currentHistories]);
      setHistoryCount((count) => Math.max(count, usedCount + 1));
      storageApi.saveHistoryTimeline(historyId, { past: [], future: [] });
      return newHistory;
    },
    [storageApi]
  );

  const createHistoryFromModule = useCallback(
    (modulePayload) => {
      const moduleName =
        String(modulePayload?.name ?? "").trim() || "Custom History";
      const baseCount = historyCountRef.current;
      const { historyId, usedCount } = getNextUniqueHistory(
        moduleName,
        baseCount,
        historiesRef.current
      );
      const now = Date.now();
      const newHistory = {
        id: historyId,
        name: moduleName,
        pinned: false,
        rows: [createRowFromPayload(modulePayload, { clearScores: false })],
        createdAt: now,
        updatedAt: now,
        sourceTemplateId: null
      };

      setHistories((currentHistories) => [newHistory, ...currentHistories]);
      setHistoryCount((count) => Math.max(count, usedCount + 1));
      storageApi.saveHistoryTimeline(historyId, { past: [], future: [] });
      return newHistory;
    },
    [storageApi]
  );

  const renameHistory = useCallback((historyId, nextName) => {
    const trimmedName = String(nextName ?? "").trim();
    if (!trimmedName) return false;

    let didUpdate = false;
    setHistories((currentHistories) =>
      currentHistories.map((history) => {
        if (history.id !== historyId) return history;
        didUpdate = true;
        return {
          ...history,
          name: trimmedName,
          updatedAt: Date.now()
        };
      })
    );
    return didUpdate;
  }, []);

  const duplicateHistory = useCallback(
    (historyId) => {
      const sourceHistory = findHistoryById(historyId, historiesRef.current);
      if (!sourceHistory) return null;

      const sourceRows =
        selectedHistoryIdRef.current === sourceHistory.id
          ? presentRef.current.rows
          : sourceHistory.rows;
      const sourceName =
        String(sourceHistory.name ?? "History").trim() || "History";
      const duplicatedName = `${sourceName} Copy`;

      const baseCount = historyCountRef.current;
      const { historyId: nextHistoryId, usedCount } = getNextUniqueHistory(
        duplicatedName,
        baseCount,
        historiesRef.current
      );
      const now = Date.now();
      const duplicatedHistory = {
        id: nextHistoryId,
        name: duplicatedName,
        pinned: false,
        rows: sourceRows.map((row) =>
          createRowFromPayload(row, { clearScores: false })
        ),
        createdAt: now,
        updatedAt: now,
        sourceTemplateId: sourceHistory.sourceTemplateId ?? null
      };

      setHistories((currentHistories) => [duplicatedHistory, ...currentHistories]);
      setHistoryCount((count) => Math.max(count, usedCount + 1));
      storageApi.saveHistoryTimeline(nextHistoryId, { past: [], future: [] });
      return duplicatedHistory;
    },
    [storageApi]
  );

  const deleteHistory = useCallback(
    (historyId) => {
      const normalizedHistoryId = String(historyId ?? "").trim();
      if (!normalizedHistoryId) return false;

      let removed = false;
      setHistories((currentHistories) => {
        const nextHistories = currentHistories.filter((history) => {
          const shouldKeep = history.id !== normalizedHistoryId;
          if (!shouldKeep) removed = true;
          return shouldKeep;
        });
        return nextHistories;
      });

      storageApi.clearHistoryTimeline(normalizedHistoryId);

      if (selectedHistoryIdRef.current === normalizedHistoryId) {
        clearPendingHistoryPush();
        isRestoringRef.current = true;
        setSelectedHistoryId(null);
        setPresent(createDefaultState());
        setPast([]);
        setFuture([]);
        queueMicrotask(() => {
          isRestoringRef.current = false;
        });
      }

      return removed;
    },
    [storageApi]
  );

  const toggleHistoryPinned = useCallback((historyId) => {
    let didToggle = false;
    setHistories((currentHistories) =>
      currentHistories.map((history) => {
        if (history.id !== historyId) return history;
        didToggle = true;
        return {
          ...history,
          pinned: !history.pinned,
          updatedAt: Date.now()
        };
      })
    );
    return didToggle;
  }, []);

  const createTemplateFromHistory = useCallback(
    (historyId, templateDetails = {}) => {
      if (templatesRef.current.length >= MAX_TEMPLATE_STORAGE) return null;

      const history = findHistoryById(historyId, historiesRef.current);
      if (!history) return null;

      const templateName =
        String(templateDetails?.name ?? history.name).trim() || history.name;
      const templateYear = String(templateDetails?.year ?? "Custom").trim() || "Custom";
      const templateSemester =
        String(templateDetails?.semester ?? "--").trim() || "--";
      const templateId = getNextUniqueTemplate(templateName, templatesRef.current);
      const template = {
        id: templateId,
        name: templateName,
        year: templateYear,
        semester: templateSemester,
        rows: history.rows.map((row) =>
          createRowFromPayload(row, { clearScores: true })
        )
      };

      setTemplates((currentTemplates) => [...currentTemplates, template]);
      return template;
    },
    []
  );

  const deleteTemplate = useCallback((templateId) => {
    const normalizedTemplateId = String(templateId ?? "").trim();
    if (!normalizedTemplateId) return false;

    let removed = false;
    setTemplates((currentTemplates) => {
      const nextTemplates = currentTemplates.filter((template) => {
        const shouldKeep = template.id !== normalizedTemplateId;
        if (!shouldKeep) removed = true;
        return shouldKeep;
      });
      return nextTemplates;
    });
    return removed;
  }, []);

  const updateTemplate = useCallback((templateId, updates = {}) => {
    const normalizedTemplateId = String(templateId ?? "").trim();
    if (!normalizedTemplateId) return false;

    let didUpdate = false;
    setTemplates((currentTemplates) =>
      currentTemplates.map((template) => {
        if (template.id !== normalizedTemplateId) return template;

        const nextNameRaw =
          updates?.name === undefined ? template.name : String(updates.name).trim();
        const nextYearRaw =
          updates?.year === undefined ? template.year : String(updates.year).trim();
        const nextSemesterRaw =
          updates?.semester === undefined
            ? template.semester
            : String(updates.semester).trim();

        const nextName = nextNameRaw || template.name;
        const nextYear = nextYearRaw || template.year;
        const nextSemester = nextSemesterRaw || template.semester;

        if (
          nextName === template.name &&
          nextYear === template.year &&
          nextSemester === template.semester
        ) {
          return template;
        }

        didUpdate = true;
        return {
          ...template,
          name: nextName,
          year: nextYear,
          semester: nextSemester
        };
      })
    );

    return didUpdate;
  }, []);

  function updateRow(index, key, value) {
    if (!selectedHistoryIdRef.current) return;

    setPresent((state) => {
      const currentRow = state.rows[index];
      if (!currentRow) return state;

      const nextValue =
        key === "exam" || key === "ca"
          ? normalizeGradeInput(value, currentRow[key])
          : key === "coef"
            ? normalizeCoefInput(value, currentRow[key])
          : value;

      if (Object.is(currentRow[key], nextValue)) {
        return state;
      }

      const nextRows = state.rows.slice();
      const nextRow = normalizeRowHiddenStats({ ...currentRow, [key]: nextValue });
      if (isSameRow(currentRow, nextRow)) return state;
      nextRows[index] = nextRow;
      const nextState = { ...state, rows: nextRows };
      pushToHistory(state);
      return nextState;
    });
  }

  function updateRowStats(index, updates) {
    if (!selectedHistoryIdRef.current) return;

    setPresent((state) => {
      const currentRow = state.rows[index];
      if (!currentRow) return state;

      const nextRow = normalizeRowHiddenStats({
        ...currentRow,
        ...updates
      });
      if (isSameRow(currentRow, nextRow)) return state;

      const nextRows = state.rows.slice();
      nextRows[index] = nextRow;
      const nextState = { ...state, rows: nextRows };
      pushToHistory(state);
      return nextState;
    });
  }

  function addRow(payload) {
    if (!selectedHistoryIdRef.current) return;
    const row = createRowFromPayload(payload, { clearScores: false });

    setPresent((state) => {
      const nextState = { ...state, rows: [...state.rows, row] };
      pushToHistory(state);
      return nextState;
    });
  }

  function removeRow(index) {
    if (!selectedHistoryIdRef.current) return;

    setPresent((state) => {
      if (index < 0 || index >= state.rows.length) return state;
      const nextState = {
        ...state,
        rows: state.rows.filter((_, rowIndex) => rowIndex !== index)
      };
      pushToHistory(state);
      return nextState;
    });
  }

  function undo() {
    if (!selectedHistoryIdRef.current) return;

    clearPendingHistoryPush();
    setPast((historyStack) => {
      if (historyStack.length === 0) return historyStack;

      const previousState = historyStack[historyStack.length - 1];
      const remainingHistory = historyStack.slice(0, -1);

      isRestoringRef.current = true;
      setFuture((queue) => [presentRef.current, ...queue]);
      setPresent(previousState);
      queueMicrotask(() => {
        isRestoringRef.current = false;
      });

      return remainingHistory;
    });
  }

  function redo() {
    if (!selectedHistoryIdRef.current) return;

    clearPendingHistoryPush();
    setFuture((queue) => {
      if (queue.length === 0) return queue;

      const nextState = queue[0];
      const remainingQueue = queue.slice(1);

      isRestoringRef.current = true;
      setPast((historyStack) => [...historyStack, presentRef.current]);
      setPresent(nextState);
      queueMicrotask(() => {
        isRestoringRef.current = false;
      });

      return remainingQueue;
    });
  }

  function resetAll() {
    const currentHistoryId = selectedHistoryIdRef.current;
    if (!currentHistoryId) return;

    const currentHistory = findHistoryById(currentHistoryId, historiesRef.current);
    if (!currentHistory) return;

    clearPendingHistoryPush();
    isRestoringRef.current = true;
    setPresent(createDefaultState(currentHistory.rows));
    setPast([]);
    setFuture([]);
    persistTimelineNow(currentHistory.id, { past: [], future: [] });
    queueMicrotask(() => {
      isRestoringRef.current = false;
    });
  }

  return {
    rows,
    computed,
    templates,
    histories: sortedHistories,
    selectedHistoryId,
    historyCount,
    getTemplateById,
    getHistoryById,
    history: {
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      pastCount: past.length,
      futureCount: future.length
    },
    actions: {
      updateRow,
      updateRowStats,
      addRow,
      removeRow,
      undo,
      redo,
      resetAll,
      selectHistory,
      createHistoryFromTemplate,
      createHistoryFromModule,
      duplicateHistory,
      renameHistory,
      deleteHistory,
      toggleHistoryPinned,
      createTemplateFromHistory,
      deleteTemplate,
      updateTemplate,
      discardSelectedTemplateHistoryIfEmpty
    }
  };
}
