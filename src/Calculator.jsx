/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from "react";
// Calculator.css removed - fully Tailwind

const DEFAULT_EXAM_W = 0.6;
const DEFAULT_CA_W = 0.4;
const STORAGE_KEY = "semester_avg_app_v1";

function clampNumber(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function nowLabel() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function safeParse(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function deepCopy(x) {
  return JSON.parse(JSON.stringify(x));
}

function createDefaultState() {
  return {
    examWeight: DEFAULT_EXAM_W,
    caWeight: DEFAULT_CA_W,
    rows: [
      { name: "Algorithmique et Complexité avancées", coef: 4, exam: "", ca: "" },
      { name: "BDD: Administration et architecture", coef: 4, exam: "", ca: "" },
      { name: "Fondements de l'IA (FIA)", coef: 2, exam: "", ca: "" },
      { name: "Génie Logiciel", coef: 4, exam: "", ca: "" },
      { name: "Système d'Exploitation: Synchro et comm (SYS2)", coef: 3, exam: "", ca: "" },
      { name: "Techniques d'Optimisation (TOp)", coef: 3, exam: "", ca: "" }
    ]
  };
}

function loadPersisted() {
  if (typeof window === "undefined") {
    return { present: createDefaultState(), past: [], future: [], snapshots: [] };
  }

  const parsed = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (!parsed?.present) {
    return { present: createDefaultState(), past: [], future: [], snapshots: [] };
  }

  return {
    present: parsed.present,
    past: Array.isArray(parsed.past) ? parsed.past : [],
    future: Array.isArray(parsed.future) ? parsed.future : [],
    snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots : []
  };
}

export default function SemesterAverageApp() {
  // Undo/Redo history (past -> present -> future)
  const [present, setPresent] = useState(() => loadPersisted().present);
  const [past, setPast] = useState(() => loadPersisted().past);
  const [future, setFuture] = useState(() => loadPersisted().future);

  // Manual named snapshots (restore any time)
  const [snapshots, setSnapshots] = useState(() => loadPersisted().snapshots);

  // Prevent pushing to history when we are restoring (undo/redo/snapshot restore)
  const isRestoringRef = useRef(false);

  const examWeight = present.examWeight;
  const caWeight = present.caWeight;
  const rows = present.rows;

  // Persist everything to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = { present, past, future, snapshots };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [present, past, future, snapshots]);

  // Push previous state to history (debounced a bit)
  const pushTimer = useRef(null);
  function pushToHistory(prevState) {
    if (isRestoringRef.current) return;

    if (pushTimer.current) window.clearTimeout(pushTimer.current);
    pushTimer.current = window.setTimeout(() => {
      setPast((p) => {
        // cap history size to avoid huge memory
        const next = [...p, deepCopy(prevState)];
        const MAX = 80;
        return next.length > MAX ? next.slice(next.length - MAX) : next;
      });
      setFuture([]);
    }, 180);
  }

  const weightSumOk = useMemo(() => {
    const s = clampNumber(examWeight) + clampNumber(caWeight);
    return Math.abs(s - 1) < 1e-9;
  }, [examWeight, caWeight]);

  const computed = useMemo(() => {
    const ew = clampNumber(examWeight);
    const cw = clampNumber(caWeight);

    const perRow = rows.map((r) => {
      const coef = clampNumber(r.coef);
      const exam = clampNumber(r.exam);
      const ca = clampNumber(r.ca);

      const hasAnyGrade = String(r.exam).trim() !== "" || String(r.ca).trim() !== "";
      const moduleFinal = exam * ew + ca * cw;

      return {
        ...r,
        moduleFinal: hasAnyGrade ? round2(moduleFinal) : "",
        _coef: coef,
        _moduleFinal: moduleFinal,
        _hasAnyGrade: hasAnyGrade
      };
    });

    const { sumWeighted, sumCoef } = perRow.reduce(
      (acc, r) => {
        if (r._hasAnyGrade && r._coef > 0) {
          acc.sumWeighted += r._moduleFinal * r._coef;
          acc.sumCoef += r._coef;
        }
        return acc;
      },
      { sumWeighted: 0, sumCoef: 0 }
    );

    const semesterAvg = sumCoef > 0 ? round2(sumWeighted / sumCoef) : "";

    return {
      perRow: perRow.map(({ _coef, _moduleFinal, _hasAnyGrade, ...r }) => r),
      semesterAvg,
      sumCoef
    };
  }, [rows, examWeight, caWeight]);

  function setState(mutator) {
    setPresent((prev) => {
      const next = mutator(prev);
      // if nothing changed, do nothing
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      pushToHistory(prev);
      return next;
    });
  }

  function updateRow(index, key, value) {
    setState((s) => ({
      ...s,
      rows: s.rows.map((r, i) => (i === index ? { ...r, [key]: value } : r))
    }));
  }

  function addRow() {
    setState((s) => ({
      ...s,
      rows: [...s.rows, { name: "New module", coef: 1, exam: "", ca: "" }]
    }));
  }

  function removeRow(index) {
    setState((s) => ({
      ...s,
      rows: s.rows.filter((_, i) => i !== index)
    }));
  }

  function normalizeWeights() {
    const ew = clampNumber(examWeight);
    const cw = clampNumber(caWeight);
    const s = ew + cw;
    if (s <= 0) return;
    setState((st) => ({ ...st, examWeight: ew / s, caWeight: cw / s }));
  }

  function undo() {
    setPast((p) => {
      if (p.length === 0) return p;

      const prev = p[p.length - 1];
      const rest = p.slice(0, -1);

      isRestoringRef.current = true;
      setFuture((f) => [deepCopy(present), ...f]);
      setPresent(deepCopy(prev));
      queueMicrotask(() => (isRestoringRef.current = false));

      return rest;
    });
  }

  function redo() {
    setFuture((f) => {
      if (f.length === 0) return f;

      const next = f[0];
      const rest = f.slice(1);

      isRestoringRef.current = true;
      setPast((p) => [...p, deepCopy(present)]);
      setPresent(deepCopy(next));
      queueMicrotask(() => (isRestoringRef.current = false));

      return rest;
    });
  }

  function saveSnapshot() {
    const label = `Snapshot ${snapshots.length + 1} · ${nowLabel()}`;
    const snap = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      label,
      createdAt: Date.now(),
      state: deepCopy(present)
    };
    setSnapshots((s) => [snap, ...s].slice(0, 30));
  }

  function restoreSnapshot(id) {
    const snap = snapshots.find((x) => x.id === id);
    if (!snap) return;

    isRestoringRef.current = true;
    // restoring should be undoable
    setPast((p) => [...p, deepCopy(present)]);
    setFuture([]);
    setPresent(deepCopy(snap.state));
    queueMicrotask(() => (isRestoringRef.current = false));
  }

  function deleteSnapshot(id) {
    setSnapshots((s) => s.filter((x) => x.id !== id));
  }

  function resetAll() {
    isRestoringRef.current = true;
    setPast([]);
    setFuture([]);
    // setSnapshots([]);
    setPresent(createDefaultState());
    queueMicrotask(() => (isRestoringRef.current = false));
  }

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return (
    <div className="min-h-screen bg-neutral-900 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-neutral-800 shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-semibold text-white">Semester Average Calculator</h1>
              <p className="text-neutral-400">Enter module grades and coefficients, then get your weighted semester average.</p>
            </div>

            {/* History controls */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className={`rounded-md px-4 py-2 font-medium ${
                    canUndo ? "cursor-pointer bg-neutral-700 text-neutral-200 hover:bg-neutral-600" : "cursor-not-allowed bg-neutral-800 text-neutral-600"
                  }`}
                >
                  Undo
                </button>

                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className={`rounded-md px-4 py-2 font-medium ${
                    canRedo ? "cursor-pointer bg-neutral-700 text-neutral-200 hover:bg-neutral-600" : "cursor-not-allowed bg-neutral-800 text-neutral-600"
                  }`}
                >
                  Redo
                </button>

                <button
                  onClick={saveSnapshot}
                  className="cursor-pointer rounded-md bg-white text-neutral-900 px-4 py-2 font-medium hover:bg-neutral-100"
                  title="Save a named snapshot you can restore later"
                >
                  Save snapshot
                </button>

                <button
                  onClick={resetAll}
                  className="cursor-pointer rounded-md bg-neutral-700 px-4 py-2 font-medium text-neutral-200 hover:bg-neutral-600"
                  title="Clear history and reset"
                >
                  Reset
                </button>
              </div>

              <div className="text-sm text-neutral-400">
                History: {past.length} past, {future.length} future · Snapshots: {snapshots.length}
              </div>
            </div>

            {/* Snapshots list */}
            {snapshots.length > 0 && (
              <div className="mt-4 rounded-2xl bg-neutral-900 border border-neutral-700 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm font-semibold text-neutral-200">Snapshots</div>
                  <div className="text-xs text-neutral-500">Saved locally on this device</div>
                </div>

                <div className="mt-3 space-y-2">
                  {snapshots.slice(0, 6).map((s) => (
                    <div key={s.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-neutral-800 border border-neutral-700 p-3">
                      <div className="text-sm text-neutral-300">{s.label}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => restoreSnapshot(s.id)}
                          className="cursor-pointer rounded-md bg-neutral-700 px-3 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-600"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => deleteSnapshot(s.id)}
                          className="cursor-pointer rounded-md bg-neutral-700 px-3 py-2 text-sm font-medium text-rose-400 hover:bg-neutral-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {snapshots.length > 6 && (
                    <div className="text-xs text-neutral-500">Showing latest 6 snapshots. Older ones are still saved.</div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm text-neutral-400">Exam weight</label>
                <input
                  type="number"
                  step="0.01"
                  value={examWeight}
                  onChange={(e) => setState((s) => ({ ...s, examWeight: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-200 outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400">CA weight</label>
                <input
                  type="number"
                  step="0.01"
                  value={caWeight}
                  onChange={(e) => setState((s) => ({ ...s, caWeight: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-200 outline-none focus:border-neutral-500"
                />
              </div>

              <button
                onClick={normalizeWeights}
                className="cursor-pointer rounded-md bg-neutral-900 text-white px-4 py-2 font-medium hover:bg-black"
                title="Make (Exam + CA) = 1"
              >
                Normalize weights
              </button>
            </div>

            {!weightSumOk && (
              <div className="mt-3 rounded-md bg-rose-950 text-rose-400 px-4 py-3 text-sm border border-rose-900">
                Warning: Exam + CA weights should equal 1 (example: 0.6 + 0.4).
              </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block table-container mt-6 overflow-x-auto rounded-md border border-neutral-700">
              <table className="min-w-[900px] w-full border-collapse">
                <thead className="bg-neutral-900">
                  <tr>
                    <th className="text-left text-sm font-semibold text-neutral-300 px-4 py-3">Module</th>
                    <th className="text-left text-sm font-semibold text-neutral-300 px-4 py-3 w-28">Coef</th>
                    <th className="text-left text-sm font-semibold text-neutral-300 px-4 py-3 w-32">Exam</th>
                    <th className="text-left text-sm font-semibold text-neutral-300 px-4 py-3 w-32">CA</th>
                    <th className="text-left text-sm font-semibold text-neutral-300 px-4 py-3 w-28">Final</th>
                    <th className="px-4 py-3 w-28"></th>
                  </tr>
                </thead>
                <tbody>
                  {computed.perRow.map((r, i) => (
                    <tr key={i} className="border-t border-neutral-700 transition-colors hover:bg-neutral-800/50">
                      <td className="px-4 py-3">
                        <input
                          value={r.name}
                          onChange={(e) => updateRow(i, "name", e.target.value)}
                          className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-200 outline-none focus:border-neutral-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="1"
                          value={r.coef}
                          onChange={(e) => updateRow(i, "coef", e.target.value)}
                          className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-200 outline-none focus:border-neutral-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={r.exam}
                          onChange={(e) => updateRow(i, "exam", e.target.value)}
                          className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-200 outline-none focus:border-neutral-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={r.ca}
                          onChange={(e) => updateRow(i, "ca", e.target.value)}
                          className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-200 outline-none focus:border-neutral-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-neutral-200 font-semibold">{r.moduleFinal === "" ? "—" : r.moduleFinal}</div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeRow(i)}
                          className="cursor-pointer w-full rounded-md bg-neutral-700 px-3 py-2 text-neutral-300 hover:bg-neutral-600"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden mt-6 flex flex-col gap-4">
              {computed.perRow.map((r, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-xl bg-neutral-800/50 border border-neutral-700 p-4">
                  <div className="flex items-center gap-3">
                    <input
                      value={r.name}
                      onChange={(e) => updateRow(i, "name", e.target.value)}
                      className="flex-1 rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-200 outline-none focus:border-neutral-500 font-medium"
                      placeholder="Module name"
                    />
                    <button
                      onClick={() => removeRow(i)}
                      className="cursor-pointer rounded-md bg-neutral-700 p-2 text-rose-400 hover:bg-neutral-600 flex-shrink-0"
                      title="Remove module"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Coef</label>
                      <input
                        type="number"
                        step="1"
                        value={r.coef}
                        onChange={(e) => updateRow(i, "coef", e.target.value)}
                        className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-200 outline-none focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">Exam</label>
                      <input
                        type="number"
                        step="0.01"
                        value={r.exam}
                        onChange={(e) => updateRow(i, "exam", e.target.value)}
                        className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-200 outline-none focus:border-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-400 mb-1">CA</label>
                      <input
                        type="number"
                        step="0.01"
                        value={r.ca}
                        onChange={(e) => updateRow(i, "ca", e.target.value)}
                        className="w-full rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-neutral-200 outline-none focus:border-neutral-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-neutral-700/50">
                    <span className="text-sm text-neutral-400">Final Grade</span>
                    <span className={`text-lg font-bold ${r.moduleFinal !== "" && r.moduleFinal < 10 ? "text-rose-400" : "text-white"}`}>
                      {r.moduleFinal === "" ? "—" : r.moduleFinal}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={addRow}
                  className="cursor-pointer rounded-md bg-neutral-700 px-4 py-2 font-medium text-neutral-200 hover:bg-neutral-600"
                >
                  Add module
                </button>

                <div className="rounded-md bg-neutral-900 border border-neutral-700 px-4 py-2 text-neutral-300">
                  <span className="font-semibold text-neutral-200">Total counted coef:</span> {computed.sumCoef || 0}
                </div>
              </div>

              <div className="rounded-md bg-neutral-900 border border-neutral-700 text-white px-5 py-3">
                <div className="text-sm text-neutral-400">Semester average</div>
                <div className="text-2xl font-semibold">{computed.semesterAvg === "" ? "—" : computed.semesterAvg}</div>
              </div>
            </div>

            <p className="mt-4 text-sm text-neutral-500">
              Note: A module is counted only if you enter Exam or CA (or both). Undo/Redo and Snapshots are saved locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
