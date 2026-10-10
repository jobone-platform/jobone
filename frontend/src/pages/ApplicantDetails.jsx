import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  Briefcase,
  Clock,
  Loader2,
  SearchX,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText, // FACT: Added missing import for Assignment icon
} from "lucide-react";
import ApplicationDetailsModal from "../components/ApplicationDetailsModal";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
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

  const handleViewApplication = (application) => {
    setSelectedApp(application);
  };

  // FACT: Updated badge logic to perfectly match the 7 backend schemas
  const getStatusBadge = (status) => {
    switch (status) {
      case "hired":
        return (
          <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200">
            <CheckCircle2 size={12} /> Hired
          </span>
        );
      case "NCTT":
        return (
          <span className="flex items-center gap-1 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-rose-200">
            <XCircle size={12} /> NCTT
          </span>
        );
      case "Interview Scheduled":
        return (
          <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-200">
            <Clock size={12} /> Interview
          </span>
        );
      case "Interview Conducted":
        return (
          <span className="flex items-center gap-1 bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-cyan-200">
            <CheckCircle2 size={12} /> Conducted
          </span>
        );
      case "Assignment Scheduled":
        return (
          <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-200">
            <FileText size={12} /> Assignment
          </span>
        );
      case "shortlisted":
        return (
          <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200">
            <CheckCircle2 size={12} /> Shortlisted
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200">
            <AlertCircle size={12} /> Applied
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-600" />
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
            className="block w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto mt-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              My Applications
            </h1>
            <p className="text-slate-500 mt-1">
              Track and manage your job applications.
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
            Total Applications:{" "}
            <span className="text-blue-600 font-bold ml-1">
              {applications.length}
            </span>
          </div>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {applications.map((app) => {
            const job = app.job || {};
            const locationStr =
              typeof job.location === "object"
                ? job.location.address
                : job.location;
            const companyName = job.postedBy?.name || "Company Confidential";
            const companyImage = job.postedBy?.image;

            return (
              <motion.div
                key={app.applicationId || app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full"
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-xl font-bold text-blue-600 shadow-sm shrink-0 overflow-hidden">
                        {companyImage ? (
                          <img
                            src={companyImage}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          companyName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="font-bold text-slate-900 text-lg leading-snug truncate pr-2"
                          title={job.title}
                        >
                          {job.title || "Job Title Unavailable"}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-1 truncate">
                          <Building2 size={14} className="text-slate-400" />
                          {companyName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-6">{getStatusBadge(app.status)}</div>

                  {/* Job Details */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm text-slate-600">
                      <div className="p-1.5 bg-slate-50 rounded-md">
                        <MapPin size={14} className="text-slate-400" />
                      </div>
                      <span className="truncate">
                        {locationStr || "Remote"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-600">
                      <div className="p-1.5 bg-slate-50 rounded-md">
                        <IndianRupee size={14} className="text-slate-400" />
                      </div>
                      <span>
                        {job.salary
                          ? job.salary.toLocaleString()
                          : "Not Disclosed"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-600">
                      <div className="p-1.5 bg-slate-50 rounded-md">
                        <Briefcase size={14} className="text-slate-400" />
                      </div>
                      <span className="capitalize">
                        {job.jobType || "Full-time"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Calendar size={14} />
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </div>

                  {/* BUTTON TO OPEN MODAL */}
                  <button
                    onClick={() => handleViewApplication(app)}
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View Status →
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* APPLICATION DETAILS MODAL */}
      <AnimatePresence>
        {selectedApp && (
          <ApplicationDetailsModal
            application={selectedApp}
            onClose={() => setSelectedApp(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
