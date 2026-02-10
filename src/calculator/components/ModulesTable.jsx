import { Trash2 } from "lucide-react";
import { useRef } from "react";

function EmptyValue({ value }) {
  return <>{value === "" ? "-" : value}</>;
}

export default function ModulesTable({ rows, onUpdateRow, onRemoveRow }) {
  const examRefs = useRef([]);
  const caRefs = useRef([]);

  function handleTabNavigation(event, rowIndex, field) {
    if (event.key !== "Tab") return;

    if (!event.shiftKey) {
      if (field === "ca") {
        event.preventDefault();
        examRefs.current[rowIndex]?.focus();
        return;
      }

      if (field === "exam" && rowIndex < rows.length - 1) {
        event.preventDefault();
        caRefs.current[rowIndex + 1]?.focus();
      }
      return;
    }

    if (field === "exam") {
      event.preventDefault();
      caRefs.current[rowIndex]?.focus();
      return;
    }

    if (field === "ca" && rowIndex > 0) {
      event.preventDefault();
      examRefs.current[rowIndex - 1]?.focus();
    }
  }

  return (
    <div className="mt-6 hidden overflow-x-auto md:block">
      <table className="w-full min-w-140 table-fixed border-separate [border-spacing:0_10px]">
        <thead>
          <tr>
            <th className="py-1 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Module
            </th>
            <th className="w-[12%] px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Coef
            </th>
            <th className="w-[12%] px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              TD
            </th>
            <th className="w-[12%] px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Exam
            </th>
            <th className="w-[8%] px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Final
            </th>
            <th className="w-13 px-2 py-3"></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="rounded-l-xl pr-2">
                <input
                  value={row.name}
                  onChange={(event) =>
                    onUpdateRow(index, "name", event.target.value)
                  }
                  className="calc-input min-w-0"
                />
              </td>

              <td className="px-1">
                <input
                  type="number"
                  step="1"
                  value={row.coef}
                  onChange={(event) =>
                    onUpdateRow(index, "coef", event.target.value)
                  }
                  className="calc-input min-w-0"
                />
              </td>

              <td className="px-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={row.ca}
                  onChange={(event) =>
                    onUpdateRow(index, "ca", event.target.value)
                  }
                  disabled={row.includeCa === false}
                  ref={(el) => {
                    caRefs.current[index] = el;
                  }}
                  onKeyDown={(event) => handleTabNavigation(event, index, "ca")}
                  className={`calc-input min-w-0 ${
                    row.includeCa === false ? "opacity-40" : ""
                  }`}
                />
              </td>

              <td className="px-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={row.exam}
                  onChange={(event) =>
                    onUpdateRow(index, "exam", event.target.value)
                  }
                  disabled={row.includeExam === false}
                  ref={(el) => {
                    examRefs.current[index] = el;
                  }}
                  onKeyDown={(event) => handleTabNavigation(event, index, "exam")}
                  className={`calc-input min-w-0 ${
                    row.includeExam === false ? "opacity-40" : ""
                  }`}
                />
              </td>

              <td className="px-1">
                <span
                  className={`font-semibold pl-3 ${
                    row.moduleFinal !== "" && row.moduleFinal < 10
                      ? "text-red-300"
                      : "text-zinc-100"
                  }`}
                >
                  <EmptyValue value={row.moduleFinal} />
                </span>
              </td>

              <td className="rounded-r-xl pl-2">
                <button
                  onClick={() => onRemoveRow(index)}
                  className="rounded-lg calc-btn--soft ml-auto flex h-9 w-9  aspect-square  items-center justify-center cursor-pointer p-0"
                  title="Remove module"
                  aria-label="Remove module"
                >
                  <Trash2 className="size-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
