import { Trash2 } from "lucide-react";

function EmptyValue({ value }) {
  return <>{value === "" ? "-" : value}</>;
}

export default function ModulesTable({ rows, onUpdateRow, onRemoveRow }) {
  return (
    <div className="mt-6 hidden overflow-x-auto md:block">
      <table className="min-w-[1200px] w-full border-separate [border-spacing:0_10px]">
        <thead>
          <tr>
            <th className="px-4 py-1 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Module
            </th>
            <th className="w-28 px-4 py-1 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Coef
            </th>
            <th className="w-32 px-4 py-1 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Exam
            </th>
            <th className="w-32 px-4 py-1 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              CA
            </th>
            <th className="w-28 px-4 py-1 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Final
            </th>
            <th className="w-28 px-4 py-3"></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="rounded-l-xl px-2">
                <input
                  value={row.name}
                  onChange={(event) =>
                    onUpdateRow(index, "name", event.target.value)
                  }
                  className="calc-input"
                />
              </td>

              <td className="px-2">
                <input
                  type="number"
                  step="1"
                  value={row.coef}
                  onChange={(event) =>
                    onUpdateRow(index, "coef", event.target.value)
                  }
                  className="calc-input"
                />
              </td>

              <td className="px-2 relative">
                <input
                  type="number"
                  step="0.01"
                  value={row.exam}
                  onChange={(event) =>
                    onUpdateRow(index, "exam", event.target.value)
                  }
                  className="calc-input pl-12"
                />
              </td>

              <td className="px-2">
                <input
                  type="number"
                  step="0.01"
                  value={row.ca}
                  onChange={(event) =>
                    onUpdateRow(index, "ca", event.target.value)
                  }
                  className="calc-input"
                />
              </td>

              <td className="px-2">
                <span
                  className={`font-semibold ${
                    row.moduleFinal !== "" && row.moduleFinal < 10
                      ? "text-red-300"
                      : "text-zinc-100"
                  }`}
                >
                  <EmptyValue value={row.moduleFinal} />
                </span>
              </td>

              <td className="rounded-r-xl px-2">
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
