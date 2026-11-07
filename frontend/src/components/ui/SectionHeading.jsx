import React from "react";

export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  actions,
  align = "left", // "left" | "center"
  className = "",
}) {
  const isCenter = align === "center";

  return (
    <div
      className={`space-y-3 ${
        isCenter ? "text-center max-w-3xl mx-auto" : "text-left"
      } ${className}`}
    >
      {eyebrow && (
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-accent-silver)] ${
            isCenter ? "mx-auto" : ""
          }`}
        >
          {eyebrow}
        </div>
      )}

      <div
        className={`flex flex-col ${
          isCenter
            ? "items-center"
            : "md:flex-row md:items-end justify-between gap-4"
        }`}
      >
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--theme-text)] leading-[1.1]">
            {title}{" "}
            {highlight && (
              <span className="text-[var(--theme-accent-silver)] underline decoration-[var(--theme-border-silver)] underline-offset-8">
                {highlight}
              </span>
            )}
          </h2>
          {description && (
            <p className="text-sm sm:text-base text-[var(--theme-text-muted)] max-w-2xl font-normal leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && !isCenter && (
          <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
            {actions}
          </div>
        )}
      </div>

      {actions && isCenter && (
        <div className="flex items-center justify-center gap-3 pt-3">
          {actions}
        </div>
      )}
    </div>
  );
}

