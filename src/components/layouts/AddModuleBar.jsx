import { useState, forwardRef } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  CalcButton,
  CalcCheckChip,
  CalcInput,
  CalcInputAdd,
  SoftIconButton,
} from "@/components/ui/calc-ui";

function clampToRange(value, min, max, fallback = min) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}

function roundTo2(value) {
  return Math.round(value * 100) / 100;
}

const AddModuleBar = forwardRef(function AddModuleBar(
  { onAdd, className = "" },
  ref,
) {
  const { open, isMobile } = useSidebar();
  const [isMobileComposerOpen, setIsMobileComposerOpen] = useState(false);
  const [name, setName] = useState("");
  const [coef, setCoef] = useState(1);
  const [examWeight, setExamWeight] = useState(0.6);
  const [caWeight, setCaWeight] = useState(0.4);
  const [includeExam, setIncludeExam] = useState(true);
  const [includeCa, setIncludeCa] = useState(true);
  const lockWeights = !includeExam || !includeCa;

  function handleIncludeExamChange(checked) {
    if (!checked) {
      setIncludeExam(false);
      setIncludeCa(true);
      setExamWeight(0);
      setCaWeight(1);
      return;
    }

    setIncludeExam(true);
    if (!includeCa) {
      setIncludeCa(true);
      setExamWeight(0.6);
      setCaWeight(0.4);
    }
  }

  function handleIncludeCaChange(checked) {
    if (!checked) {
      setIncludeCa(false);
      setIncludeExam(true);
      setExamWeight(1);
      setCaWeight(0);
      return;
    }

    setIncludeCa(true);
    if (!includeExam) {
      setIncludeExam(true);
      setExamWeight(0.6);
      setCaWeight(0.4);
    }
  }

  function handleExamWeightChange(rawValue) {
    const nextExam = roundTo2(clampToRange(rawValue, 0, 1, 0));
    const nextTd = roundTo2(1 - nextExam);
    setExamWeight(nextExam);
    setCaWeight(nextTd);
  }

  function handleTdWeightChange(rawValue) {
    const nextTd = roundTo2(clampToRange(rawValue, 0, 1, 0));
    const nextExam = roundTo2(1 - nextTd);
    setCaWeight(nextTd);
    setExamWeight(nextExam);
  }

  function handleNameInputKeyDown(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleAdd();
  }

  function handleComposerInputKeyDown(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleAdd();
  }

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;

    const nextExamWeight = includeExam
      ? includeCa
        ? clampToRange(examWeight, 0, 1, 0.6)
        : 1
      : 0;
    const nextCaWeight = includeCa
      ? includeExam
        ? clampToRange(caWeight, 0, 1, 0.4)
        : 1
      : 0;

    onAdd({
      name: trimmed,
      coef,
      examWeight: nextExamWeight,
      caWeight: nextCaWeight,
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
      <SoftIconButton
        onClick={() => setIsMobileComposerOpen(true)}
        className="fixed right-5 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex size-12 items-center justify-center rounded-full bg-sidebar/95 text-xl font-semibold backdrop-blur"
        aria-label="Open add module bar"
        title="Add module"
      >
        +
      </SoftIconButton>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "fixed right-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 transition-[left,bottom,transform] duration-200 ease-linear px-4",
        className,
      )}
      style={{ left: !isMobile && open ? "var(--sidebar-width)" : "0px" }}
    >
      <div className="mx-auto w-full max-w-7xl px-3">
        <div className="w-full rounded-[var(--radius-2xl)] border border-border bg-card/95 p-2 backdrop-blur sm:p-3">
          {isMobile ? (
            <div className="flex w-full flex-col gap-2">
              <CalcInputAdd
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={handleNameInputKeyDown}
                placeholder="Module name"
                className="w-full"
              />
              <CalcInput
                type="number"
                step="1"
                value={coef}
                onChange={(event) => setCoef(event.target.value)}
                onKeyDown={handleComposerInputKeyDown}
                placeholder="Coef"
                className="w-full"
              />
              <div className="grid grid-cols-2 gap-2">
                <CalcInput
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={examWeight}
                  onChange={(event) =>
                    handleExamWeightChange(event.target.value)
                  }
                  onKeyDown={handleComposerInputKeyDown}
                  placeholder="Per Ex"
                  disabled={lockWeights}
                  className="w-full"
                />
                <CalcInput
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={caWeight}
                  onChange={(event) => handleTdWeightChange(event.target.value)}
                  onKeyDown={handleComposerInputKeyDown}
                  placeholder="Per TD"
                  disabled={lockWeights}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <CalcCheckChip>
                  <input
                    type="checkbox"
                    checked={includeExam}
                    onChange={(event) =>
                      handleIncludeExamChange(event.target.checked)
                    }
                    className="mr-1 size-5 rounded-full accent-muted-foreground"
                  />
                  is Exam
                </CalcCheckChip>
                <CalcCheckChip>
                  <input
                    type="checkbox"
                    checked={includeCa}
                    onChange={(event) =>
                      handleIncludeCaChange(event.target.checked)
                    }
                    className="mr-1 size-5 rounded-full accent-muted-foreground"
                  />
                  is TD
                </CalcCheckChip>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <CalcButton
                  onClick={() => setIsMobileComposerOpen(false)}
                  variant="soft"
                  className="cursor-pointer"
                  aria-label="Close add module bar"
                >
                  Close
                </CalcButton>
                <CalcButton
                  onClick={handleAdd}
                  variant="primary"
                  className="cursor-pointer"
                >
                  +
                </CalcButton>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-wrap items-center gap-2">
              <CalcInputAdd
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={handleNameInputKeyDown}
                placeholder="Module name"
                className="min-w-[100px] flex-[999_1_100px]"
              />
              <CalcInput
                type="number"
                step="1"
                value={coef}
                onChange={(event) => setCoef(event.target.value)}
                onKeyDown={handleComposerInputKeyDown}
                placeholder="Coef"
                className="min-w-0 flex-[1_1_84px]"
              />
              <CalcInput
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={examWeight}
                onChange={(event) => handleExamWeightChange(event.target.value)}
                onKeyDown={handleComposerInputKeyDown}
                placeholder="Ex W"
                disabled={lockWeights}
                className="min-w-0 flex-[1_1_84px]"
              />
              <CalcInput
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={caWeight}
                onChange={(event) => handleTdWeightChange(event.target.value)}
                onKeyDown={handleComposerInputKeyDown}
                placeholder="TD W"
                disabled={lockWeights}
                className="min-w-0 flex-[1_1_84px]"
              />
              <CalcCheckChip>
                <input
                  type="checkbox"
                  checked={includeExam}
                  onChange={(event) =>
                    handleIncludeExamChange(event.target.checked)
                  }
                  className="mr-1 size-5 rounded-full accent-muted-foreground"
                />
                Ex
              </CalcCheckChip>
              <CalcCheckChip>
                <input
                  type="checkbox"
                  checked={includeCa}
                  onChange={(event) =>
                    handleIncludeCaChange(event.target.checked)
                  }
                  className="mr-1 size-5 rounded-full accent-muted-foreground"
                />
                TD
              </CalcCheckChip>
              <CalcButton
                onClick={handleAdd}
                variant="primary"
                className="ml-auto cursor-pointer"
              >
                +
              </CalcButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default AddModuleBar;
