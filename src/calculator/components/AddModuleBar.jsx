import { useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";

export default function AddModuleBar({ onAdd }) {
  const { open, isMobile } = useSidebar();
  const [isMobileComposerOpen, setIsMobileComposerOpen] = useState(false);
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

  if (isMobile && !isMobileComposerOpen) {
    return (
      <button
        onClick={() => setIsMobileComposerOpen(true)}
        className="fixed right-5 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex size-12 items-center justify-center border border-[#3a3a3a] bg-[#16171a]/95 text-xl font-semibold text-zinc-100 backdrop-blur rounded-full"
        aria-label="Open add module bar"
        title="Add module"
      >
        +
      </button>
    );
  }

  return (
    <div
      className="fixed right-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 transition-[left] duration-200 ease-linear"
      style={{ left: !isMobile && open ? "var(--sidebar-width)" : "0px" }}
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-7">
        <div className="w-full rounded-xl border border-[#333] bg-[#1f2024]/95 p-2 backdrop-blur sm:rounded-full sm:p-3 sm:px-6">
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
              className="calc-input col-span-2 md:col-span-1"
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
            <label className="flex items-center gap-2 rounded-lg bg-[#2b2c32] px-4 text-sm text-zinc-300 min-h-11">
              <input
                type="checkbox"
                checked={includeExam}
                onChange={(event) => setIncludeExam(event.target.checked)}
                className="size-5 mr-1 accent-zinc-500 rounded-full"
              />
              Exam
            </label>
            <label className="flex items-center gap-2 rounded-lg bg-[#2b2c32] px-4 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={includeCa}
                onChange={(event) => setIncludeCa(event.target.checked)}
                className="size-5 mr-1 accent-zinc-500 rounded-full"
              />
              CA
            </label>
            {isMobile && (
              <button
                onClick={() => setIsMobileComposerOpen(false)}
                className="calc-btn calc-btn--soft cursor-pointer"
                aria-label="Close add module bar"
              >
                Close
              </button>
            )}
            <button
              onClick={handleAdd}
              className="calc-btn calc-btn--primary ml-auto cursor-pointer max-sm:w-full"
            >
              Add module
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
