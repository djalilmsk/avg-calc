import ModulesMobileList from "./components/ModulesMobileList";
import ModulesTable from "./components/ModulesTable";
import SummaryBar from "./components/SummaryBar";
import { useSemesterCalculator } from "./hooks/useSemesterCalculator";

export default function SemesterAverageApp() {
  const { computed, actions } = useSemesterCalculator();

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
      <div className="flex-1 overflow-y-auto px-3 pb-44 sm:px-7 sm:pb-36 w-full">
        <div className="mx-auto max-w-full">
          <ModulesTable
            rows={computed.perRow}
            onUpdateRow={actions.updateRow}
            onRemoveRow={actions.removeRow}
          />

          <ModulesMobileList
            rows={computed.perRow}
            onUpdateRow={actions.updateRow}
            onRemoveRow={actions.removeRow}
          />

          <SummaryBar
            sumCoef={computed.sumCoef}
            semesterAvg={computed.semesterAvg}
            rows={computed.perRow}
          />
        </div>
      </div>
    </div>
  );
}
