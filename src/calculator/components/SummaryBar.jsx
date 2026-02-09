function EmptyValue({ value }) {
  return <>{value === "" ? "-" : value}</>;
}

export default function SummaryBar({ sumCoef, semesterAvg }) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="stat-chip">
        <span className="font-semibold text-slate-100">Total counted coef:</span> {sumCoef || 0}
      </div>

      <div className="w-full rounded-xl border border-[#4a4a4a] bg-[#2a2a2f] px-5 py-3 text-slate-100 sm:w-auto">
        <div className="text-sm font-semibold text-slate-300">Semester average</div>
        <div className="text-2xl font-bold">
          <EmptyValue value={semesterAvg} />
        </div>
      </div>
    </div>
  );
}
