import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Building2,
  Sparkles,
  Info,
  PhoneCall,
  Sun,
  Moon,
  Monitor,
  ArrowRight,
  ChevronDown,
  LogOut,
  Menu,
  X,
  User,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Shield,
} from "lucide-react";
import LogoJobOne from "./LogoJobOne";
import { useAuth, useTheme } from "../routes/Context";

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, employer, admin, logout, authStatus, role } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // --- 1. SUPPRESSION OF PUBLIC NAVIGATION INSIDE AUTHENTICATED PORTALS & STANDALONE AUTH ---
  const currentPath =
    location.pathname.toLowerCase().split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

  // Standalone auth views (login, OTP, register flows)
  const isStandaloneAuth = [
    "/userotp",
    "/employerotp",
    "/verifyotp",
    "/verify-otp",
    "/login",
    "/register",
    "/signup",
    "/userregister",
    "/jobseeker/register",
    "/employerregister",
    "/employer-register",
    "/employer/register",
    "/employer/signup",
    "/employerregisteroption",
    "/forgot-password",
    "/reset-password",
    "/admin/login",
  ].includes(currentPath);

  // Dedicated authenticated portal layouts (Admin, Employer ATS, Candidate Command Center)
  const isPortalLayout =
    currentPath.startsWith("/admin") ||
    [
      "/employerdashboard",
      "/createjob",
      "/employerprofile",
      "/employereditprofile",
      "/employereditprofile2",
      "/employerdocupload",
      "/candidates",
      "/my-candidates",
      "/interviews",
      "/employer-interviews",
      "/analytics",
      "/employer-analytics",
      "/team",
      "/employer-team",
    ].some((p) => currentPath === p || currentPath.startsWith(p + "/")) ||
    currentPath.startsWith("/job/") ||
    currentPath.startsWith("/editjob/") ||
    [
      "/userdashboard",
      "/myapplications",
      "/profile",
      "/editprofile",
      "/editprofile2",
      "/jobseeker-documents",
      "/jobseekerdoc",
      "/resume-builder",
      "/resumebuilder",
    ].some((p) => currentPath === p || currentPath.startsWith(p + "/")) ||
    currentPath.startsWith("/apply/");

  // Close menus on page change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Click outside listener for user dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileMenuOpen]);

  // Rule: Do NOT render public navigation on standalone auth routes or authenticated portal layouts
  if (isStandaloneAuth || isPortalLayout || window.__TAURI__) {
    return null;
  }

  // --- 2. AUTHENTICATION & USER PROFILE RECOGNITION ---
  const activeUser = user || employer || admin;
  const isJobseeker = role === "jobseeker" || Boolean(user && !employer && !admin);
  const isEmployer = role === "employer" || Boolean(employer && !admin);
  const isAdmin = role === "admin" || Boolean(admin);

  const displayName = activeUser?.name || activeUser?.companyName || "Account";
  const displayEmail = activeUser?.email || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const portalRoute = isAdmin
    ? "/admin/dashboard"
    : isEmployer
    ? "/employerdashboard"
    : isJobseeker
    ? "/userdashboard"
    : "/login";

  const portalLabel = isAdmin
    ? "Admin Console"
    : isEmployer
    ? "ATS Portal"
    : "Career Center";

  // --- 3. PUBLIC NAVIGATION LINKS ---
  const publicLinks = [
    { to: "/jobs", label: "Find Jobs", icon: Briefcase },
    { to: "/companies", label: "Companies", icon: Building2 },
    { to: "/services", label: "Services", icon: Sparkles },
    { to: "/about", label: "About", icon: Info },
    { to: "/contact", label: "Contact", icon: PhoneCall },
  ];

  const isLinkActive = (to) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate("/");
  };

  return (
    <>
      <header
        role="banner"
        className="fixed top-3 sm:top-4 inset-x-3 sm:inset-x-6 md:inset-x-8 max-w-7xl mx-auto z-50 pointer-events-none"
      >
        <div className="floating-nav-glass pointer-events-auto rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 shadow-xl flex items-center justify-between gap-4">
          {/* ──── BRAND LOGO ────────────────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-lg"
            aria-label="JobOne Homepage"
          >
            <LogoJobOne
              width={140}
              height={40}
              textColor={isDark ? "#FFFFFF" : "#0F172A"}
              className="h-7 sm:h-8 w-auto group-hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* ──── DESKTOP NAVIGATION MENU ────────────────────────────────── */}
          <nav
            aria-label="Public Navigation"
            className="hidden md:flex items-center gap-1 lg:gap-1.5"
          >
            {publicLinks.map((link) => {
              const active = isLinkActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 select-none ${
                    active
                      ? "bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold shadow-xs"
                      : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ──── RIGHT ACTION CONTROLS ──────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {/* Theme Toggle Pill (Light, Dark, System) */}
            <div className="flex items-center p-0.5 rounded-full border border-[var(--theme-border)] bg-[var(--theme-card)] shadow-2xs">
              <button
                type="button"
                onClick={() => setTheme("light")}
                title="Light mode"
                aria-label="Switch to Light mode"
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  theme === "light"
                    ? "bg-[var(--theme-text)] text-[var(--theme-bg)] shadow-xs"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                title="Dark mode"
                aria-label="Switch to Dark mode"
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  theme === "dark"
                    ? "bg-[var(--theme-text)] text-[var(--theme-bg)] shadow-xs"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("default")}
                title="System default theme"
                aria-label="Switch to System default theme"
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  theme === "default"
                    ? "bg-[var(--theme-text)] text-[var(--theme-bg)] shadow-xs"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* If Authenticated: Portal Shortcut Pill + User Avatar Menu */}
            {authStatus === "authenticated" && activeUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to={portalRoute}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-[var(--theme-border-silver)] bg-[var(--theme-card)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] transition flex items-center gap-1.5 shadow-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{portalLabel}</span>
                </Link>

                <div className="relative" ref={userDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                    aria-label="User profile menu"
                    className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full border border-[var(--theme-border)] bg-[var(--theme-card)] hover:border-zinc-400 transition cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-zinc-700 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {initials}
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[var(--theme-text-muted)] transition-transform duration-200 ${
                        userDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--theme-border-silver)] bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-2xl p-2 z-50 overflow-hidden"
                      >
                        <div className="p-2.5 border-b border-[var(--theme-border)]">
                          <p className="text-xs font-bold truncate">{displayName}</p>
                          {displayEmail && (
                            <p className="text-[10px] text-[var(--theme-text-muted)] truncate mt-0.5">
                              {displayEmail}
                            </p>
                          )}
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[var(--theme-card)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)]">
                            {role || "Member"}
                          </span>
                        </div>

                        <div className="py-1 space-y-0.5">
                          <Link
                            to={portalRoute}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Dashboard Command</span>
                          </Link>

                          {isJobseeker && (
                            <>
                              <Link
                                to="/profile"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition"
                              >
                                <User className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Candidate Profile</span>
                              </Link>
                              <Link
                                to="/myapplications"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition"
                              >
                                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                                <span>My Applications</span>
                              </Link>
                            </>
                          )}

                          {isEmployer && (
                            <>
                              <Link
                                to="/createjob"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Post a Job</span>
                              </Link>
                              <Link
                                to="/employerprofile"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition"
                              >
                                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Organization Profile</span>
                              </Link>
                            </>
                          )}
                        </div>

                        <div className="pt-1 border-t border-[var(--theme-border)]">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition cursor-pointer text-left"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              /* If Guest: Sign In & Hire Talent CTAs */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/employerregisteroption"
                  className="px-4 py-2 rounded-full text-xs font-bold bg-white dark:bg-white text-black hover:bg-zinc-200 dark:hover:bg-zinc-200 transition shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Hire Talent</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* ──── MOBILE CONTROLS ────────────────────────────────────────── */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle theme"
              className="p-2 rounded-xl border border-[var(--theme-border)] text-[var(--theme-text)] bg-[var(--theme-card)]"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="p-2 rounded-xl border border-[var(--theme-border)] text-[var(--theme-text)] bg-[var(--theme-card)] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ──── MOBILE RESPONSIVE NAVIGATION DRAWER ─────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Slide Down Panel */}
            <motion.div
              id="mobile-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative z-50 w-full mt-20 mx-3 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-2xl p-6 flex flex-col space-y-5 max-h-[80vh] overflow-y-auto"
            >
              {/* Authenticated User Status inside mobile */}
              {authStatus === "authenticated" && activeUser && (
                <div className="p-3.5 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{displayName}</p>
                      <p className="text-xs text-[var(--theme-text-muted)] truncate">{displayEmail}</p>
                    </div>
                  </div>
                  <Link
                    to={portalRoute}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--theme-text)] text-[var(--theme-bg)] shrink-0"
                  >
                    Open Portal
                  </Link>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                {publicLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isLinkActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                        active
                          ? "bg-[var(--theme-card)] text-[var(--theme-text)] font-bold border border-[var(--theme-border)]"
                          : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-card)]"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-zinc-400" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Guest Actions */}
              {authStatus !== "authenticated" && (
                <div className="pt-2 border-t border-[var(--theme-border)] space-y-2.5">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-2xl font-bold text-sm border border-[var(--theme-border)] text-center block text-[var(--theme-text)] hover:bg-[var(--theme-card)] transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/employerregisteroption"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-2xl font-bold text-sm bg-white dark:bg-white text-black text-center flex items-center justify-center gap-2 hover:bg-zinc-200 transition shadow-md cursor-pointer"
                  >
                    <span>Hire Talent &bull; Employer Onboarding</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Authenticated Logout */}
              {authStatus === "authenticated" && (
                <div className="pt-2 border-t border-[var(--theme-border)]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-3 rounded-2xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of Account</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
