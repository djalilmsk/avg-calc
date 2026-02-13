import { useCallback, useMemo } from "react";
import { createDefaultState } from "../../../state";
import { createRowFromPayload } from "../rowModel";
import {
  findHistoryById,
  findTemplateById,
  getNextUniqueHistory,
  isTemplateHistoryEmpty
} from "../historyTemplateModel";
import { normalizeTimelinePayload } from "../timelineModel";

export function useHistoryActions({
  storageApi,
  persistTimelineNow,
  clearPendingHistoryPush,
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
}) {
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
    [
      clearPendingHistoryPush,
      historiesRef,
      isRestoringRef,
      persistTimelineNow,
      presentRef,
      selectedHistoryIdRef,
      setFuture,
      setHistories,
      setPast,
      setPresent,
      setSelectedHistoryId,
      storageApi
    ]
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
  }, [
    clearPendingHistoryPush,
    historiesRef,
    isRestoringRef,
    presentRef,
    selectedHistoryIdRef,
    setFuture,
    setHistories,
    setPast,
    setPresent,
    setSelectedHistoryId,
    storageApi
  ]);

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
    [historiesRef, historyCountRef, setHistories, setHistoryCount, storageApi, templatesRef]
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
    [historiesRef, historyCountRef, setHistories, setHistoryCount, storageApi]
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
  }, [setHistories]);

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
    [
      historiesRef,
      historyCountRef,
      presentRef,
      selectedHistoryIdRef,
      setHistories,
      setHistoryCount,
      storageApi
    ]
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
    [
      clearPendingHistoryPush,
      isRestoringRef,
      selectedHistoryIdRef,
      setFuture,
      setHistories,
      setPast,
      setPresent,
      setSelectedHistoryId,
      storageApi
    ]
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
  }, [setHistories]);

  const undo = useCallback(() => {
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
  }, [
    clearPendingHistoryPush,
    isRestoringRef,
    presentRef,
    selectedHistoryIdRef,
    setFuture,
    setPast,
    setPresent
  ]);

  const redo = useCallback(() => {
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
  }, [
    clearPendingHistoryPush,
    isRestoringRef,
    presentRef,
    selectedHistoryIdRef,
    setFuture,
    setPast,
    setPresent
  ]);

  const resetAll = useCallback(() => {
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
  }, [
    clearPendingHistoryPush,
    historiesRef,
    isRestoringRef,
    persistTimelineNow,
    selectedHistoryIdRef,
    setFuture,
    setPast,
    setPresent
  ]);

  return useMemo(
    () => ({
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
      discardSelectedTemplateHistoryIfEmpty
    }),
    [
      createHistoryFromModule,
      createHistoryFromTemplate,
      deleteHistory,
      discardSelectedTemplateHistoryIfEmpty,
      duplicateHistory,
      redo,
      renameHistory,
      resetAll,
      selectHistory,
      toggleHistoryPinned,
      undo
    ]
  );
}
