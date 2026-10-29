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

  // Nav items strictly matching the reference structure
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-r border-slate-200/80 dark:border-slate-800 select-none transition-colors">
      {/* Top: JobOne Logo (No extra admin badge) */}
      <div className="h-22 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
        <Link
          to="/admin/dashboard?tab=overview"
          onClick={() => {
            onSelectTab("overview");
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center gap-2 overflow-hidden"
          title="JobOne Dashboard"
        >
          {isCollapsed ? (
            <div className="w-9 h-9 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-black text-sm shadow-xs">
              J1
            </div>
          ) : (
            <LogoJobOne
              width={160}
              height={48}
              textColor={isDark ? "#FFFFFF" : "#0F172A"}
              className="h-10 w-auto"
            />
          )}
        </Link>

        {/* Small desktop collapse trigger */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Navigation Links — Vertical arrangement matching reference */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Determine if active: either exact match or alias (e.g. pendingJobs -> allJobs tab group)
          const isActive =
            activeTab === item.id ||
            (item.id === "allJobs" && activeTab === "pendingJobs") ||
            (item.id === "allEmployers" && activeTab === "pendingEmployers") ||
            (item.id === "exportDB" && activeTab === "reports") ||
            (item.id === "settings" && activeTab === "manageAdmins");

          return (
            <button
              key={item.id}
              type="button"
              title={isCollapsed ? item.label : undefined}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm transition-all group cursor-pointer relative ${
                isActive
                  ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-semibold"
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                {/* Small circular light-grey icon background */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-950"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                  }`}
                >
                  <Icon size={18} />
                </div>
                {!isCollapsed && <span className="truncate text-sm">{item.label}</span>}
              </div>

              {!isCollapsed && item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Administrator Profile Area (Anchored to Bottom) */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 shrink-0">
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} gap-2`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold text-sm shrink-0">
              {adminInitials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 pr-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {adminInfo?.name || "Administrator"}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
                  {roleNameMap[role] || role}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Discreet theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                title={`Theme: ${theme}`}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ThemeIcon size={16} />
              </button>
              {/* Logout button */}
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
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed / Sticky) */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-300 z-30 shrink-0 ${
          isCollapsed ? "w-20" : "w-[260px]"
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
            className="w-[260px] h-full shadow-2xl animate-in slide-in-from-left duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
