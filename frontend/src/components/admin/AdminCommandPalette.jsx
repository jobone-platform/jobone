import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  ShieldAlert,
  Download,
  Mail,
  UserPlus,
  Settings,
  ArrowRight,
  Sparkles,
  Command,
  X,
  FileText,
  Layers,
  BarChart3,
  Activity,
  Bell,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function AdminCommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  adminRole = "superAdmin",
  onRefresh,
  jobs = [],
  employers = [],
  jobseekers = [],
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("jobone_admin_recent_searches") || "[]");
    } catch {
      return [];
    }
  });

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const canManageEmployers = adminRole === "superAdmin" || adminRole === "employerAdmin";
  const canManageJobseekers = adminRole === "superAdmin" || adminRole === "jobseekerAdmin";
  const isSuperAdmin = adminRole === "superAdmin";

  // Base Navigation Views & Actions
  const navItems = useMemo(() => [
    {
      id: "nav-overview",
      group: "Navigation & Views",
      title: "Dashboard Overview & KPIs",
      subtitle: "Platform executive overview, operational metrics, and queues",
      icon: LayoutDashboard,
      action: () => onSelectTab("overview"),
      visible: true,
    },
    {
      id: "nav-analytics",
      group: "Navigation & Views",
      title: "Platform Intelligence & Analytics",
      subtitle: "Interactive charts, talent growth, and moderation analytics",
      icon: BarChart3,
      action: () => onSelectTab("analytics"),
      visible: true,
    },
    {
      id: "nav-jobs",
      group: "Navigation & Views",
      title: "Job Listings Moderation Directory",
      subtitle: "Inspect, approve, and moderate position requisitions",
      icon: Briefcase,
      action: () => onSelectTab("allJobs"),
      visible: canManageEmployers,
    },
    {
      id: "nav-pending-jobs",
      group: "Navigation & Views",
      title: "Pending Job Approvals Queue",
      subtitle: "Review newly posted requisitions awaiting compliance clearance",
      icon: Briefcase,
      action: () => onSelectTab("pendingJobs"),
      visible: canManageEmployers,
    },
    {
      id: "nav-employers",
      group: "Navigation & Views",
      title: "Employer Verification Centre",
      subtitle: "Inspect corporate business filings, KYC documents, and approve",
      icon: Building2,
      action: () => onSelectTab("allEmployers"),
      visible: canManageEmployers,
    },
    {
      id: "nav-candidates",
      group: "Navigation & Views",
      title: "Candidate Directory & Profiles",
      subtitle: "Manage talent accounts, verification state, and freezing",
      icon: Users,
      action: () => onSelectTab("allJobseekers"),
      visible: canManageJobseekers,
    },
    {
      id: "nav-activity",
      group: "Navigation & Views",
      title: "Operational Activity Stream",
      subtitle: "Live chronological timeline across all platform entities",
      icon: Activity,
      action: () => onSelectTab("activity"),
      visible: true,
    },
    {
      id: "nav-audit",
      group: "Navigation & Views",
      title: "Administrative Audit Centre",
      subtitle: "Read-only immutable logs of platform events and interventions",
      icon: ShieldAlert,
      action: () => onSelectTab("auditLogs"),
      visible: true,
    },
    {
      id: "nav-notifications",
      group: "Navigation & Views",
      title: "Notification Workspace",
      subtitle: "Actionable alert queues, inquiries, and security dispatches",
      icon: Bell,
      action: () => onSelectTab("notifications"),
      visible: true,
    },
    {
      id: "nav-taxonomies",
      group: "Navigation & Views",
      title: "Industry Categories & Taxonomies",
      subtitle: "Platform sector categorizations and market classifications",
      icon: Layers,
      action: () => onSelectTab("categories"),
      visible: true,
    },
    {
      id: "nav-exports",
      group: "Navigation & Views",
      title: "Executive Export Centre",
      subtitle: "Download platform database archives and Excel spreadsheets",
      icon: Download,
      action: () => onSelectTab("exportDB"),
      visible: true,
    },
    {
      id: "nav-settings",
      group: "Navigation & Views",
      title: "System Settings & Profile",
      subtitle: "Platform governance rules, alert settings, and appearance",
      icon: Settings,
      action: () => onSelectTab("settings"),
      visible: true,
    },
  ], [canManageEmployers, canManageJobseekers, onSelectTab]);

  // Live Records Search (Permission-aware)
  const matchedRecords = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const records = [];

    // Search Jobs (if permitted)
    if (canManageEmployers) {
      jobs
        .filter(
          (j) =>
            (j.title || "").toLowerCase().includes(q) ||
            (j.postedByCompany || "").toLowerCase().includes(q) ||
            (j.location || "").toString().toLowerCase().includes(q)
        )
        .slice(0, 4)
        .forEach((j) => {
          records.push({
            id: `rec-job-${j._id}`,
            group: "Job Requisitions",
            title: j.title,
            subtitle: `${j.postedByCompany || "Confidential"} • Status: ${j.status}`,
            icon: Briefcase,
            action: () => {
              navigate(`/admin/job/${j._id}`);
              onClose();
            },
            visible: true,
          });
        });
    }

    // Search Employers (if permitted)
    if (canManageEmployers) {
      employers
        .filter(
          (e) =>
            (e.companyName || "").toLowerCase().includes(q) ||
            (e.name || "").toLowerCase().includes(q) ||
            (e.email || "").toLowerCase().includes(q)
        )
        .slice(0, 4)
        .forEach((e) => {
          records.push({
            id: `rec-emp-${e._id}`,
            group: "Employer Organizations",
            title: e.companyName || e.name || "Employer",
            subtitle: `${e.email} • KYC: ${e.isApproved}`,
            icon: Building2,
            action: () => {
              navigate(`/admin/employer/${e._id}`);
              onClose();
            },
            visible: true,
          });
        });
    }

    // Search Jobseekers (if permitted)
    if (canManageJobseekers) {
      jobseekers
        .filter(
          (u) =>
            (u.name || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            (u.phone || "").toLowerCase().includes(q)
        )
        .slice(0, 4)
        .forEach((u) => {
          records.push({
            id: `rec-usr-${u._id}`,
            group: "Candidate Profiles",
            title: u.name || "Candidate",
            subtitle: `${u.email} • ${u.isVerified ? "Verified" : "Unverified"}`,
            icon: Users,
            action: () => {
              navigate(`/admin/user/${u._id}`);
              onClose();
            },
            visible: true,
          });
        });
    }

    return records;
  }, [query, jobs, employers, jobseekers, canManageEmployers, canManageJobseekers, navigate, onClose]);

  // Combined Results
  const filteredNavItems = useMemo(() => {
    if (!query.trim()) return navItems;
    const q = query.toLowerCase();
    return navItems.filter(
      (item) =>
        item.visible &&
        (item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q))
    );
  }, [navItems, query]);

  const allFilteredItems = useMemo(() => {
    return [...matchedRecords, ...filteredNavItems];
  }, [matchedRecords, filteredNavItems]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item) => {
    if (!item) return;

    // Save query to recent searches
    if (query.trim() && !recentSearches.includes(query.trim())) {
      const next = [query.trim(), ...recentSearches.slice(0, 4)];
      setRecentSearches(next);
      try {
        localStorage.setItem("jobone_admin_recent_searches", JSON.stringify(next));
      } catch (_e) {
        /* ignore */
      }
    }

    item.action();
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allFilteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allFilteredItems.length) % Math.max(1, allFilteredItems.length));
    } else if (e.key === "Enter" && allFilteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(allFilteredItems[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border-silver)] shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-[var(--theme-border)] flex items-center gap-3 bg-[var(--theme-surface-elevated)]/40">
          <Search size={18} className="text-[var(--theme-accent-silver)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a navigation command, job, company, or candidate name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[10px] font-mono text-[var(--theme-text-muted)]">
            ESC to close
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto divide-y divide-[var(--theme-border)] p-2">
          {allFilteredItems.length === 0 ? (
            <div className="py-14 text-center">
              <Command size={28} className="mx-auto text-[var(--theme-accent-silver)] mb-2 opacity-50" />
              <p className="text-sm font-bold text-[var(--theme-text)]">No Matching Results</p>
              <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                Zero items found matching &quot;{query}&quot;. Try a different keyword or command.
              </p>
            </div>
          ) : (
            allFilteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === index;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] shadow-xs"
                      : "hover:bg-[var(--theme-surface-hover)] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[var(--theme-surface)] border-[var(--theme-border-silver)] text-[var(--theme-text)]"
                          : "bg-[var(--theme-surface-elevated)] border-[var(--theme-border)] text-[var(--theme-text-muted)]"
                      }`}
                    >
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[var(--theme-text)] truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text-muted)]">
                          {item.group}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--theme-text-muted)] truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    size={14}
                    className={`shrink-0 transition-transform ${
                      isSelected
                        ? "text-[var(--theme-text)] translate-x-1"
                        : "text-transparent"
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]/40 flex items-center justify-between text-[11px] font-mono text-[var(--theme-text-muted)]">
          <div className="flex items-center gap-3">
            <span>&uarr; &darr; to navigate</span>
            <span>&crarr; to select</span>
          </div>
          <span>JobOne Executive Palette</span>
        </div>
      </div>
    </div>
  );
}
