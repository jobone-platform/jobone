import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  Users,
  Briefcase,
  CheckCircle2,
  CalendarDays,
  Zap,
  GraduationCap,
  Languages,
  UserCircle2,
  X,
  Building2,
  Send,
  ListChecks,
  HelpCircle,
  Timer,
  Hash,
  Activity,
  Building,
} from "lucide-react";
import axios from "axios";
import CompanyDisplay from "./CompanyDisplay";
import ApplyModal from "./ApplyModal";

export default function JobDetailsModal({ job, onClose }) {
  const navigate = useNavigate();
  const [showApplyModal, setShowApplyModal] = useState(false);

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

  const isRemote =
    renderArray(job.mode).toLowerCase().includes("home") ||
    job.mode === "Online";

  // FACT: Added pinCode to the location render
  const displayLocation = isRemote
    ? "Remote"
    : `${typeof job.location === "object" ? job.location?.address : job.location || "Location not specified"}${job.pinCode ? ` - ${job.pinCode}` : ""}`;

  const validFeatures =
    job.jobFeatures?.filter((f) => f && f.trim() !== "") || [];

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 sm:bg-slate-900/60 sm:backdrop-blur-sm p-4 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#F8FAFC] w-full max-w-6xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
        >
          {/* --- PREMIUM HEADER --- */}
          <header className="bg-white p-4 sm:p-6 border-b border-slate-200 shadow-sm flex flex-row justify-between items-start gap-3 relative shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none -mt-20 -mr-20"></div>

            <div className="relative z-10 flex gap-3 sm:gap-5 items-center w-full pr-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0 text-indigo-600 font-extrabold shadow-sm">
                {job.postedByImage ? (
                  <img
                    src={job.postedByImage}
                    alt="Company"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : job.postedByCompany ? (
                  job.postedByCompany.charAt(0)
                ) : job.postedByName ? (
                  job.postedByName.charAt(0)
                ) : (
                  <Building2 size={24} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="hidden sm:flex flex-wrap items-center gap-1.5 mb-1.5">
                  {/* FACT: Added Status and Posting Date to the UI */}
                  <span
                    className={`px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest border ${job.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"}`}
                  >
                    {job.status?.replace("_", " ") || "Active"}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100 truncate max-w-[120px] sm:max-w-none">
                    {renderArray(job.mode)}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 truncate max-w-[100px] sm:max-w-none">
                    {renderArray(job.jobType)}
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center text-slate-500 text-[10px] sm:text-xs font-bold gap-2 mt-1">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      if (job.postedBy) navigate(`/company/${job.postedBy}`);
                    }}
                    className="text-slate-700 hover:text-indigo-600 hover:underline cursor-pointer truncate max-w-[120px]"
                  >
                    <CompanyDisplay job={job} fallback="Confidential Employer" />
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                  <span className="flex items-center gap-1 truncate max-w-[100px] sm:max-w-none">
                    <MapPin size={10} className="text-slate-400 shrink-0" />{" "}
                    {displayLocation}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock size={10} className="text-slate-400" />
                    {new Date(job.postedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-20"
            >
              <X size={16} />
            </button>
          </header>

          {/* --- SCROLLABLE BODY --- */}
          <div className="overflow-y-auto custom-scrollbar p-3 sm:p-6 flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* --- MAIN CONTENT (LEFT) --- */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                
                {/* Mobile-only Status Badges */}
                <div className="flex sm:hidden flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-widest border ${job.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"}`}
                  >
                    {job.status?.replace("_", " ") || "Active"}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {renderArray(job.mode)}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                    {renderArray(job.jobType)}
                  </span>
                </div>
                {/* Job Highlights */}
                {validFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {validFeatures.map((feature, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 sm:gap-2 shadow-sm w-fit"
                      >
                        <Zap className="text-amber-500 shrink-0" size={14} />
                        <p className="text-[10px] sm:text-xs font-bold text-amber-900 leading-none m-0">
                          {feature}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Candidate Requirements */}
                <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <UserCircle2 size={18} />
                    </div>{" "}
                    Candidate Profile
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                    <div className="flex flex-col">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                        <GraduationCap size={12} className="text-indigo-400" />{" "}
                        Education
                      </p>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        {renderArray(job.qualifications)}
                        {job.courses?.length > 0 && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            ({job.courses.join(", ")})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
                    <div className="flex flex-col">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                        <Languages size={12} className="text-indigo-400" />{" "}
                        Languages
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {renderArray(job.languages)}
                      </p>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
                    <div className="flex flex-col">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                        <Users size={12} className="text-indigo-400" /> Age
                        Limit
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {job.ageLimit?.isAny
                          ? "Any Age"
                          : job.ageLimit?.min
                            ? `${job.ageLimit.min}-${job.ageLimit.max} Yrs`
                            : "Not Specified"}
                      </p>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
                    <div className="flex flex-col">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                        <UserCircle2 size={12} className="text-indigo-400" />{" "}
                        Gender
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {job.genderPreference || "No Preference"}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Required Skills */}
                {job.skillsRequired?.length > 0 && (
                  <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-4 flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <CheckCircle2 size={18} />
                      </div>{" "}
                      Required Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {job.skillsRequired.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 text-white rounded-xl text-[10px] sm:text-xs font-bold shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Description Split */}
                <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
                  {/* Job Summary */}
                  <div>
                    <h2 className="text-xs sm:text-sm font-extrabold text-blue-900 bg-blue-100 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-3 shadow-sm border border-blue-200">
                      <Briefcase size={14} className="text-blue-700" />
                      Job Summary
                    </h2>
                    <div
                      className="text-[11px] sm:text-sm max-w-none text-slate-600 leading-relaxed font-medium"
                      dangerouslySetInnerHTML={{
                        // FACT: Safely displays new jobSummary, OR cleanly slices the top half of an old legacy description
                        __html:
                          job.jobSummary ||
                          (job.description
                            ? job.description
                                .split(
                                  /(?:Key Responsibilities:?|Key Responsibilities\n)/i,
                                )[0]
                                .replace(/(?:Job Summary:?|Job Summary\n)/i, "")
                                .trim()
                            : ""),
                      }}
                    />
                  </div>

                  {/* Key Responsibilities */}
                  {(job.keyResponsibilities ||
                    job.description?.includes("Key Responsibilities")) && (
                    <div className="pt-4 sm:pt-6 border-t border-slate-100">
                      <h2 className="text-xs sm:text-sm font-extrabold text-purple-900 bg-purple-100 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-3 shadow-sm border border-purple-200">
                        <ListChecks size={14} className="text-purple-700" /> Key
                        Responsibilities
                      </h2>

                      <div className="text-[11px] sm:text-sm max-w-none text-slate-600 leading-relaxed font-medium [&>ul]:list-disc [&>ul]:pl-4 [&>ul>li]:marker:text-purple-500">
                        {(() => {
                          let respHtml = job.keyResponsibilities;

                          // Fallback for legacy database entries
                          if (!respHtml && job.description) {
                            const parts = job.description.split(
                              /(?:Key Responsibilities:?|Key Responsibilities\n)/i,
                            );
                            respHtml = parts[1] || "";
                          }

                          if (!respHtml) return null;

                          // If it ALREADY has legitimate HTML bullet points from the editor, render normally.
                          if (
                            respHtml.includes("<li") ||
                            respHtml.includes("<ul")
                          ) {
                            return (
                              <div
                                dangerouslySetInnerHTML={{ __html: respHtml }}
                              />
                            );
                          }

                          // FACT: The Aggressive HTML Stripper
                          // This hunts down <p>, <br>, and <div> tags, turns them into \n, and forces a bullet list.
                          const forcedBullets = respHtml
                            .replace(/<\/?(?:p|br|div)[^>]*>/gi, "\n") // Force breaks/paragraphs into \n
                            .replace(/<[^>]+>/g, "") // Strip any remaining formatting tags
                            .split("\n")
                            .map((line) => line.replace(/^[-*•]\s*/, "").trim()) // Remove manual hyphens
                            .filter((line) => line.length > 5); // Ignore empty blank lines

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

                {/* FACT: New Assessment / Screening Questions Section (Desktop Only) */}
                {job.screeningQuestions?.length > 0 && (
                  <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hidden lg:block">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-4 flex items-center gap-3">
                      <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                        <HelpCircle size={18} />
                      </div>{" "}
                      Application Assessment
                    </h2>
                    <p className="text-xs font-bold text-slate-500 mb-4">
                      You will be required to answer the following questions
                      during the application process:
                    </p>
                    <ul className="space-y-3">
                      {job.screeningQuestions.map((q, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 sm:gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] sm:text-sm font-medium text-slate-700"
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
              </div>

              {/* --- SIDEBAR DETAILS (RIGHT) --- */}
              <div className="lg:col-span-1 space-y-6">
                {/* Premium Compensation Card */}
                <section className="bg-slate-900 rounded-3xl p-5 sm:p-8 shadow-xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-6 relative z-10">
                    Compensation
                  </h3>
                  <div className="relative z-10">
                    <p className="text-slate-400 text-[9px] sm:text-[10px] font-bold mb-1 uppercase tracking-wide flex items-center gap-1.5">
                      <IndianRupee size={12} /> Total Salary
                    </p>
                    <div className="flex items-baseline gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                      {/* FACT: Render the dynamic currency symbol and range properly */}
                      <span className="text-xl sm:text-3xl font-extrabold tracking-tight">
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
                    <div className="bg-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-white/10 flex justify-between items-center text-[10px] sm:text-sm font-bold backdrop-blur-md">
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

                {/* Schedule & Timings */}
                <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-5 sm:mb-6 border-b border-slate-100 pb-3">
                    <h3 className="text-[10px] sm:text-xs font-extrabold text-slate-800 flex items-center gap-2">
                      <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
                        <Clock size={16} />
                      </div>{" "}
                      Schedule
                    </h3>
                    {job.isFlexibleShifts && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 font-bold text-[10px] uppercase tracking-wider rounded-lg border border-blue-100">
                        Flexible
                      </span>
                    )}
                  </div>

                  <div className="mb-5 sm:mb-6">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                      Working Days
                    </p>
                    <div className="inline-block px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                      {job.workDaysPattern === "Custom"
                        ? job.customWorkDaysDescription
                        : job.workDaysPattern || renderArray(job.workDays)}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                    Standard Shift Timings
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {job.shifts?.map((shift, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <span className="font-bold text-slate-800 text-xs truncate mr-2">
                          {shift.shiftName}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-1 border border-slate-200 rounded-md shadow-sm shrink-0">
                          {shift.startTime || "--:--"} -{" "}
                          {shift.endTime || "--:--"}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* FACT: Comprehensive Job Overview mapping ALL timeline variables */}
                <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-5 sm:mb-6 border-b border-slate-100 pb-3">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Job Overview
                    </h3>
                    {job.isFlexibleDuration && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                        Flexible Dates
                      </span>
                    )}
                  </div>
                  <div className="space-y-4">
                    <DetailRow
                      icon={
                        <CalendarDays size={16} className="text-blue-500" />
                      }
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
                          ? "Long Term"
                          : job.endDate
                            ? new Date(job.endDate).toLocaleDateString()
                            : "TBD"
                      }
                    />

                    {/* Render specific duration details if provided */}
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
                    {job.expiringAt && (
                      <DetailRow
                        icon={<Activity size={16} className="text-rose-500" />}
                        label="Listing Expires"
                        value={new Date(job.expiringAt).toLocaleDateString()}
                      />
                    )}
                    <div className="h-px bg-slate-100 my-2"></div>
                    <DetailRow
                      icon={<Users size={16} className="text-purple-500" />}
                      label="Openings"
                      value={`${job.noOfPeopleRequired} Position(s)`}
                    />
                  </div>
                </section>

                {/* FACT: Assessment / Screening Questions Section (Mobile Only - Placed at bottom) */}
                {job.screeningQuestions?.length > 0 && (
                  <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm block lg:hidden mt-4">
                    <h2 className="text-sm sm:text-lg font-extrabold text-slate-800 mb-3 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
                        <HelpCircle size={16} />
                      </div>{" "}
                      Application Assessment
                    </h2>
                    <p className="text-[10px] font-bold text-slate-500 mb-3">
                      You will be required to answer the following questions during the application process:
                    </p>
                    <ul className="space-y-2">
                      {job.screeningQuestions.map((q, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] sm:text-sm font-medium text-slate-700"
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
              </div>
            </div>
          </div>

          {/* --- FOOTER ACTION --- */}
          <div className="p-3 sm:p-6 bg-white border-t border-slate-200 shrink-0 flex justify-end items-center gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2.5 sm:px-6 sm:py-3 text-[13px] sm:text-base font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowApplyModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 sm:px-8 sm:py-3 rounded-xl text-[13px] sm:text-base font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              <Send size={16} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> Apply for this Job
            </button>
          </div>
        </motion.div>
      </div>

      {showApplyModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setShowApplyModal(false);
            onClose();
            alert("Application submitted successfully!");
            navigate("/myapplications");
          }}
        />
      )}
    </>
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
