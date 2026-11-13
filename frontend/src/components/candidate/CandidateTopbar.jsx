import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Sun,
  Moon,
  Monitor,
  Bookmark,
  User,
  LogOut,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  FileText,
  Briefcase,
  Settings,
  X,
  FileCode,
} from "lucide-react";
import { useTheme } from "../../routes/Context";

export default function CandidateTopbar({
  onOpenMobile,
  userInfo = {},
  title = "Dashboard",
  breadcrumbs = [],
  onOpenSavedJobs,
  savedJobsCount = 0,
  onLogout,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
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

  // Global Keyboard Shortcuts (Ctrl+K for search, Escape for dropdown/mobile search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (window.innerWidth >= 768 && searchInputRef.current) {
          searchInputRef.current.focus();
        } else {
          setIsMobileSearchOpen((prev) => !prev);
        }
      }

      // Escape key closes open dropdown or mobile search
      if (e.key === "Escape") {
        setIsProfileDropdownOpen(false);
        setIsMobileSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus mobile search when opened
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
    }
  }, [isMobileSearchOpen]);

  // Reliable click-outside handler for profile dropdown
  useEffect(() => {
    if (!isProfileDropdownOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    setIsMobileSearchOpen(false);
    if (query) {
      navigate(`/candidate/jobs?q=${encodeURIComponent(query)}`);
    } else {
      navigate("/candidate/jobs");
    }
  };

  const candidateName = userInfo?.name || userInfo?.user?.name || "Candidate";
  const candidateEmail = userInfo?.email || userInfo?.user?.email || "";
  const userId =
    userInfo?.userId ||
    userInfo?.id ||
    userInfo?.user?.id ||
    userInfo?.user?._id ||
    userInfo?._id ||
    (() => {
      try {
        const stored = JSON.parse(localStorage.getItem("userInfo"));
        return stored?._id || stored?.id || stored?.user?._id || stored?.user?.id;
      } catch {
        return null;
      }
    })();

  const initials = candidateName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CA";

  return (
    <header className="sticky top-0 z-30 h-16 bg-[var(--theme-surface)]/95 backdrop-blur-md border-b border-[var(--theme-border)] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4 transition-colors">
      {/* 1. Left Controls: Mobile Drawer Trigger & Breadcrumbs */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1 md:flex-initial">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)]"
          aria-label="Open mobile navigation"
        >
          <Menu size={20} />
        </button>

        {/* Dynamic Breadcrumbs / Title */}
        <div className="min-w-0">
          {breadcrumbs.length > 0 ? (
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--theme-text-muted)]">
              <Link
                to="/userdashboard"
                className="hover:text-[var(--theme-text)] transition-colors hidden sm:inline"
              >
                Candidate
              </Link>
              <span className="text-[var(--theme-text-subtle)] hidden sm:inline">/</span>
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-[var(--theme-text-subtle)]">/</span>}
                    {crumb.path && !isLast ? (
                      <Link
                        to={crumb.path}
                        className="hover:text-[var(--theme-text)] transition-colors truncate max-w-[120px] sm:max-w-xs"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-[var(--theme-text)] font-semibold truncate max-w-[140px] sm:max-w-xs">
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-[var(--theme-text)] tracking-tight truncate">
                {title}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={11} />
                Talent Portal
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Center: Live Desktop Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center flex-1 max-w-md mx-2 lg:mx-4"
      >
        <div className="relative w-full">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles, skills, companies... (Ctrl+K)"
            className="w-full pl-9 pr-14 py-2 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-border-silver)] focus:ring-1 focus:ring-[var(--theme-border-silver)] transition-all"
            aria-label="Search job listings"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] rounded"
              aria-label="Clear search query"
            >
              <X size={13} />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 text-[9px] font-mono text-[var(--theme-text-muted)] bg-[var(--theme-surface)] border border-[var(--theme-border)] px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
              ⌘K
            </kbd>
          )}
        </div>
      </form>

      {/* 3. Right Action Controls: Mobile Search Trigger, Saved Jobs, Theme, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Mobile Search Toggle Trigger (visible < md) */}
        <button
          type="button"
          onClick={() => setIsMobileSearchOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)]"
          aria-label="Toggle mobile search"
          aria-expanded={isMobileSearchOpen}
        >
          <Search size={16} />
        </button>

        {/* Saved Jobs Pill Trigger */}
        <button
          type="button"
          onClick={onOpenSavedJobs}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-[var(--theme-text)] transition-all cursor-pointer min-h-[38px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)]"
          title="View Saved Jobs"
          aria-label={`Saved Opportunities: ${savedJobsCount}`}
        >
          <Bookmark size={15} className="text-[var(--theme-accent-silver)] shrink-0" />
          <span className="hidden sm:inline">Saved</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[var(--theme-surface-hover)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)]">
            {savedJobsCount}
          </span>
        </button>

        {/* 3-Way Theme Switcher Button (RULE[user_global]) */}
        <button
          type="button"
          onClick={cycleTheme}
          className="p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)]"
          title={themeLabel}
          aria-label={themeLabel}
        >
          <ThemeIcon size={16} />
          {theme === "default" && (
            <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--theme-accent-silver)]" />
          )}
        </button>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
            aria-expanded={isProfileDropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-1.5 sm:pr-2.5 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] transition-all cursor-pointer min-h-[38px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-border-silver)]"
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] flex items-center justify-center font-bold text-xs text-[var(--theme-text)] shrink-0">
              {initials}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-[var(--theme-text)] max-w-[100px] truncate">
              {candidateName.split(" ")[0]}
            </span>
            <ChevronDown
              size={13}
              className={`text-[var(--theme-text-muted)] transition-transform duration-200 ${
                isProfileDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Account Dropdown Menu (Fixed Positioning & Overflow Protected) */}
          {isProfileDropdownOpen && (
            <div
              role="menu"
              aria-orientation="vertical"
              className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-[var(--theme-text)]"
            >
              {/* User Bio Header */}
              <div className="px-4 py-3 border-b border-[var(--theme-border)]">
                <p className="text-xs font-bold truncate text-[var(--theme-text)]">
                  {candidateName}
                </p>
                <p className="text-[11px] text-[var(--theme-text-muted)] truncate font-mono mt-0.5">
                  {candidateEmail || "candidate@jobone.com"}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-[var(--theme-text-subtle)] font-mono uppercase">
                    Account Status
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck size={11} /> Verified Talent
                  </span>
                </div>
              </div>

              {/* Menu Navigation Links */}
              <div className="py-1 px-1">
                {userId && (
                  <Link
                    to={`/profile/${userId}`}
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors min-h-[38px]"
                    role="menuitem"
                  >
                    <ExternalLink size={15} className="text-[var(--theme-accent-silver)] shrink-0" />
                    <span>View Public Profile</span>
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors min-h-[38px]"
                  role="menuitem"
                >
                  <User size={15} className="text-[var(--theme-accent-silver)] shrink-0" />
                  <span>Full Profile Dossier</span>
                </Link>
                <Link
                  to="/myapplications"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors min-h-[38px]"
                  role="menuitem"
                >
                  <Briefcase size={15} className="text-[var(--theme-accent-silver)] shrink-0" />
                  <span>My Applications</span>
                </Link>
                <Link
                  to="/resume-builder"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors min-h-[38px]"
                  role="menuitem"
                >
                  <FileCode size={15} className="text-[var(--theme-accent-silver)] shrink-0" />
                  <div className="flex items-center justify-between flex-1">
                    <span>Resume Builder</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[var(--theme-surface-hover)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)]">
                      ATS
                    </span>
                  </div>
                </Link>
                <Link
                  to="/jobseeker-documents"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors min-h-[38px]"
                  role="menuitem"
                >
                  <FileText size={15} className="text-[var(--theme-accent-silver)] shrink-0" />
                  <span>Documents & CV</span>
                </Link>
                <Link
                  to="/editprofile"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors min-h-[38px]"
                  role="menuitem"
                >
                  <Settings size={15} className="text-[var(--theme-accent-silver)] shrink-0" />
                  <span>Edit Profile & Skills</span>
                </Link>
              </div>

              {/* Theme Selector Submenu inside Dropdown (RULE[user_global]) */}
              <div className="border-t border-[var(--theme-border)] px-3 py-2.5">
                <p className="text-[10px] font-mono uppercase text-[var(--theme-text-subtle)] mb-2 font-semibold">
                  Appearance Theme
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheme("dark");
                    }}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      theme === "dark"
                        ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border-[var(--theme-border-silver)] shadow-xs"
                        : "text-[var(--theme-text-muted)] border-transparent hover:bg-[var(--theme-surface-hover)]"
                    }`}
                  >
                    <Moon size={11} /> Dark
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheme("light");
                    }}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      theme === "light"
                        ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border-[var(--theme-border-silver)] shadow-xs"
                        : "text-[var(--theme-text-muted)] border-transparent hover:bg-[var(--theme-surface-hover)]"
                    }`}
                  >
                    <Sun size={11} /> Light
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheme("default");
                    }}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                      theme === "default"
                        ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border-[var(--theme-border-silver)] shadow-xs"
                        : "text-[var(--theme-text-muted)] border-transparent hover:bg-[var(--theme-surface-hover)]"
                    }`}
                  >
                    <Monitor size={11} /> System
                  </button>
                </div>
              </div>

              {/* Sign Out CTA */}
              <div className="border-t border-[var(--theme-border)] pt-1 px-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer min-h-[38px]"
                  role="menuitem"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Mobile Quick Search Accordion Overlay (when triggered on small screens) */}
      {isMobileSearchOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 p-3 bg-[var(--theme-surface)] border-b border-[var(--theme-border)] shadow-xl z-40 animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]"
              />
              <input
                ref={mobileSearchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, skills, companies..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-border-silver)]"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold shrink-0"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] border border-[var(--theme-border)] shrink-0"
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
