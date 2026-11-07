import React, { useState, useMemo } from "react";
import {
  X,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Search,
  Check,
  Building2,
  Info,
} from "lucide-react";
import { SKILL_SUGGESTIONS } from "./ResumeConstants";

// Comprehensive catalog of common tech and engineering keywords for matching
const ALL_KNOWN_KEYWORDS = Array.from(
  new Set(Object.values(SKILL_SUGGESTIONS).flat())
);

export default function ResumeJobMatcherModal({
  isOpen,
  onClose,
  resumeData,
  onAddSkill,
}) {
  const [jobDescription, setJobDescription] = useState("");
  const [targetJobTitle, setTargetJobTitle] = useState("");

  // Extract keywords from job description
  const { matchedKeywords, missingKeywords, matchPercentage } = useMemo(() => {
    if (!jobDescription.trim() || !resumeData) {
      return { matchedKeywords: [], missingKeywords: [], matchPercentage: 0 };
    }

    const jdText = jobDescription.toLowerCase();
    const resumeText = [
      resumeData.contact?.title || "",
      resumeData.summary || "",
      (resumeData.skills || []).map((s) => (typeof s === "object" ? s.name : s)).join(" "),
      (resumeData.experience || []).map((e) => `${e.role || ""} ${e.company || ""} ${e.description || ""} ${(e.bullets || []).join(" ")}`).join(" "),
      (resumeData.projects || []).map((p) => `${p.title || ""} ${p.technologies || ""} ${p.description || ""} ${(p.bullets || []).join(" ")}`).join(" "),
      (resumeData.education || []).map((ed) => `${ed.degree || ""} ${ed.school || ed.university || ""}`).join(" "),
    ].join(" ").toLowerCase();

    // Find all keywords mentioned in JD
    const jdKeywords = ALL_KNOWN_KEYWORDS.filter((kw) => {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      return regex.test(jdText);
    });

    if (jdKeywords.length === 0) {
      return { matchedKeywords: [], missingKeywords: [], matchPercentage: 0 };
    }

    const matched = [];
    const missing = [];

    jdKeywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(resumeText)) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    });

    const pct = Math.round((matched.length / jdKeywords.length) * 100);

    return {
      matchedKeywords: matched,
      missingKeywords: missing,
      matchPercentage: pct,
    };
  }, [jobDescription, resumeData]);

  const handleAddMissingSkill = (kw) => {
    onAddSkill(kw);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-[var(--theme-surface)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-matcher-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--theme-border)] flex items-center justify-between bg-[var(--theme-surface-elevated)]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-accent-silver)]">
              <Target size={18} />
            </div>
            <div>
              <h3 id="job-matcher-title" className="text-base font-bold text-[var(--theme-text)]">
                Job Description Matcher & Keyword Optimizer
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)]">
                Compare your resume against any target opening to identify missing competencies
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors cursor-pointer"
            aria-label="Close job matcher"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 scrollbar-thin">
          {/* Input Area */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Optional Target Job Title (e.g. Staff Backend Engineer)..."
                value={targetJobTitle}
                onChange={(e) => setTargetJobTitle(e.target.value)}
                className="flex-1 p-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] focus:border-[var(--theme-border-silver)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                Paste Job Description / Requirements:
              </label>
              <textarea
                rows={5}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description or requirements section here to analyze keyword matches..."
                className="w-full p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] focus:border-[var(--theme-border-silver)] focus:outline-none resize-y"
              />
            </div>
          </div>

          {/* Results Block */}
          {jobDescription.trim() ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Score Meter */}
              <div className="p-5 rounded-2xl bg-[var(--theme-surface-elevated)]/60 border border-[var(--theme-border)] flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                    Keyword Alignment Match
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-[var(--theme-text)] mt-0.5">
                    {matchPercentage}% Match Rating
                  </h4>
                  <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                    {matchedKeywords.length} of {matchedKeywords.length + missingKeywords.length} core technical requirements present in your resume.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-[var(--theme-accent-silver)]">
                    {matchPercentage}%
                  </span>
                </div>
              </div>

              {/* Missing Keywords (Actionable) */}
              {missingKeywords.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <AlertCircle size={13} />
                      <span>Missing from Resume ({missingKeywords.length})</span>
                    </h4>
                    <span className="text-[11px] text-[var(--theme-text-muted)]">
                      Click + to add if you possess these skills
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {missingKeywords.map((kw, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddMissingSkill(kw)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-medium hover:bg-amber-500/20 transition-colors cursor-pointer"
                        title={`Add ${kw} to resume skills`}
                      >
                        <Plus size={12} />
                        <span>{kw}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Keywords */}
              {matchedKeywords.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>Matched Keywords Found in Resume ({matchedKeywords.length})</span>
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                      >
                        <Check size={12} />
                        <span>{kw}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-[var(--theme-border)] text-center text-xs text-[var(--theme-text-muted)] space-y-2">
              <Search size={24} className="mx-auto text-[var(--theme-accent-silver)] opacity-60" />
              <p>Paste a job description above to instantly audit your keyword density and match rating.</p>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)]/30 border border-[var(--theme-border)] text-[11px] text-[var(--theme-text-muted)] flex items-start gap-2 leading-relaxed">
            <Info size={13} className="text-[var(--theme-accent-silver)] shrink-0 mt-0.5" />
            <span>
              <strong>Authenticity Rule:</strong> Only append skills and keywords that accurately reflect your verified competencies. Do not fabricate experience.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]/50 flex justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            Apply to Resume & Close
          </button>
        </div>
      </div>
    </div>
  );
}
