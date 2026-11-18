import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  ShieldCheck,
  Activity,
  FileText,
  Bookmark,
  PlusCircle,
  Users,
  ClipboardList,
  ArrowRight,
  Sparkles,
  LogIn,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../routes/Context";

// --- CANDIDATE BENEFIT DETAILS (4 Balanced Cards) ---
const CANDIDATE_BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Verified Openings",
    desc: "Direct access to pre-screened companies and authenticated hiring teams.",
  },
  {
    icon: Activity,
    title: "Application Tracking",
    desc: "Monitor review milestones, interviewer feedback, and decisions in real time.",
  },
  {
    icon: FileText,
    title: "ATS Resume Builder",
    desc: "Generate formatted, industry-standard resumes for applicant screening systems.",
  },
  {
    icon: Bookmark,
    title: "Saved Jobs & Vault",
    desc: "Bookmark target positions and manage verified credentials with encrypted security.",
  },
];

// --- EMPLOYER BENEFIT DETAILS (4 Balanced Cards Matching Height) ---
const EMPLOYER_BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Verified Company Hiring",
    desc: "Establish brand credibility with verified employer status and direct applicant reach.",
  },
  {
    icon: PlusCircle,
    title: "Job Posting & Requisitions",
    desc: "Publish structured job listings with precision skill tags and salary transparency.",
  },
  {
    icon: Users,
    title: "Candidate Sourcing",
    desc: "Access pre-verified candidates matching exact industry requirements and competencies.",
  },
  {
    icon: ClipboardList,
    title: "Pipeline Management",
    desc: "Streamline applicant review, shortlisting, and candidate progression with stage controls.",
  },
];

