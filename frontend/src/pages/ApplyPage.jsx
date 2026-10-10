import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CompanyDisplay from "../components/CompanyDisplay";
import { motion } from "framer-motion";
import {
  Loader2,
  Briefcase,
  MapPin,
  IndianRupee,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building,
  Building2,
  Clock,
} from "lucide-react";

export default function ApplyPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [jobLoading, setJobLoading] = useState(true);

  // --- FETCH JOB & SIMILAR JOBS ---
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setJobLoading(true);
        // FACT: Fetching both concurrently to save loading time
        const [jobRes, similarRes] = await Promise.all([
          axios.get(`https://jobone-if7l.onrender.com/jobs/${jobId}`),
          axios
            .get(`https://jobone-if7l.onrender.com/jobs/${jobId}/similar`)
            .catch(() => ({ data: [] })),
        ]);

        setJob(jobRes.data.job || jobRes.data);
        setSimilarJobs(similarRes.data || []);
      } catch (error) {
        console.error("Failed to fetch job details:", error);
      } finally {
        setJobLoading(false);
      }
    };
    fetchJobData();
  }, [jobId]);

  // --- HANDLE SUBMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const token = localStorage.getItem("userToken");
      const userStr = localStorage.getItem("userInfo");

      if (!token || !userStr) {
        setFeedback("You must be logged in as a candidate to apply.");
        setStatus("error");
        return;
      }

      const payload = {
        jobId,
        message: message.trim(),
      };

      await axios.post(
        "https://jobone-mrpy.onrender.com/applications",
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setStatus("success");
      setFeedback("Application submitted successfully!");
      setMessage("");
      // FACT: Auto-redirect removed so candidates can view similar jobs
    } catch (error) {
      console.error("Error applying:", error);
      setFeedback(
        error.response?.data?.message ||
          "Failed to submit application. Please try again.",
      );
      setStatus("error");
    }
  };

  // --- BACKWARD COMPATIBILITY ENGINE ---
  const renderArray = (val) => {
    if (!val) return "Not specified";
    if (Array.isArray(val))
      return val.length > 0 ? val.join(", ") : "Not specified";
    return String(val);
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (jobLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Job Unavailable
          </h2>
          <p className="text-slate-500 mb-6 font-medium">
            This job may have been closed or removed by the employer.
          </p>
          <button
            onClick={() => navigate("/jobs")}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Browse Other Jobs
          </button>
        </div>
      </div>
    );
  }

  const isRemote =
    renderArray(job.mode).toLowerCase().includes("home") ||
    job.mode === "Online";
  const displayLocation = isRemote
    ? "Remote"
    : typeof job.location === "object"
      ? job.location?.address
      : job.location || "Location not specified";

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 flex justify-center items-center mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-white shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden border border-slate-100"
      >
        {/* --- HEADER & JOB SUMMARY --- */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-bold relative z-10"
          >
            <ArrowLeft size={16} /> Back to Job Details
          </button>

          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight leading-tight relative z-10">
            {job.title}
          </h1>
          <p className="text-indigo-300 font-bold flex items-center gap-2 mb-6 relative z-10">
            <Building size={16} />{" "}
            <CompanyDisplay job={job} fallback="Confidential Employer" className="text-indigo-300" />
          </p>

          <div className="flex flex-wrap gap-2.5 relative z-10">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white text-xs font-bold rounded-lg backdrop-blur-md border border-white/10">
              <MapPin size={14} className="text-slate-300" />{" "}
              <span className="truncate max-w-[150px]">{displayLocation}</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg backdrop-blur-md border border-emerald-500/20">
              <IndianRupee size={14} />{" "}
              {job.salaryAmount
                ? `${job.salaryAmount.toLocaleString()} / ${job.salaryFrequency || "Mo"}`
                : "TBD"}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-lg backdrop-blur-md border border-blue-500/20 capitalize">
              <Briefcase size={14} /> {renderArray(job.mode)}
            </span>
          </div>
        </div>

        {/* --- DYNAMIC FORM / SUCCESS AREA --- */}
        <div className="p-6 sm:p-8">
          {status === "success" ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center py-4"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
                Application Sent!
              </h2>
              <p className="text-slate-500 font-medium mb-8 text-center">
                Your application has been forwarded to the employer.
              </p>

              {/* FACT: The Similar Jobs block injected into the success state */}
              {similarJobs.length > 0 ? (
                <div className="w-full border-t border-slate-100 pt-8 mt-2">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 text-left">
                    Explore Similar Roles
                  </h3>
                  <div className="flex flex-col gap-4">
                    {similarJobs.map((sJob) => {
                      const sDisplayLoc =
                        typeof sJob.location === "object"
                          ? sJob.location.address
                          : sJob.location || "Remote";
                      return (
                        <div
                          key={sJob._id}
                          onClick={() => navigate(`/apply/${sJob._id}`)}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-4 overflow-hidden">
                            <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                              {sJob.postedByCompany ? (
                                sJob.postedByCompany.charAt(0)
                              ) : (
                                <Building2 size={20} />
                              )}
                            </div>
                            <div className="truncate">
                              <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                {sJob.title}
                              </h4>
                              <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-2 mt-0.5">
                                <CompanyDisplay job={sJob} fallback="Confidential" />{" "}
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>{" "}
                                <MapPin size={10} /> {sDisplayLoc}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100 shrink-0 hidden sm:block">
                            {formatTimeAgo(sJob.postedAt || sJob.createdAt)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/jobs")}
                  className="mt-4 bg-indigo-50 text-indigo-600 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                >
                  Back to all jobs
                </button>
              )}
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-extrabold text-slate-800 mb-2"
                >
                  Pitch Yourself <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-3 font-medium">
                  Why are you the perfect fit for this role? Highlight your
                  relevant experience and skills.
                </p>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows="6"
                  placeholder="I am writing to express my interest in the..."
                  className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none resize-none transition-all text-sm font-medium text-slate-700"
                />
              </div>

              {feedback && status === "error" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-xl flex items-start gap-2"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />{" "}
                  {feedback}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Submit Application
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
