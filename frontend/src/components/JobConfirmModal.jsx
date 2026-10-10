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
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#F8FAFC] w-full max-w-6xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
      >
        {/* --- CONFIRMATION HEADER --- */}
        <div className="bg-slate-900 px-6 sm:px-8 py-5 flex justify-between items-center text-white shrink-0 border-b border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
              <CheckCircle2 className="text-emerald-400" size={24} /> Final
              Review & Publish
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
              This is exactly how candidates will see your posting. Review
              carefully.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={24} className="text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* --- SCROLLABLE BODY --- */}
        <div className="overflow-y-auto custom-scrollbar flex-1 p-6 sm:p-8 space-y-8">
          {/* Top Info block */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                Ready to Post
              </span>
              <span className="px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                {modeStr}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight leading-tight">
              {job.title || "Untitled Job"}
            </h1>
            <p className="text-indigo-600 font-bold flex items-center gap-2 mb-4">
              <CompanyDisplay job={job} fallback={employerProfileName || "Confidential Employer"} />
            </p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* --- MAIN CONTENT (LEFT) --- */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Highlights */}
              {validFeatures.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {validFeatures.map((feature, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3 shadow-sm"
                    >
                      <div className="p-2 bg-amber-100/50 rounded-lg shrink-0">
                        <Zap className="text-amber-500" size={18} />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-amber-900 mt-0.5 leading-snug">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Candidate Profile */}
              <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <UserCircle2 size={18} />
                  </div>{" "}
                  Candidate Profile
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-[10px] text-indigo-400 font-bold uppercase mb-0.5">
                      <Target size={10} className="inline mr-1" /> Experience
                    </p>
                    <p className="text-sm text-slate-800 font-bold">
                      {renderExperience()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mb-1">
                      <GraduationCap size={12} className="text-indigo-400" />{" "}
                      Education
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {renderArray(job.qualifications)}
                      {job.courses?.length > 0 && (
                        <span className="block text-[11px] text-slate-500 font-medium">
                          ({job.courses.join(", ")})
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mb-1">
                      <Languages size={12} className="text-indigo-400" />{" "}
                      Languages
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {renderArray(job.languages)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mb-1">
                      <UserCircle2 size={12} className="text-indigo-400" />{" "}
                      Demographics
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {job.ageLimit?.isAny
                        ? "Any Age"
                        : job.ageLimit?.min
                          ? `${job.ageLimit.min}-${job.ageLimit.max} Yrs`
                          : "Age not set"}
                      <span className="text-slate-400 mx-1">|</span>
                      {job.genderPreference || "No Pref"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Required Skills */}
              {job.skillsRequired?.length > 0 && (
                <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-base font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-4 flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                      <CheckCircle2 size={18} />
                    </div>{" "}
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Screening Questions */}
              {job.screeningQuestions?.length > 0 && (
                <section className="bg-rose-50/50 rounded-3xl p-6 border border-rose-100">
                  <h2 className="text-base font-extrabold text-rose-900 mb-4 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-rose-600 shadow-sm">
                      <HelpCircle size={18} />
                    </div>{" "}
                    Assessment Questions
                  </h2>
                  <ul className="space-y-3">
                    {job.screeningQuestions.map((q, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 bg-white p-4 rounded-xl border border-rose-100 text-sm font-medium text-slate-700 shadow-sm"
                      >
                        <span className="font-extrabold text-rose-500">
                          Q{i + 1}.
                        </span>{" "}
                        {q}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Description Split */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-blue-900 bg-blue-100 inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-4 shadow-sm border border-blue-200">
                    <Briefcase size={18} className="text-blue-700" /> Job
                    Summary
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-slate-600 leading-relaxed font-medium"
                    dangerouslySetInnerHTML={{ __html: summary }}
                  />
                </div>

                {responsibilities && (
                  <div className="pt-6 border-t border-slate-100">
                    <h2 className="text-sm sm:text-base font-extrabold text-purple-900 bg-purple-100 inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-4 shadow-sm border border-purple-200">
                      <ListChecks size={18} className="text-purple-700" /> Key
                      Responsibilities
                    </h2>

                    <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed font-medium prose-ul:list-disc prose-ul:pl-5 prose-li:marker:text-purple-500">
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
              <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5 sm:mb-6 relative z-10">
                  Compensation
                </h3>
                <div className="relative z-10">
                  <p className="text-slate-400 text-[10px] font-bold mb-1 uppercase tracking-wide flex items-center gap-1.5">
                    <IndianRupee size={12} /> Total Salary
                  </p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2 mb-5 sm:mb-6">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
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
                  <div className="bg-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10 flex justify-between items-center text-xs sm:text-sm font-bold backdrop-blur-md">
                    <span className="text-slate-300">Frequency</span>
                    <span className="text-emerald-400 uppercase tracking-wider">
                      {job.salaryFrequency || "Monthly"}
                    </span>
                  </div>
                  {job.incentives?.length > 0 && (
                    <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-white/10">
                      <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Zap size={12} /> Perks & Benefits
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.incentives.map((inc, i) => (
                          <span
                            key={i}
                            className="bg-white/10 border border-white/5 px-2 py-1 rounded text-xs text-slate-200"
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
              <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Timeline & Openings
                  </h3>
                  {job.isFlexibleDuration && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                      Flexible
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  <DetailRow
                    icon={<CalendarDays size={16} className="text-blue-500" />}
                    label="Start Date"
                    value={
                      job.startDate
                        ? new Date(job.startDate).toLocaleDateString()
                        : "TBD"
                    }
                  />
                  <DetailRow
                    icon={<Calendar size={16} className="text-rose-500" />}
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
                      icon={<Timer size={16} className="text-orange-500" />}
                      label="Duration"
                      value={`${job.noOfDays || ""} ${job.durationType || "Days"}`}
                    />
                  )}
                  {job.applicationDeadline && (
                    <>
                      <div className="h-px bg-slate-100 my-2"></div>
                      <DetailRow
                        icon={<Clock size={16} className="text-amber-500" />}
                        label="Apply Before"
                        value={new Date(
                          job.applicationDeadline,
                        ).toLocaleDateString()}
                      />
                    </>
                  )}
                  <div className="h-px bg-slate-100 my-2"></div>
                  <DetailRow
                    icon={<Users size={16} className="text-purple-500" />}
                    label="Openings"
                    value={`${job.noOfPeopleRequired} Position(s)`}
                  />
                </div>
              </section>

              {/* Schedule */}
              <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={12} /> Schedule
                  </h3>
                  {job.isFlexibleShifts && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100">
                      Flexible
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                    Working Days
                  </p>
                  <div className="inline-block px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                    {job.workDaysPattern === "Custom"
                      ? job.customWorkDaysDescription
                      : job.workDaysPattern || renderArray(job.workDays)}
                  </div>
                </div>
                {!job.isFlexibleShifts && job.shifts?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                      Shift Timings
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
        <div className="p-4 sm:p-6 bg-white border-t border-slate-200 shrink-0 flex justify-end items-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Go Back & Edit
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
          {icon}
        </div>
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <span
        className="text-slate-900 font-extrabold text-xs sm:text-sm text-right truncate max-w-[45%]"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
