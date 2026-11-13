import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  Wifi,
  Layers,
  Activity,
  Bookmark,
  FileText,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { cachedGet } from "../../utils/apiCache";
import HeroBackgroundVideo from "../shared/HeroBackgroundVideo";

const POPULAR_SEARCHES = [
  { label: "Remote", type: "remote", val: "Remote" },
  { label: "Software Developer", type: "title", val: "Software Developer" },
  { label: "Full Stack", type: "title", val: "Full Stack" },
  { label: "Data Analyst", type: "title", val: "Data Analyst" },
  { label: "Product", type: "title", val: "Product" },
  { label: "Finance", type: "title", val: "Finance" },
];

const HERO_INLINE_LINKS = [
  { label: "Explore Jobs", to: "/jobs" },
  { label: "Build ATS Resume", to: "/resume-builder" },
  { label: "Create Profile", to: "/userregister" },
  { label: "Sign In", to: "/login" },
];

const CANDIDATE_HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Direct Verified Employers",
    desc: "Apply straight to approved company hiring teams.",
  },
  {
    icon: Activity,
    title: "Real-Time Application Tracking",
    desc: "Monitor every submission from review to interview.",
  },
  {
    icon: FileText,
    title: "Built-In ATS Resume Builder",
    desc: "Optimize your resume structure against target roles.",
  },
  {
    icon: Bookmark,
    title: "Saved Roles & Career Docs",
    desc: "Organize bookmarked openings and resume files.",
  },
];

