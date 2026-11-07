import React from "react";
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
  Check,
  BarChart3,
  User,
  FileText,
  Briefcase,
  Layers,
  GraduationCap,
} from "lucide-react";
import { calculateATSScore } from "./ResumeConstants";

export default function ResumeATSAnalyzerModal({
  isOpen,
  onClose,
  resumeData,
  onNavigateSection,
}) {
  if (!isOpen) return null;

  const analysis = calculateATSScore(resumeData);
  const { score, tier, tierColor, categoryScores, criticalIssues, warnings, strengths, tips } = analysis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-[var(--theme-surface)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ats-modal-title"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--theme-border)] flex items-center justify-between bg-[var(--theme-surface-elevated)]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-accent-silver)]">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ats-modal-title" className="text-base font-bold text-[var(--theme-text)]">
                  JobOne ATS Resume Quality Intelligence
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border border-[var(--theme-border-silver)] uppercase font-semibold">
                  Parser Benchmark v2.2
                </span>
              </div>
              <p className="text-xs text-[var(--theme-text-muted)]">
                Automated evaluation against enterprise applicant tracking system patterns
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer"
            aria-label="Close ATS intelligence analysis"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 scrollbar-thin">
          {/* Top Score Banner */}
          <div className="p-6 rounded-2xl bg-[var(--theme-surface-elevated)]/60 border border-[var(--theme-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1.5 max-w-md">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${tierColor}`}>
                  ● {tier}
                </span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-[var(--theme-text)] tracking-tight">
                {score >= 90
                  ? "Optimized for Top-Tier Recruitment"
                  : score >= 75
                  ? "Strong Foundation with High Parse Rate"
                  : "Needs Optimization to Avoid Rejection"}
              </h4>
              <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                Calculated by inspecting contact clarity, summary impact, action verbs, quantified metrics, technical skills density, and single-column formatting.
              </p>
            </div>

            {/* Circular Gauge */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[var(--theme-border)]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      score >= 90
                        ? "text-emerald-400"
                        : score >= 75
                        ? "text-[var(--theme-accent-silver)]"
                        : "text-amber-400"
                    }
                    strokeDasharray={`${score}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-mono text-[var(--theme-text)]">
                    {score}
                  </span>
                  <span className="text-[9px] font-mono uppercase text-[var(--theme-text-muted)]">
                    / 100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown Grid */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] mb-3">
              Section Breakdown Ratings
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Contact Details", val: categoryScores.contact, max: 20, sec: "personal", icon: User },
                { label: "Executive Summary", val: categoryScores.summary, max: 15, sec: "summary", icon: FileText },
                { label: "Work Experience", val: categoryScores.experience, max: 25, sec: "experience", icon: Briefcase },
                { label: "Skills Density", val: categoryScores.skills, max: 20, sec: "skills", icon: Sparkles },
                { label: "Academic History", val: categoryScores.education, max: 15, sec: "education", icon: GraduationCap },
                { label: "ATS Formatting", val: categoryScores.formatting, max: 5, sec: "preview", icon: Layers },
              ].map((cat, i) => {
                const percent = Math.round((cat.val / cat.max) * 100);
                const Icon = cat.icon;
                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (cat.sec !== "preview") {
                        onNavigateSection(cat.sec);
                        onClose();
                      }
                    }}
                    className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] space-y-2 cursor-pointer hover:border-[var(--theme-border-silver)] transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)]">
                        <Icon size={13} />
                        <span className="font-semibold truncate">{cat.label}</span>
                      </div>
                      <span className="font-mono font-bold text-[var(--theme-text)]">
                        {cat.val}/{cat.max}
                      </span>
                    </div>
                    <div className="w-full bg-[var(--theme-surface)] rounded-full h-1.5 overflow-hidden border border-[var(--theme-border)]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent >= 80 ? "bg-emerald-400" : percent >= 50 ? "bg-[var(--theme-accent-silver)]" : "bg-amber-400"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Issues & Warnings */}
          {(criticalIssues.length > 0 || warnings.length > 0) && (
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                Identified Action Items
              </h4>

              {criticalIssues.map((issue, idx) => (
                <div
                  key={`crit-${idx}`}
                  className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-rose-200">Critical: </strong>
                      <span>{issue}</span>
                    </div>
                  </div>
                </div>
              ))}

              {warnings.map((warn, idx) => (
                <div
                  key={`warn-${idx}`}
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5"
                >
                  <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300">Suggestion: </strong>
                    <span>{warn}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                Verified ATS Strengths
              </h4>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1.5 text-xs text-emerald-300">
                {strengths.map((str, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer & Transparency Note */}
          <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)]/30 border border-[var(--theme-border)] text-[11px] text-[var(--theme-text-muted)] flex items-start gap-2.5 leading-relaxed">
            <Info size={14} className="text-[var(--theme-accent-silver)] shrink-0 mt-0.5" />
            <div>
              <strong>Audit Notice:</strong> The JobOne ATS score is an internal heuristic estimate benchmarking your resume against standard parsing structures (single-column layout, action verbs, quantified accomplishments, and contact readability). It is not an endorsement or formal guarantee of passing proprietary third-party enterprise ATS filters.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]/50 flex justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            Return to Editor
          </button>
        </div>
      </div>
    </div>
  );
}

