import React from "react";
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
} from "lucide-react";

export default function JobPreviewCard({ job, onClose }) {
  if (!job) return null;

  const renderArray = (val) => {
    if (!val) return "Not specified";
    if (Array.isArray(val))
      return val.length > 0 ? val.join(", ") : "Not specified";
    return String(val);
  };

  const isRemote =
    renderArray(job.mode).toLowerCase().includes("home") ||
    job.mode === "Online";

  const locationText = isRemote
    ? "Remote"
    : `${typeof job.location === "object" ? job.location?.address : job.location || "Location not set"}${job.pinCode ? ` - ${job.pinCode}` : ""}`;

  const validFeatures =
    job.jobFeatures?.filter((f) => f && f.trim() !== "") || [];

  return (
    <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] rounded-3xl shadow-2xl flex flex-col h-full max-h-[85vh] lg:max-h-[800px] overflow-hidden relative transition-colors font-sans">
      <div className="bg-[var(--theme-surface-elevated)] px-6 py-4 flex justify-between items-center text-[var(--theme-text)] border-b border-[var(--theme-border)] shrink-0">
        <h3 className="font-bold flex items-center gap-2 text-sm font-display">
          <FileText size={16} className="text-[var(--theme-gold)]" /> Live Candidate Preview
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="p-1 hover:bg-[var(--theme-surface-hover)] rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-gold)] cursor-pointer text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="overflow-y-auto custom-scrollbar flex-1 p-6 sm:p-8 space-y-8">
        {/* Header & Badges */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
              {job.status?.replace("_", " ") || "Draft Preview"}
            </span>
            <span className="px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest bg-[var(--theme-gold-surface)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)] font-mono">
              {renderArray(job.mode)}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--theme-text)] mb-4 tracking-tight leading-tight font-display">
            {job.title || "Job Title"}
          </h1>
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

        {/* Job Highlights */}
        {validFeatures.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {validFeatures.map((feature, i) => (
              <div
                key={i}
                className="bg-[var(--theme-gold-surface)] border border-[var(--theme-gold-border)] p-3 rounded-xl flex items-center gap-3 font-mono shadow-xs"
              >
                <Zap className="text-[var(--theme-gold)] shrink-0" size={16} />
                <p className="text-sm font-bold text-[var(--theme-text)]">{feature}</p>
              </div>
            ))}
          </div>
        )}

        {/* Compensation Card */}
        <div className="p-5 bg-[var(--theme-surface-elevated)] rounded-2xl border border-[var(--theme-border)] shadow-xs">
          <p className="text-[10px] font-bold text-[var(--theme-gold)] uppercase tracking-widest mb-1 flex items-center gap-1 font-mono">
            <IndianRupee size={12} /> Compensation
          </p>
          <div className="flex items-baseline gap-1.5 mb-3 font-display">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--theme-gold)]">
              {(() => {
                const sMin =
                  Number(job.salaryMin) || Number(job.salaryAmount) || 0;
                const sMax =
                  Number(job.salaryMax) || Number(job.salaryAmount) || 0;

                if (sMin === 0 && sMax === 0) return "UNPAID";
                return `${job.salaryCurrency || "₹"} ${sMin.toLocaleString()} - ${sMax.toLocaleString()}`;
              })()}
            </span>
            <span className="text-xs font-bold text-[var(--theme-text-muted)] uppercase font-mono">
              / {job.salaryFrequency || "Month"}
            </span>
          </div>
          {job.incentives?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[var(--theme-border)]">
              {job.incentives.map((inc, i) => (
                <span
                  key={i}
                  className="bg-[var(--theme-surface)] border border-[var(--theme-border)] px-2 py-1 rounded text-[10px] font-bold text-[var(--theme-text)] font-mono"
                >
                  {inc}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Job Overview (Dates & Openings) */}
        <div className="p-4 bg-[var(--theme-surface-elevated)] rounded-xl border border-[var(--theme-border)] space-y-3 font-mono">
          <DetailRow
            icon={<CalendarDays size={14} className="text-[var(--theme-gold)]" />}
            label="Start Date"
            value={
              job.startDate
                ? new Date(job.startDate).toLocaleDateString()
                : "TBD"
            }
          />
          <DetailRow
            icon={<Calendar size={14} className="text-rose-400" />}
            label="End Date"
            value={
              job.isLongTerm
                ? "Long Term"
                : job.endDate
                  ? new Date(job.endDate).toLocaleDateString()
                  : "TBD"
            }
          />
          {(job.durationType || job.noOfDays) && (
            <DetailRow
              icon={<Timer size={14} className="text-amber-400" />}
              label="Duration"
              value={`${job.noOfDays || ""} ${job.durationType || "Days"}`}
            />
          )}
          {job.applicationDeadline && (
            <DetailRow
              icon={<Clock size={14} className="text-[var(--theme-gold)]" />}
              label="Apply Before"
              value={new Date(job.applicationDeadline).toLocaleDateString()}
            />
          )}
          <DetailRow
            icon={<Users size={14} className="text-[var(--theme-gold)]" />}
            label="Openings"
            value={`${job.noOfPeopleRequired || "TBD"} Position(s)`}
          />
        </div>

        {/* Schedule */}
        <div className="p-4 bg-[var(--theme-surface-elevated)] rounded-xl border border-[var(--theme-border)] font-mono">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider flex items-center gap-1">
              <Clock size={12} className="text-[var(--theme-gold)]" /> Schedule
            </p>
            {job.isFlexibleShifts && (
              <span className="px-2 py-0.5 bg-[var(--theme-gold-surface)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)] text-[10px] font-bold rounded">
                Flexible
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-[var(--theme-text)] mb-3 font-sans">
            {job.workDaysPattern === "Custom"
              ? job.customWorkDaysDescription
              : job.workDaysPattern || renderArray(job.workDays)}
          </p>
          {job.shifts?.length > 0 && (
            <div>
              <p className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-widest mb-2">
                Expected Shift Timings
              </p>
              <div className="space-y-2">
                {job.shifts.map((shift, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-[var(--theme-surface)] p-3 border border-[var(--theme-border)] rounded-xl"
                  >
                    <span className="text-xs font-bold text-[var(--theme-text)]">
                      {shift.shiftName}
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--theme-gold)] bg-[var(--theme-surface-elevated)] px-2 py-1 rounded shadow-xs border border-[var(--theme-border)]">
                      {shift.startTime || "--:--"} - {shift.endTime || "--:--"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Candidate Profile */}
        <div className="p-5 bg-[var(--theme-surface-elevated)] rounded-2xl border border-[var(--theme-border)] space-y-4">
          <h3 className="font-extrabold text-[var(--theme-gold)] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-[var(--theme-border)] pb-2 font-display">
            <UserCircle2 size={14} /> Candidate Profile
          </h3>
          <div className="grid grid-cols-2 gap-4 font-mono">
            <div>
              <p className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase mb-0.5">
                <GraduationCap size={10} className="inline mr-1 text-[var(--theme-gold)]" /> Education
              </p>
              <p className="text-sm text-[var(--theme-text)] font-bold leading-tight font-sans">
                {renderArray(job.qualifications)}
              </p>
              {job.courses?.length > 0 && (
                <p className="text-[10px] text-[var(--theme-text-muted)] font-medium leading-tight mt-0.5">
                  ({job.courses.join(", ")})
                </p>
              )}
            </div>
            <div>
              <p className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase mb-0.5">
                <Languages size={10} className="inline mr-1 text-[var(--theme-gold)]" /> Languages
              </p>
              <p className="text-sm text-[var(--theme-text)] font-bold leading-tight font-sans">
                {renderArray(job.languages)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase mb-0.5">
                Age Limit
              </p>
              <p className="text-sm text-[var(--theme-text)] font-bold leading-tight font-sans">
                {job.ageLimit?.isAny
                  ? "Any Age"
                  : job.ageLimit?.min
                    ? `${job.ageLimit.min}-${job.ageLimit.max} Yrs`
                    : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase mb-0.5">
                Gender
              </p>
              <p className="text-sm text-[var(--theme-text)] font-bold leading-tight font-sans">
                {job.genderPreference || "No Preference"}
              </p>
            </div>
          </div>
        </div>

        {/* Required Skills */}
        {job.skillsRequired?.length > 0 && (
          <div>
            <h3 className="text-xs font-extrabold text-[var(--theme-text-muted)] mb-2 uppercase tracking-wider flex items-center gap-1 font-mono">
              <CheckCircle2 size={12} className="text-emerald-400" /> Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill, i) => (
                <span
                  key={i}
                  className="bg-[var(--theme-surface-elevated)] text-[var(--theme-gold)] border border-[var(--theme-gold-border)] px-3 py-1 rounded-md text-[10px] font-bold font-mono"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Screening Questions */}
        {job.screeningQuestions?.length > 0 && (
          <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/20">
            <h3 className="text-xs font-extrabold text-rose-400 mb-2 uppercase tracking-wider flex items-center gap-1 font-mono">
              <HelpCircle size={12} /> Assessment Questions
            </h3>
            <ul className="space-y-2 font-mono">
              {job.screeningQuestions.map((q, i) => (
                <li
                  key={i}
                  className="text-xs font-medium text-[var(--theme-text)] leading-tight"
                >
                  <span className="font-bold text-[var(--theme-gold)]">Q{i + 1}.</span> {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Description & Responsibilities */}
        <div className="space-y-8 pb-6">
          {/* Job Summary */}
          <div>
            <h2 className="text-sm font-extrabold text-[var(--theme-gold)] bg-[var(--theme-gold-surface)] inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3 border border-[var(--theme-gold-border)] font-display">
              <Briefcase size={16} className="text-[var(--theme-gold)]" /> Job Summary
            </h2>
            <div
              className="prose prose-sm max-w-none text-[var(--theme-text)] leading-relaxed font-sans opacity-90"
              dangerouslySetInnerHTML={{
                __html: job.jobSummary || job.description,
              }}
            />
          </div>

          {/* Key Responsibilities */}
          {(job.keyResponsibilities ||
            job.description?.includes("Key Responsibilities")) && (
            <div className="pt-6 border-t border-[var(--theme-border)]">
              <h2 className="text-sm font-extrabold text-[var(--theme-gold)] bg-[var(--theme-gold-surface)] inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3 border border-[var(--theme-gold-border)] font-display">
                <ListChecks size={16} className="text-[var(--theme-gold)]" /> Key
                Responsibilities
              </h2>

              <div className="prose prose-sm max-w-none text-[var(--theme-text)] leading-relaxed font-sans opacity-90 prose-ul:list-disc prose-ul:pl-5 prose-li:marker:text-[var(--theme-gold)]">
                {(() => {
                  let respHtml = job.keyResponsibilities;

                  if (!respHtml && job.description) {
                    const parts = job.description.split(
                      /(?:Key Responsibilities:?|Key Responsibilities\n)/i,
                    );
                    respHtml = parts[1] || "";
                  }

                  if (!respHtml) return null;

                  if (respHtml.includes("<li") || respHtml.includes("<ul")) {
                    return (
                      <div dangerouslySetInnerHTML={{ __html: respHtml }} />
                    );
                  }

                  const forcedBullets = respHtml
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
        </div>
      </div>

      <div className="p-4 bg-[var(--theme-surface-elevated)] border-t border-[var(--theme-border)] shrink-0">
        <button
          disabled
          className="w-full py-3 bg-[var(--theme-gold)] text-black rounded-xl font-bold opacity-60 cursor-not-allowed flex items-center justify-center gap-2 font-mono text-xs"
        >
          <CheckCircle2 size={16} /> Apply Now (Candidate Preview Only)
        </button>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between font-mono">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-[var(--theme-surface)] rounded-lg border border-[var(--theme-border)] shadow-xs text-[var(--theme-gold)]">
          {icon}
        </div>
        <span className="text-[var(--theme-text-muted)] text-[10px] font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <span
        className="text-[var(--theme-text)] font-extrabold text-xs text-right truncate max-w-[50%]"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