export default function CandidateHero() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [publicStats, setPublicStats] = useState(null);
  const [categoryCount, setCategoryCount] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      cachedGet(`${API_BASE_URL}/jobs/public-stats`, {}, { ttlMs: 120000 }),
      cachedGet(`${API_BASE_URL}/jobs/category-counts`, {}, { ttlMs: 120000 }),
    ])
      .then(([statsRes, catRes]) => {
        if (!active) return;
        if (statsRes.status === "fulfilled" && statsRes.value?.data) {
          setPublicStats(statsRes.value.data);
        }
        if (catRes.status === "fulfilled" && catRes.value?.data) {
          const raw = catRes.value.data;
          const list = Array.isArray(raw) ? raw : raw?.data || raw?.counts || [];
          if (Array.isArray(list) && list.length > 0) {
            setCategoryCount(list.length);
          } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
            const keys = Object.keys(raw).filter((k) => Number(raw[k]) > 0);
            if (keys.length > 0) setCategoryCount(keys.length);
          }
        }
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const hasLiveStats =
    publicStats &&
    (Number(publicStats.liveJobs) > 0 || Number(publicStats.companies) > 0);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (title.trim()) params.set("title", title.trim());
    if (remoteOnly) {
      params.set("location", "Remote");
    } else if (location.trim()) {
      params.set("location", location.trim());
    }
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleSuggestionClick = (item) => {
    if (item.type === "remote") {
      navigate("/jobs?location=Remote");
    } else {
      navigate(`/jobs?title=${encodeURIComponent(item.val)}`);
    }
  };

  return (
    <section
      aria-label="Candidate Hero and Job Search"
      className="relative w-full min-h-[86dvh] flex items-center overflow-hidden bg-[var(--theme-bg)] text-[var(--theme-text)] pt-28 sm:pt-32 pb-16 sm:pb-20 transition-colors duration-150"
    >
      <HeroBackgroundVideo />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* LEFT: Candidate Editorial Content & Search (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] shadow-xs mb-5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
              <span className="text-xs font-semibold text-[var(--theme-text)]">
                Candidate Career Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-3xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] text-[var(--theme-text)] mb-7 sm:mb-9 lg:mb-32"
            >
              Find Verified Roles.{" "}
              <span className="bg-gradient-to-r from-[var(--theme-text)] via-[var(--theme-accent-silver)] to-[var(--theme-text)] bg-clip-text text-transparent">
                Track Every Application.
              </span>
            </motion.h1>

            {/* Inline Navigation Row (Replaces old description & button containers) */}
            <motion.nav
              aria-label="Candidate Quick Links"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="flex flex-wrap items-center gap-y-2 text-xs sm:text-sm md:text-[15px] font-semibold mb-6 sm:mb-7"
            >
              {HERO_INLINE_LINKS.map((link, idx) => (
                <React.Fragment key={link.to}>
                  {idx > 0 && (
                    <span
                      className="mx-2.5 sm:mx-3 text-[var(--theme-border-silver)] select-none font-light"
                      aria-hidden="true"
                    >
                      |
                    </span>
                  )}
                  <Link
                    to={link.to}
                    className="text-[var(--theme-text)] hover:text-[var(--theme-accent-silver)] hover:underline underline-offset-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent-silver)] rounded-xs py-0.5"
                  >
                    {link.label}
                  </Link>
                </React.Fragment>
              ))}
            </motion.nav>

            {/* Candidate Job Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              onSubmit={handleSearch}
              aria-label="Search open jobs"
              className="w-full bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] rounded-2xl p-2 shadow-2xl flex flex-col md:flex-row items-stretch gap-2 focus-within:border-[var(--theme-border-focus)] transition-all"
            >
              <div className="flex items-center px-3 py-2.5 flex-1 min-w-0 border-b md:border-b-0 md:border-r border-[var(--theme-border)]">
                <Briefcase className="w-4 h-4 text-[var(--theme-accent-silver)] shrink-0 mr-2.5" aria-hidden="true" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Job title, skill, or company"
                  aria-label="Job title, skill, or company"
                  className="w-full min-w-0 bg-transparent text-sm font-medium text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] outline-none"
                />
              </div>

              <div className="flex items-center px-3 py-2.5 flex-1 min-w-0 border-b md:border-b-0 md:border-r border-[var(--theme-border)]">
                <MapPin className="w-4 h-4 text-[var(--theme-accent-silver)] shrink-0 mr-2.5" aria-hidden="true" />
                <input
                  type="text"
                  value={remoteOnly ? "Remote" : location}
                  disabled={remoteOnly}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or location"
                  aria-label="Job location"
                  className="w-full min-w-0 bg-transparent text-sm font-medium text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] outline-none disabled:opacity-60"
                />
              </div>

              <button
                type="button"
                onClick={() => setRemoteOnly((prev) => !prev)}
                aria-pressed={remoteOnly}
                className={`px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer shrink-0 ${
                  remoteOnly
                    ? "bg-[var(--theme-text)] text-[var(--theme-bg)] border-[var(--theme-text)]"
                    : "bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] border-[var(--theme-border)] hover:text-[var(--theme-text)]"
                }`}
              >
                <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Remote</span>
              </button>

              <button
                type="submit"
                className="w-full md:w-auto px-5 py-3 min-h-[44px] rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-sm flex items-center justify-center gap-2 transition shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[var(--theme-accent-silver)]" aria-hidden="true" />
                <span>Search Jobs</span>
              </button>
            </motion.form>

            {/* Popular Search Suggestions */}
            <div className="flex items-center gap-2 flex-wrap mt-4 text-xs">
              <span className="font-semibold flex items-center gap-1 text-[var(--theme-text-muted)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" aria-hidden="true" />
                Popular:
              </span>
              {POPULAR_SEARCHES.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => handleSuggestionClick(tag)}
                  className="px-2.5 py-1 rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] hover:border-[var(--theme-border-silver)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] font-medium transition cursor-pointer"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Candidate Statistics & Highlights Panel (5 cols) */}
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
                    Live Platform Snapshot
                  </span>
                  <h2 className="text-lg font-bold text-[var(--theme-text)] mt-0.5">
                    Candidate Opportunity Index
                  </h2>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-emerald-500 shrink-0">
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
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
                      <span>Verified Openings</span>
                      <Briefcase className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" aria-hidden="true" />
                    </div>
                    <div className="text-2xl font-black font-mono text-[var(--theme-text)]">
                      {Number(publicStats.liveJobs).toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] p-4">
                    <div className="flex items-center justify-between text-xs text-[var(--theme-text-muted)] mb-2">
                      <span>Verified Employers</span>
                      <Building2 className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" aria-hidden="true" />
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
                        : "Remote + Cities"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] p-4">
                    <div className="flex items-center justify-between text-xs text-[var(--theme-text-muted)] mb-2">
                      <span>Active Sectors</span>
                      <Layers className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" aria-hidden="true" />
                    </div>
                    <div className="text-2xl font-black font-mono text-[var(--theme-text)]">
                      {categoryCount ? Number(categoryCount).toLocaleString() : "Multi-Sector"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 mb-5">
                  {CANDIDATE_HIGHLIGHTS.map((item) => {
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
                  to="/companies"
                  className="font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition inline-flex items-center gap-1"
                >
                  <span>Browse Companies</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
                <Link
                  to="/employer"
                  className="font-bold text-[var(--theme-text)] hover:underline inline-flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" aria-hidden="true" />
                  <span>Hiring? Employer Home</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
