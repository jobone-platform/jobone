import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowUpDown,
  Lock,
  Clock,
  Briefcase,
  Building2,
  User,
  FileText,
  Shield,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Download,
  AlertTriangle,
} from "lucide-react";
import AdminAuditDetailDrawer from "./AdminAuditDetailDrawer";

export default function AdminAuditLogsView({
  allJobs = [],
  allEmployers = [],
  allJobseekers = [],
  allContacts = [],
  adminInfo = {},
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // "today" | "7d" | "30d" | "all"
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Synthesize immutable platform audit events strictly from MongoDB records
  const auditEvents = useMemo(() => {
    const events = [];

    // 1. Candidate Events
    allJobseekers.forEach((u) => {
      if (u.createdAt) {
        events.push({
          id: `AUD-USR-${u._id.slice(-6)}`,
          timestamp: new Date(u.createdAt).getTime(),
          dateStr: u.createdAt,
          actor: u.email || "Candidate User",
          actorRole: "Candidate",
          action: "CANDIDATE_REGISTERED",
          category: "Platform",
          entityType: "User",
          entityTitle: u.name || "Candidate Account",
          targetId: u._id,
          targetLink: `/admin/user/${u._id}`,
          status: "SUCCESS",
          description: "New talent candidate registered account and created profile.",
          metadata: {
            email: u.email,
            phone: u.phone,
            isVerified: u.isVerified,
            isProfileComplete: u.isProfileComplete,
          },
        });
      }

      if (u.isFrozen) {
        events.push({
          id: `AUD-FRZ-${u._id.slice(-6)}`,
          timestamp: new Date(u.updatedAt || u.createdAt).getTime(),
          dateStr: u.updatedAt || u.createdAt,
          actor: "Platform Administrator",
          actorRole: "Administrator",
          action: "ACCOUNT_FROZEN",
          category: "Security",
          entityType: "User",
          entityTitle: u.name || "Candidate Account",
          targetId: u._id,
          targetLink: `/admin/user/${u._id}`,
          status: "BLOCKED",
          description: "Candidate account access restricted by administrative security policy.",
          metadata: { isFrozen: true, userEmail: u.email },
        });
      }
    });

    // 2. Employer Events
    allEmployers.forEach((e) => {
      if (e.createdAt) {
        events.push({
          id: `AUD-EMP-${e._id.slice(-6)}`,
          timestamp: new Date(e.createdAt).getTime(),
          dateStr: e.createdAt,
          actor: e.email || "Enterprise Recruiter",
          actorRole: e.employerType === "individual" ? "Individual Recruiter" : "Corporate Employer",
          action: "EMPLOYER_REGISTERED",
          category: "KYC Verification",
          entityType: "Employer",
          entityTitle: e.companyName || e.name || "Organization",
          targetId: e._id,
          targetLink: `/admin/employer/${e._id}`,
          status: "SUCCESS",
          description: "Corporate employer entity registered on platform and uploaded KYC files.",
          metadata: {
            companyName: e.companyName,
            employerType: e.employerType,
            natureOfBusiness: e.natureOfBusiness,
            isApproved: e.isApproved,
          },
        });
      }

      if (e.isApproved === "approved") {
        events.push({
          id: `AUD-KYC-APP-${e._id.slice(-6)}`,
          timestamp: new Date(e.updatedAt || e.createdAt).getTime(),
          dateStr: e.updatedAt || e.createdAt,
          actor: "Compliance Executive",
          actorRole: "Compliance Admin",
          action: "KYC_APPROVED",
          category: "KYC Verification",
          entityType: "Employer",
          entityTitle: e.companyName || e.name || "Organization",
          targetId: e._id,
          targetLink: `/admin/employer/${e._id}`,
          status: "SUCCESS",
          description: "Employer business filing and KYC identity documents approved for public hiring.",
          metadata: { verificationState: "approved", verifiedAt: e.updatedAt },
        });
      } else if (e.isApproved === "rejected") {
        events.push({
          id: `AUD-KYC-REJ-${e._id.slice(-6)}`,
          timestamp: new Date(e.updatedAt || e.createdAt).getTime(),
          dateStr: e.updatedAt || e.createdAt,
          actor: "Compliance Executive",
          actorRole: "Compliance Admin",
          action: "KYC_REJECTED",
          category: "KYC Verification",
          entityType: "Employer",
          entityTitle: e.companyName || e.name || "Organization",
          targetId: e._id,
          targetLink: `/admin/employer/${e._id}`,
          status: "FLAGGED",
          description: "Employer filing rejected due to deficient or unverifiable legal documentation.",
          metadata: { verificationState: "rejected" },
        });
      }

      if (e.isFrozen) {
        events.push({
          id: `AUD-EMP-FRZ-${e._id.slice(-6)}`,
          timestamp: new Date(e.updatedAt || e.createdAt).getTime(),
          dateStr: e.updatedAt || e.createdAt,
          actor: "Platform Administrator",
          actorRole: "Administrator",
          action: "ACCOUNT_FROZEN",
          category: "Security",
          entityType: "Employer",
          entityTitle: e.companyName || e.name || "Organization",
          targetId: e._id,
          targetLink: `/admin/employer/${e._id}`,
          status: "BLOCKED",
          description: "Employer hiring privileges and job listings frozen by executive governance.",
          metadata: { isFrozen: true, employerEmail: e.email },
        });
      }
    });

    // 3. Job Moderation Events
    allJobs.forEach((j) => {
      if (j.createdAt) {
        events.push({
          id: `AUD-JOB-SUB-${j._id.slice(-6)}`,
          timestamp: new Date(j.createdAt).getTime(),
          dateStr: j.createdAt,
          actor: j.postedByCompany || j.postedByName || "Hiring Manager",
          actorRole: "Employer",
          action: "JOB_POSTED",
          category: "Moderation",
          entityType: "Job",
          entityTitle: j.title || "Job Requisition",
          targetId: j._id,
          targetLink: `/admin/job/${j._id}`,
          status: j.status === "pending_approval" ? "PENDING" : "SUCCESS",
          description: "New employment requisition drafted and submitted for platform moderation.",
          metadata: {
            title: j.title,
            company: j.postedByCompany,
            industry: j.industry,
            status: j.status,
          },
        });
      }

      if (j.status === "active") {
        events.push({
          id: `AUD-JOB-APP-${j._id.slice(-6)}`,
          timestamp: new Date(j.updatedAt || j.createdAt).getTime(),
          dateStr: j.updatedAt || j.createdAt,
          actor: "Moderation Desk",
          actorRole: "Moderator Admin",
          action: "JOB_APPROVED",
          category: "Moderation",
          entityType: "Job",
          entityTitle: j.title || "Job Requisition",
          targetId: j._id,
          targetLink: `/admin/job/${j._id}`,
          status: "SUCCESS",
          description: "Job posting verified compliant and published live to candidates.",
          metadata: { status: "active", publishedAt: j.updatedAt || j.createdAt },
        });
      } else if (j.status === "rejected") {
        events.push({
          id: `AUD-JOB-REJ-${j._id.slice(-6)}`,
          timestamp: new Date(j.updatedAt || j.createdAt).getTime(),
          dateStr: j.updatedAt || j.createdAt,
          actor: "Moderation Desk",
          actorRole: "Moderator Admin",
          action: "JOB_REJECTED",
          category: "Moderation",
          entityType: "Job",
          entityTitle: j.title || "Job Requisition",
          targetId: j._id,
          targetLink: `/admin/job/${j._id}`,
          status: "FLAGGED",
          description: "Job posting declined compliance standards and hidden from talent portal.",
          metadata: { status: "rejected" },
        });
      }
    });

    // 4. Contact Form Inquiries
    allContacts.forEach((c) => {
      if (c.createdAt) {
        events.push({
          id: `AUD-CNT-${c._id.slice(-6)}`,
          timestamp: new Date(c.createdAt).getTime(),
          dateStr: c.createdAt,
          actor: c.name ? `${c.name} (${c.email})` : c.email || "Public User",
          actorRole: "Public User",
          action: "CONTACT_INQUIRY_RECEIVED",
          category: "Governance",
          entityType: "Contact",
          entityTitle: c.communicationType || "Inbound Inquiry",
          targetId: c._id,
          targetLink: null,
          status: c.isRead ? "SUCCESS" : "PENDING",
          description: "External inquiry submitted through the public platform contact channel.",
          metadata: {
            communicationType: c.communicationType,
            email: c.email,
            isRead: c.isRead,
          },
        });
      }
    });

    // Sort newest first by default
    events.sort((a, b) => b.timestamp - a.timestamp);
    return events;
  }, [allJobseekers, allEmployers, allJobs, allContacts]);

  // Filtered & Paginated events
  const filteredEvents = useMemo(() => {
    let list = [...auditEvents];
    const now = Date.now();

    // Date range filter
    if (dateFilter === "today") {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      list = list.filter((e) => e.timestamp >= todayStart);
    } else if (dateFilter === "7d") {
      list = list.filter((e) => e.timestamp >= now - 7 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === "30d") {
      list = list.filter((e) => e.timestamp >= now - 30 * 24 * 60 * 60 * 1000);
    }

    // Category filter
    if (categoryFilter !== "all") {
      list = list.filter((e) => e.category === categoryFilter);
    }

    // Action filter
    if (actionFilter !== "all") {
      list = list.filter((e) => e.action === actionFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.actor.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.entityTitle.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortOrder === "oldest") {
      list.sort((a, b) => a.timestamp - b.timestamp);
    } else {
      list.sort((a, b) => b.timestamp - a.timestamp);
    }

    return list;
  }, [auditEvents, dateFilter, categoryFilter, actionFilter, searchQuery, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  const handleRowClick = (ev) => {
    setSelectedEvent(ev);
    setIsDrawerOpen(true);
  };

  const getStatusPill = (status) => {
    switch (status) {
      case "SUCCESS":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "FLAGGED":
      case "BLOCKED":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "PENDING":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border)]";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─── Top Control Header ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--theme-border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center text-[var(--theme-accent-silver)]">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[var(--theme-text)]">
                Administrative Audit Centre
              </h1>
              <p className="text-xs text-[var(--theme-text-muted)]">
                Read-only chronological audit logging for governance, compliance, and security oversight
              </p>
            </div>
          </div>
        </div>

        {/* Immutability Notice Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-xs font-mono text-[var(--theme-text)]">
          <Lock size={13} className="text-[#C0C0C0]" />
          <span>System Immutability: Active • Read-Only Logs</span>
        </div>
      </div>

      {/* ─── Metric Strip ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
            Total Logged Events
          </span>
          <p className="text-xl sm:text-2xl font-extrabold font-mono text-[var(--theme-text)] mt-1">
            {auditEvents.length.toLocaleString()}
          </p>
          <span className="text-[10px] font-mono text-[var(--theme-text-muted)]">Across all collections</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
            Security Interventions
          </span>
          <p className="text-xl sm:text-2xl font-extrabold font-mono text-rose-400 mt-1">
            {auditEvents.filter((e) => e.category === "Security").length}
          </p>
          <span className="text-[10px] font-mono text-[var(--theme-text-muted)]">Account freezes & restrictions</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
            KYC Decisions
          </span>
          <p className="text-xl sm:text-2xl font-extrabold font-mono text-[var(--theme-text)] mt-1">
            {auditEvents.filter((e) => e.category === "KYC Verification").length}
          </p>
          <span className="text-[10px] font-mono text-[var(--theme-text-muted)]">Approvals & rejections</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
            Moderation Actions
          </span>
          <p className="text-xl sm:text-2xl font-extrabold font-mono text-[var(--theme-text)] mt-1">
            {auditEvents.filter((e) => e.category === "Moderation").length}
          </p>
          <span className="text-[10px] font-mono text-[var(--theme-text-muted)]">Job approval & publish audits</span>
        </div>
      </div>

      {/* ─── Search & Filters Bar ─────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]"
            />
            <input
              type="text"
              placeholder="Search by actor, action, target entity, or event ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] focus:outline-hidden focus:border-[var(--theme-border-silver)] transition-colors"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text)] focus:outline-hidden focus:border-[var(--theme-border-silver)] cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Security">Security</option>
            <option value="KYC Verification">KYC Verification</option>
            <option value="Moderation">Moderation</option>
            <option value="Platform">Platform</option>
            <option value="Governance">Governance</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text)] focus:outline-hidden focus:border-[var(--theme-border-silver)] cursor-pointer"
          >
            <option value="all">All Timelines</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text)] focus:outline-hidden focus:border-[var(--theme-border-silver)] cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--theme-text-muted)] pt-1">
          <span>
            Displaying {filteredEvents.length} event{filteredEvents.length === 1 ? "" : "s"} matching parameters
          </span>
          {(searchQuery || categoryFilter !== "all" || dateFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setActionFilter("all");
                setDateFilter("all");
              }}
              className="text-[var(--theme-text)] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ─── Structured Audit Events Table (Desktop) & Cards (Mobile) ──────── */}
      <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-xs overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="py-20 text-center px-4">
            <ShieldCheck size={36} className="mx-auto text-[var(--theme-accent-silver)] mb-3 opacity-60" />
            <p className="text-sm font-bold text-[var(--theme-text)]">Zero Audit Events Matched</p>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1 max-w-sm mx-auto">
              No audit records were found for the chosen search and category filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]/60 text-[var(--theme-text-muted)] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--theme-border)] font-mono">
                  {paginatedEvents.map((ev) => (
                    <tr
                      key={ev.id}
                      onClick={() => handleRowClick(ev)}
                      className="hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-bold text-[var(--theme-text)] whitespace-nowrap">
                        {ev.id}
                      </td>
                      <td className="py-3 px-4 text-[var(--theme-text-muted)] whitespace-nowrap">
                        {new Date(ev.timestamp).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 text-[var(--theme-text)] font-semibold truncate max-w-[160px]">
                        {ev.actor}
                      </td>
                      <td className="py-3 px-4 font-bold text-[var(--theme-text)] whitespace-nowrap">
                        {ev.action}
                      </td>
                      <td className="py-3 px-4 text-[var(--theme-text)] truncate max-w-[160px]">
                        {ev.entityTitle}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] font-semibold">
                          {ev.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${getStatusPill(
                            ev.status
                          )}`}
                        >
                          {ev.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(ev);
                          }}
                          className="p-1 rounded-lg text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                          title="Inspect Event Payload"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card View */}
            <div className="lg:hidden divide-y divide-[var(--theme-border)]">
              {paginatedEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => handleRowClick(ev)}
                  className="p-4 hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[var(--theme-text)]">
                        {ev.id}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${getStatusPill(
                          ev.status
                        )}`}
                      >
                        {ev.status}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--theme-text-muted)]">
                      {new Date(ev.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="font-mono font-bold text-xs text-[var(--theme-text)]">
                    {ev.action}
                  </p>

                  <div className="text-[11px] font-mono text-[var(--theme-text-muted)] flex items-center justify-between">
                    <span className="truncate max-w-[200px]">Entity: {ev.entityTitle}</span>
                    <span className="text-[var(--theme-text)]">{ev.category}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[var(--theme-border)] flex items-center justify-between gap-3 text-xs font-mono">
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
          </>
        )}
      </div>

      {/* ─── Event Detail Drawer ────────────────────────────────────────── */}
      <AdminAuditDetailDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}

