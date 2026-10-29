import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Loader2,
  Building2,
  Briefcase,
  ShieldAlert,
  ExternalLink,
  Download,
  Search,
  Users,
  FileText,
  Mail,
  UserPlus,
  Clock,
  ArrowRight,
  Check,
  XCircle,
  MoreVertical,
  CheckCircle2,
  Layers,
  BarChart3,
  Settings,
  ChevronRight,
  Eye,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import AdminLayout from "../components/admin/AdminLayout";
import AdminStatCard from "../components/admin/AdminStatCard";
import AdminChartPanel from "../components/admin/AdminChartPanel";
import AdminConfirmDialog from "../components/admin/AdminConfirmDialog";

export default function AdminDashboard() {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [allEmployers, setAllEmployers] = useState([]);
  const [allJobseekers, setAllJobseekers] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);

  // Search / Moderation States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("users");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Manage Admins States
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("employerAdmin");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    variant: "danger",
    action: null,
    loading: false,
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [adminInfo, setAdminInfo] = useState(null);
  const [dbStats, setDbStats] = useState({
    jobs: 0,
    jobseekers: 0,
    employers: 0,
  });

  // Table State for "Manage Jobs" Card
  const [jobsSearch, setJobsSearch] = useState("");
  const [jobsStatusFilter, setJobsStatusFilter] = useState("all");
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsPageSize] = useState(10);
  const [selectedJobIds, setSelectedJobIds] = useState([]);

  // Row Action Dropdown Menu State
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminInfo");
    if (!storedAdmin) {
      navigate("/admin/login");
      return;
    }

    try {
      const parsed = JSON.parse(storedAdmin);
      setAdminInfo(parsed);
      fetchInitialData(parsed);
    } catch {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    navigate(`/admin/dashboard?tab=${tabId}`, { replace: true });
  };

  // Close row action dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenActionMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ─── DATA FETCHING ────────────────────────────────────────────────────────

  const fetchInitialData = async (admin) => {
    try {
      const headers = { Authorization: `Bearer ${admin.token}` };
      const isSuper = admin.role === "superAdmin";
      const isEmployerAdmin = admin.role === "employerAdmin" || isSuper;
      const isJobseekerAdmin = admin.role === "jobseekerAdmin" || isSuper;

      const [
        statsRes,
        contactsRes,
        pJobsRes,
        aJobsRes,
        pEmpRes,
        aEmpRes,
        usersRes,
        adminsRes,
      ] = await Promise.all([
        axios
          .get(`${API_BASE_URL}/admin/stats`, { headers })
          .catch(() => ({ data: { jobs: 0, jobseekers: 0, employers: 0 } })),
        axios
          .get(`${API_BASE_URL}/admin/contacts`, { headers })
          .catch(() => ({ data: [] })),
        isEmployerAdmin
          ? axios
              .get(`${API_BASE_URL}/admin/jobs/pending`, { headers })
              .catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
        isEmployerAdmin
          ? axios
              .get(`${API_BASE_URL}/admin/jobs`, { headers })
              .catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
        isEmployerAdmin
          ? axios
              .get(`${API_BASE_URL}/admin/employers/pending`, { headers })
              .catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
        isEmployerAdmin
          ? axios
              .get(`${API_BASE_URL}/admin/employers`, { headers })
              .catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
        isJobseekerAdmin
          ? axios
              .get(`${API_BASE_URL}/admin/users`, { headers })
              .catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
        isSuper
          ? axios
              .get(`${API_BASE_URL}/admin/all-admins`, { headers })
              .catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
      ]);

      setDbStats(statsRes.data || { jobs: 0, jobseekers: 0, employers: 0 });
      setAllContacts(Array.isArray(contactsRes.data) ? contactsRes.data : []);

      if (isEmployerAdmin) {
        setPendingJobs(Array.isArray(pJobsRes.data) ? pJobsRes.data : []);
        setAllJobs(Array.isArray(aJobsRes.data) ? aJobsRes.data : []);
        setPendingEmployers(Array.isArray(pEmpRes.data) ? pEmpRes.data : []);
        setAllEmployers(Array.isArray(aEmpRes.data) ? aEmpRes.data : []);
      }

      if (isJobseekerAdmin) {
        setAllJobseekers(Array.isArray(usersRes.data) ? usersRes.data : []);
      }

      if (isSuper) {
        setAllAdmins(Array.isArray(adminsRes.data) ? adminsRes.data : []);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("adminInfo");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  // ─── ACTIONS ─────────────────────────────────────────────────────────────

  const handleReviewJob = async (id, status) => {
    try {
      const token = adminInfo?.token;
      await axios.patch(
        `${API_BASE_URL}/admin/jobs/${id}/review`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPendingJobs((prev) => prev.filter((j) => j._id !== id));
      const reviewedJob = pendingJobs.find((j) => j._id === id);
      if (reviewedJob) {
        setAllJobs((prev) => [
          { ...reviewedJob, status },
          ...prev.filter((j) => j._id !== id),
        ]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update job review status.");
    }
  };

  const handleReviewEmployer = async (id, status) => {
    try {
      const token = adminInfo?.token;
      await axios.patch(
        `${API_BASE_URL}/admin/employers/${id}/review`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPendingEmployers((prev) => prev.filter((e) => e._id !== id));
      const reviewedEmp = pendingEmployers.find((e) => e._id === id);
      if (reviewedEmp) {
        setAllEmployers((prev) => [
          { ...reviewedEmp, isApproved: status },
          ...prev.filter((e) => e._id !== id),
        ]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update employer status.");
    }
  };

  const handleFreezeToggle = async (id, isCurrentlyFrozen, type) => {
    setConfirmDialog({
      isOpen: true,
      title: `${isCurrentlyFrozen ? "Unfreeze" : "Freeze"} Account`,
      message: `Are you sure you want to ${
        isCurrentlyFrozen ? "restore access for" : "freeze"
      } this ${type === "user" ? "candidate" : "employer"} account?`,
      confirmText: isCurrentlyFrozen ? "Unfreeze" : "Freeze",
      variant: isCurrentlyFrozen ? "success" : "danger",
      loading: false,
      action: async () => {
        try {
          const token = adminInfo?.token;
          const endpoint =
            type === "user"
              ? `/admin/freeze-user/${id}`
              : `/admin/freeze-employer/${id}`;
          await axios.put(
            `${API_BASE_URL}${endpoint}`,
            { freeze: !isCurrentlyFrozen },
            { headers: { Authorization: `Bearer ${token}` } },
          );

          setSearchResults((prev) =>
            prev.map((item) =>
              item._id === id ? { ...item, isFrozen: !isCurrentlyFrozen } : item,
            ),
          );

          if (type === "user") {
            setAllJobseekers((prev) =>
              prev.map((u) =>
                u._id === id ? { ...u, isFrozen: !isCurrentlyFrozen } : u,
              ),
            );
          } else {
            setAllEmployers((prev) =>
              prev.map((e) =>
                e._id === id ? { ...e, isFrozen: !isCurrentlyFrozen } : e,
              ),
            );
          }

          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          alert(err.response?.data?.message || "Freeze operation failed.");
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleExport = async (type = "all") => {
    try {
      const token = adminInfo?.token;
      let url = `${API_BASE_URL}/admin/export/all`;
      let filename = "JobOne_Platform_DB.zip";

      if (type === "employers") {
        url = `${API_BASE_URL}/admin/export/employers`;
        filename = "JobOne_Employers.xlsx";
      } else if (type === "jobseekers") {
        url = `${API_BASE_URL}/admin/export/jobseekers`;
        filename = "JobOne_Jobseekers.xlsx";
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Export failed. Please check permissions.");
    }
  };

  // ─── COMPUTED METRICS ───────────────────────────────────────────────────

  const activeJobs = useMemo(
    () => allJobs.filter((j) => j.status === "active"),
    [allJobs],
  );

  const frozenAccountsCount = useMemo(() => {
    const frozenUsers = allJobseekers.filter((u) => u.isFrozen).length;
    const frozenEmps = allEmployers.filter((e) => e.isFrozen).length;
    return frozenUsers + frozenEmps;
  }, [allJobseekers, allEmployers]);

  // Combined real pending items for the right-side card
  const pendingApprovalsList = useMemo(() => {
    const jobs = pendingJobs.map((j) => ({
      id: j._id,
      type: "job",
      title: j.title,
      secondary: j.postedByCompany || j.postedByName || "Company Confidential",
      date: j.createdAt,
      status: "Pending",
      raw: j,
    }));

    const emps = pendingEmployers.map((e) => ({
      id: e._id,
      type: "employer",
      title: e.companyName || e.name || "New Employer",
      secondary: e.employerType === "individual" ? "Individual Recruiter" : "Company",
      date: e.createdAt,
      status: "Pending",
      raw: e,
    }));

    return [...jobs, ...emps].sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
    );
  }, [pendingJobs, pendingEmployers]);

  // Filtered & Paginated Jobs for "Manage Jobs" Card
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchSearch =
        !jobsSearch ||
        job.title?.toLowerCase().includes(jobsSearch.toLowerCase()) ||
        job.postedByCompany?.toLowerCase().includes(jobsSearch.toLowerCase()) ||
        job.postedByName?.toLowerCase().includes(jobsSearch.toLowerCase());

      const matchStatus =
        jobsStatusFilter === "all" || job.status === jobsStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [allJobs, jobsSearch, jobsStatusFilter]);

  const paginatedJobs = useMemo(() => {
    const start = (jobsPage - 1) * jobsPageSize;
    return filteredJobs.slice(start, start + jobsPageSize);
  }, [filteredJobs, jobsPage, jobsPageSize]);

  if (loading || !adminInfo) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] dark:bg-slate-950 flex flex-col justify-center items-center">
        <Loader2 className="animate-spin text-slate-900 dark:text-white mb-2" size={32} />
        <p className="text-xs font-semibold text-slate-500">Loading Admin Dashboard...</p>
      </div>
    );
  }

  const unreadContacts = allContacts.filter((c) => !c.isRead);

  return (
    <AdminLayout
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      adminInfo={adminInfo}
      pendingJobs={pendingJobs}
      pendingEmployers={pendingEmployers}
      unreadContacts={unreadContacts}
      onRefresh={() => fetchInitialData(adminInfo)}
      onLogout={handleLogout}
    >
      {/* =========================================================================
          VIEW: DASHBOARD (EXACT REFERENCE SPECIFICATION)
      ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Stats Header & Horizontal KPI Row */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-4">
              Quick Stats
            </h2>

            {/* Horizontal Row of Narrow, Tall, Rounded KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-5">
              <AdminStatCard
                title="Users"
                value={dbStats.jobseekers || allJobseekers.length}
                icon={Users}
                onClick={() => handleSelectTab("allJobseekers")}
              />
              <AdminStatCard
                title="Companies"
                value={dbStats.employers || allEmployers.length}
                icon={Building2}
                onClick={() => handleSelectTab("allEmployers")}
              />
              <AdminStatCard
                title="Active"
                value={activeJobs.length}
                icon={Briefcase}
                onClick={() => handleSelectTab("allJobs")}
              />
              <AdminStatCard
                title="Jobs"
                value={dbStats.jobs || allJobs.length}
                icon={Layers}
                onClick={() => handleSelectTab("allJobs")}
              />
              <AdminStatCard
                title="Applications"
                value={allJobs.reduce((acc, j) => acc + (j.applicants?.length || 0), 0)}
                icon={FileText}
                onClick={() => handleSelectTab("applications")}
              />
              <AdminStatCard
                title="Pending"
                value={pendingApprovalsList.length}
                icon={Clock}
                badge={pendingApprovalsList.length > 0 ? "Review" : null}
                badgeVariant="warning"
                onClick={() => handleSelectTab("pendingJobs")}
              />
              <AdminStatCard
                title="Reported"
                value={frozenAccountsCount}
                icon={ShieldAlert}
                onClick={() => handleSelectTab("searchFreeze")}
              />
            </div>
          </div>

          {/* Middle Row: Statistics (Left) & Pending Approvals (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Statistics Bar Chart (~65% width) */}
            <div className="lg:col-span-8">
              <AdminChartPanel jobs={allJobs} />
            </div>

            {/* Right: Pending Approvals Card (~35% width) */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-7 transition-colors flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Pending Approvals
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleSelectTab("pendingJobs")}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {pendingApprovalsList.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-3" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      All caught up! No pending approvals.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingApprovalsList.slice(0, 4).map((item) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-slate-200/80 dark:bg-slate-700 flex items-center justify-center font-black text-sm shrink-0 text-slate-700 dark:text-slate-200">
                            {item.title.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </p>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                              {item.secondary} • {item.date ? new Date(item.date).toLocaleDateString() : "Recent"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                            Pending
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              item.type === "job"
                                ? handleReviewJob(item.id, "active")
                                : handleReviewEmployer(item.id, "approved")
                            }
                            className="p-1.5 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition-opacity cursor-pointer"
                            title="Quick Approve"
                          >
                            <Check size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {pendingApprovalsList.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
                  {pendingApprovalsList.length} total pending in review queues
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Manage Jobs (Reference Table Card) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            {/* Card Header: Title on Left, Status & Export on Right */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Manage Jobs
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Integrated Compact Search */}
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={jobsSearch}
                    onChange={(e) => {
                      setJobsSearch(e.target.value);
                      setJobsPage(1);
                    }}
                    placeholder="Search jobs..."
                    className="pl-9 pr-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none w-44 sm:w-60"
                  />
                </div>

                {/* Compact Status Dropdown */}
                <select
                  value={jobsStatusFilter}
                  onChange={(e) => {
                    setJobsStatusFilter(e.target.value);
                    setJobsPage(1);
                  }}
                  className="px-3.5 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* Export Action Button */}
                <button
                  type="button"
                  onClick={() => handleExport("all")}
                  className="px-4 py-2 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Download size={15} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-5 w-12">
                      <input
                        type="checkbox"
                        checked={
                          paginatedJobs.length > 0 &&
                          selectedJobIds.length === paginatedJobs.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedJobIds(paginatedJobs.map((j) => j._id));
                          } else {
                            setSelectedJobIds([]);
                          }
                        }}
                        className="rounded border-slate-300 dark:border-slate-700 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-5">Job Title</th>
                    <th className="py-3.5 px-5">Company</th>
                    <th className="py-3.5 px-5">Location</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Posted Date</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {paginatedJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No jobs found.
                      </td>
                    </tr>
                  ) : (
                    paginatedJobs.map((job) => {
                      const locationStr =
                        typeof job.location === "object"
                          ? job.location?.address || "Remote"
                          : job.location || "Remote";

                      const isMenuOpen = openActionMenuId === job._id;

                      return (
                        <tr
                          key={job._id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-4 px-5">
                            <input
                              type="checkbox"
                              checked={selectedJobIds.includes(job._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedJobIds((prev) => [...prev, job._id]);
                                } else {
                                  setSelectedJobIds((prev) =>
                                    prev.filter((id) => id !== job._id),
                                  );
                                }
                              }}
                              className="rounded border-slate-300 dark:border-slate-700 cursor-pointer"
                            />
                          </td>
                          <td className="py-4 px-5 font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                            <Link
                              to={`/admin/job/${job._id}`}
                              className="hover:underline flex items-center gap-1.5"
                            >
                              <span>{job.title}</span>
                              <ExternalLink size={13} className="text-slate-400" />
                            </Link>
                          </td>
                          <td className="py-4 px-5 font-medium text-slate-700 dark:text-slate-300">
                            {job.postedByCompany || job.postedByName || "Company Confidential"}
                          </td>
                          <td className="py-4 px-5 font-medium text-slate-500 dark:text-slate-400">
                            {locationStr}
                          </td>
                          <td className="py-4 px-5">
                            <span
                              className={`px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider ${
                                job.status === "active"
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                                  : job.status === "pending"
                                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                                  : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                              }`}
                            >
                              {job.status || "active"}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-slate-500 font-mono text-xs sm:text-sm">
                            {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-4 px-5 text-right relative">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/admin/job/${job._id}`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </Link>
                              {job.status === "pending" && (
                                <button
                                  type="button"
                                  onClick={() => handleReviewJob(job._id, "active")}
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                                  title="Approve"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredJobs.length > jobsPageSize && (
              <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-semibold text-slate-600 dark:text-slate-400">
                <span>
                  Showing {(jobsPage - 1) * jobsPageSize + 1}–
                  {Math.min(jobsPage * jobsPageSize, filteredJobs.length)} of{" "}
                  {filteredJobs.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setJobsPage((p) => Math.max(1, p - 1))}
                    disabled={jobsPage === 1}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-slate-800 dark:text-slate-200 px-1.5">
                    {jobsPage}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setJobsPage((p) =>
                        p * jobsPageSize < filteredJobs.length ? p + 1 : p,
                      )
                    }
                    disabled={jobsPage * jobsPageSize >= filteredJobs.length}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: ALL JOBS / PENDING JOBS WORKSPACE
      ========================================================================= */}
      {(activeTab === "allJobs" || activeTab === "pendingJobs") && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {activeTab === "pendingJobs" ? "Pending Jobs Review" : "Manage Jobs"}
            </h2>
            <button
              type="button"
              onClick={() => handleExport("all")}
              className="px-3 py-1.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-5">Title</th>
                    <th className="py-3.5 px-5">Company</th>
                    <th className="py-3.5 px-5">Location</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {(activeTab === "pendingJobs" ? pendingJobs : allJobs).map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white text-base">
                        <Link to={`/admin/job/${job._id}`} className="hover:underline">
                          {job.title}
                        </Link>
                      </td>
                      <td className="py-4 px-5 font-medium text-slate-700 dark:text-slate-300">
                        {job.postedByCompany || job.postedByName || "Company Confidential"}
                      </td>
                      <td className="py-4 px-5 font-medium text-slate-500 dark:text-slate-400">
                        {typeof job.location === "object" ? job.location?.address || "Remote" : job.location || "Remote"}
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-3 py-1 rounded-full font-black text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {job.status || "active"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {job.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => handleReviewJob(job._id, "active")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          <Link
                            to={`/admin/job/${job._id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] hover:bg-slate-200 dark:hover:bg-slate-700"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: APPLICATIONS
      ========================================================================= */}
      {activeTab === "applications" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Platform Applications
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs text-center">
            <FileText size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Applications Overview
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Candidate submissions are managed within each individual job posting view. Select a job from the Jobs directory to view candidates.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: COMPANIES (ALL & PENDING EMPLOYERS)
      ========================================================================= */}
      {activeTab === "allEmployers" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Companies & Employers
            </h2>
            <button
              type="button"
              onClick={() => handleExport("employers")}
              className="px-3 py-1.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-5">Company Name</th>
                    <th className="py-3.5 px-5">Email</th>
                    <th className="py-3.5 px-5">Approval</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {allEmployers.map((emp) => (
                    <tr key={emp._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white text-base">
                        <Link to={`/admin/employer/${emp._id}`} className="hover:underline">
                          {emp.companyName || emp.name}
                        </Link>
                      </td>
                      <td className="py-4 px-5 font-mono text-sm text-slate-600 dark:text-slate-400">{emp.email}</td>
                      <td className="py-4 px-5">
                        <span className="px-3 py-1 rounded-full font-black text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {emp.isApproved || "pending"}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-3 py-1 rounded-full font-black text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {emp.isFrozen ? "Frozen" : "Active"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {emp.isApproved === "pending" && (
                            <button
                              type="button"
                              onClick={() => handleReviewEmployer(emp._id, "approved")}
                              className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleFreezeToggle(emp._id, emp.isFrozen, "employer")}
                            className="px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-bold text-[10px]"
                          >
                            {emp.isFrozen ? "Unfreeze" : "Freeze"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: USERS (CANDIDATES DIRECTORY)
      ========================================================================= */}
      {activeTab === "allJobseekers" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Users & Candidates
            </h2>
            <button
              type="button"
              onClick={() => handleExport("jobseekers")}
              className="px-3 py-1.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-5">Candidate</th>
                    <th className="py-3.5 px-5">Email</th>
                    <th className="py-3.5 px-5">Phone</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {allJobseekers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white text-base">
                        <Link to={`/admin/user/${u._id}`} className="hover:underline">
                          {u.name || "Candidate"}
                        </Link>
                      </td>
                      <td className="py-4 px-5 font-mono text-sm text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="py-4 px-5 font-medium text-slate-500 dark:text-slate-400">{u.phone || "—"}</td>
                      <td className="py-4 px-5">
                        <span className="px-3 py-1 rounded-full font-black text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {u.isFrozen ? "Frozen" : "Active"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleFreezeToggle(u._id, u.isFrozen, "user")}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 font-bold text-[11px] cursor-pointer"
                        >
                          {u.isFrozen ? "Unfreeze" : "Freeze"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: CATEGORIES
      ========================================================================= */}
      {activeTab === "categories" && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Job Categories
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs text-center">
            <Layers size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Taxonomy & Sectors
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Categories are assigned dynamically by employers during job creation and tracked in the Statistics chart.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: REPORTS / EXPORT
      ========================================================================= */}
      {activeTab === "exportDB" && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Reports & Database Exports
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Full Platform Database</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">Complete backup ZIP archive.</p>
              </div>
              <button
                type="button"
                onClick={() => handleExport("all")}
                className="py-2 px-3 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold cursor-pointer"
              >
                Download ZIP
              </button>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Employers Directory</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">Excel workbook of company profiles.</p>
              </div>
              <button
                type="button"
                onClick={() => handleExport("employers")}
                className="py-2 px-3 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold cursor-pointer"
              >
                Download XLSX
              </button>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Candidates Directory</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">Excel sheet of registered jobseekers.</p>
              </div>
              <button
                type="button"
                onClick={() => handleExport("jobseekers")}
                className="py-2 px-3 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold cursor-pointer"
              >
                Download XLSX
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: SETTINGS
      ========================================================================= */}
      {activeTab === "settings" && (
        <div className="space-y-5 max-w-2xl">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Settings & Administrator Profile
          </h2>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Name</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {adminInfo?.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Email</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {adminInfo?.email}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Assigned Role</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold uppercase text-[10px]">
                  {adminInfo?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((p) => ({ ...p, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        loading={confirmDialog.loading}
      />
    </AdminLayout>
  );
}
