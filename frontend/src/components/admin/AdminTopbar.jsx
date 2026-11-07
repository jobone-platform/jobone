import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  RefreshCw,
  LogOut,
  Settings,
  ChevronDown,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../../routes/Context";

export default function AdminTopbar({
  breadcrumbs = ["Admin Console", "Overview"],
  onOpenMobileSidebar,
  onOpenCommandPalette,
  onOpenNotifications,
  onOpenSettings,
  onRefresh,
  isRefreshing = false,
  pendingAlertsCount = 0,
  adminInfo = {},
  onLogout,
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile menu on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Cycle 3-way theme (Dark -> Light -> Default) per RULE[user_global]
  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("default");
    else setTheme("light");
  };

  const CurrentThemeIcon =
    theme === "default" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  const role = adminInfo?.role || "superAdmin";
  const roleNameMap = {
    superAdmin: "Super Admin",
    employerAdmin: "Employer Admin",
    jobseekerAdmin: "Jobseeker Admin",
  };

  const adminInitials = (adminInfo?.name || "Admin")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 bg-[var(--theme-surface)]/95 backdrop-blur-md border-b border-[var(--theme-border)] sticky top-0 z-20 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Menu + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open mobile sidebar"
          className="lg:hidden p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] rounded-xl hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors cursor-pointer"
        >
          <Menu size={18} />
        </button>

        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-[var(--theme-text-subtle)] font-mono">/</span>}
              <span
                className={`truncate ${
                  idx === breadcrumbs.length - 1
                    ? "text-[var(--theme-text)] font-bold"
                    : "text-[var(--theme-text-muted)] font-medium hidden sm:inline"
                }`}
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:border-[var(--theme-border-silver)] flex items-center justify-between transition-all cursor-pointer group"
          title="Search commands and sections (Ctrl+K)"
        >
          <div className="flex items-center gap-2">
            <Search size={14} className="text-[var(--theme-accent-silver)] group-hover:text-[var(--theme-text)] transition-colors" />
            <span className="truncate">Search admin commands & sections...</span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] shrink-0">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Actions + Theme + Notifications + Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mobile Search Icon */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          aria-label="Open search command palette"
          className="md:hidden p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] rounded-xl hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors cursor-pointer"
        >
          <Search size={16} />
        </button>

        {/* Refresh Action */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh platform statistics"
            aria-label="Refresh platform statistics"
            className="p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] rounded-xl hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin text-[var(--theme-accent-silver)]" : ""} />
          </button>
        )}

        {/* Global 3-Way Theme Toggle per RULE[user_global] */}
        <button
          type="button"
          onClick={toggleTheme}
          title={`Theme: ${theme}`}
          aria-label={`Toggle theme (Current: ${theme})`}
          className="p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] rounded-xl hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors cursor-pointer relative"
        >
          <CurrentThemeIcon size={16} />
          {theme === "default" && (
            <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--theme-accent-silver)]" />
          )}
        </button>

        {/* Notifications Icon Button */}
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="View notifications"
          title="Platform Alerts & Notifications"
          className="relative p-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] rounded-xl hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors cursor-pointer"
        >
          <Bell size={16} />
          {pendingAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[var(--theme-surface)] animate-pulse" />
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="relative ml-1" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-label="Admin user menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-[var(--theme-surface-hover)] border border-transparent hover:border-[var(--theme-border)] transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs flex items-center justify-center shadow-xs">
              {adminInitials}
            </div>
            <div className="hidden sm:block text-left max-w-[120px]">
              <p className="text-xs font-semibold text-[var(--theme-text)] truncate">
                {adminInfo?.name || "Admin"}
              </p>
              <p className="text-[10px] text-[var(--theme-text-muted)] font-mono truncate">
                {roleNameMap[role] || role}
              </p>
            </div>
            <ChevronDown size={14} className={`text-[var(--theme-text-muted)] transition-transform duration-200 hidden sm:block ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-[var(--theme-border)]">
                <p className="font-bold text-[var(--theme-text)] truncate">
                  {adminInfo?.name || "Administrator"}
                </p>
                <p className="text-[11px] text-[var(--theme-text-muted)] truncate mt-0.5">
                  {adminInfo?.email || "admin@jobone.com"}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[var(--theme-text-subtle)]">Role</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border border-[var(--theme-border-silver)]">
                    {roleNameMap[role] || role}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full px-4 py-2 text-left text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
                >
                  <Settings size={14} />
                  <span>Admin Settings</span>
                </button>
              </div>

              {/* Theme quick switcher */}
              <div className="border-t border-[var(--theme-border)] px-4 py-2">
                <p className="text-[10px] font-mono uppercase text-[var(--theme-text-subtle)] mb-1.5 font-semibold">
                  Theme Standard
                </p>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-bold border transition-colors ${
                      theme === "dark"
                        ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border-[var(--theme-border-silver)]"
                        : "text-[var(--theme-text-muted)] border-transparent hover:bg-[var(--theme-surface-hover)]"
                    }`}
                  >
                    <Moon size={10} /> Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-bold border transition-colors ${
                      theme === "light"
                        ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border-[var(--theme-border-silver)]"
                        : "text-[var(--theme-text-muted)] border-transparent hover:bg-[var(--theme-surface-hover)]"
                    }`}
                  >
                    <Sun size={10} /> Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("default")}
                    className={`flex items-center justify-center gap-1 py-1 rounded text-[10px] font-bold border transition-colors ${
                      theme === "default"
                        ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border-[var(--theme-border-silver)]"
                        : "text-[var(--theme-text-muted)] border-transparent hover:bg-[var(--theme-surface-hover)]"
                    }`}
                  >
                    <Monitor size={10} /> System
                  </button>
                </div>
              </div>

              <div className="pt-1 border-t border-[var(--theme-border)]">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 cursor-pointer font-bold transition-colors"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
