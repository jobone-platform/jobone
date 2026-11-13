import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Wifi, ArrowRight } from "lucide-react";
import SectionHeader from "../shared/SectionHeader";

const HIRING_LOCATIONS = [
  { name: "Remote", subtitle: "Work from anywhere", query: "Remote", isRemote: true },
  { name: "Bengaluru", subtitle: "Tech & Engineering hub", query: "Bengaluru" },
  { name: "Delhi NCR", subtitle: "Enterprise & Operations", query: "Delhi" },
  { name: "Mumbai", subtitle: "Finance & Corporate", query: "Mumbai" },
  { name: "Hyderabad", subtitle: "Cloud & Product roles", query: "Hyderabad" },
  { name: "Pune", subtitle: "Software & R&D", query: "Pune" },
  { name: "Chennai", subtitle: "IT & Manufacturing", query: "Chennai" },
  { name: "Kolkata", subtitle: "Consulting & Services", query: "Kolkata" },
];

export default function BrowseByLocation() {
  return (
    <section
      aria-label="Browse Jobs by Location"
      className="py-16 sm:py-20 bg-[var(--theme-surface)]/40 text-[var(--theme-text)] border-t border-[var(--theme-border)] transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Browse Jobs by Location"
          subtitle="Filter open roles across major hiring hubs or explore remote-friendly positions."
          action={
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[var(--theme-text)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] transition shadow-xs"
            >
              <span>All Locations</span>
              <ArrowRight className="w-4 h-4 text-[var(--theme-accent-silver)]" />
            </Link>
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {HIRING_LOCATIONS.map((loc) => (
            <Link
              key={loc.name}
              to={`/jobs?location=${encodeURIComponent(loc.query)}`}
              className="group rounded-2xl border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] bg-[var(--theme-surface)] p-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {loc.isRemote ? (
                    <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <MapPin className="w-4 h-4 text-[var(--theme-accent-silver)] shrink-0" />
                  )}
                  <h3 className="text-sm sm:text-base font-bold text-[var(--theme-text)] truncate">
                    {loc.name}
                  </h3>
                </div>
                <p className="text-xs text-[var(--theme-text-muted)] truncate">
                  {loc.subtitle}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--theme-text-subtle)] group-hover:text-[var(--theme-text)] group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

