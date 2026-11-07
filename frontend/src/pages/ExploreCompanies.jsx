import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Building2, Search, MapPin, Briefcase, Filter, ArrowLeft, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { API_BASE_URL } from "../config/api";

export default function ExploreCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();

    const fetchCompanies = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/employer/explore`, {
          signal: controller.signal,
        });
        setCompanies(res.data || []);
      } catch (err) {
        if (axios.isCancel(err) || err.name === "CanceledError" || err.name === "AbortError") {
          return;
        }
        console.error("Error fetching companies:", err);
        setError("Failed to load corporate directory. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
    return () => {
      controller.abort();
    };
  }, []);

  const filteredCompanies = useMemo(() => {
    let result = companies;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.companyName?.toLowerCase().includes(lower) ||
          c.name?.toLowerCase().includes(lower)
      );
    }
    if (selectedIndustry) {
      result = result.filter((c) => c.industry === selectedIndustry);
    }
    return result;
  }, [companies, searchTerm, selectedIndustry]);

  const industries = useMemo(() => {
    return [...new Set(companies.map((c) => c.industry).filter(Boolean))];
  }, [companies]);

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- EDITORIAL HERO SECTION --- */}
        <div className="bg-surface-1 border border-border rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-2xl mb-12">
          {/* Subtle architectural background texture */}
          <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-40" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-silver/5 rounded-full blur-3xl pointer-events-none" />

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-foreground/60 hover:text-foreground transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-[11px] font-mono text-silver mb-4">
              <ShieldCheck size={13} className="text-silver" />
              <span>VERIFIED EMPLOYER DIRECTORY</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-foreground mb-4">
              Explore Hiring Enterprises
            </h1>
            <p className="text-foreground/70 text-sm sm:text-base leading-relaxed mb-8">
              Discover engineering powerhouses, high-growth startups, and global enterprises actively recruiting through JobOne.
            </p>

            {/* Integrated Search & Industry Filter */}
            <div className="bg-surface-2 border border-border p-2 sm:p-3 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-lg">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" size={18} />
                <input
                  type="text"
                  placeholder="Search by company or employer title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-1 border border-border/60 text-foreground placeholder-foreground/40 text-xs sm:text-sm focus:outline-none focus:border-silver/60 transition-colors"
                />
              </div>

              <div className="sm:w-60 relative">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" size={16} />
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 rounded-xl bg-surface-1 border border-border/60 text-foreground text-xs sm:text-sm focus:outline-none focus:border-silver/60 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">All Industry Sectors</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind} className="bg-surface-1 text-foreground">
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* --- COMPANIES DIRECTORY --- */}
        <div>
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-border">
            <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">
              {filteredCompanies.length} Verified {filteredCompanies.length === 1 ? "Enterprise" : "Enterprises"} Active
            </h2>
            <span className="text-xs font-mono text-foreground/50">
              Live recruitment telemetry
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-6 rounded-2xl bg-surface-1 border border-border h-60 animate-pulse space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-surface-2" />
                  <div className="h-5 w-2/3 bg-surface-2 rounded-lg" />
                  <div className="h-3 w-1/2 bg-surface-2 rounded-lg" />
                  <div className="h-3 w-1/3 bg-surface-2 rounded-lg" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-center text-sm font-mono">
              {error}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-12 rounded-3xl bg-surface-1 border border-border text-center shadow-sm">
              <Building2 className="mx-auto text-foreground/30 mb-4" size={48} />
              <h3 className="text-lg font-display font-bold text-foreground mb-1">
                No matching enterprises found
              </h3>
              <p className="text-xs text-foreground/60 max-w-xs mx-auto">
                Try modifying your keywords or clearing the industry filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => {
                const displayName = company.companyName || company.name || "Confidential Employer";
                return (
                  <div
                    key={company._id}
                    onClick={() => navigate(`/company/${company._id}`)}
                    className="p-6 rounded-2xl bg-surface-1 border border-border hover:border-silver/50 transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <div>
                      {/* Logo and Job Count Badge */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-14 h-14 rounded-xl bg-surface-2 border border-border flex items-center justify-center overflow-hidden p-2 group-hover:scale-105 transition-transform">
                          {company.profilePicture ? (
                            <img
                              src={company.profilePicture}
                              alt={displayName}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building2 size={26} className="text-foreground/40" />
                          )}
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-surface-2 border border-border text-foreground flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{company.jobCount} {company.jobCount === 1 ? "Role" : "Roles"}</span>
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-display font-bold text-foreground group-hover:text-silver transition-colors mb-2 line-clamp-1 flex items-center gap-1.5">
                        <span>{displayName}</span>
                        <ShieldCheck size={14} className="text-silver shrink-0" />
                      </h3>

                      <div className="space-y-1.5 text-xs text-foreground/60 mb-6">
                        <div className="flex items-center gap-2 line-clamp-1">
                          <MapPin size={13} className="text-foreground/40 shrink-0" />
                          <span>{company.location || "Distributed / Remote"}</span>
                        </div>
                        <div className="flex items-center gap-2 line-clamp-1">
                          <Briefcase size={13} className="text-foreground/40 shrink-0" />
                          <span>{company.industry || "General Technology"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-semibold text-foreground/80 group-hover:text-foreground">
                      <span>View Enterprise Dossier</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
