import React from "react";

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
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse h-36 sm:h-40 flex flex-col justify-between">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800"></div>
        <div>
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={`group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-150 flex flex-col justify-between h-36 sm:h-40 ${
        onClick ? "cursor-pointer hover:border-slate-400 dark:hover:border-slate-600" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors shrink-0">
          {Icon && <Icon size={20} />}
        </div>
        {badge && (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              badgeVariant === "warning"
                ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300"
                : badgeVariant === "danger"
                ? "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div>
        <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-2 truncate">
          {title}
        </p>
      </div>
    </div>
  );
}
