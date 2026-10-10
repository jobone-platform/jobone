import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Briefcase,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  RefreshCw,
  Power,
  Clock,
  ShieldAlert,
  XOctagon,
  Search,
} from "lucide-react";
import CompanyDisplay from "../components/CompanyDisplay";
import axios from "axios";

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [employerName, setEmployerName] = useState("Employer");
  const [loading, setLoading] = useState(true);

  // FACT: View mode state (table vs card)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("employerViewMode") || "table";
  });

  useEffect(() => {
    localStorage.setItem("employerViewMode", viewMode);
  }, [viewMode]);

  // FACT: Added approval status state to lock the dashboard
  const [approvalStatus, setApprovalStatus] = useState("pending");

  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const stored = localStorage.getItem("employerInfo");
        if (!stored) {
          navigate("/login");
          return;
        }

        const employerInfo = JSON.parse(stored);
        const token = employerInfo?.token;

        if (employerInfo.id || employerInfo.employerId) {
          try {
            const profileRes = await axios.get(
              `https://jobone-mrpy.onrender.com/employer/profile/${employerInfo.id || employerInfo.employerId}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            setEmployerName(
              profileRes.data.name || profileRes.data.companyName || "Employer",
            );

            // FACT: Extract the security status directly from the database response
            setApprovalStatus(profileRes.data.isApproved || "pending");
          } catch (profileErr) {
            console.error("Could not load employer profile name", profileErr);
          }
        }

        const { data } = await axios.get(
          `https://jobone-mrpy.onrender.com/jobs/employer-jobs`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setJobs(Array.isArray(data) ? data : data.jobs || []);

        const metricsRes = await axios.get(
          `https://jobone-mrpy.onrender.com/jobs/metrics`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setMetrics(metricsRes.data);
      } catch (err) {
        console.error("API Error:", err);
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [navigate]);

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      // FACT: Security Guard - Prevents bypassing admin approval
      if (
        currentStatus === "pending_approval" ||
        currentStatus === "rejected"
      ) {
        alert(
          "Action Denied: You cannot manually activate a job that is pending admin approval or has been rejected.",
        );
        return;
      }

      const newStatus = currentStatus === "active" ? "closed" : "active";
      const stored = localStorage.getItem("employerInfo");
      const token = JSON.parse(stored).token;

      await axios.put(
        `https://jobone-mrpy.onrender.com/jobs/${jobId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setJobs(
        jobs.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j)),
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update job status.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("employerInfo");
    navigate("/login");
  };

  const handleRepost = (job) => {
    navigate("/createjob", { state: { repostData: job } });
  };

  return (
    <div className="min-h-screen pt-24 pb-8 sm:py-20 bg-slate-50 px-4 sm:px-10 font-sans">
      {/* Sidebar */}

      <aside className="fixed left-0 top-15 hidden h-full w-64 border-r border-slate-200 bg-white p-6 md:block z-20">
        <div className="h-[50px] w-[100%]"></div>
        <div className="mb-10 flex items-center gap-2 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Briefcase size={22} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            JobOne
          </span>
        </div>
        <nav className="space-y-1">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active
            onClick={() => navigate("/employerdashboard")}
          />
          {approvalStatus === "approved" && (
            <>
              {/* FACT: Global Search */}
              <NavItem
                icon={<Search size={20} />}
                label="Find Candidates"
                onClick={() => navigate("/candidates")}
              />
              {/* FACT: Historical Applicants */}
              <NavItem
                icon={<Users size={20} />}
                label="My Candidates"
                onClick={() => navigate("/my-candidates")}
              />
              {/* FACT: Settings restored */}
              <NavItem
                icon={<Settings size={20} />}
                label="Settings"
                onClick={() => navigate("/employerprofile")}
              />
            </>
          )}
        </nav>
        <div className="absolute bottom-8 left-6 right-6">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={20} /> <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 px-0 sm:px-8 relative">
        <header className="mb-6 sm:mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Welcome back, {employerName}!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              {approvalStatus === "approved"
                ? "Here's a live overview of your hiring pipeline."
                : "Your account security status overview."}
            </p>
          </div>

          {/* FACT: Hide Post Job button if not approved */}
          {approvalStatus === "approved" && (
            <button
              onClick={() => navigate("/createjob")}
              className="flex items-center justify-center w-full sm:w-auto gap-2 rounded-xl bg-blue-600 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
            >
              <PlusCircle size={18} /> Post New Job
            </button>
          )}
        </header>

        {loading ? (
          <div className="p-20 flex justify-center text-slate-400">
            <RefreshCw size={32} className="animate-spin" />
          </div>
        ) : approvalStatus === "pending" ? (
          /* FACT: The Pending Lock Screen */
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-16 text-center flex flex-col items-center justify-center max-w-3xl mx-auto mt-10">
            <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6 border-8 border-orange-100/50">
              <Clock size={40} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
              Account Pending Review
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed max-w-lg">
              To ensure the highest quality of opportunities on our platform,
              our administration team manually verifies all new employer
              accounts.
              <br />
              <br />
              You will be granted full access to post jobs and review candidates
              once your profile is approved.
            </p>
            <div className="mt-8 flex items-center gap-2 bg-slate-50 text-slate-600 px-6 py-3 rounded-xl border border-slate-200 font-bold text-sm">
              <ShieldAlert size={18} className="text-slate-400" /> Current
              Status: <span className="text-orange-500">Under Review</span>
            </div>
          </div>
        ) : approvalStatus === "rejected" ? (
          /* FACT: The Rejected Lock Screen */
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-16 text-center flex flex-col items-center justify-center max-w-3xl mx-auto mt-10">
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 border-8 border-rose-100/50">
              <XOctagon size={40} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
              Registration Denied
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed max-w-lg">
              Unfortunately, our administration team has declined your employer
              registration at this time. If you believe this is a mistake,
              please contact support.
            </p>
          </div>
        ) : (
          /* FACT: The Normal Approved Dashboard */
          <>
            {/* Quick Stats Grid */}
            <div className="mb-8 sm:mb-10 grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-4">
              <StatCard
                label="Total Jobs Posted"
                value={metrics.totalJobs}
                color="indigo"
              />
              <StatCard
                label="Active Listings"
                value={metrics.activeJobs}
                color="blue"
              />
              <StatCard
                label="Total Applicants"
                value={metrics.totalApplications}
                color="purple"
              />
              <StatCard
                label="Total Job Views"
                value={metrics.totalViews}
                color="emerald"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Job Management Tracker
                </h2>
                <div className="flex bg-slate-200 p-1 rounded-lg">
                   <button onClick={() => setViewMode('table')} className={`px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Table</button>
                   <button onClick={() => setViewMode('card')} className={`px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-md transition-all ${viewMode === 'card' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Cards</button>
                </div>
              </div>

              {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <Briefcase size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    No job posts yet
                  </h3>
                  <p className="text-slate-500 mt-1">
                    Get started by creating your first listing.
                  </p>
                </div>
              ) : viewMode === "card" ? (
                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 bg-slate-50/30">
                  {jobs.map((job) => (
                    <JobCard 
                      key={job._id} 
                      job={job} 
                      toggleJobStatus={toggleJobStatus} 
                      navigate={navigate} 
                      employerName={employerName} 
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[1000px] sm:min-w-[1200px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">
                        <th className="p-3 sm:p-4 font-bold">Job Title & Details</th>
                        <th className="p-3 sm:p-4 font-bold text-center">Status</th>
                        <th className="p-4 font-bold text-center border-l border-slate-100 bg-slate-50/50">
                          Total
                        </th>
                        <th className="p-4 font-bold text-center text-blue-600 bg-blue-50/30">
                          Shortlisted
                        </th>
                        <th className="p-4 font-bold text-center text-purple-600 bg-purple-50/30">
                          Int. Scheduled
                        </th>
                        <th className="p-4 font-bold text-center text-orange-600 bg-orange-50/30">
                          Int. Conducted
                        </th>
                        <th className="p-4 font-bold text-center text-orange-600 bg-orange-50/30">
                          Assignment Scheduled
                        </th>
                        <th className="p-4 font-bold text-center text-emerald-600 bg-emerald-50/30">
                          Hired
                        </th>
                        <th className="p-4 font-bold text-center text-rose-600 bg-rose-50/30">
                          NCTT
                        </th>
                        <th className="p-4 font-bold text-right border-l border-slate-100">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jobs.map((job) => (
                        <tr
                          key={job._id}
                          onClick={() => navigate(`/job/${job._id}`)}
                          className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          {/* Job Title & Details */}
                          <td className="p-3 sm:p-4">
                            <div className="font-extrabold text-slate-900 text-[13px] sm:text-sm group-hover:text-blue-600 transition-colors">
                              {job.title}
                            </div>
                            <div className="text-[10px] sm:text-xs text-slate-500 font-bold mt-1 flex items-center gap-1.5">
                              <CompanyDisplay job={job} fallback={employerName || "Your Company"} />
                            </div>
                            <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                              <Clock size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Posted:{" "}
                              {new Date(job.postedAt).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                                job.status === "active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>

                          {/* Metrics */}
                          <td className="p-4 text-center font-extrabold text-slate-700 border-l border-slate-100 bg-slate-50/50">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/job/${job._id}/applicants`);
                              }}
                              className="cursor-pointer hover:text-indigo-600 hover:underline transition-colors block w-full"
                              title="View All Applicants"
                            >
                              {job.stats?.total || 0}
                            </span>
                          </td>

                          <td className="p-4 text-center font-bold text-blue-700 bg-blue-50/30">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/job/${job._id}/applicants?status=shortlisted`,
                                );
                              }}
                              className="cursor-pointer hover:text-blue-900 hover:underline transition-colors block w-full"
                              title="View Shortlisted"
                            >
                              {job.stats?.shortlisted || 0}
                            </span>
                          </td>

                          <td className="p-4 text-center font-bold text-purple-700 bg-purple-50/30">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/job/${job._id}/applicants?status=Interview Scheduled`,
                                );
                              }}
                              className="cursor-pointer hover:text-purple-900 hover:underline transition-colors block w-full"
                              title="View Interview Scheduled"
                            >
                              {job.stats?.interviewScheduled || 0}
                            </span>
                          </td>

                          <td className="p-4 text-center font-bold text-orange-700 bg-orange-50/30">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/job/${job._id}/applicants?status=Interview Conducted`,
                                );
                              }}
                              className="cursor-pointer hover:text-orange-900 hover:underline transition-colors block w-full"
                              title="View Interview Conducted"
                            >
                              {job.stats?.interviewConducted || 0}
                            </span>
                          </td>

                          <td className="p-4 text-center font-bold text-amber-700 bg-amber-50/30">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/job/${job._id}/applicants?status=Assignment Scheduled`,
                                );
                              }}
                              className="cursor-pointer hover:text-amber-900 hover:underline transition-colors block w-full"
                              title="View Assignment Scheduled"
                            >
                              {job.stats?.assignmentScheduled || 0}
                            </span>
                          </td>

                          <td className="p-4 text-center font-bold text-emerald-700 bg-emerald-50/30">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/job/${job._id}/applicants?status=hired`,
                                );
                              }}
                              className="cursor-pointer hover:text-emerald-900 hover:underline transition-colors block w-full"
                              title="View Hired"
                            >
                              {job.stats?.hired || 0}
                            </span>
                          </td>

                          <td className="p-4 text-center font-bold text-rose-700 bg-rose-50/30">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/job/${job._id}/applicants?status=NCTT`,
                                );
                              }}
                              className="cursor-pointer hover:text-rose-900 hover:underline transition-colors block w-full"
                              title="View NCTT"
                            >
                              {job.stats?.nctt || 0}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right border-l border-slate-100">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleJobStatus(job._id, job.status);
                                }}
                                disabled={
                                  job.status === "pending_approval" ||
                                  job.status === "rejected"
                                }
                                className={`p-2 rounded-lg transition-colors ${
                                  job.status === "pending_approval" ||
                                  job.status === "rejected"
                                    ? "text-slate-300 cursor-not-allowed bg-slate-50"
                                    : job.status === "active"
                                      ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                      : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                }`}
                                title={
                                  job.status === "pending_approval"
                                    ? "Pending Admin Approval"
                                    : job.status === "rejected"
                                      ? "Job Rejected"
                                      : job.status === "active"
                                        ? "Close Job"
                                        : "Reactivate Job"
                                }
                              >
                                <Power size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// FACT: Added onClick prop to the component parameters and the button element
