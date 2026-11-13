import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  MapPin,
  Users,
  Layers,
  ShieldCheck,
  FileText,
  Activity,
  CalendarClock,
  ClipboardList,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { cachedGet } from "../../utils/apiCache";

/**
 * Shared real-time platform statistics bar for Candidate and Employer homepages.
 * Fetches genuine counts from /jobs/public-stats (and /jobs/category-counts for candidate sectors).
 * When backend statistics are unavailable, renders meaningful feature highlights instead of fake or placeholder metrics.
 */
export default function AudienceStatsBar({ audience = "candidate" }) {
  const [stats, setStats] = useState(null);
  const [categoryCount, setCategoryCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const [publicRes, catRes] = await Promise.allSettled([
          cachedGet(`${API_BASE_URL}/jobs/public-stats`, {}, { ttlMs: 120000 }),
          audience === "candidate"
            ? cachedGet(`${API_BASE_URL}/jobs/category-counts`, {}, { ttlMs: 120000 })
            : Promise.resolve(null),
        ]);

        if (!active) return;

        if (publicRes.status === "fulfilled" && publicRes.value?.data) {
          setStats(publicRes.value.data);
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
      } catch (err) {
        console.error("Failed to load public stats:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadStats();
    return () => {
      active = false;
    };
  }, [audience]);

  const hasLiveStats =
    stats &&
    (Number(stats.liveJobs) > 0 ||
      Number(stats.companies) > 0 ||
      Number(stats.candidates) > 0);

  const statItems =
    audience === "employer"
      ? [
          {
            label: "Registered Candidate Profiles",
            value: Number(stats?.candidates || 0).toLocaleString(),
            icon: Users,
            note: "Candidates on JobOne",
          },
          {
            label: "Active Verified Job Postings",
            value: Number(stats?.liveJobs || 0).toLocaleString(),
            icon: Briefcase,
            note: "Currently open roles",
          },
          {
            label: "Verified Companies",
            value: Number(stats?.companies || 0).toLocaleString(),
            icon: Building2,
            note: "Approved hiring accounts",
          },
          {
            label: "Active Hiring Locations",
            value:
              Number(stats?.locations || 0) > 0
                ? Number(stats.locations).toLocaleString()
                : "Remote + Cities",
            icon: MapPin,
            note: "Cities & remote hubs",
          },
        ]
      : [
          {
            label: "Verified Job Openings",
            value: Number(stats?.liveJobs || 0).toLocaleString(),
            icon: Briefcase,
            note: "Active verified postings",
          },
          {
            label: "Verified Employers",
            value: Number(stats?.companies || 0).toLocaleString(),
            icon: Building2,
            note: "Approved organizations",
          },
          {
            label: "Active Hiring Locations",
            value:
              Number(stats?.locations || 0) > 0
                ? Number(stats.locations).toLocaleString()
                : "Remote + Cities",
            icon: MapPin,
            note: "Across cities & remote",
          },
          {
            label: categoryCount ? "Active Industry Sectors" : "Registered Candidates",
            value: categoryCount
              ? Number(categoryCount).toLocaleString()
              : Number(stats?.candidates || 0).toLocaleString(),
            icon: categoryCount ? Layers : Users,
            note: categoryCount ? "Hiring categories" : "JobOne community",
          },
        ];

  const featureHighlights =
    audience === "employer"
      ? [
          {
            label: "Direct Job Publishing",
            icon: Briefcase,
            note: "Structured role listings with skills & compensation",
          },
          {
            label: "Company Verification",
            icon: ShieldCheck,
            note: "Approved organization profiles for candidate trust",
          },
          {
            label: "Applicant Pipeline",
            icon: ClipboardList,
            note: "Review resumes and shortlist qualified talent",
          },
          {
            label: "Interview Scheduling",
            icon: CalendarClock,
            note: "Coordinate interviews from your employer portal",
          },
        ]
      : [
          {
            label: "Verified Employers",
            icon: ShieldCheck,
            note: "Approved organizations actively hiring on JobOne",
          },
          {
            label: "Direct Applications",
            icon: Briefcase,
            note: "Apply directly to company hiring teams",
          },
          {
            label: "ATS Resume Builder",
            icon: FileText,
            note: "Structured resumes tailored for open roles",
          },
          {
            label: "Application Tracking",
            icon: Activity,
            note: "Monitor submission progress in real time",
          },
        ];

  const itemsToRender = hasLiveStats ? statItems : featureHighlights;

  return (
    <section
      aria-label={audience === "employer" ? "Employer Platform Highlights" : "Candidate Platform Highlights"}
      className="w-full border-y border-[var(--theme-border)] bg-[var(--theme-surface)]/60 py-10 sm:py-12 transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {itemsToRender.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 sm:p-6 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold text-[var(--theme-text-muted)]">
                    {item.label}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-accent-silver)] shrink-0">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                </div>

                {loading ? (
                  <div className="h-8 w-20 rounded-lg bg-[var(--theme-surface-muted)] animate-pulse" />
                ) : hasLiveStats ? (
                  <div className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--theme-text)] font-mono">
                    {item.value}
                  </div>
                ) : (
                  <div className="text-base sm:text-lg font-bold tracking-tight text-[var(--theme-text)]">
                    {item.label}
                  </div>
                )}

                <p className="mt-1.5 text-[11px] font-medium text-[var(--theme-text-subtle)]">
                  {item.note}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
