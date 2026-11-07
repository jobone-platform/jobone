import React from "react";

export function Skeleton({ className = "", variant = "rect", ...props }) {
  const variantStyles = {
    rect: "rounded-xl",
    circle: "rounded-full",
    text: "rounded-md h-4 w-full",
  };

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-[var(--theme-card)] border border-[var(--theme-border)]/50 ${
        variantStyles[variant] || variantStyles.rect
      } ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard({ lines = 3, className = "" }) {
  return (
    <div
      className={`p-6 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] space-y-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="w-12 h-12 shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" className="w-1/4 h-3" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            className={i === lines - 1 ? "w-2/3" : "w-full"}
          />
        ))}
      </div>
    </div>
  );
}

export default Skeleton;

