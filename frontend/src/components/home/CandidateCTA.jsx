import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../routes/Context";

export default function CandidateCTA() {
  const { user, employer, admin, role, authStatus } = useAuth();
  const isCandidateLoggedIn =
    authStatus === "authenticated" &&
    (role === "jobseeker" || Boolean(user && !employer && !admin));

  return (
    <section
      aria-label="Candidate Call to Action"
      className="py-16 sm:py-20 bg-[var(--theme-bg)] text-[var(--theme-text)] border-t border-[var(--theme-border)] transition-colors duration-150"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-[var(--theme-border-silver)] bg-[var(--theme-surface)] p-8 sm:p-12 shadow-2xl overflow-hidden text-center">
          <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent-silver)]/40 to-transparent" />

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--theme-text)] mb-3">
            Ready for Your Next Career Move?
          </h2>

          <p className="text-sm sm:text-base text-[var(--theme-text-muted)] max-w-xl mx-auto mb-8 leading-relaxed">
            Explore verified job openings, apply directly to employers, and track your career progress in one workspace.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-sm hover:opacity-90 transition shadow-md group"
            >
              <span>Explore Jobs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {isCandidateLoggedIn ? (
              <Link
                to="/userdashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-sm transition"
              >
                <span>Open Career Center</span>
              </Link>
            ) : (
              <Link
                to="/userregister"
                className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-sm transition"
              >
                <span>Create Free Account</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

