import React from "react";
export default function LiveActivityTicker() {
  // Split text into standard and highlighted parts for a premium typographic feel
  const activities = [
    { standard: "Software Engineer hired at", highlight: "Google" },
    { standard: "Product Designer hired at", highlight: "Meta" },
    { standard: "50 new", highlight: "PHP roles added" },
    { standard: "Lucas G. just accepted an", highlight: "Offer" },
    { standard: "Frontend Developer hired at", highlight: "Amazon" },
  ];

  // Duplicate the array multiple times to ensure the w-max container is long enough
  // to do a seamless 0% to -50% CSS transform loop without running out of items on ultrawide monitors.
  const tickerItems = [
    ...activities,
    ...activities,
    ...activities,
    ...activities,
  ];

  return (
    // Dark, neutral background with subtle top/bottom borders
    <div className="relative w-full bg-slate-900 border-y border-slate-800 py-3 overflow-hidden flex items-center font-sans">
      {/* Left Edge Fade Mask */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />

      {/* Right Edge Fade Mask */}
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

      {/* Pure CSS hardware-accelerated animation instead of JS-driven framer-motion */}
      <div className="flex w-max animate-live-ticker">
        {tickerItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-8 border-r border-slate-800 last:border-none"
          >
            {/* Upgraded dual-layer pulsing dot */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>

            {/* Refined Typography: Normal case, subtle grays with white emphasis */}
            <p className="text-sm font-medium text-slate-400 whitespace-nowrap">
              {item.standard}{" "}
              <span className="text-slate-100 font-bold">{item.highlight}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
