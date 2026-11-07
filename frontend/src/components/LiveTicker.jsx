import React from "react";

export default function LiveActivityTicker() {
  const activities = [
    { standard: "Senior Full-Stack Engineer hired at", highlight: "Google" },
    { standard: "Lead Product Designer hired at", highlight: "Meta" },
    { standard: "24 new verified positions added in", highlight: "DevOps & Cloud" },
    { standard: "Aakash V. accepted an offer for", highlight: "Staff Architect" },
    { standard: "Principal Data Engineer hired at", highlight: "Microsoft" },
    { standard: "Fintech Enterprise published", highlight: "12 Openings" },
  ];

  // Repeat for continuous seamless loop on ultrawide monitors
  const tickerItems = [
    ...activities,
    ...activities,
    ...activities,
    ...activities,
  ];

  return (
    <div
      aria-label="Platform Real-Time Activity Ticker"
      className="relative w-full bg-[var(--theme-surface)] border-y border-[var(--theme-border)] py-3 overflow-hidden flex items-center font-sans transition-colors duration-150"
    >
      {/* Left Edge Fade Mask */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[var(--theme-surface)] to-transparent z-10 pointer-events-none" />

      {/* Right Edge Fade Mask */}
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[var(--theme-surface)] to-transparent z-10 pointer-events-none" />

      {/* Pure CSS hardware-accelerated ticker */}
      <div className="flex w-max animate-live-ticker">
        {tickerItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-8 border-r border-[var(--theme-border)] last:border-none"
          >
            {/* Pulsing indicator */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>

            {/* Typography */}
            <p className="text-xs sm:text-sm font-medium text-[var(--theme-text-muted)] whitespace-nowrap">
              {item.standard}{" "}
              <span className="text-[var(--theme-text)] font-bold">{item.highlight}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
