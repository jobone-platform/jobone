import React from "react";

const colorStyles = {
  Users: {
    bg: "bg-blue-50 dark:bg-blue-950/60",
    text: "text-blue-600 dark:text-blue-400",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-800",
  },
  Companies: {
    bg: "bg-purple-50 dark:bg-purple-950/60",
    text: "text-purple-600 dark:text-purple-400",
    hoverBorder: "hover:border-purple-300 dark:hover:border-purple-800",
  },
  Active: {
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    text: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-800",
  },
  Jobs: {
    bg: "bg-indigo-50 dark:bg-indigo-950/60",
    text: "text-indigo-600 dark:text-indigo-400",
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-800",
  },
  Applications: {
    bg: "bg-cyan-50 dark:bg-cyan-950/60",
    text: "text-cyan-600 dark:text-cyan-400",
    hoverBorder: "hover:border-cyan-300 dark:hover:border-cyan-800",
  },
  Pending: {
    bg: "bg-amber-50 dark:bg-amber-950/60",
    text: "text-amber-600 dark:text-amber-400",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-800",
  },
  Reported: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    hoverBorder: "hover:border-slate-300 dark:hover:border-slate-700",
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
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse h-36 sm:h-40 flex flex-col justify-between shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800"></div>
        <div>
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2"></div>
          <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
        </div>
      </div>
    );
  }

  const scheme = colorStyles[title] || {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-200",
    hoverBorder: "hover:border-slate-400 dark:hover:border-slate-600",
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={`group relative p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-36 sm:h-40 ${
        onClick
          ? `cursor-pointer ${scheme.hoverBorder}`
          : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${scheme.bg} ${scheme.text}`}
        >
          {Icon && <Icon size={20} />}
        </div>
        {badge && (
          <span
            className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
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
      </div>

      <div>
        <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-2 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          {title}
        </p>
      </div>
    </div>
  );
}
