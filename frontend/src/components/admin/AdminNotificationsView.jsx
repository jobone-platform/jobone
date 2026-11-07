import React, { useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  Briefcase,
  Building2,
  Mail,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Eye,
  Check,
  X,
  Clock,
  Layers,
  Sparkles,
  Inbox,
  AlertTriangle,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function AdminNotificationsView({
  pendingJobs = [],
  pendingEmployers = [],
  allContacts = [],
  frozenAccountsCount = 0,
  adminInfo = {},
  onSelectTab,
  onRefresh,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all"); // "all" | "jobs" | "employers" | "contacts" | "security"
  const [readFilter, setReadFilter] = useState("all"); // "all" | "unread" | "read"
  const [readAlertIds, setReadAlertIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("jobone_admin_read_alerts") || "[]");
    } catch {
      return [];
    }
  });

  const [activeContactModal, setActiveContactModal] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Compile real notifications from database entities
  const allNotifications = useMemo(() => {
    const list = [];

    // 1. Pending Job Submissions
    pendingJobs.forEach((job) => {
      const id = `notif-job-${job._id}`;
      const isRead = readAlertIds.includes(id);
      list.push({
        id,
        rawId: job._id,
        type: "jobs",
        category: "Job Moderation",
        title: "New Job Requisition Submitted",
        subtitle: `${job.title} by ${job.postedByCompany || job.postedByName || "Employer"}`,
        message: `Position requires administrative review before publishing live on the portal. Industry: ${job.industry || "General"}.`,
        timestamp: new Date(job.createdAt || 0).getTime(),
        dateStr: job.createdAt,
        isRead,
        actionLink: `/admin/job/${job._id}`,
        tabTarget: "pendingJobs",
        icon: Briefcase,
        priority: "high",
      });
    });

    // 2. Pending Employer KYC Submissions
    pendingEmployers.forEach((emp) => {
      const id = `notif-emp-${emp._id}`;
      const isRead = readAlertIds.includes(id);
      list.push({
        id,
        rawId: emp._id,
        type: "employers",
        category: "KYC Verification",
        title: "KYC Credential Dossier Pending Review",
        subtitle: `${emp.companyName || emp.name || "Enterprise Account"} (${emp.employerType === "individual" ? "Individual" : "Company"})`,
        message: "Employer registered and uploaded identity and tax verification files to encrypted storage.",
        timestamp: new Date(emp.createdAt || 0).getTime(),
        dateStr: emp.createdAt,
        isRead,
        actionLink: `/admin/employer/${emp._id}`,
        tabTarget: "pendingEmployers",
        icon: Building2,
        priority: "high",
      });
    });

    // 3. Contact & Support Inquiries
    allContacts.forEach((contact) => {
      const id = `notif-contact-${contact._id}`;
      list.push({
        id,
        rawId: contact._id,
        type: "contacts",
        category: "Platform Inquiries",
        title: contact.communicationType ? `Support Inbound: ${contact.communicationType}` : "Platform Inquiry",
        subtitle: contact.name ? `${contact.name} (${contact.email})` : contact.email || "Public User",
        message: contact.message || "No message body provided.",
        timestamp: new Date(contact.createdAt || 0).getTime(),
        dateStr: contact.createdAt,
        isRead: !!contact.isRead,
        actionLink: null,
        tabTarget: null,
        icon: Mail,
        priority: contact.isRead ? "low" : "medium",
        isContactItem: true,
        rawContact: contact,
      });
    });

    // 4. Security Alerts (if any accounts are currently frozen)
    if (frozenAccountsCount > 0) {
      const id = "notif-security-frozen";
      const isRead = readAlertIds.includes(id);
      list.push({
        id,
        rawId: "security-frozen",
        type: "security",
        category: "Security Governance",
        title: `${frozenAccountsCount} Account(s) Currently Restricted / Frozen`,
        subtitle: "Executive Governance Policy Enforced",
        message: "One or more candidate or employer accounts have been frozen by an administrator. Their platform access is suspended.",
        timestamp: Date.now(),
        dateStr: new Date().toISOString(),
        isRead,
        actionLink: null,
        tabTarget: "allJobseekers",
        icon: ShieldAlert,
        priority: "critical",
      });
    }

    // Sort newest first
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list;
  }, [pendingJobs, pendingEmployers, allContacts, frozenAccountsCount, readAlertIds]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return allNotifications.filter((n) => {
      const matchCat = categoryFilter === "all" || n.type === categoryFilter;
      const matchRead =
        readFilter === "all" ||
        (readFilter === "unread" && !n.isRead) ||
        (readFilter === "read" && n.isRead);

      const matchQuery =
        !searchQuery.trim() ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchRead && matchQuery;
    });
  }, [allNotifications, categoryFilter, readFilter, searchQuery]);

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  // Mark single item as read
  const handleMarkAsRead = async (item) => {
    if (item.isContactItem) {
      try {
        setActionLoadingId(item.id);
        const token = adminInfo?.token;
        await axios.patch(
          `${API_BASE_URL}/admin/contacts/${item.rawId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error("Failed to mark contact as read:", err);
      } finally {
        setActionLoadingId(null);
      }
    } else {
      const next = [...new Set([...readAlertIds, item.id])];
      setReadAlertIds(next);
      try {
        localStorage.setItem("jobone_admin_read_alerts", JSON.stringify(next));
      } catch (_e) {
        /* ignore */
      }
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    // 1. Mark all contact messages as read via backend
    const unreadContacts = allContacts.filter((c) => !c.isRead);
    const token = adminInfo?.token;

    if (unreadContacts.length > 0 && token) {
      await Promise.all(
        unreadContacts.map((c) =>
          axios
            .patch(
              `${API_BASE_URL}/admin/contacts/${c._id}/read`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            )
            .catch(() => null)
        )
      );
    }

    // 2. Mark local alert IDs as read
    const allIds = allNotifications.map((n) => n.id);
    setReadAlertIds(allIds);
    try {
      localStorage.setItem("jobone_admin_read_alerts", JSON.stringify(allIds));
    } catch (_e) {
      /* ignore */
    }

    if (onRefresh) onRefresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--theme-border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center text-[var(--theme-accent-silver)]">
              <Bell size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[var(--theme-text)]">
                  Notification Workspace
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--theme-text-muted)]">
                Actionable operational alerts, compliance verifications, and platform support communications
              </p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Check size={14} className="text-emerald-400" />
            <span>Mark All As Read</span>
          </button>
        )}
      </div>

      {/* ─── Search & Category Filters Bar ──────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]"
            />
            <input
              type="text"
              placeholder="Search notifications by title, sender, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] focus:outline-hidden focus:border-[var(--theme-border-silver)] transition-colors"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text)] focus:outline-hidden focus:border-[var(--theme-border-silver)] cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="jobs">Job Moderation ({pendingJobs.length})</option>
            <option value="employers">KYC Verification ({pendingEmployers.length})</option>
            <option value="contacts">Support Inquiries ({allContacts.length})</option>
            <option value="security">Security Alerts</option>
          </select>

          {/* Read / Unread Status Filter */}
          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text)] focus:outline-hidden focus:border-[var(--theme-border-silver)] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--theme-text-muted)] pt-1">
          <span>
            Showing {filteredNotifications.length} of {allNotifications.length} total notifications
          </span>
          {(searchQuery || categoryFilter !== "all" || readFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setReadFilter("all");
              }}
              className="text-[var(--theme-text)] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ─── Notification Cards List ────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
            <Inbox size={36} className="mx-auto text-[var(--theme-accent-silver)] mb-3 opacity-60" />
            <p className="text-sm font-bold text-[var(--theme-text)]">No Notifications Matched</p>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1 max-w-sm mx-auto">
              Your operational inbox is clean. There are no pending alerts matching your active filters.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const Icon = notif.icon;
            const isUnread = !notif.isRead;

            return (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  isUnread
                    ? "bg-[var(--theme-surface)] border-[var(--theme-border-silver)]"
                    : "bg-[var(--theme-surface)]/60 border-[var(--theme-border)] opacity-85"
                }`}
              >
                {/* Left: Icon & Notification Content */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                      isUnread
                        ? "bg-[var(--theme-surface-elevated)] border-[var(--theme-border-silver)] text-[var(--theme-text)]"
                        : "bg-[var(--theme-surface)] border-[var(--theme-border)] text-[var(--theme-text-muted)]"
                    }`}
                  >
                    <Icon size={16} />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-sm text-[var(--theme-text)]">
                        {notif.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] font-semibold">
                        {notif.category}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[var(--theme-surface)] animate-pulse" />
                      )}
                    </div>

                    <p className="text-xs font-semibold text-[var(--theme-text)] truncate">
                      {notif.subtitle}
                    </p>

                    <p className="text-xs text-[var(--theme-text-muted)] line-clamp-2">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-[var(--theme-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(notif.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Mark as read button */}
                  {isUnread && (
                    <button
                      type="button"
                      disabled={actionLoadingId === notif.id}
                      onClick={() => handleMarkAsRead(notif)}
                      className="px-2.5 py-1.5 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] text-xs font-mono transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <Check size={13} />
                    </button>
                  )}

                  {/* Contextual Action Button */}
                  {notif.actionLink ? (
                    <Link
                      to={notif.actionLink}
                      className="px-3 py-1.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Inspect</span>
                      <ExternalLink size={13} />
                    </Link>
                  ) : notif.tabTarget ? (
                    <button
                      type="button"
                      onClick={() => onSelectTab && onSelectTab(notif.tabTarget)}
                      className="px-3 py-1.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Open Queue</span>
                      <ArrowRight size={13} />
                    </button>
                  ) : notif.isContactItem ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveContactModal(notif.rawContact);
                        handleMarkAsRead(notif);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] text-xs font-mono font-bold hover:bg-[var(--theme-surface)] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Read Message</span>
                      <Eye size={13} />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Inbound Contact Detail Modal ───────────────────────────────── */}
      {activeContactModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActiveContactModal(null)}
        >
          <div
            className="w-full max-w-lg bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-2xl overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)]">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[var(--theme-text)]">
                    Inbound Contact Message
                  </h3>
                  <p className="text-[11px] font-mono text-[var(--theme-text-muted)]">
                    Submitted: {new Date(activeContactModal.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveContactModal(null)}
                className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[var(--theme-text-muted)]">Sender Name:</span>
                  <span className="font-bold text-[var(--theme-text)]">{activeContactModal.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--theme-text-muted)]">Sender Email:</span>
                  <span className="text-[var(--theme-text)] select-all">{activeContactModal.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--theme-text-muted)]">Communication Type:</span>
                  <span className="text-[var(--theme-text)] font-semibold">{activeContactModal.communicationType || "General Inquiry"}</span>
                </div>
              </div>

              <div>
                <span className="text-[var(--theme-text-muted)] block mb-1">Message Content:</span>
                <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {activeContactModal.message}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={`mailto:${activeContactModal.email}?subject=Re: JobOne Support Inquiry`}
                className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Mail size={13} />
                <span>Reply via Email</span>
              </a>
              <button
                type="button"
                onClick={() => setActiveContactModal(null)}
                className="px-4 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] text-xs font-mono font-semibold hover:bg-[var(--theme-surface)] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

