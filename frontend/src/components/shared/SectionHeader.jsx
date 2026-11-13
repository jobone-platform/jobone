import React from "react";

/**
 * Reusable section heading with optional badge, title, description, and right-aligned action.
 */
export default function SectionHeader({
  badgeIcon: BadgeIcon,
  badgeText,
  title,
  subtitle,
  action,
  align = "left",
}) {
  const isCenter = align === "center";

  return (
    <div
      className={`flex flex-col ${
        isCenter ? "items-center text-center mx-auto max-w-2xl" : "lg:flex-row lg:items-end justify-between"
      } gap-6 mb-10 sm:mb-12`}
    >
      <div className={`space-y-3 ${isCenter ? "flex flex-col items-center" : ""}`}>
        {badgeText && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text-muted)]">
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" />}
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {badgeText}
            </span>
          </div>
        )}

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--theme-text)] tracking-tight leading-tight">
          {title}
        </h2>

        {subtitle && (
          <p className="text-sm sm:text-base text-[var(--theme-text-muted)] max-w-2xl font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

