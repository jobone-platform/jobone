import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Building2,
  Search,
  MapPin,
  Briefcase,
  Filter,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Globe,
  Users,
} from "lucide-react";
import CandidateLayout from "../../components/candidate/CandidateLayout";
import { API_BASE_URL } from "../../config/api";
import { INDUSTRIES, normalizeIndustry } from "../../constants/taxonomy";

export default function CandidateCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [locationSearch, setLocationSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();

    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
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
    return () => controller.abort();
  }, []);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedIndustry("");
    setLocationSearch("");
  };

  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    // Filter by name / keywords
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase().trim();
      result = result.filter(
        (c) =>
          (c.companyName || "").toLowerCase().includes(lower) ||
          (c.name || "").toLowerCase().includes(lower) ||
          (c.about || "").toLowerCase().includes(lower)
      );
    }

    // Filter by industry
    if (selectedIndustry) {
      result = result.filter((c) => {
        const cInd = c.industry || "";
        const normC = normalizeIndustry(cInd);
        const normSelected = normalizeIndustry(selectedIndustry);
        return normC === normSelected || cInd.toLowerCase().includes(selectedIndustry.toLowerCase());
      });
    }

    // Filter by location
    if (locationSearch.trim()) {
      const locQ = locationSearch.toLowerCase().trim();
      result = result.filter((c) =>
        (c.location || "").toLowerCase().includes(locQ)
      );
    }

    return result;
  }, [companies, searchTerm, selectedIndustry, locationSearch]);

  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    (selectedIndustry ? 1 : 0) +
    (locationSearch ? 1 : 0);

  return (
    <CandidateLayout
      activeTab="companies"
      title="Explore Companies — Corporate Directory"
      breadcrumbs={[{ label: "Explore Companies", path: "/candidate/companies" }]}
    >
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* ======================================================== */}
        {/* HERO EXPLORATION CONSOLE                                 */}
        {/* ======================================================== */}
        <div className="rounded-3xl border border-[var(--theme-border)] bg-gradient-to-br from-[var(--theme-surface)] via-[var(--theme-surface)] to-[var(--theme-surface-elevated)] p-6 sm:p-8 shadow-sm">
          <div className="max-w-4xl space-y-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[11px] font-mono text-[var(--theme-accent-silver)]">
              <ShieldCheck size={13} />
              <span>VERIFIED CORPORATE DIRECTORY</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold text-[var(--theme-text)] tracking-tight">
              Explore Hiring Enterprises & Startups
            </h1>
            <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] leading-relaxed">
              Research verified corporate profiles, explore company cultures, and apply to open positions across premier organizations recruiting on JobOne.
            </p>
          </div>

          {/* Integrated Search & Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-2 bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] rounded-2xl shadow-sm">
            <div className="md:col-span-5 relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] pointer-events-none"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search enterprise name, keywords..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-xs sm:text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-border-silver)] transition-all"
              />
            </div>

            <div className="md:col-span-4 relative">
              <Filter
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] pointer-events-none"
              />
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-xs sm:text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-border-silver)] transition-all cursor-pointer"
              >
                <option value="">All Industry Sectors</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind.id} value={ind.name}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] pointer-events-none"
                />
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Location..."
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-border-silver)] transition-all"
                />
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  title="Reset filters"
                  className="p-2.5 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DIRECTORY STATS & HEADER                                  */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[var(--theme-text)] tracking-tight">
              {loading ? "Loading directory..." : `${filteredCompanies.length} Verified ${filteredCompanies.length === 1 ? "Enterprise" : "Enterprises"}`}
            </h2>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-accent-silver)]">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-[var(--theme-text-muted)] hidden sm:inline">
            Direct employer discovery telemetry
          </span>
        </div>

        {/* ======================================================== */}
        {/* DIRECTORY GRID                                           */}
        {/* ======================================================== */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] h-64 animate-pulse space-y-4"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--theme-surface-elevated)]" />
                <div className="h-5 w-2/3 bg-[var(--theme-surface-elevated)] rounded-lg" />
                <div className="h-3 w-1/2 bg-[var(--theme-surface-elevated)] rounded-lg" />
                <div className="h-3 w-1/3 bg-[var(--theme-surface-elevated)] rounded-lg" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-center text-sm font-mono space-y-3">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-[var(--theme-surface)] text-[var(--theme-text)] border border-[var(--theme-border)] text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-center space-y-3 shadow-sm">
            <Building2 className="mx-auto text-[var(--theme-text-muted)] opacity-50" size={44} />
            <h3 className="text-base sm:text-lg font-bold text-[var(--theme-text)]">
              No matching enterprises found
            </h3>
            <p className="text-xs text-[var(--theme-text-muted)] max-w-sm mx-auto">
              Try modifying your keyword search or resetting the industry filter.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text)] transition-all cursor-pointer"
            >
              <RotateCcw size={14} /> Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCompanies.map((company) => {
              const displayName =
                company.companyName || company.name || "Verified Enterprise";
              const jobCount = company.jobCount || 0;

              return (
                <div
                  key={company._id}
                  className="rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] transition-all duration-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md group"
                >
                  <div>
                    {/* Header: Logo & Active Roles Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center overflow-hidden p-2 group-hover:scale-105 transition-transform shrink-0">
                        {company.profilePicture ? (
                          <img
                            src={company.profilePicture}
                            alt={displayName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="font-bold text-base text-[var(--theme-text)]">
                            {displayName.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] flex items-center gap-1.5 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>
                          {jobCount} {jobCount === 1 ? "Role" : "Roles"}
                        </span>
                      </span>
                    </div>

                    {/* Company Name & Sector */}
                    <h3 className="text-base sm:text-lg font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver)] transition-colors mb-2 line-clamp-1 flex items-center gap-1.5">
                      <span className="truncate">{displayName}</span>
                      <ShieldCheck size={15} className="text-[var(--theme-accent-silver)] shrink-0" />
                    </h3>

                    <div className="space-y-1.5 text-xs text-[var(--theme-text-muted)] mb-5">
                      <div className="flex items-center gap-2 line-clamp-1">
                        <MapPin size={13} className="shrink-0 text-[var(--theme-text-subtle)]" />
                        <span className="truncate">{company.location || "Distributed / Remote"}</span>
                      </div>
                      <div className="flex items-center gap-2 line-clamp-1">
                        <Briefcase size={13} className="shrink-0 text-[var(--theme-text-subtle)]" />
                        <span className="truncate">{company.industry || "General Technology"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-4 border-t border-[var(--theme-border)] flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => navigate(`/company/${company._id}`)}
                      className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] font-semibold transition-colors flex items-center gap-1 cursor-pointer py-1"
                    >
                      <span>Enterprise Dossier</span>
                      <ExternalLink size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/candidate/jobs?q=${encodeURIComponent(displayName)}`)
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] text-[var(--theme-text)] font-semibold transition-all cursor-pointer"
                    >
                      <span>View Open Jobs</span>
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CandidateLayout>
  );
}

