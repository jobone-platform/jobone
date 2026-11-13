import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Sun,
  Moon,
  Monitor,
  Bell,
  Building2,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Clock,
  XOctagon,
  PlusCircle,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "../../routes/Context";

export default function EmployerTopbar({
  onOpenMobile,
  employerInfo = {},
  approvalStatus = "approved",
  title = "Employer Dashboard",
  breadcrumbs = [],
  onLogout,
  onSearch,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Cycle 3-Way Theme Standard per RULE[user_global]
  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("default");
    else setTheme("light");
  };

  const ThemeIcon = theme === "default" ? Monitor : isDark ? Moon : Sun;
  const themeLabel =
    theme === "default"
      ? "Theme: System Default"
      : isDark
      ? "Theme: Dark Mode"
      : "Theme: Light Mode";

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else if (searchQuery.trim()) {
      navigate(`/candidates?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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

  const isApproved = approvalStatus === "approved";

  return (
    <header className="sticky top-0 z-30 h-16 bg-[var(--theme-surface)]/95 backdrop-blur-md border-b border-[var(--theme-border)] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Toggle & Page Title / Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--theme-border-focus)]"
          aria-label="Open mobile menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          {breadcrumbs.length > 0 ? (
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--theme-text-muted)]">
              <Link to="/employerdashboard" className="hover:text-[var(--theme-text)] transition-colors">
                Employer
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <span className="text-[var(--theme-text-subtle)]">/</span>
                  {crumb.path ? (
                    <Link to={crumb.path} className="hover:text-[var(--theme-text)] transition-colors truncate">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-[var(--theme-text)] font-semibold truncate">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[var(--theme-text)] tracking-tight truncate">
                {title}
              </h1>
              {approvalStatus === "approved" ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck size={11} />
                  Verified
                </span>
              ) : approvalStatus === "pending" ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Clock size={11} />
                  Pending
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                  <XOctagon size={11} />
                  Denied
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center: Search Field (Desktop only) */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isApproved ? "Quick search candidate skills, titles..." : "Search..."}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] focus:outline-none focus:border-[var(--theme-border-silver)] focus:ring-1 focus:ring-[var(--theme-border-silver)] transition-all"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Post Job Button (Desktop) */}
        {isApproved && (
          <Link
            to="/createjob"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] hover:opacity-90 font-bold text-xs transition-opacity shadow-sm"
          >
            <PlusCircle size={14} />
            <span>Post Job</span>
          </Link>
        )}

        {/* 3-Way Theme Switcher (RULE[user_global]: Dark, Light, Default) */}
        <button
          type="button"
          onClick={cycleTheme}
          className="p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors relative focus:outline-none focus:ring-2 focus:ring-[var(--theme-border-focus)]"
          title={themeLabel}
          aria-label={themeLabel}
        >
          <ThemeIcon size={18} />
          {theme === "default" && (
            <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--theme-accent-silver)]" />
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-[var(--theme-surface-hover)] border border-transparent hover:border-[var(--theme-border)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--theme-border-focus)]"
            aria-expanded={isProfileDropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center font-bold text-xs text-[var(--theme-text)]">
              {initials}
            </div>
            <div className="hidden sm:block text-left max-w-[120px]">
              <p className="text-xs font-semibold text-[var(--theme-text)] truncate">
                {companyName}
              </p>
              <p className="text-[10px] text-[var(--theme-text-muted)] truncate">
                {approvalStatus === "approved" ? "Verified Employer" : "Pending"}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-[var(--theme-text-muted)] transition-transform duration-200 ${
                isProfileDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile Menu Dropdown */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-[var(--theme-border)]">
                <p className="text-xs font-bold text-[var(--theme-text)] truncate">
                  {companyName}
                </p>
                <p className="text-[11px] text-[var(--theme-text-muted)] truncate mt-0.5">
                  {companyEmail}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-[var(--theme-text-subtle)] font-mono uppercase">Status</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      approvalStatus === "approved"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : approvalStatus === "pending"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {approvalStatus === "approved" ? "Verified" : approvalStatus === "pending" ? "Under Review" : "Denied"}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/employerprofile"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors"
                >
                  <Building2 size={15} />
                  <span>Company Profile</span>
                </Link>

                <Link
                  to="/employerdocupload"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors"
                >
                  <FileText size={15} />
                  <span>KYC & Verification Docs</span>
                </Link>

                <Link
                  to="/employereditprofile"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors"
                >
                  <Settings size={15} />
                  <span>Edit Account Settings</span>
                </Link>

                <Link
                  to="/jobs"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center justify-between px-4 py-2 text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink size={15} />
                    <span>Public Job Board</span>
                  </div>
                  <span className="text-[10px] text-[var(--theme-text-subtle)] font-mono">Live</span>
                </Link>
              </div>

              {/* Theme Selector Submenu */}
              <div className="border-t border-[var(--theme-border)] px-4 py-2.5">
                <p className="text-[10px] font-mono uppercase text-[var(--theme-text-subtle)] mb-2 font-semibold">
                  Appearance Theme
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      theme === "dark"
                        ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border-[var(--theme-border-silver)]"
                        : "text-[var(--theme-text-muted)] border-transparent hover:bg-[var(--theme-surface-hover)]"
                    }`}
                  >
                    <Moon size={11} /> Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      theme === "light"
                        ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border-[var(--theme-border-silver)]"
                        : "text-[var(--theme-text-muted)] border-transparent hover:bg-[var(--theme-surface-hover)]"
                    }`}
                  >
                    <Sun size={11} /> Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("default")}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      theme === "default"
                        ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border-[var(--theme-border-silver)]"
                        : "text-[var(--theme-text-muted)] border-transparent hover:bg-[var(--theme-surface-hover)]"
                    }`}
                  >
                    <Monitor size={11} /> System
                  </button>
                </div>
              </div>

              {/* Sign Out */}
              <div className="border-t border-[var(--theme-border)] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={15} />
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

