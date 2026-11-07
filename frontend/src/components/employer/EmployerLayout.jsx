import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmployerSidebar from "./EmployerSidebar";
import EmployerTopbar from "./EmployerTopbar";
import EmployerLogoutModal from "./EmployerLogoutModal";
import { useAuth } from "../../routes/Context";

export default function EmployerLayout({
  children,
  activeTab = "dashboard",
  title = "Hiring Command Center",
  breadcrumbs = [],
  approvalStatus = "approved",
  employerInfo: propEmployerInfo,
  onSearch,
}) {
  const navigate = useNavigate();
  const { employer, logout } = useAuth();

  // Desktop sidebar collapsed state with local persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("jobone_employer_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Logout modal state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("jobone_employer_sidebar_collapsed", String(next));
      } catch (_err) {
        /* ignore */
      }
      return next;
    });
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    try {
      localStorage.removeItem("employerInfo");
      localStorage.removeItem("employerToken");
    } catch (_err) {
      /* ignore */
    }
    navigate("/login");
  };

  // Safe employer resolution
  const resolvedEmployerInfo =
    propEmployerInfo ||
    employer ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("employerInfo")) || {};
      } catch {
        return {};
      }
    })();

  const currentApprovalStatus =
    resolvedEmployerInfo?.isApproved ||
    resolvedEmployerInfo?.approvalStatus ||
    approvalStatus ||
    "pending";

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex flex-col lg:flex-row transition-colors duration-200 antialiased selection:bg-[var(--theme-text)] selection:text-[var(--theme-bg)] overflow-x-hidden relative">
      {/* Skip to Main Content Link for accessibility */}
      <a
        href="#employer-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--theme-text)] focus:text-[var(--theme-bg)] focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent-silver)]"
      >
        Skip to main hiring workspace
      </a>

      {/* 1. Desktop & Mobile Sidebar */}
      <EmployerSidebar
        activeTab={activeTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        employerInfo={resolvedEmployerInfo}
        approvalStatus={currentApprovalStatus}
        onLogout={() => setIsLogoutModalOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Top Navigation Bar */}
        <EmployerTopbar
          onOpenMobile={() => setIsMobileOpen(true)}
          employerInfo={resolvedEmployerInfo}
          approvalStatus={currentApprovalStatus}
          title={title}
          breadcrumbs={breadcrumbs}
          onLogout={() => setIsLogoutModalOpen(true)}
          onSearch={onSearch}
        />

        {/* Dynamic Page Children Container */}
        <main
          id="employer-main-content"
          tabIndex="-1"
          className="flex-1 outline-none p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
        >
          {children}
        </main>
      </div>

      {/* 3. Confirmation Logout Modal */}
      <EmployerLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}