export default function HeroStatusPanel({ className = "" }) {
  const navigate = useNavigate();
  const { user, employer, admin, role, authStatus } = useAuth();

  const isCandidateLoggedIn =
    authStatus === "authenticated" &&
    (role === "jobseeker" || Boolean(user && !employer && !admin));

  const isEmployerLoggedIn =
    authStatus === "authenticated" &&
    (role === "employer" || Boolean(employer && !admin));

  // Default to employer if signed in as employer, otherwise candidate
  const [activeMode, setActiveMode] = useState(() => {
    if (isEmployerLoggedIn) return "employer";
    return "candidate";
  });

  // Keep mode aligned if auth resolves after initial mount
  useEffect(() => {
    if (isEmployerLoggedIn) {
      setActiveMode("employer");
    } else if (isCandidateLoggedIn) {
      setActiveMode("candidate");
    }
  }, [isEmployerLoggedIn, isCandidateLoggedIn]);

  const candidateDisplayName =
    user?.name || user?.fullName || (user?.email ? user.email.split("@")[0] : "Candidate");

  const employerDisplayName =
    employer?.companyName || employer?.name || (employer?.email ? employer.email.split("@")[0] : "Employer");

  return (
    <div
      className={`rounded-3xl border border-[var(--theme-border-silver)] bg-[var(--theme-surface)]/95 backdrop-blur-xl p-4 sm:p-6 shadow-2xl transition-all duration-200 overflow-hidden flex flex-col justify-between ${className}`}
      aria-label="Candidate and Employer Experience Selector"
    >
      {/* ==================================================================== */}
      {/* 1. SEGMENTED AUDIENCE SELECTOR (Candidate | Employer)                 */}
      {/* Restored to original JobOne monochrome theme: dark surface, silver    */}
      {/* border, white active text, subtle indicator dot.                      */}
      {/* ==================================================================== */}
      <div
        role="tablist"
        aria-label="Select Audience Mode: Candidate or Employer"
        className="relative p-1 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] grid grid-cols-2 gap-1 mb-4 select-none shrink-0"
      >
        {/* Candidate Tab */}
        <button
          type="button"
          role="tab"
          id="hero-status-tab-candidate"
          aria-selected={activeMode === "candidate"}
          aria-controls="hero-status-panel-candidate"
          tabIndex={activeMode === "candidate" ? 0 : -1}
          onClick={() => setActiveMode("candidate")}
          className={`relative z-10 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-gold)] ${
            activeMode === "candidate"
              ? "text-[var(--theme-text)]"
              : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
          }`}
        >
          {activeMode === "candidate" && (
            <motion.div
              layoutId="heroAudiencePill"
              className="absolute inset-0 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-gold-border)] shadow-sm -z-10"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
          <User
            className={`w-4 h-4 shrink-0 ${
              activeMode === "candidate" ? "text-[var(--theme-gold)]" : "text-[var(--theme-text-muted)]"
            }`}
            aria-hidden="true"
          />
          <span>Candidate</span>
          {/* {activeMode === "candidate" && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--theme-gold)]"
              aria-hidden="true"
            />
          )} */}
        </button>

        {/* Employer Tab */}
        <button
          type="button"
          role="tab"
          id="hero-status-tab-employer"
          aria-selected={activeMode === "employer"}
          aria-controls="hero-status-panel-employer"
          tabIndex={activeMode === "employer" ? 0 : -1}
          onClick={() => setActiveMode("employer")}
          className={`relative z-10 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-gold)] ${
            activeMode === "employer"
              ? "text-[var(--theme-text)]"
              : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
          }`}
        >
          {activeMode === "employer" && (
            <motion.div
              layoutId="heroAudiencePill"
              className="absolute inset-0 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-gold-border)] shadow-sm -z-10"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
            />
          )}
          <Building2
            className={`w-4 h-4 shrink-0 ${
              activeMode === "employer" ? "text-[var(--theme-gold)]" : "text-[var(--theme-text-muted)]"
            }`}
            aria-hidden="true"
          />
          <span>Employer</span>
          {/* {activeMode === "employer" && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--theme-gold)]"
              aria-hidden="true"
            />
          )} */}
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 2. DYNAMIC CONTENT CONTAINER (Fixed Balanced Height)                 */}
      {/* ==================================================================== */}
      <AnimatePresence mode="wait">
        {activeMode === "candidate" ? (
          /* ================================================================ */
          /* CANDIDATE MODE: DETAILS, SIGNUP, SIGNIN, AND MORE                */
          /* ================================================================ */
          <motion.div
            key="candidate-panel"
            id="hero-status-panel-candidate"
            role="tabpanel"
            aria-labelledby="hero-status-tab-candidate"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-col justify-between space-y-3.5 flex-grow"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[var(--theme-border)] shrink-0">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-gold)] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[var(--theme-gold)]" aria-hidden="true" />
                  Candidate Career Center
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--theme-text)] mt-0.5">
                  Opportunity Index
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[var(--theme-gold-surface)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)] shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--theme-gold)]" aria-hidden="true" />
                <span>Verified Direct</span>
              </span>
            </div>

            {/* Candidate Details: 4 Information Cards (2x2 Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CANDIDATE_BENEFITS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] p-3 flex flex-col justify-between hover:border-[var(--theme-gold-border)] transition-colors duration-150 min-h-[78px]"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <div className="w-6 h-6 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-gold-border)] flex items-center justify-center text-[var(--theme-gold)] shrink-0 group-hover:scale-105 transition-transform duration-150">
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                      </div>
                      <h4 className="text-xs font-bold text-[var(--theme-text)] leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[var(--theme-text-muted)] leading-relaxed pl-0.5">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Actions: Sign Up, Sign In, and More */}
            <div className="pt-2.5 border-t border-[var(--theme-border)] space-y-2 shrink-0">
              {isCandidateLoggedIn ? (
                /* Authenticated Candidate: Career Center, My Applications, My Profile */
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs px-0.5">
                    <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--theme-gold)]" aria-hidden="true" />
                      Candidate Session Active
                    </span>
                    <span className="font-bold text-[var(--theme-text)] truncate max-w-[150px] text-xs">
                      {candidateDisplayName}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      to="/userdashboard"
                      className="px-2 py-2 rounded-xl bg-[var(--theme-gold)] text-black font-bold text-xs flex items-center justify-center gap-1 shadow-sm hover:bg-[var(--theme-gold-bright)] transition text-center"
                    >
                      <span>Career Center</span>
                    </Link>
                    <Link
                      to="/myapplications"
                      className="px-2 py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-gold-border)] text-[var(--theme-text)] font-semibold text-xs flex items-center justify-center gap-1 transition text-center"
                    >
                      <span>Applications</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="px-2 py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-gold-border)] text-[var(--theme-text)] font-semibold text-xs flex items-center justify-center gap-1 transition text-center"
                    >
                      <span>My Profile</span>
                    </Link>
                  </div>
                </div>
              ) : isEmployerLoggedIn ? (
                /* Authenticated Employer viewing Candidate tab */
                <div className="p-2.5 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--theme-text)] truncate">
                      Signed in as Employer ({employerDisplayName})
                    </p>
                    <p className="text-[11px] text-[var(--theme-text-muted)]">
                      Manage your hiring requisitions and candidates
                    </p>
                  </div>
                  <Link
                    to="/employerdashboard"
                    className="px-3 py-1.5 rounded-xl bg-[var(--theme-gold)] text-black font-bold text-xs flex items-center gap-1 shrink-0 hover:bg-[var(--theme-gold-bright)] transition"
                  >
                    <span>Console</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                /* Unauthenticated Guest Candidate: Details, Sign Up, Sign In, and More */
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* More action: Explore Jobs */}
                    <Link
                      to="/jobs"
                      className="px-3 py-2 rounded-xl bg-[var(--theme-gold)] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-[var(--theme-gold-bright)] transition cursor-pointer"
                    >
                      <span>Explore Jobs</span>
                      <ArrowRight className="w-3.5 h-3.5 text-black" aria-hidden="true" />
                    </Link>

                    {/* Candidate Sign Up */}
                    <Link
                      to="/userregister"
                      className="px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-gold-border)] text-[var(--theme-text)] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[var(--theme-gold)]" aria-hidden="true" />
                      <span>Candidate Sign Up</span>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--theme-text-muted)] px-1 pt-0.5">
                    {/* More action: ATS Resume Builder */}
                    <Link
                      to="/resume-builder"
                      className="hover:text-[var(--theme-gold)] transition flex items-center gap-1 text-[11px] font-medium"
                    >
                      <FileText className="w-3.5 h-3.5 text-[var(--theme-gold)]" aria-hidden="true" />
                      <span>ATS Resume Builder</span>
                    </Link>

                    {/* Candidate Sign In */}
                    <Link
                      to="/login"
                      className="text-[var(--theme-text)] hover:text-[var(--theme-gold)] transition font-bold inline-flex items-center gap-1 text-[11px]"
                    >
                      <LogIn className="w-3.5 h-3.5 text-[var(--theme-gold)]" aria-hidden="true" />
                      <span>Candidate Sign In →</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ================================================================ */
          /* EMPLOYER MODE: DETAILS, SIGNUP, SIGNIN, AND MORE                 */
          /* ================================================================ */
          <motion.div
            key="employer-panel"
            id="hero-status-panel-employer"
            role="tabpanel"
            aria-labelledby="hero-status-tab-employer"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-col justify-between space-y-3.5 flex-grow"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[var(--theme-border)] shrink-0">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-gold)] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[var(--theme-gold)]" aria-hidden="true" />
                  Hiring Team Workspace
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--theme-text)] mt-0.5">
                  Employer Recruitment
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[var(--theme-gold-surface)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)] shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--theme-gold)]" aria-hidden="true" />
                <span>Verified Enterprise</span>
              </span>
            </div>

            {/* Employer Details: 4 Information Cards (2x2 Grid Matching Candidate Height) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {EMPLOYER_BENEFITS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] p-3 flex flex-col justify-between hover:border-[var(--theme-gold-border)] transition-colors duration-150 min-h-[78px]"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <div className="w-6 h-6 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-gold-border)] flex items-center justify-center text-[var(--theme-gold)] shrink-0 group-hover:scale-105 transition-transform duration-150">
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                      </div>
                      <h4 className="text-xs font-bold text-[var(--theme-text)] leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[var(--theme-text-muted)] leading-relaxed pl-0.5">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Actions: Sign Up, Sign In, and More */}
            <div className="pt-2.5 border-t border-[var(--theme-border)] space-y-2 shrink-0">
              {isEmployerLoggedIn ? (
                /* Authenticated Employer: Employer Dashboard, Post a Job, Manage Applicants */
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs px-0.5">
                    <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--theme-gold)]" aria-hidden="true" />
                      Employer Session Active
                    </span>
                    <span className="font-bold text-[var(--theme-text)] truncate max-w-[150px] text-xs">
                      {employerDisplayName}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      to="/employerdashboard"
                      className="px-2 py-2 rounded-xl bg-[var(--theme-gold)] text-black font-bold text-xs flex items-center justify-center gap-1 shadow-sm hover:bg-[var(--theme-gold-bright)] transition text-center"
                    >
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/createjob"
                      className="px-2 py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-gold-border)] text-[var(--theme-text)] font-semibold text-xs flex items-center justify-center gap-1 transition text-center"
                    >
                      <span>Post a Job</span>
                    </Link>
                    <Link
                      to="/candidates"
                      className="px-2 py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-gold-border)] text-[var(--theme-text)] font-semibold text-xs flex items-center justify-center gap-1 transition text-center"
                    >
                      <span>Applicants</span>
                    </Link>
                  </div>
                </div>
              ) : isCandidateLoggedIn ? (
                /* Authenticated Candidate viewing Employer tab */
                <div className="p-2.5 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--theme-text)] truncate">
                      Signed in as Candidate ({candidateDisplayName})
                    </p>
                    <p className="text-[11px] text-[var(--theme-text-muted)]">
                      Explore openings or update your candidate profile
                    </p>
                  </div>
                  <Link
                    to="/userdashboard"
                    className="px-3 py-1.5 rounded-xl bg-[var(--theme-gold)] text-black font-bold text-xs flex items-center gap-1 shrink-0 hover:bg-[var(--theme-gold-bright)] transition"
                  >
                    <span>Portal</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                /* Unauthenticated Guest Employer: Details, Sign Up, Sign In, and More */
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* More action: Post a Job */}
                    <Link
                      to="/createjob"
                      className="px-3 py-2 rounded-xl bg-[var(--theme-gold)] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-[var(--theme-gold-bright)] transition cursor-pointer"
                    >
                      <span>Post a Job</span>
                      <ArrowRight className="w-3.5 h-3.5 text-black" aria-hidden="true" />
                    </Link>

                    {/* Employer Sign Up */}
                    <Link
                      to="/employerregister"
                      className="px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-gold-border)] text-[var(--theme-text)] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[var(--theme-gold)]" aria-hidden="true" />
                      <span>Employer Sign Up</span>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--theme-text-muted)] px-1 pt-0.5">
                    {/* More action: Search Candidates */}
                    <Link
                      to="/candidates"
                      className="hover:text-[var(--theme-gold)] transition flex items-center gap-1 text-[11px] font-medium"
                    >
                      <Users className="w-3.5 h-3.5 text-[var(--theme-gold)]" aria-hidden="true" />
                      <span>Search Candidates</span>
                    </Link>

                    {/* Employer Sign In */}
                    <Link
                      to="/login"
                      className="text-[var(--theme-text)] hover:text-[var(--theme-gold)] transition font-bold inline-flex items-center gap-1 text-[11px]"
                    >
                      <LogIn className="w-3.5 h-3.5 text-[var(--theme-gold)]" aria-hidden="true" />
                      <span>Employer Sign In →</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
