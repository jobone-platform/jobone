import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  PlusCircle,
  LayoutDashboard,
  LogIn,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  Briefcase,
  CheckCircle2,
  Search,
  Users,
  MapPin,
  ClipboardList,
  CalendarClock,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { cachedGet } from "../../utils/apiCache";
import { useAuth } from "../../routes/Context";
import HeroBackgroundVideo from "../shared/HeroBackgroundVideo";

const EMPLOYER_HIGHLIGHTS = [
  {
    icon: PlusCircle,
    title: "Direct Job Publishing",
    desc: "Publish verified roles with structured skill and salary details.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Company Presence",
    desc: "Build candidate confidence with an approved organization profile.",
  },
  {
    icon: ClipboardList,
    title: "Candidate Application Management",
    desc: "Review incoming resumes and shortlist qualified applicants.",
  },
  {
    icon: CalendarClock,
    title: "Interview Coordination",
    desc: "Schedule interviews and manage recruitment progress in one place.",
  },
];

export default function EmployerHero() {
  const { employer, admin, role, authStatus } = useAuth();
  const isEmployerLoggedIn =
    authStatus === "authenticated" &&
    (role === "employer" || Boolean(employer && !admin));

  const [publicStats, setPublicStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    cachedGet(`${API_BASE_URL}/jobs/public-stats`, {}, { ttlMs: 120000 })
      .then((res) => {
        if (active && res?.data) setPublicStats(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setStatsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const hasLiveStats =
    publicStats &&
    (Number(publicStats.candidates) > 0 ||
      Number(publicStats.liveJobs) > 0 ||
      Number(publicStats.companies) > 0);

  const primaryPostRoute = isEmployerLoggedIn ? "/createjob" : "/employerregisteroption";

  return (
    <section
      aria-label="Employer Hero"
      className="relative w-full min-h-[86dvh] flex items-center overflow-hidden bg-[var(--theme-bg)] text-[var(--theme-text)] pt-28 sm:pt-32 pb-16 sm:pb-20 transition-colors duration-150"
    >
      <HeroBackgroundVideo />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* LEFT: Employer Editorial Content & CTAs (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] shadow-xs mb-5"
            >
              <Building2 className="w-4 h-4 text-[var(--theme-accent-silver)] shrink-0" aria-hidden="true" />
              <span className="text-xs font-semibold text-[var(--theme-text)]">
                Employer Recruitment Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-3xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] text-[var(--theme-text)] mb-7 sm:mb-9 lg:mb-32"
            >
              Hire Qualified Talent.{" "}
              <span className="bg-gradient-to-r from-[var(--theme-text)] via-[var(--theme-accent-silver)] to-[var(--theme-text)] bg-clip-text text-transparent">
                Manage Recruitment Directly.
              </span>
            </motion.h1>

            {/* Primary & Secondary CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex flex-wrap items-center gap-3 mb-7 w-full"
            >
              <Link
                to={primaryPostRoute}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-sm hover:opacity-90 transition shadow-md group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent-silver)]"
              >
                <PlusCircle className="w-4 h-4" aria-hidden="true" />
                <span>Post a Job</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>

              <Link
                to="/employerdashboard"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent-silver)]"
              >
                <LayoutDashboard className="w-4 h-4 text-[var(--theme-accent-silver)]" aria-hidden="true" />
                <span>Employer Dashboard</span>
              </Link>

              {isEmployerLoggedIn ? (
                <Link
                  to="/candidates"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-transparent hover:bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] font-semibold text-sm transition"
                >
                  <Search className="w-4 h-4" aria-hidden="true" />
                  <span>Find Candidates</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/employerregister"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-[var(--theme-text)] font-semibold text-sm transition"
                  >
                    <UserPlus className="w-4 h-4 text-[var(--theme-accent-silver)]" aria-hidden="true" />
                    <span>Create Account</span>
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-transparent hover:bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] font-semibold text-sm transition"
                  >
                    <LogIn className="w-4 h-4" aria-hidden="true" />
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Quick Workflow Summary */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--theme-text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                <span>Company Verification</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                <span>Applicant Shortlisting</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                <span>Interview Scheduling</span>
              </span>
            </div>
          </div>

          {/* RIGHT: Employer Statistics & Recruitment Panel (5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="lg:col-span-5 min-w-0"
          >
            <div className="rounded-3xl border border-[var(--theme-border-silver)] bg-[var(--theme-surface)]/95 backdrop-blur-md p-4 sm:p-7 shadow-2xl">
              <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-[var(--theme-border)]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--theme-accent-silver)]">
                    Employer Network Overview
                  </span>
                  <h2 className="text-lg font-bold text-[var(--theme-text)] mt-0.5">
                    Talent &amp; Hiring Activity
                  </h2>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-accent-silver)] shrink-0">
                  <Building2 className="w-5 h-5" aria-hidden="true" />
                </div>
              </div>

              {statsLoading ? (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-24 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] p-4 animate-pulse"
                    />
                  ))}
                </div>
              ) : hasLiveStats ? (
                <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 mb-5">
                  <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] p-4">
                    <div className="flex items-center justify-between text-xs text-[var(--theme-text-muted)] mb-2">
                      <span>Candidate Profiles</span>
                      <Users className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" aria-hidden="true" />
                    </div>
                    <div className="text-2xl font-black font-mono text-[var(--theme-text)]">
                      {Number(publicStats.candidates).toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] p-4">
                    <div className="flex items-center justify-between text-xs text-[var(--theme-text-muted)] mb-2">
                      <span>Active Postings</span>
                      <Briefcase className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" aria-hidden="true" />
                    </div>
                    <div className="text-2xl font-black font-mono text-[var(--theme-text)]">
                      {Number(publicStats.liveJobs).toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] p-4">
                    <div className="flex items-center justify-between text-xs text-[var(--theme-text-muted)] mb-2">
                      <span>Verified Employers</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                    </div>
                    <div className="text-2xl font-black font-mono text-[var(--theme-text)]">
                      {Number(publicStats.companies).toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] p-4">
                    <div className="flex items-center justify-between text-xs text-[var(--theme-text-muted)] mb-2">
                      <span>Hiring Locations</span>
                      <MapPin className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" aria-hidden="true" />
                    </div>
                    <div className="text-2xl font-black font-mono text-[var(--theme-text)]">
                      {Number(publicStats.locations || 0) > 0
                        ? Number(publicStats.locations).toLocaleString()
                        : "Pan-India + Remote"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 mb-5">
                  {EMPLOYER_HIGHLIGHTS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] p-3.5 flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-accent-silver)] shrink-0">
                          <Icon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[var(--theme-text)]">{item.title}</p>
                          <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 border-t border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-3 text-xs">
                <Link
                  to="/candidates"
                  className="font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition inline-flex items-center gap-1"
                >
                  <span>Search Talent</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
                <Link
                  to="/"
                  className="font-bold text-[var(--theme-text)] hover:underline inline-flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" aria-hidden="true" />
                  <span>Looking for jobs? Candidate Home</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
