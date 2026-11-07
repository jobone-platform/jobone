import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Briefcase,
  Building2,
  User,
  Mail,
  Search,
  Filter,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";

export default function AdminActivityWorkspace({
  jobs = [],
  employers = [],
  jobseekers = [],
  contacts = [],
  onSelectTab,
}) {
  const [filterType, setFilterType] = useState("all"); // "all" | "jobs" | "employers" | "jobseekers" | "contacts"
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // "today" | "7d" | "30d" | "all"
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  // Compile real chronological milestones from database
  const activities = useMemo(() => {
    const list = [];

    // Jobs
    jobs.forEach((j) => {
      if (j.createdAt) {
        list.push({
          id: `act-job-${j._id}`,
          rawId: j._id,
          type: "jobs",
          category: "Job Requisition",
          title: j.title || "Job Posting",
          actor: j.postedByCompany || j.postedByName || "Employer",
          timestamp: new Date(j.createdAt).getTime(),
          dateStr: j.createdAt,
          status: j.status || "active",
          link: `/admin/job/${j._id}`,
          detail: `${j.jobType || "Full-time"} • ${typeof j.location === "object" ? j.location?.address : j.location || "Remote"} • ${j.industry || "General"}`,
          icon: Briefcase,
        });
      }
    });

    // Employers
    employers.forEach((e) => {
      if (e.createdAt) {
        list.push({
          id: `act-emp-${e._id}`,
          rawId: e._id,
          type: "employers",
          category: "Employer Registration",
          title: e.companyName || e.name || "Corporate Account",
          actor: e.email || "Registered Organization",
          timestamp: new Date(e.createdAt).getTime(),
          dateStr: e.createdAt,
          status: e.isApproved || "pending",
          link: `/admin/employer/${e._id}`,
          detail: `${e.employerType === "individual" ? "Individual Recruiter" : "Corporate Employer"} • ${e.natureOfBusiness || "Business Entity"}`,
          icon: Building2,
        });
      }
    });

    // Jobseekers
    jobseekers.forEach((u) => {
      if (u.createdAt) {
        list.push({
          id: `act-usr-${u._id}`,
          rawId: u._id,
          type: "jobseekers",
          category: "Candidate Onboarding",
          title: u.name || "Talent Account",
          actor: u.email || "New Candidate",
          timestamp: new Date(u.createdAt).getTime(),
          dateStr: u.createdAt,
          status: u.isFrozen ? "frozen" : "active",
          link: `/admin/user/${u._id}`,
          detail: u.skills && u.skills.length > 0 ? `Skills: ${u.skills.slice(0, 3).join(", ")}` : "Profile created",
          icon: User,
        });
      }
    });

    // Contacts
    contacts.forEach((c) => {
      if (c.createdAt) {
        list.push({
          id: `act-cnt-${c._id}`,
          rawId: c._id,
          type: "contacts",
          category: "Platform Support",
          title: c.communicationType ? `Support Inbound: ${c.communicationType}` : "Platform Inquiry",
          actor: c.name ? `${c.name} (${c.email})` : c.email || "Public User",
          timestamp: new Date(c.createdAt).getTime(),
          dateStr: c.createdAt,
          status: c.isRead ? "read" : "unread",
          link: null,
          detail: c.message || "Support inquiry submitted via web portal.",
          icon: Mail,
        });
      }
    });

    // Sort newest first
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list;
  }, [jobs, employers, jobseekers, contacts]);

  // Filtered
  const filteredActivities = useMemo(() => {
    let list = [...activities];
    const now = Date.now();

    if (dateFilter === "today") {
      const startOfDay = new Date().setHours(0, 0, 0, 0);
      list = list.filter((a) => a.timestamp >= startOfDay);
    } else if (dateFilter === "7d") {
      list = list.filter((a) => a.timestamp >= now - 7 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === "30d") {
      list = list.filter((a) => a.timestamp >= now - 30 * 24 * 60 * 60 * 1000);
    }

    if (filterType !== "all") {
      list = list.filter((a) => a.type === filterType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.actor.toLowerCase().includes(q) ||
          a.detail.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activities, dateFilter, filterType, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / pageSize));
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredActivities.slice(start, start + pageSize);
  }, [filteredActivities, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─── Top Control Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--theme-border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center text-[var(--theme-accent-silver)]">
              <Activity size={18} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[var(--theme-text)]">
                Operational Activity Stream
              </h1>
              <p className="text-xs text-[var(--theme-text-muted)]">
                Chronological platform timeline aggregated from live database creation timestamps
              </p>
            </div>
          </div>
        </div>

        <span className="text-xs font-mono text-[var(--theme-text-muted)]">
          {activities.length} platform milestones tracked
        </span>
      </div>

      {/* ─── Search & Filters Bar ─────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]"
            />
            <input
              type="text"
              placeholder="Search activity stream by title, actor, or detail..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] focus:outline-hidden focus:border-[var(--theme-border-silver)] transition-colors"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text)] focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Entity Categories</option>
            <option value="jobs">Job Requisitions ({jobs.length})</option>
            <option value="employers">Employers ({employers.length})</option>
            <option value="jobseekers">Candidates ({jobseekers.length})</option>
            <option value="contacts">Support Inquiries ({contacts.length})</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text)] focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Timelines</option>
            <option value="today">Today Only</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--theme-text-muted)] pt-1">
          <span>
            Displaying {filteredActivities.length} event{filteredActivities.length === 1 ? "" : "s"}
          </span>
          {(searchQuery || filterType !== "all" || dateFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterType("all");
                setDateFilter("all");
              }}
              className="text-[var(--theme-text)] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ─── Activities Feed List ────────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
            <Activity size={36} className="mx-auto text-[var(--theme-accent-silver)] mb-3 opacity-60" />
            <p className="text-sm font-bold text-[var(--theme-text)]">No Platform Activities Found</p>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1 max-w-sm mx-auto">
              Zero records match your active query and category filters.
            </p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                className="p-4 sm:p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[var(--theme-border-silver)] transition-all"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={16} />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-sm text-[var(--theme-text)]">
                        {act.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]">
                        {act.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)]">
                        {act.status}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-[var(--theme-text-muted)] truncate">
                      Actor: <span className="text-[var(--theme-text)] font-semibold">{act.actor}</span> • {act.detail}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--theme-text-muted)] pt-0.5">
                      <Clock size={11} />
                      <span>{new Date(act.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {act.link && (
                  <div className="shrink-0 self-end sm:self-center">
                    <Link
                      to={act.link}
                      className="px-3 py-1.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Open Dossier</span>
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--theme-text-muted)]">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] hover:bg-[var(--theme-surface)] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] hover:bg-[var(--theme-surface)] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

