import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../routes/Context";

export const ProtectedActionContext = createContext({
  executeProtectedAction: () => false,
  saveJobWithAuth: async () => ({}),
  authModalOpen: false,
  closeAuthModal: () => {},
  roleMismatchModalOpen: false,
  closeRoleMismatchModal: () => {},
  actionConfig: null,
  mismatchConfig: null,
  toast: null,
  showToast: () => {},
  clearPendingAction: () => {},
  getPendingAction: () => null,
});

export function ProtectedActionProvider({ children }) {
  const { authStatus, role, token, logout } = useAuth();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [roleMismatchModalOpen, setRoleMismatchModalOpen] = useState(false);
  const [actionConfig, setActionConfig] = useState(null);
  const [mismatchConfig, setMismatchConfig] = useState(null);
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const getPendingAction = useCallback(() => {
    try {
      const raw = sessionStorage.getItem("jobone_pending_action");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const clearPendingAction = useCallback(() => {
    try {
      sessionStorage.removeItem("jobone_pending_action");
    } catch {
      /* ignore */
    }
  }, []);

  // Main Guard Dispatcher
  const executeProtectedAction = useCallback(
    (config) => {
      const {
        action = "generic",
        requiredRole = "jobseeker",
        title,
        subtitle,
        resourceId,
        resourceData,
        returnUrl = window.location.pathname + window.location.search,
        onExecute,
      } = config;

      // 1. Unauthenticated Visitor
      if (authStatus === "unauthenticated" || !token) {
        const pendingPayload = {
          action,
          requiredRole,
          title,
          subtitle,
          resourceId,
          resourceData,
          returnUrl,
          timestamp: Date.now(),
        };

        try {
          sessionStorage.setItem(
            "jobone_pending_action",
            JSON.stringify(pendingPayload)
          );
        } catch (e) {
          console.warn("Could not save pending action to sessionStorage", e);
        }

        setActionConfig({
          action,
          requiredRole,
          title,
          subtitle,
          resourceId,
          resourceData,
          returnUrl,
          onExecute,
        });
        setAuthModalOpen(true);
        return false;
      }

      // 2. Role Normalization
      const isCandidate = role === "jobseeker" || role === "candidate";
      const isEmployer = role === "employer";
      const isAdmin = role === "admin";

      const roleSatisfied =
        (requiredRole === "jobseeker" && isCandidate) ||
        (requiredRole === "employer" && isEmployer) ||
        (requiredRole === "admin" && isAdmin);

      if (!roleSatisfied) {
        setMismatchConfig({
          currentRole: role,
          requiredRole,
          actionName: title || action,
          returnUrl,
        });
        setRoleMismatchModalOpen(true);
        return false;
      }

      // 3. Authorized Execution
      if (typeof onExecute === "function") {
        onExecute();
      }
      return true;
    },
    [authStatus, role, token]
  );

  // Authenticated Save Job Helper
  const saveJobWithAuth = useCallback(
    async (jobId, jobData = null) => {
      const isCandidate = role === "jobseeker" || role === "candidate";

      if (authStatus === "unauthenticated" || !token || !isCandidate) {
        executeProtectedAction({
          action: "save_job",
          requiredRole: "jobseeker",
          title: "Sign in to save this opportunity",
          subtitle: "Sign in to save this opportunity to your personal career workspace.",
          resourceId: jobId,
          resourceData: jobData,
          returnUrl: window.location.pathname + window.location.search,
        });
        return { handled: "auth_required" };
      }

      try {
        const res = await axios.post(
          `${API_BASE_URL}/user/save-job`,
          { jobId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const isSaved = res.data.saved;
        showToast(
          isSaved
            ? "Opportunity saved to your candidate workspace."
            : "Job removed from your saved career collection.",
          "success"
        );

        // Update local cache of saved job IDs
        try {
          const current = JSON.parse(
            localStorage.getItem("jobone_saved_jobs") || "[]"
          );
          let next;
          if (isSaved) {
            next = Array.from(new Set([...current, jobId]));
          } else {
            next = current.filter((id) => id !== jobId);
          }
          localStorage.setItem("jobone_saved_jobs", JSON.stringify(next));
        } catch {
          /* ignore */
        }

        return { success: true, saved: isSaved, savedJobs: res.data.savedJobs };
      } catch (err) {
        console.error("Failed to toggle save job", err);
        const errMsg =
          err.response?.data?.message ||
          "Could not update saved jobs. Please try again.";
        showToast(errMsg, "error");
        return { success: false, error: errMsg };
      }
    },
    [authStatus, role, token, executeProtectedAction, showToast]
  );

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setActionConfig(null);
  }, []);

  const closeRoleMismatchModal = useCallback(() => {
    setRoleMismatchModalOpen(false);
    setMismatchConfig(null);
  }, []);

  const value = useMemo(
    () => ({
      executeProtectedAction,
      saveJobWithAuth,
      authModalOpen,
      closeAuthModal,
      roleMismatchModalOpen,
      closeRoleMismatchModal,
      actionConfig,
      mismatchConfig,
      toast,
      showToast,
      clearPendingAction,
      getPendingAction,
    }),
    [
      executeProtectedAction,
      saveJobWithAuth,
      authModalOpen,
      closeAuthModal,
      roleMismatchModalOpen,
      closeRoleMismatchModal,
      actionConfig,
      mismatchConfig,
      toast,
      showToast,
      clearPendingAction,
      getPendingAction,
    ]
  );

  return (
    <ProtectedActionContext.Provider value={value}>
      {children}
    </ProtectedActionContext.Provider>
  );
}

export const useProtectedAction = () => useContext(ProtectedActionContext);
