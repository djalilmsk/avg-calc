import { useEffect, useMemo, useRef, useState } from "react";
import { HISTORY_LIMIT, SNAPSHOT_LIMIT, START_TEMPLATES, STORAGE_KEY } from "../constants";
import { createDefaultState, getTemplateById, loadPersisted } from "../state";
import { clampNumber, deepCopy, nowLabel, round2 } from "../utils";

function clampRange(value, min, max) {
  return Math.min(max, Math.max(min, clampNumber(value)));
}

export function useSemesterCalculator() {
  const TEMPLATE_STORAGE_KEY = "semester_avg_template_v1";
  const initialStore = useMemo(() => loadPersisted(), []);

  const [present, setPresent] = useState(initialStore.present);
  const [past, setPast] = useState(initialStore.past);
  const [future, setFuture] = useState(initialStore.future);
  const [snapshots, setSnapshots] = useState(initialStore.snapshots);

  const isRestoringRef = useRef(false);
  const pushTimerRef = useRef(null);
  const rows = present.rows;
  const [templateId, setTemplateId] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
    return stored || null;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const payload = { present, past, future, snapshots };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [present, past, future, snapshots]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!templateId) return;
    window.localStorage.setItem(TEMPLATE_STORAGE_KEY, templateId);
  }, [templateId]);

  useEffect(() => {
    return () => {
      if (pushTimerRef.current) {
        window.clearTimeout(pushTimerRef.current);
      }
    };
  }, []);

  function pushToHistory(prevState) {
    if (isRestoringRef.current) return;

    if (pushTimerRef.current) {
      window.clearTimeout(pushTimerRef.current);
    }

    pushTimerRef.current = window.setTimeout(() => {
      setPast((history) => {
        const nextHistory = [...history, deepCopy(prevState)];
        return nextHistory.length > HISTORY_LIMIT
          ? nextHistory.slice(nextHistory.length - HISTORY_LIMIT)
          : nextHistory;
      });
      setFuture([]);
    }, 180);
  }

  const computed = useMemo(() => {
    const perRow = rows.map((row) => {
      const coef = clampNumber(row.coef);
      const exam = clampRange(row.exam, 0, 20);
      const ca = clampRange(row.ca, 0, 20);
      const examWeightNum = clampRange(row.examWeight, 0, 1);
      const caWeightNum = clampRange(row.caWeight, 0, 1);
      const includeExam = row.includeExam !== false;
      const includeCa = row.includeCa !== false;
      const activeWeight = (includeExam ? examWeightNum : 0) + (includeCa ? caWeightNum : 0);

      const hasExamGrade = includeExam && String(row.exam).trim() !== "";
      const hasCaGrade = includeCa && String(row.ca).trim() !== "";
      const hasAnyGrade = hasExamGrade || hasCaGrade;
      const rawFinal =
        (includeExam ? exam * examWeightNum : 0) +
        (includeCa ? ca * caWeightNum : 0);
      const moduleFinalValue = activeWeight > 0 ? rawFinal / activeWeight : 0;

      return {
        ...row,
        moduleFinal: hasAnyGrade ? round2(moduleFinalValue) : "",
        _coef: coef,
        _moduleFinal: moduleFinalValue,
        _hasAnyGrade: hasAnyGrade
      };
    });

    const totals = perRow.reduce(
      (acc, row) => {
        if (row._hasAnyGrade && row._coef > 0) {
          acc.sumWeighted += row._moduleFinal * row._coef;
          acc.sumCoef += row._coef;
        }

        return acc;
      },
      { sumWeighted: 0, sumCoef: 0 }
    );

    const semesterAvg = totals.sumCoef > 0 ? round2(totals.sumWeighted / totals.sumCoef) : "";

    return {
      perRow: perRow.map(({ ...publicRow }) => publicRow),
      semesterAvg,
      sumCoef: totals.sumCoef
    };
  }, [rows]);

  function updateState(mutator) {
    setPresent((prev) => {
      const next = mutator(prev);
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;

      pushToHistory(prev);
      return next;
    });
  }

  function updateRow(index, key, value) {
    updateState((state) => ({
      ...state,
      rows: state.rows.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    }));
  }

  function addRow(payload) {
    const name = String(payload?.name ?? "New module").trim() || "New module";
    const coef = payload?.coef ?? 1;
    const examWeight = clampRange(payload?.examWeight ?? 0.6, 0, 1);
    const caWeight = clampRange(payload?.caWeight ?? 0.4, 0, 1);
    const includeExam = payload?.includeExam ?? true;
    const includeCa = payload?.includeCa ?? true;

    updateState((state) => ({
      ...state,
      rows: [
        ...state.rows,
        { name, coef, exam: "", ca: "", examWeight, caWeight, includeExam, includeCa }
      ]
    }));
  }

  function removeRow(index) {
    updateState((state) => ({
      ...state,
      rows: state.rows.filter((_, i) => i !== index)
    }));
  }

  function undo() {
    setPast((history) => {
      if (history.length === 0) return history;

      const previous = history[history.length - 1];
      const remaining = history.slice(0, -1);

      isRestoringRef.current = true;
      setFuture((queue) => [deepCopy(present), ...queue]);
      setPresent(deepCopy(previous));
      queueMicrotask(() => {
        isRestoringRef.current = false;
      });

      return remaining;
    });
  }

  function redo() {
    setFuture((queue) => {
      if (queue.length === 0) return queue;

      const next = queue[0];
      const remaining = queue.slice(1);

      isRestoringRef.current = true;
      setPast((history) => [...history, deepCopy(present)]);
      setPresent(deepCopy(next));
      queueMicrotask(() => {
        isRestoringRef.current = false;
      });

      return remaining;
    });
  }

  function saveSnapshot() {
    const label = `Snapshot ${snapshots.length + 1} | ${nowLabel()}`;
    const snapshot = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      label,
      createdAt: Date.now(),
      state: deepCopy(present)
    };

    setSnapshots((current) => [snapshot, ...current].slice(0, SNAPSHOT_LIMIT));
  }

  function restoreSnapshot(id) {
    const snapshot = snapshots.find((item) => item.id === id);
    if (!snapshot) return;

    isRestoringRef.current = true;
    setPast((history) => [...history, deepCopy(present)]);
    setFuture([]);
    setPresent(deepCopy(snapshot.state));
    queueMicrotask(() => {
      isRestoringRef.current = false;
    });
  }

  function deleteSnapshot(id) {
    setSnapshots((current) => current.filter((snapshot) => snapshot.id !== id));
  }

  function renameSnapshot(id, label) {
    const nextLabel = String(label ?? "").trim();
    if (!nextLabel) return;

    setSnapshots((current) =>
      current.map((snapshot) =>
        snapshot.id === id ? { ...snapshot, label: nextLabel } : snapshot
      )
    );
  }

  function resetAll() {
    isRestoringRef.current = true;
    setPast([]);
    setFuture([]);
    setPresent(createDefaultState(getTemplateById(templateId).rows));
    queueMicrotask(() => {
      isRestoringRef.current = false;
    });
  }

  function applyTemplate(nextTemplateId) {
    const template = getTemplateById(nextTemplateId);
    isRestoringRef.current = true;
    setPast([]);
    setFuture([]);
    setPresent(createDefaultState(template.rows));
    setTemplateId(template.id);
    queueMicrotask(() => {
      isRestoringRef.current = false;
    });
  }

  return {
    rows,
    snapshots,
    computed,
    templates: START_TEMPLATES,
    selectedTemplateId: templateId,
    needsTemplateChoice: !templateId,
    history: {
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      pastCount: past.length,
      futureCount: future.length
    },
    actions: {
      updateRow,
      addRow,
      removeRow,
      undo,
      redo,
      saveSnapshot,
      restoreSnapshot,
      deleteSnapshot,
      renameSnapshot,
      resetAll,
      applyTemplate
    }
  };
}
