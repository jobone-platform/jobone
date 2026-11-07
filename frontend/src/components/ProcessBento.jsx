import React from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Search,
  Send,
  CalendarCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function ProcessBento() {
  const steps = [
    {
      num: "01",
      title: "Architect Profile",
      desc: "Build a verified career portfolio, upload your resume, and detail your core technical competencies.",
      icon: UserPlus,
    },
    {
      num: "02",
      title: "Discover Requisitions",
      desc: "Filter live openings with verified employer transparency across compensation, workplace mode, and role scope.",
      icon: Search,
    },
    {
      num: "03",
      title: "Direct Submission",
      desc: "Apply straight into employer ATS pipelines with verified credentials and structured documents.",
      icon: Send,
    },
    {
      num: "04",
      title: "Telemetry & Offer",
      desc: "Track review progress in real-time, coordinate recruiter interviews, and receive competitive offers.",
      icon: CalendarCheck,
    },
  ];

  return (
    <section
      aria-label="How JobOne Works"
      className="relative py-20 md:py-28 bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans overflow-hidden border-t border-[var(--theme-border)] transition-colors duration-150"
    >
      {/* Ambient Sheen */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text-muted)] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Recruitment Workflow
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--theme-text)] tracking-tight leading-tight">
            How JobOne Powers Your Career
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--theme-text-muted)] leading-relaxed">
            A transparent 4-stage pipeline eliminating recruitment ambiguity for candidates and enterprises.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="group relative bg-[var(--theme-surface)] rounded-2xl p-6 border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Top Sheen */}
                <div className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent-silver)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-2xl font-black text-[var(--theme-accent-silver)] tracking-tighter">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--theme-text)] mb-2 group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[var(--theme-border)] flex items-center text-xs font-semibold text-[var(--theme-text-subtle)] group-hover:text-[var(--theme-text)] transition-colors">
                  <span>Phase {step.num}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
