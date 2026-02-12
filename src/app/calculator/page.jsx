import { useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router";
import { Spinner } from "@/components/ui/spinner";
import ModulesMobileList from "./components/ModulesMobileList";
import ModulesTable from "./components/ModulesTable";
import SummaryBar from "./components/SummaryBar";
import SeoHead from "@/components/seo/SeoHead";

function ErrorState({ title, message }) {
  return (
    <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl p-6 text-center">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Link
          to="/"
          className="mt-4 inline-flex rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground hover:bg-accent"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-center px-4">
      <Spinner />
    </div>
  );
}

export default function SemesterAverageApp() {
  const { computed, actions, getHistoryById, selectedHistoryId } =
    useOutletContext();
  const navigate = useNavigate();
  const params = useParams();
  const routeHistoryId = params["template-id"];
  const selectHistoryRef = useRef(actions.selectHistory);

  const routeHistory = useMemo(() => {
    if (!routeHistoryId) return null;
    return getHistoryById(routeHistoryId);
  }, [getHistoryById, routeHistoryId]);
  const isLoadingHistory =
    Boolean(routeHistoryId) &&
    Boolean(routeHistory) &&
    selectedHistoryId !== routeHistoryId;

  useEffect(() => {
    selectHistoryRef.current = actions.selectHistory;
  }, [actions.selectHistory]);

  useEffect(() => {
    if (!routeHistoryId || !routeHistory) return;
    if (selectedHistoryId === routeHistoryId) return;
    selectHistoryRef.current(routeHistoryId);
  }, [routeHistory, routeHistoryId, selectedHistoryId]);

  if (!routeHistoryId) {
    return (
      <>
        <SeoHead
          title="CookedCalc | Calculator Workspace"
          description="Use the CookedCalc workspace to calculate weighted module grades with coefficients, exam/TD weights, and timeline history."
          keywords="semester average calculator, weighted grades, module coefficients, cookedcalc"
        />
        <ErrorState
          title="Missing history id"
          message="No history id was provided in the URL."
        />
      </>
    );
  }

  if (!routeHistory) {
    return (
      <>
        <SeoHead
          title="CookedCalc | History Not Found"
          description="The requested calculator history could not be found in CookedCalc."
          keywords="history not found, cookedcalc"
        />
        <ErrorState
          title="404 History not found"
          message={`History "${routeHistoryId}" does not exist.`}
        />
      </>
    );
  }

  if (isLoadingHistory) {
    return (
      <>
        <SeoHead
          title="CookedCalc | Loading Calculator"
          description="Loading your calculator history in CookedCalc."
        />
        <LoadingState />
      </>
    );
  }

  function handleRemoveRow(index) {
    const rowsCount = computed.perRow.length;
    if (rowsCount <= 1 && routeHistoryId) {
      actions.deleteHistory(routeHistoryId);
      navigate("/");
      return;
    }

    actions.removeRow(index);
  }

  return (
    <>
      <SeoHead
        title={`CookedCalc | ${routeHistory.name} Workspace`}
        description="Compute semester averages with weighted modules, undo/redo timeline, and persistent local history for students and universities."
        keywords="calculator, semester average, weighted grade, undo redo, cookedcalc"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `${routeHistory.name} Workspace`,
            url: `https://cookedcalc.djalilmsk.dev/calc/${routeHistory.id}`,
            description:
              "Calculator workspace for weighted semester average tracking with history timeline.",
            isPartOf: { "@id": "https://cookedcalc.djalilmsk.dev/#website" },
          },
        ]}
      />

      <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
        <div className="flex-1 overflow-y-auto px-3 pb-44 sm:px-7 sm:pb-36 w-full">
          <div className="mx-auto max-w-full">
            <ModulesTable
              rows={computed.perRow}
              onUpdateRow={actions.updateRow}
              onUpdateRowStats={actions.updateRowStats}
              onRemoveRow={handleRemoveRow}
            />

            <ModulesMobileList
              rows={computed.perRow}
              onUpdateRow={actions.updateRow}
              onUpdateRowStats={actions.updateRowStats}
              onRemoveRow={handleRemoveRow}
            />

            <SummaryBar
              sumCoef={computed.sumCoef}
              semesterAvg={computed.semesterAvg}
              rows={computed.perRow}
            />
          </div>
        </div>
      </div>
    </>
  );
}
