import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  Wifi,
} from "lucide-react";
import HeroBackgroundVideo from "../shared/HeroBackgroundVideo";
import HeroStatusPanel from "./HeroStatusPanel";

const POPULAR_SEARCHES = [
  { label: "Remote", type: "remote", val: "Remote" },
  { label: "Software Engineer", type: "title", val: "Software Engineer" },
  { label: "Full Stack", type: "title", val: "Full Stack" },
  { label: "Product Manager", type: "title", val: "Product Manager" },
  { label: "Data Analyst", type: "title", val: "Data Analyst" },
  { label: "Finance", type: "title", val: "Finance" },
];

export default function UniversalHero() {
  const navigate = useNavigate();

  // Search State
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

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
      aria-label="Universal Recruitment Marketplace Hero"
      className="relative w-full min-h-[86dvh] flex items-center overflow-hidden bg-[var(--theme-bg)] text-[var(--theme-text)] pt-28 sm:pt-32 pb-16 sm:pb-20 transition-colors duration-150"
    >
      <HeroBackgroundVideo />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* ================================================================ */}
          {/* LEFT: UNIVERSAL EDITORIAL CONTENT & SEARCH CONSOLE (7 cols)      */}
          {/* ================================================================ */}
          <div className="lg:col-span-7 flex flex-col items-start text-left min-w-0">
            {/* Platform Scope Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] shadow-xs mb-5"
            >
              <Sparkles className="w-4 h-4 text-[var(--theme-accent-silver)] shrink-0" aria-hidden="true" />
              <span className="text-xs font-semibold text-[var(--theme-text)]">
                Next-Gen Recruitment Marketplace
              </span>
            </motion.div>

            {/* Universal Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-3xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] text-[var(--theme-text)] mb-4 sm:mb-5"
            >
              Build Careers. Discover Talent.{" "}
              <span className="bg-gradient-to-r from-[var(--theme-text)] via-[var(--theme-accent-silver)] to-[var(--theme-text)] bg-clip-text text-transparent">
                Hire Smarter.
              </span>
            </motion.h1>

            {/* Supporting Value Positioning */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-sm sm:text-base text-[var(--theme-text-muted)] leading-relaxed max-w-2xl mb-7 sm:mb-8"
            >
              One platform connecting ambitious professionals with verified employers through transparent opportunities and intelligent recruitment.
            </motion.p>

            {/* Universal Inline Quick Links */}
            <motion.nav
              aria-label="Universal Quick Links"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14 }}
              className="flex flex-wrap items-center gap-y-2 text-xs sm:text-sm font-semibold mb-6 sm:mb-7"
            >
              <Link
                to="/jobs"
                className="text-[var(--theme-text)] hover:text-[var(--theme-accent-silver)] hover:underline underline-offset-4 transition-colors rounded-xs py-0.5"
              >
                Explore Jobs
              </Link>
              <span className="mx-2 sm:mx-3 text-[var(--theme-border-silver)]" aria-hidden="true">|</span>
              <Link
                to="/resume-builder"
                className="text-[var(--theme-text)] hover:text-[var(--theme-accent-silver)] hover:underline underline-offset-4 transition-colors rounded-xs py-0.5"
              >
                Build ATS Resume
              </Link>
              <span className="mx-2 sm:mx-3 text-[var(--theme-border-silver)]" aria-hidden="true">|</span>
              <Link
                to="/createjob"
                className="text-[var(--theme-text)] hover:text-[var(--theme-accent-silver)] hover:underline underline-offset-4 transition-colors rounded-xs py-0.5"
              >
                Post a Job
              </Link>
              <span className="mx-2 sm:mx-3 text-[var(--theme-border-silver)]" aria-hidden="true">|</span>
              <Link
                to="/candidates"
                className="text-[var(--theme-text)] hover:text-[var(--theme-accent-silver)] hover:underline underline-offset-4 transition-colors rounded-xs py-0.5"
              >
                Candidate Search
              </Link>
            </motion.nav>

            {/* Universal Search Console */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="w-full max-w-2xl rounded-2xl border border-[var(--theme-border-silver)] bg-[var(--theme-surface)]/95 backdrop-blur-md p-2 shadow-xl flex flex-col md:flex-row items-center gap-2"
            >
              {/* Job Title / Keyword Input */}
              <div className="flex items-center flex-1 w-full px-3 py-2">
                <Briefcase className="w-4 h-4 text-[var(--theme-accent-silver)] shrink-0 mr-2.5" aria-hidden="true" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Role, skill, or enterprise"
                  aria-label="Job title or keywords"
                  className="w-full min-w-0 bg-transparent text-sm font-medium text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] outline-none"
                />
              </div>

              <div className="hidden md:block w-px h-6 bg-[var(--theme-border)]" aria-hidden="true" />

              {/* Location Input */}
              <div className="flex items-center flex-1 w-full px-3 py-2">
                <MapPin className="w-4 h-4 text-[var(--theme-accent-silver)] shrink-0 mr-2.5" aria-hidden="true" />
                <input
                  type="text"
                  value={remoteOnly ? "Remote" : location}
                  disabled={remoteOnly}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, region, or remote"
                  aria-label="Job location"
                  className="w-full min-w-0 bg-transparent text-sm font-medium text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] outline-none disabled:opacity-60"
                />
              </div>

              {/* Remote Toggle */}
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

              {/* Search Submit Button */}
              <button
                type="submit"
                className="w-full md:w-auto px-5 py-3 min-h-[44px] rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-sm flex items-center justify-center gap-2 transition shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[var(--theme-accent-silver)]" aria-hidden="true" />
                <span>Search</span>
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

          {/* ================================================================ */}
          {/* RIGHT: UNIVERSAL DUAL-MODE HERO STATUS PANEL (5 cols)             */}
          {/* ================================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="lg:col-span-5 min-w-0"
          >
            <HeroStatusPanel />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
