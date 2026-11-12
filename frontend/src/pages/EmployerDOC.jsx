import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  UploadCloud,
  Eye,
  Download,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  X,
} from "lucide-react";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { API_BASE_URL } from "../config/api";
import EmployerLayout from "../components/employer/EmployerLayout";

const API_BASE = `${API_BASE_URL}/employer`;

const getAuthHeader = () => {
  const userInfo = JSON.parse(localStorage.getItem("employerInfo"));
  return userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : null;
};

// Document requirement definitions
const DOCUMENT_CONFIG = [
  { label: "Aadhar Card", field: "aadharCard", appliesTo: ["company", "individual"] },
  { label: "PAN Card", field: "panCard", appliesTo: ["company", "individual"] },
  { label: "Company GST Form", field: "gstForm", appliesTo: ["company"] },
  { label: "Other Business Cert.", field: "otherBusinessCertificate", appliesTo: ["company"], optional: true },
  { label: "Trade License", field: "tradeLicense", appliesTo: ["individual"] },
  { label: "Education Documents", field: "educationDocuments", appliesTo: ["individual"] },
];

export default function EmployerDocumentManager() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const storedData = JSON.parse(localStorage.getItem("employerInfo"));
      const targetId = storedData.id || storedData.employerId;
      const { data } = await axios.get(`${API_BASE}/profile/${targetId}`, {
        headers: getAuthHeader(),
      });
      setProfile(data);
    } catch (err) {
      console.error("Failed to fetch employer profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <EmployerLayout
      activeTab="documents"
      title="KYC & Documents"
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "KYC & Documents" },
      ]}
    >
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-silver mb-3" size={36} />
          <p className="text-xs font-mono tracking-widest text-foreground/50 uppercase">
            Loading KYC Verification Vault...
          </p>
        </div>
      </EmployerLayout>
    );
  }

  if (!profile) {
    return (
      <EmployerLayout
      activeTab="documents"
      title="KYC & Documents"
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "KYC & Documents" },
      ]}
    >
        <div className="p-16 rounded-3xl bg-surface border border-border text-center">
          <AlertTriangle size={36} className="mx-auto text-rose-400 mb-3" />
          <h3 className="text-lg font-display font-bold text-foreground">
            Error loading employer profile
          </h3>
          <p className="text-xs font-sans text-foreground/50 mt-1 mb-6">
            Unable to retrieve business credentials. Please re-authenticate your session.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors"
          >
            Go to Login
          </button>
        </div>
      </EmployerLayout>
    );
  }

  const currentType = profile.employerType || "company";
  const requiredDocs = DOCUMENT_CONFIG.filter((doc) => doc.appliesTo.includes(currentType));

  const totalRequired = requiredDocs.filter((d) => !d.optional).length;
  const totalUploaded = requiredDocs.filter((d) => !d.optional && profile[d.field]).length;
  const isComplete = totalRequired === totalUploaded;
  const completionPercentage = Math.round((totalUploaded / Math.max(totalRequired, 1)) * 100);

  return (
    <EmployerLayout
      activeTab="documents"
      title="KYC & Documents"
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "KYC & Documents" },
      ]}
    >
      <div className="space-y-6 pb-20 max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest text-foreground/60 hover:text-foreground transition-colors uppercase"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <span className="text-foreground/30 font-mono">/</span>
              <span className="text-xs font-mono text-silver uppercase">
                Compliance & Trust
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
              KYC & Verification Vault
            </h1>
            <p className="text-xs font-sans text-foreground/50 mt-1">
              Registered entity classification:{" "}
              <span className="font-mono font-bold text-silver uppercase">{currentType}</span>.
              Mandatory legal filings for platform approval and verified employer badge.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 ${
                profile.isApproved === "approved"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold"
                  : profile.isApproved === "rejected"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/30"
              }`}
            >
              <ShieldCheck size={14} />
              Status: {profile.isApproved || "Under Review"}
            </span>
          </div>
        </div>

        {/* PROGRESS METER CARD */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-foreground/70">
              Mandatory Compliance Completion: <strong className="text-foreground">{totalUploaded} / {totalRequired}</strong> documents
            </span>
            <span className="text-silver font-bold">{completionPercentage}% Complete</span>
          </div>

          <div className="h-3 w-full bg-elevated rounded-full overflow-hidden border border-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isComplete ? "bg-emerald-500" : "bg-silver"
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {!isComplete ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs mt-3">
              <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={16} />
              <p className="text-amber-200/90 leading-relaxed font-sans">
                Upload the remaining {totalRequired - totalUploaded} required document(s) below so the JobOne compliance team can approve your employer account for unconstrained job posting and candidate messaging.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-mono text-emerald-400 mt-3">
              <CheckCircle2 size={16} /> All mandatory compliance files uploaded and securely stored.
            </div>
          )}
        </div>

        {/* DOCUMENT UPLOADERS LIST */}
        <div className="space-y-4">
          {requiredDocs.map((doc) => (
            <DocumentUploaderCard
              key={doc.field}
              doc={doc}
              profile={profile}
              onRefresh={fetchProfile}
            />
          ))}
        </div>

        {/* BOTTOM NAVIGATION */}
        <div className="pt-4 flex items-center justify-between border-t border-border">
          <button
            onClick={() => navigate("/employerdashboard")}
            className="px-5 py-2.5 rounded-xl text-xs font-mono bg-elevated border border-border text-foreground hover:bg-surface transition-colors"
          >
            Return to Dashboard
          </button>

          <button
            onClick={() => navigate("/employerprofile")}
            className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-foreground text-background hover:bg-silver transition-colors shadow-sm"
          >
            View Company Profile &rarr;
          </button>
        </div>
      </div>
    </EmployerLayout>
  );
}

// ==========================================
// INDIVIDUAL DOCUMENT COMPONENT
// ==========================================
function DocumentUploaderCard({ doc, profile, onRefresh }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [viewUrl, setViewUrl] = useState(null);
  const [error, setError] = useState("");

  const isUploaded = !!profile[doc.field];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setError("");

    try {
      const headers = getAuthHeader();

      // 1. Get Presigned S3 URL
      const presignRes = await axios.post(
        `${API_BASE}/generate-upload-url`,
        { fileType: file.type },
        { headers }
      );

      // 2. Upload directly to AWS S3
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

      // 3. Save the specific S3 Key
      const payload = { [doc.field]: presignRes.data.key };
      await axios.post(`${API_BASE}/updateProfile`, payload, { headers });

      setFile(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      setError("Upload failed. Ensure the file is under 5MB and network is stable.");
    } finally {
      setUploading(false);
    }
  };

  const handleView = async () => {
    if (viewUrl) return setViewUrl(null);
    try {
      const res = await axios.get(`${API_BASE}/documentViewUrl?field=${doc.field}`, {
        headers: getAuthHeader(),
      });
      setViewUrl(res.data.viewableUrl);
    } catch (err) {
      setError("Could not retrieve secure preview URL.");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await axios.get(`${API_BASE}/documentDownloadUrl?field=${doc.field}`, {
        headers: getAuthHeader(),
      });
      const link = document.createElement("a");
      link.href = res.data.downloadableUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Download failed.");
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-silver/40 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Info */}
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`p-3.5 rounded-xl shrink-0 border ${
              isUploaded
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-elevated text-foreground/40 border-border"
            }`}
          >
            {isUploaded ? <CheckCircle size={22} /> : <FileText size={22} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-foreground">
                {doc.label}
              </h3>
              {doc.optional && (
                <span className="text-[10px] uppercase font-mono text-foreground/50 bg-elevated px-2 py-0.5 rounded border border-border">
                  Optional
                </span>
              )}
            </div>
            {isUploaded ? (
              <p className="text-xs font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={13} /> Verified & Saved to Cloud
              </p>
            ) : (
              <p className="text-xs font-mono text-rose-400 flex items-center gap-1 mt-0.5">
                <XCircle size={13} /> Mandatory Document Missing
              </p>
            )}
            {error && <p className="text-xs text-rose-400 font-mono mt-1">{error}</p>}
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          {!isUploaded || file ? (
            <div className="flex items-center gap-2">
              <input
                type="file"
                id={`file-${doc.field}`}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <label
                htmlFor={`file-${doc.field}`}
                className="cursor-pointer px-4 py-2 bg-elevated border border-border text-foreground hover:bg-surface rounded-xl font-mono text-xs text-center transition-colors truncate max-w-[160px]"
              >
                {file ? file.name.substring(0, 14) + "..." : "Select File"}
              </label>

              {file && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-foreground text-background hover:bg-silver rounded-xl font-mono text-xs font-bold transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 shrink-0"
                >
                  {uploading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <UploadCloud size={13} />
                  )}
                  {uploading ? "Uploading..." : "Confirm Upload"}
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleView}
                className="px-3.5 py-2 bg-elevated border border-border text-foreground hover:bg-surface rounded-xl font-mono text-xs transition-colors inline-flex items-center gap-1.5"
              >
                <Eye size={13} /> {viewUrl ? "Close View" : "Preview"}
              </button>
              <button
                onClick={handleDownload}
                className="px-3.5 py-2 bg-elevated border border-border text-foreground hover:bg-surface rounded-xl font-mono text-xs transition-colors inline-flex items-center gap-1.5"
              >
                <Download size={13} /> Download
              </button>

              <input
                type="file"
                id={`replace-${doc.field}`}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <label
                htmlFor={`replace-${doc.field}`}
                className="cursor-pointer text-xs font-mono text-foreground/50 hover:text-silver underline underline-offset-2 ml-1"
              >
                Replace
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Inline Preview */}
      {viewUrl && (
        <div className="mt-4 border border-border rounded-xl overflow-hidden bg-elevated h-[450px]">
          {viewUrl.includes(".pdf") ? (
            <iframe src={viewUrl} title={doc.label} className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={viewUrl}
                alt={doc.label}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
