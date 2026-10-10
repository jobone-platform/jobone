import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Download,
} from "lucide-react";

const DOCUMENT_CONFIG = [
  {
    label: "Aadhar Card",
    field: "aadharCard",
    appliesTo: ["company", "individual"],
  },
  { label: "PAN Card", field: "panCard", appliesTo: ["company", "individual"] },
  { label: "Company GST Form", field: "gstForm", appliesTo: ["company"] },
  {
    label: "Other Business Cert.",
    field: "otherBusinessCertificate",
    appliesTo: ["company"],
    optional: true,
  },
  { label: "Trade License", field: "tradeLicense", appliesTo: ["individual"] },
  {
    label: "Education Documents",
    field: "educationDocuments",
    appliesTo: ["individual"],
  },
];

export default function EmployerAdminView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employer, setEmployer] = useState(null);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // State to track which documents the admin has manually verified
  const [verifiedDocs, setVerifiedDocs] = useState({});
  const [viewUrl, setViewUrl] = useState(null);

  useEffect(() => {
    fetchEmployerData();
  }, [id]);

  const fetchEmployerData = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      const [{ data: empData }, { data: jobsData }] = await Promise.all([
        axios.get(
          `https://jobone-mrpy.onrender.com/admin/employers/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        axios.get(
          `https://jobone-mrpy.onrender.com/admin/employers/${id}/jobs`,
          { headers: { Authorization: `Bearer ${token}` } },
        ).catch(() => ({ data: [] }))
      ]);
      setEmployer(empData);
      setEmployerJobs(jobsData);
    } catch (err) {
      alert("Failed to load employer data.");
      navigate("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (field) => {
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      const { data } = await axios.get(
        `https://jobone-mrpy.onrender.com/admin/employers/${id}/document?field=${field}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setViewUrl(data.viewableUrl);
    } catch (err) {
      alert("Failed to load document preview.");
    }
  };

  const toggleDocVerification = (field) => {
    setVerifiedDocs((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleExportSingleProfile = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      const response = await axios.get(
        `https://jobone-mrpy.onrender.com/admin/employers/${id}/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // FACT: Required to prevent Excel file corruption
        },
      );

      const fileName = `EmployerProfile_${employer.companyName ? employer.companyName.replace(/\s+/g, "_") : employer._id}.xlsx`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export Error:", err);
      alert("Failed to extract employer profile.");
    }
  };

  const handleStatusChange = async (status) => {
    setActionLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("adminInfo")).token;
      await axios.patch(
        `https://jobone-mrpy.onrender.com/admin/employers/${id}/review`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert(`Employer successfully ${status}!`);
      navigate("/admin/dashboard");
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  if (!employer)
    return (
      <div className="text-center mt-20 text-red-500">Employer not found.</div>
    );

  const currentType = employer.employerType || "company";
  const requiredDocs = DOCUMENT_CONFIG.filter(
    (doc) => doc.appliesTo.includes(currentType) && !doc.optional,
  );
  const optionalDocs = DOCUMENT_CONFIG.filter(
    (doc) => doc.appliesTo.includes(currentType) && doc.optional,
  );

  // FACT: The Master Lock - Every required document must be checked off by the admin
  const allRequiredVerified = requiredDocs.every(
    (doc) => verifiedDocs[doc.field] && employer[doc.field],
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        {/* Header */}
        <div className="bg-slate-900 rounded-2xl p-8 text-white flex justify-between items-center shadow-xl">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-3">
              Admin Review: {employer.companyName || employer.name}
            </h1>
            <p className="text-slate-400 mt-1">
              Reviewing confidential data and documents.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportSingleProfile}
              className="bg-indigo-600 px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <Download size={18} /> Export Data
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="bg-slate-800 px-4 py-2 rounded-lg font-bold hover:bg-slate-700 border border-slate-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Data */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
                Profile Data
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">
                    Entity Type
                  </p>
                  <p className="font-medium text-slate-900 flex items-center gap-2 mt-1">
                    {currentType === "company" ? (
                      <Building size={16} />
                    ) : (
                      <User size={16} />
                    )}{" "}
                    {currentType}
                  </p>
                </div>
                {currentType === "company" && (
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">
                      Nature of Business
                    </p>
                    <p className="font-medium text-slate-900">
                      {employer.natureOfBusiness || "N/A"}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">
                    Contact
                  </p>
                  <p className="font-medium text-slate-900 flex items-center gap-2 mt-1">
                    <Mail size={14} /> {employer.email}
                  </p>
                  <p className="font-medium text-slate-900 flex items-center gap-2 mt-1">
                    <Phone size={14} /> {employer.phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">
                    Location
                  </p>
                  <p className="font-medium text-slate-900 flex items-center gap-2 mt-1">
                    <MapPin size={14} />{" "}
                    {employer.officeLocation?.address || employer.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Master Action Block */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Final Decision
              </h2>
              {!allRequiredVerified && employer.isApproved === "pending" && (
                <div className="bg-amber-50 text-amber-700 text-xs p-3 rounded-lg mb-4 border border-amber-200 font-medium">
                  You must manually view and check off all required documents as
                  "Verified" before you can approve this account.
                </div>
              )}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleStatusChange("approved")}
                  disabled={!allRequiredVerified || actionLoading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  Approve Account
                </button>
                <button
                  onClick={() => handleStatusChange("rejected")}
                  disabled={actionLoading}
                  className="w-full bg-rose-100 text-rose-700 py-3 rounded-xl font-bold hover:bg-rose-200 transition"
                >
                  Reject & Deny Access
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Documents and Jobs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="text-blue-600" /> Document Verification
                Checklist
              </h2>

              <div className="space-y-4">
                {[...requiredDocs, ...optionalDocs].map((doc) => {
                  const isUploaded = !!employer[doc.field];
                  const isVerified = verifiedDocs[doc.field];

                  return (
                    <div
                      key={doc.field}
                      className={`p-4 rounded-xl border ${isVerified ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"} flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors`}
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <input
                          type="checkbox"
                          className="w-5 h-5 cursor-pointer accent-emerald-600"
                          checked={isVerified || false}
                          disabled={!isUploaded}
                          onChange={() => toggleDocVerification(doc.field)}
                        />
                        <div>
                          <p className="font-bold text-slate-800">
                            {doc.label}{" "}
                            {doc.optional && (
                              <span className="text-xs text-slate-400 font-normal ml-1">
                                (Optional)
                              </span>
                            )}
                          </p>
                          {isUploaded ? (
                            <p className="text-xs text-blue-600 font-bold mt-0.5">
                              Ready for review
                            </p>
                          ) : (
                            <p className="text-xs text-rose-500 font-bold mt-0.5">
                              Missing
                            </p>
                          )}
                        </div>
                      </div>

                      {isUploaded && (
                        <button
                          onClick={() => handleViewDocument(doc.field)}
                          className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                          <Eye size={16} /> View
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Viewer Canvas */}
            {viewUrl && (
              <div className="bg-slate-800 rounded-2xl p-2 h-[600px] border-4 border-slate-700 shadow-2xl relative">
                <button
                  onClick={() => setViewUrl(null)}
                  className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 shadow-lg z-10"
                >
                  <XCircle size={20} />
                </button>
                {viewUrl.includes(".pdf") ? (
                  <iframe
                    src={viewUrl}
                    className="w-full h-full rounded-xl bg-white"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4 bg-slate-900 rounded-xl">
                    <img
                      src={viewUrl}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Jobs Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Building className="text-indigo-600" /> Jobs Posted ({employerJobs.length})
              </h2>
              {employerJobs.length === 0 ? (
                <p className="text-slate-500 text-sm">No jobs posted yet.</p>
              ) : (
                <div className="space-y-4">
                  {employerJobs.map((job) => (
                    <div key={job._id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">{job.title}</h3>
                          <p className="text-sm text-slate-500">{job.location} • Status: {job.status}</p>
                          <p className="text-sm font-semibold text-indigo-600 mt-2">
                            Total Applications: {job.applications?.length || 0}
                          </p>
                        </div>
                        <button
                          onClick={() => window.open(`/admin/job/${job._id}`, "_blank")}
                          className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-bold"
                        >
                          View Job Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
