import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, User, Mail, Phone, Briefcase, FileText, Download } from "lucide-react";
import CompanyDisplay from "../components/CompanyDisplay";

export default function AdminJobseekerView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobseeker, setJobseeker] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobseekerData();
  }, [id]);

  const fetchJobseekerData = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      const { data } = await axios.get(
        `https://jobone-mrpy.onrender.com/admin/users/${id}/applications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobseeker(data.user);
      setApplications(data.applications);
    } catch (err) {
      alert("Failed to load jobseeker data.");
      navigate("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  if (!jobseeker)
    return <div className="text-center mt-20 text-rose-500 font-bold">Jobseeker not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-slate-900 rounded-2xl p-8 text-white flex justify-between items-center shadow-xl">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-3">
              Admin Review: {jobseeker.name}
            </h1>
            <p className="text-slate-400 mt-1">
              Reviewing candidate profile and application history.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-slate-800 px-4 py-2 rounded-lg font-bold hover:bg-slate-700 border border-slate-700 transition"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Data */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
                Profile Data
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {jobseeker.profilePicture ? (
                    <img src={jobseeker.profilePicture} alt="Profile" className="w-16 h-16 rounded-full object-cover shadow" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                      <User size={32} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{jobseeker.name}</h3>
                    <p className="text-sm text-slate-500">{jobseeker.title || "No Title Provided"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase mt-4">Contact Info</p>
                  <p className="font-medium text-slate-900 flex items-center gap-2 mt-2">
                    <Mail size={16} /> {jobseeker.email}
                  </p>
                  <p className="font-medium text-slate-900 flex items-center gap-2 mt-2">
                    <Phone size={16} /> {jobseeker.phone || "Not Provided"}
                  </p>
                </div>

                {jobseeker.resume && (
                  <div className="mt-6 border-t pt-4">
                    <button
                      onClick={() => window.open(jobseeker.resume, "_blank")}
                      className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                    >
                      <FileText size={18} /> View Resume
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Applications */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Briefcase className="text-indigo-600" /> Application History ({applications.length})
              </h2>

              {applications.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                  <p>This candidate hasn't applied to any jobs yet.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {applications.map((app) => (
                    <div key={app._id} className="p-5 border border-slate-200 rounded-xl hover:shadow-md transition bg-slate-50">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-slate-800">
                            {app.job_id?.title || "Unknown Job"}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium">
                            <div className="flex items-center gap-1">
                              <CompanyDisplay job={app.job_id} fallback={app.job_id?.postedByCompany || "Unknown Company"} /> • {app.job_id?.location?.address || "Unknown Location"}
                            </div>
                          </p>
                          <div className="mt-3 flex gap-4 text-sm text-slate-600">
                            <p>
                              <span className="font-bold text-slate-800">Applied:</span>{" "}
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            app.status === 'Hired' ? 'bg-emerald-100 text-emerald-700' :
                            app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                            app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {app.status}
                          </span>
                          <button
                            onClick={() => window.open(`/admin/job/${app.job_id?._id}`, "_blank")}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-2 underline"
                          >
                            View Job
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
