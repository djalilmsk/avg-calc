import ayayay from "@/assets/ayayay-didine.gif";
import { StatChip } from "@/components/ui/calc-ui";

function EmptyValue({ value }) {
  const displayValue = value === "" ? "-" : value;
  const isLow = value !== "" && Number(value) < 10;
  return <span className={isLow ? "text-destructive" : ""}>{displayValue}</span>;
}

export default function SummaryBar({ sumCoef, semesterAvg, rows = [] }) {
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
  const isLowAverage =
    semesterAvg !== "" && Number(semesterAvg) < 10 && allFieldsFilled;

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <StatChip>
        <span className="font-semibold text-foreground">Total counted coef:</span>{" "}
        {sumCoef || 0}
      </StatChip>

      {isLowAverage && (
        <img
          src={ayayay}
          alt="Low average reaction"
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
        {isLowAverage && (
          <img
            src={ayayay}
            alt="Low average reaction"
            className="size-34 rounded-[var(--radius-md)] object-cover md:hidden"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
