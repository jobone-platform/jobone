import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaBriefcase, FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import "./HeroRain.scss"; // Import the rain styles

const Hero = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [stats, setStats] = useState({
    liveJobs: "500+",
    companies: "100+",
    candidates: "1,000+",
    locations: "50+"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("https://jobone-mrpy.onrender.com/jobs/public-stats");
        setStats({
          liveJobs: res.data.liveJobs + "+",
          companies: res.data.companies + "+",
          candidates: res.data.candidates + "+",
          locations: res.data.locations + "+"
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(
      `/jobs?title=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}`,
    );
  };

  // Generate an array of 100 to map over for raindrops (optimized from 500)
  const drops = Array.from({ length: 100 });

  return (
    <section className="hero-rain-container flex items-center justify-center relative w-full min-h-[100dvh] pt-32 pb-20 overflow-hidden">
      {/* Static Glass Blobs (Optimized for Performance) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-cyan-700/30 mix-blend-screen blur-[100px]"
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-blue-800/30 mix-blend-screen blur-[120px]"
        />
        <div
          className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full bg-indigo-700/30 mix-blend-screen blur-[90px]"
        />
      </div>

      {/* Animated Rain Background */}
      <div className="rain">
        {drops.map((_, i) => (
          <div key={i} className="drop"></div>
        ))}
      </div>

      {/* Soft Glow Overlay - Optional but keeps the JobOne feel */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none z-10" />

      {/* CONTENT */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 pointer-events-none mt-10 lg:mt-0">
        {/* LEFT CONTENT */}
        <div className="flex-1 text-white pointer-events-auto flex flex-col items-center lg:items-start text-center lg:text-left w-full">
          <h1 className="text-4xl  md:text-5xl lg:text-6xl font-extrabold leading-tight text-white drop-shadow-md">
            Build Your Career with <br />
            <span className="text-cyan-300">JobOne</span>
          </h1>

          <p className="md:mt-6 text-blue-50 text-base md:text-lg max-w-xl font-medium drop-shadow-sm">
            Create an impressive profile, showcase your skills, and get
            discovered by top employers in a dynamic tech-driven ecosystem.
          </p>

          <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3 items-center w-full max-w-2xl">
            <button
              onClick={() => {
                const section = document.getElementById("jobs-near-me");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                  setTimeout(
                    () =>
                      window.dispatchEvent(new Event("autoTriggerLocation")),
                    500,
                  );
                }
              }}
              className="px-5 py-3 bg-gradient-to-r from-blue-500/40 to-cyan-400/40 backdrop-blur-sm border border-cyan-300/50 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:scale-105 transition transform duration-200 text-sm md:text-base whitespace-nowrap"
            >
              Find Jobs Near Me
            </button>

            <button
              onClick={() => {
                const section = document.getElementById("ai-recommended-jobs");
                if (section) section.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-5 py-3 bg-gradient-to-r from-indigo-500/30 to-purple-400/30 backdrop-blur-sm border border-indigo-300/50 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:-translate-y-1 transition transform duration-200 text-sm md:text-base whitespace-nowrap"
            >
              AI Recommended Jobs
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="px-5 py-3 bg-black/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 hover:border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition transform duration-200 text-sm md:text-base whitespace-nowrap"
            >
              Go to Profile
            </button>

            <button
              onClick={() => navigate("/jobs")}
              className="px-5 py-3 bg-black/5 backdrop-blur-sm border border-white/10 text-white/90 rounded-xl font-bold hover:bg-white/10 hover:border-white/30 hover:text-white transition duration-200 text-sm md:text-base whitespace-nowrap"
            >
              Browse Jobs
            </button>

            <button
              onClick={() => navigate("/companies")}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500/30 to-teal-400/30 backdrop-blur-sm border border-emerald-300/50 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition transform duration-200 text-sm md:text-base whitespace-nowrap"
            >
              Explore Companies
            </button>
          </div>

          <form
            onSubmit={handleSearch}
            className="mt-10 w-full max-w-2xl flex flex-col sm:flex-row items-center bg-black/5 backdrop-blur-md p-2 rounded-3xl sm:rounded-full border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all focus-within:border-cyan-400/50 focus-within:bg-white/10 gap-2 sm:gap-0"
          >
            <div className="flex items-center px-4 py-3 md:py-2 flex-1 w-full md:border-r border-white/20 group">
              <FaBriefcase className="text-cyan-400/70 group-focus-within:text-cyan-400 mr-3 shrink-0 text-base transition-colors" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Job title, keyword, or company"
                className="w-full bg-transparent outline-none text-white placeholder-blue-100/70 text-sm md:text-base font-medium"
              />
            </div>

            <div className="flex items-center px-4 py-3 sm:py-2 flex-1 w-full border-t border-white/20 sm:border-t-0 group">
              <FaMapMarkerAlt className="text-cyan-400/70 group-focus-within:text-cyan-400 mr-3 shrink-0 text-base transition-colors" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, state, or 'Remote'"
                className="w-full bg-transparent outline-none text-white placeholder-blue-100/70 text-sm md:text-base font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3.5 sm:py-3 rounded-2xl sm:rounded-full transition-all text-sm sm:text-base shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] flex items-center justify-center gap-2"
            >
              <FaSearch size={14} />
              Search
            </button>
          </form>
        </div>

        {/* RIGHT VISUAL - Glassmorphism Stats Grid */}
        <div className="flex-1 flex justify-center lg:justify-end items-center pointer-events-auto w-full mt-10 lg:mt-0">
          <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full max-w-md lg:max-w-lg">
            {/* Stat 1 */}
            <div className="bg-black/10 backdrop-blur-xs border border-white/20 rounded-xl p-6 flex flex-col items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition transform duration-300">
              <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {stats.liveJobs}
              </span>
              <span className="mt-2 text-sm md:text-base font-medium text-blue-100 uppercase tracking-wider">
                Live Jobs
              </span>
            </div>

            {/* Stat 2 */}
            <div className="bg-black/10 backdrop-blur-xs border border-white/20 rounded-xl p-6 flex flex-col items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition transform duration-300">
              <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {stats.companies}
              </span>
              <span className="mt-2 text-sm md:text-base font-medium text-blue-100 uppercase tracking-wider">
                Companies
              </span>
            </div>

            {/* Stat 3 */}
            <div className="bg-black/10 backdrop-blur-xs border border-white/20 rounded-xl p-6 flex flex-col items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition transform duration-300">
              <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {stats.candidates}
              </span>
              <span className="mt-2 text-sm md:text-base font-medium text-blue-100 uppercase tracking-wider">
                Candidates
              </span>
            </div>

            {/* Stat 4 */}
            <div className="bg-black/10 backdrop-blur-xs border border-white/20 rounded-xl p-6 flex flex-col items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition transform duration-300">
              <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {stats.locations}
              </span>
              <span className="mt-2 text-sm md:text-base font-medium text-blue-100 uppercase tracking-wider">
                Locations
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
