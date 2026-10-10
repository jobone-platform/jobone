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
  // FACT: Guard Clause. Prevents the app from crashing if 'job' is undefined.
  if (!job) return null;

  // FACT: Safe fallback for legacy strings vs new arrays
  const renderArray = (val) => {
    if (!val) return "Not specified";
    if (Array.isArray(val))
      return val.length > 0 ? val.join(", ") : "Not specified";
    return String(val);
  };

  // FACT: Now job.mode is perfectly safe to access
  const isRemote =
    renderArray(job.mode).toLowerCase().includes("home") ||
    job.mode === "Online";

  // FACT: Added pinCode to the preview location
  const locationText = isRemote
    ? "Remote"
    : `${typeof job.location === "object" ? job.location?.address : job.location || "Location not set"}${job.pinCode ? ` - ${job.pinCode}` : ""}`;

  const validFeatures =
    job.jobFeatures?.filter((f) => f && f.trim() !== "") || [];

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col h-full max-h-[85vh] lg:max-h-[800px] overflow-hidden relative">
      <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
        <h3 className="font-bold flex items-center gap-2 text-sm">
          <FileText size={16} /> Live Preview
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="overflow-y-auto custom-scrollbar flex-1 p-6 sm:p-8 space-y-8">
        {/* Header & Badges */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
              {job.status?.replace("_", " ") || "Draft Preview"}
            </span>
            <span className="px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
              {renderArray(job.mode)}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
            {job.title || "Job Title"}
          </h1>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
              <MapPin size={14} className="text-slate-400" />{" "}
              <span className="truncate max-w-[200px]">{locationText}</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 capitalize">
              <Briefcase size={14} className="text-blue-500" />{" "}
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
                className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-3"
              >
                <Zap className="text-amber-500 shrink-0" size={16} />
                <p className="text-sm font-bold text-amber-900">{feature}</p>
              </div>
            ))}
          </div>
        )}

        {/* Compensation Card */}
        <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
            <IndianRupee size={12} /> Compensation
          </p>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {(() => {
                // FACT: Safely handle both Legacy Jobs and New Jobs
                const sMin =
                  Number(job.salaryMin) || Number(job.salaryAmount) || 0;
                const sMax =
                  Number(job.salaryMax) || Number(job.salaryAmount) || 0;

                if (sMin === 0 && sMax === 0) return "UNPAID";
                return `${job.salaryCurrency || "₹"} ${sMin.toLocaleString()} - ${sMax.toLocaleString()}`;
              })()}
            </span>
            <span className="text-xs font-bold text-emerald-700 uppercase">
              / {job.salaryFrequency || "Month"}
            </span>
          </div>
          {job.incentives?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {job.incentives.map((inc, i) => (
                <span
                  key={i}
                  className="bg-white/60 border border-emerald-200 px-2 py-1 rounded text-[10px] font-bold text-emerald-800"
                >
                  {inc}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Job Overview (Dates & Openings) */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
          <DetailRow
            icon={<CalendarDays size={14} className="text-blue-500" />}
            label="Start Date"
            value={
              job.startDate
                ? new Date(job.startDate).toLocaleDateString()
                : "TBD"
            }
          />
          <DetailRow
            icon={<Calendar size={14} className="text-rose-500" />}
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
              icon={<Timer size={14} className="text-orange-500" />}
              label="Duration"
              value={`${job.noOfDays || ""} ${job.durationType || "Days"}`}
            />
          )}
          {job.applicationDeadline && (
            <DetailRow
              icon={<Clock size={14} className="text-amber-500" />}
              label="Apply Before"
              value={new Date(job.applicationDeadline).toLocaleDateString()}
            />
          )}
          <DetailRow
            icon={<Users size={14} className="text-purple-500" />}
            label="Openings"
            value={`${job.noOfPeopleRequired || "TBD"} Position(s)`}
          />
        </div>

        {/* Schedule */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock size={12} /> Schedule
            </p>
            {job.isFlexibleShifts && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                Flexible
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-slate-800 mb-3">
            {job.workDaysPattern === "Custom"
              ? job.customWorkDaysDescription
              : job.workDaysPattern || renderArray(job.workDays)}
          </p>
          {job.shifts?.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                Expected Shift Timings
              </p>
              <div className="space-y-2">
                {job.shifts.map((shift, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-slate-50 p-3 border border-slate-200 rounded-xl"
                  >
                    <span className="text-xs font-bold text-slate-700">
                      {shift.shiftName}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                      {shift.startTime || "--:--"} - {shift.endTime || "--:--"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Candidate Profile */}
        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
          <h3 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-2">
            <UserCircle2 size={14} /> Candidate Profile
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-indigo-400 font-bold uppercase mb-0.5">
                <GraduationCap size={10} className="inline mr-1" /> Education
              </p>
              <p className="text-sm text-slate-700 font-bold leading-tight">
                {renderArray(job.qualifications)}
              </p>
              {job.courses?.length > 0 && (
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  ({job.courses.join(", ")})
                </p>
              )}
            </div>
            <div>
              <p className="text-[10px] text-indigo-400 font-bold uppercase mb-0.5">
                <Languages size={10} className="inline mr-1" /> Languages
              </p>
              <p className="text-sm text-slate-700 font-bold leading-tight">
                {renderArray(job.languages)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-indigo-400 font-bold uppercase mb-0.5">
                Age Limit
              </p>
              <p className="text-sm text-slate-700 font-bold leading-tight">
                {job.ageLimit?.isAny
                  ? "Any Age"
                  : job.ageLimit?.min
                    ? `${job.ageLimit.min}-${job.ageLimit.max} Yrs`
                    : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-indigo-400 font-bold uppercase mb-0.5">
                Gender
              </p>
              <p className="text-sm text-slate-700 font-bold leading-tight">
                {job.genderPreference || "No Preference"}
              </p>
            </div>
          </div>
        </div>

        {/* Required Skills */}
        {job.skillsRequired?.length > 0 && (
          <div>
            <h3 className="text-xs font-extrabold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={12} /> Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill, i) => (
                <span
                  key={i}
                  className="bg-slate-900 text-white px-3 py-1 rounded-md text-[10px] font-bold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Screening Questions */}
        {job.screeningQuestions?.length > 0 && (
          <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100">
            <h3 className="text-xs font-extrabold text-rose-900 mb-2 uppercase tracking-wider flex items-center gap-1">
              <HelpCircle size={12} /> Assessment
            </h3>
            <ul className="space-y-2">
              {job.screeningQuestions.map((q, i) => (
                <li
                  key={i}
                  className="text-xs font-medium text-slate-700 leading-tight"
                >
                  <span className="font-bold text-rose-500">Q{i + 1}.</span> {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Description & Responsibilities */}
        <div className="space-y-8 pb-6">
          {/* Job Summary */}
          <div>
            <h2 className="text-sm font-extrabold text-blue-900 bg-blue-100 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3 shadow-sm border border-blue-200">
              <Briefcase size={16} className="text-blue-700" /> Job Summary
            </h2>
            <div
              className="prose prose-sm max-w-none text-slate-600 leading-relaxed font-medium"
              dangerouslySetInnerHTML={{
                __html: job.jobSummary || job.description,
              }}
            />
          </div>

          {/* Key Responsibilities (With Aggressive Bullet Forcer) */}
          {(job.keyResponsibilities ||
            job.description?.includes("Key Responsibilities")) && (
            <div className="pt-6 border-t border-slate-100">
              <h2 className="text-sm font-extrabold text-purple-900 bg-purple-100 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3 shadow-sm border border-purple-200">
                <ListChecks size={16} className="text-purple-700" /> Key
                Responsibilities
              </h2>

              <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed font-medium prose-ul:list-disc prose-ul:pl-5 prose-li:marker:text-purple-500">
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

                  // FACT: The Aggressive HTML Stripper forces paragraphs/breaks into real bullet points
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

      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <button
          disabled
          className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={16} /> Apply Now (Preview)
        </button>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
          {icon}
        </div>
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <span
        className="text-slate-900 font-extrabold text-xs text-right truncate max-w-[50%]"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
