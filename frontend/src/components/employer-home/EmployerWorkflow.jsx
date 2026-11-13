import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  FilePlus2,
  Users,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";
import SectionHeader from "../shared/SectionHeader";

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Verify Company Profile",
    description: "Register your employer account and complete organization verification for trusted publishing.",
    icon: ShieldCheck,
  },
  {
    step: "02",
    title: "Publish Job Requisitions",
    description: "Specify role requirements, required skills, location preference, and compensation range.",
    icon: FilePlus2,
  },
  {
    step: "03",
    title: "Review & Shortlist Talent",
    description: "Inspect incoming applicant resumes, compare candidate qualifications, and build your shortlist.",
    icon: Users,
  },
  {
    step: "04",
    title: "Coordinate Interviews",
    description: "Schedule interview rounds and maintain clear status communication with candidates.",
    icon: CalendarCheck,
  },
  {
    step: "05",
    title: "Finalize Hires & Track Velocity",
    description: "Extend job offers, track pipeline metrics, and manage your team's recruitment progress.",
    icon: TrendingUp,
  },
];

export default function EmployerWorkflow() {
  return (
    <section
      id="employer-workflow"
      aria-label="How JobOne Helps Employers"
      className="py-16 sm:py-20 bg-[var(--theme-surface)]/40 text-[var(--theme-text)] border-t border-[var(--theme-border)] transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="From Account Setup to Final Hire"
          subtitle="A structured hiring workflow designed around how modern recruitment teams operate on JobOne."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {WORKFLOW_STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="rounded-2xl border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] bg-[var(--theme-surface)] p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <span className="font-mono text-xl font-black text-[var(--theme-accent-silver)]">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-accent-silver)]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[var(--theme-text)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

