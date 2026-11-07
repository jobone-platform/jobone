import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Loader2,
  CheckCircle2,
  FileText,
  UploadCloud,
  Eye,
  EyeOff,
  Download,
  Trash2,
  ShieldCheck,
  FileCode,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import CandidateLayout from "../components/candidate/CandidateLayout";

const API_BASE = `${API_BASE_URL}/user`;

const getAuthHeader = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  return userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : null;
};

const getUserId = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    return userInfo
      ? userInfo.userId || userInfo.id || userInfo.user?.id || userInfo.user?._id || userInfo._id
      : null;
  } catch (e) {
    return null;
  }
};

const DOCUMENT_CONFIG = [
  { label: "10th Marksheet / Matriculation", field: "tenthMarksheet" },
  { label: "12th Marksheet / Higher Secondary", field: "twelfthMarksheet" },
  { label: "Undergraduate (UG) Degree / Marksheet", field: "ugMarksheet" },
  { label: "Postgraduate (PG) Degree / Marksheet", field: "pgMarksheet" },
  { label: "Aadhar Card / Government ID", field: "aadharCard" },
  { label: "PAN Card / Tax ID", field: "panCard" },
  { label: "Medical Fitness Certificate", field: "medicalCertificate" },
  { label: "3 Months Salary Slips (if Experienced)", field: "salarySlips" },
  { label: "Other Supporting Credentials / Licenses", field: "otherDocuments" },
];

export default function JobseekerDocumentManager() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        navigate("/login");
        return;
      }
      const { data } = await axios.get(`${API_BASE}/${userId}`, { headers: getAuthHeader() });
      setProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const uploadedCount = DOCUMENT_CONFIG.filter(
    (doc) => profile?.documents?.[doc.field]?.key
  ).length;

  const completionPercent = Math.round((uploadedCount / DOCUMENT_CONFIG.length) * 100);

  return (
    <CandidateLayout
      activeTab="documents"
      title="Documents & Credentials"
      breadcrumbs={[{ label: "Career Profile", path: "/profile" }, { label: "Credential Vault" }]}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans antialiased text-[var(--theme-text)]">
        {/* Header & Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-border)] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border border-[var(--theme-border-silver)]">
                Official Credential Vault
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--theme-text)]">
              Verification & Credential Documents
            </h1>
            <p className="text-xs sm:text-sm text-[var(--theme-text-muted)]">
              Securely store and manage academic marksheets, government identity proofs, and experience documents.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/resume-builder"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 transition-all shadow-xs"
            >
              <FileCode size={14} /> Resume Builder
            </Link>
          </div>
        </div>

        {/* Informational Guidance Banner & Progress Meter */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] space-y-4 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-accent-silver)] shrink-0 mt-0.5">
              <ShieldCheck size={20} />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[var(--theme-text)]">
                  Zero-Friction Credential Verification
                </h3>
                <span className="text-xs font-mono font-bold text-[var(--theme-accent-silver)]">
                  {uploadedCount} / {DOCUMENT_CONFIG.length} Uploaded ({completionPercent}%)
                </span>
              </div>
              <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                Uploading documents is optional and only required when an employer asks for specific verification proofs during hiring stages. Once stored here, your credentials can be shared with verified employers in one click.
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-[var(--theme-text)] rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Document Upload Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] animate-pulse p-6"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {DOCUMENT_CONFIG.map((doc) => (
              <DocumentUploader
                key={doc.field}
                doc={doc}
                profile={profile}
                onRefresh={fetchProfile}
              />
            ))}
          </div>
        )}
      </div>
    </CandidateLayout>
  );
}

