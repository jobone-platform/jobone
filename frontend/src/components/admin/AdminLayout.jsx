import React, { useState, useEffect } from "react";
import { Menu, Bell, Sun, Moon, Monitor, Search } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminCommandPalette from "./AdminCommandPalette";
import AdminNotificationsModal from "./AdminNotificationsModal";
import AdminSettingsModal from "./AdminSettingsModal";
import LogoJobOne from "../LogoJobOne";
import { useTheme } from "../../routes/Context";

export default function AdminLayout({
  activeTab,
  onSelectTab,
  adminInfo = {},
  pendingJobs = [],
  pendingEmployers = [],
  unreadContacts = [],
  onRefresh,
  onLogout,
  children,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Global Ctrl+K / Cmd+K listener
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

  const totalPendingAlerts =
    pendingJobs.length + pendingEmployers.length + unreadContacts.length;

  return (
    <div className="min-h-screen bg-[#f4f5f7] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-slate-950 selection:text-white transition-colors duration-150">
      {/* 1. Left Vertical Sidebar (Desktop Sticky + Mobile Drawer) */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        adminInfo={adminInfo}
        onLogout={onLogout}
        pendingJobsCount={pendingJobs.length}
        pendingEmployersCount={pendingEmployers.length}
      />

      {/* 2. Main Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar Only (hidden on desktop lg:hidden) */}
        <div className="lg:hidden h-14 px-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open navigation drawer"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Menu size={20} />
          </button>

          <LogoJobOne
            width={100}
            height={32}
            textColor={isDark ? "#FFFFFF" : "#0F172A"}
            className="h-7 w-auto"
          />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white relative cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              {totalPendingAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          </div>
        </div>

        {/* Dashboard Main Content Area — No separate full-width desktop topbar */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 3. Global Spotlight Command Palette (Ctrl+K) */}
      <AdminCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={onSelectTab}
        adminRole={adminInfo?.role}
        onRefresh={onRefresh}
        onLogout={onLogout}
      />

      {/* 4. Notifications Drawer */}
      <AdminNotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        pendingJobs={pendingJobs}
        pendingEmployers={pendingEmployers}
        unreadContacts={unreadContacts}
        onSelectTab={onSelectTab}
      />

      {/* 5. Settings / RBAC Modal */}
      <AdminSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        adminInfo={adminInfo}
      />
    </div>
  );
}
