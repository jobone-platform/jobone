import React, { useEffect } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  Layers,
  BarChart3,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ShieldAlert,
  Activity,
  Bell,
  Download,
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const role = adminInfo?.role || "superAdmin";
  const roleNameMap = {
    superAdmin: "Super Admin",
    employerAdmin: "Employer Admin",
    jobseekerAdmin: "Jobseeker Admin",
  };

  // Keyboard shortcut listener for mobile drawer
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const navItems = [
    {
      id: "overview",
      label: "Overview & KPIs",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "analytics",
      label: "Platform Analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "allJobs",
      label: "Job Moderation",
      icon: Briefcase,
      count: pendingJobsCount > 0 ? pendingJobsCount : undefined,
    },
    {
      id: "allEmployers",
      label: "Employer Verification",
      icon: Building2,
      count: pendingEmployersCount > 0 ? pendingEmployersCount : undefined,
    },
    {
      id: "allJobseekers",
      label: "Candidate Directory",
      icon: Users,
      badge: null,
    },
    {
      id: "activity",
      label: "Activity Stream",
      icon: Activity,
      badge: null,
    },
    {
      id: "auditLogs",
      label: "Audit Centre",
      icon: ShieldAlert,
      badge: null,
    },
    {
      id: "notifications",
      label: "Notification Centre",
      icon: Bell,
      badge: null,
    },
    {
      id: "categories",
      label: "Industry Taxonomies",
      icon: Layers,
      badge: null,
    },
    {
      id: "exportDB",
      label: "Reports & Exports",
      icon: Download,
      badge: null,
    },
    {
      id: "settings",
      label: "System Settings",
      icon: Settings,
      badge: null,
    },
  ];

  const adminInitials = (adminInfo?.name || "Admin")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-[var(--theme-surface)] text-[var(--theme-text)] select-none transition-colors overflow-hidden">
      {/* ─── Top Brand Header ────────────────────────────────────────── */}
      {isCollapsed && !isMobile ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full h-16 flex items-center justify-center border-b border-[var(--theme-border)] hover:bg-[var(--theme-surface-hover)] transition-colors group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)] relative shrink-0"
          title="Expand sidebar (Ctrl+[)"
          aria-label="Expand sidebar"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center font-bold font-mono text-sm tracking-tight text-[var(--theme-text)] shadow-xs group-hover:border-[var(--theme-border-silver)] group-hover:scale-105 transition-all">
            J<span className="text-[var(--theme-accent-silver)]">1</span>
          </div>

          {/* Floating Expand Tooltip */}
          <div className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--theme-text)] text-[var(--theme-bg)] whitespace-nowrap shadow-xl z-50 pointer-events-none items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
            <span>Expand sidebar</span>
            <span className="text-[10px] font-mono opacity-70">(Ctrl+[)</span>
          </div>
        </button>
      ) : (
        <div className="h-16 px-4 border-b border-[var(--theme-border)] flex items-center justify-between shrink-0">
          <Link
            to="/admin/dashboard?tab=overview"
            onClick={() => {
              if (onSelectTab) onSelectTab("overview");
              if (isMobile && onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-2 overflow-hidden hover:opacity-85 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)] rounded-lg p-1 group"
            title="JobOne Executive Console"
          >
            <LogoJobOne
              width={116}
              height={32}
              textColor={isDark ? "#FFFFFF" : "#0A0A0A"}
              className="h-8 w-auto"
            />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)]">
              Admin
            </span>
          </Link>

          {/* Desktop collapse toggle button */}
          {!isMobile && onToggleCollapse && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
              aria-label="Collapse sidebar"
              title="Collapse sidebar (Ctrl+[)"
              className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)]"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobile && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation drawer"
              className="p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)]"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* ─── Navigation Links ────────────────────────────────────────── */}
      <nav
        aria-label="Admin Navigation"
        className={`flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-1 scrollbar-thin ${
          isCollapsed && !isMobile ? "px-2 flex flex-col items-center" : "px-3"
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

          if (isCollapsed && !isMobile) {
            return (
              <button
                key={item.id}
                type="button"
                title={`${item.label}${item.count ? ` (${item.count} queued)` : ""}`}
                aria-label={item.label}
                onClick={() => {
                  if (onSelectTab) onSelectTab(item.id);
                  if (isMobile && onCloseMobile) onCloseMobile();
                }}
                className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] shadow-xs font-semibold"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-transparent"
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    isActive
                      ? "text-[var(--theme-accent-silver)]"
                      : "text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)]"
                  }`}
                />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[var(--theme-surface)] animate-pulse" />
                )}

                {/* Collapsed Tooltip */}
                <div className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--theme-text)] text-[var(--theme-bg)] whitespace-nowrap shadow-xl z-50 pointer-events-none items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] font-mono px-1 rounded bg-[var(--theme-bg)]/20 text-[var(--theme-text)]">
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (onSelectTab) onSelectTab(item.id);
                if (isMobile && onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group cursor-pointer relative ${
                isActive
                  ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] font-semibold border border-[var(--theme-border-silver)] shadow-xs"
                  : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] font-medium border border-transparent"
              } ${isMobile ? "min-h-[44px]" : "min-h-[38px]"}`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    isActive
                      ? "text-[var(--theme-accent-silver)]"
                      : "text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.count !== undefined && item.count > 0 && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ─── Bottom Administrator Profile & Logout ─────────────────────── */}
      <div className="p-3 border-t border-[var(--theme-border)] bg-[var(--theme-surface-muted)]/30 shrink-0">
        {isCollapsed && !isMobile ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onLogout) onLogout();
              }}
              className="w-10 h-10 rounded-xl text-[var(--theme-text-muted)] hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 relative group"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={18} />

              {/* Collapsed Tooltip */}
              <div className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--theme-text)] text-[var(--theme-bg)] whitespace-nowrap shadow-xl z-50 pointer-events-none items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                <span>Sign out</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {adminInitials}
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-[var(--theme-text)] truncate">
                  {adminInfo?.name || "Administrator"}
                </p>
                <p className="text-[10px] text-[var(--theme-text-muted)] font-mono truncate">
                  {roleNameMap[role] || role}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isMobile && onCloseMobile) onCloseMobile();
                if (onLogout) onLogout();
              }}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors shrink-0 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Collapsible Sidebar */}
      <aside
        aria-label="Admin Navigation Sidebar"
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-[var(--theme-surface)] border-r border-[var(--theme-border)] transition-[width] duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* 2. Mobile / Tablet Overlay Drawer */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin Mobile Navigation Drawer"
          className="fixed inset-0 z-50 lg:hidden bg-black/75 backdrop-blur-sm flex animate-in fade-in duration-200"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-[var(--theme-surface)] text-[var(--theme-text)] border-r border-[var(--theme-border)] shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
