import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
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
  ArrowUpRight,
  Sparkles,
  Layers,
  Flame,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";

// Predefined rich categories with subdomains, icons, and curated color palettes
const BASE_CATEGORIES = [
  {
    name: "IT & Software",
    icon: Code2,
    group: "tech",
    color: "from-blue-600 to-indigo-600",
    glowColor: "rgba(37, 99, 235, 0.25)",
    iconBg: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
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
    group: "business",
    color: "from-emerald-500 to-teal-600",
    glowColor: "rgba(16, 185, 129, 0.25)",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
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
    group: "business",
    color: "from-purple-500 to-pink-600",
    glowColor: "rgba(168, 85, 247, 0.25)",
    iconBg: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
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
    color: "from-rose-500 to-red-600",
    glowColor: "rgba(244, 63, 94, 0.25)",
    iconBg: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
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
    color: "from-amber-500 to-orange-600",
    glowColor: "rgba(245, 158, 11, 0.25)",
    iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
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
    color: "from-cyan-500 to-blue-600",
    glowColor: "rgba(6, 182, 212, 0.25)",
    iconBg: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
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
    group: "services",
    color: "from-indigo-500 to-sky-600",
    glowColor: "rgba(99, 102, 241, 0.25)",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
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
    group: "business",
    color: "from-fuchsia-500 to-purple-600",
    glowColor: "rgba(217, 70, 239, 0.25)",
    iconBg: "bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400",
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
    color: "from-yellow-500 to-amber-600",
    glowColor: "rgba(234, 179, 8, 0.25)",
    iconBg: "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
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
    group: "business",
    color: "from-violet-500 to-indigo-700",
    glowColor: "rgba(139, 92, 246, 0.25)",
    iconBg: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
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
    color: "from-pink-500 to-rose-600",
    glowColor: "rgba(236, 72, 153, 0.25)",
    iconBg: "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
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
    color: "from-teal-500 to-emerald-700",
    glowColor: "rgba(20, 184, 166, 0.25)",
    iconBg: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
    subdomains: [
      "Civil Construction",
      "Architecture & Planning",
      "Property Management",
      "Commercial Leasing",
      "Site Supervision",
    ],
  },
];

const SECTOR_GROUPS = [
  { id: "all", label: "All Sectors", icon: Layers },
  { id: "tech", label: "Tech & IT", icon: Code2 },
  { id: "business", label: "Business & Finance", icon: TrendingUp },
  { id: "healthcare", label: "Healthcare", icon: HeartPulse },
  { id: "engineering", label: "Engineering & Mfg", icon: Cpu },
  { id: "operations", label: "Operations & Logistics", icon: Truck },
  { id: "creative", label: "Creative & Media", icon: Palette },
  { id: "services", label: "Services & EdTech", icon: Users },
];

