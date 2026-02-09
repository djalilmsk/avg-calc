import { Trash2 } from "lucide-react";

function EmptyValue({ value }) {
  return <>{value === "" ? "-" : value}</>;
}

export default function ModulesMobileList({ rows, onUpdateRow, onRemoveRow }) {
  return (
    <div className="mt-6 flex flex-col gap-4 md:hidden">
      {rows.map((row, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-2xl bg-[#23252b] p-4">
          <div className="flex items-center gap-3">
            <input
              value={row.name}
              onChange={(event) => onUpdateRow(index, "name", event.target.value)}
              className="calc-input flex-1 font-semibold"
              placeholder="Module name"
            />

            <button
              onClick={() => onRemoveRow(index)}
              className="calc-btn calc-btn--soft flex h-9 w-9 flex-shrink-0 items-center justify-center cursor-pointer px-0"
              title="Remove module"
              aria-label="Remove module"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div>
              <label className="calc-label mb-1 block text-xs">Coef</label>
              <input
                type="number"
                step="1"
                value={row.coef}
                onChange={(event) => onUpdateRow(index, "coef", event.target.value)}
                className="calc-input"
              />
            </div>

            <div>
              <label className="calc-label mb-1 block text-xs">Exam</label>
              <input
                type="number"
                step="0.01"
                value={row.exam}
                onChange={(event) => onUpdateRow(index, "exam", event.target.value)}
                className="calc-input"
              />
            </div>

            <div>
              <label className="calc-label mb-1 block text-xs">CA</label>
              <input
                type="number"
                step="0.01"
                value={row.ca}
                onChange={(event) => onUpdateRow(index, "ca", event.target.value)}
                className="calc-input col-span-2 sm:col-span-1"
              />
            </div>
            <div>
              <label className="calc-label mb-1 block text-xs">Exam W</label>
              <input
                type="number"
                step="0.01"
                value={row.examWeight}
                onChange={(event) => onUpdateRow(index, "examWeight", event.target.value)}
                className="calc-input"
              />
            </div>
            <div>
              <label className="calc-label mb-1 block text-xs">CA W</label>
              <input
                type="number"
                step="0.01"
                value={row.caWeight}
                onChange={(event) => onUpdateRow(index, "caWeight", event.target.value)}
                className="calc-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 rounded-md bg-[#2b2c32] px-3 py-2 text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={row.includeExam !== false}
                onChange={(event) => onUpdateRow(index, "includeExam", event.target.checked)}
                className="h-4 w-4 cursor-pointer accent-zinc-500"
              />
              Keep Exam
            </label>
            <label className="flex items-center gap-2 rounded-md bg-[#2b2c32] px-3 py-2 text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={row.includeCa !== false}
                onChange={(event) => onUpdateRow(index, "includeCa", event.target.checked)}
                className="h-4 w-4 cursor-pointer accent-zinc-500"
              />
              Keep CA
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-zinc-400">Final Grade</span>
            <span className={`text-lg font-bold ${row.moduleFinal !== "" && row.moduleFinal < 10 ? "text-red-300" : "text-zinc-100"}`}>
              <EmptyValue value={row.moduleFinal} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
