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

  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("jobone_admin_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

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
        onToggleCollapse={handleToggleCollapse}
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
        <div className="lg:hidden h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open navigation drawer"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Menu size={22} />
          </button>

          <LogoJobOne
            width={120}
            height={36}
            textColor={isDark ? "#FFFFFF" : "#0F172A"}
            className="h-8 w-auto"
          />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white relative cursor-pointer"
              title="Notifications"
            >
              <Bell size={20} />
              {totalPendingAlerts > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500" />
              )}
            </button>
          </div>
        </div>

        {/* Dashboard Main Content Area */}
        <main className="flex-1 p-5 sm:p-7 lg:p-9 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <AdminCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => {
          onSelectTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        onOpenSettings={() => {
          setIsCommandPaletteOpen(false);
          setIsSettingsOpen(true);
        }}
        onOpenNotifications={() => {
          setIsCommandPaletteOpen(false);
          setIsNotificationsOpen(true);
        }}
        onRefresh={() => {
          if (onRefresh) onRefresh();
          setIsCommandPaletteOpen(false);
        }}
        onLogout={onLogout}
        theme={theme}
        setTheme={setTheme}
      />

      <AdminNotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        pendingJobs={pendingJobs}
        pendingEmployers={pendingEmployers}
        unreadContacts={unreadContacts}
        onSelectTab={(tab) => {
          onSelectTab(tab);
          setIsNotificationsOpen(false);
        }}
      />

      <AdminSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        adminInfo={adminInfo}
        onLogout={onLogout}
        theme={theme}
        setTheme={setTheme}
      />
    </div>
  );
}
