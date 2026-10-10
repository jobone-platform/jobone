import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Home, Briefcase, LayoutDashboard, User, LogIn, PlusCircle, Building, Menu, PhoneCall, X, FileText, Star, LogOut, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileBottomNav() {
  const [isTauri, setIsTauri] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    if (window.__TAURI__) {
      setIsTauri(true);
    }
  }, []);

  // Close "More" menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close "More" menu when route changes
  useEffect(() => {
    setShowMoreMenu(false);
  }, [location.pathname]);

  if (!isTauri) return null;

  // Determine active role
  const userInfoStr = localStorage.getItem("userInfo");
  const employerInfoStr = localStorage.getItem("employerInfo");
  const adminInfoStr = localStorage.getItem("adminInfo");
  
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const employerInfo = employerInfoStr ? JSON.parse(employerInfoStr) : null;
  const adminInfo = adminInfoStr ? JSON.parse(adminInfoStr) : null;

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

  // Admin interface is strictly Desktop Web focused
  if (activeRole === "admin") return null;

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("employerInfo");
    localStorage.removeItem("adminInfo");
    setShowMoreMenu(false);
    navigate("/login");
  };

  // ----------------------------------------
  // LINKS & MORE OPTIONS CONFIGURATION
  // ----------------------------------------
  
  // JOBSEEKER (USER) LINKS
  const userLinks = [
    { name: 'Dashboard', path: '/userdashboard', icon: LayoutDashboard },
    { name: 'Find Jobs', path: '/jobs', icon: Briefcase },
    { name: 'My Apps', path: '/myapplications', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'More', path: '#', icon: Menu },
  ];
  
  const userMoreOptions = [
    { name: 'Contact Us', path: '/contact', icon: PhoneCall },
    { name: 'Recommended', path: '/recommended-jobs', icon: Star },
    { name: 'Home', path: '/', icon: Home },
    { name: 'LogOut', action: handleLogout, icon: LogOut, danger: true },
  ];

  // EMPLOYER LINKS
  const employerLinks = [
    { name: 'Dashboard', path: '/employerdashboard', icon: LayoutDashboard },
    { name: 'Find Cands', path: '/candidates', icon: Search },
    { name: 'Post Job', path: '/createjob', icon: PlusCircle },
    { name: 'Company', path: '/employerprofile', icon: Building },
    { name: 'More', path: '#', icon: Menu },
  ];

  const employerMoreOptions = [
    { name: 'Contact Us', path: '/contact', icon: PhoneCall },
    { name: 'Home', path: '/', icon: Home },
    { name: 'LogOut', action: handleLogout, icon: LogOut, danger: true },
  ];

  // GUEST LINKS
  const guestLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Login', path: '/login', icon: LogIn },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Post Job', path: '/employerregister', icon: PlusCircle },
    { name: 'More', path: '#', icon: Menu },
  ];

  const guestMoreOptions = [
    { name: 'Contact Us', path: '/contact', icon: PhoneCall },
    { name: 'Register', path: '/userregister', icon: User },
  ];

  let links = guestLinks;
  let moreOptions = guestMoreOptions;
  
  if (activeRole === 'user') {
    links = userLinks;
    moreOptions = userMoreOptions;
  } else if (activeRole === 'employer') {
    links = employerLinks;
    moreOptions = employerMoreOptions;
  }

  const handleLinkClick = (link) => {
    if (link.name === 'More') {
      setShowMoreMenu(!showMoreMenu);
    } else {
      navigate(link.path);
    }
  };

  return (
    <div className="fixed bottom-4 left-0 w-full z-[1000] pb-2 px-4 flex justify-center pointer-events-none">
      
      {/* "More" Menu Popup */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-[4.5rem] right-6 bg-slate-900/95 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl pointer-events-auto flex flex-col min-w-[180px]"
          >
            <div className="flex justify-between items-center px-3 py-2 border-b border-white/10 mb-2">
              <span className="text-white/80 font-semibold text-sm">More Options</span>
              <button onClick={() => setShowMoreMenu(false)} className="text-white/50 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            {moreOptions.map((opt) => (
              opt.action ? (
                <button 
                  key={opt.name}
                  onClick={opt.action}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors ${opt.danger ? 'text-rose-400 hover:text-rose-300' : 'text-white'}`}
                >
                  <opt.icon size={18} />
                  <span className="font-semibold text-sm">{opt.name}</span>
                </button>
              ) : (
                <Link 
                  key={opt.name}
                  to={opt.path} 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-white transition-colors"
                >
                  <opt.icon size={18} />
                  <span className="font-semibold text-sm">{opt.name}</span>
                </Link>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bottom Nav Bar */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        className="liquid-glass rounded-full px-2 py-2 flex justify-between items-center w-full max-w-[400px] pointer-events-auto"
      >
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path && link.name !== 'More';
          
          return (
            <button
              key={link.name}
              onClick={() => handleLinkClick(link)}
              className={`relative flex items-center justify-center h-12 transition-all duration-500 ease-out rounded-full ${
                isActive 
                  ? "px-4 bg-blue-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.4)] flex-row gap-2" 
                  : "w-16 flex-col gap-1 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon size={isActive ? 20 : 22} className="relative z-10 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              
              {isActive ? (
                <AnimatePresence>
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="font-bold text-[13px] whitespace-nowrap overflow-hidden relative z-10"
                  >
                    {link.name}
                  </motion.span>
                </AnimatePresence>
              ) : (
                <span className="text-[10px] font-semibold tracking-tight leading-none text-center px-1">
                  {link.name}
                </span>
              )}
            </button>
          )
        })}
      </motion.div>
    </div>
  );
}
