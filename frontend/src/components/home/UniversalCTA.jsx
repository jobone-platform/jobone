import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, PlusCircle, LayoutDashboard, Sparkles } from "lucide-react";
import { useAuth } from "../../routes/Context";

export default function UniversalCTA() {
  const { user, employer, admin, role, authStatus } = useAuth();

  const isCandidateLoggedIn =
    authStatus === "authenticated" &&
    (role === "jobseeker" || Boolean(user && !employer && !admin));
  const isEmployerLoggedIn =
    authStatus === "authenticated" &&
    (role === "employer" || Boolean(employer && !admin));

  return (
    <section
      aria-label="Universal Call to Action"
      className="py-16 sm:py-24 bg-[var(--theme-bg)] text-[var(--theme-text)] border-t border-[var(--theme-border)] transition-colors duration-150"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-[var(--theme-border-silver)] bg-[var(--theme-surface)] p-8 sm:p-14 shadow-2xl overflow-hidden text-center">
          {/* Subtle Ambient Sheen */}
          <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent-silver)]/40 to-transparent" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join the Marketplace</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--theme-text)] mb-4">
            Your Next Opportunity Starts Here.
          </h2>

          <p className="text-sm sm:text-base text-[var(--theme-text-muted)] max-w-xl mx-auto mb-9 leading-relaxed">
            Whether you are advancing your professional career or assembling an elite team of verified specialists, JobOne provides the transparent infrastructure to accelerate your ambitions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            {/* Candidate Primary Action */}
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[46px] rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-sm hover:opacity-90 transition shadow-md group"
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>Explore Jobs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Employer Primary Action */}
            <Link
              to={isEmployerLoggedIn ? "/createjob" : "/employerregisteroption"}
              className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[46px] rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-sm transition"
            >
              <PlusCircle className="w-4 h-4 text-[var(--theme-accent-silver)] shrink-0" />
              <span>Post a Job</span>
            </Link>

            {/* Auth / Account Shortcut */}
            {isCandidateLoggedIn ? (
              <Link
                to="/userdashboard"
                className="inline-flex items-center gap-2 px-5 py-3.5 min-h-[46px] rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] font-semibold text-sm transition"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Open Career Center</span>
              </Link>
            ) : isEmployerLoggedIn ? (
              <Link
                to="/employerdashboard"
                className="inline-flex items-center gap-2 px-5 py-3.5 min-h-[46px] rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] font-semibold text-sm transition"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Employer Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-3.5 min-h-[46px] rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] font-semibold text-sm transition"
              >
                <span>Create Account</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

