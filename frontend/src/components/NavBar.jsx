import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LogoJobOne from "./LogoJobOne";
import axios from "axios";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  // --- 0. SCROLL DYNAMIC EFFECT ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down and past threshold
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // --- 1. DETERMINE ROLE ---
  const userInfoStr = localStorage.getItem("userInfo");
  const employerInfoStr = localStorage.getItem("employerInfo");
  const adminInfoStr = localStorage.getItem("adminInfo");
  
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const employerInfo = employerInfoStr ? JSON.parse(employerInfoStr) : null;
  const adminInfo = adminInfoStr ? JSON.parse(adminInfoStr) : null;

  let employerType = "company"; // default fallback
  if (employerInfo && employerInfo.employerType) {
    employerType = employerInfo.employerType;
  }

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

  const handleExportDB = () => {
    navigate("/admin/dashboard?tab=exportDB");
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("employerToken");
    localStorage.removeItem("employerInfo");

    setMenuOpen(false);
    setUserMenuOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (
    ["/login", "/register", "/employerregister"].includes(location.pathname)
  ) {
    return null;
  }

  const handleEmployerClick = () => {
    if (isEmployer) {
      navigate("/employerdashboard");
    } else {
      navigate("/employerregister");
    }
    setMenuOpen(false);
  };

  // --- DYNAMIC NAV LINK COMPONENT ---
  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`relative font-semibold text-sm transition-colors duration-300 group ${
        scrolled
          ? "text-white/90 hover:text-white"
          : "text-white/90 hover:text-white"
      }`}
    >
      {children}
      <span
        className={`absolute -bottom-1 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full rounded-full ${
          scrolled ? "bg-blue-600" : "bg-white"
        }`}
      ></span>
    </Link>
  );

  const isHomePage = location.pathname === "/";
  const mobileSolid = !isHomePage;

  if (window.__TAURI__) {
    return null;
  }

  return (
    <nav
      className={`fixed w-full z-[100] top-0 left-0 font-sans transition-all duration-300 pt-10 md:pt-6 lg:pt-[env(safe-area-inset-top)] ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      } ${
        scrolled || menuOpen || mobileSolid
          ? "bg-white shadow-sm md:shadow-none md:bg-black/40 md:backdrop-blur-sm md:backdrop-saturate-200"
          : "bg-black/5 md:bg-black/40 md:backdrop-blur-sm md:backdrop-saturate-200"
      }`}
    >
      <div className="container mx-auto px-5 lg:px-10 flex justify-between items-center">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center transition-opacity duration-300 hover:opacity-80"
          onClick={() => setMenuOpen(false)}
        >
          {/* Mobile Logo */}
          <div className="block md:hidden">
            <LogoJobOne
              width={350}
              height={200}
              textColor={scrolled || menuOpen || mobileSolid ? "#000000" : "#FFFFFF"}
              className="h-15 w-auto"
            />
          </div>
          {/* Desktop Logo */}
          <div className="hidden md:block">
            <LogoJobOne
              width={350}
              height={200}
              textColor="#FFFFFF"
              className="h-25 w-auto"
            />
          </div>
        </Link>

        {/* --- DESKTOP MENU --- */}
        <div className="hidden md:flex items-center space-x-8">
          {!isAdmin && (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/contact">Contact Us</NavLink>
            </>
          )}

          {activeRole === "guest" && (
            <>
              <NavLink to="/jobs">Find Jobs</NavLink>
              <NavLink to="/employerregister">Post a Job</NavLink>
            </>
          )}

          {isUser && <NavLink to="/jobs">Find Jobs</NavLink>}

          {isEmployer && <NavLink to="/createjob">Post a Job</NavLink>}

          {isAdmin && (
            <button
              onClick={handleExportDB}
              className={`px-5 py-2.5 flex items-center gap-2 rounded-full font-bold transition-all text-sm ${
                scrolled
                  ? "bg-emerald-600 text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.4)] hover:bg-emerald-500 hover:-translate-y-0.5"
                  : "bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-emerald-400 hover:-translate-y-0.5"
              }`}
            >
              <Download size={16} /> Export DB to Excel
            </button>
          )}

          {/* Profile Dropdown / Login Button */}
          {activeRole !== "guest" && !isAdmin ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 focus:outline-none transition-all px-3 py-1.5 rounded-full border ${
                  scrolled
                    ? "bg-white/50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border-slate-200/50 hover:border-blue-200"
                    : "bg-white/50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border-slate-200/50 hover:border-blue-200"
                }`}
              >
                <UserCircle
                  size={22}
                  className={userMenuOpen && scrolled ? "text-blue-600" : ""}
                />
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${userMenuOpen && scrolled ? "rotate-180 text-blue-600" : userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-3xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-2 z-50 border border-slate-100 origin-top-right"
                  >
                    {isEmployer && (
                      <div className="px-2 space-y-1">
                        <Link
                          to="/employerdashboard"
                          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <Link
                          to="/employerprofile"
                          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Building size={16} /> {employerType === "individual" ? "Employer Profile" : "Company Profile"}
                        </Link>
                      </div>
                    )}

                    {isUser && (
                      <div className="px-2 space-y-1">
                        <Link
                          to="/userdashboard"
                          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User size={16} /> My Profile
                        </Link>
                        <Link
                          to="/myapplications"
                          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Briefcase size={16} /> My Applications
                        </Link>
                        <Link
                          to="/recommended-jobs"
                          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Sparkles size={16} className="text-amber-500" />{" "}
                          Recommended Jobs
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-slate-100 my-2 mx-3"></div>
                    <div className="px-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : activeRole === "guest" ? (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className={`font-semibold text-sm transition-colors duration-300 ${scrolled ? "text-slate-600 hover:text-blue-600" : "text-white/90 hover:text-white"}`}
              >
                Login
              </Link>
              <button
                onClick={handleEmployerClick}
                className={`px-5 py-2.5 rounded-full font-bold transition-all text-sm flex items-center gap-2 ${
                  scrolled
                    ? "bg-blue-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:-translate-y-0.5"
                    : "bg-white text-blue-700 shadow-[0_4px_14px_rgba(255,255,255,0.2)] hover:bg-slate-50 hover:-translate-y-0.5"
                }`}
              >
                For Employers{" "}
                <span className="text-lg leading-none mb-0.5">›</span>
              </button>
            </div>
          ) : null}
        </div>

        {/* --- MOBILE HAMBURGER --- */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`focus:outline-none p-2 rounded-full transition-colors duration-300 ${
              scrolled || menuOpen || mobileSolid
                ? "text-slate-900 hover:bg-slate-100"
                : "text-white hover:bg-white/10"
            }`}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="md:hidden absolute w-full left-0 top-[100%] bg-white/90 backdrop-blur-3xl backdrop-saturate-200 border-b border-slate-200/50 shadow-2xl py-6 px-6 flex flex-col space-y-5"
          >
            {/* Note: Mobile menu text is always dark since the dropdown background is white/glass */}
            {!isAdmin && (
              <>
                <Link
                  to="/"
                  className="text-slate-700 font-bold text-lg hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/contact"
                  className="text-slate-700 font-bold text-lg hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Contact Us
                </Link>
              </>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  handleExportDB();
                  setMenuOpen(false);
                }}
                className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold flex justify-center items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-colors"
              >
                <Download size={20} /> Export DB to Excel
              </button>
            )}

            {activeRole === "guest" && (
              <>
                <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                  <Link
                    to="/jobs"
                    className="text-center w-full py-3 border-2 border-slate-200 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Find Jobs
                  </Link>
                  <Link
                    to="/login"
                    className="text-center w-full py-3 border-2 border-slate-200 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <button
                    onClick={handleEmployerClick}
                    className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-colors"
                  >
                    For Employers
                  </button>
                </div>
              </>
            )}

            {isEmployer && (
              <>
                <Link
                  to="/createjob"
                  className="text-slate-700 font-bold text-lg hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Post a Job
                </Link>
                <Link
                  to="/employerdashboard"
                  className="text-slate-700 font-bold text-lg hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/employerprofile"
                  className="text-slate-700 font-bold text-lg hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  {employerType === "individual" ? "Employer Profile" : "Company Profile"}
                </Link>
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="text-rose-600 font-bold text-lg flex items-center gap-2 py-2"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </div>
              </>
            )}

            {isUser && (
              <>
                <Link
                  to="/jobs"
                  className="text-slate-700 font-bold text-lg hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Find Jobs
                </Link>
                <Link
                  to="/userdashboard"
                  className="text-slate-700 font-bold text-lg hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="text-slate-700 font-bold text-lg hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/myapplications"
                  className="text-slate-700 font-bold text-lg hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  My Applications
                </Link>
                <Link
                  to="/recommended-jobs"
                  className="text-slate-700 font-bold text-lg hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Recommended Jobs
                </Link>
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="text-rose-600 font-bold text-lg flex items-center gap-2 py-2"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
