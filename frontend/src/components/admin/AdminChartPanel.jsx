import React, { useState, useMemo } from "react";

export default function AdminChartPanel({ jobs = [], applicationsCount = 0 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Group actual jobs by sector / category to form real paired series
  const chartData = useMemo(() => {
    const categoriesMap = {};
    const defaultSectors = [
      "Tech",
      "Finance",
      "Sales",
      "Health",
      "Engineering",
      "Operations",
      "Support",
    ];

    defaultSectors.forEach((sec) => {
      categoriesMap[sec] = { label: sec, total: 0, active: 0 };
    });

    jobs.forEach((job) => {
      const ind = (job.industry || job.category || "").toLowerCase();
      let matched = "Other";

      if (ind.includes("tech") || ind.includes("it") || ind.includes("soft")) matched = "Tech";
      else if (ind.includes("fin") || ind.includes("bank")) matched = "Finance";
      else if (ind.includes("sale") || ind.includes("market")) matched = "Sales";
      else if (ind.includes("health") || ind.includes("pharm")) matched = "Health";
      else if (ind.includes("eng") || ind.includes("manu")) matched = "Engineering";
      else if (ind.includes("oper") || ind.includes("logist")) matched = "Operations";
      else if (ind.includes("supp") || ind.includes("cust")) matched = "Support";

      if (!categoriesMap[matched]) {
        categoriesMap[matched] = { label: matched, total: 0, active: 0 };
      }

      categoriesMap[matched].total += 1;
      if (job.status === "active") {
        categoriesMap[matched].active += 1;
      }
    });

    const list = Object.values(categoriesMap).filter((d) => d.label !== "Other" || d.total > 0);
    return list.slice(0, 7);
  }, [jobs]);

  const maxVal = Math.max(...chartData.map((d) => Math.max(d.total, d.active)), 4);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-7 transition-colors flex flex-col justify-between h-full min-h-[380px]">
      {/* Header: Title on left, simple legend on right */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Statistics
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Industry distribution of platform postings
          </p>
        </div>

        {/* Legend matching reference: Black and light-grey series */}
        <div className="flex items-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-xs bg-slate-950 dark:bg-slate-100" />
            <span>Total Jobs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-xs bg-slate-300 dark:bg-slate-700" />
            <span>Active</span>
          </div>
        </div>
      </div>

      {/* Clean SVG Grouped Bar Chart */}
      <div className="relative flex-1 flex flex-col justify-end pt-4">
        {/* Subtle horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
          <div className="border-b border-dashed border-slate-100 dark:border-slate-800/80 w-full" />
          <div className="border-b border-dashed border-slate-100 dark:border-slate-800/80 w-full" />
          <div className="border-b border-dashed border-slate-100 dark:border-slate-800/80 w-full" />
          <div className="border-b border-slate-200 dark:border-slate-800 w-full" />
        </div>

        {/* Bars Container */}
        <div className="relative z-10 flex items-end justify-between gap-3 sm:gap-6 h-56 sm:h-64 px-3 sm:px-6">
          {chartData.map((d, idx) => {
            const hTotal = Math.round((d.total / maxVal) * 100);
            const hActive = Math.round((d.active / maxVal) * 100);
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={d.label}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Floating tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in duration-150">
                    <span className="text-slate-300">{d.label}: </span>
                    <span>{d.total} total</span>
                    <span className="text-slate-400"> ({d.active} active)</span>
                  </div>
                )}

                {/* Grouped Bar Pair */}
                <div className="flex items-end justify-center gap-1.5 sm:gap-2 w-full">
                  {/* Bar 1: Total Jobs (Black / Dark) */}
                  <div
                    style={{ height: `${Math.max(hTotal, 4)}%` }}
                    className="w-4 sm:w-6 rounded-t-sm bg-slate-950 dark:bg-slate-100 transition-all duration-300 group-hover:opacity-85"
                  />
                  {/* Bar 2: Active Jobs (Light Grey) */}
                  <div
                    style={{ height: `${Math.max(hActive, 4)}%` }}
                    className="w-4 sm:w-6 rounded-t-sm bg-slate-300 dark:bg-slate-700 transition-all duration-300 group-hover:opacity-85"
                  />
                </div>

                {/* X-axis label beneath */}
                <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-2.5 truncate w-full text-center">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
