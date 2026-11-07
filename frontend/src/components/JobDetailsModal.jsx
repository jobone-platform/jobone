import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Bookmark,
  Share2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";
import CompanyDisplay from "./CompanyDisplay";
import ApplyModal from "./ApplyModal";
import { API_BASE_URL } from "../config/api";

export default function JobDetailsModal({ job, onClose }) {
  const navigate = useNavigate();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copyNotice, setCopyNotice] = useState(false);

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

  const isRemote =
    renderArray(job.mode).toLowerCase().includes("home") ||
    renderArray(job.mode).toLowerCase().includes("remote") ||
    job.mode === "Online";

  const displayLocation = isRemote
    ? "Remote / Distributed"
    : `${typeof job.location === "object" ? job.location?.address : job.location || "Location not specified"}${
        job.pinCode ? ` • ${job.pinCode}` : ""
      }`;

  const validFeatures =
    job.jobFeatures?.filter((f) => f && typeof f === "string" && f.trim() !== "") || [];

  const handleShare = async () => {
    const url = `${window.location.origin}/apply/${job._id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopyNotice(true);
      setTimeout(() => setCopyNotice(false), 2000);
    }
  };

  const handleToggleSave = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setIsSaved(!isSaved);
      return;
    }
    try {
      setSaveLoading(true);
      await axios.post(
        `${API_BASE_URL}/user/save-job`,
        { jobId: job._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSaved((prev) => !prev);
    } catch {
      setIsSaved((prev) => !prev);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-details-title"
          className="bg-surface-1 border border-border text-foreground w-full max-w-5xl max-h-[92vh] rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
        >
          {/* --- EDITORIAL HEADER --- */}
          <header className="p-5 sm:p-7 border-b border-border bg-surface-2/40 relative shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4 sm:gap-5 items-start min-w-0 flex-1">
                {/* Company Monogram / Logo */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-xl font-display font-bold text-foreground shrink-0 shadow-sm overflow-hidden">
                  {job.postedByImage ? (
                    <img
                      src={job.postedByImage}
                      alt="Company Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : job.postedByCompany ? (
                    job.postedByCompany.charAt(0).toUpperCase()
                  ) : job.postedByName ? (
                    job.postedByName.charAt(0).toUpperCase()
                  ) : (
                    <Building2 size={24} className="text-foreground/50" />
                  )}
                </div>

                <div className="min-w-0 flex-1 pr-6">
                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                        job.status === "active" || !job.status
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-surface-2 text-foreground/60 border-border"
                      }`}
                    >
                      {job.status?.replace("_", " ") || "Active Requisition"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-surface-2 text-foreground/80 border border-border">
                      {renderArray(job.mode)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-surface-2 text-foreground/80 border border-border">
                      {renderArray(job.jobType)}
                    </span>
                  </div>

                  <h1
                    id="job-details-title"
                    className="text-xl sm:text-2xl lg:text-3xl font-display font-bold tracking-tight text-foreground leading-tight truncate"
                  >
                    {job.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-foreground/60 mt-1.5 font-medium">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        if (job.postedBy) navigate(`/company/${job.postedBy}`);
                      }}
                      className="text-foreground hover:text-silver transition-colors cursor-pointer font-semibold flex items-center gap-1"
                    >
                      <CompanyDisplay job={job} fallback="Confidential Enterprise" />
                      <ShieldCheck size={13} className="text-silver" />
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-foreground/40 shrink-0" />
                      <span>{displayLocation}</span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock size={12} className="text-foreground/40 shrink-0" />
                      <span>Posted {new Date(job.postedAt || job.createdAt || Date.now()).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons: Share, Bookmark, Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share Job Link"
                  className="p-2 rounded-xl bg-surface-2 border border-border text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
                  title="Copy application link"
                >
                  <Share2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleToggleSave}
                  disabled={saveLoading}
                  aria-label="Save Job"
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isSaved
                      ? "bg-foreground text-background border-foreground"
                      : "bg-surface-2 border border-border text-foreground/70 hover:text-foreground"
                  }`}
                  title="Bookmark job"
                >
                  <Bookmark size={16} className={isSaved ? "fill-current" : ""} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close job details"
                  className="p-2 rounded-xl bg-surface-2 border border-border text-foreground/70 hover:text-foreground transition-colors cursor-pointer ml-1"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {copyNotice && (
              <div className="absolute bottom-2 right-6 px-3 py-1 rounded-lg bg-foreground text-background text-xs font-mono">
                Requisition link copied to clipboard
              </div>
            )}
          </header>

          {/* --- SCROLLABLE BODY --- */}
          <div className="overflow-y-auto p-5 sm:p-7 flex-1 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* --- MAIN EDITORIAL COLUMN (LEFT 2/3) --- */}
              <div className="lg:col-span-2 space-y-6">
                {/* Features & Highlights */}
                {validFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {validFeatures.map((feature, i) => (
                      <div
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-surface-2 border border-border flex items-center gap-2 text-xs font-medium text-foreground/90"
                      >
                        <Zap size={13} className="text-silver shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Candidate Profile Specification */}
                <section className="p-5 sm:p-6 rounded-2xl bg-surface-2/40 border border-border">
                  <h2 className="text-xs font-mono uppercase tracking-widest text-foreground/60 mb-4 flex items-center gap-2">
                    <UserCircle2 size={14} className="text-silver" />
                    <span>Candidate Profile & Eligibility</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <GraduationCap size={12} className="text-silver" /> Education
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        {renderArray(job.qualifications)}
                      </p>
                      {job.courses?.length > 0 && (
                        <p className="text-[11px] text-foreground/60 mt-0.5">
                          {job.courses.join(", ")}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Languages size={12} className="text-silver" /> Languages
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        {renderArray(job.languages)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Users size={12} className="text-silver" /> Age Limit
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        {job.ageLimit?.isAny
                          ? "Any Age"
                          : job.ageLimit?.min
                          ? `${job.ageLimit.min}–${job.ageLimit.max} Yrs`
                          : "Unspecified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <UserCircle2 size={12} className="text-silver" /> Gender
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        {job.genderPreference || "No Preference"}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Required Technical & Soft Skills */}
                {job.skillsRequired?.length > 0 && (
                  <section className="p-5 sm:p-6 rounded-2xl bg-surface-2/40 border border-border">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-foreground/60 mb-3 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-silver" />
                      <span>Required Competencies & Skills</span>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {job.skillsRequired.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-medium text-foreground tracking-wide"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Job Summary & Key Responsibilities */}
                <section className="p-5 sm:p-6 rounded-2xl bg-surface-2/40 border border-border space-y-6">
                  {/* Summary */}
                  <div>
                    <h2 className="text-xs font-mono uppercase tracking-widest text-foreground/60 mb-3 flex items-center gap-2">
                      <Briefcase size={14} className="text-silver" />
                      <span>Role Overview</span>
                    </h2>
                    <div
                      className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html:
                          job.jobSummary ||
                          (job.description
                            ? job.description
                                .split(/(?:Key Responsibilities:?|Key Responsibilities\n)/i)[0]
                                .replace(/(?:Job Summary:?|Job Summary\n)/i, "")
                                .trim()
                            : "No detailed description provided for this requisition."),
                      }}
                    />
                  </div>

                  {/* Key Responsibilities */}
                  {(job.keyResponsibilities ||
                    job.description?.includes("Key Responsibilities")) && (
                    <div className="pt-5 border-t border-border">
                      <h2 className="text-xs font-mono uppercase tracking-widest text-foreground/60 mb-3 flex items-center gap-2">
                        <ListChecks size={14} className="text-silver" />
                        <span>Core Deliverables & Responsibilities</span>
                      </h2>

                      <div className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans">
                        {(() => {
                          let respHtml = job.keyResponsibilities;
                          if (!respHtml && job.description) {
                            const parts = job.description.split(
                              /(?:Key Responsibilities:?|Key Responsibilities\n)/i
                            );
                            respHtml = parts[1] || "";
                          }

                          if (!respHtml) return null;

                          if (respHtml.includes("<li") || respHtml.includes("<ul")) {
                            return (
                              <div
                                className="prose dark:prose-invert max-w-none text-xs sm:text-sm [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:marker:text-silver"
                                dangerouslySetInnerHTML={{ __html: respHtml }}
                              />
                            );
                          }

                          const forcedBullets = respHtml
                            .replace(/<\/?(?:p|br|div)[^>]*>/gi, "\n")
                            .replace(/<[^>]+>/g, "")
                            .split("\n")
                            .map((line) => line.replace(/^[-*•]\s*/, "").trim())
                            .filter((line) => line.length > 5);

                          return (
                            <ul className="list-disc pl-5 space-y-1.5 marker:text-silver">
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

                {/* Screening Questions Preview */}
                {job.screeningQuestions?.length > 0 && (
                  <section className="p-5 sm:p-6 rounded-2xl bg-surface-2/40 border border-border">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-foreground/60 mb-2 flex items-center gap-2">
                      <HelpCircle size={14} className="text-silver" />
                      <span>Application Screening Questions</span>
                    </h2>
                    <p className="text-xs text-foreground/50 mb-3 font-sans">
                      You will be asked to respond to these assessment prompts during submission:
                    </p>
                    <ul className="space-y-2">
                      {job.screeningQuestions.map((q, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-2 border border-border text-xs text-foreground/80"
                        >
                          <span className="font-mono text-silver font-bold">0{i + 1}.</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              {/* --- SIDEBAR PANEL (RIGHT 1/3) --- */}
              <div className="space-y-6">
                {/* Compensation Card */}
                <section className="p-5 sm:p-6 rounded-2xl bg-foreground text-background shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-background/60">
                      Compensation Package
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-background/10 text-background">
                      {job.salaryFrequency || "Monthly"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
                      {(() => {
                        const sMin = Number(job.salaryMin) || Number(job.salaryAmount) || 0;
                        const sMax = Number(job.salaryMax) || Number(job.salaryAmount) || 0;

                        if (sMin === 0 && sMax === 0) return "Competitive / Disclosed on Review";
                        return `${job.salaryCurrency || "₹"}${sMin.toLocaleString()} – ${sMax.toLocaleString()}`;
                      })()}
                    </div>
                    <p className="text-[11px] text-background/70 mt-1 font-mono">
                      Verified pay bracket • Benchmarked by JobOne
                    </p>
                  </div>

                  {job.incentives?.length > 0 && (
                    <div className="pt-3 border-t border-background/20">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-background/70 mb-2">
                        Perks & Benefits
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {job.incentives.map((inc, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[11px] bg-background/10 text-background"
                          >
                            {inc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* Schedule & Working Hours */}
                <section className="p-5 sm:p-6 rounded-2xl bg-surface-2/40 border border-border">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-foreground/60 flex items-center gap-1.5">
                      <Clock size={13} className="text-silver" />
                      <span>Shift & Schedule</span>
                    </h3>
                    {job.isFlexibleShifts && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-2 border border-border text-silver">
                        Flexible
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-wider mb-1">
                        Working Cadence
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {job.workDaysPattern === "Custom"
                          ? job.customWorkDaysDescription
                          : job.workDaysPattern || renderArray(job.workDays)}
                      </p>
                    </div>

                    {job.shifts?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-wider mb-1.5">
                          Standard Shifts
                        </p>
                        <div className="space-y-1.5">
                          {job.shifts.map((shift, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2 rounded-lg bg-surface-2 border border-border text-xs"
                            >
                              <span className="font-medium text-foreground truncate mr-2">
                                {shift.shiftName}
                              </span>
                              <span className="font-mono text-[11px] text-foreground/70 shrink-0">
                                {shift.startTime || "--:--"} – {shift.endTime || "--:--"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Key Timelines & Headcount */}
                <section className="p-5 sm:p-6 rounded-2xl bg-surface-2/40 border border-border">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-foreground/60 mb-3 pb-2 border-b border-border">
                    Requisition Overview
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/60 flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-silver" /> Target Start
                      </span>
                      <span className="font-semibold text-foreground">
                        {job.startDate ? new Date(job.startDate).toLocaleDateString() : "Immediate"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-foreground/60 flex items-center gap-1.5">
                        <Timer size={13} className="text-silver" /> Engagement Type
                      </span>
                      <span className="font-semibold text-foreground">
                        {job.isLongTerm ? "Full-Time Long Term" : job.durationType || "Permanent"}
                      </span>
                    </div>

                    {job.applicationDeadline && (
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/60 flex items-center gap-1.5">
                          <Clock size={13} className="text-silver" /> Application Close
                        </span>
                        <span className="font-semibold text-foreground font-mono">
                          {new Date(job.applicationDeadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-foreground/60 flex items-center gap-1.5">
                        <Users size={13} className="text-silver" /> Open Positions
                      </span>
                      <span className="font-semibold text-foreground font-mono">
                        {job.noOfPeopleRequired || 1} Requisition(s)
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* --- FOOTER ACTION BAR --- */}
          <footer className="p-4 sm:p-6 bg-surface-2/60 border-t border-border flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-foreground/70 hover:text-foreground hover:bg-surface-2 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate(`/apply/${job._id}`)}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-foreground/80 hover:text-foreground hover:bg-surface-2 text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Full Application Page</span>
                <ExternalLink size={13} />
              </button>

              <button
                type="button"
                onClick={() => setShowApplyModal(true)}
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-foreground text-background font-semibold text-xs sm:text-sm flex items-center gap-2 hover:opacity-90 active:scale-[0.99] transition shadow-md cursor-pointer"
              >
                <Send size={15} />
                <span>Apply for Position</span>
              </button>
            </div>
          </footer>
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
