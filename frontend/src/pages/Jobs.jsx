import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  Filter,
  X,
  Building2,
  Target,
  Bookmark,
  Building,
} from "lucide-react";
import CompanyDisplay from "../components/CompanyDisplay";
import JobDetailsModal from "../components/JobDetailsModal";

// FACT: Removed 'export' to fix the React Module Redline Error
const INDUSTRY_SUBDOMAINS = {
  "IT & Software": [
    "Software Development",
    "Data & Analytics",
    "Infrastructure & Cloud",
    "Security & Testing",
    "Design & Product",
  ],
  "Banking & Finance": [
    "Corporate & Investment Banking",
    "Core Finance & Accounting",
    "Retail Banking",
    "Wealth & Asset Management",
    "Risk & Insurance",
  ],
  "Sales & Marketing": [
    "B2B & Corporate Sales",
    "Digital Marketing",
    "Brand & Strategy",
    "Retail & B2C Sales",
    "Communications",
  ],
  "Healthcare & Pharma": [
    "Clinical & Medical",
    "Pharmaceuticals",
    "Healthcare Administration",
    "Medical Sales & Support",
    "Life Sciences",
  ],
  "Engineering & Manufacturing": [
    "Core Engineering",
    "Production & Plant Operations",
    "Quality & Process Improvement",
    "Design & Drafting",
    "Emerging Sectors",
  ],
  "Operations & Logistics": [
    "Supply Chain & Logistics",
    "E-commerce & Delivery",
    "Inventory & Warehousing",
    "Vendor Management",
    "Business Operations",
  ],
  "Customer Support": [
    "Voice Operations",
    "Non-Voice/Digital Support",
    "Technical Support",
    "Client Management",
    "Outsourcing",
  ],
  "HR & Admin": [
    "Talent Acquisition",
    "Core HR",
    "Operations & Compliance",
    "Employee Development",
    "Administration",
  ],
  "Education & EdTech": [
    "Teaching & Academics",
    "EdTech Content",
    "Student Services",
    "Institutional Operations",
    "Corporate Training",
  ],
};

