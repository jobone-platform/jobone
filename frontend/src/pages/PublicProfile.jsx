import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  CheckCircle,
  XCircle,
  Download,
  User,
  Clock,
  Code,
  Award,
  FileText,
} from "lucide-react";

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const applicationId = location.state?.applicationId;
  const initialStatus = location.state?.status || "applied";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(initialStatus);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionModal, setActionModal] = useState({
    show: false,
    status: "",
    title: "",
    requireMessage: false,
  });
  const [employerMessage, setEmployerMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const stored = localStorage.getItem("employerInfo");
        const token = stored ? JSON.parse(stored).token : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const { data } = await axios.get(
          `https://jobone-mrpy.onrender.com/user/${userId}`,
          { headers },
        );

        const safeParse = (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            try {
              return JSON.parse(val);
            } catch (e) {
              return [];
            }
          }
          return [];
        };

        setProfile({
          ...data,
          skills: safeParse(data.skills),
          experience: safeParse(data.experience),
          education: safeParse(data.education),
        });
      } catch (err) {
        console.error("Failed to load user", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  const handleStatusUpdate = async () => {
    if (!applicationId) return;
    setActionLoading(true);
    try {
      const stored = localStorage.getItem("employerInfo");
      const { token } = JSON.parse(stored);
      await axios.patch(
        `https://jobone-mrpy.onrender.com/applications/${applicationId}/status`,
        { status: actionModal.status, employerMessage: employerMessage },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStatus(actionModal.status);
      alert(`Candidate status updated to: ${actionModal.status}`);
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update status.");
    } finally {
      setActionLoading(false);
      setActionModal({
        show: false,
        status: "",
        title: "",
        requireMessage: false,
      });
      setEmployerMessage("");
    }
  };

  // FACT: Forces a hard download using the new S3 uploaded resume system
  const handleDownloadResume = async () => {
    if (!profile?.resumeFileKey) {
      alert("No uploaded resume found for this candidate.");
      return;
    }
    
    setIsDownloading(true);
    try {
      const stored = localStorage.getItem("employerInfo");
      const token = stored ? JSON.parse(stored).token : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const { data } = await axios.get(
        `https://jobone-mrpy.onrender.com/user/${profile._id}/resume/view`,
        { headers }
      );

      if (data && data.viewableUrl) {
        const response = await fetch(data.viewableUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${profile.name.replace(/\s+/g, "_")}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } else {
        alert("Failed to retrieve resume URL.");
      }
    } catch (error) {
      console.error("Download failed", error);
      alert("Error downloading resume. It may have been deleted.");
    } finally {
      setIsDownloading(false);
    }
  };

  const applicantList = location.state?.applicantList || [];
  const currentIndex = applicantList.indexOf(userId);

  const goToNext = () => {
    if (currentIndex < applicantList.length - 1) {
      navigate(`/profile/${applicantList[currentIndex + 1]}`, {
        state: location.state,
      });
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      navigate(`/profile/${applicantList[currentIndex - 1]}`, {
        state: location.state,
      });
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  if (!profile) return <div className="p-10 text-center">User not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* FACT: Fixed Back Button Placement */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white border border-slate-200 shadow-sm rounded-xl hover:bg-slate-50 transition-colors text-slate-600"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Applicant Review
          </h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {applicantList.length > 1 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 font-bold"
              >
                ← Previous
              </button>
              <span className="text-sm font-bold text-slate-500">
                {currentIndex + 1} of {applicantList.length}
              </span>
              <button
                onClick={goToNext}
                disabled={currentIndex === applicantList.length - 1}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 font-bold"
              >
                Next →
              </button>
            </div>
          ) : (
            <div></div>
          )}

          {applicationId && (
            <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
              {status === "hired" ? (
                <span className="px-6 py-2 bg-green-100 text-green-700 font-bold rounded-lg border border-green-200 flex items-center gap-2">
                  <CheckCircle size={18} /> Hired
                </span>
              ) : status === "NCTT" ? (
                <span className="px-6 py-2 bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 flex items-center gap-2">
                  <XCircle size={18} /> Not Considered (NCTT)
                </span>
              ) : (
                <>
                  <button
                    onClick={() =>
                      setActionModal({
                        show: true,
                        status: "shortlisted",
                        title: "Shortlist Candidate",
                        requireMessage: true,
                      })
                    }
                    className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 text-sm"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() =>
                      setActionModal({
                        show: true,
                        status: "Interview Scheduled",
                        title: "Schedule Interview",
                        requireMessage: true,
                      })
                    }
                    className="px-4 py-2 bg-purple-50 text-purple-600 font-bold rounded-lg hover:bg-purple-100 text-sm"
                  >
                    Interview
                  </button>
                  <button
                    onClick={() =>
                      setActionModal({
                        show: true,
                        status: "Assignment Scheduled",
                        title: "Schedule Assignment",
                        requireMessage: true,
                      })
                    }
                    className="px-4 py-2 bg-orange-50 text-orange-600 font-bold rounded-lg hover:bg-orange-100 text-sm"
                  >
                    Assignment
                  </button>
                  <button
                    onClick={() =>
                      setActionModal({
                        show: true,
                        status: "NCTT",
                        title: "Not Considered This Time",
                        requireMessage: false,
                      })
                    }
                    className="px-4 py-2 bg-white border border-rose-200 text-rose-600 font-bold rounded-lg hover:bg-rose-50 text-sm"
                  >
                    NCTT
                  </button>
                  <button
                    onClick={() =>
                      setActionModal({
                        show: true,
                        status: "hired",
                        title: "Hire Candidate",
                        requireMessage: false,
                      })
                    }
                    className="px-5 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                  >
                    Hire
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
              <img
                src={
                  profile.profilePicture ||
                  (profile.gender === "Female" 
                    ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                    : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                }
                alt="User"
                className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-slate-50 shadow-sm"
              />
              <h2 className="text-2xl font-bold text-slate-900 mt-4">
                {profile.name}
              </h2>
              <p className="text-slate-500 font-medium">Job Seeker</p>

              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Mail className="text-blue-500" size={18} />
                  <span className="text-sm text-slate-700 break-all">
                    {profile.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Phone className="text-green-500" size={18} />
                  <span className="text-sm text-slate-700">
                    {profile.phone || "N/A"}
                  </span>
                </div>
              </div>

              {profile.resumeFileKey ? (
                <button
                  onClick={handleDownloadResume}
                  disabled={isDownloading}
                  className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-70 shadow-sm"
                >
                  {isDownloading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  {isDownloading ? "Downloading..." : "Download Resume"}
                </button>
              ) : (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl text-center">
                  <p className="text-sm font-bold text-orange-800">No Resume Uploaded</p>
                  <p className="text-xs font-medium text-orange-600 mt-1">This candidate has not uploaded a resume yet.</p>
                </div>
              )}

              {/* CANDIDATE VERIFICATION DOCUMENTS */}
              {profile.documents && Object.keys(profile.documents).some(k => profile.documents[k]?.key) && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <FileText size={16} className="text-blue-600" /> Verification Documents
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(profile.documents).map(([field, docObj]) => {
                      if (!docObj?.key) return null;
                      const labelMap = {
                        tenthMarksheet: "10th Marksheet",
                        twelfthMarksheet: "12th Marksheet",
                        ugMarksheet: "UG Marksheet",
                        pgMarksheet: "PG Marksheet",
                        aadharCard: "Aadhar Card",
                        panCard: "PAN Card",
                        medicalCertificate: "Medical Certificate",
                        salarySlips: "Salary Slips",
                        otherDocuments: "Other Documents",
                      };
                      return (
                        <div key={field} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-medium shadow-sm">
                          <span className="text-slate-800 font-bold">{labelMap[field] || field}</span>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const token = JSON.parse(localStorage.getItem("userInfo"))?.token || JSON.parse(localStorage.getItem("employerInfo"))?.token;
                                const { data } = await axios.get(`https://jobone-mrpy.onrender.com/user/${profile._id}/document/download?field=${field}`, {
                                  headers: token ? { Authorization: `Bearer ${token}` } : {}
                                });
                                if (data.downloadableUrl) {
                                  window.open(data.downloadableUrl, "_blank");
                                }
                              } catch (e) {
                                alert("Failed to download document.");
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 font-bold underline flex items-center gap-1"
                          >
                            <Download size={12} /> Download
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-orange-500" /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.length > 0 ? (
                  profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wide border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    No skills listed.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Professional Summary
              </h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {profile.description || "No summary provided."}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase className="text-indigo-500" size={20} /> Work
                Experience
              </h3>
              <div className="space-y-8">
                {profile.experience?.length > 0 ? (
                  profile.experience.map((exp, i) => (
                    <div
                      key={i}
                      className="relative pl-6 border-l-2 border-indigo-100"
                    >
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-50 border-2 border-indigo-500"></div>
                      <h4 className="font-bold text-slate-900 text-lg">
                        {exp.role}
                      </h4>
                      <p className="text-indigo-600 font-semibold">
                        {exp.company}
                      </p>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mt-1 mb-2">
                        {exp.duration}
                      </p>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No experience added.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <GraduationCap className="text-green-500" size={20} /> Education
              </h3>
              <div className="space-y-6">
                {profile.education?.length > 0 ? (
                  profile.education.map((edu, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-start p-4 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900">
                          {edu.degree}
                        </h4>
                        <p className="text-slate-600 font-medium">
                          {edu.university}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-bold text-slate-400 uppercase">
                          {edu.ended}
                        </span>
                        {edu.CGPA && (
                          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded mt-1 inline-block">
                            GPA: {edu.CGPA}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No education added.</p>
                )}
              </div>
            </div>
            {/* FACT: New Projects Section UI */}
            {(profile.resumeData?.projects?.length > 0 ||
              profile.projects?.length > 0) && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Code className="text-blue-500" size={20} /> Technical
                  Projects
                </h3>
                <div className="space-y-6">
                  {(profile.resumeData?.projects || profile.projects).map(
                    (proj, i) => (
                      <div
                        key={i}
                        className="p-5 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-extrabold text-slate-900 text-base">
                            {proj.title}
                          </h4>
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 font-bold hover:underline bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                            >
                              View Project ↗
                            </a>
                          )}
                        </div>
                        {proj.technologies && (
                          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">
                            Tech Stack:{" "}
                            <span className="text-slate-600">
                              {proj.technologies}
                            </span>
                          </p>
                        )}
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                          {proj.description}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* FACT: New Certifications Section UI */}
            {(profile.resumeData?.certifications?.length > 0 ||
              profile.certifications?.length > 0) && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Award className="text-amber-500" size={20} /> Certifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(
                    profile.resumeData?.certifications || profile.certifications
                  ).map((cert, i) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <h4 className="font-bold text-slate-900 mb-1">
                        {cert.name}
                      </h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-bold text-slate-500">
                          {cert.issuer}
                        </span>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                          {cert.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {actionModal.show && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {actionModal.title}
            </h3>
            {actionModal.requireMessage ? (
              <div className="mb-6 mt-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Message / Details (Sent to Applicant)
                </label>
                <textarea
                  value={employerMessage}
                  onChange={(e) => setEmployerMessage(e.target.value)}
                  placeholder="Enter meeting links, dates, or assignment instructions here..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-y text-sm"
                />
              </div>
            ) : (
              <p className="text-slate-600 mb-6 mt-2">
                Are you sure you want to mark this candidate as{" "}
                {actionModal.status}?
              </p>
            )}
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setActionModal({
                    show: false,
                    status: "",
                    title: "",
                    requireMessage: false,
                  });
                  setEmployerMessage("");
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={
                  actionLoading ||
                  (actionModal.requireMessage && !employerMessage.trim())
                }
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <CheckCircle size={18} />
                )}{" "}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
