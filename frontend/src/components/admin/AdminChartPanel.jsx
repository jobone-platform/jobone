import React, { useState, useMemo } from "react";
import { BarChart3, TrendingUp } from "lucide-react";

export default function AdminChartPanel({ jobs = [], applicationsCount = 0 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Group real jobs by sector / category to form real paired series
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
  const totalJobsCount = jobs.length;
  const totalActiveCount = jobs.filter((j) => j.status === "active").length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-7 transition-colors flex flex-col justify-between h-full min-h-[400px]">
      {/* ─── Header: Title, Metric pill, and Legend ─────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Statistics
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
              <TrendingUp size={12} /> {totalActiveCount} Active of {totalJobsCount}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Industry distribution of platform postings
          </p>
        </div>

        {/* Legend matching reference aesthetic: Black and light-grey series */}
        <div className="flex items-center gap-4 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-slate-950 dark:bg-white shadow-xs" />
            <span>Total Jobs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-sm bg-slate-300 dark:bg-slate-700" />
            <span>Active</span>
          </div>
        </div>
      </div>

      {/* ─── SVG / CSS Grouped Bar Chart ────────────────────────────── */}
      <div className="relative flex-1 flex flex-col justify-end pt-8 pb-2">
        {/* Horizontal grid lines & Y-Axis values */}
        <div className="absolute inset-x-0 top-8 bottom-8 flex flex-col justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 w-4 text-right">{maxVal}</span>
            <div className="flex-1 border-b border-dashed border-slate-200/80 dark:border-slate-800" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 w-4 text-right">{Math.round(maxVal / 2)}</span>
            <div className="flex-1 border-b border-dashed border-slate-200/80 dark:border-slate-800" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 w-4 text-right">0</span>
            <div className="flex-1 border-b border-slate-200 dark:border-slate-800" />
          </div>
        </div>

        {/* Bars Container with explicit heights so percentages resolve cleanly */}
        <div className="relative z-10 flex items-end justify-between gap-2 sm:gap-5 h-56 sm:h-64 pl-6 pr-2">
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
                  <div className="absolute -top-12 z-20 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in duration-150">
                    <span className="opacity-80">{d.label}: </span>
                    <span>{d.total} total</span>
                    <span className="opacity-75"> ({d.active} active)</span>
                  </div>
                )}

                {/* Grouped Bar Pair — Explicit full container height */}
                <div className="flex-1 h-full w-full flex items-end justify-center gap-1.5 sm:gap-2.5 pb-1">
                  {/* Bar 1: Total Jobs (Black / White) */}
                  <div
                    style={{ height: `${Math.max(hTotal, 5)}%` }}
                    className="w-3 sm:w-5 rounded-t-md bg-slate-950 dark:bg-white transition-all duration-300 group-hover:scale-y-105 origin-bottom relative shadow-xs"
                  >
                    {isHovered && d.total > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-900 dark:text-white">
                        {d.total}
                      </span>
                    )}
                  </div>

                  {/* Bar 2: Active Jobs (Muted Grey) */}
                  <div
                    style={{ height: `${Math.max(hActive, 5)}%` }}
                    className="w-3 sm:w-5 rounded-t-md bg-slate-300 dark:bg-slate-700 transition-all duration-300 group-hover:scale-y-105 origin-bottom relative shadow-xs"
                  >
                    {isHovered && d.active > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-500 dark:text-slate-400">
                        {d.active}
                      </span>
                    )}
                  </div>
                </div>

                {/* X-axis label beneath */}
                <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 mt-2 truncate w-full text-center group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
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