export default function Jobs() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  // Initial Filters
  const [filters, setFilters] = useState({
    profile: queryParams.get("title") || "",
    location: queryParams.get("location") || "",
    industry: queryParams.get("industry") || "", // FACT: Injected Industry URL parameter
    subdomain: "", // FACT: Injected Subdomain parameter
    stipend: 0,
    workFromHome: false,
    partTime: false,
    jobType: "all",
  });

  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await axios.get("https://jobone-mrpy.onrender.com/jobs");
        const jobsData = res.data.data || res.data;

        // Filter out closed or inactive jobs from the public board
        const activeJobs = Array.isArray(jobsData)
          ? jobsData.filter(
              (j) =>
                j.status !== "inactive" &&
                j.status !== "closed" &&
                j.status !== "deadline passed",
            )
          : [];
        setAllJobs(activeJobs);
      } catch (err) {
        console.error(err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const renderArray = (val) => {
    if (!val) return "Not specified";
    if (Array.isArray(val))
      return val.length > 0 ? val.join(", ") : "Not specified";
    return String(val);
  };

  const getArraySafe = (val) => {
    if (!val) return [];
    return Array.isArray(val)
      ? val.map((v) => String(v).toLowerCase())
      : [String(val).toLowerCase()];
  };

  // --- FILTER LOGIC ---
  const filteredJobs = allJobs.filter((job) => {
    const jobLocation =
      typeof job.location === "object"
        ? job.location?.address?.toLowerCase() || ""
        : job.location?.toLowerCase() || "";
    const title = job.title?.toLowerCase() || "";

    const salary = Number(job.salaryMin) || Number(job.salaryAmount) || 0;

    const jobTypes = getArraySafe(job.jobType);
    const modes = getArraySafe(job.mode);

    const matchProfile = filters.profile
      ? title.includes(filters.profile.toLowerCase()) ||
        job.description?.toLowerCase().includes(filters.profile.toLowerCase())
      : true;

    const matchLocation = filters.location
      ? jobLocation.includes(filters.location.toLowerCase())
      : true;
    const matchSalary = filters.stipend
      ? salary >= Number(filters.stipend)
      : true;

    const matchWFH = filters.workFromHome
      ? modes.some((m) => m.includes("home") || m.includes("online")) ||
        title.includes("remote")
      : true;

    const matchPartTime = filters.partTime
      ? jobTypes.some((t) => t.includes("part-time"))
      : true;

    // FACT: Implemented the logic to strictly filter by Industry & Subdomain
    const matchIndustry = filters.industry
      ? job.industry === filters.industry
      : true;
    const matchSubdomain = filters.subdomain
      ? job.subdomain === filters.subdomain
      : true;

    return (
      matchProfile &&
      matchLocation &&
      matchSalary &&
      matchWFH &&
      matchPartTime &&
      matchIndustry &&
      matchSubdomain
    );
  });

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
<div className="min-h-screen bg-[#F8FAFC] pt-24 pb-12 px-4 sm:px-6 font-sans mt-10">
  <div className="max-w-7xl mx-auto">
    {/* HEADER */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find Your Next Role
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Browse{" "}
          <span className="text-indigo-600 font-bold">
            {filteredJobs.length}
          </span>{" "}
          open positions matching your criteria.
        </p>
      </div>
      <button
        className="md:hidden flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl shadow-sm border border-slate-200 text-slate-700 font-bold active:scale-95 transition-transform"
        onClick={() => setShowMobileFilters(true)}
      >
        <Filter size={18} /> Filters
      </button>
    </div>

    <div className="flex flex-col md:flex-row gap-8">
      {/* --- SIDEBAR FILTERS --- */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 p-6 overflow-y-auto md:relative md:translate-x-0 md:w-1/4 md:shadow-none md:bg-transparent md:p-0 md:h-auto md:overflow-visible ${showMobileFilters ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center md:hidden mb-6">
          <h2 className="text-xl font-extrabold text-slate-800">Filters</h2>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-8 md:sticky md:top-24">
          {/* FACT: New Domain Filters cleanly injected into the sidebar */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                Industry
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium text-slate-700"
                value={filters.industry}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    industry: e.target.value,
                    subdomain: "",
                  })
                }
              >
                <option value="">All Industries</option>
                {Object.keys(INDUSTRY_SUBDOMAINS).map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {filters.industry && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                  Speciality
                </label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium text-slate-700"
                  value={filters.subdomain}
                  onChange={(e) =>
                    setFilters({ ...filters, subdomain: e.target.value })
                  }
                >
                  <option value="">All {filters.industry} Roles</option>
                  {INDUSTRY_SUBDOMAINS[filters.industry].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="h-px bg-slate-100"></div>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                Keywords
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Job title or keyword"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium"
                  value={filters.profile}
                  onChange={(e) =>
                    setFilters({ ...filters, profile: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                Location
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="City or Zip code"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-sm font-medium"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">
              Min Salary (Monthly)
            </label>
            <input
              type="range"
              min="0"
              max="200000"
              step="5000"
              value={filters.stipend}
              onChange={(e) =>
                setFilters({ ...filters, stipend: e.target.value })
              }
              className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-3 text-xs font-extrabold text-slate-600">
              <span>₹{Number(filters.stipend).toLocaleString()}</span>
              <span className="text-slate-400">₹2L+</span>
            </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="accent-indigo-600 w-4 h-4 rounded border-slate-300"
                checked={filters.workFromHome}
                onChange={(e) =>
                  setFilters({ ...filters, workFromHome: e.target.checked })
                }
              />
              <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                Work from home
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="accent-indigo-600 w-4 h-4 rounded border-slate-300"
                checked={filters.partTime}
                onChange={(e) =>
                  setFilters({ ...filters, partTime: e.target.checked })
                }
              />
              <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                Part-time only
              </span>
            </label>
          </div>

          <button
            onClick={() =>
              setFilters({
                profile: "",
                location: "",
                industry: "", // FACT: Clear new filters on reset
                subdomain: "", // FACT: Clear new filters on reset
                stipend: 0,
                workFromHome: false,
                partTime: false,
                jobType: "all",
              })
            }
            className="w-full py-3 text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-colors border border-slate-200"
          >
            Reset Filters
          </button>
        </div>
      </aside>

      {showMobileFilters && (
        <div
          className="fixed inset-0 bg-slate-900/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      {/* --- JOB LIST --- */}
      <main className="flex-1 w-full">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl h-40 animate-pulse shadow-sm border border-slate-100"
              ></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-rose-100 shadow-sm">
            <p className="text-rose-500 font-bold">{error}</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Search className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800">
              No jobs found
            </h3>
            <p className="text-slate-500 mt-2 font-medium">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredJobs.map((job) => {
              const displayLocation =
                typeof job.location === "object"
                  ? job.location.address
                  : job.location || "Remote";

              return (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-5">
                    <div className="flex gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0 text-indigo-600 font-extrabold shadow-sm">
                        {job.postedByImage ? (
                          <img
                            src={job.postedByImage}
                            alt="Company"
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : job.postedByCompany ? (
                          job.postedByCompany.charAt(0)
                        ) : job.postedByName ? (
                          job.postedByName.charAt(0)
                        ) : (
                          <Building2 size={28} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-slate-500 font-bold mb-3 flex items-center gap-1.5">
                          <CompanyDisplay job={job} fallback="Company Confidential" />
                        </p>
                        <div className="flex flex-wrap gap-2.5 text-xs font-bold text-slate-600">
                          <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <MapPin size={14} className="text-slate-400" />{" "}
                            <span className="truncate max-w-[120px] sm:max-w-[200px]">
                              {displayLocation}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 capitalize">
                            <Briefcase size={14} />{" "}
                            {renderArray(job.jobType)}
                          </span>

                          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                            <IndianRupee size={14} />{" "}
                            {job.salaryMin === 0 && job.salaryMax === 0
                              ? "UNPAID"
                              : `${job.salaryMin?.toLocaleString() || 0} - ${job.salaryMax?.toLocaleString() || 0}`}
                          </span>

                          {/* FACT: Explicitly renders the Industry & Subdomain badges on the card */}
                          {job.industry && (
                            <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100">
                              <Target size={14} /> {job.industry}
                              {job.subdomain && (
                                <span className="text-amber-500/80 mx-0.5">
                                  •
                                </span>
                              )}
                              {job.subdomain && (
                                <span>{job.subdomain}</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end min-w-fit mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={12} />{" "}
                        {formatTimeAgo(job.postedAt || job.createdAt)}
                      </span>
                      <button className="text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-xl sm:opacity-0 sm:group-hover:opacity-100 transition-all border border-indigo-100 shadow-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  </div>

  <AnimatePresence>
    {selectedJob && (
      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    )}
  </AnimatePresence>
</div>
  );
}
