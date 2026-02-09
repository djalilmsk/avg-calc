import { useState } from "react";

export default function AddModuleBar({ onAdd }) {
  const [name, setName] = useState("");
  const [coef, setCoef] = useState(1);
  const [examWeight, setExamWeight] = useState(0.6);
  const [caWeight, setCaWeight] = useState(0.4);
  const [includeExam, setIncludeExam] = useState(true);
  const [includeCa, setIncludeCa] = useState(true);

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;

    onAdd({
      name: trimmed,
      coef,
      examWeight,
      caWeight,
      includeExam,
      includeCa,
    });
    setName("");
    setCoef(1);
    setExamWeight(0.6);
    setCaWeight(0.4);
    setIncludeExam(true);
    setIncludeCa(true);
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-3 sm:px-7 pt-2">
      <div className="sticky bottom-0 z-30 w-full rounded-full border-[#333] bg-[#1f2024]/95 p-2 backdrop-blur sm:p-3 sm:px-6">
        <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-[2fr_100px_110px_110px_auto_auto_120px]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Module name"
            className="calc-input col-span-2 md:col-span-1"
          />
          <input
            type="number"
            step="1"
            value={coef}
            onChange={(event) => setCoef(event.target.value)}
            placeholder="Coef"
            className="calc-input"
          />
          <input
            type="number"
            step="0.01"
            value={examWeight}
            onChange={(event) => setExamWeight(event.target.value)}
            placeholder="Exam W"
            className="calc-input"
          />
          <input
            type="number"
            step="0.01"
            value={caWeight}
            onChange={(event) => setCaWeight(event.target.value)}
            placeholder="CA W"
            className="calc-input"
          />
          <label className="flex items-center gap-2 rounded-md bg-[#2b2c32] px-4 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={includeExam}
              onChange={(event) => setIncludeExam(event.target.checked)}
              className="h-4 w-4 accent-zinc-500"
            />
            Exam
          </label>
          <label className="flex items-center gap-2 rounded-md bg-[#2b2c32] px-4 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={includeCa}
              onChange={(event) => setIncludeCa(event.target.checked)}
              className="h-4 w-4 accent-zinc-500"
            />
            CA
          </label>
          <button
            onClick={handleAdd}
            className="calc-btn calc-btn--primary ml-auto cursor-pointer"
          >
            Add module
          </button>
        </div>
      </div>
    </div>
  );
}
