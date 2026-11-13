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
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  Phone,
  Shield,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../routes/Context";
import AdminLayout from "../components/admin/AdminLayout";
import AdminStatCard from "../components/admin/AdminStatCard";
import AdminKPISection from "../components/admin/AdminKPISection";
import AdminChartPanel from "../components/admin/AdminChartPanel";
import AdminConfirmDialog from "../components/admin/AdminConfirmDialog";
import AdminActivityFeed from "../components/admin/AdminActivityFeed";
import AdminUserDetailDrawer from "../components/admin/AdminUserDetailDrawer";
import AdminEmployerDetailDrawer from "../components/admin/AdminEmployerDetailDrawer";
import AdminJobDetailDrawer from "../components/admin/AdminJobDetailDrawer";
import AdminAnalyticsView from "../components/admin/AdminAnalyticsView";
import AdminAuditLogsView from "../components/admin/AdminAuditLogsView";
import AdminNotificationsView from "../components/admin/AdminNotificationsView";
import AdminSettingsView from "../components/admin/AdminSettingsView";
import AdminExportCentre from "../components/admin/AdminExportCentre";
import { INDUSTRIES, normalizeIndustry } from "../constants/taxonomy";
import AdminActivityWorkspace from "../components/admin/AdminActivityWorkspace";

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

  // User Management State
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [userVerificationFilter, setUserVerificationFilter] = useState("all");
  const [userSort, setUserSort] = useState("newest");
  const [userPage, setUserPage] = useState(1);
  const [userPageSize] = useState(10);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedUserIdForDrawer, setSelectedUserIdForDrawer] = useState(null);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);

  // Employer Verification State
  const [empSubTab, setEmpSubTab] = useState("all");
  const [empSearch, setEmpSearch] = useState("");
  const [empEntityFilter, setEmpEntityFilter] = useState("all");
  const [empApprovalFilter, setEmpApprovalFilter] = useState("all");
  const [empFreezeFilter, setEmpFreezeFilter] = useState("all");
  const [empSort, setEmpSort] = useState("newest");
  const [empPage, setEmpPage] = useState(1);
  const [empPageSize] = useState(10);
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [selectedEmpIdForDrawer, setSelectedEmpIdForDrawer] = useState(null);
  const [isEmpDrawerOpen, setIsEmpDrawerOpen] = useState(false);

  // Job Moderation Workspace State
  const [jobModSubTab, setJobModSubTab] = useState("all");
  const [jobModSearch, setJobModSearch] = useState("");
  const [jobModStatusFilter, setJobModStatusFilter] = useState("all");
  const [jobModIndustryFilter, setJobModIndustryFilter] = useState("all");
  const [jobModSort, setJobModSort] = useState("newest");
  const [jobModPage, setJobModPage] = useState(1);
  const [jobModPageSize] = useState(10);
  const [selectedJobModIds, setSelectedJobModIds] = useState([]);
  const [selectedJobIdForDrawer, setSelectedJobIdForDrawer] = useState(null);
  const [isJobDrawerOpen, setIsJobDrawerOpen] = useState(false);

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
      if (tabParam === "pendingEmployers") {
        setEmpSubTab("pending");
      } else if (tabParam === "pendingJobs") {
        setJobModSubTab("pending");
      }
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

  const { logout } = useAuth();

  const handleLogout = () => {
    try {
      logout();
    } catch (_err) {
      /* ignore */
    }
    localStorage.removeItem("adminInfo");
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true, state: { loggedOut: true } });
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

  const handleBulkReviewJobs = async (status) => {
    if (selectedJobIds.length === 0) return;
    try {
      const token = adminInfo?.token;
      await Promise.all(
        selectedJobIds.map((id) =>
          axios.patch(
            `${API_BASE_URL}/admin/jobs/${id}/review`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ),
      );
      setAllJobs((prev) =>
        prev.map((j) => (selectedJobIds.includes(j._id) ? { ...j, status } : j)),
      );
      setPendingJobs((prev) => prev.filter((j) => !selectedJobIds.includes(j._id)));
      setSelectedJobIds([]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to perform bulk action.");
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

  // ─── BULK ACTIONS ────────────────────────────────────────────────────────

  const handleBulkFreezeUsers = async (freeze) => {
    if (selectedUserIds.length === 0) return;
    try {
      const token = adminInfo?.token;
      await Promise.all(
        selectedUserIds.map((id) =>
          axios.put(
            `${API_BASE_URL}/admin/freeze-user/${id}`,
            { freeze },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      setAllJobseekers((prev) =>
        prev.map((u) => (selectedUserIds.includes(u._id) ? { ...u, isFrozen: freeze } : u))
      );
      setSelectedUserIds([]);
    } catch {
      alert("Failed to update candidate freeze status.");
    }
  };

  const handleBulkReviewEmployers = async (status) => {
    if (selectedEmpIds.length === 0) return;
    try {
      const token = adminInfo?.token;
      await Promise.all(
        selectedEmpIds.map((id) =>
          axios.patch(
            `${API_BASE_URL}/admin/employers/${id}/review`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      setAllEmployers((prev) =>
        prev.map((e) => (selectedEmpIds.includes(e._id) ? { ...e, isApproved: status } : e))
      );
      setPendingEmployers((prev) => prev.filter((e) => !selectedEmpIds.includes(e._id)));
      setSelectedEmpIds([]);
    } catch {
      alert("Failed to update employer review status.");
    }
  };

  const handleBulkModerationJobs = async (status) => {
    if (selectedJobModIds.length === 0) return;
    try {
      const token = adminInfo?.token;
      await Promise.all(
        selectedJobModIds.map((id) =>
          axios.patch(
            `${API_BASE_URL}/admin/jobs/${id}/review`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      setAllJobs((prev) =>
        prev.map((j) => (selectedJobModIds.includes(j._id) ? { ...j, status } : j))
      );
      setPendingJobs((prev) => prev.filter((j) => !selectedJobModIds.includes(j._id)));
      setSelectedJobModIds([]);
    } catch {
      alert("Failed to update job review status.");
    }
  };

  // ─── USER MANAGEMENT COMPUTED LISTS ────────────────────────────────────
  const filteredUsers = useMemo(() => {
    let list = [...allJobseekers];

    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.includes(q)
      );
    }

    if (userStatusFilter === "active") list = list.filter((u) => !u.isFrozen);
    if (userStatusFilter === "frozen") list = list.filter((u) => u.isFrozen);

    if (userVerificationFilter === "verified") list = list.filter((u) => u.isVerified);
    if (userVerificationFilter === "unverified") list = list.filter((u) => !u.isVerified);

    if (userSort === "newest") {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (userSort === "oldest") {
      list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (userSort === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return list;
  }, [allJobseekers, userSearch, userStatusFilter, userVerificationFilter, userSort]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * userPageSize;
    return filteredUsers.slice(start, start + userPageSize);
  }, [filteredUsers, userPage, userPageSize]);

  // ─── EMPLOYER VERIFICATION COMPUTED LISTS ──────────────────────────────
  const filteredEmployers = useMemo(() => {
    let list = [...allEmployers];

    if (empSubTab === "pending") {
      list = list.filter((e) => e.isApproved === "pending");
    }

    if (empSearch.trim()) {
      const q = empSearch.toLowerCase();
      list = list.filter(
        (e) =>
          e.companyName?.toLowerCase().includes(q) ||
          e.name?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q)
      );
    }

    if (empEntityFilter !== "all") {
      list = list.filter((e) => (e.employerType || "company") === empEntityFilter);
    }

    if (empApprovalFilter !== "all") {
      list = list.filter((e) => (e.isApproved || "pending") === empApprovalFilter);
    }

    if (empFreezeFilter === "active") list = list.filter((e) => !e.isFrozen);
    if (empFreezeFilter === "frozen") list = list.filter((e) => e.isFrozen);

    if (empSort === "newest") {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (empSort === "oldest") {
      list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (empSort === "name") {
      list.sort((a, b) => (a.companyName || a.name || "").localeCompare(b.companyName || b.name || ""));
    }

    return list;
  }, [allEmployers, empSubTab, empSearch, empEntityFilter, empApprovalFilter, empFreezeFilter, empSort]);

  const paginatedEmployers = useMemo(() => {
    const start = (empPage - 1) * empPageSize;
    return filteredEmployers.slice(start, start + empPageSize);
  }, [filteredEmployers, empPage, empPageSize]);

  // ─── JOB MODERATION COMPUTED LISTS ────────────────────────────────────
  const filteredModerationJobs = useMemo(() => {
    let list = [...allJobs];

    if (activeTab === "pendingJobs" || jobModSubTab === "pending") {
      list = list.filter((j) => j.status === "pending_approval" || j.status === "pending");
    }

    if (jobModSearch.trim()) {
      const q = jobModSearch.toLowerCase();
      list = list.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.postedByCompany?.toLowerCase().includes(q) ||
          j.postedByName?.toLowerCase().includes(q)
      );
    }

    if (jobModStatusFilter !== "all") {
      if (jobModStatusFilter === "pending") {
        list = list.filter((j) => j.status === "pending_approval" || j.status === "pending");
      } else {
        list = list.filter((j) => j.status === jobModStatusFilter);
      }
    }

    if (jobModIndustryFilter !== "all") {
      list = list.filter(
        (j) =>
          normalizeIndustry(j.industry)?.name === normalizeIndustry(jobModIndustryFilter)?.name ||
          (j.industry || "").toLowerCase().includes(jobModIndustryFilter.toLowerCase())
      );
    }

    if (jobModSort === "newest") {
      list.sort((a, b) => new Date(b.createdAt || b.postedAt || 0) - new Date(a.createdAt || a.postedAt || 0));
    } else if (jobModSort === "oldest") {
      list.sort((a, b) => new Date(a.createdAt || a.postedAt || 0) - new Date(b.createdAt || b.postedAt || 0));
    } else if (jobModSort === "title") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return list;
  }, [allJobs, activeTab, jobModSubTab, jobModSearch, jobModStatusFilter, jobModIndustryFilter, jobModSort]);

  const paginatedModerationJobs = useMemo(() => {
    const start = (jobModPage - 1) * jobModPageSize;
    return filteredModerationJobs.slice(start, start + jobModPageSize);
  }, [filteredModerationJobs, jobModPage, jobModPageSize]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  if (loading || !adminInfo) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col justify-center items-center">
        <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center mb-3 shadow-xs">
          <Loader2 className="animate-spin text-[var(--theme-text)]" size={20} />
        </div>
        <p className="text-xs font-mono font-medium text-[var(--theme-text-muted)]">
          Authenticating Executive Session...
        </p>
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
      jobs={allJobs}
      employers={allEmployers}
      jobseekers={allJobseekers}
      onRefresh={() => fetchInitialData(adminInfo)}
      onLogout={handleLogout}
    >
      {/* =========================================================================
          VIEW: DASHBOARD (EXECUTIVE CONTROL CENTER)
      ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6 min-w-0 w-full animate-in fade-in duration-200">
          {/* Executive Welcome Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[var(--theme-text)]">
                  {greeting}, {adminInfo?.name?.split(" ")[0] || "Executive"}
                </h1>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] uppercase tracking-wider">
                  {adminInfo?.role === "superAdmin"
                    ? "Super Administrator"
                    : adminInfo?.role === "employerAdmin"
                    ? "Employer Administrator"
                    : "Candidate Administrator"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] mt-1">
                Platform executive oversight, recruitment velocity, and moderation queues.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Live Operational Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text)] shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>System: Operational • All Services Live</span>
              </div>

              {/* Export quick button */}
              <button
                type="button"
                onClick={() => handleExport("all")}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Download platform data archive"
              >
                <Download size={13} />
                <span>Quick Export</span>
              </button>
            </div>
          </div>

          {/* Conditional Pending Alert Banner */}
          {pendingApprovalsList.length > 0 && (
            <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[#C0C0C0] shrink-0">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[var(--theme-text)] font-display">
                      Executive Moderation Required
                    </p>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[var(--theme-text)] text-[var(--theme-bg)]">
                      {pendingApprovalsList.length} PENDING
                    </span>
                  </div>
                  <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                    {pendingJobs.length} job posting{pendingJobs.length === 1 ? "" : "s"} and {pendingEmployers.length} company KYC account{pendingEmployers.length === 1 ? "" : "s"} awaiting review.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSelectTab("pendingJobs")}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>Open Moderation Queue</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Redesigned Advanced Interactive KPI Widgets Section */}
          <AdminKPISection
            allJobs={allJobs}
            allEmployers={allEmployers}
            allJobseekers={allJobseekers}
            pendingJobs={pendingJobs}
            pendingEmployers={pendingEmployers}
            unreadContacts={unreadContacts}
            dbStats={dbStats}
            onSelectTab={handleSelectTab}
            onReviewJob={handleReviewJob}
            onReviewEmployer={handleReviewEmployer}
            loading={loading}
          />

          {/* Middle Row: Statistics (Left) & Pending Approvals (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            {/* Left: Statistics Bar Chart (~65% width) */}
            <div className="lg:col-span-7 xl:col-span-8">
              <AdminChartPanel jobs={allJobs} />
            </div>

            {/* Right: Pending Approvals Card (~35% width) */}
            <div className="lg:col-span-5 xl:col-span-4 bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-xs p-5 sm:p-6 transition-colors flex flex-col justify-between min-h-[360px] sm:min-h-[420px]">
              <div>
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[var(--theme-border)]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)]">
                      <ShieldAlert size={15} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold font-display tracking-tight text-[var(--theme-text)]">
                      Pending Approvals
                    </h3>
                    {pendingApprovalsList.length > 0 && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)]">
                        {pendingApprovalsList.length}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectTab("pendingJobs")}
                    className="text-xs font-mono font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:underline cursor-pointer"
                  >
                    Queue &rarr;
                  </button>
                </div>

                {pendingApprovalsList.length === 0 ? (
                  <div className="py-14 text-center">
                    <CheckCircle2 size={36} className="mx-auto text-emerald-500/80 mb-2.5" />
                    <p className="text-sm font-bold text-[var(--theme-text)]">
                      Queue Cleared
                    </p>
                    <p className="text-xs text-[var(--theme-text-muted)] mt-1 max-w-[220px] mx-auto">
                      All job postings and employer verification submissions have been reviewed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {pendingApprovalsList.slice(0, 4).map((item) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between gap-3 hover:border-[var(--theme-border-silver)] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center font-mono font-bold text-xs shrink-0 text-[var(--theme-text)]">
                            {item.title.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded-xs bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]">
                                {item.type === "job" ? "JOB" : "KYC"}
                              </span>
                              <p className="text-xs font-semibold text-[var(--theme-text)] truncate">
                                {item.title}
                              </p>
                            </div>
                            <p className="text-[11px] font-mono text-[var(--theme-text-muted)] truncate mt-0.5">
                              {item.secondary} • {item.date ? new Date(item.date).toLocaleDateString() : "Recent"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              item.type === "job"
                                ? handleReviewJob(item.id, "active")
                                : handleReviewEmployer(item.id, "approved")
                            }
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                            title="Quick Approve"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              item.type === "job"
                                ? handleReviewJob(item.id, "rejected")
                                : handleReviewEmployer(item.id, "rejected")
                            }
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                            title="Quick Reject"
                          >
                            <XCircle size={13} />
                          </button>
                          <Link
                            to={item.type === "job" ? `/admin/job/${item.id}` : `/admin/employer/${item.id}`}
                            className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors"
                            title="Inspect Details"
                          >
                            <Eye size={13} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {pendingApprovalsList.length > 0 && (
                <div className="pt-3 border-t border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text-muted)] flex items-center justify-between">
                  <span>{pendingApprovalsList.length} item{pendingApprovalsList.length === 1 ? "" : "s"} in queue</span>
                  <button
                    type="button"
                    onClick={() => handleSelectTab("pendingJobs")}
                    className="text-[var(--theme-text)] font-semibold hover:underline cursor-pointer"
                  >
                    Process All &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Audit Feed / Chronological Platform Activity */}
          <AdminActivityFeed
            jobs={allJobs}
            employers={allEmployers}
            jobseekers={allJobseekers}
            contacts={allContacts}
            onSelectTab={handleSelectTab}
          />

          {/* Bottom Row: Manage Jobs (High-Density Table Card) */}
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-xs overflow-hidden transition-colors">
            {/* Card Header: Title on Left, Status & Export on Right */}
            <div className="p-4 sm:p-5 border-b border-[var(--theme-border)] flex flex-col md:flex-row md:items-center justify-between gap-3.5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)]">
                  <Briefcase size={15} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-display tracking-tight text-[var(--theme-text)]">
                    Manage Jobs Directory
                  </h3>
                  <p className="text-xs text-[var(--theme-text-muted)]">
                    Active, pending, and moderated position postings across organizations
                  </p>
                </div>

                {selectedJobIds.length > 0 && (
                  <div className="flex items-center gap-2 bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] px-3 py-1 rounded-lg text-xs font-mono animate-in fade-in">
                    <span className="font-bold">{selectedJobIds.length} selected</span>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleBulkReviewJobs("active")}
                      className="text-emerald-400 hover:underline cursor-pointer font-bold"
                    >
                      Approve
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleBulkReviewJobs("rejected")}
                      className="text-rose-400 hover:underline cursor-pointer font-bold"
                    >
                      Reject
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedJobIds([])}
                      className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                {/* Integrated Compact Search */}
                <div className="relative flex-1 sm:flex-initial">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
                  <input
                    type="text"
                    value={jobsSearch}
                    onChange={(e) => {
                      setJobsSearch(e.target.value);
                      setJobsPage(1);
                    }}
                    placeholder="Search jobs by title or company..."
                    className="pl-9 pr-3.5 py-1.5 text-xs font-mono rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-border-silver)] w-full sm:w-56 md:w-64 transition-colors"
                  />
                </div>

                {/* Compact Status Dropdown */}
                <select
                  value={jobsStatusFilter}
                  onChange={(e) => {
                    setJobsStatusFilter(e.target.value);
                    setJobsPage(1);
                  }}
                  className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none cursor-pointer focus:border-[var(--theme-border-silver)] transition-colors"
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
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] text-xs font-mono font-semibold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[720px]">
                <thead className="bg-[var(--theme-surface-elevated)]/60 text-[var(--theme-text-muted)] font-mono uppercase tracking-wider border-b border-[var(--theme-border)]">
                  <tr>
                    <th className="py-3 px-4 w-10">
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
                        className="rounded border-[var(--theme-border)] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Job Title</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Posted Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--theme-border)] text-[var(--theme-text)]">
                  {paginatedJobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[var(--theme-text-muted)] font-mono">
                        No jobs matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedJobs.map((job) => {
                      const locationStr =
                        typeof job.location === "object"
                          ? job.location?.address || "Remote"
                          : job.location || "Remote";

                      return (
                        <tr
                          key={job._id}
                          className="hover:bg-[var(--theme-surface-elevated)]/50 transition-colors"
                        >
                          <td className="py-3.5 px-4">
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
                              className="rounded border-[var(--theme-border)] cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[var(--theme-text)] text-sm">
                            <Link
                              to={`/admin/job/${job._id}`}
                              className="hover:underline flex items-center gap-1.5"
                            >
                              <span>{job.title}</span>
                              <ExternalLink size={12} className="text-[var(--theme-text-muted)]" />
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-[var(--theme-text-muted)]">
                            {job.postedByCompany || job.postedByName || "Company Confidential"}
                          </td>
                          <td className="py-3.5 px-4 text-[var(--theme-text-muted)] font-mono text-[11px]">
                            {locationStr}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
                                job.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : job.status === "pending"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {job.status || "active"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[var(--theme-text-muted)] font-mono text-[11px]">
                            {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                to={`/admin/job/${job._id}`}
                                className="p-1 rounded-md text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-elevated)] transition-colors"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </Link>
                              {job.status === "pending" && (
                                <button
                                  type="button"
                                  onClick={() => handleReviewJob(job._id, "active")}
                                  className="p-1 rounded-md text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                  title="Approve"
                                >
                                  <Check size={14} />
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
              <div className="p-3.5 sm:p-4 border-t border-[var(--theme-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[var(--theme-text-muted)]">
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
                    className="px-3 py-1 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] font-semibold disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-[var(--theme-text)] px-1.5">
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
                    className="px-3 py-1 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] font-semibold disabled:opacity-40 cursor-pointer transition-colors"
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
          VIEW: PLATFORM INTELLIGENCE & ANALYTICS
      ========================================================================= */}
      {activeTab === "analytics" && (
        <AdminAnalyticsView
          allJobs={allJobs}
          allEmployers={allEmployers}
          allJobseekers={allJobseekers}
          pendingJobs={pendingJobs}
          pendingEmployers={pendingEmployers}
          unreadContacts={unreadContacts}
          dbStats={dbStats}
          onSelectTab={handleSelectTab}
        />
      )}

      {/* =========================================================================
          VIEW: ALL JOBS / PENDING JOBS (JOB MODERATION WORKSPACE)
      ========================================================================= */}
      {(activeTab === "allJobs" || activeTab === "pendingJobs") &&
        (adminInfo?.role === "jobseekerAdmin" ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-[var(--theme-text)]">
              Access Restricted by Clearance Policy
            </h3>
            <p className="text-xs text-[var(--theme-text-muted)] max-w-md mx-auto font-mono">
              Your profile is assigned the <strong className="text-[var(--theme-text)]">jobseekerAdmin</strong> role. Job moderation and listing review privileges are restricted to Super Administrators and Employer Administrators.
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)]">
                  <Briefcase size={16} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[var(--theme-text)]">
                  {activeTab === "pendingJobs" ? "Pending Job Moderation Queue" : "Job Listings Moderation Workspace"}
                </h2>
              </div>
              <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                Review, approve, reject, and moderate position postings across organizations
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExport("all")}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] text-xs font-mono font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer w-fit"
            >
              <Download size={13} />
              <span>Export All Jobs</span>
            </button>
          </div>

          {/* Metric Telemetry Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
              <span className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1">
                Total Postings
              </span>
              <p className="text-xl sm:text-2xl font-extrabold font-display text-[var(--theme-text)]">
                {allJobs.length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider block">
                  Pending Review
                </span>
                {pendingJobs.length > 0 && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </div>
              <p className="text-xl sm:text-2xl font-extrabold font-display text-amber-400">
                {pendingJobs.length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
              <span className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1">
                Active & Live
              </span>
              <p className="text-xl sm:text-2xl font-extrabold font-display text-emerald-400">
                {allJobs.filter((j) => j.status === "active").length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
              <span className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1">
                Rejected / Inactive
              </span>
              <p className="text-xl sm:text-2xl font-extrabold font-display text-[var(--theme-text-muted)]">
                {allJobs.filter((j) => j.status === "rejected" || j.status === "hidden" || j.status === "inactive").length}
              </p>
            </div>
          </div>

          {/* Sub-Tabs: All vs Pending */}
          <div className="flex items-center gap-2 border-b border-[var(--theme-border)] pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setJobModSubTab("all");
                setJobModPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer shrink-0 ${
                jobModSubTab === "all" && activeTab !== "pendingJobs"
                  ? "bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold shadow-xs"
                  : "bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] border border-[var(--theme-border)]"
              }`}
            >
              All Listings ({allJobs.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setJobModSubTab("pending");
                setJobModPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                jobModSubTab === "pending" || activeTab === "pendingJobs"
                  ? "bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold shadow-xs"
                  : "bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] border border-[var(--theme-border)]"
              }`}
            >
              <span>Pending Moderation</span>
              {pendingJobs.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-black">
                  {pendingJobs.length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
              <input
                type="text"
                value={jobModSearch}
                onChange={(e) => {
                  setJobModSearch(e.target.value);
                  setJobModPage(1);
                }}
                placeholder="Search job title, company name, recruiter..."
                className="pl-9 pr-3.5 py-1.5 text-xs font-mono rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-border-silver)] w-full transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={jobModStatusFilter}
                onChange={(e) => {
                  setJobModStatusFilter(e.target.value);
                  setJobModPage(1);
                }}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none cursor-pointer focus:border-[var(--theme-border-silver)] transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active (Live)</option>
                <option value="pending">Pending Approval</option>
                <option value="rejected">Rejected</option>
                <option value="hidden">Hidden</option>
              </select>

              <select
                value={jobModIndustryFilter}
                onChange={(e) => {
                  setJobModIndustryFilter(e.target.value);
                  setJobModPage(1);
                }}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none cursor-pointer focus:border-[var(--theme-border-silver)] transition-colors"
              >
                <option value="all">All Industries (24 Sectors)</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind.id} value={ind.name}>
                    {ind.shortName || ind.name}
                  </option>
                ))}
              </select>

              <select
                value={jobModSort}
                onChange={(e) => setJobModSort(e.target.value)}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none cursor-pointer focus:border-[var(--theme-border-silver)] transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Contextual Bulk Action Bar */}
          {selectedJobModIds.length > 0 && (
            <div className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex flex-wrap items-center justify-between gap-3 animate-in fade-in shadow-xs text-xs font-mono">
              <span className="font-bold text-[var(--theme-text)]">
                {selectedJobModIds.length} position listing{selectedJobModIds.length === 1 ? "" : "s"} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkModerationJobs("active")}
                  className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold transition-colors cursor-pointer"
                >
                  Bulk Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkModerationJobs("rejected")}
                  className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold transition-colors cursor-pointer"
                >
                  Bulk Reject
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedJobModIds([])}
                  className="px-2.5 py-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-xs overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-[var(--theme-surface-elevated)]/60 text-[var(--theme-text-muted)] font-mono uppercase tracking-wider border-b border-[var(--theme-border)]">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedModerationJobs.length > 0 &&
                          selectedJobModIds.length === paginatedModerationJobs.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedJobModIds(paginatedModerationJobs.map((j) => j._id));
                          } else {
                            setSelectedJobModIds([]);
                          }
                        }}
                        className="rounded border-[var(--theme-border)] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Position Title & Vertical</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Compensation</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Posted Date</th>
                    <th className="py-3 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--theme-border)] text-[var(--theme-text)]">
                  {paginatedModerationJobs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs font-mono text-[var(--theme-text-muted)]">
                        Zero job listings matching selected moderation criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedModerationJobs.map((job) => {
                      const locationStr =
                        typeof job.location === "object"
                          ? job.location?.address || "Remote"
                          : job.location || "Remote";

                      return (
                        <tr
                          key={job._id}
                          className="hover:bg-[var(--theme-surface-elevated)]/50 transition-colors group"
                        >
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={selectedJobModIds.includes(job._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedJobModIds((p) => [...p, job._id]);
                                } else {
                                  setSelectedJobModIds((p) => p.filter((id) => id !== job._id));
                                }
                              }}
                              className="rounded border-[var(--theme-border)] cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/admin/job/${job._id}`}
                                className="font-semibold text-sm text-[var(--theme-text)] hover:underline flex items-center gap-1.5"
                              >
                                <span>{job.title}</span>
                                <ExternalLink size={11} className="text-[var(--theme-text-muted)] opacity-60 group-hover:opacity-100" />
                              </Link>
                            </div>
                            <span className="font-mono text-[10px] text-[var(--theme-text-muted)] mt-0.5 block">
                              {job.industry || "General"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[var(--theme-text-muted)] font-mono text-xs">
                            {job.postedByCompany || job.postedByName || "Company Confidential"}
                          </td>
                          <td className="py-3.5 px-4 text-[var(--theme-text-muted)] font-mono text-[11px]">
                            {locationStr}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--theme-text-muted)]">
                            {job.salaryMin === 0 && job.salaryMax === 0
                              ? "Unpaid"
                              : `${job.salaryCurrency || "INR"} ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}`}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
                                job.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : job.status === "pending_approval" || job.status === "pending"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--theme-text-muted)]">
                            {job.createdAt || job.postedAt ? new Date(job.createdAt || job.postedAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedJobIdForDrawer(job._id);
                                  setIsJobDrawerOpen(true);
                                }}
                                className="p-1 rounded-md text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-elevated)] transition-colors cursor-pointer"
                                title="Quick Inspect Drawer"
                              >
                                <Eye size={14} />
                              </button>
                              {job.status === "pending_approval" || job.status === "pending" ? (
                                <button
                                  type="button"
                                  onClick={() => handleReviewJob(job._id, "active")}
                                  className="p-1 rounded-md text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                  title="Approve Listing"
                                >
                                  <Check size={14} />
                                </button>
                              ) : null}
                              {job.status !== "rejected" && (
                                <button
                                  type="button"
                                  onClick={() => handleReviewJob(job._id, "rejected")}
                                  className="p-1 rounded-md text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="Reject Listing"
                                >
                                  <XCircle size={14} />
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

            {/* Pagination */}
            {filteredModerationJobs.length > jobModPageSize && (
              <div className="p-3.5 sm:p-4 border-t border-[var(--theme-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[var(--theme-text-muted)]">
                <span>
                  Showing {(jobModPage - 1) * jobModPageSize + 1}–
                  {Math.min(jobModPage * jobModPageSize, filteredModerationJobs.length)} of{" "}
                  {filteredModerationJobs.length} listings
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setJobModPage((p) => Math.max(1, p - 1))}
                    disabled={jobModPage === 1}
                    className="px-3 py-1 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] font-semibold disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-[var(--theme-text)] px-1.5">{jobModPage}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setJobModPage((p) =>
                        p * jobModPageSize < filteredModerationJobs.length ? p + 1 : p
                      )
                    }
                    disabled={jobModPage * jobModPageSize >= filteredModerationJobs.length}
                    className="px-3 py-1 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] font-semibold disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* =========================================================================
          VIEW: APPLICATIONS
      ========================================================================= */}
      {activeTab === "applications" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[var(--theme-text)]">
              Platform Applications
            </h2>
          </div>

          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] p-8 shadow-xs text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center mx-auto mb-3">
              <FileText size={20} className="text-[#C0C0C0]" />
            </div>
            <p className="text-sm font-bold text-[var(--theme-text)] font-display">
              Candidate Submissions Workflow
            </p>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1 max-w-sm mx-auto">
              Candidate applications are grouped directly under their corresponding position listings. Select any job in the Directory to review candidate pipelines.
            </p>
          </div>
</div>
      )}

      {/* =========================================================================
          VIEW: EMPLOYER VERIFICATION CENTRE
      ========================================================================= */}
      {(activeTab === "allEmployers" || activeTab === "pendingEmployers") &&
        (adminInfo?.role === "jobseekerAdmin" ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-[var(--theme-text)]">
              Access Restricted by Clearance Policy
            </h3>
            <p className="text-xs text-[var(--theme-text-muted)] max-w-md mx-auto font-mono">
              Your profile is assigned the <strong className="text-[var(--theme-text)]">jobseekerAdmin</strong> role. Employer KYC verification and corporate compliance reviews are restricted to Super Administrators and Employer Administrators.
            </p>
          </div>
        ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)]">
                  <Building2 size={16} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[var(--theme-text)]">
                  Employer Verification Centre
                </h2>
              </div>
              <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                KYC compliance auditing, government credential review, and organization access moderation
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExport("employers")}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] text-xs font-mono font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer w-fit"
            >
              <Download size={13} />
              <span>Export Employers (XLSX)</span>
            </button>
          </div>

          {/* Metric Telemetry Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
              <span className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1">
                Total Organizations
              </span>
              <p className="text-xl sm:text-2xl font-extrabold font-display text-[var(--theme-text)]">
                {allEmployers.length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider block">
                  Pending KYC
                </span>
                {allEmployers.filter((e) => e.isApproved === "pending").length > 0 && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </div>
              <p className="text-xl sm:text-2xl font-extrabold font-display text-amber-400">
                {allEmployers.filter((e) => e.isApproved === "pending").length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
              <span className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1">
                Verified & Approved
              </span>
              <p className="text-xl sm:text-2xl font-extrabold font-display text-emerald-400">
                {allEmployers.filter((e) => e.isApproved === "approved").length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
              <span className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1">
                Frozen Accounts
              </span>
              <p className="text-xl sm:text-2xl font-extrabold font-display text-rose-400">
                {allEmployers.filter((e) => e.isFrozen).length}
              </p>
            </div>
          </div>

          {/* Sub-Tabs: All vs Pending KYC */}
          <div className="flex items-center gap-2 border-b border-[var(--theme-border)] pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setEmpSubTab("all");
                setEmpPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer shrink-0 ${
                empSubTab === "all"
                  ? "bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold shadow-xs"
                  : "bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] border border-[var(--theme-border)]"
              }`}
            >
              All Organizations ({allEmployers.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setEmpSubTab("pending");
                setEmpPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                empSubTab === "pending"
                  ? "bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold shadow-xs"
                  : "bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] border border-[var(--theme-border)]"
              }`}
            >
              <span>Pending KYC Queue</span>
              {allEmployers.filter((e) => e.isApproved === "pending").length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-black">
                  {allEmployers.filter((e) => e.isApproved === "pending").length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
              <input
                type="text"
                value={empSearch}
                onChange={(e) => {
                  setEmpSearch(e.target.value);
                  setEmpPage(1);
                }}
                placeholder="Search company name, contact person, email..."
                className="pl-9 pr-3.5 py-1.5 text-xs font-mono rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-border-silver)] w-full transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={empEntityFilter}
                onChange={(e) => {
                  setEmpEntityFilter(e.target.value);
                  setEmpPage(1);
                }}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none cursor-pointer focus:border-[var(--theme-border-silver)] transition-colors"
              >
                <option value="all">All Entity Types</option>
                <option value="company">Corporate Company</option>
                <option value="individual">Individual Recruiter</option>
              </select>

              <select
                value={empApprovalFilter}
                onChange={(e) => {
                  setEmpApprovalFilter(e.target.value);
                  setEmpPage(1);
                }}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none cursor-pointer focus:border-[var(--theme-border-silver)] transition-colors"
              >
                <option value="all">All Approvals</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={empFreezeFilter}
                onChange={(e) => {
                  setEmpFreezeFilter(e.target.value);
                  setEmpPage(1);
                }}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none cursor-pointer focus:border-[var(--theme-border-silver)] transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="frozen">Frozen Only</option>
              </select>

              <select
                value={empSort}
                onChange={(e) => setEmpSort(e.target.value)}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none cursor-pointer focus:border-[var(--theme-border-silver)] transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Company (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Contextual Bulk Action Bar */}
          {selectedEmpIds.length > 0 && (
            <div className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex flex-wrap items-center justify-between gap-3 animate-in fade-in shadow-xs text-xs font-mono">
              <span className="font-bold text-[var(--theme-text)]">
                {selectedEmpIds.length} employer account{selectedEmpIds.length === 1 ? "" : "s"} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkReviewEmployers("approved")}
                  className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold transition-colors cursor-pointer"
                >
                  Bulk Approve KYC
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkReviewEmployers("rejected")}
                  className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold transition-colors cursor-pointer"
                >
                  Bulk Reject
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEmpIds([])}
                  className="px-2.5 py-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-xs overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-[var(--theme-surface-elevated)]/60 text-[var(--theme-text-muted)] font-mono uppercase tracking-wider border-b border-[var(--theme-border)]">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedEmployers.length > 0 &&
                          selectedEmpIds.length === paginatedEmployers.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmpIds(paginatedEmployers.map((emp) => emp._id));
                          } else {
                            setSelectedEmpIds([]);
                          }
                        }}
                        className="rounded border-[var(--theme-border)] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Organization & Contact</th>
                    <th className="py-3 px-4">Entity Type</th>
                    <th className="py-3 px-4">Nature of Business</th>
                    <th className="py-3 px-4">KYC Documents</th>
                    <th className="py-3 px-4">Approval</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--theme-border)] text-[var(--theme-text)]">
                  {paginatedEmployers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs font-mono text-[var(--theme-text-muted)]">
                        Zero employer records matching selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedEmployers.map((emp) => {
                      const hasAadhar = !!emp.aadharCard;
                      const hasPan = !!emp.panCard;
                      const hasGst = !!emp.gstForm;

                      return (
                        <tr
                          key={emp._id}
                          className="hover:bg-[var(--theme-surface-elevated)]/50 transition-colors group"
                        >
                          <td className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={selectedEmpIds.includes(emp._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmpIds((p) => [...p, emp._id]);
                                } else {
                                  setSelectedEmpIds((p) => p.filter((id) => id !== emp._id));
                                }
                              }}
                              className="rounded border-[var(--theme-border)] cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <Link
                              to={`/admin/employer/${emp._id}`}
                              className="font-semibold text-sm text-[var(--theme-text)] hover:underline flex items-center gap-1.5"
                            >
                              <span>{emp.companyName || emp.name}</span>
                              <ExternalLink size={11} className="text-[var(--theme-text-muted)] opacity-60 group-hover:opacity-100" />
                            </Link>
                            <span className="font-mono text-[11px] text-[var(--theme-text-muted)] select-all block mt-0.5">
                              {emp.email}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] uppercase">
                              {emp.employerType || "company"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--theme-text-muted)]">
                            {emp.natureOfBusiness || "Standard Entity"}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1 font-mono text-[10px]">
                              <span
                                className={`px-1.5 py-0.2 rounded-xs ${
                                  hasAadhar ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                                }`}
                                title={hasAadhar ? "Aadhar Card Uploaded" : "Aadhar Missing"}
                              >
                                ADH
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded-xs ${
                                  hasPan ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                                }`}
                                title={hasPan ? "PAN Card Uploaded" : "PAN Missing"}
                              >
                                PAN
                              </span>
                              {emp.employerType !== "individual" && (
                                <span
                                  className={`px-1.5 py-0.2 rounded-xs ${
                                    hasGst ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                                  }`}
                                  title={hasGst ? "GST Form Uploaded" : "GST Missing"}
                                >
                                  GST
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
                                emp.isApproved === "approved"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : emp.isApproved === "pending"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {emp.isApproved || "pending"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
                                emp.isFrozen
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}
                            >
                              {emp.isFrozen ? "Frozen" : "Active"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEmpIdForDrawer(emp._id);
                                  setIsEmpDrawerOpen(true);
                                }}
                                className="p-1 rounded-md text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-elevated)] transition-colors cursor-pointer"
                                title="Quick Inspect Drawer"
                              >
                                <Eye size={14} />
                              </button>
                              {emp.isApproved === "pending" && (
                                <button
                                  type="button"
                                  onClick={() => handleReviewEmployer(emp._id, "approved")}
                                  className="p-1 rounded-md text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                  title="Approve KYC"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleFreezeToggle(emp._id, emp.isFrozen, "employer")}
                                className="px-2 py-0.5 rounded-md border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] font-mono text-[10px] cursor-pointer transition-colors"
                              >
                                {emp.isFrozen ? "Unfreeze" : "Freeze"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredEmployers.length > empPageSize && (
              <div className="p-3.5 sm:p-4 border-t border-[var(--theme-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[var(--theme-text-muted)]">
                <span>
                  Showing {(empPage - 1) * empPageSize + 1}–
                  {Math.min(empPage * empPageSize, filteredEmployers.length)} of{" "}
                  {filteredEmployers.length} organizations
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEmpPage((p) => Math.max(1, p - 1))}
                    disabled={empPage === 1}
                    className="px-3 py-1 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] font-semibold disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-[var(--theme-text)] px-1.5">{empPage}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setEmpPage((p) =>
                        p * empPageSize < filteredEmployers.length ? p + 1 : p
                      )
                    }
                    disabled={empPage * empPageSize >= filteredEmployers.length}
                    className="px-3 py-1 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] font-semibold disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        ))}

      {/* =========================================================================
          VIEW: USER MANAGEMENT (HYBRID CANDIDATE WORKSPACE)
      ========================================================================= */}
      {activeTab === "allJobseekers" &&
        (adminInfo?.role === "employerAdmin" ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-[var(--theme-text)]">
              Access Restricted by Clearance Policy
            </h3>
            <p className="text-xs text-[var(--theme-text-muted)] max-w-md mx-auto font-mono">
              Your profile is assigned the <strong className="text-[var(--theme-text)]">employerAdmin</strong> role. Candidate directory management and talent account administration are restricted to Super Administrators and Jobseeker Administrators.
            </p>
          </div>
        ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)]">
                  <Users size={16} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[var(--theme-text)]">
                  Candidate User Management Workspace
                </h2>
              </div>
              <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                Candidate authentication directory, account status moderation, and verified profile tracking
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExport("jobseekers")}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] text-xs font-mono font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer w-fit"
            >
              <Download size={13} />
              <span>Export Candidates (XLSX)</span>
            </button>
          </div>

          {/* Metric Telemetry Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
              <span className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1">
                Total Talent Pool
              </span>
              <p className="text-xl sm:text-2xl font-extrabold font-display text-[var(--theme-text)]">
                {allJobseekers.length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
              <span className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1">
                Active Candidates
              </span>
              <p className="text-xl sm:text-2xl font-extrabold font-display text-emerald-400">
                {allJobseekers.filter((u) => !u.isFrozen).length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
              <span className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1">
                Frozen Accounts
              </span>
              <p className="text-xl sm:text-2xl font-extrabold font-display text-rose-400">
                {allJobseekers.filter((u) => u.isFrozen).length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs">
              <span className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1">
                Profiles Complete
              </span>
              <p className="text-xl sm:text-2xl font-extrabold font-display text-[var(--theme-text)]">
                {allJobseekers.filter((u) => u.isProfileComplete).length}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                placeholder="Search candidate name, email address, phone..."
                className="pl-9 pr-3.5 py-1.5 text-xs font-mono rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-border-silver)] w-full transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={userStatusFilter}
                onChange={(e) => {
                  setUserStatusFilter(e.target.value);
                  setUserPage(1);
                }}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none cursor-pointer focus:border-[var(--theme-border-silver)] transition-colors"
              >
                <option value="all">All Accounts</option>
                <option value="active">Active Accounts</option>
                <option value="frozen">Frozen Accounts</option>
              </select>

              <select
                value={userVerificationFilter}
                onChange={(e) => {
                  setUserVerificationFilter(e.target.value);
                  setUserPage(1);
                }}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none cursor-pointer focus:border-[var(--theme-border-silver)] transition-colors"
              >
                <option value="all">All Verification</option>
                <option value="verified">Verified Email</option>
                <option value="unverified">Unverified</option>
              </select>

              <select
                value={userSort}
                onChange={(e) => setUserSort(e.target.value)}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] outline-none cursor-pointer focus:border-[var(--theme-border-silver)] transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Contextual Bulk Action Bar */}
          {selectedUserIds.length > 0 && (
            <div className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex flex-wrap items-center justify-between gap-3 animate-in fade-in shadow-xs text-xs font-mono">
              <span className="font-bold text-[var(--theme-text)]">
                {selectedUserIds.length} candidate account{selectedUserIds.length === 1 ? "" : "s"} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkFreezeUsers(false)}
                  className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold transition-colors cursor-pointer"
                >
                  Bulk Unfreeze
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkFreezeUsers(true)}
                  className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold transition-colors cursor-pointer"
                >
                  Bulk Freeze
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserIds([])}
                  className="px-2.5 py-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-xs overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-[var(--theme-surface-elevated)]/60 text-[var(--theme-text-muted)] font-mono uppercase tracking-wider border-b border-[var(--theme-border)]">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedUsers.length > 0 &&
                          selectedUserIds.length === paginatedUsers.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUserIds(paginatedUsers.map((u) => u._id));
                          } else {
                            setSelectedUserIds([]);
                          }
                        }}
                        className="rounded border-[var(--theme-border)] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Candidate Identity</th>
                    <th className="py-3 px-4">Contact & Phone</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Profile Status</th>
                    <th className="py-3 px-4">Member Since</th>
                    <th className="py-3 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--theme-border)] text-[var(--theme-text)]">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs font-mono text-[var(--theme-text-muted)]">
                        Zero candidate records matching selected criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => (
                      <tr
                        key={u._id}
                        className="hover:bg-[var(--theme-surface-elevated)]/50 transition-colors group"
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(u._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUserIds((p) => [...p, u._id]);
                              } else {
                                setSelectedUserIds((p) => p.filter((id) => id !== u._id));
                              }
                            }}
                            className="rounded border-[var(--theme-border)] cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            to={`/admin/user/${u._id}`}
                            className="font-semibold text-sm text-[var(--theme-text)] hover:underline flex items-center gap-1.5"
                          >
                            <span>{u.name || "Candidate"}</span>
                            <ExternalLink size={11} className="text-[var(--theme-text-muted)] opacity-60 group-hover:opacity-100" />
                          </Link>
                          <span className="font-mono text-[11px] text-[var(--theme-text-muted)] select-all block mt-0.5">
                            {u.email}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--theme-text-muted)]">
                          {u.phone || "Not Provided"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[10px] ${
                              u.isVerified
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]"
                            }`}
                          >
                            {u.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
                              u.isFrozen
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {u.isFrozen ? "Frozen" : "Active"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[10px] ${
                              u.isProfileComplete
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]"
                            }`}
                          >
                            {u.isProfileComplete ? "Complete" : "Incomplete"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--theme-text-muted)]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserIdForDrawer(u._id);
                                setIsUserDrawerOpen(true);
                              }}
                              className="p-1 rounded-md text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-elevated)] transition-colors cursor-pointer"
                              title="Quick Inspect Drawer"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFreezeToggle(u._id, u.isFrozen, "user")}
                              className="px-2 py-0.5 rounded-md border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] font-mono text-[10px] cursor-pointer transition-colors"
                            >
                              {u.isFrozen ? "Unfreeze" : "Freeze"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > userPageSize && (
              <div className="p-3.5 sm:p-4 border-t border-[var(--theme-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[var(--theme-text-muted)]">
                <span>
                  Showing {(userPage - 1) * userPageSize + 1}–
                  {Math.min(userPage * userPageSize, filteredUsers.length)} of{" "}
                  {filteredUsers.length} candidates
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="px-3 py-1 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] font-semibold disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-[var(--theme-text)] px-1.5">{userPage}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setUserPage((p) =>
                        p * userPageSize < filteredUsers.length ? p + 1 : p
                      )
                    }
                    disabled={userPage * userPageSize >= filteredUsers.length}
                    className="px-3 py-1 rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] font-semibold disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        ))}

      {/* =========================================================================
          VIEW: CATEGORIES
      ========================================================================= */}
      {activeTab === "categories" && (
        <div className="space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[var(--theme-text)]">
            Job Categories & Taxonomies
          </h2>
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] p-8 shadow-xs text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center mx-auto mb-3">
              <Layers size={20} className="text-[#C0C0C0]" />
            </div>
            <p className="text-sm font-bold text-[var(--theme-text)] font-display">
              Taxonomy & Sector Breakdown
            </p>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1 max-w-sm mx-auto">
              Categories are assigned dynamically by employers during job creation and aggregated automatically into the Industry Distribution chart.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: EXECUTIVE EXPORT & REPORTING CENTRE
      ========================================================================= */}
      {activeTab === "exportDB" && (
        <AdminExportCentre
          allEmployers={allEmployers}
          allJobseekers={allJobseekers}
          allJobs={allJobs}
          adminInfo={adminInfo}
        />
      )}

      {/* =========================================================================
          VIEW: OPERATIONAL ACTIVITY STREAM
      ========================================================================= */}
      {activeTab === "activity" && (
        <AdminActivityWorkspace
          jobs={allJobs}
          employers={allEmployers}
          jobseekers={allJobseekers}
          contacts={allContacts}
          onSelectTab={handleSelectTab}
        />
      )}

      {/* =========================================================================
          VIEW: ADMINISTRATIVE AUDIT CENTRE
      ========================================================================= */}
      {activeTab === "auditLogs" && (
        <AdminAuditLogsView
          allJobs={allJobs}
          allEmployers={allEmployers}
          allJobseekers={allJobseekers}
          allContacts={allContacts}
          adminInfo={adminInfo}
        />
      )}

      {/* =========================================================================
          VIEW: NOTIFICATION WORKSPACE
      ========================================================================= */}
      {activeTab === "notifications" && (
        <AdminNotificationsView
          pendingJobs={pendingJobs}
          pendingEmployers={pendingEmployers}
          allContacts={allContacts}
          frozenAccountsCount={frozenAccountsCount}
          adminInfo={adminInfo}
          onSelectTab={handleSelectTab}
          onRefresh={() => fetchInitialData(adminInfo)}
        />
      )}

      {/* =========================================================================
          VIEW: SETTINGS CENTRE & GOVERNANCE
      ========================================================================= */}
      {activeTab === "settings" && (
        <AdminSettingsView
          adminInfo={adminInfo}
          allAdmins={allAdmins}
          onRefresh={() => fetchInitialData(adminInfo)}
        />
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

      {/* User Detail Drawer */}
      <AdminUserDetailDrawer
        userId={selectedUserIdForDrawer}
        isOpen={isUserDrawerOpen}
        onClose={() => {
          setIsUserDrawerOpen(false);
          setSelectedUserIdForDrawer(null);
        }}
        adminToken={adminInfo?.token}
        onFreezeToggle={handleFreezeToggle}
      />

      {/* Employer Verification Drawer */}
      <AdminEmployerDetailDrawer
        employerId={selectedEmpIdForDrawer}
        isOpen={isEmpDrawerOpen}
        onClose={() => {
          setIsEmpDrawerOpen(false);
          setSelectedEmpIdForDrawer(null);
        }}
        adminToken={adminInfo?.token}
        onReviewEmployer={handleReviewEmployer}
        onFreezeToggle={handleFreezeToggle}
      />

      {/* Job Moderation Drawer */}
      <AdminJobDetailDrawer
        jobId={selectedJobIdForDrawer}
        isOpen={isJobDrawerOpen}
        onClose={() => {
          setIsJobDrawerOpen(false);
          setSelectedJobIdForDrawer(null);
        }}
        adminToken={adminInfo?.token}
        onReviewJob={handleReviewJob}
      />
    </AdminLayout>
  );
}
