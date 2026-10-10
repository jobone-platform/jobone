import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaBriefcase,
  FaSearch,
  FaUserTie,
  FaBuilding,
} from "react-icons/fa";
import axios from "axios";
import heroVideo from "../assets/herovideo.mp4";
import MobileHeroBg from "./MobileHeroBg";

const Typewriter = () => {
  const words = ["Dream Career", "Future Role", "Remote Gig", "Next Chapter"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    // Disable continuous JS typing loops on Android/mobile to save massive power
    if (window.innerWidth <= 768) {
      setDisplayText("Dream Career");
      return;
    }

    const handleTyping = () => {
      const fullWord = words[currentWordIndex];

      if (isDeleting) {
        setDisplayText(fullWord.substring(0, displayText.length - 1));
        setTypingSpeed(40);
      } else {
        setDisplayText(fullWord.substring(0, displayText.length + 1));
        setTypingSpeed(120);
      }

      if (!isDeleting && displayText === fullWord) {
        setTimeout(() => setIsDeleting(true), 2500);
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentWordIndex]);

  return <>{displayText}</>;
};

export default function HeroSection() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  // --- Auth State ---
  const isLoggedIn =
    localStorage.getItem("userToken") || localStorage.getItem("employerToken");

  // --- Quick Register State ---
  const [regTab, setRegTab] = useState("jobseeker");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  const [regData, setRegData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
    companyEmail: "",
    userType: "Company",
  });

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(
      `/jobs?title=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}`,
    );
  };

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  const handleQuickRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegLoading(true);

    try {
      if (regTab === "jobseeker") {
        const { data } = await axios.post(
          "https://jobone-mrpy.onrender.com/user/register",
          {
            name: regData.name,
            email: regData.email,
            password: regData.password,
            phone: regData.phone,
          },
        );
        navigate("/userotp", { state: { email: data.email } });
      } else {
        const { data } = await axios.post(
          "https://jobone-mrpy.onrender.com/employer/register",
          {
            name: regData.name,
            email: regData.email,
            password: regData.password,
            phone: regData.phone,
            companyName:
              regData.userType === "Company" ? regData.companyName : "",
          },
        );
        localStorage.setItem("employerInfo", JSON.stringify(data));
        navigate("/employerotp");
      }
    } catch (err) {
      setRegError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed. Please try again.",
      );
    } finally {
      setRegLoading(false);
    }
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 70, damping: 15 },
    },
  };

  return (
    // FACT: Mobile fix - Changed fixed h-[85vh] to min-h-[100dvh] so the page can scroll on small devices
    // Added pt-28 pb-6 so the content isn't hidden under your transparent navbar and fits mobile screens better
    <section className="relative w-full min-h-[90dvh] lg:min-h-[750px] lg:h-[85vh] flex lg:items-center justify-center overflow-hidden font-sans pt-28 pb-6 lg:pt-36 lg:pb-16">
      {/* Video for desktop */}
      {!window.__TAURI__ && (
        <video
          className="absolute inset-0 w-full h-full object-cover scale-105 hidden md:block"
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      {/* Animated CSS component for mobile */}
      <MobileHeroBg />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/75 to-slate-900/95 backdrop-blur-[4px] hidden md:block" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
        {/* FACT: Adjusted gap for mobile so forms aren't pushed too far down */}
        <div
          className={`flex flex-col ${!isLoggedIn ? "lg:flex-row" : ""} items-center justify-between gap-10 lg:gap-12`}
        >
          {/* LEFT SIDE: Hero Text & Search */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={`flex flex-col ${!isLoggedIn ? "lg:items-start lg:text-left items-center text-center lg:w-1/2" : "items-center text-center w-full max-w-4xl mx-auto mt-16 sm:mt-24 lg:mt-0"}`}
          >
            <motion.span
              variants={itemVariants}
              className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs md:text-sm font-semibold mb-6 tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-md"
            >
              ✨ Your first step to the future
            </motion.span>

            {/* FACT: Toned down mobile text sizes to prevent horizontal clipping */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.15] tracking-tight mb-5"
            >
              Find your <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-400 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent min-h-[1.2em] inline-block ml-1 md:ml-0">
                <Typewriter />
                <span className="text-blue-400 animate-pulse ml-1">|</span>
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className={`hidden md:block text-slate-300 text-sm sm:text-base md:text-lg font-medium mb-8 leading-relaxed ${!isLoggedIn ? "lg:mx-0" : "mx-auto"} max-w-2xl px-2 md:px-0`}
            >
              Stop searching and start growing. Discover the roles that
              perfectly fit your life, skills, and ambitions.
            </motion.p>

            <motion.form
              variants={itemVariants}
              onSubmit={handleSearch}
              className={`w-full flex-col md:flex-row items-center bg-black/5 md:bg-white/5 md:backdrop-blur-md p-2 rounded-3xl md:rounded-full border border-white/10 shadow-2xl transition-all focus-within:border-blue-500/50 focus-within:bg-black/5 md:focus-within:bg-white/10 gap-2 md:gap-0 ${!isLoggedIn ? 'hidden md:flex' : 'flex'}`}
            >
              <div className="flex items-center px-4 py-3 md:py-2 flex-1 w-full md:border-r border-white/10 group">
                <FaBriefcase className="text-blue-400/70 group-focus-within:text-blue-400 mr-3 shrink-0 text-base transition-colors" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Job title, keyword, or company"
                  className="w-full bg-transparent outline-none text-white placeholder-slate-400 text-sm md:text-base font-medium"
                />
              </div>

              {/* FACT: Added mobile divider (border-t) with proper spacing */}
              <div className="flex items-center px-4 py-3 md:py-2 flex-1 w-full border-t border-white/10 md:border-t-0 group">
                <FaMapMarkerAlt className="text-blue-400/70 group-focus-within:text-blue-400 mr-3 shrink-0 text-base transition-colors" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, state, or 'Remote'"
                  className="w-full bg-transparent outline-none text-white placeholder-slate-400 text-sm md:text-base font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 md:py-3 rounded-2xl md:rounded-full transition-all text-sm md:text-base shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2"
              >
                <FaSearch size={14} />
                Search
              </button>
            </motion.form>
          </motion.div>

          {/* RIGHT SIDE: Dark Glassmorphism Registration Form */}
          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              // FACT: Adjusted padding on mobile to give inputs more room, replaced glassmorphism with 95% transparent black on mobile
              className="w-full lg:w-5/12 max-w-md mx-auto lg:mx-0 bg-black/5 md:bg-slate-900/50 md:backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl hidden md:block" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl hidden md:block" />

              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Create an Account
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-6">
                  Join thousands of professionals and top companies.
                </p>

                {/* Tabs */}
                <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/10">
                  <button
                    onClick={() => {
                      setRegTab("jobseeker");
                      setRegError("");
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${regTab === "jobseeker" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                  >
                    <FaUserTie /> Jobseeker
                  </button>
                  <button
                    onClick={() => {
                      setRegTab("employer");
                      setRegError("");
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${regTab === "employer" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                  >
                    <FaBuilding /> Employer
                  </button>
                </div>

                {regError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl mb-4">
                    {regError}
                  </div>
                )}

                <form onSubmit={handleQuickRegister} className="space-y-3.5">
                  {/* Employer User Type Toggle */}
                  {regTab === "employer" && (
                    <div className="flex gap-5 p-1 mb-1">
                      <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer hover:text-white transition-colors">
                        <input
                          type="radio"
                          name="userType"
                          value="Company"
                          checked={regData.userType === "Company"}
                          onChange={handleRegChange}
                          className="accent-indigo-500 w-4 h-4"
                        />
                        Company
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer hover:text-white transition-colors">
                        <input
                          type="radio"
                          name="userType"
                          value="Individual"
                          checked={regData.userType === "Individual"}
                          onChange={handleRegChange}
                          className="accent-indigo-500 w-4 h-4"
                        />
                        Individual
                      </label>
                    </div>
                  )}

                  <input
                    type="text"
                    name="name"
                    required
                    value={regData.name}
                    onChange={handleRegChange}
                    placeholder={
                      regTab === "jobseeker"
                        ? "Full Name"
                        : "Contact Person Name"
                    }
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm rounded-xl p-3 sm:p-3.5 outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    value={regData.email}
                    onChange={handleRegChange}
                    placeholder="Primary Email Address"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm rounded-xl p-3 sm:p-3.5 outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                  />

                  {/* FACT: Fixed the Phone input layout for mobile using w-[85px] shrink-0 */}
                  <div className="flex gap-2">
                    <select className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-2 py-3 sm:py-3.5 outline-none focus:border-blue-500 focus:bg-white/10 transition-colors w-[85px] shrink-0">
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={regData.phone}
                      onChange={handleRegChange}
                      placeholder="Mobile Number"
                      className="flex-1 min-w-0 bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm rounded-xl p-3 sm:p-3.5 outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  {regTab === "employer" && regData.userType === "Company" && (
                    <div className="space-y-3.5">
                      <input
                        type="text"
                        name="companyName"
                        required
                        value={regData.companyName}
                        onChange={handleRegChange}
                        placeholder="Company Name"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm rounded-xl p-3 sm:p-3.5 outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                      />
                      <input
                        type="email"
                        name="companyEmail"
                        value={regData.companyEmail}
                        onChange={handleRegChange}
                        placeholder="Company Email (Optional)"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm rounded-xl p-3 sm:p-3.5 outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors"
                      />
                    </div>
                  )}

                  <input
                    type="password"
                    name="password"
                    required
                    minLength="6"
                    value={regData.password}
                    onChange={handleRegChange}
                    placeholder="Password (min 6 characters)"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm rounded-xl p-3 sm:p-3.5 outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={regLoading}
                    className={`w-full py-3.5 rounded-xl text-white font-bold text-sm mt-3 transition-all shadow-lg ${regTab === "jobseeker" ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"} disabled:opacity-50`}
                  >
                    {regLoading
                      ? "Creating Account..."
                      : `Join as ${regTab === "jobseeker" ? "Jobseeker" : "Employer"}`}
                  </button>
                </form>

                <p className="text-center text-xs text-slate-400 mt-5">
                  Already have an account?{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className="text-blue-400 hover:text-blue-300 cursor-pointer font-semibold"
                  >
                    Sign in here
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
