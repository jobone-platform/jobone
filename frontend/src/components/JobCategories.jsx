import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { cachedGet } from "../utils/apiCache";
import {
  Code2,
  TrendingUp,
  Megaphone,
  HeartPulse,
  Cpu,
  Truck,
  Building2,
  Briefcase,
  Search,
  X,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Layers,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { INDUSTRIES, normalizeIndustry } from "../constants/taxonomy";

// Genuine 24 Industries
const BASE_CATEGORIES = INDUSTRIES;



// Macroeconomic sector filter pill groups for the 24 genuine industries
const SECTOR_GROUPS = [
  { id: "all", label: "All Industries", icon: Layers },
  { id: "tech", label: "Tech & Telecom", icon: Code2 },
  { id: "finance", label: "Banking & Finance", icon: TrendingUp },
  { id: "healthcare", label: "Health & Pharma", icon: HeartPulse },
  { id: "engineering", label: "Engineering & Auto", icon: Cpu },
  { id: "commerce", label: "Retail & FMCG", icon: ShoppingBag },
  { id: "marketing", label: "Marketing & Media", icon: Megaphone },
  { id: "operations", label: "Logistics & Transport", icon: Truck },
  { id: "infrastructure", label: "Real Estate & Energy", icon: Building2 },
  { id: "services", label: "Professional Services", icon: Briefcase },
];

export default function JobCategories() {
  const navigate = useNavigate();

  const [realCounts, setRealCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");
  const [sortBy, setSortBy] = useState("jobs"); // "jobs", "alpha-asc", "alpha-desc"
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [apiError, setApiError] = useState(false);

  // Fetch live aggregated database counts on mount
  const fetchCategoryCounts = useCallback(async () => {
    try {
      setIsLoadingCounts(true);
      setApiError(false);
      const data = await cachedGet(axios, `${API_BASE_URL}/jobs/category-counts`);
      if (data && typeof data === "object") {
        setRealCounts(data);
      }
    } catch (err) {
      console.error("Failed to fetch live job counts:", err);
      setApiError(true);
    } finally {
      setIsLoadingCounts(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoryCounts();
  }, [fetchCategoryCounts]);

  // Dynamic list derived from genuine 24 industries
  const allCategories = useMemo(() => {
    return [...BASE_CATEGORIES];
  }, []);

  // Filter & sort categories: Default puts industries with more available jobs first
  const processedCategories = useMemo(() => {
    let list = [...allCategories];

    // Filter by Sector Group
    if (activeGroup !== "all") {
      list = list.filter((cat) => cat.group === activeGroup);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((cat) => {
        const nameMatch = cat.name.toLowerCase().includes(q) || cat.shortName?.toLowerCase().includes(q);
        const roleMatch = cat.popularRoles?.some((r) =>
          r.toLowerCase().includes(q)
        );
        const deptMatch = cat.departments?.some((dept) =>
          dept.toLowerCase().includes(q)
        );
        const descMatch = cat.description?.toLowerCase().includes(q);
        return nameMatch || roleMatch || deptMatch || descMatch;
      });
    }

    // Sorting
    list.sort((a, b) => {
      const countA = realCounts[a.name] || realCounts[a.shortName] || 0;
      const countB = realCounts[b.name] || realCounts[b.shortName] || 0;

      if (sortBy === "jobs") {
        if (countB !== countA) {
          return countB - countA;
        }
        return a.name.localeCompare(b.name);
      } else if (sortBy === "alpha-asc") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "alpha-desc") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    return list;
  }, [allCategories, activeGroup, searchQuery, sortBy, realCounts]);

  // Navigation handlers
  const handleCategoryClick = (categoryName) => {
    navigate(`/jobs?industry=${encodeURIComponent(categoryName)}`);
  };

  const handleRoleClick = (e, categoryName, role) => {
    e.stopPropagation();
    navigate(
      `/jobs?industry=${encodeURIComponent(categoryName)}&title=${encodeURIComponent(role)}`
    );
  };

  const INITIAL_VISIBLE_COUNT = 8;
  const isSearchActive = searchQuery.trim().length > 0;
  const isGroupFiltered = activeGroup !== "all";

  const visibleCategories =
    isSearchActive || isGroupFiltered || isExpanded
      ? processedCategories
      : processedCategories.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <section
      aria-label="Job Industries and Sectors"
      className="relative py-16 md:py-24 bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans transition-colors duration-150 overflow-hidden w-full border-t border-[var(--theme-border)]"
    >
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--theme-text)] leading-tight">
              Explore Positions by Sector
            </h2>
            <p className="mt-2 text-[var(--theme-text-muted)] text-sm sm:text-base leading-relaxed">
              Find open positions organized by industry and functional specialization.
            </p>
          </div>

          {/* Quick CTA to view all jobs */}
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="self-start md:self-end inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--theme-text)] hover:text-[var(--theme-accent-silver-sheen)] transition-colors group cursor-pointer"
          >
            <span>Browse All Openings</span>
            <ArrowRight className="w-4 h-4 text-[var(--theme-accent-silver)] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* API ERROR BANNER (WITH RETRY) */}
        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--theme-danger-bg)] border border-[var(--theme-danger)]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle size={16} className="shrink-0" />
              <span>Unable to load live sector counts. Telemetry will retry.</span>
            </div>
            <button
              type="button"
              onClick={fetchCategoryCounts}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* SEARCH & FILTER CONTROLS BAR */}
        <div className="bg-[var(--theme-surface)] rounded-2xl p-4 sm:p-5 border border-[var(--theme-border)] shadow-sm mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* SEARCH INPUT */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--theme-text-subtle)]">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search industries, roles, or specializations..."
                aria-label="Search industries, job roles or skills"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--theme-input-bg)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] border border-[var(--theme-border)] focus:outline-none focus:border-[var(--theme-border-focus)] transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* SORTING SELECTOR */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text-muted)]">
                <SlidersHorizontal size={13} className="text-[var(--theme-accent-silver)]" />
                <span className="hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-[var(--theme-text)] focus:outline-none cursor-pointer"
                  aria-label="Sort industries"
                >
                  <option value="jobs" className="bg-[var(--theme-surface)] text-[var(--theme-text)]">
                    Most Active Jobs
                  </option>
                  <option value="alpha-asc" className="bg-[var(--theme-surface)] text-[var(--theme-text)]">
                    Alphabetical (A–Z)
                  </option>
                  <option value="alpha-desc" className="bg-[var(--theme-surface)] text-[var(--theme-text)]">
                    Alphabetical (Z–A)
                  </option>
                </select>
              </div>

              {/* Match Counter Badge */}
              <div className="px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-bold text-[var(--theme-text-muted)] whitespace-nowrap">
                {processedCategories.length} {processedCategories.length === 1 ? "Sector" : "Sectors"}
              </div>
            </div>
          </div>

          {/* SECTOR GROUP FILTER PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-[var(--theme-border)]">
            {SECTOR_GROUPS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeGroup === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveGroup(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                    isActive
                      ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border-[var(--theme-border-silver)] shadow-sm"
                      : "bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border-[var(--theme-border)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)]"
                  }`}
                >
                  <TabIcon size={12} className={isActive ? "text-[var(--theme-accent-silver)]" : ""} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LOADING SKELETON STATE */}
        {isLoadingCounts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 bg-[var(--theme-surface)] border border-[var(--theme-border)] animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-muted)]" />
                  <div className="w-24 h-5 rounded-full bg-[var(--theme-surface-muted)]" />
                </div>
                <div className="space-y-1.5">
                  <div className="w-3/4 h-5 rounded bg-[var(--theme-surface-muted)]" />
                  <div className="w-1/2 h-3.5 rounded bg-[var(--theme-surface-muted)]" />
                </div>
              </div>
            ))}
          </div>
        ) : processedCategories.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-14 px-4 text-center bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] flex items-center justify-center mx-auto mb-3">
              <Search size={22} />
            </div>
            <h3 className="text-base font-bold text-[var(--theme-text)] mb-1">
              No matching sectors found
            </h3>
            <p className="text-xs text-[var(--theme-text-muted)] mb-5">
              Try searching for another industry title, functional domain, or key skill.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveGroup("all");
              }}
              className="px-4 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* CATEGORIES GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {visibleCategories.map((cat) => {
              const CategoryIcon = cat.icon || Briefcase;
              const liveCount = realCounts[cat.name] || realCounts[cat.shortName] || 0;

              return (
                <div
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-6 bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <div>
                    {/* TOP SECTION: ICON + JOB COUNT BADGE */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <CategoryIcon size={18} />
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                          liveCount > 0
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] border-[var(--theme-border)]"
                        }`}
                      >
                        {liveCount > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        )}
                        <span>
                          {liveCount > 0
                            ? `${liveCount.toLocaleString()} ${liveCount === 1 ? "opening" : "openings"}`
                            : "Explore roles"}
                        </span>
                      </span>
                    </div>

                    {/* CATEGORY TITLE */}
                    <h3 className="text-base sm:text-lg font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors line-clamp-1 mb-1">
                      {cat.name}
                    </h3>

                    {/* DESCRIPTION */}
                    {cat.description && (
                      <p className="text-xs text-[var(--theme-text-muted)] line-clamp-2 leading-relaxed mb-3">
                        {cat.description}
                      </p>
                    )}

                    {/* POPULAR ROLES CHIPS */}
                    {cat.popularRoles && cat.popularRoles.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-[var(--theme-border)]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-subtle)] mb-1.5">
                          High-Demand Roles
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.popularRoles.slice(0, 3).map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={(e) => handleRoleClick(e, cat.name, role)}
                              title={`Search ${role} jobs`}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:border-[var(--theme-border-silver)] border border-[var(--theme-border)] transition-colors cursor-pointer truncate max-w-[170px]"
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DEPARTMENTS SUMMARY */}
                    {cat.departments && cat.departments.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[var(--theme-border)]/50 flex items-center gap-1.5 text-[10px] text-[var(--theme-text-subtle)] truncate">
                        <span className="font-semibold text-[var(--theme-text-muted)]">Departments:</span>
                        <span className="truncate">{cat.departments.slice(0, 2).join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM ACTION CTA */}
                  <div className="mt-4 pt-3 border-t border-[var(--theme-border)] flex items-center justify-between text-xs font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver-sheen)]">
                    <span>
                      View {cat.shortName || "Industry"} Jobs
                    </span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform text-[var(--theme-accent-silver)]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BOTTOM EXPAND & ACTION BAR */}
        {!isSearchActive && !isGroupFiltered && processedCategories.length > INITIAL_VISIBLE_COUNT && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-[var(--theme-text)] font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {isExpanded
                  ? "Show Fewer Sectors"
                  : `View All ${processedCategories.length} Sectors`}
              </span>
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore All Opportunities</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
