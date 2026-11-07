import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Download,
  ArrowLeft,
  Shield,
  ShieldAlert,
  ExternalLink,
  Globe,
  Calendar,
  Layers,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import AdminConfirmDialog from "../components/admin/AdminConfirmDialog";

const DOCUMENT_CONFIG = [
  { label: "Aadhar Card", field: "aadharCard", appliesTo: ["company", "individual"] },
  { label: "PAN Card", field: "panCard", appliesTo: ["company", "individual"] },
  { label: "Company GST Form", field: "gstForm", appliesTo: ["company"] },
  { label: "Trade License", field: "tradeLicense", appliesTo: ["individual"] },
  { label: "Education Documents", field: "educationDocuments", appliesTo: ["individual"] },
  { label: "Other Business Cert.", field: "otherBusinessCertificate", appliesTo: ["company"], optional: true },
];

export default function EmployerAdminView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employer, setEmployer] = useState(null);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewUrl, setViewUrl] = useState(null);
  const [verifiedDocs, setVerifiedDocs] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    variant: "danger",
    action: null,
    loading: false,
  });

  useEffect(() => {
    fetchEmployerData();
  }, [id]);

  const getAdminToken = () => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "null");
      return adminInfo?.token || null;
    } catch {
      return null;
    }
  };

  const fetchEmployerData = async () => {
    try {
      const token = getAdminToken();
      if (!token) {
        navigate("/admin/login");
        return;
      }
      const [{ data: empData }, { data: jobsData }] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/employers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/admin/employers/${id}/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
      ]);
      setEmployer(empData);
      setEmployerJobs(jobsData || []);
    } catch {
      alert("Failed to load employer verification data.");
      navigate("/admin/dashboard?tab=allEmployers");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (field) => {
    try {
      const token = getAdminToken();
      if (!token) return;
      const { data } = await axios.get(
        `${API_BASE_URL}/admin/employers/${id}/document?field=${field}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setViewUrl(data.viewableUrl);
    } catch {
      alert("Failed to generate secure document preview URL.");
    }
  };

  const toggleDocVerification = (field) => {
    setVerifiedDocs((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleExportSingleProfile = async () => {
    try {
      const token = getAdminToken();
      if (!token) return;
      const response = await axios.get(
        `${API_BASE_URL}/admin/employers/${id}/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const fileName = `EmployerProfile_${
        employer?.companyName ? employer.companyName.replace(/\s+/g, "_") : employer?._id
      }.xlsx`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Failed to extract employer profile.");
    }
  };

  const handleStatusChange = (status) => {
    setConfirmDialog({
      isOpen: true,
      title: `${status === "approved" ? "Approve" : "Reject"} Employer KYC`,
      message: `Are you sure you want to ${
        status === "approved"
          ? "approve this employer account and grant active platform publishing access?"
          : "reject this employer verification submission? The recruiter will be notified."
      }`,
      confirmText: status === "approved" ? "Approve KYC" : "Reject Submission",
      variant: status === "approved" ? "success" : "danger",
      loading: false,
      action: async () => {
        setActionLoading(true);
        try {
          const token = getAdminToken();
          await axios.patch(
            `${API_BASE_URL}/admin/employers/${id}/review`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setEmployer((p) => ({ ...p, isApproved: status }));
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
        } catch (err) {
          alert(err.response?.data?.message || "Failed to update review status.");
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleFreezeToggle = () => {
    if (!employer) return;
    const isCurrentlyFrozen = employer.isFrozen;

    setConfirmDialog({
      isOpen: true,
      title: `${isCurrentlyFrozen ? "Unfreeze" : "Freeze"} Employer Account`,
      message: `Are you sure you want to ${
        isCurrentlyFrozen ? "restore active status for" : "suspend and freeze access for"
      } ${employer.companyName || employer.name}?`,
      confirmText: isCurrentlyFrozen ? "Unfreeze Account" : "Freeze Account",
      variant: isCurrentlyFrozen ? "success" : "danger",
      loading: false,
      action: async () => {
        try {
          const token = getAdminToken();
          await axios.put(
            `${API_BASE_URL}/admin/freeze-employer/${id}`,
            { freeze: !isCurrentlyFrozen },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setEmployer((p) => ({ ...p, isFrozen: !isCurrentlyFrozen }));
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
        } catch {
          alert("Failed to update account freeze status.");
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col justify-center items-center">
        <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center mb-3">
          <Loader2 className="animate-spin text-[var(--theme-text)]" size={20} />
        </div>
        <p className="text-xs font-mono font-medium text-[var(--theme-text-muted)]">
          Loading Employer KYC Dossier...
        </p>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col justify-center items-center p-4">
        <div className="text-center max-w-sm">
          <ShieldAlert size={36} className="mx-auto text-rose-500 mb-2" />
          <h2 className="text-lg font-bold text-[var(--theme-text)] font-display">Employer Record Not Found</h2>
          <p className="text-xs text-[var(--theme-text-muted)] mt-1 mb-4">
            The requested organization profile may have been removed or is inaccessible.
          </p>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard?tab=allEmployers")}
            className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-mono text-xs font-bold cursor-pointer"
          >
            Return to Verification Centre
          </button>
        </div>
      </div>
    );
  }

  const currentType = employer.employerType || "company";
  const requiredDocs = DOCUMENT_CONFIG.filter(
    (doc) => doc.appliesTo.includes(currentType) && !doc.optional
  );
  const optionalDocs = DOCUMENT_CONFIG.filter(
    (doc) => doc.appliesTo.includes(currentType) && doc.optional
  );
  const allRequiredVerified = requiredDocs.every(
    (doc) => verifiedDocs[doc.field] && employer[doc.field]
  );

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--theme-text-muted)]">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard?tab=allEmployers")}
              className="hover:text-[var(--theme-text)] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Verification Centre</span>
            </button>
            <span>/</span>
            <span className="text-[var(--theme-text)] font-semibold truncate max-w-xs">
              {employer.companyName || employer.name}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportSingleProfile}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download size={13} />
              <span>Export Dossier</span>
            </button>
            <button
              type="button"
              onClick={handleFreezeToggle}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                employer.isFrozen
                  ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              {employer.isFrozen ? "Unfreeze Account" : "Freeze Account"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard?tab=allEmployers")}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-mono font-semibold transition-colors cursor-pointer"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Executive Verification Header Banner */}
        <div className="p-6 sm:p-7 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center font-display font-extrabold text-2xl text-[var(--theme-text)] shrink-0 shadow-xs">
              {employer.companyName ? employer.companyName.charAt(0).toUpperCase() : employer.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-[var(--theme-text)] truncate">
                  {employer.companyName || employer.name}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
                    employer.isApproved === "approved"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : employer.isApproved === "pending"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  KYC: {employer.isApproved || "pending"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
                    employer.isFrozen
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {employer.isFrozen ? "Frozen" : "Active"}
                </span>
                <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] uppercase">
                  {currentType}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] mt-1 font-mono truncate">
                Registration ID: {employer._id} • {employer.natureOfBusiness || "Standard Entity"}
              </p>
            </div>
          </div>

          {employer.isApproved === "pending" && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleStatusChange("approved")}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Approve KYC</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("rejected")}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <XCircle size={14} />
                <span>Reject</span>
              </button>
            </div>
          )}
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Business Profile Data (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Business Information Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-2.5">
                Entity & Contact Profile
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <User size={13} /> Contact Person
                  </span>
                  <span className="text-[var(--theme-text)] font-semibold">{employer.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <Mail size={13} /> Email
                  </span>
                  <span className="text-[var(--theme-text)] select-all">{employer.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <Phone size={13} /> Phone
                  </span>
                  <span className="text-[var(--theme-text)]">{employer.phone || "Not Provided"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <Building2 size={13} /> Nature of Business
                  </span>
                  <span className="text-[var(--theme-text)]">{employer.natureOfBusiness || "Standard Entity"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <MapPin size={13} /> Office Location
                  </span>
                  <span className="text-[var(--theme-text)] truncate max-w-xs text-right">
                    {employer.officeLocation?.address || employer.location || "Not Provided"}
                  </span>
                </div>
                {employer.companyWebsite && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                      <Globe size={13} /> Website
                    </span>
                    <a
                      href={employer.companyWebsite.startsWith("http") ? employer.companyWebsite : `https://${employer.companyWebsite}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--theme-text)] underline truncate max-w-xs flex items-center gap-1"
                    >
                      <span>{employer.companyWebsite}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[var(--theme-text-muted)] flex items-center gap-1.5">
                    <Calendar size={13} /> Registered Date
                  </span>
                  <span className="text-[var(--theme-text)]">
                    {employer.createdAt ? new Date(employer.createdAt).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Decision Workspace Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-2.5">
                Administrative Verification Decision
              </h3>
              {!allRequiredVerified && employer.isApproved === "pending" && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono flex items-start gap-2">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span>
                    Verification Checklist: Inspect and check off all required documents as verified before approving.
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => handleStatusChange("approved")}
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={15} />
                  <span>Approve Organization KYC</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("rejected")}
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <XCircle size={15} />
                  <span>Reject Submission & Deny Access</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Documents Checklist & Jobs (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* KYC Documents Checklist */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)]">
                <div>
                  <h3 className="text-base font-bold font-display tracking-tight text-[var(--theme-text)] flex items-center gap-2">
                    <FileText size={16} /> Confidential Document Verification
                  </h3>
                  <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                    Government identity, taxation, and business registration records
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)]">
                  {Object.keys(verifiedDocs).filter((k) => verifiedDocs[k]).length} of {requiredDocs.length} required verified
                </span>
              </div>

              <div className="space-y-2.5">
                {[...requiredDocs, ...optionalDocs].map((doc) => {
                  const isUploaded = !!employer[doc.field];
                  const isVerified = verifiedDocs[doc.field];

                  return (
                    <div
                      key={doc.field}
                      className={`p-3.5 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        isVerified
                          ? "bg-emerald-500/5 border-emerald-500/30"
                          : "bg-[var(--theme-surface-elevated)] border-[var(--theme-border)]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isVerified || false}
                          disabled={!isUploaded}
                          onChange={() => toggleDocVerification(doc.field)}
                          className="rounded border-[var(--theme-border)] cursor-pointer"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--theme-text)] truncate">
                            {doc.label} {doc.optional && <span className="text-[10px] text-[var(--theme-text-muted)] font-mono">(Optional)</span>}
                          </p>
                          <span
                            className={`font-mono text-[10px] ${
                              isUploaded ? "text-emerald-400 font-bold" : "text-[var(--theme-text-muted)]"
                            }`}
                          >
                            {isUploaded ? "Uploaded & Available for Inspection" : "Document Missing / Not Submitted"}
                          </span>
                        </div>
                      </div>

                      {isUploaded && (
                        <button
                          type="button"
                          onClick={() => handleViewDocument(doc.field)}
                          className="px-3 py-1.5 rounded-lg bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>View Document</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Viewer Canvas */}
            {viewUrl && (
              <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] shadow-xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[var(--theme-text)]">
                    Secure Document Inspection Canvas
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewUrl(null)}
                    className="p-1 rounded-md text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                    title="Close document viewer"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
                <div className="h-96 w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-[var(--theme-border)]">
                  {viewUrl.includes(".pdf") ? (
                    <iframe src={viewUrl} title="Document Preview" className="w-full h-full" />
                  ) : (
                    <img src={viewUrl} alt="KYC Document Preview" className="max-h-full max-w-full object-contain" />
                  )}
                </div>
              </div>
            )}

            {/* Jobs Posted Table */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)]">
                <h3 className="text-base font-bold font-display tracking-tight text-[var(--theme-text)] flex items-center gap-2">
                  <Briefcase size={16} /> Jobs Created by Organization ({employerJobs.length})
                </h3>
              </div>

              {employerJobs.length === 0 ? (
                <div className="p-6 rounded-xl bg-[var(--theme-surface-elevated)] border border-dashed border-[var(--theme-border)] text-center text-xs font-mono text-[var(--theme-text-muted)]">
                  Zero position listings created by this employer.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {employerJobs.map((job) => (
                    <div
                      key={job._id}
                      className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--theme-text)] text-sm truncate">{job.title}</p>
                        <p className="text-[11px] font-mono text-[var(--theme-text-muted)] truncate mt-0.5">
                          Status: {job.status} • Total Applications: {job.applications?.length || 0}
                        </p>
                      </div>
                      <Link
                        to={`/admin/job/${job._id}`}
                        className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] text-[var(--theme-text)] font-mono text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <span>View Job</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}