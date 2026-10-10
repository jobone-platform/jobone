import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Building2,
  Briefcase,
  ShieldAlert,
  ExternalLink,
  Download,
  Search,
  Snowflake,
  Flame,
  LayoutDashboard,
  Users,
  LogOut,
  FileText,
  User,
  MessageSquare,
} from "lucide-react";
import CompanyDisplay from "../components/CompanyDisplay";

export default function AdminDashboard() {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [allEmployers, setAllEmployers] = useState([]);
  const [allJobseekers, setAllJobseekers] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Manage Admins States
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("employerAdmin");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [adminRole, setAdminRole] = useState(null);
  const [dbStats, setDbStats] = useState({
    jobs: 0,
    jobseekers: 0,
    employers: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminInfo");
    if (!storedAdmin) return navigate("/admin/login");

    const parsedAdmin = JSON.parse(storedAdmin);
    setAdminRole(parsedAdmin.role);

    if (parsedAdmin.role === "jobseekerAdmin") {
      setActiveTab("allJobseekers");
    } else {
      setActiveTab("pendingJobs");
    }

    fetchInitialData(parsedAdmin);
  }, [navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");

    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // ─── API CALLS ──────────────────────────────────────────────────────────

  const fetchInitialData = async (admin) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${admin.token}` };

      const statsRes = await axios
        .get("https://jobone-mrpy.onrender.com/admin/stats", { headers })
        .catch(() => ({ data: { jobs: 0, jobseekers: 0, employers: 0 } }));
      setDbStats(statsRes.data);

      const contactsRes = await axios
        .get("https://jobone-mrpy.onrender.com/admin/contacts", { headers })
        .catch(() => ({ data: [] }));
      setAllContacts(contactsRes.data);

      if (admin.role === "superAdmin" || admin.role === "employerAdmin") {
        const [pJobsRes, aJobsRes, pEmpRes, aEmpRes] = await Promise.all([
          axios
            .get("https://jobone-mrpy.onrender.com/admin/jobs/pending", {
              headers,
            })
            .catch(() => ({ data: [] })),
          axios
            .get("https://jobone-mrpy.onrender.com/admin/jobs", { headers })
            .catch(() => ({ data: [] })),
          axios
            .get("https://jobone-mrpy.onrender.com/admin/employers/pending", {
              headers,
            })
            .catch(() => ({ data: [] })),
          axios
            .get("https://jobone-mrpy.onrender.com/admin/employers", {
              headers,
            })
            .catch(() => ({ data: [] })),
        ]);
        setPendingJobs(pJobsRes.data);
        setAllJobs(aJobsRes.data);
        setPendingEmployers(pEmpRes.data);
        setAllEmployers(aEmpRes.data);
      }

      if (admin.role === "superAdmin" || admin.role === "jobseekerAdmin") {
        const usersRes = await axios
          .get("https://jobone-mrpy.onrender.com/admin/users", { headers })
          .catch(() => ({ data: [] }));
        setAllJobseekers(usersRes.data);
      }

      if (admin.role === "superAdmin") {
        const adminsRes = await axios
          .get("https://jobone-mrpy.onrender.com/admin/all-admins", { headers })
          .catch(() => ({ data: [] }));
        setAllAdmins(adminsRes.data);
      }
    } catch (err) {
      if (err.response?.status === 401) navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkContactAsRead = async (id) => {
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      await axios.patch(
        `https://jobone-mrpy.onrender.com/admin/contacts/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllContacts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isRead: true } : c))
      );
    } catch (err) {
      alert("Failed to mark message as read.");
    }
  };

  const handleChangeAdminRole = async (id, newRole) => {
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      await axios.patch(
        `https://jobone-mrpy.onrender.com/admin/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllAdmins((prev) =>
        prev.map((a) => (a._id === id ? { ...a, role: newRole } : a))
      );
      alert("Role updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      await axios.delete(`https://jobone-mrpy.onrender.com/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllAdmins((prev) => prev.filter((a) => a._id !== id));
      alert("Admin deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete admin");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      const endpoint =
        activeTab === "searchJobseekers"
          ? "/admin/search/users"
          : "/admin/search/employers";
      const { data } = await axios.get(
        `https://jobone-mrpy.onrender.com${endpoint}?q=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSearchResults(data);
    } catch (err) {
      alert("Search failed. Check permissions.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFreezeToggle = async (id, isCurrentlyFrozen, type) => {
    if (
      !window.confirm(
        `Are you sure you want to ${isCurrentlyFrozen ? "UNFREEZE" : "FREEZE"} this account?`,
      )
    )
      return;
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      const endpoint =
        type === "user"
          ? `/admin/freeze-user/${id}`
          : `/admin/freeze-employer/${id}`;
      await axios.put(
        `https://jobone-mrpy.onrender.com${endpoint}`,
        { freeze: !isCurrentlyFrozen },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Update Search Results locally
      setSearchResults((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isFrozen: !isCurrentlyFrozen } : item,
        ),
      );

      // Update All Lists locally
      if (type === "user") {
        setAllJobseekers((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, isFrozen: !isCurrentlyFrozen } : item,
          ),
        );
      } else {
        setAllEmployers((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, isFrozen: !isCurrentlyFrozen } : item,
          ),
        );
      }

      alert(
        `Account successfully ${isCurrentlyFrozen ? "unfrozen" : "frozen"}.`,
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update freeze status.");
    }
  };

  const handleReviewJob = async (id, status) => {
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      await axios.patch(
        `https://jobone-mrpy.onrender.com/admin/jobs/${id}/review`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPendingJobs((prev) => prev.filter((job) => job._id !== id));

      // Move it to allJobs conceptually or just refetch, but here we just update local state slightly
      const reviewedJob = pendingJobs.find((j) => j._id === id);
      if (reviewedJob) {
        setAllJobs((prev) => [
          { ...reviewedJob, status },
          ...prev.filter((j) => j._id !== id),
        ]);
      }
    } catch (err) {
      alert("Failed to review job.");
    }
  };

  const handleReviewEmployer = async (id, status) => {
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      await axios.patch(
        `https://jobone-mrpy.onrender.com/admin/employers/${id}/review`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPendingEmployers((prev) => prev.filter((emp) => emp._id !== id));

      const reviewedEmp = pendingEmployers.find((e) => e._id === id);
      if (reviewedEmp) {
        setAllEmployers((prev) => [
          { ...reviewedEmp, isApproved: status },
          ...prev.filter((e) => e._id !== id),
        ]);
      }
    } catch (err) {
      alert("Failed to review employer.");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setIsCreatingAdmin(true);
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      const res = await axios.post(
        "https://jobone-mrpy.onrender.com/admin/create-admin",
        {
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
          role: newAdminRole,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      
      if (res.data && res.data.admin) {
        setAllAdmins((prev) => [...prev, res.data.admin]);
      } else {
        // Fallback fetch if API doesn't return the admin
        const adminsRes = await axios.get("https://jobone-mrpy.onrender.com/admin/all-admins", { headers: { Authorization: `Bearer ${token}` } });
        setAllAdmins(adminsRes.data);
      }

      alert("Admin created successfully!");
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create admin.");
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleExportCustom = async (type) => {
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      let url = "";
      let filename = "";
      if (type === "all") {
        url = "https://jobone-mrpy.onrender.com/admin/export/all";
        filename = "Platform_Complete_DB.zip";
      } else if (type === "employers") {
        url = "https://jobone-mrpy.onrender.com/admin/export/employers";
        filename = "Platform_Employers_Jobs.xlsx";
      } else if (type === "jobseekers") {
        url = "https://jobone-mrpy.onrender.com/admin/export/jobseekers";
        filename = "Platform_Jobseekers_Jobs.xlsx";
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const objectUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = objectUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to extract data. You may not have permission.");
    }
  };

  if (loading || !adminRole) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  const canManageEmployers =
    adminRole === "superAdmin" || adminRole === "employerAdmin";
  const canManageJobseekers =
    adminRole === "superAdmin" || adminRole === "jobseekerAdmin";

  const SidebarItem = ({ id, icon: Icon, label, badgeCount }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setSearchResults([]);
        setSearchQuery("");
      }}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold ${activeTab === id ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span>{label}</span>
      </div>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${activeTab === id ? "bg-white text-indigo-600" : "bg-indigo-100 text-indigo-700"}`}
        >
          {badgeCount}
        </span>
      )}
    </button>
  );

  const MobileTab = ({ id, icon: Icon, label, badgeCount }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setSearchResults([]);
        setSearchQuery("");
      }}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition-all shrink-0 ${activeTab === id ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}`}
    >
      <Icon size={16} />
      <span>{label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-white text-indigo-600" : "bg-indigo-200 text-indigo-700"}`}
        >
          {badgeCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col md:flex-row overflow-hidden">
      {/* ─── LEFT SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col h-screen sticky top-0 shadow-sm z-10 ">
        <div className="p-6 border-b border-slate-100  pt-[120px]">
          <h1 className="text-2xl font-black flex items-center gap-3 text-slate-900 tracking-tight">
            <LayoutDashboard className="text-indigo-600" size={28} /> Admin
            Portal
          </h1>
          <div className="mt-4 px-3 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 flex items-center gap-2">
            <ShieldAlert size={16} className="text-rose-500" />
            Role:{" "}
            <span className="text-indigo-600 capitalize">{adminRole}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {canManageEmployers && (
            <>
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest pl-4 mb-2 mt-4">
                Employers & Jobs
              </p>
              <SidebarItem
                id="pendingJobs"
                icon={Briefcase}
                label="Pending Jobs"
                badgeCount={pendingJobs.length}
              />
              <SidebarItem
                id="pendingEmployers"
                icon={Building2}
                label="Pending Employers"
                badgeCount={pendingEmployers.length}
              />
              <SidebarItem
                id="allJobs"
                icon={FileText}
                label="All Jobs"
                badgeCount={allJobs.length}
              />
              <SidebarItem
                id="allEmployers"
                icon={Building2}
                label="All Employers"
                badgeCount={allEmployers.length}
              />
              <SidebarItem
                id="searchEmployers"
                icon={Search}
                label="Search / Freeze"
              />
            </>
          )}

          {canManageJobseekers && (
            <>
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest pl-4 mb-2 mt-8">
                Jobseekers
              </p>
              <SidebarItem
                id="allJobseekers"
                icon={Users}
                label="All Jobseekers"
                badgeCount={allJobseekers.length}
              />
              <SidebarItem
                id="searchJobseekers"
                icon={Search}
                label="Search / Freeze"
              />
            </>
          )}

          {adminRole === "superAdmin" && (
            <>
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest pl-4 mb-2 mt-8">
                Super Admin
              </p>
              <SidebarItem
                id="manageAdmins"
                icon={ShieldAlert}
                label="Manage Admins"
              />
            </>
          )}

          <p className="text-xs font-black uppercase text-slate-400 tracking-widest pl-4 mb-2 mt-8">
            Database
          </p>
          <SidebarItem
            id="contacts"
            icon={MessageSquare}
            label="Contact Messages"
            badgeCount={allContacts.filter((c) => !c.isRead).length}
          />
          <SidebarItem id="exportDB" icon={Download} label="Database Export" />
        </div>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={() => {
              localStorage.removeItem("adminInfo");
              navigate("/admin/login");
            }}
            className="w-full bg-slate-900 text-white hover:bg-slate-800 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-slate-200"
          >
            <LogOut size={18} /> Secure Logout
          </button>
        </div>
      </aside>

      {/* ─── MOBILE TOP NAVIGATION ──────────────────────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-20 bg-white shadow-sm border-b border-slate-200 pt-[100px] flex flex-col">
        <div className="px-4 pb-2 flex justify-between items-center text-slate-400 w-full">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Options</span>
          <span className="text-[10px] font-bold tracking-wider flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full animate-pulse">
            Swipe to explore <span className="text-sm leading-none">→</span>
          </span>
        </div>
        <div className="pb-4 px-4 flex gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
          {canManageEmployers && (
            <>
              <MobileTab id="pendingJobs" icon={Briefcase} label="Pending Jobs" badgeCount={pendingJobs.length} />
              <MobileTab id="pendingEmployers" icon={Building2} label="Pending Employers" badgeCount={pendingEmployers.length} />
              <MobileTab id="allJobs" icon={FileText} label="All Jobs" badgeCount={allJobs.length} />
              <MobileTab id="allEmployers" icon={Building2} label="All Employers" badgeCount={allEmployers.length} />
              <MobileTab id="searchEmployers" icon={Search} label="Search / Freeze" />
            </>
          )}
          {canManageJobseekers && (
            <>
              <MobileTab id="allJobseekers" icon={Users} label="All Jobseekers" badgeCount={allJobseekers.length} />
              <MobileTab id="searchJobseekers" icon={Search} label="Search / Freeze" />
            </>
          )}
          {adminRole === "superAdmin" && (
            <MobileTab id="manageAdmins" icon={ShieldAlert} label="Manage Admins" />
          )}
          <MobileTab
            id="contacts"
            icon={MessageSquare}
            label="Contact Messages"
            badgeCount={allContacts.filter((c) => !c.isRead).length}
          />
          <MobileTab id="exportDB" icon={Download} label="Database Export" />
          <button
            onClick={() => {
              localStorage.removeItem("adminInfo");
              navigate("/admin/login");
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm bg-slate-900 text-white shrink-0 ml-2 shadow-sm mr-4"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ─── MAIN CONTENT AREA ──────────────────────────────────────────────────────── */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto bg-slate-50/50">
        <div className="max-w-5xl mx-auto space-y-6 pt-4 md:pt-[100px]">
          {/* EXPORT DB VIEW */}
          {activeTab === "contacts" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="bg-indigo-100 p-2.5 rounded-xl">
                  <MessageSquare size={24} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">
                    Contact Messages
                  </h2>
                  <p className="text-slate-500 font-medium">
                    User inquiries, feedback, and complaints.
                  </p>
                </div>
              </div>

              {allContacts.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
                  <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="font-bold text-lg">No messages found.</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {allContacts.map((contact) => (
                    <div
                      key={contact._id}
                      className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 ${
                        contact.isRead
                          ? "bg-slate-50/50 border-slate-200 shadow-none opacity-80"
                          : "bg-white border-indigo-200 shadow-md shadow-indigo-100/50 -translate-y-0.5"
                      }`}
                    >
                      {!contact.isRead && (
                        <div className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                          New
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${contact.isRead ? "bg-slate-200 text-slate-500" : "bg-indigo-100 text-indigo-700"}`}>
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 leading-tight">
                              {contact.name}
                            </h3>
                            <a href={`mailto:${contact.email}`} className="text-xs text-indigo-500 font-medium hover:underline">
                              {contact.email}
                            </a>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${
                          contact.communicationType === "complaint" ? "bg-red-100 text-red-700" :
                          contact.communicationType === "feedback" ? "bg-emerald-100 text-emerald-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {contact.communicationType}
                        </span>
                      </div>
                      
                      <div className={`flex-1 p-4 rounded-xl mb-4 text-sm whitespace-pre-wrap ${contact.isRead ? "bg-white text-slate-600 border border-slate-200" : "bg-indigo-50/50 text-slate-700"}`}>
                        {contact.message}
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100/80">
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(contact.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })}
                        </span>
                        {!contact.isRead ? (
                          <button
                            onClick={() => handleMarkContactAsRead(contact._id)}
                            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors"
                          >
                            <CheckCircle size={14} /> Mark as Read
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                            <CheckCircle size={14} /> Viewed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "exportDB" && (
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
                <Download className="text-emerald-600" /> Database Export
              </h2>
              <p className="text-slate-500 mb-8 font-medium">
                Extract data safely based on your administrative privileges.
              </p>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                  <Briefcase size={32} className="text-blue-500 mb-3" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Total Jobs
                  </p>
                  <p className="text-4xl font-black text-slate-800">
                    {dbStats.jobs}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                  <Users size={32} className="text-indigo-500 mb-3" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Total Jobseekers
                  </p>
                  <p className="text-4xl font-black text-slate-800">
                    {dbStats.jobseekers}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                  <Building2 size={32} className="text-rose-500 mb-3" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Total Employers
                  </p>
                  <p className="text-4xl font-black text-slate-800">
                    {dbStats.employers}
                  </p>
                </div>
              </div>

              {/* Export Options */}
              <div className="space-y-4">
                {adminRole === "superAdmin" && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-emerald-900">
                        Complete Database Backup
                      </h3>
                      <p className="text-emerald-700 text-sm mt-1">
                        Export all Jobs, Employers, and Jobseekers into a
                        multi-sheet Excel file.
                      </p>
                    </div>
                    <button
                      onClick={() => handleExportCustom("all")}
                      className="shrink-0 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition flex items-center gap-2"
                    >
                      <Download size={18} /> Export Full DB
                    </button>
                  </div>
                )}

                {(adminRole === "superAdmin" ||
                  adminRole === "employerAdmin") && (
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm hover:shadow-md transition">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">
                        Employers & Jobs Data
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">
                        Export a detailed list of all registered employers and
                        posted jobs.
                      </p>
                    </div>
                    <button
                      onClick={() => handleExportCustom("employers")}
                      className="shrink-0 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      <Download size={18} /> Export Employers Data
                    </button>
                  </div>
                )}

                {(adminRole === "superAdmin" ||
                  adminRole === "jobseekerAdmin") && (
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm hover:shadow-md transition">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">
                        Jobseekers & Jobs Data
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">
                        Export a detailed list of all registered jobseekers and
                        available jobs.
                      </p>
                    </div>
                    <button
                      onClick={() => handleExportCustom("jobseekers")}
                      className="shrink-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-2"
                    >
                      <Download size={18} /> Export Jobseekers Data
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PENDING JOBS */}
          {activeTab === "pendingJobs" && canManageEmployers && (
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Briefcase className="text-indigo-600" /> Pending Jobs Approval
              </h2>
              <div className="space-y-4">
                {pendingJobs.length === 0 ? (
                  <p className="text-slate-500 bg-white p-8 rounded-2xl border border-slate-200 text-center font-medium">
                    No pending jobs awaiting approval.
                  </p>
                ) : (
                  pendingJobs.map((job) => (
                    <div
                      key={job._id}
                      className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition"
                    >
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">
                          {job.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                          <CompanyDisplay job={job} fallback={job.postedByCompany || "Confidential"} /> •{" "}
                          {typeof job.location === "object"
                            ? job.location?.address
                            : job.location}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            window.open(`/admin/job/${job._id}`, "_blank")
                          }
                          className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-bold transition"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleReviewJob(job._id, "active")}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-emerald-200 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewJob(job._id, "rejected")}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-sm font-bold transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PENDING EMPLOYERS */}
          {activeTab === "pendingEmployers" && canManageEmployers && (
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Building2 className="text-indigo-600" /> Pending Employers
              </h2>
              <div className="space-y-4">
                {pendingEmployers.length === 0 ? (
                  <p className="text-slate-500 bg-white p-8 rounded-2xl border border-slate-200 text-center font-medium">
                    No pending employers awaiting verification.
                  </p>
                ) : (
                  pendingEmployers.map((emp) => (
                    <div
                      key={emp._id}
                      className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition"
                    >
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">
                          {emp.companyName || emp.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {emp.email} • {emp.phone}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            window.open(`/admin/employer/${emp._id}`, "_blank")
                          }
                          className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-bold transition"
                        >
                          Deep Dive
                        </button>
                        <button
                          onClick={() =>
                            handleReviewEmployer(emp._id, "approved")
                          }
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-emerald-200 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleReviewEmployer(emp._id, "rejected")
                          }
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-sm font-bold transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ALL JOBS */}
          {activeTab === "allJobs" && canManageEmployers && (
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <FileText className="text-indigo-600" /> All Jobs Database
              </h2>
              <div className="space-y-4">
                {allJobs.length === 0 ? (
                  <p className="text-slate-500 bg-white p-8 rounded-2xl border border-slate-200 text-center font-medium">
                    No jobs posted on the platform yet.
                  </p>
                ) : (
                  allJobs.map((job) => (
                    <div
                      key={job._id}
                      className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition"
                    >
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">
                          {job.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                          <CompanyDisplay job={job} fallback={job.postedByCompany || "Confidential"} /> •{" "}
                          {typeof job.location === "object"
                            ? job.location?.address
                            : job.location}
                        </p>
                        <span
                          className={`inline-block mt-2 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${job.status === "active" ? "bg-emerald-100 text-emerald-700" : job.status === "pending_approval" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"}`}
                        >
                          {job.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            window.open(`/admin/job/${job._id}`, "_blank")
                          }
                          className="px-5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold transition"
                        >
                          Admin View
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ALL EMPLOYERS */}
          {activeTab === "allEmployers" && canManageEmployers && (
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Building2 className="text-indigo-600" /> All Employers Database
              </h2>
              <div className="space-y-4">
                {allEmployers.length === 0 ? (
                  <p className="text-slate-500 bg-white p-8 rounded-2xl border border-slate-200 text-center font-medium">
                    No employers registered.
                  </p>
                ) : (
                  allEmployers.map((emp) => (
                    <div
                      key={emp._id}
                      className={`bg-white p-6 rounded-2xl border ${emp.isFrozen ? "border-rose-300 bg-rose-50/30" : "border-slate-200"} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition`}
                    >
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                          {emp.companyName || emp.name}
                          {emp.isFrozen && (
                            <span className="bg-rose-100 text-rose-600 text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-black">
                              Frozen
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {emp.email} • {emp.phone || "No phone"}
                        </p>
                        <span
                          className={`inline-block mt-2 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${emp.isApproved === "approved" ? "bg-emerald-100 text-emerald-700" : emp.isApproved === "pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}
                        >
                          {emp.isApproved}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            window.open(`/company/${emp._id}`, "_blank")
                          }
                          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-bold transition flex items-center gap-2"
                        >
                          <ExternalLink size={16} /> Public View
                        </button>
                        <button
                          onClick={() =>
                            window.open(`/admin/employer/${emp._id}`, "_blank")
                          }
                          className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold transition"
                        >
                          Admin Deep Dive
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ALL JOBSEEKERS */}
          {activeTab === "allJobseekers" && canManageJobseekers && (
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Users className="text-indigo-600" /> All Jobseekers Database
              </h2>
              <div className="space-y-4">
                {allJobseekers.length === 0 ? (
                  <p className="text-slate-500 bg-white p-8 rounded-2xl border border-slate-200 text-center font-medium">
                    No jobseekers registered.
                  </p>
                ) : (
                  allJobseekers.map((user) => (
                    <div
                      key={user._id}
                      className={`bg-white p-6 rounded-2xl border ${user.isFrozen ? "border-rose-300 bg-rose-50/30" : "border-slate-200"} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition`}
                    >
                      <div className="flex items-center gap-4">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                            <User size={20} />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            {user.name}
                            {user.isFrozen && (
                              <span className="bg-rose-100 text-rose-600 text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-black">
                                Frozen
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {user.email} • {user.phone || "No phone"}
                          </p>
                          <p className="text-xs font-semibold text-indigo-600 mt-1">
                            {user.title || "No Title"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            window.open(`/profile/${user._id}`, "_blank")
                          }
                          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-bold transition flex items-center gap-2"
                        >
                          <ExternalLink size={16} /> Public View
                        </button>
                        <button
                          onClick={() =>
                            window.open(`/admin/user/${user._id}`, "_blank")
                          }
                          className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold transition"
                        >
                          Admin Deep Dive
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SEARCH & FREEZE PANELS */}
          {(activeTab === "searchJobseekers" ||
            activeTab === "searchEmployers") && (
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Search className="text-indigo-600" /> Security & Freeze Control
              </h2>
              <form
                onSubmit={handleSearch}
                className="flex gap-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6"
              >
                <input
                  type="text"
                  placeholder={`Search by name, email${activeTab === "searchEmployers" ? ", or company" : ""}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-indigo-600 text-white px-8 font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition disabled:opacity-70"
                >
                  {isSearching ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Search size={18} />
                  )}{" "}
                  Search
                </button>
              </form>

              <div className="space-y-4">
                {searchResults.length === 0 &&
                  !isSearching &&
                  searchQuery !== "" && (
                    <p className="text-slate-500 p-4 text-center">
                      No results found.
                    </p>
                  )}
                {searchResults.map((result) => (
                  <div
                    key={result._id}
                    className={`bg-white p-6 rounded-2xl border ${result.isFrozen ? "border-rose-300 bg-rose-50" : "border-slate-200"} flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm`}
                  >
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                        {result.companyName || result.name}
                        {result.isFrozen && (
                          <span className="bg-rose-100 text-rose-600 text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-black">
                            Frozen
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {result.email} • {result.phone || "No phone"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          window.open(
                            activeTab === "searchEmployers"
                              ? `/admin/employer/${result._id}`
                              : `/admin/user/${result._id}`,
                            "_blank",
                          )
                        }
                        className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-sm font-bold flex items-center gap-2 transition"
                      >
                        <ExternalLink size={16} /> Admin Deep Dive
                      </button>
                      <button
                        onClick={() =>
                          handleFreezeToggle(
                            result._id,
                            result.isFrozen,
                            activeTab === "searchJobseekers"
                              ? "user"
                              : "employer",
                          )
                        }
                        className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 text-white transition ${result.isFrozen ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600 shadow-sm shadow-rose-200"}`}
                      >
                        {result.isFrozen ? (
                          <>
                            <Flame size={16} /> Unfreeze
                          </>
                        ) : (
                          <>
                            <Snowflake size={16} /> Freeze Account
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MANAGE ADMINS PANEL (Super Admin Only) */}
          {activeTab === "manageAdmins" && adminRole === "superAdmin" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="bg-indigo-100 p-2.5 rounded-xl">
                  <ShieldAlert size={24} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">
                    Manage Admins
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Directory and role management.
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* LEFT: ADMIN DIRECTORY */}
                <div className="flex-1 w-full space-y-4">
                  <h3 className="text-lg font-bold text-slate-700">Admin Directory</h3>
                  {allAdmins.length === 0 ? (
                    <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-sm text-slate-400 font-medium">
                      Loading admins...
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                      {allAdmins.map((admin, index) => (
                        <div
                          key={admin._id}
                          className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            index !== allAdmins.length - 1 ? "border-b border-slate-100" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
                              {admin.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{admin.name}</p>
                              <p className="text-xs text-slate-500 font-medium">{admin.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <select
                              value={admin.role}
                              onChange={(e) => handleChangeAdminRole(admin._id, e.target.value)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer border-r-8 border-transparent ${
                                admin.role === "superAdmin"
                                  ? "bg-purple-100 text-purple-700"
                                  : admin.role === "employerAdmin"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              <option value="superAdmin">Super Admin</option>
                              <option value="employerAdmin">Employer Admin</option>
                              <option value="jobseekerAdmin">Jobseeker Admin</option>
                            </select>

                            <button
                              onClick={() => handleDeleteAdmin(admin._id)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              title="Delete Admin"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT: CREATE ADMIN FORM */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 w-full lg:w-[400px] shrink-0">
                  <h3 className="text-lg font-bold mb-6 text-slate-700">
                    Provision New Admin
                  </h3>
                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 ml-1 uppercase tracking-wider">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 ml-1 uppercase tracking-wider">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                        placeholder="admin@jobone.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 ml-1 uppercase tracking-wider">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 ml-1 uppercase tracking-wider">
                        Role
                      </label>
                      <select
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 text-sm"
                      >
                        <option value="employerAdmin">Employer Admin</option>
                        <option value="jobseekerAdmin">Jobseeker Admin</option>
                        <option value="superAdmin">Super Admin</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={isCreatingAdmin}
                      className="w-full bg-indigo-600 text-white py-3 px-4 font-black rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md mt-6 text-sm"
                    >
                      {isCreatingAdmin ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <ShieldAlert size={18} />
                      )}{" "}
                      Create Account
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
