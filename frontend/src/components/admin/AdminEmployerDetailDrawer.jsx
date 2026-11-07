import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Eye,
  Calendar,
  Shield,
  Loader2,
  Download,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

const DOCUMENT_CONFIG = [
  { label: "Aadhar Card", field: "aadharCard", appliesTo: ["company", "individual"] },
  { label: "PAN Card", field: "panCard", appliesTo: ["company", "individual"] },
  { label: "Company GST Form", field: "gstForm", appliesTo: ["company"] },
  { label: "Trade License", field: "tradeLicense", appliesTo: ["individual"] },
  { label: "Education Documents", field: "educationDocuments", appliesTo: ["individual"] },
  { label: "Other Business Cert.", field: "otherBusinessCertificate", appliesTo: ["company"], optional: true },
];

export default function AdminEmployerDetailDrawer({
  employerId,
  isOpen,
  onClose,
  adminToken,
  onReviewEmployer,
  onFreezeToggle,
}) {
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [docViewUrl, setDocViewUrl] = useState(null);
  const [fetchingDoc, setFetchingDoc] = useState(false);
  const [verifiedDocs, setVerifiedDocs] = useState({});

  useEffect(() => {
    if (!isOpen || !employerId) {
      setEmployer(null);
      setJobs([]);
      setDocViewUrl(null);
      return;
    }

    const fetchEmployer = async () => {
      setLoading(true);
      setError(null);
      try {
        const [{ data: empData }, { data: jobsData }] = await Promise.all([
          axios.get(`${API_BASE_URL}/admin/employers/${employerId}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
          axios.get(`${API_BASE_URL}/admin/employers/${employerId}/jobs`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          }).catch(() => ({ data: [] })),
        ]);
        setEmployer(empData);
        setJobs(jobsData || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load employer details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployer();
  }, [isOpen, employerId, adminToken]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        if (docViewUrl) {
          setDocViewUrl(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, docViewUrl, onClose]);

  const handleViewDoc = async (field) => {
    setFetchingDoc(true);
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/admin/employers/${employerId}/document?field=${field}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setDocViewUrl(data.viewableUrl);
    } catch {
      alert("Unable to generate document preview link.");
    } finally {
      setFetchingDoc(false);
    }
  };

  const toggleVerified = (field) => {
    setVerifiedDocs((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (!isOpen) return null;

  const currentType = employer?.employerType || "company";
  const relevantDocs = DOCUMENT_CONFIG.filter((d) => d.appliesTo.includes(currentType));
  const requiredDocs = relevantDocs.filter((d) => !d.optional);
  const allRequiredChecked = requiredDocs.every(
    (d) => verifiedDocs[d.field] && employer?.[d.field]
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[var(--theme-surface)] border-l border-[var(--theme-border)] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[var(--theme-border)] flex items-center justify-between gap-4 bg-[var(--theme-surface-elevated)]/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] flex items-center justify-center font-display font-bold text-base text-[var(--theme-text)] shrink-0">
                {employer?.companyName?.charAt(0) || employer?.name?.charAt(0) || <Building2 size={18} />}
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-base sm:text-lg text-[var(--theme-text)] truncate">
                  {employer?.companyName || employer?.name || "Employer KYC Review"}
                </h3>
                <p className="font-mono text-xs text-[var(--theme-text-muted)] truncate">
                  ID: {employerId} • {currentType.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/admin/employer/${employerId}`}
                className="p-2 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
                title="Full Screen Review Centre"
              >
                <ExternalLink size={16} />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <Loader2 className="animate-spin text-[var(--theme-text)] mb-3" size={24} />
                <p className="text-xs font-mono text-[var(--theme-text-muted)]">
                  Loading KYC dossier...
                </p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                {error}
              </div>
            ) : employer ? (
              <>
                {/* Status & Decision Banner */}
                <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
                          employer.isApproved === "approved"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : employer.isApproved === "pending"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        Verification: {employer.isApproved || "pending"}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase tracking-wider ${
                          employer.isFrozen
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {employer.isFrozen ? "Frozen" : "Active"}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[var(--theme-text-muted)] mt-1">
                      {employer.natureOfBusiness || "Standard Entity"} • Registered{" "}
                      {employer.createdAt ? new Date(employer.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {employer.isApproved !== "approved" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onReviewEmployer) onReviewEmployer(employer._id, "approved");
                          setEmployer((p) => ({ ...p, isApproved: "approved" }));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        Approve KYC
                      </button>
                    )}
                    {employer.isApproved !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onReviewEmployer) onReviewEmployer(employer._id, "rejected");
                          setEmployer((p) => ({ ...p, isApproved: "rejected" }));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onFreezeToggle && onFreezeToggle(employer._id, employer.isFrozen, "employer")}
                      className="px-3 py-1.5 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-mono font-semibold transition-colors cursor-pointer"
                    >
                      {employer.isFrozen ? "Unfreeze" : "Freeze"}
                    </button>
                  </div>
                </div>

                {/* Organization Data */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                    Corporate Entity Data
                  </h4>
                  <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] space-y-2.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--theme-text-muted)]">Contact Person</span>
                      <span className="text-[var(--theme-text)] font-semibold">{employer.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--theme-text-muted)]">Email</span>
                      <span className="text-[var(--theme-text)] select-all">{employer.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--theme-text-muted)]">Phone</span>
                      <span className="text-[var(--theme-text)]">{employer.phone || "Not Provided"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--theme-text-muted)]">Location / Address</span>
                      <span className="text-[var(--theme-text)] truncate max-w-xs text-right">
                        {employer.officeLocation?.address || employer.location || "Not Provided"}
                      </span>
                    </div>
                    {employer.companyWebsite && (
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--theme-text-muted)]">Website</span>
                        <a
                          href={employer.companyWebsite.startsWith("http") ? employer.companyWebsite : `https://${employer.companyWebsite}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--theme-text)] underline truncate max-w-xs flex items-center gap-1"
                        >
                          {employer.companyWebsite}
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Verification Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)] flex items-center gap-1.5">
                      <FileText size={13} /> KYC Documents Checklist
                    </h4>
                    <span className="text-[10px] font-mono text-[var(--theme-text-muted)]">
                      {Object.keys(verifiedDocs).filter((k) => verifiedDocs[k]).length} of {relevantDocs.length} Verified
                    </span>
                  </div>

                  <div className="space-y-2">
                    {relevantDocs.map((doc) => {
                      const isUploaded = !!employer[doc.field];
                      const isVerified = verifiedDocs[doc.field];

                      return (
                        <div
                          key={doc.field}
                          className={`p-3 rounded-xl border transition-colors flex items-center justify-between gap-3 text-xs ${
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
                              onChange={() => toggleVerified(doc.field)}
                              className="rounded border-[var(--theme-border)] cursor-pointer"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-[var(--theme-text)] truncate">
                                {doc.label} {doc.optional && <span className="text-[10px] text-[var(--theme-text-muted)]">(Optional)</span>}
                              </p>
                              <span
                                className={`font-mono text-[10px] ${
                                  isUploaded ? "text-emerald-400" : "text-[var(--theme-text-muted)]"
                                }`}
                              >
                                {isUploaded ? "Document Uploaded" : "Missing / Not Submitted"}
                              </span>
                            </div>
                          </div>

                          {isUploaded && (
                            <button
                              type="button"
                              onClick={() => handleViewDoc(doc.field)}
                              disabled={fetchingDoc}
                              className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Eye size={12} />
                              <span>Inspect</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Embedded Document Viewer Canvas */}
                {docViewUrl && (
                  <div className="p-3 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[var(--theme-text)]">
                        Confidential Document Preview
                      </span>
                      <button
                        type="button"
                        onClick={() => setDocViewUrl(null)}
                        className="p-1 rounded-md text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <div className="h-72 w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-[var(--theme-border)]">
                      {docViewUrl.includes(".pdf") ? (
                        <iframe src={docViewUrl} title="Document Preview" className="w-full h-full" />
                      ) : (
                        <img src={docViewUrl} alt="KYC Document" className="max-h-full max-w-full object-contain" />
                      )}
                    </div>
                  </div>
                )}

                {/* Posted Listings */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                    Active Job Listings ({jobs.length})
                  </h4>
                  {jobs.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)] border border-dashed border-[var(--theme-border)] text-center text-xs font-mono text-[var(--theme-text-muted)]">
                      Zero jobs posted by this employer yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {jobs.slice(0, 4).map((j) => (
                        <div
                          key={j._id}
                          className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--theme-text)] truncate">{j.title}</p>
                            <p className="text-[11px] font-mono text-[var(--theme-text-muted)] truncate">
                              Status: {j.status} • Applications: {j.applications?.length || 0}
                            </p>
                          </div>
                          <Link
                            to={`/admin/job/${j._id}`}
                            className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                          >
                            <ExternalLink size={13} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]/40 flex items-center justify-between gap-3">
            <Link
              to={`/admin/employer/${employerId}`}
              className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Full Verification Workspace</span>
              <ExternalLink size={13} />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] text-xs font-mono font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
