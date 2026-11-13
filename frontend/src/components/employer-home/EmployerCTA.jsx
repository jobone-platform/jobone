import React from "react";
import { Link } from "react-router-dom";
import { PlusCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../../routes/Context";

export default function EmployerCTA() {
  const { employer, admin, role, authStatus } = useAuth();
  const isEmployerLoggedIn =
    authStatus === "authenticated" &&
    (role === "employer" || Boolean(employer && !admin));

  return (
    <section
      aria-label="Employer Call to Action"
      className="py-16 sm:py-20 bg-[var(--theme-bg)] text-[var(--theme-text)] border-t border-[var(--theme-border)] transition-colors duration-150"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-[var(--theme-border-silver)] bg-[var(--theme-surface)] p-8 sm:p-12 shadow-2xl overflow-hidden text-center">
          <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent-silver)]/40 to-transparent" />

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--theme-text)] mb-3">
            Ready to Start Hiring on JobOne?
          </h2>

          <p className="text-sm sm:text-base text-[var(--theme-text-muted)] max-w-xl mx-auto mb-8 leading-relaxed">
            Set up your verified company profile, publish open roles, and manage candidate pipelines in one workspace.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={isEmployerLoggedIn ? "/createjob" : "/employerregisteroption"}
              className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-sm hover:opacity-90 transition shadow-md group"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post a Job</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {isEmployerLoggedIn ? (
              <Link
                to="/employerdashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-sm transition"
              >
                <span>Open Employer Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/employerregister"
                className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-sm transition"
              >
                <span>Create Employer Account</span>
              </Link>
            )}

            {!isEmployerLoggedIn && (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-3.5 min-h-[44px] rounded-xl bg-transparent hover:bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] font-semibold text-sm transition"
              >
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

