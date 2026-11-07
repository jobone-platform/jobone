import React from "react";

export default function Tabs({
  tabs = [], // [{ id: string, label: string, icon?: ReactNode, badge?: string | number }]
  activeTab,
  onChange,
  variant = "pill", // "pill" | "underline"
  size = "md", // "sm" | "md"
  className = "",
}) {
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
  };

  if (variant === "underline") {
    return (
      <div
        role="tablist"
        className={`flex items-center gap-4 sm:gap-6 border-b border-[var(--theme-border)] overflow-x-auto ${className}`}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`pb-3 font-semibold text-sm transition-all relative flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? "text-[var(--theme-text)] font-bold"
                  : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              }`}
            >
              {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold border border-[var(--theme-border)] bg-[var(--theme-card)]">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--theme-text)] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Pill variant
  return (
    <div
      role="tablist"
      className={`inline-flex items-center p-1 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] overflow-x-auto ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`font-semibold rounded-lg transition-all flex items-center justify-center shrink-0 cursor-pointer ${
              sizeStyles[size] || sizeStyles.md
            } ${
              isActive
                ? "bg-[var(--theme-text)] text-[var(--theme-bg)] shadow-xs font-bold"
                : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
            }`}
          >
            {tab.icon && <span className="w-3.5 h-3.5 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-[var(--theme-bg)] text-[var(--theme-text)]"
                    : "border border-[var(--theme-border)] bg-[var(--theme-card)]"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

