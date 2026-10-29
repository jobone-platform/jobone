import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

export default function AdminCommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  adminRole = "superAdmin",
  onRefresh,
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const canManageEmployers = adminRole === "superAdmin" || adminRole === "employerAdmin";
  const canManageJobseekers = adminRole === "superAdmin" || adminRole === "jobseekerAdmin";
  const isSuperAdmin = adminRole === "superAdmin";

  const allItems = [
    // Navigation
    {
      id: "overview",
      category: "Navigation",
      title: "Dashboard Overview",
      description: "Platform KPIs, charts, and operational summary",
      icon: LayoutDashboard,
      action: () => onSelectTab("overview"),
      visible: true,
    },
    {
      id: "pendingJobs",
      category: "Recruitment",
      title: "Pending Job Approvals",
      description: "Moderate and approve new job postings",
      icon: Briefcase,
      action: () => onSelectTab("pendingJobs"),
      visible: canManageEmployers,
    },
    {
      id: "allJobs",
      category: "Recruitment",
      title: "All Job Postings",
      description: "Browse, filter, and inspect full jobs directory",
      icon: Briefcase,
      action: () => onSelectTab("allJobs"),
      visible: canManageEmployers,
    },
    {
      id: "pendingEmployers",
      category: "Recruitment",
      title: "Pending Employer Approvals",
      description: "Verify company KYC and approve recruiter accounts",
      icon: Building2,
      action: () => onSelectTab("pendingEmployers"),
      visible: canManageEmployers,
    },
    {
      id: "allEmployers",
      category: "Recruitment",
      title: "All Employers Directory",
      description: "Manage registered companies and recruiter profiles",
      icon: Building2,
      action: () => onSelectTab("allEmployers"),
      visible: canManageEmployers,
    },
    {
      id: "allJobseekers",
      category: "Recruitment",
      title: "All Candidates Directory",
      description: "Review registered jobseekers and applications",
      icon: Users,
      action: () => onSelectTab("allJobseekers"),
      visible: canManageJobseekers,
    },
    {
      id: "searchFreeze",
      category: "Moderation",
      title: "Search & Account Freeze",
      description: "Look up accounts and toggle operational freeze locks",
      icon: ShieldAlert,
      action: () => onSelectTab("searchFreeze"),
      visible: true,
    },
    {
      id: "contacts",
      category: "Inquiries",
      title: "Contact Messages & Inquiries",
      description: "Read and manage incoming public inquiries",
      icon: Mail,
      action: () => onSelectTab("contacts"),
      visible: true,
    },
    {
      id: "exportDB",
      category: "Platform",
      title: "Database Export to Excel",
      description: "Download authorized Excel spreadsheets of records",
      icon: Download,
      action: () => onSelectTab("exportDB"),
      visible: true,
    },
    {
      id: "manageAdmins",
      category: "Platform",
      title: "Admin Roles & Permissions",
      description: "Create administrators and manage role delegation",
      icon: UserPlus,
      action: () => onSelectTab("manageAdmins"),
      visible: isSuperAdmin,
    },
    {
      id: "settings",
      category: "Platform",
      title: "Admin Settings",
      description: "Configure portal preferences and security controls",
      icon: Settings,
      action: () => onSelectTab("settings"),
      visible: true,
    },
    // Fast Operations
    {
      id: "refreshData",
      category: "Quick Actions",
      title: "Refresh Platform Data",
      description: "Reload all dashboard statistics and pending counts",
      icon: Sparkles,
      action: () => {
        if (onRefresh) onRefresh();
      },
      visible: true,
    },
  ];

  const visibleItems = allItems.filter((item) => item.visible);

  const filteredItems = visibleItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

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

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].action();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, pages, or operations (e.g., 'pending', 'jobs', 'export')..."
            className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching admin commands found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold leading-tight truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <ArrowRight size={14} className={isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-transparent"} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border text-[10px]">↓</kbd></span>
          <span>Select with <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border text-[10px]">↵</kbd></span>
        </div>
      </div>
    </div>
  );
}

