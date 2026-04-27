import { useMemo, useState } from "react";
import { StatChip } from "@/components/ui/calc-ui";
import {
  createReactionPickerState,
  pickNextReaction,
} from "../reactionPicker";

function loadReactionAssets(modules) {
  return Object.entries(modules)
    .sort(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath))
    .map(([, asset]) => asset)
    .filter(Boolean);
}

const UNDER_10_REACTIONS = loadReactionAssets(
  import.meta.glob("../../../assets/result-gifs/under-10/*.{gif,webp}", {
    eager: true,
    import: "default",
  }),
);

const PASSING_REACTIONS = loadReactionAssets(
  import.meta.glob("../../../assets/result-gifs/above-10/*.{gif,webp}", {
    eager: true,
    import: "default",
  }),
);

const REACTION_GROUPS = {
  low: UNDER_10_REACTIONS,
  passing: PASSING_REACTIONS,
};
const NO_REACTIONS = [];

function EmptyValue({ value }) {
  const displayValue = value === "" ? "-" : value;
  const isLow = value !== "" && Number(value) < 10;
  return <span className={isLow ? "text-destructive" : ""}>{displayValue}</span>;
}

export default function SummaryBar({ sumCoef, semesterAvg, rows = [] }) {
  const [pickerState] = useState(createReactionPickerState);
  const allFieldsFilled =
    rows.length > 0 &&
    rows.every((row) => {
      const hasName = String(row.name ?? "").trim() !== "";
      const hasCoef = String(row.coef ?? "").trim() !== "";
      const hasExam =
        row.includeExam === false || String(row.exam ?? "").trim() !== "";
      const hasTd =
        row.includeCa === false || String(row.ca ?? "").trim() !== "";
      return hasName && hasCoef && hasExam && hasTd;
    });
  const semesterAvgNumber = Number(semesterAvg);
  const hasCompleteAverage =
    semesterAvg !== "" && Number.isFinite(semesterAvgNumber) && allFieldsFilled;
  const isLowAverage = hasCompleteAverage && semesterAvgNumber < 10;
  const isPassingAverage = hasCompleteAverage && semesterAvgNumber >= 10;
  const reactionKind = isLowAverage
    ? "low"
    : isPassingAverage
      ? "passing"
      : null;
  const reactionCandidates = reactionKind
    ? REACTION_GROUPS[reactionKind]
    : NO_REACTIONS;
  const selectionKey = reactionKind ? `${reactionKind}:${semesterAvg}` : "";

  const reactionGif = useMemo(() => {
    if (!selectionKey || !reactionKind) return null;

    return pickNextReaction(reactionCandidates, pickerState);
  }, [pickerState, reactionCandidates, reactionKind, selectionKey]);
  const reactionAlt = isLowAverage
    ? "Low average reaction"
    : "Passing average reaction";

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <StatChip>
        <span className="font-semibold text-foreground">Total counted coef:</span>{" "}
        {sumCoef || 0}
      </StatChip>

      {reactionGif && (
        <img
          src={reactionGif}
          alt={reactionAlt}
          className="size-34 rounded-[var(--radius-md)] object-cover max-md:hidden"
          loading="lazy"
        />
      )}

      <div className="flex w-full justify-between rounded-[var(--radius-xl)] border border-border bg-secondary px-5 py-3 text-foreground sm:w-auto">
        <div>
          <div className="text-sm font-semibold text-muted-foreground">
            Semester average
          </div>
          <div className="flex flex-col items-start gap-2 text-2xl font-bold">
            <EmptyValue value={semesterAvg} />
            {isLowAverage && (
              <>
                <br />
                <div className="text-sm font-semibold text-destructive">
                  Rattrapage Yonadi (heartbreak)
                </div>
              </>
            )}
          </div>
        </div>
        {reactionGif && (
          <img
            src={reactionGif}
            alt={reactionAlt}
            className="size-34 rounded-[var(--radius-md)] object-cover md:hidden"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
