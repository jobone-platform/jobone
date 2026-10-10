import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, FileText, UploadCloud, Eye, Download, AlertCircle, Trash2, ArrowLeft } from "lucide-react";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

const API_BASE = "https://jobone-mrpy.onrender.com/user";

const getAuthHeader = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  return userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : null;
};

const getUserId = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  return userInfo ? (userInfo.id || userInfo.userId || userInfo._id) : null;
};

const DOCUMENT_CONFIG = [
  { label: "10th Marksheet", field: "tenthMarksheet" },
  { label: "12th Marksheet", field: "twelfthMarksheet" },
  { label: "UG Marksheet", field: "ugMarksheet" },
  { label: "PG Marksheet", field: "pgMarksheet" },
  { label: "Aadhar Card", field: "aadharCard" },
  { label: "PAN Card", field: "panCard" },
  { label: "Medical Certificate", field: "medicalCertificate" },
  { label: "3 Months Salary Slip (if Experienced)", field: "salarySlips" },
  { label: "Other Documents", field: "otherDocuments" },
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

  if (loading) return (
    <div className="flex justify-center items-center h-screen text-slate-500 gap-2">
      <Loader2 className="animate-spin" /> Loading verification documents...
    </div>
  );

  if (!profile) return (
    <div className="text-center mt-20 text-red-500 font-bold">
      Error loading profile. Please make sure you are logged in.
    </div>
  );

  const uploadedCount = DOCUMENT_CONFIG.filter(doc => profile.documents?.[doc.field]?.key).length;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 font-sans pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/profile')} 
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-700"
          title="Back to Profile"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">My Verification & Credential Documents</h2>
          <p className="text-slate-500 mt-1">
            Upload your academic marksheets, ID proofs, and certificates.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4 mb-8 shadow-sm">
        <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={24} />
        <div>
          <h3 className="font-bold text-blue-900 text-base">All Documents Are Optional By Default</h3>
          <p className="text-sm text-blue-800 mt-1 leading-relaxed">
            You do not need to upload all documents immediately. They are only required when applying to specific job postings where the employer has explicitly requested them in their checklist. Once uploaded here, you can apply to those jobs with a single click!
          </p>
          <div className="mt-3 inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">
            Uploaded: {uploadedCount} / {DOCUMENT_CONFIG.length} documents
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {DOCUMENT_CONFIG.map((doc) => (
          <DocumentUploader key={doc.field} doc={doc} profile={profile} onRefresh={fetchProfile} />
        ))}
      </div>

      <div className="mt-10 flex justify-end">
        <button 
          onClick={() => navigate('/profile')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2"
        >
          <CheckCircle size={20} /> Return to Profile
        </button>
      </div>
    </div>
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
  const fileName = docData?.name || "Uploaded Document";

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
      const userId = getUserId();
      
      // 1. Get Presigned S3 URL
      const presignRes = await axios.post(`${API_BASE}/${userId}/document/upload-url`, { 
        fileType: file.type,
        field: doc.field 
      }, { headers });
      
      // 2. Upload directly to AWS S3 (Tauri binary buffer support)
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

      // 3. Save the specific S3 Key to database
      await axios.post(`${API_BASE}/${userId}/document/save-key`, { 
        field: doc.field, 
        key: presignRes.data.key,
        fileName: file.name
      }, { headers });

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
      const res = await axios.get(`${API_BASE}/${userId}/document/view?field=${doc.field}`, { headers: getAuthHeader() });
      setViewUrl(res.data.viewableUrl);
    } catch (err) {
      setError("Could not load preview.");
    }
  };

  const handleDownload = async () => {
    try {
      const userId = getUserId();
      const res = await axios.get(`${API_BASE}/${userId}/document/download?field=${doc.field}`, { headers: getAuthHeader() });
      const link = document.createElement("a");
      link.href = res.data.downloadableUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Download failed.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${doc.label}?`)) return;
    setDeleting(true);
    setError("");
    try {
      const userId = getUserId();
      await axios.delete(`${API_BASE}/${userId}/document`, { 
        headers: getAuthHeader(),
        data: { field: doc.field }
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
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Optional</span>
            </div>
            {isUploaded ? (
              <div className="mt-1">
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                  ✓ Uploaded: <span className="text-slate-700 underline underline-offset-2">{fileName}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 font-medium mt-1 flex items-center gap-1">
                <XCircle size={14}/> Not Uploaded
              </p>
            )}
            {error && <p className="text-xs text-red-500 font-bold mt-2">{error}</p>}
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          {!isUploaded || file ? (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input type="file" id={`file-${doc.field}`} onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" />
              <label htmlFor={`file-${doc.field}`} className="cursor-pointer bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition text-sm text-center flex-1 sm:flex-none">
                {file ? file.name.substring(0, 15) + "..." : "Select File"}
              </label>
              
              {file && (
                <button onClick={handleUpload} disabled={uploading} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200 flex items-center gap-2 text-sm disabled:opacity-70">
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                  {uploading ? "Uploading..." : "Confirm Upload"}
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
              <button onClick={handleView} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold hover:bg-blue-100 transition flex items-center gap-1.5 text-sm">
                <Eye size={16} /> {viewUrl ? "Close" : "View"}
              </button>
              <button onClick={handleDownload} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition flex items-center gap-1.5 text-sm">
                <Download size={16} /> Download
              </button>
              
              <input type="file" id={`replace-${doc.field}`} onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" />
              <label htmlFor={`replace-${doc.field}`} className="cursor-pointer bg-amber-50 text-amber-700 px-3 py-2 rounded-xl text-sm font-bold hover:bg-amber-100 transition">
                Replace
              </label>
              <button onClick={handleDelete} disabled={deleting} className="bg-red-50 text-red-600 p-2 rounded-xl hover:bg-red-100 transition" title="Delete document">
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
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
