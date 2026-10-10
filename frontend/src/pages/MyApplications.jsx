import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  Clock,
  Loader2,
  SearchX,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Monitor,
  Building,
  Globe,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import ApplicationDetailsModal from "../components/ApplicationDetailsModal";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // State for the new Employer Message Popup
  const [messagePopup, setMessagePopup] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const storedUser = localStorage.getItem("userInfo");
        if (!storedUser) {
          navigate("/login");
          return;
        }

        const userInfo = JSON.parse(storedUser);
        const { token, id } = userInfo;
        const userId = id || userInfo.userId;

        if (!token || !userId) {
          setLoading(false);
          return;
        }

        const { data } = await axios.get(
          `https://jobone-mrpy.onrender.com/applications/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setApplications(data.applications || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  // --- HELPERS ---
  const getModeIcon = (mode) => {
    switch (mode) {
      case "Work from Home":
        return <Monitor size={14} className="text-slate-400" />;
      case "Work from Office/Field":
        return <Building size={14} className="text-slate-400" />;
      case "Hybrid":
        return <Globe size={14} className="text-slate-400" />;
      default:
        return <Building2 size={14} className="text-slate-400" />;
    }
  };

  // FACT: Updated to handle the new Phase 1 database strings
  const getStatusBadge = (status) => {
    switch (status) {
      case "hired":
        return (
          <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider border border-emerald-200 w-fit">
            <CheckCircle2 size={12} /> Hired
          </span>
        );
      case "NCTT":
        return (
          <span
            className="flex items-center gap-1 bg-rose-100 text-rose-700 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider border border-rose-200 w-fit"
            title="Not Considered This Time"
          >
            <XCircle size={12} /> Not Considered
          </span>
        );
      case "Interview Scheduled":
        return (
          <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider border border-purple-200 w-fit">
            <Clock size={12} /> Interview
          </span>
        );
      case "Assignment Scheduled":
        return (
          <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider border border-orange-200 w-fit">
            <FileText size={12} /> Assignment
          </span>
        );
      case "shortlisted":
        return (
          <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider border border-blue-200 w-fit">
            <CheckCircle2 size={12} /> Shortlisted
          </span>
        );
      default: // 'applied'
        return (
          <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider border border-slate-200 w-fit">
            <AlertCircle size={12} /> Applied
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-600" />
        <p className="font-medium">Loading your applications...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchX className="text-slate-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            No Applications Yet
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            You haven't applied to any jobs yet. Your next career move is just a
            click away!
          </p>
          <Link
            to="/jobs"
            className="block w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto mt-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              My Applications
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Track and manage your job applications.
            </p>
          </div>
          <div className="bg-indigo-50 px-5 py-3 rounded-xl border border-indigo-100 text-sm font-bold text-indigo-800">
            Total Active Applications:{" "}
            <span className="text-indigo-600 text-lg ml-1">
              {applications.length}
            </span>
          </div>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {applications.map((app) => {
            const job = app.job || {};
            const modeStr = Array.isArray(job.mode) ? job.mode.join(", ") : job.mode || "";
            const isRemote = modeStr.toLowerCase().includes("home") || modeStr === "Online";
            const locationStr = isRemote
              ? "Remote"
              : typeof job.location === "object"
                ? job.location?.address
                : job.location;
            const companyName = job.postedBy?.name || "Company Confidential";
            const companyImage = job.postedBy?.image;

            return (
              <motion.div
                key={app.applicationId || app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col h-full overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center text-lg font-extrabold text-indigo-600 shadow-sm shrink-0">
                        {companyImage ? (
                          <img
                            src={companyImage}
                            alt="Logo"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          companyName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="font-bold text-slate-900 text-lg leading-tight truncate pr-2"
                          title={job.title}
                        >
                          {job.title || "Job Title Unavailable"}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                          <Building2 size={14} className="text-slate-400" />{" "}
                          {companyName}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  {/* FACT: New Employer Message Alert Button */}
                  {app.employerMessage && (
                    <div className="mb-4">
                      <button
                        onClick={() =>
                          setMessagePopup({
                            status: app.status,
                            message: app.employerMessage,
                          })
                        }
                        className="flex w-full justify-center items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
                      >
                        <MessageCircle size={14} /> View Employer Update
                      </button>
                    </div>
                  )}

                  {/* Job Details mapped to new Schema */}
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                      <MapPin size={14} className="text-slate-400" />
                      <span
                        className="text-xs font-semibold text-slate-700 truncate max-w-[120px]"
                        title={locationStr}
                      >
                        {locationStr || "Office"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                      <IndianRupee size={14} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700">
                        {job.salaryMin
                          ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}/${job.salaryFrequency}`
                          : "TBD"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                      {getModeIcon(Array.isArray(job.mode) ? job.mode.join(", ") : job.mode || "")}
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {Array.isArray(job.mode) ? job.mode.join(", ") : job.mode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold tracking-wide">
                    <Calendar size={14} className="text-slate-400" /> Applied{" "}
                    {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <button
                    onClick={() => setSelectedApplication(app)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* --- FACT: THE NEW EMPLOYER MESSAGE POPUP --- */}
      <AnimatePresence>
        {messagePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                      Update Details
                    </h3>
                    <p className="text-sm font-bold text-indigo-600 uppercase tracking-wide mt-0.5">
                      {messagePopup.status}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMessagePopup(null)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative z-10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Message from Employer
                </p>
                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm font-medium">
                  {messagePopup.message}
                </div>
              </div>

              <div className="mt-8 flex justify-end relative z-10">
                <button
                  onClick={() => setMessagePopup(null)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all transform active:scale-95"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JOB DETAILS MODAL */}
      <AnimatePresence>
        {selectedApplication && (
          <ApplicationDetailsModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
