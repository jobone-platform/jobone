import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  User,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import heroVideo from "../assets/herovideo.mp4";
import { useAuth } from "../routes/Context";

const ROLES = [
  "Engineering Leader",
  "Full-Stack Architect",
  "Product Designer",
  "DevOps Specialist",
  "Finance Director",
  "Growth Marketer",
];

const POPULAR_TAGS = [
  { label: "Remote", type: "location", val: "Remote" },
  { label: "Full-Stack", type: "title", val: "Full Stack" },
  { label: "Backend", type: "title", val: "Backend" },
  { label: "React", type: "title", val: "React" },
  { label: "Design", type: "title", val: "Design" },
  { label: "Product", type: "title", val: "Product" },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const { user, employer, authStatus } = useAuth();
  const isLoggedIn = !!(user || employer || localStorage.getItem("userToken") || localStorage.getItem("employerToken"));

  // --- Search State ---
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  // --- Role Typewriter State ---
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // --- Quick Register State ---
  const [cardTab, setCardTab] = useState("register"); // "register" | "highlights"
  const [regTab, setRegTab] = useState("jobseeker"); // "jobseeker" | "employer"
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
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (title.trim()) params.set("title", title.trim());
    if (location.trim()) params.set("location", location.trim());
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleQuickTagClick = (tag) => {
    if (tag.type === "location") {
      navigate(`/jobs?location=${encodeURIComponent(tag.val)}`);
    } else {
      navigate(`/jobs?title=${encodeURIComponent(tag.val)}`);
    }
  };

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setRegData((prev) => ({ ...prev, phone: digits }));
    } else {
      setRegData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleQuickRegister = async (e) => {
    e.preventDefault();
    if (regLoading) return;
    setRegError("");

    const trimmedName = regData.name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setRegError("Please enter your full name (minimum 2 characters).");
      return;
    }

    const normalizedEmail = regData.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      setRegError("Please enter a valid email address.");
      return;
    }

    const cleanPhone = regData.phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setRegError("Mobile number must be 10 digits starting with 6, 7, 8, or 9.");
      return;
    }

    if (!regData.password || regData.password.length < 6) {
      setRegError("Password must be at least 6 characters long.");
      return;
    }

    if (regTab === "employer" && regData.userType === "Company" && !regData.companyName.trim()) {
      setRegError("Company Name is required for company registrations.");
      return;
    }

    setRegLoading(true);

    try {
      if (regTab === "jobseeker") {
        await axios.post(`${API_BASE_URL}/user/register`, {
          name: trimmedName,
          email: normalizedEmail,
          password: regData.password,
          phone: cleanPhone,
          countryCode: "+91",
        });
        navigate("/userotp", { state: { email: normalizedEmail } });
      } else {
        await axios.post(`${API_BASE_URL}/employer/register`, {
          name: trimmedName,
          email: normalizedEmail,
          password: regData.password,
          phone: cleanPhone,
          countryCode: "+91",
          userType: regData.userType,
          companyName: regData.userType === "Company" ? regData.companyName.trim() : "",
        });
        navigate("/employerotp", { state: { email: normalizedEmail } });
      }
    } catch (err) {
      setRegError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed. Please check your details and try again."
      );
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <section className="relative w-full min-h-[92dvh] lg:min-h-[720px] flex items-center justify-center font-sans overflow-hidden bg-[var(--theme-bg)] text-[var(--theme-text)] pt-24 pb-16 lg:pt-32 lg:pb-20 transition-colors duration-150">
      {/* Background Architectural Video with Dark Fade Overlay */}
      {!window.__TAURI__ && (
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none hidden md:block"
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
        />
      )}

      {/* Ambient Gradient Highlights */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white/[0.03] dark:bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Sheen */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.06),transparent)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ─── LEFT: EDITORIAL ASYMMETRIC CONTENT & SEARCH (7 Cols) ────── */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Live Status Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] shadow-sm mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-[var(--theme-text)]">
                Direct Career Architecture & Verified Hiring
              </span>
            </motion.div>

            {/* Editorial Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] mb-5 text-[var(--theme-text)]"
            >
              Architect Your <br className="hidden sm:inline" />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[var(--theme-text)] via-[var(--theme-accent-silver)] to-[var(--theme-text)] bg-clip-text text-transparent">
                  Next Milestone.
                </span>
              </span>
            </motion.h1>

            {/* Dynamic Role Sub-heading */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-8 sm:h-9 flex items-center mb-6 overflow-hidden"
            >
              <span className="text-sm sm:text-base font-semibold text-[var(--theme-text-muted)] mr-2">
                Connecting top talent for:
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={roleIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28 }}
                  className="text-sm sm:text-base font-bold text-[var(--theme-accent-silver-sheen)] underline decoration-[var(--theme-border-silver)] underline-offset-4"
                >
                  {ROLES[roleIndex]}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-sm sm:text-base md:text-lg text-[var(--theme-text-muted)] font-normal leading-relaxed max-w-xl mb-8"
            >
              The double-sided recruitment marketplace engineered for transparency. Direct employer pipelines, authenticated company reviews, and high-precision career discovery.
            </motion.p>

            {/* ─── INTEGRATED JOB SEARCH BAR ───────────────────────────── */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onSubmit={handleSearch}
              className="w-full max-w-2xl bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] rounded-2xl md:rounded-full p-2 shadow-2xl flex flex-col md:flex-row items-stretch gap-2 transition-all focus-within:border-[var(--theme-border-focus)] focus-within:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            >
              {/* Job Title / Keyword Field */}
              <div className="flex items-center px-4 py-3 flex-1 border-b md:border-b-0 md:border-r border-[var(--theme-border)]">
                <Briefcase className="w-4 h-4 text-[var(--theme-accent-silver)] shrink-0 mr-3" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Job title, skills, or company"
                  aria-label="Job title or keywords"
                  className="w-full bg-transparent text-sm font-medium text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] outline-none"
                />
              </div>

              {/* Location Field */}
              <div className="flex items-center px-4 py-3 flex-1">
                <MapPin className="w-4 h-4 text-[var(--theme-accent-silver)] shrink-0 mr-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location or 'Remote'"
                  aria-label="Job location"
                  className="w-full bg-transparent text-sm font-medium text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] outline-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl md:rounded-full bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[var(--theme-accent-silver)]" />
                <span>Search Jobs</span>
              </button>
            </motion.form>

            {/* Quick Popular Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-2 flex-wrap mt-4 text-xs text-[var(--theme-text-subtle)]"
            >
              <span className="font-semibold flex items-center gap-1 text-[var(--theme-text-muted)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" />
                Popular:
              </span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => handleQuickTagClick(tag)}
                  className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer text-xs font-medium"
                >
                  {tag.label}
                </button>
              ))}
            </motion.div>
          </div>

          {/* ─── RIGHT: ASYMMETRIC ACTION & DISCOVERY SURFACE (5 Cols) ────── */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full max-w-md mx-auto rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border)] p-6 sm:p-8 shadow-2xl backdrop-blur-sm overflow-hidden"
            >
              {/* Top ambient sheen */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent-silver)]/30 to-transparent" />

              {!isLoggedIn ? (
                <>
                  {/* Card Header & Tab Switch */}
                  <div className="flex items-center justify-between pb-5 border-b border-[var(--theme-border)] mb-5">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[var(--theme-text)] tracking-tight">
                        {cardTab === "register" ? "Create Free Account" : "Platform Telemetry"}
                      </h2>
                      <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                        {cardTab === "register"
                          ? "Apply in seconds or post jobs directly"
                          : "Real-time verified ecosystem"}
                      </p>
                    </div>

                    <div className="flex items-center p-1 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setCardTab("register")}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          cardTab === "register"
                            ? "bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-xs"
                            : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                        }`}
                      >
                        Join
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardTab("highlights")}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          cardTab === "highlights"
                            ? "bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-xs"
                            : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                        }`}
                      >
                        Stats
                      </button>
                    </div>
                  </div>

                  {cardTab === "register" ? (
                    <div>
                      {/* Jobseeker vs Employer Segmented Control */}
                      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] mb-4">
                        <button
                          type="button"
                          onClick={() => {
                            setRegTab("jobseeker");
                            setRegError("");
                          }}
                          className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            regTab === "jobseeker"
                              ? "bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-sm border border-[var(--theme-border-silver)]"
                              : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          Candidate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRegTab("employer");
                            setRegError("");
                          }}
                          className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            regTab === "employer"
                              ? "bg-[var(--theme-surface)] text-[var(--theme-text)] shadow-sm border border-[var(--theme-border-silver)]"
                              : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                          }`}
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          Employer
                        </button>
                      </div>

                      {regError && (
                        <div className="mb-4 p-3 rounded-xl bg-[var(--theme-danger-bg)] border border-[var(--theme-danger)]/30 text-xs text-rose-400">
                          {regError}
                        </div>
                      )}

                      <form onSubmit={handleQuickRegister} className="space-y-3">
                        {regTab === "employer" && (
                          <div className="flex gap-4 px-1 text-xs font-medium text-[var(--theme-text-muted)]">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="userType"
                                value="Company"
                                checked={regData.userType === "Company"}
                                onChange={handleRegChange}
                                className="accent-[var(--theme-accent-silver)]"
                              />
                              Company
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="userType"
                                value="Individual"
                                checked={regData.userType === "Individual"}
                                onChange={handleRegChange}
                                className="accent-[var(--theme-accent-silver)]"
                              />
                              Individual Recruiter
                            </label>
                          </div>
                        )}

                        <div className="relative">
                          <input
                            type="text"
                            name="name"
                            required
                            value={regData.name}
                            onChange={handleRegChange}
                            placeholder={regTab === "jobseeker" ? "Full Name" : "Contact Person Name"}
                            className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[var(--theme-border-focus)] transition-colors"
                          />
                        </div>

                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            required
                            value={regData.email}
                            onChange={handleRegChange}
                            placeholder="Primary Email Address"
                            className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[var(--theme-border-focus)] transition-colors"
                          />
                        </div>

                        <div className="flex gap-2">
                          <span className="w-16 shrink-0 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs rounded-xl px-2 py-2.5 flex items-center justify-center font-mono">
                            +91
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={regData.phone}
                            onChange={handleRegChange}
                            placeholder="10-digit mobile"
                            className="flex-1 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[var(--theme-border-focus)] transition-colors"
                          />
                        </div>

                        {regTab === "employer" && regData.userType === "Company" && (
                          <input
                            type="text"
                            name="companyName"
                            required
                            value={regData.companyName}
                            onChange={handleRegChange}
                            placeholder="Registered Company Name"
                            className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[var(--theme-border-focus)] transition-colors"
                          />
                        )}

                        <input
                          type="password"
                          name="password"
                          required
                          minLength="6"
                          value={regData.password}
                          onChange={handleRegChange}
                          placeholder="Create Password (min 6 chars)"
                          className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[var(--theme-border-focus)] transition-colors"
                        />

                        <button
                          type="submit"
                          disabled={regLoading}
                          className="w-full mt-2 py-3 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {regLoading ? (
                            <span>Initiating Verification...</span>
                          ) : (
                            <>
                              <span>Join as {regTab === "jobseeker" ? "Candidate" : "Employer"}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </form>

                      <p className="text-center text-xs text-[var(--theme-text-muted)] mt-4">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => navigate("/login")}
                          className="text-[var(--theme-text)] hover:underline font-bold cursor-pointer"
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  ) : (
                    /* Platform Highlights Tab */
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-accent-silver)]">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[var(--theme-text)]">
                              100% Verified Postings
                            </h4>
                            <p className="text-xs text-[var(--theme-text-muted)]">
                              Every employer passes domain & CIN verification
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-accent-silver)]">
                            <TrendingUp className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[var(--theme-text)]">
                              Transparent Hiring Pipelines
                            </h4>
                            <p className="text-xs text-[var(--theme-text-muted)]">
                              Real-time application status and interview telemetry
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)]">
                        <p className="text-xs text-[var(--theme-text-muted)] italic leading-relaxed">
                          "JobOne removed the clutter of traditional job boards. Direct recruiter outreach and clean status tracking helped me secure my engineering role."
                        </p>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--theme-border)]">
                          <div className="w-6 h-6 rounded-full bg-[var(--theme-surface)] flex items-center justify-center text-[10px] font-bold text-[var(--theme-text)] border border-[var(--theme-border)]">
                            A
                          </div>
                          <span className="text-xs font-semibold text-[var(--theme-text)]">
                            Aakash Verma
                          </span>
                          <span className="text-[10px] text-[var(--theme-text-subtle)]">
                            • Senior Software Engineer
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate("/jobs")}
                        className="w-full py-3 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>Browse Verified Openings</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Authenticated User Quick Navigation */
                <div className="space-y-5">
                  <div className="flex items-center gap-3 pb-4 border-b border-[var(--theme-border)]">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center text-lg font-bold text-[var(--theme-text)]">
                      {(user?.name || employer?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--theme-accent-silver)]">
                        Active Session
                      </span>
                      <h3 className="text-base font-bold text-[var(--theme-text)]">
                        {user?.name || employer?.companyName || employer?.name || "Welcome Back"}
                      </h3>
                      <p className="text-xs text-[var(--theme-text-muted)]">
                        {employer ? "Employer Workspace" : "Candidate Career Center"}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                    Access your personalized dashboard, track active candidate applications, or manage job openings.
                  </p>

                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => navigate(employer ? "/employerdashboard" : "/userdashboard")}
                      className="w-full py-3 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Open {employer ? "Employer Dashboard" : "Candidate Dashboard"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/jobs")}
                      className="w-full py-2.5 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Explore Openings</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
