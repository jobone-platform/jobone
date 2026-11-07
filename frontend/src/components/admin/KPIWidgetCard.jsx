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
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] animate-pulse h-full min-h-[190px] flex flex-col justify-between shadow-xs w-full min-w-0 box-border">
        <div className="flex justify-between items-center">
          <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-elevated)] shrink-0"></div>
          <div className="h-4 w-12 bg-[var(--theme-surface-elevated)] rounded-full"></div>
        </div>
        <div className="my-2">
          <div className="h-7 w-20 bg-[var(--theme-surface-elevated)] rounded-lg mb-2"></div>
          <div className="h-3 w-28 bg-[var(--theme-surface-elevated)] rounded-md"></div>
        </div>
        <div className="h-1.5 w-full bg-[var(--theme-surface-elevated)] rounded-full mt-auto"></div>
      </div>
    );
  }

  const {
    id,
    title,
    primaryValue,
    icon: Icon,
    color = "var(--theme-accent-silver)",
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
      className={`group relative rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] hover:bg-[var(--theme-surface-hover)] shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer p-4 sm:p-5 overflow-hidden select-none w-full h-full min-w-0 box-border ${
        displayMode === "compact"
          ? "min-h-[135px]"
          : "min-h-[190px] sm:min-h-[200px]"
      } ${className}`}
    >
      {/* Restrained Silver Top Accent Illumination Line on Hover */}
      <div className="absolute top-0 inset-x-4 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full bg-gradient-to-r from-transparent via-[var(--theme-accent-silver)] to-transparent" />

      {/* ─── Top Row: Icon + Badge + Maximize Button ────────────────── */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 min-w-0 w-full">
        {/* Outline Icon Container with subtle scale on hover */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)]">
          {Icon && <Icon size={17} />}
        </div>

        {/* Right Action & Badge Container */}
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 justify-end shrink">
          {badge && (
            <span
              title={typeof badge === "string" ? badge : undefined}
              className={`text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-full truncate max-w-[100px] shrink inline-block ${
                badgeVariant === "warning"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : badgeVariant === "danger"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border border-[var(--theme-border-silver)]"
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
            title="Inspect full analytics & distribution"
            aria-label="Maximize widget"
            className="p-1 sm:p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-elevated)] transition-all cursor-pointer opacity-60 group-hover:opacity-100 shrink-0"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* ─── Middle Section: Metric & Sparkline ─────────────────────── */}
      <div className="my-2 min-w-0 w-full">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 min-w-0">
          <p className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--theme-text)] tracking-tight leading-none shrink-0 min-w-0">
            {typeof primaryValue === "number" ? primaryValue.toLocaleString() : primaryValue}
          </p>

          {/* Trend Tag */}
          {trendText && (
            <span
              title={trendText}
              className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono font-semibold min-w-0 truncate max-w-[110px] ${
                isPositiveTrend
                  ? "text-emerald-400"
                  : "text-[var(--theme-text-muted)]"
              }`}
            >
              {isPositiveTrend && <TrendingUp size={11} className="shrink-0" />}
              <span className="truncate">{trendText}</span>
            </span>
          )}
        </div>

        <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1 truncate group-hover:text-[var(--theme-text)] transition-colors min-w-0">
          {title}
        </p>

        {/* Detailed Mode: Mini Sparkline */}
        {displayMode === "detailed" && (
          <div className="mt-2 pt-1 h-7 flex items-center w-full min-w-0">
            {sparklineData && sparklineData.length > 1 ? (
              <KPIWidgetSparkline
                data={sparklineData}
                color={isPositiveTrend ? "#c0c0c0" : "#888888"}
                height={24}
              />
            ) : (
              <div className="w-full h-[1px] bg-[var(--theme-border)]" />
            )}
          </div>
        )}
      </div>

      {/* ─── Bottom Row: Secondary Metric or Progress Bar ───────────── */}
      {displayMode === "detailed" && (
        <div className="pt-2 border-t border-[var(--theme-border)] mt-auto min-w-0 w-full">
          {progressPercentage !== undefined && progressPercentage !== null ? (
            <div className="space-y-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-[var(--theme-text-muted)] gap-1.5 min-w-0">
                <span className="truncate min-w-0" title={secondaryMetric || "Ratio"}>
                  {secondaryMetric || "Rate"}
                </span>
                <span className="shrink-0 text-[var(--theme-accent-silver)]">
                  {progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-[var(--theme-surface-elevated)] rounded-full h-1 overflow-hidden border border-[var(--theme-border)]">
                <div
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  className="h-full rounded-full transition-all duration-500 bg-[var(--theme-accent-silver)]"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--theme-text-muted)] min-w-0 gap-1.5">
              <span className="truncate min-w-0" title={secondaryMetric || "Click to explore"}>
                {secondaryMetric || "Click to explore"}
              </span>
              <span className="text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] group-hover:translate-x-0.5 transition-all text-xs font-bold flex items-center gap-0.5 shrink-0">
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
