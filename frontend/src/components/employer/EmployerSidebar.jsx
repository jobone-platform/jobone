import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Search,
  Users,
  Building2,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Clock,
  XOctagon,
  Lock,
  CalendarClock,
  BarChart3,
} from "lucide-react";
import LogoJobOne from "../LogoJobOne";
import { useTheme } from "../../routes/Context";

export default function EmployerSidebar({
  activeTab = "dashboard",
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  employerInfo = {},
  approvalStatus = "approved",
  onLogout,
}) {
  const location = useLocation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Escape key listener for mobile drawer
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

  const isApproved = approvalStatus === "approved";

  // Navigation Links
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/employerdashboard",
      icon: LayoutDashboard,
      requiresApproval: false,
    },
    {
      id: "createjob",
      label: "Create Job",
      path: "/createjob",
      icon: PlusCircle,
      requiresApproval: true,
      badge: isApproved ? "Active" : "Locked",
    },
    {
      id: "candidates",
      label: "Candidates",
      path: "/candidates",
      icon: Search,
      requiresApproval: true,
      badge: isApproved ? null : "Locked",
    },
    {
      id: "my-candidates",
      label: "Candidate Pipeline",
      path: "/my-candidates",
      icon: Users,
      requiresApproval: true,
      badge: isApproved ? null : "Locked",
    },
    {
      id: "interviews",
      label: "Interviews",
      path: "/interviews",
      icon: CalendarClock,
      requiresApproval: true,
      badge: isApproved ? null : "Locked",
    },
    {
      id: "analytics",
      label: "Hiring Analytics",
      path: "/analytics",
      icon: BarChart3,
      requiresApproval: false,
    },
    {
      id: "team",
      label: "Team Management",
      path: "/team",
      icon: ShieldCheck,
      requiresApproval: false,
    },
    {
      id: "profile",
      label: "Company Profile",
      path: "/employerprofile",
      icon: Building2,
      requiresApproval: false,
    },
    {
      id: "documents",
      label: "KYC & Documents",
      path: "/employerdocupload",
      icon: FileText,
      requiresApproval: false,
    },
    {
      id: "settings",
      label: "Settings",
      path: "/employereditprofile",
      icon: Settings,
      requiresApproval: false,
    },
  ];

  const companyName =
    employerInfo?.companyName ||
    employerInfo?.name ||
    employerInfo?.employer?.companyName ||
    "Company Account";

  const companyEmail =
    employerInfo?.email ||
    employerInfo?.employer?.email ||
    "employer@jobone.com";

  const initials = companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CO";

  // Verification status pill config
  const statusConfig = {
    approved: {
      label: "Verified",
      icon: ShieldCheck,
      badgeClass:
        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    },
    pending: {
      label: "Under Review",
      icon: Clock,
      badgeClass:
        "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    },
    rejected: {
      label: "Denied",
      icon: XOctagon,
      badgeClass: "bg-red-500/10 text-red-400 border border-red-500/20",
    },
  }[approvalStatus] || {
    label: "Under Review",
    icon: Clock,
    badgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  };

  const StatusIcon = statusConfig.icon;

  const renderNavItem = (item, isMobile = false) => {
    const Icon = item.icon;
    const isGated = item.requiresApproval && !isApproved;
    const isActive =
      activeTab === item.id ||
      location.pathname === item.path ||
      (item.id === "dashboard" && location.pathname === "/employerdashboard") ||
      (item.id === "profile" && location.pathname.startsWith("/employerprofile")) ||
      (item.id === "settings" && location.pathname.startsWith("/employereditprofile")) ||
      (item.id === "documents" && location.pathname.startsWith("/employerdocupload")) ||
      (item.id === "candidates" && location.pathname.startsWith("/candidates")) ||
      (item.id === "my-candidates" && location.pathname.startsWith("/my-candidates") && !location.search.includes("tab=interviews")) ||
      (item.id === "interviews" && (location.pathname.startsWith("/interviews") || location.search.includes("tab=interviews"))) ||
      (item.id === "analytics" && (location.pathname.startsWith("/analytics") || location.search.includes("tab=analytics"))) ||
      (item.id === "team" && (location.pathname.startsWith("/team") || location.search.includes("tab=team"))) ||
      (item.id === "createjob" && location.pathname.startsWith("/createjob"));

    const itemContent = (
      <div
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
          isActive
            ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] shadow-sm font-semibold"
            : isGated
            ? "text-[var(--theme-text-subtle)] hover:bg-[var(--theme-surface-hover)]/50 cursor-not-allowed opacity-60"
            : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)]"
        } ${isCollapsed && !isMobile ? "justify-center px-2" : ""}`}
      >
        <Icon
          size={18}
          className={`shrink-0 transition-colors ${
            isActive
              ? "text-[var(--theme-accent-silver)]"
              : isGated
              ? "text-[var(--theme-text-subtle)]"
              : "text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)]"
          }`}
        />

        {(!isCollapsed || isMobile) && (
          <span className="truncate flex-1">{item.label}</span>
        )}

        {(!isCollapsed || isMobile) && isGated && (
          <Lock size={12} className="text-amber-400 shrink-0" />
        )}

        {(!isCollapsed || isMobile) && !isGated && item.badge && (
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--theme-surface-hover)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)]">
            {item.badge}
          </span>
        )}

        {/* Collapsed Tooltip */}
        {isCollapsed && !isMobile && (
          <div className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--theme-text)] text-[var(--theme-bg)] whitespace-nowrap shadow-xl z-50 pointer-events-none items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
            {item.label}
            {isGated && <Lock size={10} className="text-amber-400" />}
          </div>
        )}
      </div>
    );

    if (isGated) {
      return (
        <li key={item.id} title="Feature unlocked upon admin approval">
          {itemContent}
        </li>
      );
    }

    return (
      <li key={item.id}>
        <Link
          to={item.path}
          title={isCollapsed && !isMobile ? item.label : undefined}
          onClick={() => {
            if (isMobile && onCloseMobile) onCloseMobile();
          }}
          className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-focus)] rounded-xl"
        >
          {itemContent}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP COLLAPSIBLE SIDEBAR                            */}
      {/* ======================================================== */}
      <aside
        aria-label="Employer Navigation Sidebar"
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-[var(--theme-surface)] border-r border-[var(--theme-border)] transition-[width] duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header: Separated Expanded & Collapsed States */}
        {isCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full h-16 flex items-center justify-center border-b border-[var(--theme-border)] hover:bg-[var(--theme-surface-hover)] transition-colors group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-focus)] relative shrink-0"
            title="Expand sidebar (Ctrl+[)"
            aria-label="Expand sidebar"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center font-bold font-mono text-sm tracking-tight text-[var(--theme-text)] shadow-sm group-hover:border-[var(--theme-border-silver)] group-hover:scale-105 transition-all">
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
              to="/employerdashboard"
              className="flex items-center gap-2 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-focus)] rounded-lg p-1 group"
            >
              <LogoJobOne
                width={110}
                height={32}
                textColor={isDark ? "#FFFFFF" : "#0A0A0A"}
              />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)]">
                Employer
              </span>
            </Link>

            {/* Collapse Toggle */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse();
                }}
                className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-focus)]"
                title="Collapse sidebar (Ctrl+[)"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>
        )}

        {/* Verification Status Pill */}
        {!isCollapsed ? (
          <div className="px-4 py-3 border-b border-[var(--theme-border)]/60 bg-[var(--theme-surface-muted)]/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--theme-text-muted)]">
                Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${statusConfig.badgeClass}`}
              >
                <StatusIcon size={11} />
                {statusConfig.label}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2.5 flex justify-center border-b border-[var(--theme-border)]/60">
            <span
              title={`Employer Status: ${statusConfig.label}`}
              className={`w-3 h-3 rounded-full flex items-center justify-center ${
                approvalStatus === "approved"
                  ? "bg-emerald-500"
                  : approvalStatus === "pending"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-red-500"
              }`}
            />
          </div>
        )}

        {/* Quick CTA - Post Job (when approved & not collapsed) */}
        {!isCollapsed && isApproved && (
          <div className="p-3 border-b border-[var(--theme-border)]/40">
            <Link
              to="/createjob"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] hover:opacity-90 font-bold text-xs transition-opacity shadow-sm"
            >
              <PlusCircle size={15} />
              <span>Post New Job</span>
            </Link>
          </div>
        )}

        {/* Nav Links */}
        <nav
          aria-label="Employer Navigation"
          className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1 scrollbar-thin"
        >
          <ul className="space-y-1">
            {navItems.map((item) => renderNavItem(item, false))}
          </ul>
        </nav>

        {/* Bottom Profile / Logout Footer */}
        <div className="p-3 border-t border-[var(--theme-border)] bg-[var(--theme-surface-muted)]/30 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] flex items-center justify-center font-bold text-xs text-[var(--theme-text)] shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[var(--theme-text)] truncate">
                    {companyName}
                  </p>
                  <p className="text-[10px] text-[var(--theme-text-muted)] truncate">
                    {companyEmail}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onLogout) onLogout();
                }}
                className="w-10 h-10 rounded-xl text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 relative group"
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
          )}
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE DRAWER SIDEBAR                                 */}
      {/* ======================================================== */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Pane */}
          <div className="relative w-72 max-w-[85vw] bg-[var(--theme-surface)] text-[var(--theme-text)] border-r border-[var(--theme-border)] flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="h-16 px-4 border-b border-[var(--theme-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogoJobOne
                  width={110}
                  height={32}
                  textColor={isDark ? "#FFFFFF" : "#0A0A0A"}
                />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)]">
                  Employer
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)]"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            {/* Verification Status */}
            <div className="px-4 py-3 border-b border-[var(--theme-border)]/60 bg-[var(--theme-surface-muted)]/40 flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--theme-text-muted)]">
                Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${statusConfig.badgeClass}`}
              >
                <StatusIcon size={12} />
                {statusConfig.label}
              </span>
            </div>

            {/* Quick CTA */}
            {isApproved && (
              <div className="p-3 border-b border-[var(--theme-border)]/40">
                <Link
                  to="/createjob"
                  onClick={onCloseMobile}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs shadow-sm"
                >
                  <PlusCircle size={15} />
                  <span>Post New Job</span>
                </Link>
              </div>
            )}

            {/* Navigation links */}
            <nav
              aria-label="Employer Mobile Navigation"
              className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1 scrollbar-thin"
            >
              <ul className="space-y-1">
                {navItems.map((item) => renderNavItem(item, true))}
              </ul>
            </nav>

            {/* Bottom User Card */}
            <div className="p-3 border-t border-[var(--theme-border)] bg-[var(--theme-surface-muted)]/30">
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] flex items-center justify-center font-bold text-xs text-[var(--theme-text)] shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[var(--theme-text)] truncate">
                      {companyName}
                    </p>
                    <p className="text-[10px] text-[var(--theme-text-muted)] truncate">
                      {companyEmail}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                    if (onLogout) onLogout();
                  }}
                  className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

