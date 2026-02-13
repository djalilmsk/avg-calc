import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HISTORY_LIMIT } from "../constants";
import { createDefaultState, normalizePersistedStore } from "../state";
import { useCalculatorStorageApi } from "../context/useCalculatorStorageApi";
import {
  HISTORY_DEBOUNCE_MS,
  PERSIST_DEBOUNCE_MS
} from "./useSemesterCalculator/constants";
import {
  findHistoryById,
  findTemplateById,
  sortHistories
} from "./useSemesterCalculator/historyTemplateModel";
import { computeSummary, rowsEqual } from "./useSemesterCalculator/rowModel";
import { normalizeTimelinePayload } from "./useSemesterCalculator/timelineModel";
import { useSyncedRef } from "./useSemesterCalculator/useSyncedRef";
import { useSemesterCalculatorActions } from "./useSemesterCalculator/actions/useSemesterCalculatorActions";

const EMPTY_TIMELINE = { past: [], future: [] };

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
    : EMPTY_TIMELINE;
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

  const presentRef = useSyncedRef(present);
  const historiesRef = useSyncedRef(histories);
  const templatesRef = useSyncedRef(templates);
  const selectedHistoryIdRef = useSyncedRef(selectedHistoryId);
  const historyCountRef = useSyncedRef(historyCount);

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

  const clearPendingHistoryPush = useCallback(() => {
    if (!pushTimerRef.current) return;
    window.clearTimeout(pushTimerRef.current);
    pushTimerRef.current = null;
  }, []);

  const pushToHistory = useCallback(
    (previousState) => {
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
    },
    [clearPendingHistoryPush, selectedHistoryIdRef]
  );

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
  const sortedHistories = useMemo(() => sortHistories(histories), [histories]);

  const getTemplateById = useCallback(
    (templateId) => findTemplateById(templateId, templates),
    [templates]
  );
  const getHistoryById = useCallback(
    (historyId) => findHistoryById(historyId, histories),
    [histories]
  );

  const actions = useSemesterCalculatorActions({
    storageApi,
    persistTimelineNow,
    clearPendingHistoryPush,
    pushToHistory,
    setTemplates,
    setHistories,
    setHistoryCount,
    setSelectedHistoryId,
    setPresent,
    setPast,
    setFuture,
    templatesRef,
    historiesRef,
    historyCountRef,
    selectedHistoryIdRef,
    presentRef,
    isRestoringRef
  });

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
    actions
  };
}
