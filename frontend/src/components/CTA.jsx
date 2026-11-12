import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Building2, ArrowRight, Sparkles, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section
      aria-label="Action Hub"
      className="py-20 bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans border-t border-[var(--theme-border)] transition-colors duration-150 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Candidate Card */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-[var(--theme-surface)] p-8 sm:p-10 rounded-3xl border border-[var(--theme-border-silver)] relative overflow-hidden shadow-xl flex flex-col justify-between"
          >
            <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent-silver)]/40 to-transparent" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] rounded-2xl flex items-center justify-center mb-6 text-[var(--theme-accent-silver)]">
                <Briefcase className="w-6 h-6" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[11px] font-semibold text-[var(--theme-text-muted)] mb-3">
                <Sparkles className="w-3 h-3 text-[var(--theme-accent-silver)]" />
                <span>For Candidates</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[var(--theme-text)] mb-3 tracking-tight">
                Accelerate Your Career Trajectory
              </h3>

              <p className="text-sm text-[var(--theme-text-muted)] mb-8 max-w-md font-normal leading-relaxed">
                Direct access to verified requisitions across engineering, product, finance, and operations. Transparent salary insights and real-time application tracking.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs sm:text-sm transition-all hover:scale-105 shadow-sm group"
                >
                  <span>Explore Open Roles</span>
                  <ArrowRight className="w-4 h-4 text-[var(--theme-accent-silver)] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/userregister"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-transparent hover:bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] font-semibold text-xs sm:text-sm transition-colors"
                >
                  <span>Join as Candidate</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Employer Card */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-[var(--theme-surface)] p-8 sm:p-10 rounded-3xl border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] relative overflow-hidden shadow-xl flex flex-col justify-between"
          >
            <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent-silver)]/40 to-transparent" />

            <div className="relative z-10">
              <div className="w-12 h-12 bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] rounded-2xl flex items-center justify-center mb-6 text-[var(--theme-accent-silver)]">
                <Building2 className="w-6 h-6" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[11px] font-semibold text-[var(--theme-text-muted)] mb-3">
                <Sparkles className="w-3 h-3 text-[var(--theme-accent-silver)]" />
                <span>For Employers &amp; Hiring Teams</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[var(--theme-text)] mb-3 tracking-tight">
                Recruit Verified Industry Talent
              </h3>

              <p className="text-sm text-[var(--theme-text-muted)] mb-8 max-w-md font-normal leading-relaxed">
                Post positions, review authenticated candidate profiles, and manage your full talent pipeline directly within a unified hiring workspace.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/employerregisteroption"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs sm:text-sm transition-all hover:scale-105 shadow-sm group"
                >
                  <span>Post a Position</span>
                  <ArrowRight className="w-4 h-4 text-[var(--theme-accent-silver)] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-transparent hover:bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] font-semibold text-xs sm:text-sm transition-colors"
                >
                  <span>Enterprise Solutions</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
