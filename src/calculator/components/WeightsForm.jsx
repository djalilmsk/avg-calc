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
      <div className="soft-panel mt-6 grid grid-cols-1 items-end gap-4 rounded-2xl p-4 sm:grid-cols-3">
        <div>
          <label className="calc-label block">Exam weight</label>
          <input
            type="number"
            step="0.01"
            value={examWeight}
            onChange={(event) => onExamWeightChange(event.target.value)}
            className="calc-input mt-1"
          />
        </div>

        <div>
          <label className="calc-label block">TD weight</label>
          <input
            type="number"
            step="0.01"
            value={caWeight}
            onChange={(event) => onCaWeightChange(event.target.value)}
            className="calc-input mt-1"
          />
        </div>

        <button
          onClick={onNormalize}
          className="calc-btn calc-btn--primary cursor-pointer"
          title="Make (Exam + TD) = 1"
        >
          Normalize weights
        </button>
      </div>

      {!showWarning && (
        <div className="warning-box mt-3 px-4 py-3 text-sm">
          Warning: Exam + TD weights should equal 1 (example: 0.6 + 0.4).
        </div>
      )}
    </>
  );
}
