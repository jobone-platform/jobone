import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "./CandidateSidebar";
import CandidateTopbar from "./CandidateTopbar";
import SavedJobsDrawer from "./SavedJobsDrawer";
import CandidateLogoutModal from "./CandidateLogoutModal";
import { useAuth } from "../../routes/Context";

export default function CandidateLayout({
  children,
  activeTab = "dashboard",
  title = "Dashboard",
  breadcrumbs = [],
  onOpenJobDetails,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Desktop sidebar collapsed state with local persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("jobone_candidate_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Saved jobs drawer & logout modal states
  const [isSavedJobsOpen, setIsSavedJobsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Live saved jobs count
  const [savedJobsCount, setSavedJobsCount] = useState(() => {
    try {
      const stored = localStorage.getItem("jobone_saved_jobs");
      return stored ? JSON.parse(stored).length : 0;
    } catch {
      return 0;
    }
  });

  // Update saved count on window focus or storage change
  const refreshSavedCount = useCallback(() => {
    try {
      const stored = localStorage.getItem("jobone_saved_jobs");
      setSavedJobsCount(stored ? JSON.parse(stored).length : 0);
    } catch {
      setSavedJobsCount(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("storage", refreshSavedCount);
    window.addEventListener("focus", refreshSavedCount);
    const handleOpenSaved = () => setIsSavedJobsOpen(true);
    window.addEventListener("jobone_open_saved_jobs", handleOpenSaved);
    return () => {
      window.removeEventListener("storage", refreshSavedCount);
      window.removeEventListener("focus", refreshSavedCount);
      window.removeEventListener("jobone_open_saved_jobs", handleOpenSaved);
    };
  }, [refreshSavedCount]);

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
        localStorage.setItem("jobone_candidate_sidebar_collapsed", String(next));
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
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
    } catch (_err) {
      /* ignore */
    }
    navigate("/login");
  };

  // Safe user profile resolution
  const resolvedUserInfo = user || (() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo")) || {};
    } catch {
      return {};
    }
  })();

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex flex-col lg:flex-row transition-colors duration-200 antialiased selection:bg-[var(--theme-text)] selection:text-[var(--theme-bg)] overflow-x-hidden relative">
      {/* Accessible skip link */}
      <a
        href="#candidate-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--theme-text)] focus:text-[var(--theme-bg)] focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent-silver)]"
      >
        Skip to candidate workspace content
      </a>

      {/* 1. Left Vertical Sidebar (Desktop Collapsible + Mobile Overlay) */}
      <CandidateSidebar
        activeTab={activeTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        userInfo={resolvedUserInfo}
        onLogout={() => setIsLogoutModalOpen(true)}
        onOpenSavedJobs={() => setIsSavedJobsOpen(true)}
        savedJobsCount={savedJobsCount}
      />

      {/* 2. Main Workspace Canvas */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Sticky Workspace Topbar */}
        <CandidateTopbar
          onOpenMobile={() => setIsMobileOpen(true)}
          userInfo={resolvedUserInfo}
          title={title}
          breadcrumbs={breadcrumbs}
          onOpenSavedJobs={() => setIsSavedJobsOpen(true)}
          savedJobsCount={savedJobsCount}
          onLogout={() => setIsLogoutModalOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main
          id="candidate-main-content"
          tabIndex="-1"
          className="flex-1 outline-none min-w-0 focus:outline-none"
        >
          {children}
        </main>
      </div>

      {/* 3. Global Saved Jobs Drawer */}
      <SavedJobsDrawer
        isOpen={isSavedJobsOpen}
        onClose={() => {
          setIsSavedJobsOpen(false);
          refreshSavedCount();
        }}
        onOpenJobDetails={onOpenJobDetails}
      />

      {/* 4. Global Logout Confirmation Modal */}
      <CandidateLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
