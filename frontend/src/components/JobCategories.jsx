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
  Headphones,
  Users,
  GraduationCap,
  Scale,
  Palette,
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
} from "lucide-react";

// Predefined core job categories with realistic popular roles and subdomains
const BASE_CATEGORIES = [
  {
    name: "IT & Software",
    icon: Code2,
    group: "tech",
    popularRoles: [
      "Software Developer",
      "Full Stack Developer",
      "Data Analyst",
      "DevOps Engineer",
    ],
    subdomains: [
      "Software Development",
      "Data & Analytics",
      "Infrastructure & Cloud",
      "Security & Testing",
      "Design & Product",
    ],
  },
  {
    name: "Banking & Finance",
    icon: TrendingUp,
    group: "finance",
    popularRoles: [
      "Financial Analyst",
      "Accountant",
      "Investment Banker",
      "Risk Officer",
    ],
    subdomains: [
      "Corporate Banking",
      "Finance & Accounting",
      "Retail Banking",
      "Wealth & Asset Mgmt",
      "Risk & Insurance",
    ],
  },
  {
    name: "Sales & Marketing",
    icon: Megaphone,
    group: "marketing",
    popularRoles: [
      "Marketing Manager",
      "Sales Executive",
      "SEO Specialist",
      "Content Strategist",
    ],
    subdomains: [
      "B2B Corporate Sales",
      "Digital Marketing",
      "Brand Strategy",
      "Retail & B2C Sales",
      "Growth & Communications",
    ],
  },
  {
    name: "Healthcare & Pharma",
    icon: HeartPulse,
    group: "healthcare",
    popularRoles: [
      "Clinical Researcher",
      "Pharmacist",
      "Medical Officer",
      "Staff Nurse",
    ],
    subdomains: [
      "Clinical & Medical",
      "Pharmaceuticals",
      "Hospital Admin",
      "Medical Support",
      "Life Sciences",
    ],
  },
  {
    name: "Engineering & Manufacturing",
    icon: Cpu,
    group: "engineering",
    popularRoles: [
      "Mechanical Engineer",
      "CAD Designer",
      "Quality Engineer",
      "Plant Supervisor",
    ],
    subdomains: [
      "Core Engineering",
      "Plant Operations",
      "Quality Assurance",
      "R&D & CAD Drafting",
      "Robotics & Automation",
    ],
  },
  {
    name: "Operations & Logistics",
    icon: Truck,
    group: "operations",
    popularRoles: [
      "Supply Chain Executive",
      "Warehouse Manager",
      "Logistics Coordinator",
      "Operations Analyst",
    ],
    subdomains: [
      "Supply Chain & Freight",
      "E-commerce Delivery",
      "Warehousing & Inventory",
      "Vendor Management",
      "Business Operations",
    ],
  },
  {
    name: "Customer Support",
    icon: Headphones,
    group: "support",
    popularRoles: [
      "Customer Success Specialist",
      "Technical Helpdesk",
      "Support Associate",
      "Voice Process Lead",
    ],
    subdomains: [
      "Voice Operations",
      "Digital & Chat Support",
      "Technical Helpdesk",
      "Client Management",
      "BPO & Escalations",
    ],
  },
  {
    name: "HR & Admin",
    icon: Users,
    group: "hr",
    popularRoles: [
      "HR Generalist",
      "Talent Acquisition",
      "Payroll Executive",
      "Admin Officer",
    ],
    subdomains: [
      "Talent Acquisition",
      "Core Human Resources",
      "Payroll & Compliance",
      "Training & Development",
      "Office Administration",
    ],
  },
  {
    name: "Education & EdTech",
    icon: GraduationCap,
    group: "services",
    popularRoles: [
      "Instructional Designer",
      "Academic Counselor",
      "Subject Matter Expert",
      "EdTech Trainer",
    ],
    subdomains: [
      "Teaching & Faculty",
      "EdTech Content Creation",
      "Academic Counseling",
      "Corporate Training",
      "Curriculum Design",
    ],
  },
  {
    name: "Legal & Compliance",
    icon: Scale,
    group: "finance",
    popularRoles: [
      "Legal Associate",
      "Compliance Officer",
      "Contract Specialist",
      "Corporate Counsel",
    ],
    subdomains: [
      "Corporate Law",
      "Regulatory Compliance",
      "Contract Drafting",
      "Intellectual Property",
      "Litigation Support",
    ],
  },
  {
    name: "Media, Design & Creative",
    icon: Palette,
    group: "creative",
    popularRoles: [
      "UI/UX Designer",
      "Graphic Designer",
      "Video Editor",
      "Brand Strategist",
    ],
    subdomains: [
      "UI/UX & Product Design",
      "Graphic Design",
      "Copywriting & Content",
      "Video Editing & 3D",
      "Brand Identity",
    ],
  },
  {
    name: "Real Estate & Construction",
    icon: Building2,
    group: "engineering",
    popularRoles: [
      "Civil Engineer",
      "Project Architect",
      "Site Supervisor",
      "Property Manager",
    ],
    subdomains: [
      "Civil Construction",
      "Architecture & Planning",
      "Property Management",
      "Commercial Leasing",
      "Site Supervision",
    ],
  },
];

