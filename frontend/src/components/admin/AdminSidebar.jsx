import React from "react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Building2,
  Users,
  Layers,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { Link } from "react-router-dom";
import LogoJobOne from "../LogoJobOne";
import { useTheme } from "../../routes/Context";

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  adminInfo = {},
  onLogout,
  pendingJobsCount = 0,
  pendingEmployersCount = 0,
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("default");
    else setTheme("light");
  };

  const role = adminInfo?.role || "superAdmin";
  const roleNameMap = {
    superAdmin: "Super Admin",
    employerAdmin: "Employer Admin",
    jobseekerAdmin: "Jobseeker Admin",
  };

  const navItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "allJobs",
      label: "Jobs",
      icon: Briefcase,
      count: pendingJobsCount > 0 ? pendingJobsCount : undefined,
    },
    {
      id: "applications",
      label: "Applications",
      icon: FileText,
    },
    {
      id: "allEmployers",
      label: "Companies",
      icon: Building2,
      count: pendingEmployersCount > 0 ? pendingEmployersCount : undefined,
    },
    {
      id: "allJobseekers",
      label: "Users",
      icon: Users,
    },
    {
      id: "categories",
      label: "Categories",
      icon: Layers,
    },
    {
      id: "exportDB",
      label: "Reports",
      icon: BarChart3,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const adminInitials = (adminInfo?.name || "Admin")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const ThemeIcon = theme === "default" ? Monitor : isDark ? Moon : Sun;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-r border-slate-200/80 dark:border-slate-800 select-none transition-colors overflow-x-hidden">
      {/* ─── Top Brand Header ─────────────────────────────────────────── */}
      {isCollapsed ? (
        <div className="h-20 px-2 flex flex-col items-center justify-center gap-1.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <Link
            to="/admin/dashboard?tab=overview"
            onClick={() => {
              onSelectTab("overview");
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-10 h-10 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-black text-sm shadow-xs hover:scale-105 transition-transform"
            title="JobOne Dashboard"
          >
            J1
          </Link>
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      ) : (
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
          <Link
            to="/admin/dashboard?tab=overview"
            onClick={() => {
              onSelectTab("overview");
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-2 overflow-hidden"
            title="JobOne Dashboard"
          >
            <LogoJobOne
              width={160}
              height={48}
              textColor={isDark ? "#FFFFFF" : "#0F172A"}
              className="h-9 w-auto"
            />
          </Link>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>
      )}

      {/* ─── Navigation Links ────────────────────────────────────────── */}
      <div
        className={`flex-1 overflow-y-auto py-5 space-y-1.5 custom-scrollbar ${
          isCollapsed ? "px-2.5 flex flex-col items-center" : "px-4"
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === "allJobs" && activeTab === "pendingJobs") ||
            (item.id === "allEmployers" && activeTab === "pendingEmployers") ||
            (item.id === "exportDB" && activeTab === "reports") ||
            (item.id === "settings" && activeTab === "manageAdmins");

          if (isCollapsed) {
            return (
              <button
                key={item.id}
                type="button"
                title={`${item.label}${item.count ? ` (${item.count} pending)` : ""}`}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative group ${
                  isActive
                    ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={19} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm transition-all group cursor-pointer relative ${
                isActive
                  ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-semibold"
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-950"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className="truncate text-sm">{item.label}</span>
              </div>

              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900"
                      : "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Bottom Administrator Profile ─────────────────────────────── */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 shrink-0">
        {isCollapsed ? (
          <div className="p-3 flex flex-col items-center gap-2">
            <div
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold text-sm shadow-xs cursor-default"
              title={`${adminInfo?.name || "Administrator"} (${roleNameMap[role] || role})`}
            >
              {adminInitials}
            </div>
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={toggleTheme}
                title={`Theme: ${theme}`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ThemeIcon size={15} />
              </button>
              <button
                type="button"
                onClick={onLogout}
                title="Log Out"
                aria-label="Log Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                {adminInitials}
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {adminInfo?.name || "Administrator"}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
                  {roleNameMap[role] || role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                title={`Theme: ${theme}`}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ThemeIcon size={16} />
              </button>
              <button
                type="button"
                onClick={onLogout}
                title="Log Out"
                aria-label="Log Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-200 z-30 shrink-0 ${
          isCollapsed ? "w-18 min-w-[4.5rem] max-w-[4.5rem]" : "w-64 min-w-[16rem] max-w-[16rem]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-950/50 backdrop-blur-xs flex animate-in fade-in duration-150"
          onClick={onCloseMobile}
        >
          <div
            className="w-64 h-full shadow-2xl animate-in slide-in-from-left duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
