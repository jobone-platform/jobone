import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  HelpCircle,
  Timer,
  Activity,
  XCircle,
  AlertCircle,
  MessageSquare,
  FileText,
  Globe,
  CalendarClock,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Video,
  Search,
} from "lucide-react";
import CompanyDisplay from "./CompanyDisplay";

export default function ApplicationDetailsModal({ application, onClose }) {
  const navigate = useNavigate();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    reason: "",
    proposedTime: "",
  });
  const [rescheduleStatus, setRescheduleStatus] = useState("idle"); // idle, loading, success, error
  const [rescheduleFeedback, setRescheduleFeedback] = useState("");

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

  if (!application) return null;

  const {
    job = {},
    status,
    appliedAt,
    employerMessage,
    meetingLink,
    _id: rawAppId,
    applicationId: mappedAppId,
    applicantMessage,
    screeningAnswers,
  } = application;

  const resolvedAppId = mappedAppId || rawAppId;

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleData.reason || !rescheduleData.proposedTime) return;

    setRescheduleStatus("loading");
    setRescheduleFeedback("");

    try {
      const storedUser = localStorage.getItem("userInfo");
      const token = JSON.parse(storedUser)?.token || localStorage.getItem("userToken");

      await axios.post(
        `${API_BASE_URL}/applications/${resolvedAppId}/reschedule`,
        rescheduleData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRescheduleStatus("success");
      setRescheduleFeedback(
        "Reschedule request sent successfully! The employer will be notified."
      );

      setTimeout(() => {
        setIsRescheduling(false);
        setRescheduleStatus("idle");
      }, 4000);
    } catch (err) {
      console.error("Reschedule Error:", err);
      setRescheduleStatus("error");
      setRescheduleFeedback(
        err.response?.data?.message || "Failed to send request. Please try again."
      );
    }
  };

  const getStatusUI = (st) => {
    const s = (st || "").toLowerCase();
    if (s === "hired") {
      return {
        color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        icon: <CheckCircle2 size={20} />,
        title: "Candidate Selected — Offer Extended",
        message: "Congratulations! The hiring team has accepted your application and moved forward to hire.",
      };
    }
    if (s === "nctt" || s === "rejected") {
      return {
        color: "bg-destructive/10 text-destructive border-destructive/20",
        icon: <XCircle size={20} />,
        title: "Not Considered at this Stage",
        message: "The employer has chosen to proceed with other candidates whose profiles align more closely with current requisition requirements.",
      };
    }
    if (s.includes("interview")) {
      return {
        color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        icon: <Calendar size={20} />,
        title: "Interview Round Scheduled",
        message: "You have been shortlisted for an interview! Review the schedule and meeting access details below.",
      };
    }
    if (s === "assignment scheduled") {
      return {
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        icon: <FileText size={20} />,
        title: "Technical Assessment Assigned",
        message: "The employer has assigned a skills exercise. Review the instructions provided in their message.",
      };
    }
    if (s === "shortlisted") {
      return {
        color: "bg-silver/20 text-foreground border-silver/40",
        icon: <Zap size={20} />,
        title: "Profile Shortlisted by Hiring Manager",
        message: "Your profile has passed primary recruiter screening and is in active review by the hiring manager.",
      };
    }
    return {
      color: "bg-surface-elevated text-foreground border-border",
      icon: <Clock size={20} />,
      title: "Application Delivered & Under Review",
      message: "Your application dossier has been received and is queued for talent review.",
    };
  };

  const statusUI = getStatusUI(status);

  const renderArray = (val) => {
    if (!val) return "Not specified";
    if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "Not specified";
    return String(val);
  };

  const modeStr = renderArray(job.mode);
  const isRemote = modeStr.toLowerCase().includes("home") || modeStr === "Online";
  const displayLocation = isRemote
    ? "Remote"
    : `${typeof job.location === "object" ? job.location?.address : job.location || "Office"}${
        job.pinCode ? ` - ${job.pinCode}` : ""
      }`;

  const _validFeatures = job.jobFeatures?.filter((f) => f && f.trim() !== "") || [];
  const companyName = job.postedByCompany || job.postedByName || "Verified Employer";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-details-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-border text-foreground w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200"
      >
        {/* --- HEADER --- */}
        <header className="p-6 sm:p-8 border-b border-border bg-surface-elevated/40 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative shrink-0">
          <div className="flex gap-4 sm:gap-5 items-center w-full">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-xl shrink-0 text-silver font-bold font-mono uppercase shadow-xs">
              {job.postedByImage ? (
                <img
                  src={job.postedByImage}
                  alt={companyName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                companyName[0] || <Building2 size={24} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-silver/10 text-silver border border-silver/20">
                  {status || "APPLIED"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-surface border border-border text-muted-foreground">
                  {modeStr}
                </span>
              </div>

              <h2
                id="app-details-title"
                className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate"
              >
                {job.title}
              </h2>

              <div className="flex flex-wrap items-center text-muted-foreground text-xs font-mono gap-3 mt-1">
                <span className="font-semibold text-foreground truncate">{companyName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-silver" /> {displayLocation}
                </span>
                <span>•</span>
                <span>Applied {new Date(appliedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close application details"
            className="absolute top-6 right-6 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        {/* --- SCROLLABLE BODY --- */}
        <div className="overflow-y-auto p-5 sm:p-8 flex-1 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* LEFT 2 COLS: STATUS, INTERVIEWS & NOTES */}
            <div className="lg:col-span-2 space-y-6">
              {/* Application Status Alert Block */}
              <div className={`p-5 sm:p-6 rounded-2xl border shadow-xs space-y-3 ${statusUI.color}`}>
                <div className="flex items-center gap-2.5 font-bold text-sm tracking-tight">
                  {statusUI.icon}
                  <span>{statusUI.title}</span>
                </div>
                <p className="text-xs font-medium leading-relaxed opacity-90 pl-7">
                  {statusUI.message}
                </p>

                {/* Interview Meeting Link & Reschedule Controls */}
                {(status || "").toLowerCase().includes("interview") && (
                  <div className="pl-7 pt-2 flex flex-wrap items-center gap-3">
                    {meetingLink && (
                      <a
                        href={meetingLink.startsWith("http") ? meetingLink : `https://${meetingLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white text-xs font-bold hover:bg-purple-600 transition-colors shadow-sm"
                      >
                        <Video size={14} /> Launch Interview Room
                      </a>
                    )}

                    {application.rescheduleRequest?.isRequested ? (
                      <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-surface border border-border text-muted-foreground">
                        Reschedule Status: {application.rescheduleRequest.requestStatus?.toUpperCase() || "PENDING"} (
                        {application.rescheduleRequest.proposedTime})
                      </span>
                    ) : !isRescheduling ? (
                      <button
                        type="button"
                        onClick={() => setIsRescheduling(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-elevated text-xs font-semibold transition-colors"
                      >
                        <CalendarClock size={14} /> Request Reschedule
                      </button>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Reschedule Form */}
              {isRescheduling && (
                <div className="p-5 rounded-2xl border border-border bg-surface-elevated space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                      <CalendarClock size={15} className="text-silver" /> Propose New Interview Time
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>

                  {rescheduleStatus === "success" ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 size={16} /> {rescheduleFeedback}
                    </div>
                  ) : (
                    <form onSubmit={handleRescheduleSubmit} className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="block font-bold text-muted-foreground">
                          Reason for Reschedule Request *
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={rescheduleData.reason}
                          onChange={(e) =>
                            setRescheduleData({ ...rescheduleData, reason: e.target.value })
                          }
                          placeholder="Please explain the scheduling conflict..."
                          className="w-full p-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-silver focus:ring-1 focus:ring-silver/40 transition-all resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold text-muted-foreground">
                          Proposed Date & Time *
                        </label>
                        <input
                          type="text"
                          required
                          value={rescheduleData.proposedTime}
                          onChange={(e) =>
                            setRescheduleData({ ...rescheduleData, proposedTime: e.target.value })
                          }
                          placeholder="E.g., Friday, Nov 7 at 3:00 PM IST"
                          className="w-full p-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-silver focus:ring-1 focus:ring-silver/40 transition-all"
                        />
                      </div>

                      {rescheduleStatus === "error" && (
                        <p className="text-destructive text-xs">{rescheduleFeedback}</p>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={rescheduleStatus === "loading"}
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-foreground text-background font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {rescheduleStatus === "loading" ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CalendarClock size={14} />
                          )}
                          Send Reschedule Request
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Employer Message Card */}
              {employerMessage && (
                <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface-elevated space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <MessageSquare size={14} className="text-silver" /> Direct Update from Employer
                  </div>
                  <div className="p-4 rounded-xl bg-surface border border-border text-xs leading-relaxed text-foreground whitespace-pre-wrap pl-4 border-l-2 border-silver">
                    {employerMessage}
                  </div>
                </div>
              )}

              {/* Screening Answers Card */}
              {screeningAnswers && screeningAnswers.length > 0 && (
                <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface-elevated space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <HelpCircle size={14} className="text-silver" /> Submitted Screening Responses
                  </div>
                  <div className="space-y-2.5">
                    {screeningAnswers.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-surface border border-border space-y-1 text-xs">
                        <p className="font-bold text-foreground">
                          Q{idx + 1}: {item.question}
                        </p>
                        <p className="text-muted-foreground pl-3 border-l-2 border-silver">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Candidate Pitch / Cover Note */}
              {applicantMessage && (
                <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface-elevated space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <FileText size={14} className="text-silver" /> Your Submitted Pitch Note
                  </div>
                  <p className="p-4 rounded-xl bg-surface border border-border text-xs leading-relaxed text-foreground whitespace-pre-wrap pl-4 border-l-2 border-silver">
                    {applicantMessage}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT 1 COL: JOB SPECIFICATIONS DOSSIER */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-border bg-surface-elevated space-y-4 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-foreground font-mono text-[11px]">
                  Requisition Overview
                </h4>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">Compensation</span>
                    <p className="font-bold text-sm text-foreground font-mono mt-0.5">
                      {job.salary ? `₹${Number(job.salary).toLocaleString()}` : "TBD / Flexible"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">Work Arrangement</span>
                    <p className="font-bold text-foreground mt-0.5">{modeStr}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">Employment Type</span>
                    <p className="font-bold text-foreground mt-0.5">{renderArray(job.jobType)}</p>
                  </div>

                  {job.experienceLevel && (
                    <div>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground">Experience Bracket</span>
                      <p className="font-bold text-foreground mt-0.5">{job.experienceLevel}</p>
                    </div>
                  )}

                  {job.skillsRequired && (
                    <div>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground">Skills Evaluated</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(Array.isArray(job.skillsRequired)
                          ? job.skillsRequired
                          : String(job.skillsRequired).split(",")
                        ).map((sk, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-surface border border-border text-[11px] font-mono text-silver"
                          >
                            {sk.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action: View Original Requisition */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/jobs?q=${encodeURIComponent(job.title || "")}`);
                }}
                className="w-full py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold text-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                <Search size={14} /> Search Similar Roles
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
