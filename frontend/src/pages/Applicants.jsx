import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  ChevronRight,
  User,
  MessageSquareQuote,
} from "lucide-react";
import { motion } from "framer-motion";

export default function JobApplicants() {
  const { id } = useParams(); // Job ID
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const stored = localStorage.getItem("employerInfo");
        if (!stored) return navigate("/login");

        const { token } = JSON.parse(stored);

        // 1. Get Applications
        const { data } = await axios.get(
          `https://jobone-mrpy.onrender.com/applications/job/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setApplicants(data);

        // 2. Get Job Title
        const jobRes = await axios.get(
          `https://jobone-mrpy.onrender.com/jobs/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setJobTitle(jobRes.data.title || jobRes.data.job?.title || "Job");
      } catch (err) {
        console.error("Failed to load applicants", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [id, navigate]);

  const getStatusBadge = (status) => {
    const styles = {
      applied: "bg-blue-50 text-blue-700 border-blue-200",
      shortlisted: "bg-indigo-50 text-indigo-700 border-indigo-200",
      interview: "bg-purple-50 text-purple-700 border-purple-200",
      hired: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${styles[status] || styles.applied}`}
      >
        {status}
      </span>
    );
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 font-sans mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-800 mb-4 transition-colors font-bold text-sm"
            >
              <ArrowLeft size={16} /> Back to Job
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Applicants for <span className="text-indigo-600">{jobTitle}</span>
            </h1>
          </div>
          <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-600 flex items-center gap-2 shrink-0">
            Total Applicants:{" "}
            <span className="text-indigo-600 text-lg">{applicants.length}</span>
          </div>
        </div>

        {applicants.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100">
              <User className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">
              No applications yet
            </h3>
            <p className="text-slate-500 font-medium">
              Candidates will appear here once they apply.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applicants.map((app) => {
              const candidate = app.appliedBy;
              if (!candidate) return null;

              return (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-5">
                      <img
                        src={
                          candidate.profilePicture ||
                          (candidate.gender === "Female" 
                            ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                            : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                        }
                        alt="Avatar"
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm bg-slate-50 shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-lg text-slate-900 leading-tight truncate">
                          {candidate.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
                          Applied{" "}
                          {new Date(
                            app.appliedAt || app.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mb-5">{getStatusBadge(app.status)}</div>

                    <div className="space-y-3 text-sm font-bold text-slate-600 mb-6">
                      <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <Mail size={16} className="text-indigo-400 shrink-0" />
                        <span className="truncate">{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <Phone size={16} className="text-indigo-400 shrink-0" />
                        <span>{candidate.phone || "Not Provided"}</span>
                      </div>
                    </div>

                    {/* FACT: The Pitch Preview is now visible! */}
                    {app.applicantMessage && (
                      <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl relative">
                        <MessageSquareQuote
                          className="absolute top-3 right-3 text-amber-200/50"
                          size={32}
                        />
                        <p className="text-xs font-bold text-amber-900 mb-1.5 uppercase tracking-widest">
                          Pitch:
                        </p>
                        <p className="text-sm font-medium text-amber-800 line-clamp-3 relative z-10 leading-relaxed">
                          "{app.applicantMessage}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto border-t border-slate-100 p-5 bg-slate-50">
                    <button
                      onClick={() =>
                        navigate(`/application/${app._id}`, {
                          state: { application: app },
                        })
                      }
                      className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm active:scale-[0.98]"
                    >
                      Review Full Profile <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
