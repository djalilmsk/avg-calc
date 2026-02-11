import {
  CalcButton,
  CalcInput,
  CalcLabel,
  SoftPanel,
  WarningBox,
} from "@/components/ui/calc-ui";

export default function WeightsForm({
  examWeight,
  caWeight,
  onExamWeightChange,
  onCaWeightChange,
  onNormalize,
  showWarning
}) {
  return (
    <>
      <SoftPanel className="mt-6 grid grid-cols-1 items-end gap-4 rounded-2xl p-4 sm:grid-cols-3">
        <div>
          <CalcLabel className="block">Exam weight</CalcLabel>
          <CalcInput
            type="number"
            step="0.01"
            value={examWeight}
            onChange={(event) => onExamWeightChange(event.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <CalcLabel className="block">TD weight</CalcLabel>
          <CalcInput
            type="number"
            step="0.01"
            value={caWeight}
            onChange={(event) => onCaWeightChange(event.target.value)}
            className="mt-1"
          />
        </div>

        <CalcButton
          onClick={onNormalize}
          variant="primary"
          className="cursor-pointer"
          title="Make (Exam + TD) = 1"
        >
          Normalize weights
        </CalcButton>
      </SoftPanel>

      {!showWarning && (
        <WarningBox className="mt-3 px-4 py-3 text-sm">
          Warning: Exam + TD weights should equal 1 (example: 0.6 + 0.4).
        </WarningBox>
      )}
    </>
  );
}
