import React, { useState, useMemo } from "react";
import { BarChart3, TrendingUp, Layers } from "lucide-react";

export default function AdminChartPanel({ jobs = [] }) {
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
  const activeRate = totalJobsCount > 0 ? Math.round((totalActiveCount / totalJobsCount) * 100) : 0;

  return (
    <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-xs p-5 sm:p-6 transition-colors flex flex-col justify-between h-full min-h-[360px] sm:min-h-[420px]">
      {/* ─── Header: Title, Metric pill, and Legend ─────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-[var(--theme-border)]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)]">
              <BarChart3 size={15} />
            </div>
            <h3 className="text-base sm:text-lg font-bold font-display tracking-tight text-[var(--theme-text)]">
              Industry Distribution
            </h3>
            <span className="text-[10px] sm:text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] flex items-center gap-1.5">
              <TrendingUp size={11} className="text-[#C0C0C0]" /> {totalActiveCount} Active of {totalJobsCount} ({activeRate}%)
            </span>
          </div>
          <p className="text-xs text-[var(--theme-text-muted)] mt-1.5">
            Postings segmented by vertical with live operational health
          </p>
        </div>

        {/* Monochromatic Legend: Black/White and Silver series */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-[var(--theme-text-muted)]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[var(--theme-text)] shadow-xs border border-[var(--theme-border-silver)]" />
            <span className="text-[var(--theme-text)] font-semibold">Total Postings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#C0C0C0] opacity-80" />
            <span>Active Listings</span>
          </div>
        </div>
      </div>

      {/* ─── SVG / CSS Grouped Bar Chart ────────────────────────────── */}
      <div className="relative flex-1 flex flex-col justify-end pt-8 pb-2">
        {/* Horizontal grid lines & Y-Axis values */}
        <div className="absolute inset-x-0 top-8 bottom-8 flex flex-col justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[var(--theme-text-muted)] w-4 text-right">{maxVal}</span>
            <div className="flex-1 border-b border-dashed border-[var(--theme-border)] opacity-60" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[var(--theme-text-muted)] w-4 text-right">{Math.round(maxVal / 2)}</span>
            <div className="flex-1 border-b border-dashed border-[var(--theme-border)] opacity-60" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[var(--theme-text-muted)] w-4 text-right">0</span>
            <div className="flex-1 border-b border-[var(--theme-border)]" />
          </div>
        </div>

        {/* Bars Container with explicit heights so percentages resolve cleanly */}
        <div className="relative z-10 flex items-end justify-between gap-1 sm:gap-3 md:gap-5 h-48 sm:h-56 md:h-64 pl-6 pr-2">
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
                  <div className="absolute -top-12 z-20 px-3 py-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] text-xs font-medium shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in duration-150">
                    <span className="text-[var(--theme-text-muted)]">{d.label}: </span>
                    <span className="font-mono font-bold text-[var(--theme-text)]">{d.total} total</span>
                    <span className="text-[var(--theme-text-muted)] font-mono"> ({d.active} active)</span>
                  </div>
                )}

                {/* Grouped Bar Pair */}
                <div className="flex-1 h-full w-full flex items-end justify-center gap-1 sm:gap-2 md:gap-2.5 pb-1">
                  {/* Bar 1: Total Jobs (High-contrast theme-text) */}
                  <div
                    style={{ height: `${Math.max(hTotal, 4)}%` }}
                    className="w-2 sm:w-3.5 md:w-5 rounded-t-sm bg-[var(--theme-text)] transition-all duration-300 group-hover:brightness-110 origin-bottom relative shadow-xs"
                  >
                    {isHovered && d.total > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-[var(--theme-text)]">
                        {d.total}
                      </span>
                    )}
                  </div>

                  {/* Bar 2: Active Jobs (Silver accent) */}
                  <div
                    style={{ height: `${Math.max(hActive, 4)}%` }}
                    className="w-2 sm:w-3.5 md:w-5 rounded-t-sm bg-[#C0C0C0] dark:bg-[#A0A0A0] transition-all duration-300 group-hover:brightness-110 origin-bottom relative shadow-xs"
                  >
                    {isHovered && d.active > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-[#C0C0C0]">
                        {d.active}
                      </span>
                    )}
                  </div>
                </div>

                {/* X-axis label beneath */}
                <span className="text-[10px] sm:text-xs font-mono text-[var(--theme-text-muted)] mt-2.5 truncate w-full text-center group-hover:text-[var(--theme-text)] transition-colors">
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