// Clean job filter pill groups
const SECTOR_GROUPS = [
  { id: "all", label: "All Industries", icon: Layers },
  { id: "tech", label: "IT & Software", icon: Code2 },
  { id: "finance", label: "Finance", icon: TrendingUp },
  { id: "healthcare", label: "Healthcare", icon: HeartPulse },
  { id: "engineering", label: "Engineering", icon: Cpu },
  { id: "marketing", label: "Sales & Marketing", icon: Megaphone },
  { id: "operations", label: "Operations", icon: Truck },
  { id: "support", label: "Customer Support", icon: Headphones },
  { id: "hr", label: "HR & Admin", icon: Users },
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

  // Dynamically merge any industries returned from backend that aren't in BASE_CATEGORIES
  const allCategories = useMemo(() => {
    const list = [...BASE_CATEGORIES];
    const existingNames = new Set(list.map((c) => c.name.toLowerCase()));

    Object.keys(realCounts).forEach((catName) => {
      if (catName && !existingNames.has(catName.toLowerCase())) {
        list.push({
          name: catName,
          icon: Briefcase,
          group: "services",
          popularRoles: ["Specialist", "Associate", "Lead"],
          subdomains: ["General Roles", "Specialized Positions"],
        });
        existingNames.add(catName.toLowerCase());
      }
    });

    return list;
  }, [realCounts]);

  // Filter & sort categories: Default puts industries with more available jobs first
  const processedCategories = useMemo(() => {
    let list = [...allCategories];

    // Filter by Sector Group
    if (activeGroup !== "all") {
      list = list.filter((cat) => cat.group === activeGroup);
    }

    // Filter by Search Query (matches category name, popular roles, or subdomains)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((cat) => {
        const nameMatch = cat.name.toLowerCase().includes(q);
        const roleMatch = cat.popularRoles?.some((r) =>
          r.toLowerCase().includes(q)
        );
        const subdomainMatch = cat.subdomains?.some((sub) =>
          sub.toLowerCase().includes(q)
        );
        return nameMatch || roleMatch || subdomainMatch;
      });
    }

    // Sorting: "jobs" puts higher available job counts first
    list.sort((a, b) => {
      const countA = realCounts[a.name] || 0;
      const countB = realCounts[b.name] || 0;

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

  // Determine visible item count
  const INITIAL_VISIBLE_COUNT = 8;
  const isSearchActive = searchQuery.trim().length > 0;
  const isGroupFiltered = activeGroup !== "all";

  const visibleCategories =
    isSearchActive || isGroupFiltered || isExpanded
      ? processedCategories
      : processedCategories.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <section className="relative py-16 md:py-24 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 overflow-hidden w-full border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 lg:px-16 mx-auto max-w-[1600px]">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
                JOB CATEGORIES
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Find Jobs by Industry
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Explore job opportunities across industries and find roles that match your skills and experience.
            </p>
          </div>

          {/* Quick CTA to view all jobs */}
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="self-start md:self-end flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors group cursor-pointer"
          >
            <span>View All Jobs</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* API ERROR BANNER (WITH RETRY) */}
        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
              <AlertCircle size={16} className="shrink-0" />
              <span>Unable to load live job counts. Please try again.</span>
            </div>
            <button
              type="button"
              onClick={fetchCategoryCounts}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* SEARCH & FILTER CONTROLS BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* SEARCH INPUT */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search industries, job roles or skills..."
                aria-label="Search industries, job roles or skills"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* SORTING SELECTOR */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <SlidersHorizontal size={14} className="text-slate-400" />
                <span className="hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
                  aria-label="Sort industries"
                >
                  <option value="jobs" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    Most Jobs
                  </option>
                  <option value="alpha-asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    A–Z
                  </option>
                  <option value="alpha-desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    Z–A
                  </option>
                </select>
              </div>

              {/* Match Counter Badge */}
              <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {processedCategories.length} {processedCategories.length === 1 ? "Industry" : "Industries"}
              </div>
            </div>
          </div>

          {/* SECTOR GROUP FILTER PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100 dark:border-slate-800/80">
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
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-600/30"
                      : "bg-slate-100/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <TabIcon size={13} />
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
                className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800" />
                  <div className="w-24 h-5 rounded-full bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="space-y-1.5">
                  <div className="w-3/4 h-5 rounded-md bg-slate-200 dark:bg-slate-800" />
                  <div className="w-1/2 h-3.5 rounded-md bg-slate-100 dark:bg-slate-800/60" />
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
                  <div className="w-20 h-3 rounded bg-slate-100 dark:bg-slate-800/60" />
                  <div className="flex gap-1.5">
                    <div className="w-20 h-5 rounded-md bg-slate-100 dark:bg-slate-800" />
                    <div className="w-24 h-5 rounded-md bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="pt-2 flex justify-between">
                  <div className="w-20 h-4 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : processedCategories.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-14 px-4 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Search size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              No industries found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5">
              Try searching for another industry, role, or skill.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveGroup("all");
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* CATEGORIES GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {visibleCategories.map((cat) => {
              const CategoryIcon = cat.icon || Briefcase;
              const liveCount = realCounts[cat.name] || 0;

              return (
                <div
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div>
                    {/* TOP SECTION: ICON + JOB COUNT BADGE */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 transition-colors">
                        <CategoryIcon size={18} />
                      </div>

                      {/* Job Count - Most important info */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                          liveCount > 0
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50"
                            : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60"
                        }`}
                      >
                        {liveCount > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                        <span>
                          {liveCount > 0
                            ? `${liveCount.toLocaleString()} ${liveCount === 1 ? "job available" : "jobs available"}`
                            : "Hiring soon"}
                        </span>
                      </span>
                    </div>

                    {/* CATEGORY TITLE */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1">
                      {cat.name}
                    </h3>

                    {/* POPULAR ROLES CHIPS */}
                    {cat.popularRoles && cat.popularRoles.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                          Popular roles
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.popularRoles.slice(0, 3).map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={(e) => handleRoleClick(e, cat.name, role)}
                              title={`Search ${role} jobs`}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer truncate max-w-[170px]"
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM ACTION CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                    <span>
                      {liveCount > 0 ? `View ${liveCount} Jobs` : "View Jobs"}
                    </span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
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
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {isExpanded
                  ? "Show Fewer Industries"
                  : `View All ${processedCategories.length} Industries`}
              </span>
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Browse All Jobs</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