export default function JobCategories() {
  const navigate = useNavigate();

  const [realCounts, setRealCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");
  const [sortBy, setSortBy] = useState("jobs"); // "jobs" (most jobs first, default), "alpha-asc", "alpha-desc"
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  // Fetch live aggregated database counts on mount
  useEffect(() => {
    let isMounted = true;
    const fetchCategoryCounts = async () => {
      try {
        setIsLoadingCounts(true);
        const { data } = await axios.get(`${API_BASE_URL}/jobs/category-counts`);
        if (isMounted && data && typeof data === "object") {
          setRealCounts(data);
        }
      } catch (err) {
        console.error("Failed to fetch live job counts:", err);
      } finally {
        if (isMounted) setIsLoadingCounts(false);
      }
    };
    fetchCategoryCounts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute total active jobs across all categories
  const totalActiveJobs = useMemo(() => {
    return Object.values(realCounts).reduce(
      (sum, val) => sum + (typeof val === "number" ? val : 0),
      0
    );
  }, [realCounts]);

  // Dynamically merge any industries returned from backend that aren't in BASE_CATEGORIES
  const allCategories = useMemo(() => {
    const list = [...BASE_CATEGORIES];
    const existingNames = new Set(list.map((c) => c.name.toLowerCase()));

    const fallbackGradients = [
      "from-blue-600 to-sky-500",
      "from-emerald-600 to-green-500",
      "from-purple-600 to-indigo-500",
      "from-amber-600 to-orange-500",
      "from-rose-600 to-pink-500",
    ];

    Object.keys(realCounts).forEach((catName, idx) => {
      if (catName && !existingNames.has(catName.toLowerCase())) {
        list.push({
          name: catName,
          icon: Briefcase,
          group: "services",
          color: fallbackGradients[idx % fallbackGradients.length],
          glowColor: "rgba(59, 130, 246, 0.2)",
          iconBg:
            "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
          subdomains: ["General Roles", "Specialized Positions"],
        });
        existingNames.add(catName.toLowerCase());
      }
    });

    return list;
  }, [realCounts]);

  // Filter & sort categories: Default order ALWAYS puts industries with MORE JOBS FIRST!
  const processedCategories = useMemo(() => {
    let list = [...allCategories];

    // Filter by Sector Group
    if (activeGroup !== "all") {
      list = list.filter((cat) => cat.group === activeGroup);
    }

    // Filter by Search Query (matches category name or any of its subdomains)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((cat) => {
        const nameMatch = cat.name.toLowerCase().includes(q);
        const subdomainMatch = cat.subdomains?.some((sub) =>
          sub.toLowerCase().includes(q)
        );
        return nameMatch || subdomainMatch;
      });
    }

    // Sorting: "jobs" places industries with the highest job count at the front
    list.sort((a, b) => {
      const countA = realCounts[a.name] || 0;
      const countB = realCounts[b.name] || 0;

      if (sortBy === "jobs") {
        if (countB !== countA) {
          return countB - countA; // Higher job count first
        }
        return 0; // Maintain base popularity order on ties
      } else if (sortBy === "alpha-asc") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "alpha-desc") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    return list;
  }, [allCategories, activeGroup, searchQuery, sortBy, realCounts]);

  // Handle category navigation
  const handleCategoryClick = (categoryName) => {
    navigate(`/jobs?industry=${encodeURIComponent(categoryName)}`);
  };

  // Handle subdomain tag click
  const handleSubdomainClick = (e, categoryName, subdomain) => {
    e.stopPropagation();
    navigate(
      `/jobs?industry=${encodeURIComponent(categoryName)}&subdomain=${encodeURIComponent(subdomain)}`
    );
  };

  // Determine how many items to display
  const INITIAL_VISIBLE_COUNT = 8;
  const isSearchActive = searchQuery.trim().length > 0;
  const isGroupFiltered = activeGroup !== "all";

  // When searching or group filtered, show all matching results; otherwise respect expand toggle
  const visibleCategories =
    isSearchActive || isGroupFiltered || isExpanded
      ? processedCategories
      : processedCategories.slice(0, INITIAL_VISIBLE_COUNT);

  return (
    <section className="relative py-16 md:py-24 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 overflow-hidden w-full">
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 lg:px-16 mx-auto max-w-[1600px]">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 mb-3 shadow-xs">
              <Sparkles size={13} className="text-blue-500 dark:text-blue-400" />
              <span>POPULAR INDUSTRIES & SECTORS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Explore by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400">
                Industry & Specialty
              </span>
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Discover verified opportunities tailored to your career domain.
              Sorted automatically by highest active hiring demand.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                <Flame size={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Live Demand
                </p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {isLoadingCounts ? (
                    <span className="text-xs text-slate-400">Updating...</span>
                  ) : totalActiveJobs > 0 ? (
                    `${totalActiveJobs} Active Positions`
                  ) : (
                    `${allCategories.length} Industry Sectors`
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS BAR */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-8 space-y-4">
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
                placeholder="Search by industry name, specialty, or keywords (e.g. Software, Banking, Healthcare)..."
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
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
                    Most Jobs First (Default)
                  </option>
                  <option value="alpha-asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    Alphabetical (A - Z)
                  </option>
                  <option value="alpha-desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    Alphabetical (Z - A)
                  </option>
                </select>
              </div>

              {/* Match Counter Badge */}
              <div className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/50 text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                {processedCategories.length} {processedCategories.length === 1 ? "Sector" : "Sectors"}
              </div>
            </div>
          </div>

          {/* SECTOR GROUP TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100 dark:border-slate-800/80">
            {SECTOR_GROUPS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeGroup === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveGroup(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30"
                      : "bg-slate-100/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <TabIcon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CATEGORIES GRID */}
        {processedCategories.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-16 px-4 text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Search size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No matching industries found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              We couldn't find any categories matching "{searchQuery}". Try
              searching for different keywords or explore all sectors.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveGroup("all");
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
          >
            <AnimatePresence mode="popLayout">
              {visibleCategories.map((cat, index) => {
                const CategoryIcon = cat.icon || Briefcase;
                const liveCount = realCounts[cat.name] || 0;
                const countLabel =
                  liveCount > 0
                    ? `${liveCount} ${liveCount === 1 ? "Open Role" : "Open Roles"}`
                    : "Explore Roles";

                return (
                  <motion.div
                    key={cat.name}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.25,
                      delay: Math.min(index * 0.03, 0.3),
                    }}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_16px_32px_-4px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_16px_32px_-4px_rgba(99,102,241,0.25)] transition-all duration-300 cursor-pointer -translate-y-0 hover:-translate-y-1.5"
                  >
                    {/* Subtle Radial Glow on Hover */}
                    <div
                      className="absolute -right-12 -top-12 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none"
                      style={{ background: cat.glowColor }}
                    />

                    {/* TOP SECTION: ICON + JOB STATUS BADGE + ARROW */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        {/* Icon Container */}
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-300 shrink-0`}
                        >
                          <CategoryIcon size={22} />
                        </div>

                        {/* Status Badge & Arrow */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                              liveCount > 0
                                ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60"
                                : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60"
                            }`}
                          >
                            <span className="relative flex h-2 w-2">
                              {liveCount > 0 && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              )}
                              <span
                                className={`relative inline-flex rounded-full h-2 w-2 ${
                                  liveCount > 0 ? "bg-emerald-500" : "bg-slate-400"
                                }`}
                              />
                            </span>
                            <span>{countLabel}</span>
                          </span>

                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600 dark:group-hover:text-white transition-all flex items-center justify-center shrink-0">
                            <ArrowUpRight
                              size={15}
                              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                            />
                          </div>
                        </div>
                      </div>

                      {/* CATEGORY TITLE */}
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {cat.name}
                      </h3>
                    </div>

                    {/* SUBDOMAINS / SPECIALTIES TAGS */}
                    {cat.subdomains && cat.subdomains.length > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                          Popular Specialties
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.subdomains.slice(0, 3).map((sub) => (
                            <button
                              key={sub}
                              type="button"
                              onClick={(e) => handleSubdomainClick(e, cat.name, sub)}
                              title={`View jobs in ${sub}`}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer truncate max-w-[170px]"
                            >
                              {sub}
                            </button>
                          ))}
                          {cat.subdomains.length > 3 && (
                            <span
                              title={cat.subdomains.slice(3).join(", ")}
                              className="text-[10px] font-bold px-1.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500"
                            >
                              +{cat.subdomains.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* BOTTOM EXPAND & ACTION BAR */}
        {!isSearchActive && !isGroupFiltered && processedCategories.length > INITIAL_VISIBLE_COUNT && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>
                {isExpanded
                  ? "Show Fewer Sectors"
                  : `View All ${processedCategories.length} Industry Sectors`}
              </span>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All Jobs</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
