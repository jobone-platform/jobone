import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import AdminCommandPalette from "./AdminCommandPalette";
import AdminNotificationsModal from "./AdminNotificationsModal";
import AdminSettingsModal from "./AdminSettingsModal";
import AdminLogoutModal from "./AdminLogoutModal";
import { useTheme } from "../../routes/Context";

const TAB_LABELS = {
  overview: "Overview & KPIs",
  analytics: "Platform Analytics",
  allJobs: "Job Moderation",
  pendingJobs: "Pending Job Approvals",
  applications: "Applications CRM",
  allEmployers: "Employer Verification",
  pendingEmployers: "Pending Company Reviews",
  allJobseekers: "Candidate Directory",
  activity: "Activity Stream",
  auditLogs: "Audit Centre",
  notifications: "Notification Workspace",
  categories: "Industry Taxonomies",
  exportDB: "Reports & Exports",
  settings: "System Settings",
  manageAdmins: "Admin Team Management",
};

export default function AdminLayout({
  activeTab = "overview",
  onSelectTab,
  adminInfo = {},
  pendingJobs = [],
  pendingEmployers = [],
  unreadContacts = [],
  jobs = [],
  employers = [],
  jobseekers = [],
  onRefresh,
  isRefreshing = false,
  onLogout,
  children,
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("jobone_admin_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const { theme, setTheme } = useTheme();

  // Keyboard shortcut Ctrl+[ to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "[") {
        e.preventDefault();
        handleToggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Global Ctrl+K / Cmd+K listener for Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("jobone_admin_sidebar_collapsed", String(next));
      } catch (_err) {
        /* ignore */
      }
      return next;
    });
  };

  const handleRequestLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  const totalPendingAlerts =
    (pendingJobs?.length || 0) +
    (pendingEmployers?.length || 0) +
    (unreadContacts?.length || 0);

  const currentTabLabel = TAB_LABELS[activeTab] || "Executive Console";

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex flex-col lg:flex-row transition-colors duration-200 antialiased selection:bg-[var(--theme-text)] selection:text-[var(--theme-bg)] overflow-x-hidden relative">
      {/* Skip to Main Content Link for accessibility */}
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--theme-text)] focus:text-[var(--theme-bg)] focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent-silver)]"
      >
        Skip to administrative control center
      </a>

      {/* 1. Left Vertical Sidebar (Desktop Sticky + Mobile Drawer) */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        adminInfo={adminInfo}
        onLogout={handleRequestLogout}
        pendingJobsCount={pendingJobs?.length || 0}
        pendingEmployersCount={pendingEmployers?.length || 0}
      />

      {/* 2. Main Workspace Canvas */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Executive Header Bar (Integrated for Desktop & Mobile) */}
        <AdminTopbar
          breadcrumbs={["Admin Console", currentTabLabel]}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          pendingAlertsCount={totalPendingAlerts}
          adminInfo={adminInfo}
          onLogout={handleRequestLogout}
        />

        {/* Dashboard Main Content Area */}
        <main
          id="admin-main-content"
          tabIndex="-1"
          className="flex-1 outline-none p-4 sm:p-6 lg:p-8 xl:p-9 w-full min-w-0 max-w-[1700px] mx-auto"
        >
          {children}
        </main>
      </div>

      {/* 3. Command Palette Modal */}
      <AdminCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => {
          onSelectTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        adminRole={adminInfo?.role}
        onRefresh={() => {
          if (onRefresh) onRefresh();
          setIsCommandPaletteOpen(false);
        }}
        jobs={jobs}
        employers={employers}
        jobseekers={jobseekers}
      />

      {/* 4. Notifications Modal */}
      <AdminNotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        pendingJobsCount={pendingJobs?.length || 0}
        pendingEmployersCount={pendingEmployers?.length || 0}
        unreadContactsCount={unreadContacts?.length || 0}
        onNavigateTab={(tab) => {
          onSelectTab(tab);
          setIsNotificationsOpen(false);
        }}
      />

      {/* 5. Settings Modal */}
      <AdminSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        adminInfo={adminInfo}
      />

      {/* 6. Animated Admin Logout Modal */}
      <AdminLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        adminInfo={adminInfo}
      />
    </div>
  );
}
