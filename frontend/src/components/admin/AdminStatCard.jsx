import React from "react";

const colorStyles = {
  Users: {
    bg: "bg-[var(--theme-gold-surface)]",
    text: "text-[var(--theme-gold)]",
    hoverBorder: "hover:border-[var(--theme-gold-border)]",
  },
  Companies: {
    bg: "bg-[var(--theme-surface-elevated)]",
    text: "text-[var(--theme-gold)]",
    hoverBorder: "hover:border-[var(--theme-gold-border)]",
  },
  Active: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    hoverBorder: "hover:border-emerald-500/30",
  },
  Jobs: {
    bg: "bg-[var(--theme-gold-surface)]",
    text: "text-[var(--theme-gold)]",
    hoverBorder: "hover:border-[var(--theme-gold-border)]",
  },
  Applications: {
    bg: "bg-[var(--theme-surface-elevated)]",
    text: "text-[var(--theme-gold)]",
    hoverBorder: "hover:border-[var(--theme-gold-border)]",
  },
  Pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    hoverBorder: "hover:border-amber-500/30",
  },
  Reported: {
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    hoverBorder: "hover:border-rose-500/30",
  },
};

export default function AdminStatCard({
  title,
  value,
  icon: Icon,
  badge,
  badgeVariant = "info",
  onClick,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="p-3.5 sm:p-4.5 lg:p-5 rounded-2xl sm:rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border)] animate-pulse h-32 sm:h-36 lg:h-40 flex flex-col justify-between shadow-xs">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[var(--theme-surface-hover)]"></div>
        <div>
          <div className="h-6 sm:h-8 w-14 sm:w-16 bg-[var(--theme-surface-elevated)] rounded-lg mb-2"></div>
          <div className="h-3.5 sm:h-4 w-16 sm:w-20 bg-[var(--theme-surface-hover)] rounded-md"></div>
        </div>
      </div>
    );
  }

  const scheme = colorStyles[title] || {
    bg: "bg-[var(--theme-gold-surface)]",
    text: "text-[var(--theme-gold)]",
    hoverBorder: "hover:border-[var(--theme-gold-border)]",
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={`group relative p-3.5 sm:p-4.5 lg:p-5 rounded-2xl sm:rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-32 sm:h-36 lg:h-40 ${
        onClick
          ? `cursor-pointer ${scheme.hoverBorder}`
          : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${scheme.bg} ${scheme.text}`}
        >
          {Icon && <Icon size={18} className="sm:w-5 sm:h-5" />}
        </div>
        {badge && (
          <span
            className={`text-[10px] sm:text-[11px] font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full ${
              badgeVariant === "warning"
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                : badgeVariant === "danger"
                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                : "bg-[var(--theme-gold-surface)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)]"
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--theme-text)] tracking-tight leading-none">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-xs sm:text-sm font-bold text-[var(--theme-text-muted)] mt-1.5 sm:mt-2 truncate group-hover:text-[var(--theme-text)] transition-colors">
          {title}
        </p>
      </div>
    </div>
  );
}
