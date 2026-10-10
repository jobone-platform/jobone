import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, FileText, UploadCloud, Eye, Download, AlertTriangle } from "lucide-react";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

const API_BASE = "https://jobone-mrpy.onrender.com/employer";

const getAuthHeader = () => {
  const userInfo = JSON.parse(localStorage.getItem("employerInfo"));
  return userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : null;
};

// FACT: Master configuration for documents based on entity type
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
      const { data } = await axios.get(`${API_BASE}/profile/${targetId}`, { headers: getAuthHeader() });
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

  if (loading) return (
    <div className="flex justify-center items-center h-screen text-slate-500 gap-2">
      <Loader2 className="animate-spin" /> Loading documents...
    </div>
  );

  if (!profile) return <div className="text-center mt-20 text-red-500">Error loading profile.</div>;

  // Filter required docs based on what the employer selected in Edit Profile
    const currentType = profile.employerType || "company";
  const requiredDocs = DOCUMENT_CONFIG.filter(doc => doc.appliesTo.includes(currentType));
  
  // Calculate completion percentage
  const totalRequired = requiredDocs.filter(d => !d.optional).length;
  const totalUploaded = requiredDocs.filter(d => !d.optional && profile[d.field]).length;
  const isComplete = totalRequired === totalUploaded;

  
  // Filter required docs based on what the employer selected in Edit Profile
  
  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900">Verification Documents</h2>
        <p className="text-slate-500 mt-2">
          You are registered as a <span className="font-bold text-indigo-600 uppercase tracking-wide">{currentType}</span>. 
          Please upload the following required documents to get your account approved.
        </p>
      </div>

      {!isComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4 mb-8">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-amber-900 text-base">Action Required</h3>
            <p className="text-sm text-amber-800 mt-1 leading-relaxed">
              You must upload all mandatory documents before the administration team can review and approve your account for job posting.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {requiredDocs.map((doc) => (
          <DocumentUploader key={doc.field} doc={doc} profile={profile} onRefresh={fetchProfile} />
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={() => navigate('/employerdashboard')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2"
        >
          <CheckCircle size={20} /> Save Changes & Return
        </button>
      </div>
    </div>
  );
}

// ==========================================
// INDIVIDUAL DOCUMENT COMPONENT
// ==========================================
function DocumentUploader({ doc, profile, onRefresh }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [viewUrl, setViewUrl] = useState(null);
  const [error, setError] = useState("");

  const isUploaded = !!profile[doc.field];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    try {
      const headers = getAuthHeader();
      
      // 1. Get Presigned S3 URL
      const presignRes = await axios.post(`${API_BASE}/generate-upload-url`, { fileType: file.type }, { headers });
      
      // 2. Upload directly to AWS S3
      if (window.__TAURI__) {
        const arrayBuffer = await file.arrayBuffer();
        await tauriFetch(presignRes.data.uploadUrl, {
          method: "PUT",
          body: new Uint8Array(arrayBuffer),
          headers: { "Content-Type": file.type }
        });
      } else {
        await axios.put(presignRes.data.uploadUrl, file, { headers: { "Content-Type": file.type } });
      }

      // 3. Save the specific S3 Key to the database using the updateProfile route
      const payload = { [doc.field]: presignRes.data.key };
      await axios.post(`${API_BASE}/updateProfile`, payload, { headers });

      setFile(null);
      onRefresh(); // Trigger a refetch of the profile to update the UI
    } catch (err) {
      console.error(err);
      setError("Upload failed. Ensure the file is under 5MB and your network is stable.");
    } finally {
      setUploading(false);
    }
  };

  const handleView = async () => {
    if (viewUrl) return setViewUrl(null); // Toggle off
    try {
      // FACT: Pass the field name so the backend knows which doc to fetch
      const res = await axios.get(`${API_BASE}/documentViewUrl?field=${doc.field}`, { headers: getAuthHeader() });
      setViewUrl(res.data.viewableUrl);
    } catch (err) {
      setError("Could not load preview.");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await axios.get(`${API_BASE}/documentDownloadUrl?field=${doc.field}`, { headers: getAuthHeader() });
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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Side: Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-4 rounded-xl shrink-0 ${isUploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            {isUploaded ? <CheckCircle size={24} /> : <FileText size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-800 text-lg">{doc.label}</h3>
              {doc.optional && <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Optional</span>}
            </div>
            {isUploaded ? (
              <p className="text-sm font-bold text-emerald-600 mt-1">Uploaded to Secure Cloud</p>
            ) : (
              <p className="text-sm text-rose-500 font-medium mt-1 flex items-center gap-1"><XCircle size={14}/> Missing Document</p>
            )}
            {error && <p className="text-xs text-red-500 font-bold mt-2">{error}</p>}
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          {!isUploaded || file ? (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input type="file" id={`file-${doc.field}`} onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
              <label htmlFor={`file-${doc.field}`} className="cursor-pointer bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition text-sm text-center flex-1 sm:flex-none">
                {file ? file.name.substring(0, 15) + "..." : "Select File"}
              </label>
              
              {file && (
                <button onClick={handleUpload} disabled={uploading} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200 flex items-center gap-2 text-sm disabled:opacity-70">
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                  {uploading ? "Uploading..." : "Confirm"}
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button onClick={handleView} className="flex-1 sm:flex-none bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl font-bold hover:bg-blue-100 transition flex items-center justify-center gap-2 text-sm">
                <Eye size={16} /> {viewUrl ? "Close" : "Preview"}
              </button>
              <button onClick={handleDownload} className="flex-1 sm:flex-none bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition flex items-center justify-center gap-2 text-sm">
                <Download size={16} /> Download
              </button>
              
              {/* Replace Button */}
              <input type="file" id={`replace-${doc.field}`} onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
              <label htmlFor={`replace-${doc.field}`} className="cursor-pointer ml-2 text-sm font-bold text-slate-400 hover:text-slate-700 underline underline-offset-2">
                Replace
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Inline Preview Iframe */}
      {viewUrl && (
        <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden bg-slate-100 h-[500px] animate-in fade-in slide-in-from-top-4">
          {viewUrl.includes(".pdf") ? (
            <iframe src={viewUrl} title={doc.label} className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img src={viewUrl} alt={doc.label} className="max-h-full max-w-full object-contain rounded-lg shadow-sm" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}