function DocumentUploader({ doc, profile, onRefresh }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewUrl, setViewUrl] = useState(null);
  const [error, setError] = useState("");

  const docData = profile?.documents?.[doc.field];
  const isUploaded = !!(docData && docData.key);
  const fileName = docData?.name || "Official Document";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setError("");

    try {
      const headers = getAuthHeader();
      const userId = getUserId();

      // 1. Get Presigned S3 URL
      const presignRes = await axios.post(
        `${API_BASE}/${userId}/document/upload-url`,
        {
          fileType: file.type,
          field: doc.field,
        },
        { headers }
      );

      // 2. Upload directly to AWS S3 (Tauri binary buffer support)
      if (window.__TAURI__) {
        const arrayBuffer = await file.arrayBuffer();
        await tauriFetch(presignRes.data.uploadUrl, {
          method: "PUT",
          body: new Uint8Array(arrayBuffer),
          headers: { "Content-Type": file.type },
        });
      } else {
        await axios.put(presignRes.data.uploadUrl, file, {
          headers: { "Content-Type": file.type },
        });
      }

      // 3. Save the specific S3 Key to database
      await axios.post(
        `${API_BASE}/${userId}/document/save-key`,
        {
          field: doc.field,
          key: presignRes.data.key,
          fileName: file.name,
        },
        { headers }
      );

      setFile(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      setError("Upload failed. Ensure the file is valid and network is stable.");
    } finally {
      setUploading(false);
    }
  };

  const handleView = async () => {
    if (viewUrl) return setViewUrl(null);
    try {
      const userId = getUserId();
      const res = await axios.get(`${API_BASE}/${userId}/document/view?field=${doc.field}`, {
        headers: getAuthHeader(),
      });
      setViewUrl(res.data.viewableUrl);
    } catch (err) {
      setError("Could not load preview.");
    }
  };

  const handleDownload = async () => {
    try {
      const userId = getUserId();
      const res = await axios.get(`${API_BASE}/${userId}/document/download?field=${doc.field}`, {
        headers: getAuthHeader(),
      });
      const link = document.createElement("a");
      link.href = res.data.downloadableUrl;
      link.target = "_blank";
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Download failed.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove ${doc.label}?`)) return;
    setDeleting(true);
    setError("");
    try {
      const userId = getUserId();
      await axios.delete(`${API_BASE}/${userId}/document`, {
        headers: getAuthHeader(),
        data: { field: doc.field },
      });
      setViewUrl(null);
      onRefresh();
    } catch (err) {
      setError("Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-border-silver)] transition-all shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Document Metadata */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
              isUploaded
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-[var(--theme-surface-elevated)] border-[var(--theme-border)] text-[var(--theme-text-muted)]"
            }`}
          >
            {isUploaded ? <CheckCircle2 size={18} /> : <FileText size={18} />}
          </div>

          <div className="min-w-0 space-y-0.5">
            <h3 className="font-bold text-sm text-[var(--theme-text)] truncate">{doc.label}</h3>
            {isUploaded ? (
              <p className="text-xs text-[var(--theme-text-muted)] truncate font-mono">
                ✓ Attached: <span className="text-[var(--theme-text)] font-semibold">{fileName}</span>
              </p>
            ) : (
              <p className="text-xs text-[var(--theme-text-muted)] font-mono">Status: Pending Verification</p>
            )}
            {error && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium mt-1">
                <AlertCircle size={12} /> {error}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {!isUploaded || file ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="file"
                id={`file-${doc.field}`}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
              />
              <label
                htmlFor={`file-${doc.field}`}
                className="cursor-pointer px-3.5 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] text-[var(--theme-text)] text-xs font-semibold transition-all inline-block truncate max-w-[180px]"
              >
                {file ? file.name : "Select File"}
              </label>

              {file && (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <UploadCloud size={13} />
                  )}
                  {uploading ? "Uploading..." : "Confirm"}
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleView}
                className="px-3 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] hover:border-[var(--theme-border-silver)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {viewUrl ? <EyeOff size={13} className="text-[var(--theme-accent-silver)]" /> : <Eye size={13} className="text-[var(--theme-accent-silver)]" />}
                <span>{viewUrl ? "Hide" : "View"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] hover:border-[var(--theme-border-silver)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download size={13} className="text-[var(--theme-accent-silver)]" />
                <span>Download</span>
              </button>

              <input
                type="file"
                id={`replace-${doc.field}`}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
              />
              <label
                htmlFor={`replace-${doc.field}`}
                className="cursor-pointer px-3 py-1.5 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:border-[var(--theme-border-silver)] text-xs font-medium transition-all"
              >
                Replace
              </label>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Delete document"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Document Previewer */}
      {viewUrl && (
        <div className="mt-4 border border-[var(--theme-border)] rounded-2xl overflow-hidden bg-[var(--theme-surface-elevated)] flex flex-col animate-in fade-in duration-200">
          <div className="p-3 border-b border-[var(--theme-border)] flex items-center justify-between bg-[var(--theme-surface)]">
            <span className="text-xs font-mono text-[var(--theme-text-muted)]">
              Document Preview: <strong className="text-[var(--theme-text)]">{doc.label}</strong>
            </span>
            <div className="flex items-center gap-2">
              <a
                href={viewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text)] hover:border-[var(--theme-border-silver)] flex items-center gap-1 transition-colors"
              >
                <span>Fullscreen</span>
                <ExternalLink size={12} />
              </a>
              <button
                type="button"
                onClick={() => setViewUrl(null)}
                className="px-2.5 py-1 rounded-lg border border-[var(--theme-border)] text-xs font-mono text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
          <div className="h-[460px]">
            {viewUrl.includes(".pdf") ? (
              <iframe src={viewUrl} title={doc.label} className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={viewUrl}
                  alt={doc.label}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-xs"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
