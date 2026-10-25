import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  UserCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  User,
  Briefcase,
  Sparkles,
  Building,
  Download,
  Sun,
  Moon,
  Monitor,
  Check,
  ArrowRight,
  Shield,
  FileText,
  PlusCircle,
  PhoneCall,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LogoJobOne from "./LogoJobOne";
import { useTheme } from "../routes/Context";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // --- 0. SCROLL EVENT LISTENER ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 15);

      if (currentScrollY > lastScrollY && currentScrollY > 90) {
        // Scrolling down and past threshold
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // --- 1. DETERMINE ROLE & AUTH DATA ---
  const [authData, setAuthData] = useState(() => {
    try {
      const u = localStorage.getItem("userInfo");
      const e = localStorage.getItem("employerInfo");
      const a = localStorage.getItem("adminInfo");
      return {
        userInfo: u ? JSON.parse(u) : null,
        employerInfo: e ? JSON.parse(e) : null,
        adminInfo: a ? JSON.parse(a) : null,
      };
    } catch {
      return { userInfo: null, employerInfo: null, adminInfo: null };
    }
  });

  // Re-sync auth data on location change
  useEffect(() => {
    try {
      const u = localStorage.getItem("userInfo");
      const e = localStorage.getItem("employerInfo");
      const a = localStorage.getItem("adminInfo");
      setAuthData({
        userInfo: u ? JSON.parse(u) : null,
        employerInfo: e ? JSON.parse(e) : null,
        adminInfo: a ? JSON.parse(a) : null,
      });
    } catch {
      // ignore
    }
  }, [location.pathname]);

  const { userInfo, employerInfo, adminInfo } = authData;

  let employerType = employerInfo?.employerType || "company";

  let activeRole = "guest";
  if (adminInfo && location.pathname.startsWith("/admin")) {
    activeRole = "admin";
  } else if (userInfo && !employerInfo) {
    activeRole = "user";
  } else if (!userInfo && employerInfo) {
    activeRole = "employer";
  } else if (userInfo && employerInfo) {
    if (location.pathname.startsWith("/employer")) {
      activeRole = "employer";
    } else {
      activeRole = "user";
    }
  }

  const isUser = activeRole === "user";
  const isEmployer = activeRole === "employer";
  const isAdmin = activeRole === "admin";

  const displayName = isUser
    ? userInfo?.name || userInfo?.fullName || "Candidate"
    : isEmployer
    ? employerInfo?.companyName || employerInfo?.name || "Employer"
    : isAdmin
    ? adminInfo?.name || "Administrator"
    : "";

  const displayEmail = isUser
    ? userInfo?.email || ""
    : isEmployer
    ? employerInfo?.email || ""
    : isAdmin
    ? adminInfo?.email || ""
    : "";

  const initials = displayName
    ? displayName
        .trim()
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "JO";

  const avatarGradient = isUser
    ? "bg-gradient-to-tr from-blue-600 to-indigo-600"
    : isEmployer
    ? "bg-gradient-to-tr from-indigo-600 to-violet-600"
    : "bg-gradient-to-tr from-emerald-600 to-teal-600";

  const roleLabel = isUser
    ? "Jobseeker"
    : isEmployer
    ? employerType === "individual"
      ? "Individual Recruiter"
      : "Verified Employer"
    : "Administrator";

  const roleBadgeStyle = isUser
    ? isDark
      ? "bg-blue-950/80 text-blue-300 border border-blue-800/60"
      : "bg-blue-50 text-blue-700 border border-blue-200"
    : isEmployer
    ? isDark
      ? "bg-indigo-950/80 text-indigo-300 border border-indigo-800/60"
      : "bg-indigo-50 text-indigo-700 border border-indigo-200"
    : isDark
    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
    : "bg-emerald-50 text-emerald-700 border border-emerald-200";

  // --- 2. OUTSIDE CLICK & ESCAPE KEY LISTENERS ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close menus on page navigation
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [menuOpen]);

  // --- 3. STANDALONE ROUTE SUPPRESSION ---
  const currentPath =
    location.pathname.toLowerCase().split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  const standaloneRoutes = [
    "/userotp",
    "/employerotp",
    "/verifyotp",
    "/verify-otp",
    "/login",
    "/register",
    "/userregister",
    "/employerregister",
    "/employer-register",
    "/employerregisteroption",
    "/admin/login",
  ];

  if (standaloneRoutes.includes(currentPath)) {
    return null;
  }

  if (window.__TAURI__) {
    return null;
  }

  // --- 4. ACTION HANDLERS ---
  const handleEmployerClick = () => {
    if (isEmployer) {
      navigate("/employerdashboard");
    } else {
      navigate("/employerregister");
    }
    setMenuOpen(false);
  };

  const handleExportDB = () => {
    navigate("/admin/dashboard?tab=exportDB");
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("employerToken");
    localStorage.removeItem("employerInfo");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");

    setMenuOpen(false);
    setUserMenuOpen(false);
    navigate(isAdmin ? "/admin/login" : "/login");
  };

  // --- 5. LOGO DESTINATION & THEME CALCULATIONS ---
  const logoDestination = adminInfo
    ? "/admin/dashboard"
    : isEmployer
    ? "/employerdashboard"
    : isUser
    ? "/userdashboard"
    : "/";

  const isHomePage = location.pathname === "/";
  const isTransparentHero = isHomePage && !scrolled && !menuOpen;

  const logoTextColor = isTransparentHero
    ? "#FFFFFF"
    : isDark
    ? "#FFFFFF"
    : "#0F172A";

  const isRouteActive = (to) => {
    if (to === "/") {
      return location.pathname === "/";
    }
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  // --- 6. NAVIGATION CONFIGURATION ---
  const navLinks = [
    ...(!isAdmin
      ? [
          { to: "/", label: "Home", icon: Home },
          { to: "/contact", label: "Contact Us", icon: PhoneCall },
        ]
      : []),
    ...(activeRole === "guest"
      ? [{ to: "/jobs", label: "Find Jobs", icon: Briefcase }]
      : []),
    ...(isUser
      ? [
          { to: "/jobs", label: "Find Jobs", icon: Briefcase },
          { to: "/userdashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/myapplications", label: "My Applications", icon: FileText },
          { to: "/recommended-jobs", label: "Recommended", icon: Sparkles },
        ]
      : []),
    ...(isEmployer
      ? [
          { to: "/employerdashboard", label: "Dashboard", icon: LayoutDashboard },
          { to: "/createjob", label: "Post a Job", icon: PlusCircle },
          {
            to: "/employerprofile",
            label: employerType === "individual" ? "Profile" : "Company",
            icon: Building,
          },
        ]
      : []),
  ];

  // Helper for link styling
  const getLinkClasses = (active) => {
    if (isTransparentHero) {
      return active
        ? "text-white bg-white/20 shadow-xs font-semibold"
        : "text-white/85 hover:text-white hover:bg-white/10 font-medium";
    }
    if (isDark) {
      return active
        ? "text-indigo-400 bg-indigo-950/70 shadow-xs font-semibold border border-indigo-800/40"
        : "text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium";
    }
    return active
      ? "text-indigo-600 bg-indigo-50/90 shadow-xs font-semibold border border-indigo-100"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium";
  };

  // --- 7. THEME TOGGLE SUB-COMPONENT ---
  const ThemeToggle = ({ isTransparent }) => {
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const themeDropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          themeDropdownRef.current &&
          !themeDropdownRef.current.contains(event.target)
        ) {
          setThemeMenuOpen(false);
        }
      };
      const handleKeyDown = (e) => {
        if (e.key === "Escape") setThemeMenuOpen(false);
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, []);

    const themeOptions = [
      { key: "light", label: "Light", icon: Sun },
      { key: "dark", label: "Dark", icon: Moon },
      { key: "default", label: "System", icon: Monitor },
    ];

    const CurrentIcon =
      theme === "default" ? Monitor : isDark ? Moon : Sun;

    return (
      <div className="relative" ref={themeDropdownRef}>
        <button
          type="button"
          onClick={() => setThemeMenuOpen(!themeMenuOpen)}
          title={`Theme: ${theme}`}
          aria-label="Theme settings"
          aria-haspopup="true"
          aria-expanded={themeMenuOpen}
          className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer ${
            isTransparent
              ? "bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-xs"
              : isDark
              ? "bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 shadow-xs"
              : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border-slate-200/80 shadow-xs"
          }`}
        >
          <CurrentIcon size={18} />
        </button>

        <AnimatePresence>
          {themeMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`absolute right-0 mt-2 w-38 backdrop-blur-xl rounded-2xl shadow-xl py-1.5 z-50 border overflow-hidden ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-slate-100 shadow-slate-950/50"
                  : "bg-white/95 border-slate-200/80 text-slate-800 shadow-slate-300/40"
              }`}
            >
              <div
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? "text-slate-400" : "text-slate-400"
                }`}
              >
                Appearance
              </div>
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setTheme(opt.key);
                      setThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                      active
                        ? isDark
                          ? "bg-indigo-950/70 text-indigo-400 font-bold"
                          : "bg-indigo-50 text-indigo-600 font-bold"
                        : isDark
                        ? "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                        : "text-slate-700 hover:bg-slate-100/70 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} />
                      <span>{opt.label}</span>
                    </div>
                    {active && (
                      <Check
                        size={14}
                        className={isDark ? "text-indigo-400" : "text-indigo-600"}
                      />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <header
        role="banner"
        className={`fixed w-full z-[100] top-0 left-0 transition-all duration-300 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        } ${
          isTransparentHero
            ? "bg-transparent md:bg-black/20 md:backdrop-blur-xs border-b border-white/10"
            : isDark
            ? "bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm text-slate-100"
            : "bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs text-slate-800"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 md:h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            to={logoDestination}
            className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-90 shrink-0"
            onClick={() => setMenuOpen(false)}
            aria-label="JobOne Home"
          >
            <div className="flex items-center">
              <LogoJobOne
                width={220}
                height={70}
                textColor={logoTextColor}
                className="h-9 md:h-11 w-auto"
              />
            </div>
            {isAdmin && (
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isDark
                    ? "bg-indigo-950/90 text-indigo-300 border border-indigo-800/60"
                    : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                }`}
              >
                <Shield size={12} /> Admin Portal
              </span>
            )}
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center space-x-1 lg:space-x-2"
          >
            {navLinks.map((link) => {
              const active = isRouteActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1.5 ${getLinkClasses(
                    active
                  )}`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* --- DESKTOP RIGHT CONTROLS --- */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Admin Export DB button */}
            {isAdmin && (
              <button
                type="button"
                onClick={handleExportDB}
                className="px-3.5 py-2 flex items-center gap-2 rounded-xl font-semibold transition-all duration-200 text-xs md:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md cursor-pointer"
              >
                <Download size={16} />
                <span>Export DB to Excel</span>
              </button>
            )}

            {/* Guest Actions */}
            {activeRole === "guest" && (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isTransparentHero
                      ? "text-white/90 hover:text-white hover:bg-white/10"
                      : isDark
                      ? "text-slate-200 hover:text-white hover:bg-slate-800/60"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  Login
                </Link>
                <button
                  type="button"
                  onClick={handleEmployerClick}
                  className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 text-sm flex items-center gap-1.5 cursor-pointer ${
                    isTransparentHero
                      ? "bg-white text-indigo-700 shadow-md hover:bg-slate-100 hover:shadow-lg hover:-translate-y-0.5"
                      : "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5"
                  }`}
                >
                  <span>For Employers</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* Logged-in Profile Menu */}
            {activeRole !== "guest" && (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User Account Menu"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  className={`flex items-center gap-2 focus:outline-none transition-all duration-200 px-2.5 py-1.5 rounded-xl border cursor-pointer ${
                    isTransparentHero
                      ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                      : isDark
                      ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100 hover:border-indigo-500"
                      : "bg-slate-100/80 hover:bg-slate-200/80 border-slate-200/80 text-slate-800 hover:border-indigo-300"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white ${avatarGradient}`}
                  >
                    {initials}
                  </div>
                  <span className="text-xs font-semibold max-w-[110px] truncate hidden lg:inline-block">
                    {displayName}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className={`absolute right-0 mt-2 w-64 backdrop-blur-xl rounded-2xl shadow-xl py-2 z-50 border origin-top-right overflow-hidden ${
                        isDark
                          ? "bg-slate-900 border-slate-700 text-slate-100 shadow-slate-950/50"
                          : "bg-white/95 border-slate-200/80 text-slate-800 shadow-slate-300/40"
                      }`}
                    >
                      {/* Dropdown User Header */}
                      <div
                        className={`px-4 py-3 border-b ${
                          isDark ? "border-slate-800" : "border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white ${avatarGradient} shrink-0`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold truncate">
                              {displayName}
                            </p>
                            {displayEmail && (
                              <p
                                className={`text-xs truncate ${
                                  isDark ? "text-slate-400" : "text-slate-500"
                                }`}
                              >
                                {displayEmail}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2.5">
                          <span
                            className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadgeStyle}`}
                          >
                            {roleLabel}
                          </span>
                        </div>
                      </div>

                      {/* Jobseeker Dropdown Links */}
                      {isUser && (
                        <div className="p-2 space-y-1">
                          <Link
                            to="/userdashboard"
                            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                              isDark
                                ? "text-slate-200 hover:bg-indigo-950/50 hover:text-indigo-400"
                                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LayoutDashboard size={16} /> Dashboard
                          </Link>
                          <Link
                            to="/profile"
                            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                              isDark
                                ? "text-slate-200 hover:bg-indigo-950/50 hover:text-indigo-400"
                                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User size={16} /> My Profile
                          </Link>
                          <Link
                            to="/myapplications"
                            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                              isDark
                                ? "text-slate-200 hover:bg-indigo-950/50 hover:text-indigo-400"
                                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Briefcase size={16} /> My Applications
                          </Link>
                          <Link
                            to="/recommended-jobs"
                            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                              isDark
                                ? "text-slate-200 hover:bg-indigo-950/50 hover:text-indigo-400"
                                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Sparkles size={16} className="text-amber-500" /> Recommended Jobs
                          </Link>
                        </div>
                      )}

                      {/* Employer Dropdown Links */}
                      {isEmployer && (
                        <div className="p-2 space-y-1">
                          <Link
                            to="/employerdashboard"
                            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                              isDark
                                ? "text-slate-200 hover:bg-indigo-950/50 hover:text-indigo-400"
                                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LayoutDashboard size={16} /> Dashboard
                          </Link>
                          <Link
                            to="/employerprofile"
                            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                              isDark
                                ? "text-slate-200 hover:bg-indigo-950/50 hover:text-indigo-400"
                                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Building size={16} />{" "}
                            {employerType === "individual"
                              ? "Employer Profile"
                              : "Company Profile"}
                          </Link>
                          <Link
                            to="/createjob"
                            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                              isDark
                                ? "text-slate-200 hover:bg-indigo-950/50 hover:text-indigo-400"
                                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <PlusCircle size={16} /> Post a Job
                          </Link>
                        </div>
                      )}

                      {/* Admin Dropdown Links */}
                      {isAdmin && (
                        <div className="p-2 space-y-1">
                          <Link
                            to="/admin/dashboard"
                            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                              isDark
                                ? "text-slate-200 hover:bg-indigo-950/50 hover:text-indigo-400"
                                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LayoutDashboard size={16} /> Admin Dashboard
                          </Link>
                          <button
                            type="button"
                            onClick={handleExportDB}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors text-left ${
                              isDark
                                ? "text-slate-200 hover:bg-indigo-950/50 hover:text-indigo-400"
                                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                          >
                            <Download size={16} /> Export DB to Excel
                          </button>
                        </div>
                      )}

                      {/* Logout Action */}
                      <div
                        className={`p-2 border-t ${
                          isDark ? "border-slate-800" : "border-slate-100"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={handleLogout}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-rose-600 rounded-xl transition-colors cursor-pointer ${
                            isDark ? "hover:bg-rose-950/40" : "hover:bg-rose-50"
                          }`}
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Theme Switcher Button */}
            <ThemeToggle isTransparent={isTransparentHero} />
          </div>

          {/* --- MOBILE RIGHT CONTROLS --- */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle isTransparent={isTransparentHero} />

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                isTransparentHero
                  ? "text-white border-white/20 bg-white/10 hover:bg-white/20"
                  : isDark
                  ? "text-slate-100 border-slate-700 bg-slate-800 hover:bg-slate-700"
                  : "text-slate-800 border-slate-200/80 bg-slate-100/80 hover:bg-slate-200"
              }`}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* --- MOBILE NAVIGATION DRAWER & BACKDROP --- */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="md:hidden fixed inset-0 top-18 bg-slate-950/60 backdrop-blur-xs z-[90]"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`md:hidden fixed top-18 left-0 w-full max-h-[calc(100vh-4.5rem)] overflow-y-auto backdrop-blur-2xl border-b shadow-2xl z-[95] py-5 px-5 flex flex-col space-y-4 ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-100"
                  : "bg-white/95 border-slate-200/80 text-slate-800"
              }`}
            >
              {/* User Profile Card if logged in */}
              {activeRole !== "guest" && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                    isDark
                      ? "bg-slate-800/80 border-slate-700/80"
                      : "bg-slate-50 border-slate-200/80"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-white ${avatarGradient} shrink-0`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">
                      {displayName}
                    </p>
                    {displayEmail && (
                      <p
                        className={`text-xs truncate ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {displayEmail}
                      </p>
                    )}
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadgeStyle}`}
                      >
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isRouteActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-colors ${
                        active
                          ? isDark
                            ? "bg-indigo-950/70 text-indigo-400 font-bold border border-indigo-800/40"
                            : "bg-indigo-50 text-indigo-600 font-bold border border-indigo-100"
                          : isDark
                          ? "text-slate-200 hover:bg-slate-800/60"
                          : "text-slate-700 hover:bg-slate-100/70"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Admin Export DB button in mobile */}
              {isAdmin && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExportDB}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-colors"
                  >
                    <Download size={18} /> Export DB to Excel
                  </button>
                </div>
              )}

              {/* Guest Action Buttons */}
              {activeRole === "guest" && (
                <div
                  className={`pt-2 border-t flex flex-col gap-2.5 ${
                    isDark ? "border-slate-800" : "border-slate-200/60"
                  }`}
                >
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className={`w-full py-3 text-center border rounded-xl font-bold transition-colors text-sm ${
                      isDark
                        ? "border-slate-700 text-slate-100 hover:bg-slate-800"
                        : "border-slate-300 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    Login
                  </Link>
                  <button
                    type="button"
                    onClick={handleEmployerClick}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <span>For Employers</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Theme Settings Selector inside Mobile Drawer */}
              <div
                className={`pt-3 border-t ${
                  isDark ? "border-slate-800" : "border-slate-200/60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isDark ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    Theme
                  </span>
                  <span
                    className={`text-xs capitalize ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {theme}
                  </span>
                </div>
                <div
                  className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl ${
                    isDark ? "bg-slate-800" : "bg-slate-100"
                  }`}
                >
                  {[
                    { key: "light", label: "Light", icon: Sun },
                    { key: "dark", label: "Dark", icon: Moon },
                    { key: "default", label: "System", icon: Monitor },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const active = theme === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setTheme(opt.key)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          active
                            ? isDark
                              ? "bg-slate-700 text-indigo-400 shadow-xs"
                              : "bg-white text-indigo-600 shadow-xs"
                            : isDark
                            ? "text-slate-400 hover:text-white"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Icon size={14} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logout in mobile drawer if logged in */}
              {activeRole !== "guest" && (
                <div
                  className={`pt-2 border-t ${
                    isDark ? "border-slate-800" : "border-slate-200/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 text-rose-600 font-bold text-sm rounded-xl transition-colors ${
                      isDark ? "hover:bg-rose-950/40" : "hover:bg-rose-50"
                    }`}
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
