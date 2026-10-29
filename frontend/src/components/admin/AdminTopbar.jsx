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
  Shield,
  Download,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "../../routes/Context";

export default function AdminTopbar({
  breadcrumbs = ["Admin Console", "Dashboard"],
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
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("default");
    else setTheme("light");
  };

  const CurrentThemeIcon =
    theme === "default" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 sticky top-0 z-20 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Menu + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open mobile sidebar"
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>

        <nav aria-label="Breadcrumbs" className="hidden sm:flex items-center gap-2 text-xs font-semibold">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
              <span
                className={
                  idx === breadcrumbs.length - 1
                    ? "text-slate-900 dark:text-white font-bold truncate"
                    : "text-slate-500 dark:text-slate-400"
                }
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
          className="w-full px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400 hover:border-indigo-400 dark:hover:border-indigo-500 flex items-center justify-between transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search size={14} className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            <span>Search admin commands & sections...</span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-2xs">
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
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Search size={18} />
        </button>

        {/* Refresh Action */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh statistics"
            aria-label="Refresh platform statistics"
            className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={17} className={isRefreshing ? "animate-spin text-indigo-600" : ""} />
          </button>
        )}

        {/* Global Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={`Theme: ${theme}`}
          aria-label="Toggle dark/light theme"
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <CurrentThemeIcon size={18} />
        </button>

        {/* Notifications Icon Button */}
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="View notifications"
          className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Bell size={18} />
          {pendingAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="relative ml-1" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-label="Admin user menu"
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {(adminInfo?.name || "A").charAt(0).toUpperCase()}
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 text-xs">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {adminInfo?.name || "Administrator"}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {adminInfo?.email || "admin@jobone.com"}
                </p>
                <span className="mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                  {adminInfo?.role || "Super Admin"}
                </span>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Settings size={14} />
                  <span>Admin Settings</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer font-bold"
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

