import { useCallback, useMemo } from "react";
import { normalizeCoefInput, normalizeGradeInput } from "../gradeInputs";
import {
  createRowFromPayload,
  isSameRow,
  normalizeRowHiddenStats
} from "../rowModel";

export function useRowActions({
  selectedHistoryIdRef,
  setPresent,
  pushToHistory
}) {
  const updateRow = useCallback(
    (index, key, value) => {
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
    },
    [pushToHistory, selectedHistoryIdRef, setPresent]
  );

  const updateRowStats = useCallback(
    (index, updates) => {
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
    },
    [pushToHistory, selectedHistoryIdRef, setPresent]
  );

  const addRow = useCallback(
    (payload) => {
      if (!selectedHistoryIdRef.current) return;
      const row = createRowFromPayload(payload, { clearScores: false });

      setPresent((state) => {
        const nextState = { ...state, rows: [...state.rows, row] };
        pushToHistory(state);
        return nextState;
      });
    },
    [pushToHistory, selectedHistoryIdRef, setPresent]
  );

  const removeRow = useCallback(
    (index) => {
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
    },
    [pushToHistory, selectedHistoryIdRef, setPresent]
  );

  return useMemo(
    () => ({
      updateRow,
      updateRowStats,
      addRow,
      removeRow
    }),
    [addRow, removeRow, updateRow, updateRowStats]
  );
}
