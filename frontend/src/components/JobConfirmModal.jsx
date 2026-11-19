import React, { useEffect } from "react";
import {
  MapPin,
  IndianRupee,
  Briefcase,
  Clock,
  Users,
  X,
  GraduationCap,
  Languages,
  UserCircle2,
  CheckCircle2,
  FileText,
  Zap,
  CalendarDays,
  Calendar,
  Timer,
  HelpCircle,
  ListChecks,
  Target,
  AlertTriangle,
  Stethoscope,
} from "lucide-react";
import CompanyDisplay from "./CompanyDisplay";
import { motion } from "framer-motion";

export default function JobConfirmModal({
  job,
  employerProfileName,
  summary,
  responsibilities,
  onClose,
  onConfirm,
  loading,
}) {
  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!job) return null;

  const renderArray = (val) => {
    if (!val) return "Not specified";
    if (Array.isArray(val))
      return val.length > 0 ? val.join(", ") : "Not specified";
    return String(val);
  };

  const modeStr = renderArray(job.mode || []);
  const isRemote =
    modeStr.toLowerCase().includes("home") || job.mode === "Online";

  const locationText = isRemote
    ? "Remote"
    : `${typeof job.location === "object" ? job.location?.address : job.location || "Location not set"}${job.pinCode ? ` - ${job.pinCode}` : ""}`;

  const validFeatures =
    job.jobFeatures?.filter((f) => f && f.trim() !== "") || [];

  const renderExperience = () => {
    if (!job.experience) return "Not specified";
    const rel = job.experience.relevantExperience;
    const tot = job.experience.totalExperience;
    if (rel?.isAny && tot?.isAny) return "Any / Freshers Welcome";
    if (!rel?.isAny && rel?.min !== undefined && rel?.min !== "")
      return `${rel.min}-${rel.max} yrs (Relevant)`;
    if (!tot?.isAny && tot?.min !== undefined && tot?.min !== "")
      return `${tot.min}-${tot.max} yrs (Total)`;
    return "Not specified";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-confirm-title"
        className="bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] w-full max-w-6xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative transition-colors"
      >
        {/* --- CONFIRMATION HEADER --- */}
        <div className="bg-[var(--theme-surface-elevated)] px-6 sm:px-8 py-5 flex justify-between items-center text-[var(--theme-text)] shrink-0 border-b border-[var(--theme-border)]">
          <div>
            <h2 id="job-confirm-title" className="text-xl sm:text-2xl font-extrabold flex items-center gap-2 font-display">
              <CheckCircle2 className="text-[var(--theme-gold)]" size={24} /> Final
              Review & Publish
            </h2>
            <p className="text-[var(--theme-text-muted)] text-xs sm:text-sm font-medium mt-1 font-mono">
              This is exactly how candidates will see your posting. Review
              carefully.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close review modal"
            className="p-2 hover:bg-[var(--theme-surface-hover)] rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-gold)] cursor-pointer"
          >
            <X size={24} className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]" />
          </button>
        </div>

        {/* --- SCROLLABLE BODY --- */}
        <div className="overflow-y-auto custom-scrollbar flex-1 p-6 sm:p-8 space-y-8">
          {/* Top Info block */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                Ready to Post
              </span>
              <span className="px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest bg-[var(--theme-gold-surface)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)] font-mono">
                {modeStr}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--theme-text)] mb-2 tracking-tight leading-tight font-display">
              {job.title || "Untitled Job"}
            </h1>
            <p className="text-[var(--theme-gold)] font-bold flex items-center gap-2 mb-4 font-mono text-sm">
              <CompanyDisplay job={job} fallback={employerProfileName || "Confidential Employer"} />
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] text-xs font-bold rounded-lg border border-[var(--theme-border)] font-mono">
                <MapPin size={14} className="text-[var(--theme-gold)]" />{" "}
                <span className="truncate max-w-[200px]">{locationText}</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] text-xs font-bold rounded-lg border border-[var(--theme-border)] capitalize font-mono">
                <Briefcase size={14} className="text-[var(--theme-gold)]" />{" "}
                {renderArray(job.jobType)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* --- MAIN CONTENT (LEFT) --- */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Highlights */}
              {validFeatures.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {validFeatures.map((feature, i) => (
                    <div
                      key={i}
                      className="bg-[var(--theme-gold-surface)] border border-[var(--theme-gold-border)] p-4 rounded-2xl flex items-start gap-3 shadow-xs"
                    >
                      <div className="p-2 bg-[var(--theme-gold-surface)] rounded-lg shrink-0">
                        <Zap className="text-[var(--theme-gold)]" size={18} />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[var(--theme-text)] mt-0.5 leading-snug font-mono">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Candidate Profile */}
              <section className="bg-[var(--theme-surface-elevated)] rounded-3xl p-6 border border-[var(--theme-border)] shadow-xs">
                <h2 className="text-base font-extrabold text-[var(--theme-text)] mb-4 flex items-center gap-3 border-b border-[var(--theme-border)] pb-4 font-display">
                  <div className="p-2 bg-[var(--theme-gold-surface)] rounded-lg text-[var(--theme-gold)] border border-[var(--theme-gold-border)]">
                    <UserCircle2 size={18} />
                  </div>{" "}
                  Candidate Profile
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-[10px] text-[var(--theme-gold)] font-bold uppercase mb-0.5 font-mono">
                      <Target size={10} className="inline mr-1" /> Experience
                    </p>
                    <p className="text-sm text-[var(--theme-text)] font-bold">
                      {renderExperience()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-widest flex items-center gap-1 mb-1 font-mono">
                      <GraduationCap size={12} className="text-[var(--theme-gold)]" />{" "}
                      Education
                    </p>
                    <p className="text-sm font-bold text-[var(--theme-text)]">
                      {renderArray(job.qualifications)}
                      {job.courses?.length > 0 && (
                        <span className="block text-[11px] text-[var(--theme-text-muted)] font-medium">
                          ({job.courses.join(", ")})
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-widest flex items-center gap-1 mb-1 font-mono">
                      <Languages size={12} className="text-[var(--theme-gold)]" />{" "}
                      Languages
                    </p>
                    <p className="text-sm font-bold text-[var(--theme-text)]">
                      {renderArray(job.languages)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-widest flex items-center gap-1 mb-1 font-mono">
                      <UserCircle2 size={12} className="text-[var(--theme-gold)]" />{" "}
                      Demographics
                    </p>
                    <p className="text-sm font-bold text-[var(--theme-text)]">
                      {job.ageLimit?.isAny
                        ? "Any Age"
                        : job.ageLimit?.min
                          ? `${job.ageLimit.min}-${job.ageLimit.max} Yrs`
                          : "Age not set"}
                      <span className="text-[var(--theme-text-muted)] mx-1">|</span>
                      {job.genderPreference || "No Pref"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Required Skills */}
              {job.skillsRequired?.length > 0 && (
                <section className="bg-[var(--theme-surface-elevated)] rounded-3xl p-6 border border-[var(--theme-border)] shadow-xs">
                  <h2 className="text-base font-extrabold text-[var(--theme-text)] mb-4 border-b border-[var(--theme-border)] pb-4 flex items-center gap-3 font-display">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 size={18} />
                    </div>{" "}
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-[var(--theme-surface)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)] rounded-xl text-xs font-mono font-bold shadow-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Screening Questions */}
              {job.screeningQuestions?.length > 0 && (
                <section className="bg-rose-500/5 rounded-3xl p-6 border border-rose-500/20">
                  <h2 className="text-base font-extrabold text-rose-400 mb-4 flex items-center gap-3 font-display">
                    <div className="p-2 bg-[var(--theme-surface-elevated)] rounded-lg text-rose-400 border border-rose-500/20 shadow-xs">
                      <HelpCircle size={18} />
                    </div>{" "}
                    Assessment Questions
                  </h2>
                  <ul className="space-y-3 font-mono">
                    {job.screeningQuestions.map((q, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 bg-[var(--theme-surface-elevated)] p-4 rounded-xl border border-[var(--theme-border)] text-sm font-medium text-[var(--theme-text)] shadow-xs"
                      >
                        <span className="font-extrabold text-[var(--theme-gold)]">
                          Q{i + 1}.
                        </span>{" "}
                        {q}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Description Split */}
              <section className="bg-[var(--theme-surface-elevated)] rounded-3xl p-6 sm:p-8 border border-[var(--theme-border)] shadow-xs space-y-8">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-[var(--theme-gold)] bg-[var(--theme-gold-surface)] inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-4 border border-[var(--theme-gold-border)] font-display">
                    <Briefcase size={18} className="text-[var(--theme-gold)]" /> Job
                    Summary
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-[var(--theme-text)] leading-relaxed font-sans opacity-90"
                    dangerouslySetInnerHTML={{ __html: summary }}
                  />
                </div>

                {responsibilities && (
                  <div className="pt-6 border-t border-[var(--theme-border)]">
                    <h2 className="text-sm sm:text-base font-extrabold text-[var(--theme-gold)] bg-[var(--theme-gold-surface)] inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-4 border border-[var(--theme-gold-border)] font-display">
                      <ListChecks size={18} className="text-[var(--theme-gold)]" /> Key
                      Responsibilities
                    </h2>

                    <div className="prose prose-sm max-w-none text-[var(--theme-text)] leading-relaxed font-sans opacity-90 prose-ul:list-disc prose-ul:pl-5 prose-li:marker:text-[var(--theme-gold)]">
                      {(() => {
                        // If the editor generated legit HTML lists, use them
                        if (
                          responsibilities.includes("<li") ||
                          responsibilities.includes("<ul")
                        ) {
                          return (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: responsibilities,
                              }}
                            />
                          );
                        }

                        // FACT: Aggressive HTML Stripper forces regular text into bullet points
                        const forcedBullets = responsibilities
                          .replace(/<\/?(?:p|br|div)[^>]*>/gi, "\n")
                          .replace(/<[^>]+>/g, "")
                          .split("\n")
                          .map((line) => line.replace(/^[-*•]\s*/, "").trim())
                          .filter((line) => line.length > 5);

                        return (
                          <ul className="list-disc pl-5 space-y-2">
                            {forcedBullets.map((line, i) => (
                              <li key={i}>{line}</li>
                            ))}
                          </ul>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* --- SIDEBAR DETAILS (RIGHT) --- */}
            <div className="lg:col-span-1 space-y-6">
              {/* Premium Compensation Card */}
              <section className="bg-[var(--theme-surface-elevated)] rounded-3xl p-6 sm:p-8 shadow-xs border border-[var(--theme-border)] text-[var(--theme-text)] relative overflow-hidden">
                <h3 className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest mb-5 sm:mb-6 font-mono">
                  Compensation
                </h3>
                <div>
                  <p className="text-[var(--theme-text-muted)] text-[10px] font-bold mb-1 uppercase tracking-wide flex items-center gap-1.5 font-mono">
                    <IndianRupee size={12} className="text-[var(--theme-gold)]" /> Total Salary
                  </p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2 mb-5 sm:mb-6 font-display">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--theme-gold)]">
                      {(() => {
                        // FACT: Safely handle both Legacy Jobs and New Jobs
                        const sMin =
                          Number(job.salaryMin) ||
                          Number(job.salaryAmount) ||
                          0;
                        const sMax =
                          Number(job.salaryMax) ||
                          Number(job.salaryAmount) ||
                          0;

                        if (sMin === 0 && sMax === 0) return "UNPAID";
                        return `${job.salaryCurrency || "₹"} ${sMin.toLocaleString()} - ${sMax.toLocaleString()}`;
                      })()}
                    </span>
                  </div>
                  <div className="bg-[var(--theme-surface)] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[var(--theme-border)] flex justify-between items-center text-xs sm:text-sm font-bold font-mono">
                    <span className="text-[var(--theme-text-muted)]">Frequency</span>
                    <span className="text-emerald-400 uppercase tracking-wider">
                      {job.salaryFrequency || "Monthly"}
                    </span>
                  </div>
                  {job.incentives?.length > 0 && (
                    <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-[var(--theme-border)]">
                      <p className="text-[10px] text-[var(--theme-gold)] font-bold uppercase tracking-widest mb-2 flex items-center gap-1 font-mono">
                        <Zap size={12} /> Perks & Benefits
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.incentives.map((inc, i) => (
                          <span
                            key={i}
                            className="bg-[var(--theme-surface)] border border-[var(--theme-border)] px-2 py-1 rounded text-xs text-[var(--theme-text)] font-mono"
                          >
                            {inc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Job Overview (Timeline & Openings) */}
              <section className="bg-[var(--theme-surface-elevated)] rounded-3xl p-6 border border-[var(--theme-border)] shadow-xs">
                <div className="flex items-center justify-between mb-5 border-b border-[var(--theme-border)] pb-3 font-mono">
                  <h3 className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest">
                    Timeline & Openings
                  </h3>
                  {job.isFlexibleDuration && (
                    <span className="px-2 py-0.5 bg-[var(--theme-surface)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)] text-[10px] font-bold rounded">
                      Flexible
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  <DetailRow
                    icon={<CalendarDays size={16} className="text-[var(--theme-gold)]" />}
                    label="Start Date"
                    value={
                      job.startDate
                        ? new Date(job.startDate).toLocaleDateString()
                        : "TBD"
                    }
                  />
                  <DetailRow
                    icon={<Calendar size={16} className="text-rose-400" />}
                    label="End Date"
                    value={
                      job.isLongTerm
                        ? "Long Term Role"
                        : job.endDate
                          ? new Date(job.endDate).toLocaleDateString()
                          : "TBD"
                    }
                  />
                  {(job.durationType || job.noOfDays) && (
                    <DetailRow
                      icon={<Timer size={16} className="text-amber-400" />}
                      label="Duration"
                      value={`${job.noOfDays || ""} ${job.durationType || "Days"}`}
                    />
                  )}
                  {job.applicationDeadline && (
                    <>
                      <div className="h-px bg-[var(--theme-border)] my-2"></div>
                      <DetailRow
                        icon={<Clock size={16} className="text-[var(--theme-gold)]" />}
                        label="Apply Before"
                        value={new Date(
                          job.applicationDeadline,
                        ).toLocaleDateString()}
                      />
                    </>
                  )}
                  <div className="h-px bg-[var(--theme-border)] my-2"></div>
                  <DetailRow
                    icon={<Users size={16} className="text-[var(--theme-gold)]" />}
                    label="Openings"
                    value={`${job.noOfPeopleRequired} Position(s)`}
                  />
                </div>
              </section>

              {/* Schedule */}
              <section className="bg-[var(--theme-surface-elevated)] rounded-3xl p-6 border border-[var(--theme-border)] shadow-xs">
                <div className="flex justify-between items-center mb-5 border-b border-[var(--theme-border)] pb-3 font-mono">
                  <h3 className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest flex items-center gap-1">
                    <Clock size={12} className="text-[var(--theme-gold)]" /> Schedule
                  </h3>
                  {job.isFlexibleShifts && (
                    <span className="px-2 py-0.5 bg-[var(--theme-gold-surface)] text-[var(--theme-gold)] text-[10px] font-bold rounded border border-[var(--theme-gold-border)]">
                      Flexible
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <p className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-widest mb-2 font-mono">
                    Working Days
                  </p>
                  <div className="inline-block px-3 py-1.5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg text-xs font-bold text-[var(--theme-text)] font-mono">
                    {job.workDaysPattern === "Custom"
                      ? job.customWorkDaysDescription
                      : job.workDaysPattern || renderArray(job.workDays)}
                  </div>
                </div>
                {!job.isFlexibleShifts && job.shifts?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-widest mb-2 font-mono">
                      Shift Timings
                    </p>
                    <div className="space-y-2 font-mono">
                      {job.shifts.map((shift, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-[var(--theme-surface)] p-3 border border-[var(--theme-border)] rounded-xl"
                        >
                          <span className="text-xs font-bold text-[var(--theme-text)]">
                            {shift.shiftName}
                          </span>
                          <span className="text-xs font-mono font-bold text-[var(--theme-gold)] bg-[var(--theme-surface-elevated)] px-2 py-1 rounded shadow-xs border border-[var(--theme-border)]">
                            {shift.startTime || "--:--"} -{" "}
                            {shift.endTime || "--:--"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="p-4 sm:p-6 bg-[var(--theme-surface-elevated)] border-t border-[var(--theme-border)] shrink-0 flex justify-end items-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 font-bold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] rounded-xl transition-colors cursor-pointer font-mono text-xs"
          >
            Go Back & Edit
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 bg-[var(--theme-gold)] text-black px-8 py-3 rounded-xl font-bold hover:bg-[var(--theme-gold-bright)] transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer font-mono text-xs"
          >
            {loading ? "Publishing..." : "Confirm & Publish Job"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Minimal Detail Row Component
function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between font-mono">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 bg-[var(--theme-surface)] rounded-lg border border-[var(--theme-border)] shadow-xs text-[var(--theme-gold)]">
          {icon}
        </div>
        <span className="text-[var(--theme-text-muted)] text-[10px] font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <span
        className="text-[var(--theme-text)] font-extrabold text-xs sm:text-sm text-right truncate max-w-[45%]"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
