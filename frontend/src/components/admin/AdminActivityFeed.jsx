import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Briefcase,
  Building2,
  User,
  Mail,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function AdminActivityFeed({
  jobs = [],
  employers = [],
  jobseekers = [],
  contacts = [],
  onSelectTab,
}) {
  const [filterType, setFilterType] = useState("all");

  // Construct real chronological audit log strictly from MongoDB documents
  const activityItems = useMemo(() => {
    const list = [];

    // Jobs
    jobs.forEach((j) => {
      if (j.createdAt) {
        list.push({
          id: `job-${j._id}`,
          type: "job",
          title: j.title || "Job Posting",
          actor: j.postedByCompany || j.postedByName || "Employer",
          timestamp: new Date(j.createdAt).getTime(),
          dateStr: j.createdAt,
          status: j.status || "active",
          link: `/admin/job/${j._id}`,
          meta: j.jobType || j.location?.address || j.location || "Full-time",
        });
      }
    });

    // Employers
    employers.forEach((e) => {
      if (e.createdAt) {
        list.push({
          id: `emp-${e._id}`,
          type: "employer",
          title: e.companyName || e.name || "Employer Registration",
          actor: e.email || "Registered Organization",
          timestamp: new Date(e.createdAt).getTime(),
          dateStr: e.createdAt,
          status: e.isApproved || "pending",
          link: `/admin/employer/${e._id}`,
          meta: e.employerType === "individual" ? "Individual Recruiter" : "Corporate Account",
        });
      }
    });

    // Jobseekers
    jobseekers.forEach((u) => {
      if (u.createdAt) {
        list.push({
          id: `user-${u._id}`,
          type: "jobseeker",
          title: u.name || "Candidate Registration",
          actor: u.email || "New Candidate",
          timestamp: new Date(u.createdAt).getTime(),
          dateStr: u.createdAt,
          status: u.isFrozen ? "frozen" : "active",
          link: `/admin/user/${u._id}`,
          meta: u.skills && u.skills.length > 0 ? `${u.skills.length} skills listed` : "New Profile",
        });
      }
    });

    // Contacts
    contacts.forEach((c) => {
      if (c.createdAt) {
        list.push({
          id: `contact-${c._id}`,
          type: "contact",
          title: c.subject || "Contact Inbound Inquiry",
          actor: c.name ? `${c.name} (${c.email})` : c.email || "Public User",
          timestamp: new Date(c.createdAt).getTime(),
          dateStr: c.createdAt,
          status: c.isRead ? "read" : "unread",
          link: null,
          meta: "Support Form",
        });
      }
    });

    // Sort newest first
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list;
  }, [jobs, employers, jobseekers, contacts]);

  const filteredItems = useMemo(() => {
    if (filterType === "all") return activityItems.slice(0, 10);
    return activityItems.filter((item) => item.type === filterType).slice(0, 10);
  }, [activityItems, filterType]);

  const getIcon = (type) => {
    switch (type) {
      case "job":
        return <Briefcase size={14} className="text-[var(--theme-text)]" />;
      case "employer":
        return <Building2 size={14} className="text-[#C0C0C0]" />;
      case "jobseeker":
        return <User size={14} className="text-[var(--theme-text)]" />;
      case "contact":
        return <Mail size={14} className="text-[#C0C0C0]" />;
      default:
        return <Activity size={14} className="text-[var(--theme-text-muted)]" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "job":
        return "JOB";
      case "employer":
        return "KYC";
      case "jobseeker":
        return "CANDIDATE";
      case "contact":
        return "SUPPORT";
      default:
        return "EVENT";
    }
  };

  const formatRelativeTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      if (diffDay === 1) return "Yesterday";
      if (diffDay < 7) return `${diffDay}d ago`;
      return date.toLocaleDateString();
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-xs p-5 sm:p-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--theme-border)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)]">
              <Activity size={15} />
            </div>
            <h3 className="text-base sm:text-lg font-bold font-display tracking-tight text-[var(--theme-text)]">
              Live Platform Audit Feed
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]">
              {activityItems.length} events logged
            </span>
          </div>
          <p className="text-xs text-[var(--theme-text-muted)] mt-1">
            Real-time chronological events from verified platform transactions
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "job", label: "Jobs" },
            { id: "employer", label: "Employers" },
            { id: "jobseeker", label: "Candidates" },
            { id: "contact", label: "Inquiries" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer shrink-0 ${
                filterType === tab.id
                  ? "bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold shadow-xs"
                  : "bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] border border-[var(--theme-border)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Items */}
      <div className="mt-4">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle2 size={32} className="mx-auto text-[var(--theme-text-muted)] opacity-60 mb-2" />
            <p className="text-sm font-semibold text-[var(--theme-text)]">No platform events found</p>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1">
              Events will populate dynamically as jobs and accounts are registered.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--theme-border)]">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 group hover:bg-[var(--theme-surface-elevated)]/40 px-2 -mx-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-xs bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]">
                        {getTypeLabel(item.type)}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-[var(--theme-text)] truncate max-w-xs sm:max-w-md">
                        {item.title}
                      </p>
                    </div>
                    <p className="text-[11px] font-mono text-[var(--theme-text-muted)] truncate mt-0.5">
                      By <span className="text-[var(--theme-text)] opacity-90">{item.actor}</span>
                      {item.meta && <span> • {item.meta}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-mono text-[var(--theme-text-muted)] flex items-center gap-1">
                    <Clock size={11} className="opacity-70" />
                    {formatRelativeTime(item.dateStr)}
                  </span>
                  {item.link ? (
                    <Link
                      to={item.link}
                      className="p-1 rounded-md text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-elevated)] transition-colors"
                      title="Inspect record"
                    >
                      <ChevronRight size={15} />
                    </Link>
                  ) : (
                    <div className="w-6" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer link to view full datasets */}
      {activityItems.length > 10 && (
        <div className="mt-4 pt-3 border-t border-[var(--theme-border)] flex items-center justify-between text-xs text-[var(--theme-text-muted)]">
          <span>Displaying recent 10 events of {activityItems.length} total</span>
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab("allJobs")}
            className="text-[var(--theme-text)] font-semibold hover:underline cursor-pointer"
          >
            Explore Platform Records &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
