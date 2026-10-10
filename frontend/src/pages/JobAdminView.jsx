import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  CalendarDays,
  Users,
  Zap,
  UserCircle2,
  GraduationCap,
  Languages,
  HelpCircle,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import CompanyDisplay from "../components/CompanyDisplay";

export default function JobAdminView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchJobData();
  }, [id]);

  const fetchJobData = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      const { data } = await axios.get(
        `https://jobone-mrpy.onrender.com/admin/jobs/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setJob(data);
    } catch (err) {
      alert("Failed to load job data.");
      navigate("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status, stayOnPage = false) => {
    setActionLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      await axios.patch(
        `https://jobone-mrpy.onrender.com/admin/jobs/${id}/review`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      setJob((prev) => ({ ...prev, status }));

      alert(
        `Job successfully ${status === "active" ? "approved" : status === "hidden" ? "hidden" : status === "rejected" ? "rejected" : "updated"}!`,
      );
      
      if (!stayOnPage) {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const renderArray = (arr) => {
    if (!arr || arr.length === 0) return "Not specified";
    return arr.join(", ");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  if (!job)
    return (
      <div className="text-center mt-20 text-red-500 font-bold">
        Job not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* --- HEADER --- */}
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${job.status === "active" ? "bg-emerald-500/20 text-emerald-400" : job.status === "pending_approval" ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"}`}
              >
                {job.status.replace("_", " ")}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {job._id}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center text-slate-400 font-bold gap-3 mb-6">
              <span className="text-indigo-400 text-sm">
                <CompanyDisplay job={job} fallback="Confidential Employer" />
              </span>
              <span className="text-slate-600">•</span>
              <Clock size={16} className="text-slate-500" /> Posted on{" "}
              {formatDate(job.postedAt)}
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-slate-800 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-700 border border-slate-700 transition flex items-center gap-2"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --- LEFT SIDEBAR: QUICK STATS & ACTIONS --- */}
          <div className="lg:col-span-1 space-y-6">
            {/* Master Action Block */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
              {job.status === "pending_approval" ? (
                <>
                  <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                    Final Decision
                  </h2>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleStatusChange("active")}
                      disabled={actionLoading}
                      className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                    >
                      <CheckCircle size={18} /> Approve & Publish
                    </button>
                    <button
                      onClick={() => handleStatusChange("rejected")}
                      disabled={actionLoading}
                      className="w-full bg-rose-50 text-rose-700 border border-rose-200 py-3 rounded-xl font-bold hover:bg-rose-100 transition flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Reject Job
                    </button>
                    <button
                      onClick={() => handleStatusChange("hidden")}
                      disabled={actionLoading}
                      className="w-full mt-2 bg-slate-100 text-slate-700 border border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-200 transition flex items-center justify-center gap-2"
                    >
                      <EyeOff size={18} /> Hide Job
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                    Update Status
                  </h2>
                  <div className="flex flex-col gap-3">
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={job.status}
                      onChange={(e) => handleStatusChange(e.target.value, true)}
                      disabled={actionLoading}
                    >
                      <option value="active">Active (Published)</option>
                      <option value="inactive">Inactive</option>
                      <option value="hidden">Hidden</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="rejected">Rejected</option>
                      <option value="closed">Closed</option>
                    </select>
                    {actionLoading && <p className="text-xs text-slate-400 text-center animate-pulse">Updating status...</p>}
                  </div>
                </>
              )}
            </div>

            {/* Core Details Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">
                Core Details
              </h2>

              <DetailItem icon={<Briefcase />} label="Work Mode & Type">
                {renderArray(job.jobType)} • {renderArray(job.mode)}
              </DetailItem>

              <DetailItem icon={<DollarSign />} label="Salary">
                {job.salaryMin === 0 && job.salaryMax === 0
                  ? "Unpaid / Volunteer"
                  : `${job.salaryCurrency} ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}`}{" "}
                / {job.salaryFrequency}
              </DetailItem>

              <DetailItem icon={<MapPin />} label="Location">
                {job.location?.address || "Remote"}{" "}
                {job.pinCode ? `(${job.pinCode})` : ""}
              </DetailItem>

              <DetailItem icon={<Users />} label="Openings">
                {job.noOfPeopleRequired} Position(s)
              </DetailItem>
            </div>

            {/* Schedule & Deadlines Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">
                Schedule & Deadlines
              </h2>

              <DetailItem icon={<CalendarDays />} label="Start / End Date">
                {formatDate(job.startDate)} to{" "}
                {job.isLongTerm ? "Long Term" : formatDate(job.endDate)}
                {job.isFlexibleDuration && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">
                    Flexible
                  </span>
                )}
              </DetailItem>

              <DetailItem icon={<Clock />} label="Application Deadline">
                {formatDate(job.applicationDeadline)}
              </DetailItem>

              <div className="pt-2">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">
                  Work Days
                </p>
                <p className="font-medium text-slate-900 text-sm">
                  {job.workDaysPattern === "Custom"
                    ? job.customWorkDaysDescription
                    : job.workDaysPattern}
                </p>
              </div>

              <div className="pt-2">
                <p className="text-xs text-slate-500 font-bold uppercase mb-2 flex items-center gap-2">
                  Shifts
                  {job.isFlexibleShifts && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded">
                      Flexible
                    </span>
                  )}
                </p>
                <div className="space-y-2">
                  {job.shifts && job.shifts.length > 0 ? (
                    job.shifts.map((s, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs font-bold text-slate-700"
                      >
                        <span>{s.shiftName}</span>
                        <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200">
                          {s.startTime} - {s.endTime}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Not specified</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT MAIN CONTENT --- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description & Responsibilities */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-3">
                  <FileText className="text-blue-600" /> Job Summary
                </h2>
                <div
                  className="prose prose-sm max-w-none text-slate-600 prose-headings:text-slate-800 prose-headings:font-bold prose-ul:list-disc prose-ul:pl-4 prose-li:my-1"
                  dangerouslySetInnerHTML={{ __html: job.jobSummary }}
                />
              </div>
              
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-3">
                  <Briefcase className="text-blue-600" /> Key Responsibilities
                </h2>
                <div
                  className="prose prose-sm max-w-none text-slate-600 prose-headings:text-slate-800 prose-headings:font-bold prose-ul:list-disc prose-ul:pl-4 prose-li:my-1"
                  dangerouslySetInnerHTML={{ __html: job.keyResponsibilities }}
                />
              </div>
            </div>

            {/* Candidate Requirements */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-3">
                <UserCircle2 className="text-indigo-600" /> Candidate
                Demographics
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 mb-1">
                    <GraduationCap size={12} /> Qualifications
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {renderArray(job.qualifications)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 mb-1">
                    <FileText size={12} /> Courses
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {renderArray(job.courses)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 mb-1">
                    <Languages size={12} /> Languages
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {renderArray(job.languages)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1 mb-1">
                    <Users size={12} /> Gender
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {job.genderPreference}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                    Age Limit
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {job.ageLimit?.isAny
                      ? "Any Age"
                      : job.ageLimit?.min
                        ? `${job.ageLimit.min} to ${job.ageLimit.max} Years`
                        : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                    Experience (Relevant / Total)
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {job.experience?.relevantExperience?.isAny
                      ? "Any / Fresher"
                      : `${job.experience?.relevantExperience?.min}-${job.experience?.relevantExperience?.max} Yrs`}
                    <span className="text-slate-400 font-normal mx-2">/</span>
                    {job.experience?.totalExperience?.isAny
                      ? "Any / Fresher"
                      : `${job.experience?.totalExperience?.min}-${job.experience?.totalExperience?.max} Yrs`}
                  </p>
                </div>
              </div>
            </div>

            {/* Arrays: Skills, Perks, Features, Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">
                  Skills Required
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired && job.skillsRequired.length > 0 ? (
                    job.skillsRequired.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm italic">
                      None listed.
                    </span>
                  )}
                </div>
              </div>

              {/* Highlights */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-extrabold text-amber-500 uppercase tracking-widest mb-4 border-b border-amber-100 pb-2 flex items-center gap-2">
                  <Zap size={14} /> Job Highlights
                </h2>
                <ul className="space-y-2">
                  {job.jobFeatures &&
                  job.jobFeatures.filter((f) => f.trim() !== "").length > 0 ? (
                    job.jobFeatures
                      .filter((f) => f.trim() !== "")
                      .map((feature, index) => (
                        <li
                          key={index}
                          className="text-sm font-bold text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-100"
                        >
                          {feature}
                        </li>
                      ))
                  ) : (
                    <span className="text-slate-500 text-sm italic">
                      None listed.
                    </span>
                  )}
                </ul>
              </div>

              {/* Perks */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-extrabold text-emerald-500 uppercase tracking-widest mb-4 border-b border-emerald-100 pb-2 flex items-center gap-2">
                  <CheckCircle size={14} /> Perks & Incentives
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.incentives && job.incentives.length > 0 ? (
                    job.incentives.map((inc, index) => (
                      <span
                        key={index}
                        className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg text-xs border border-emerald-100"
                      >
                        {inc}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm italic">
                      None listed.
                    </span>
                  )}
                </div>
              </div>

              {/* Screening Questions */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-extrabold text-purple-500 uppercase tracking-widest mb-4 border-b border-purple-100 pb-2 flex items-center gap-2">
                  <HelpCircle size={14} /> Screening Questions
                </h2>
                <ul className="space-y-2">
                  {job.screeningQuestions &&
                  job.screeningQuestions.length > 0 ? (
                    job.screeningQuestions.map((q, index) => (
                      <li
                        key={index}
                        className="text-sm font-medium text-slate-700 bg-purple-50/50 p-2 rounded-lg border border-purple-100"
                      >
                        <span className="font-bold text-purple-600 mr-2">
                          Q{index + 1}.
                        </span>{" "}
                        {q}
                      </li>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm italic">
                      No screening questions attached.
                    </span>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component for the Sidebar lists
const DetailItem = ({ icon, label, children }) => (
  <div>
    <p className="text-xs text-slate-500 font-bold uppercase mb-1">{label}</p>
    <p className="font-medium text-slate-900 flex items-start gap-2 mt-1 text-sm">
      <span className="text-slate-400 mt-0.5 shrink-0">
        {React.cloneElement(icon, { size: 14 })}
      </span>
      <span>{children}</span>
    </p>
  </div>
);
