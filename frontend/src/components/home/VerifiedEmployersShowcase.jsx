import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, ShieldCheck, MapPin, Briefcase, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { cachedGet } from "../../utils/apiCache";
import SectionHeader from "../shared/SectionHeader";

export default function VerifiedEmployersShowcase() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    cachedGet(`${API_BASE_URL}/employer/explore`, {}, { ttlMs: 120000 })
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
        setEmployers(Array.isArray(list) ? list.slice(0, 6) : []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      aria-label="Verified Employer Showcase"
      className="py-16 sm:py-20 bg-[var(--theme-bg)] text-[var(--theme-text)] border-t border-[var(--theme-border)] transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Approved Companies Actively Hiring"
          subtitle="Explore approved company profiles and discover active recruitment opportunities."
          action={
            <Link
              to="/companies"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[var(--theme-text)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] transition shadow-xs"
            >
              <span>Explore All Companies</span>
              <ArrowRight className="w-4 h-4 text-[var(--theme-accent-silver)]" />
            </Link>
          }
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 animate-pulse flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-muted)]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-2/3 rounded bg-[var(--theme-surface-muted)]" />
                    <div className="h-3 w-1/2 rounded bg-[var(--theme-surface-muted)]" />
                  </div>
                </div>
                <div className="h-4 w-1/3 rounded bg-[var(--theme-surface-muted)]" />
              </div>
            ))}
          </div>
        ) : employers.length === 0 ? (
          <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 text-center">
            <p className="text-sm text-[var(--theme-text-muted)] mb-4">
              Discover verified organizations and active hiring teams in our company directory.
            </p>
            <Link
              to="/companies"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 transition"
            >
              <span>Browse Companies Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {employers.map((emp) => {
              const displayName = emp.companyName || emp.name || "Verified Employer";
              const loc =
                typeof emp.location === "object"
                  ? emp.location?.address || "India"
                  : emp.location || "India";

              return (
                <Link
                  key={emp._id}
                  to={`/company/${emp._id}`}
                  className="group rounded-2xl border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] bg-[var(--theme-surface)] p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3.5 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] p-1.5 flex items-center justify-center shrink-0 overflow-hidden text-sm font-bold text-[var(--theme-text)]">
                        {emp.profilePicture ? (
                          <img
                            src={emp.profilePicture}
                            alt={displayName}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-[var(--theme-accent-silver)]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-[var(--theme-text)] truncate">
                            {displayName}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        </div>
                        <p className="text-xs text-[var(--theme-text-muted)] truncate mt-0.5">
                          {emp.industry || emp.employerType || "Verified Organization"}
                        </p>
                      </div>
                    </div>

                    {emp.description && (
                      <p className="text-xs text-[var(--theme-text-muted)] line-clamp-2 leading-relaxed mb-4">
                        {emp.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3.5 border-t border-[var(--theme-border)] flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-[var(--theme-text-muted)] truncate max-w-[140px]">
                      <MapPin className="w-3.5 h-3.5 text-[var(--theme-accent-silver)] shrink-0" />
                      <span className="truncate">{loc}</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 font-bold text-[var(--theme-text)] shrink-0">
                      <Briefcase className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" />
                      <span>
                        {emp.jobCount} {emp.jobCount === 1 ? "Open Role" : "Open Roles"}
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

