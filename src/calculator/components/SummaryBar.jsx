import ayayay from "@/assets/ayayay-didine.gif";

function EmptyValue({ value }) {
  const displayValue = value === "" ? "-" : value;
  const isLow = value !== "" && Number(value) < 10;
  return <span className={isLow ? "text-red-500" : ""}>{displayValue}</span>;
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
      <div className="stat-chip">
        <span className="font-semibold text-slate-100">
          Total counted coef:
        </span>{" "}
        {sumCoef || 0}
      </div>

      {isLowAverage && (
        <img
          src={ayayay}
          alt="Low average reaction"
          className="size-34 rounded object-cover max-md:hidden"
          loading="lazy"
        />
      )}

      <div className="w-full rounded-xl border border-[#4a4a4a] bg-[#2a2a2f] px-5 py-3 text-slate-100 sm:w-auto flex justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-300">
            Semester average
          </div>
          <div className="flex flex-col items-start gap-2 text-2xl font-bold">
            <EmptyValue value={semesterAvg} />
            {isLowAverage && (
              <>
                <br />
                <div className="text-red-500 text-sm font-semibold">
                  Rattrapage Yonadi <span className="text-xl">💔</span>
                </div>
              </>
            )}
          </div>
        </div>
        {isLowAverage && (
          <img
            src={ayayay}
            alt="Low average reaction"
            className="size-34 rounded object-cover md:hidden"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
