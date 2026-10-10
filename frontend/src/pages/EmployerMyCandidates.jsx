import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  UserCheck,
  Mail,
  Phone,
  ChevronRight,
  Briefcase,
} from "lucide-react";

export default function MyCandidates() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const stored = localStorage.getItem("employerInfo");
        if (!stored) return navigate("/login");
        const { token } = JSON.parse(stored);

        const { data } = await axios.get(
          "https://jobone-mrpy.onrender.com/employer/my-candidates",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setApplications(data);
      } catch (err) {
        console.error("Failed to load candidates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [navigate]);

  const getStatusBadge = (status) => {
    const styles = {
      applied: "bg-blue-50 text-blue-700 border-blue-200",
      shortlisted: "bg-indigo-50 text-indigo-700 border-indigo-200",
      hired: "bg-emerald-50 text-emerald-700 border-emerald-200",
      NCTT: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${styles[status] || "bg-slate-100 text-slate-700 border-slate-200"}`}
      >
        {status}
      </span>
    );
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  const filteredApplications = applications.filter((app) => {
    const candidateName = app.appliedBy?.name?.toLowerCase() || "";
    const jobTitle = app.job_id?.title?.toLowerCase() || "";
    const matchesSearch = candidateName.includes(searchQuery.toLowerCase()) || jobTitle.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 font-sans mt-16 sm:mt-20">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors font-bold text-sm uppercase tracking-wide"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8 text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            My Candidates
          </h1>
          <p className="text-slate-500 font-medium">
            A complete history of everyone who has ever applied to your jobs.
          </p>
        </div>

        {/* FACT: New Candidate Filtering UI */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <input
            type="text"
            placeholder="Search by name or job title..."
            className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Interview Conducted">Interview Conducted</option>
            <option value="hired">Hired</option>
            <option value="NCTT">Not a Fit (NCTT)</option>
          </select>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800">
              No candidates yet
            </h3>
            <p className="text-slate-500 mt-2">
              Candidates will appear here once they start applying to your jobs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((app) => {
              const candidate = app.appliedBy;
              if (!candidate) return null;

              return (
                <div
                  key={app._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={
                        candidate.profilePicture ||
                        (candidate.gender === "Female" 
                          ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                          : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                      }
                      alt={candidate.name}
                      className="w-16 h-16 rounded-full object-cover border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-lg text-slate-900 line-clamp-1">
                        {candidate.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1 mt-1">
                        <Briefcase size={12} /> Applied for:{" "}
                        <span className="font-bold text-slate-700">
                          {app.job_id?.title}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">{getStatusBadge(app.status)}</div>

                  <div className="space-y-2 text-sm font-bold text-slate-600 mb-6 flex-1">
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Mail size={16} className="text-blue-400 shrink-0" />
                      <span className="truncate">{candidate.email}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Phone size={16} className="text-green-400 shrink-0" />
                      <span>{candidate.phone || "Not Provided"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/profile/${candidate._id}`, {
                        state: { application: app },
                      })
                    }
                    className="w-full mt-auto flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    Review Profile <ChevronRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
