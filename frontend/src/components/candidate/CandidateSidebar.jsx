import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Briefcase,
  FileText,
  FileCode,
  User,
  Settings,
  Bookmark,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Building2,
} from "lucide-react";
import LogoJobOne from "../LogoJobOne";
import { useTheme } from "../../routes/Context";

export default function CandidateSidebar({
  activeTab = "dashboard",
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  userInfo = {},
  onLogout,
  onOpenSavedJobs,
  savedJobsCount = 0,
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

  // Structured Navigation Groups
  const navigationGroups = [
    {
      groupTitle: "Workspace",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          path: "/userdashboard",
          icon: LayoutDashboard,
        },
        {
          id: "find-jobs",
          label: "Find Jobs",
          path: "/candidate/jobs",
          icon: Search,
        },
        {
          id: "recommended",
          label: "Recommended",
          path: "/recommended-jobs",
          icon: Sparkles,
          badge: "AI",
        },
        {
          id: "applications",
          label: "My Applications",
          path: "/myapplications",
          icon: Briefcase,
        },
      ],
    },
    {
      groupTitle: "Career Tools",
      items: [
        {
          id: "resumebuilder",
          label: "Resume Builder",
          path: "/resume-builder",
          icon: FileCode,
          badge: "ATS",
        },
        {
          id: "documents",
          label: "Documents & CV",
          path: "/jobseeker-documents",
          icon: FileText,
        },
      ],
    },
    {
      groupTitle: "Profile & Network",
      items: [
        {
          id: "profile",
          label: "My Profile",
          path: "/profile",
          icon: User,
        },
        {
          id: "settings",
          label: "Edit Profile",
          path: "/editprofile",
          icon: Settings,
        },
        {
          id: "companies",
          label: "Explore Companies",
          path: "/candidate/companies",
          icon: Building2,
        },
      ],
    },
  ];

  // Robust path matching for active state
  const isItemActive = (item) => {
    if (activeTab && item.id === activeTab) return true;
    const current = location.pathname.toLowerCase().split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
    const itemPath = item.path.toLowerCase().replace(/\/+$/, "");

    if (item.id === "dashboard") {
      return current === "/userdashboard";
    }
    if (item.id === "find-jobs") {
      return current === "/candidate/jobs" || current.startsWith("/candidate/jobs") || current === "/jobs";
    }
    if (item.id === "recommended") {
      return current === "/recommended-jobs" || current === "/recommendedjobs";
    }
    if (item.id === "applications") {
      return current === "/myapplications";
    }
    if (item.id === "resumebuilder") {
      return current === "/resume-builder" || current === "/resumebuilder";
    }
    if (item.id === "documents") {
      return current === "/jobseeker-documents" || current === "/jobseekerdoc";
    }
    if (item.id === "profile") {
      return current === "/profile" || current.startsWith("/profile/");
    }
    if (item.id === "settings") {
      return current === "/editprofile" || current === "/editprofile2";
    }
    if (item.id === "companies") {
      return current === "/candidate/companies" || current.startsWith("/candidate/companies");
    }

    return current === itemPath || current.startsWith(itemPath + "/");
  };

  const candidateName = userInfo?.name || userInfo?.user?.name || "Candidate";
  const candidateEmail = userInfo?.email || userInfo?.user?.email || "";
  const isVerified = Boolean(userInfo?.isVerified || userInfo?.user?.isVerified || true);
  const isProfileComplete = Boolean(userInfo?.isProfileComplete || userInfo?.user?.isProfileComplete);

  const initials = candidateName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CA";

  // Reusable Nav Link Item Component (matching EmployerSidebar hierarchy)
  const renderNavItem = (item, isMobile = false) => {
    const active = isItemActive(item);
    const Icon = item.icon;

    const itemContent = (
      <div
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
          isMobile ? "min-h-[44px]" : "min-h-[38px]"
        } ${
          active
            ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] shadow-xs font-semibold"
            : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-transparent"
        } ${isCollapsed && !isMobile ? "justify-center px-2" : ""}`}
      >
        <Icon
          size={18}
          className={`shrink-0 transition-colors ${
            active
              ? "text-[var(--theme-accent-silver)]"
              : "text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)]"
          }`}
          aria-hidden="true"
        />

        {(!isCollapsed || isMobile) && (
          <span className="truncate flex-1 text-left">{item.label}</span>
        )}

        {(!isCollapsed || isMobile) && item.badge && (
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--theme-surface-hover)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)] shrink-0">
            {item.badge}
          </span>
        )}

        {/* Collapsed Desktop Tooltip */}
        {isCollapsed && !isMobile && (
          <div className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--theme-text)] text-[var(--theme-bg)] whitespace-nowrap shadow-xl z-50 pointer-events-none items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
            {item.label}
            {item.badge && (
              <span className="text-[9px] font-mono px-1 rounded bg-[var(--theme-bg)]/20 text-[var(--theme-text)]">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </div>
    );

    return (
      <li key={item.id}>
        <Link
          to={item.path}
          title={isCollapsed && !isMobile ? item.label : undefined}
          onClick={() => {
            if (isMobile && onCloseMobile) onCloseMobile();
          }}
          className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)] rounded-xl"
          aria-current={active ? "page" : undefined}
        >
          {itemContent}
        </Link>
      </li>
    );
  };

  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-[var(--theme-surface)] text-[var(--theme-text)] select-none transition-colors overflow-hidden">
      {/* Brand Header: Separated Expanded & Collapsed States */}
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
            to="/userdashboard"
            onClick={() => {
              if (isMobile && onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-2 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)] rounded-lg p-1 group"
          >
            <LogoJobOne
              width={106}
              height={30}
              textColor={isDark ? "#FFFFFF" : "#0A0A0A"}
            />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)]">
              Talent
            </span>
          </Link>

          {/* Desktop Collapse Button */}
          {!isMobile && onToggleCollapse && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
              className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)]"
              title="Collapse sidebar (Ctrl+[)"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Mobile Close Drawer Button */}
          {isMobile && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)]"
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Candidate Verification Status Pill (Matching EmployerSidebar hierarchy) */}
      {!isCollapsed || isMobile ? (
        <div className="px-4 py-2.5 border-b border-[var(--theme-border)]/60 bg-[var(--theme-surface-muted)]/30 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--theme-text-muted)]">
              Status
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                isProfileComplete
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              }`}
            >
              <ShieldCheck size={11} />
              {isProfileComplete ? "Complete" : isVerified ? "Verified Talent" : "Active Profile"}
            </span>
          </div>
        </div>
      ) : (
        <div className="py-2.5 flex justify-center border-b border-[var(--theme-border)]/60 shrink-0">
          <span
            title="Candidate Profile Active"
            className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"
          />
        </div>
      )}

      {/* Quick Saved Jobs Action Bar */}
      <div className="p-3 border-b border-[var(--theme-border)]/40 shrink-0">
        <button
          type="button"
          onClick={() => {
            if (isMobile && onCloseMobile) onCloseMobile();
            if (onOpenSavedJobs) onOpenSavedJobs();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text)] bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)] ${
            isMobile ? "min-h-[44px]" : "min-h-[36px]"
          } ${
            isCollapsed && !isMobile ? "justify-center px-2" : "justify-between"
          }`}
          title="Saved Opportunities"
          aria-label={`Saved Opportunities (${savedJobsCount})`}
        >
          <div className="flex items-center gap-2">
            <Bookmark size={15} className="text-[var(--theme-accent-silver)] shrink-0" />
            {(!isCollapsed || isMobile) && <span>Saved Jobs</span>}
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[var(--theme-surface-hover)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)]">
              {savedJobsCount}
            </span>
          )}
        </button>
      </div>

      {/* Scrollable Navigation List */}
      <nav
        aria-label="Candidate Navigation"
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-5 scrollbar-thin"
      >
        {navigationGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            {(!isCollapsed || isMobile) && (
              <p className="px-3 mb-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--theme-text-subtle)] font-bold">
                {group.groupTitle}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => renderNavItem(item, isMobile))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer / User Profile & Logout */}
      <div className="p-3 border-t border-[var(--theme-border)] bg-[var(--theme-surface-muted)]/20 shrink-0">
        {!isCollapsed || isMobile ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)]">
            <Link
              to="/profile"
              onClick={() => {
                if (isMobile && onCloseMobile) onCloseMobile();
              }}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-border-silver)] rounded-lg p-0.5"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] flex items-center justify-center font-bold text-xs text-[var(--theme-text)] shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[var(--theme-text)] truncate">
                  {candidateName}
                </p>
                <p className="text-[10px] text-[var(--theme-text-muted)] truncate font-mono">
                  {candidateEmail || "Candidate"}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => {
                if (isMobile && onCloseMobile) onCloseMobile();
                if (onLogout) onLogout();
              }}
              className="p-2 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
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
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Collapsible Sidebar */}
      <aside
        aria-label="Candidate Navigation Sidebar"
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
          aria-label="Mobile Navigation Drawer"
          className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Canvas */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[var(--theme-surface)] text-[var(--theme-text)] border-r border-[var(--theme-border)] shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
