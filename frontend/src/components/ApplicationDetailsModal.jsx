import React, { useState, useEffect } from "react";
import axios from "axios";
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
  LogOut,
} from "lucide-react";
import CompanyDisplay from "./CompanyDisplay";

export default function ApplicationDetailsModal({ application, onClose }) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    reason: "",
    proposedTime: "",
  });
  const [rescheduleStatus, setRescheduleStatus] = useState("idle"); // idle, loading, success, error
  const [rescheduleFeedback, setRescheduleFeedback] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!application) return null;

  const {
    job = {},
    status,
    appliedAt,
    employerMessage,
    meetingLink,
    _id: applicationId,
    applicantMessage,
    screeningAnswers,
  } = application;

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleData.reason || !rescheduleData.proposedTime) return;

    setRescheduleStatus("loading");
    setRescheduleFeedback("");

    try {
      const storedUser = localStorage.getItem("userInfo");
      const token = JSON.parse(storedUser)?.token;

      await axios.post(
        `https://jobone-mrpy.onrender.com/applications/${applicationId}/reschedule`,
        rescheduleData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setRescheduleStatus("success");
      setRescheduleFeedback(
        "Reschedule request sent successfully! The employer will be notified.",
      );

      // Reset after a few seconds
      setTimeout(() => {
        setIsRescheduling(false);
        setRescheduleStatus("idle");
      }, 4000);
    } catch (err) {
      console.error("Reschedule Error:", err);
      setRescheduleStatus("error");
      setRescheduleFeedback(
        err.response?.data?.message ||
          "Failed to send request. Please try again.",
      );
    }
  };

  const getStatusUI = (status) => {
    switch (status) {
      case "hired":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle2 size={24} />,
          title: "You're Hired!",
          message:
            "Congratulations! The employer has accepted your application.",
        };
      case "NCTT":
        return {
          color: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <XCircle size={24} />,
          title: "Not Considered",
          message:
            "The employer has decided not to move forward with your application at this time.",
        };
      case "Interview Scheduled":
        return {
          color: "bg-purple-50 text-purple-700 border-purple-200",
          icon: <Clock size={24} />,
          title: "Interview Scheduled",
          message:
            "You have been shortlisted for an interview! Check the message below for details.",
        };
      case "Assignment Scheduled":
        return {
          color: "bg-orange-50 text-orange-700 border-orange-200",
          icon: <FileText size={24} />,
          title: "Assignment Scheduled",
          message:
            "The employer has assigned you a task. Check the message below for instructions.",
        };
      case "shortlisted":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <CheckCircle2 size={24} />,
          title: "Shortlisted",
          message:
            "You have been shortlisted! The employer will contact you soon.",
        };
      default: // applied
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200",
          icon: <AlertCircle size={24} />,
          title: "Application Under Review",
          message:
            "Your application has been sent. We will notify you once the employer reviews it.",
        };
    }
  };

  const statusUI = getStatusUI(status);

  const renderArray = (val) => {
    if (!val) return "Not specified";
    if (Array.isArray(val))
      return val.length > 0 ? val.join(", ") : "Not specified";
    return String(val);
  };

  const modeStr = renderArray(job.mode);
  const isRemote =
    modeStr.toLowerCase().includes("home") || modeStr === "Online";

  const displayLocation = isRemote
    ? "Remote"
    : `${typeof job.location === "object" ? job.location?.address : job.location || "Location not specified"}${job.pinCode ? ` - ${job.pinCode}` : ""}`;

  const validFeatures =
    job.jobFeatures?.filter((f) => f && f.trim() !== "") || [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6"
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
        <header className="bg-white p-6 sm:p-8 border-b border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative shrink-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none -mt-20 -mr-20"></div>

          <div className="relative z-10 flex gap-4 sm:gap-6 items-center w-full">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center text-3xl shrink-0 text-indigo-600 font-extrabold shadow-sm">
              {job.postedByImage ? (
                <img
                  src={job.postedByImage}
                  alt="Company"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : job.postedByCompany ? (
                job.postedByCompany.charAt(0)
              ) : job.postedByName ? (
                job.postedByName.charAt(0)
              ) : (
                <Building2 size={32} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                  <AlertCircle size={10} /> {status?.replace("_", " ") || "APPLIED"}
                </span>
                <span className="px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                  {modeStr}
                </span>
                <span className="px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                  {renderArray(job.jobType)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center text-slate-500 text-xs sm:text-sm font-bold gap-3 mt-2">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (job.postedBy) navigate(`/company/${job.postedBy}`);
                  }}
                  className="text-slate-700 hover:text-indigo-600 hover:underline cursor-pointer"
                >
                  <CompanyDisplay job={job} fallback="Confidential Employer" />
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-slate-400" />{" "}
                  {displayLocation}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-slate-400" /> Applied{" "}
                  {new Date(appliedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-20"
          >
            <X size={20} />
          </button>
        </header>

        {/* --- SCROLLABLE BODY --- */}
        <div className="overflow-y-auto custom-scrollbar p-4 sm:p-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- MAIN CONTENT (LEFT) --- */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Application Status Alert Block */}
              <div className={`p-5 sm:p-6 rounded-3xl border relative overflow-hidden shadow-sm ${statusUI.color}`}>
                <div className="flex items-center gap-3 font-bold text-base relative z-10">
                  {statusUI.icon} {statusUI.title}
                </div>
                <p className="text-sm font-medium leading-relaxed opacity-90 pl-9 mt-1 relative z-10">
                  {statusUI.message}
                </p>

                {/* Reschedule Button / Meet Link */}
                {status === "Interview Scheduled" && (
                  <div className="mt-4 pl-9 relative z-10">
                    {meetingLink && (
                      <a
                        href={
                          meetingLink.startsWith("http")
                            ? meetingLink
                            : `https://${meetingLink}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-all active:scale-95 w-fit"
                      >
                        <Globe size={16} /> Join Meeting
                      </a>
                    )}
                    {application.rescheduleRequest?.isRequested ? (
                      <div
                        className={`mt-3 p-4 rounded-xl text-sm font-medium border shadow-sm ${
                          application.rescheduleRequest.requestStatus === "pending"
                            ? "bg-orange-50 border-orange-200 text-orange-700"
                            : application.rescheduleRequest.requestStatus ===
                                "approved"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-rose-50 border-rose-200 text-rose-700"
                        }`}
                      >
                        <span className="uppercase tracking-wider text-[10px] font-bold block mb-1">
                          Reschedule Status
                        </span>
                        {application.rescheduleRequest.requestStatus === "pending" &&
                          "Pending Employer Approval for: " +
                            application.rescheduleRequest.proposedTime}
                        {application.rescheduleRequest.requestStatus === "approved" &&
                          "Approved! Check employer messages for the final link."}
                        {application.rescheduleRequest.requestStatus === "rejected" &&
                          "Request Denied. Please attend the original time or message the employer."}
                      </div>
                    ) : !isRescheduling ? (
                      <button
                        onClick={() => setIsRescheduling(true)}
                        className="mt-3 flex items-center gap-2 bg-white border border-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-purple-50 transition-colors"
                      >
                        <CalendarClock size={16} /> Request Reschedule
                      </button>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Reschedule Form Modal/Dropdown */}
              {isRescheduling && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm overflow-hidden"
                >
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                      <CalendarClock size={18} />
                    </div>{" "}
                    Request a New Time
                  </h3>

                  {rescheduleStatus === "success" ? (
                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-emerald-100">
                      <CheckCircle2 size={18} className="shrink-0" />{" "}
                      {rescheduleFeedback}
                    </div>
                  ) : (
                    <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Reason for Rescheduling
                        </label>
                        <textarea
                          required
                          value={rescheduleData.reason}
                          onChange={(e) =>
                            setRescheduleData({
                              ...rescheduleData,
                              reason: e.target.value,
                            })
                          }
                          placeholder="E.g., I have an unexpected medical appointment..."
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all resize-none font-medium"
                          rows="2"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Proposed Date & Time
                        </label>
                        <input
                          type="text"
                          required
                          value={rescheduleData.proposedTime}
                          onChange={(e) =>
                            setRescheduleData({
                              ...rescheduleData,
                              proposedTime: e.target.value,
                            })
                          }
                          placeholder="E.g., Tomorrow at 3:00 PM EST"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                        />
                      </div>

                      {rescheduleStatus === "error" && (
                        <p className="text-xs text-rose-600 font-medium bg-rose-50 p-3 rounded-xl flex items-center gap-1.5 border border-rose-100">
                          <AlertCircle size={14} /> {rescheduleFeedback}
                        </p>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsRescheduling(false)}
                          className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={rescheduleStatus === "loading"}
                          className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-70 shadow-sm"
                        >
                          {rescheduleStatus === "loading" ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CalendarClock size={16} />
                          )}
                          {rescheduleStatus === "loading"
                            ? "Sending..."
                            : "Send Request"}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}

              {/* Employer Message */}
              {employerMessage && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2 border-b border-indigo-100/50 pb-3">
                    <MessageSquare size={16} className="text-indigo-500" />{" "}
                    Message from Employer
                  </h3>
                  <div className="text-indigo-900/90 font-medium whitespace-pre-wrap leading-relaxed text-sm bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                    {employerMessage}
                  </div>
                </div>
              )}

              {/* Cover Letter Block */}
              {applicantMessage && (
                <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <FileText size={18} />
                    </div>{" "}
                    Cover Letter / Pitch
                  </h2>
                  <div className="bg-slate-50 rounded-xl p-5 text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap border border-slate-100">
                    {applicantMessage}
                  </div>
                </section>
              )}

              {/* Job Highlights */}
              {validFeatures.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {validFeatures.map((feature, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-4 sm:p-5 rounded-2xl flex items-start gap-3 sm:gap-4 shadow-sm"
                    >
                      <div className="p-2 bg-amber-100/50 rounded-lg shrink-0">
                        <Zap className="text-amber-500" size={18} />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-amber-900 mt-0.5 sm:mt-1 leading-snug">
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
                      <Users size={12} className="text-indigo-400" /> Age Limit
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

              {/* Application Assessment (Responses) */}
              {screeningAnswers && screeningAnswers.length > 0 && (
                <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-4 flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                      <HelpCircle size={18} />
                    </div>{" "}
                    Application Assessment
                  </h2>
                  <p className="text-xs font-bold text-slate-500 mb-5">
                    Your responses to the employer's screening questions:
                  </p>
                  <div className="space-y-4">
                    {screeningAnswers.map((item, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 rounded-2xl border border-slate-100 p-5 overflow-hidden"
                      >
                        <h4 className="text-sm font-extrabold text-slate-800 mb-3 flex items-start gap-2">
                          <span className="text-rose-500">Q{index + 1}.</span>{" "}
                          <span>{item.question}</span>
                        </h4>
                        <div className="bg-white rounded-xl p-4 text-sm font-medium text-slate-700 border border-slate-100 shadow-sm">
                          {item.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
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

              {/* Job Overview */}
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
            </div>
          </div>
        </div>

        {/* --- FOOTER ACTION --- */}
        <div className="p-4 sm:p-6 bg-white border-t border-slate-200 shrink-0 flex justify-end items-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
          >
            Close Window
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
