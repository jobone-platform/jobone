import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Maximize2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import KPIWidgetSparkline from "./KPIWidgetSparkline";

export default function KPIWidgetCard({
  widget,
  displayMode = "detailed", // "compact" or "detailed"
  onClick,
  onMaximize,
  loading = false,
  className = "",
}) {
  const [isHovered, setIsHovered] = useState(false);

  if (loading || !widget) {
    return (
      <div className="p-3.5 sm:p-4 lg:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse h-full min-h-[205px] sm:min-h-[215px] flex flex-col justify-between shadow-xs w-full min-w-0 box-border">
        <div className="flex justify-between items-center">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0"></div>
          <div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
        </div>
        <div className="my-2">
          <div className="h-7 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2"></div>
          <div className="h-3.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-auto"></div>
      </div>
    );
  }

  const {
    id,
    title,
    primaryValue,
    icon: Icon,
    color = "#3b82f6",
    iconBg,
    iconColor,
    badge,
    badgeVariant = "info",
    trendText,
    isPositiveTrend,
    secondaryMetric,
    progressPercentage,
    sparklineData = [],
  } = widget;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick && onClick()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/5 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between cursor-pointer p-3.5 sm:p-4 lg:p-5 overflow-hidden select-none w-full h-full min-w-0 box-border ${
        displayMode === "compact"
          ? "min-h-[140px]"
          : "min-h-[205px] sm:min-h-[215px]"
      } ${className}`}
    >
      {/* Top Accent Illumination Line on Hover */}
      <div
        style={{ backgroundColor: color }}
        className="absolute top-0 inset-x-6 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
      />

      {/* ─── Top Row: Icon + Badge + Maximize Button ────────────────── */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 min-w-0 w-full">
        {/* Icon Container with subtle scale on hover */}
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 shadow-xs ${iconBg} ${iconColor}`}
        >
          {Icon && <Icon size={19} className="sm:w-5 sm:h-5" />}
        </div>

        {/* Right Action & Badge Container: Safe Flex with zero overflow */}
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 justify-end shrink">
          {badge && (
            <span
              title={typeof badge === "string" ? badge : undefined}
              className={`text-[10px] sm:text-[11px] font-black px-2 sm:px-2.5 py-0.5 rounded-full truncate max-w-[85px] sm:max-w-[120px] shrink inline-block ${
                badgeVariant === "warning"
                  ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  : badgeVariant === "danger"
                  ? "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              {badge}
            </span>
          )}

          {/* Maximize Icon Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onMaximize) onMaximize(widget);
            }}
            title="Maximize widget analytics"
            aria-label="Maximize widget"
            className="p-1 sm:p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer opacity-70 group-hover:opacity-100 shrink-0"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* ─── Middle Section: Metric & Sparkline ─────────────────────── */}
      <div className="my-2 min-w-0 w-full">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 min-w-0">
          <p className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none shrink-0 min-w-0">
            {typeof primaryValue === "number" ? primaryValue.toLocaleString() : primaryValue}
          </p>

          {/* Trend Tag */}
          {trendText && (
            <span
              title={trendText}
              className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold min-w-0 truncate max-w-[110px] ${
                isPositiveTrend
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {isPositiveTrend && <TrendingUp size={11} className="shrink-0" />}
              <span className="truncate">{trendText}</span>
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors min-w-0">
          {title}
        </p>

        {/* Detailed Mode: Mini Sparkline (consistent height container across all cards) */}
        {displayMode === "detailed" && (
          <div className="mt-2 pt-1 h-7 flex items-center w-full min-w-0">
            {sparklineData && sparklineData.length > 1 ? (
              <KPIWidgetSparkline
                data={sparklineData}
                color={color}
                height={26}
              />
            ) : (
              <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800" />
            )}
          </div>
        )}
      </div>

      {/* ─── Bottom Row: Secondary Metric or Progress Bar ───────────── */}
      {displayMode === "detailed" && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-auto min-w-0 w-full">
          {progressPercentage !== undefined && progressPercentage !== null ? (
            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 gap-1.5 min-w-0">
                <span
                  className="truncate min-w-0"
                  title={secondaryMetric || "Progress"}
                >
                  {secondaryMetric || "Rate"}
                </span>
                <span className="shrink-0 text-slate-500 dark:text-slate-400 font-semibold">
                  {progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  style={{ width: `${Math.min(progressPercentage, 100)}%`, backgroundColor: color }}
                  className="h-full rounded-full transition-all duration-500"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 min-w-0 gap-1.5">
              <span
                className="truncate min-w-0"
                title={secondaryMetric || "Click to explore"}
              >
                {secondaryMetric || "Click to explore"}
              </span>
              <span className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all text-xs font-bold flex items-center gap-0.5 shrink-0">
                <span>View</span>
                <ArrowRight size={11} />
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
