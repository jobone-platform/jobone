import axios from "axios";
import { API_BASE_URL } from "../config/api";

/**
 * Handles resumption of a protected action after successful sign in or registration.
 *
 * @param {object} params
 * @param {string} params.role - "jobseeker" | "employer" | "admin"
 * @param {string} params.token - Bearer JWT token
 * @param {Function} params.navigate - react-router navigate function
 * @param {string} params.fallbackPath - default path if no pending action
 * @param {object} [params.stateFromLocation] - optional location.state
 */
export async function handlePostAuthRedirection({
  role,
  token,
  navigate,
  fallbackPath,
  stateFromLocation = {},
}) {
  let pendingAction = null;
  try {
    const raw = sessionStorage.getItem("jobone_pending_action");
    if (raw) pendingAction = JSON.parse(raw);
  } catch (_e) {
    /* ignore */
  }

  // Fallback to state if not in sessionStorage
  if (!pendingAction && stateFromLocation?.pendingAction) {
    pendingAction = stateFromLocation.pendingAction;
  }

  const isCandidate = role === "jobseeker" || role === "candidate";
  const isEmployer = role === "employer";

  // Check if pending action exists and role matches
  if (pendingAction) {
    const roleMatches =
      (pendingAction.requiredRole === "jobseeker" && isCandidate) ||
      (pendingAction.requiredRole === "employer" && isEmployer) ||
      (pendingAction.requiredRole === "admin" && role === "admin");

    if (roleMatches) {
      // Clear immediately to prevent repeat execution
      try {
        sessionStorage.removeItem("jobone_pending_action");
      } catch {}

      // 1. Handle Save Job
      if (pendingAction.action === "save_job" && pendingAction.resourceId) {
        try {
          if (token && isCandidate) {
            await axios.post(
              `${API_BASE_URL}/user/save-job`,
              { jobId: pendingAction.resourceId },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local storage
            try {
              const current = JSON.parse(
                localStorage.getItem("jobone_saved_jobs") || "[]"
              );
              localStorage.setItem(
                "jobone_saved_jobs",
                JSON.stringify(Array.from(new Set([...current, pendingAction.resourceId])))
              );
            } catch {}
          }
        } catch (saveErr) {
          console.warn("Auto-save job on post-auth failed:", saveErr);
        }

        const targetUrl = pendingAction.returnUrl || "/jobs";
        navigate(targetUrl, {
          replace: true,
          state: {
            justSavedJobId: pendingAction.resourceId,
            toastMessage: "Opportunity saved to your candidate workspace.",
          },
        });
        return;
      }

      // 2. Handle Apply
      if (pendingAction.action === "apply" && pendingAction.resourceId) {
        navigate(`/apply/${pendingAction.resourceId}`, {
          replace: true,
          state: { fromProtectedAction: true },
        });
        return;
      }

      // 3. Handle Post a Job
      if (pendingAction.action === "post_job") {
        navigate("/createjob", { replace: true });
        return;
      }

      // 4. Generic return URL
      if (pendingAction.returnUrl && pendingAction.returnUrl !== "/login") {
        navigate(pendingAction.returnUrl, { replace: true });
        return;
      }
    } else {
      // Role mismatch on pending action: clear it and proceed to standard portal
      try {
        sessionStorage.removeItem("jobone_pending_action");
      } catch {}
    }
  }

  // Fallback to location.state?.from or fallbackPath
  const redirectFrom = stateFromLocation?.from?.pathname;
  navigate(redirectFrom || fallbackPath, { replace: true });
}