function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${active ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
    >
      {icon} {label}
    </button>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm">
      <p className="text-[10px] sm:text-xs font-medium text-slate-500 truncate">{label}</p>
      <div className="mt-1 sm:mt-2 flex items-end justify-between">
        <h4 className="text-lg sm:text-2xl font-extrabold text-slate-900">{value}</h4>
        <span
          className={`rounded-lg px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-xs font-bold ${colors[color] || colors.blue}`}
        >
          Live
        </span>
      </div>
    </div>
  );
}

function MetricBox({ title, value, color, onClick }) {
  const colors = {
    slate: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
    blue: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
    orange: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    amber: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    rose: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
  };
  return (
    <div onClick={onClick} className={`rounded-lg p-1.5 text-center border cursor-pointer transition-colors ${colors[color]}`}>
      <div className="text-[8px] sm:text-[9px] font-bold uppercase truncate px-0.5 opacity-80" title={title}>{title}</div>
      <div className="text-xs sm:text-sm font-extrabold mt-0.5">{value}</div>
    </div>
  );
}

function JobCard({ job, toggleJobStatus, navigate, employerName }) {
  return (
    <div 
      onClick={() => navigate(`/job/${job._id}`)}
      className="border border-slate-200 bg-white rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-2.5 group relative"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
           <div className="font-extrabold text-slate-900 text-[13px] sm:text-[14px] group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight mb-1">{job.title}</div>
           <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-0.5"><CompanyDisplay job={job} fallback={employerName || "Your Company"} /></div>
           <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5"><Clock size={11} className="w-3 h-3" /> Posted: {new Date(job.postedAt).toLocaleDateString()}</div>
        </div>
        <span className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider whitespace-nowrap ${job.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
          {job.status}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 mt-1">
         <MetricBox title="Total" value={job.stats?.total || 0} color="slate" onClick={(e) => { e.stopPropagation(); navigate(`/job/${job._id}/applicants`); }} />
         <MetricBox title="Short" value={job.stats?.shortlisted || 0} color="blue" onClick={(e) => { e.stopPropagation(); navigate(`/job/${job._id}/applicants?status=shortlisted`); }} />
         <MetricBox title="Int S" value={job.stats?.interviewScheduled || 0} color="purple" onClick={(e) => { e.stopPropagation(); navigate(`/job/${job._id}/applicants?status=Interview Scheduled`); }} />
         <MetricBox title="Int C" value={job.stats?.interviewConducted || 0} color="orange" onClick={(e) => { e.stopPropagation(); navigate(`/job/${job._id}/applicants?status=Interview Conducted`); }} />
         <MetricBox title="Assig" value={job.stats?.assignmentScheduled || 0} color="amber" onClick={(e) => { e.stopPropagation(); navigate(`/job/${job._id}/applicants?status=Assignment Scheduled`); }} />
         <MetricBox title="Hired" value={job.stats?.hired || 0} color="emerald" onClick={(e) => { e.stopPropagation(); navigate(`/job/${job._id}/applicants?status=hired`); }} />
         <MetricBox title="NCTT" value={job.stats?.nctt || 0} color="rose" onClick={(e) => { e.stopPropagation(); navigate(`/job/${job._id}/applicants?status=NCTT`); }} />
      </div>

      <div className="flex items-center justify-between mt-2 border-t border-slate-100 pt-3">
         <span className="text-[10px] text-slate-400 font-medium px-1">Click to view details</span>
         <button
            onClick={(e) => {
              e.stopPropagation();
              toggleJobStatus(job._id, job.status);
            }}
            disabled={job.status === "pending_approval" || job.status === "rejected"}
            className={`p-1.5 sm:p-2 rounded-xl transition-colors ${
              job.status === "pending_approval" || job.status === "rejected"
                ? "text-slate-300 cursor-not-allowed bg-slate-50"
                : job.status === "active"
                  ? "text-rose-500 hover:text-white hover:bg-rose-500 bg-rose-50 border border-rose-100"
                  : "text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 border border-emerald-100"
            }`}
          >
            <Power size={14} />
          </button>
      </div>
    </div>
  );
}
