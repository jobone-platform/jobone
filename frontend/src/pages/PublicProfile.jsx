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
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Sparkles,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

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

  // Authentication & Session Preservation
  const getAuthToken = () => {
    try {
      const userStored = localStorage.getItem("userInfo");
      const userToken = localStorage.getItem("userToken") || (userStored ? JSON.parse(userStored)?.token : null);
      if (userToken) return userToken;
      const empStored = localStorage.getItem("employerInfo");
      const empToken = localStorage.getItem("employerToken") || (empStored ? JSON.parse(empStored)?.token : null);
      if (empToken) return empToken;
      const adminStored = localStorage.getItem("adminInfo");
      const adminToken = localStorage.getItem("adminToken") || (adminStored ? JSON.parse(adminStored)?.token : null);
      return adminToken || null;
    } catch {
      return null;
    }
  };

  const isCandidateLoggedIn = Boolean(
    localStorage.getItem("userToken") ||
    (localStorage.getItem("userInfo") && JSON.parse(localStorage.getItem("userInfo"))?.token)
  );

  const isEmployerLoggedIn = Boolean(
    localStorage.getItem("employerToken") ||
    (localStorage.getItem("employerInfo") && JSON.parse(localStorage.getItem("employerInfo"))?.token)
  );

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const { data } = await axios.get(`${API_BASE_URL}/user/${userId}`, {
          headers,
        });

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
        console.error("Failed to load user profile", err);
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
      const token = getAuthToken();
      await axios.patch(
        `${API_BASE_URL}/applications/${applicationId}/status`,
        { status: actionModal.status, employerMessage: employerMessage },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setStatus(actionModal.status);
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update applicant status.");
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

  const handleDownloadResume = async () => {
    if (!profile?.resumeFileKey) {
      alert("No uploaded resume found for this candidate.");
      return;
    }

    setIsDownloading(true);
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const { data } = await axios.get(
        `${API_BASE_URL}/user/${profile._id}/resume/view`,
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
      alert("Error downloading resume. It may have been archived.");
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--theme-bg)] text-[var(--theme-text)]">
        <Loader2 className="animate-spin text-[var(--theme-accent-silver)]" size={32} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-12 text-center text-[var(--theme-text-muted)] min-h-screen flex items-center justify-center bg-[var(--theme-bg)]">
        Candidate profile not found or permissions expired.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] py-12 px-4 sm:px-6 font-sans transition-colors pt-24 pb-24">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else if (isCandidateLoggedIn) {
                  navigate("/userdashboard");
                } else if (isEmployerLoggedIn) {
                  navigate("/employerdashboard");
                } else {
                  navigate("/");
                }
              }}
              className="p-2.5 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] hover:border-[var(--theme-border-silver)] transition-all cursor-pointer"
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-[var(--theme-text)]">
                  {applicationId ? "Applicant Dossier" : "Candidate Public Profile"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-accent-silver)]">
                  Verified Candidate
                </span>
              </div>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                {applicationId
                  ? "Evaluation console for requisition candidate review"
                  : "Verified professional portfolio & career credentials"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCandidateLoggedIn && (
              <button
                type="button"
                onClick={() => navigate("/userdashboard")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] text-[var(--theme-text)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                Return to Workspace
              </button>
            )}
            {isEmployerLoggedIn && (
              <button
                type="button"
                onClick={() => navigate("/employerdashboard")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] text-[var(--theme-text)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                Employer Portal
              </button>
            )}

            {/* Stepper if list passed */}
            {applicantList.length > 1 && (
              <div className="flex items-center gap-2 text-xs font-mono ml-2">
                <button
                  type="button"
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className="px-3 py-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] hover:border-[var(--theme-border-silver)] disabled:opacity-40 cursor-pointer transition-all"
                >
                  ← Prev
                </button>
                <span className="text-[var(--theme-text-muted)]">
                  {currentIndex + 1} of {applicantList.length}
                </span>
                <button
                  type="button"
                  onClick={goToNext}
                  disabled={currentIndex === applicantList.length - 1}
                  className="px-3 py-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] hover:border-[var(--theme-border-silver)] disabled:opacity-40 cursor-pointer transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar (Shortlist, Interview, Assignment, NCTT, Hire) */}
        {applicationId && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
                Pipeline Status:
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] text-[var(--theme-text)]">
                {status.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {status === "hired" ? (
                <span className="px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle size={14} /> Candidacy Hired
                </span>
              ) : status === "NCTT" ? (
                <span className="px-4 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs flex items-center gap-1.5">
                  <XCircle size={14} /> Closed (NCTT)
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActionModal({
                        show: true,
                        status: "shortlisted",
                        title: "Shortlist Candidate",
                        requireMessage: true,
                      })
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] text-xs font-semibold cursor-pointer transition-all text-[var(--theme-text)]"
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActionModal({
                        show: true,
                        status: "Interview Scheduled",
                        title: "Schedule Interview",
                        requireMessage: true,
                      })
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] text-xs font-semibold cursor-pointer transition-all text-[var(--theme-text)]"
                  >
                    Interview
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActionModal({
                        show: true,
                        status: "Assignment Scheduled",
                        title: "Schedule Assignment",
                        requireMessage: true,
                      })
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] text-xs font-semibold cursor-pointer transition-all text-[var(--theme-text)]"
                  >
                    Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActionModal({
                        show: true,
                        status: "NCTT",
                        title: "Not Considered This Time",
                        requireMessage: false,
                      })
                    }
                    className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold cursor-pointer transition-all"
                  >
                    NCTT
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActionModal({
                        show: true,
                        status: "hired",
                        title: "Mark as Hired",
                        requireMessage: false,
                      })
                    }
                    className="px-4 py-1.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs hover:opacity-90 transition-all cursor-pointer shadow-xs"
                  >
                    Hire Candidate
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 2-Column Dossier Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: CANDIDATE INFO & RESUME */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-sm text-center">
              <img
                src={
                  profile.profilePicture ||
                  (profile.gender === "Female"
                    ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                    : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                }
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-[var(--theme-border-silver)] shadow-sm mb-4"
              />
              <h2 className="text-xl font-display font-bold text-[var(--theme-text)]">
                {profile.name}
              </h2>
              <p className="text-xs font-mono text-[var(--theme-accent-silver)] mt-0.5">
                {profile.title || "Verified Candidate"}
              </p>

              <div className="mt-5 space-y-2 text-left text-xs">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]">
                  <Mail size={14} className="text-[var(--theme-accent-silver)] shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]">
                  <Phone size={14} className="text-[var(--theme-accent-silver)] shrink-0" />
                  <span>{profile.phone || "Not Disclosed"}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]">
                    <MapPin size={14} className="text-[var(--theme-accent-silver)] shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              {profile.resumeFileKey ? (
                <button
                  type="button"
                  onClick={handleDownloadResume}
                  disabled={isDownloading}
                  className="mt-5 w-full py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isDownloading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  <span>Download Verified Resume</span>
                </button>
              ) : (
                <div className="mt-5 p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text-muted)]">
                  No resume file attached
                </div>
              )}

              {/* Candidate Verification Documents */}
              {profile.documents &&
                Object.keys(profile.documents).some((k) => profile.documents[k]?.key) && (
                  <div className="mt-6 pt-5 border-t border-[var(--theme-border)] text-left">
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-[var(--theme-text-muted)] mb-2 flex items-center gap-1.5 font-bold">
                      <FileText size={12} className="text-[var(--theme-accent-silver)]" /> Credentials & Documents
                    </h4>
                    <div className="space-y-1.5">
                      {Object.entries(profile.documents).map(([field, docObj]) => {
                        if (!docObj?.key) return null;
                        const labelMap = {
                          tenthMarksheet: "10th Certificate",
                          twelfthMarksheet: "12th Certificate",
                          ugMarksheet: "UG Degree",
                          pgMarksheet: "PG Degree",
                          aadharCard: "Govt ID (Aadhar)",
                          panCard: "Tax ID (PAN)",
                          medicalCertificate: "Medical Certificate",
                          salarySlips: "Salary Verification",
                          otherDocuments: "Supplementary",
                        };
                        return (
                          <div
                            key={field}
                            className="flex items-center justify-between p-2 rounded-lg bg-[var(--theme-surface-elevated)] text-xs border border-[var(--theme-border)]"
                          >
                            <span className="font-medium text-[var(--theme-text)] truncate mr-2">
                              {labelMap[field] || field}
                            </span>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const token =
                                    JSON.parse(localStorage.getItem("employerInfo"))?.token;
                                  const { data } = await axios.get(
                                    `${API_BASE_URL}/user/${profile._id}/document/download?field=${field}`,
                                    {
                                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                                    }
                                  );
                                  if (data.downloadableUrl) {
                                    window.open(data.downloadableUrl, "_blank");
                                  }
                                } catch {
                                  alert("Failed to retrieve document.");
                                }
                              }}
                              className="text-[11px] font-mono text-[var(--theme-accent-silver)] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Download size={11} /> View
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>

            {/* Skills Card */}
            <div className="p-6 rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-sm">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--theme-text-muted)] mb-3 flex items-center gap-1.5 font-bold">
                <Code size={13} className="text-[var(--theme-accent-silver)]" />
                <span>Competencies & Skills</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills?.length > 0 ? (
                  profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] font-mono"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[var(--theme-text-muted)] italic">No skills listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: SUMMARY, EXPERIENCE, EDUCATION, PROJECTS */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Summary */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-sm">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--theme-text-muted)] mb-3 font-bold">
                Candidate Summary
              </h3>
              <p className="text-xs sm:text-sm text-[var(--theme-text)] leading-relaxed whitespace-pre-wrap font-sans">
                {profile.description || "No professional summary provided."}
              </p>
            </div>

            {/* Work Experience */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-sm">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--theme-text-muted)] mb-5 flex items-center gap-2 font-bold">
                <Briefcase size={14} className="text-[var(--theme-accent-silver)]" />
                <span>Career Experience</span>
              </h3>
              <div className="space-y-6">
                {profile.experience?.length > 0 ? (
                  profile.experience.map((exp, i) => (
                    <div key={i} className="pl-4 border-l-2 border-[var(--theme-border-silver)] relative">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[var(--theme-accent-silver)]" />
                      <h4 className="font-display font-bold text-[var(--theme-text)] text-sm sm:text-base">
                        {exp.role}
                      </h4>
                      <p className="text-xs font-semibold text-[var(--theme-accent-silver)]">{exp.company}</p>
                      <p className="text-[10px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider mt-0.5 mb-2">
                        {exp.duration}
                      </p>
                      <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed font-sans">
                        {exp.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--theme-text-muted)] italic">No experience records added.</p>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-sm">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--theme-text-muted)] mb-4 flex items-center gap-2 font-bold">
                <GraduationCap size={14} className="text-[var(--theme-accent-silver)]" />
                <span>Academic Background</span>
              </h3>
              <div className="space-y-3">
                {profile.education?.length > 0 ? (
                  profile.education.map((edu, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-start p-3.5 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)]"
                    >
                      <div>
                        <h4 className="font-semibold text-[var(--theme-text)] text-xs sm:text-sm">
                          {edu.degree}
                        </h4>
                        <p className="text-xs text-[var(--theme-text-muted)]">{edu.university}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-mono text-[var(--theme-text-muted)] uppercase">
                          {edu.ended}
                        </span>
                        {edu.CGPA && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] text-[var(--theme-accent-silver)] mt-1 inline-block">
                            GPA {edu.CGPA}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--theme-text-muted)] italic">No academic history added.</p>
                )}
              </div>
            </div>

            {/* Technical Projects */}
            {(profile.resumeData?.projects?.length > 0 || profile.projects?.length > 0) && (
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-sm">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--theme-text-muted)] mb-4 flex items-center gap-2 font-bold">
                  <Code size={14} className="text-[var(--theme-accent-silver)]" />
                  <span>Verified Projects</span>
                </h3>
                <div className="space-y-4">
                  {(profile.resumeData?.projects || profile.projects).map((proj, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)]">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-display font-bold text-[var(--theme-text)] text-xs sm:text-sm">
                          {proj.title}
                        </h4>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-mono text-[var(--theme-accent-silver)] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Repository</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                      {proj.technologies && (
                        <p className="text-[11px] font-mono text-[var(--theme-accent-silver)] mb-2">
                          Tech: {proj.technologies}
                        </p>
                      )}
                      <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed font-sans">
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Dialog Modal */}
      {actionModal.show && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] text-[var(--theme-text)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[var(--theme-border)]">
            <h3 className="text-lg font-display font-bold text-[var(--theme-text)] mb-2">
              {actionModal.title}
            </h3>
            {actionModal.requireMessage ? (
              <div className="mb-4 mt-3">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)] mb-1.5 font-bold">
                  Applicant Notification Dispatch
                </label>
                <textarea
                  value={employerMessage}
                  onChange={(e) => setEmployerMessage(e.target.value)}
                  placeholder="Enter meeting links, scheduling details, or instructions..."
                  className="w-full p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs sm:text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-border-silver)] h-28 resize-none"
                />
              </div>
            ) : (
              <p className="text-xs text-[var(--theme-text-muted)] mb-6 mt-2 leading-relaxed">
                Confirm updating this candidate application to status{" "}
                <span className="font-bold text-[var(--theme-text)]">{actionModal.status}</span>?
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setActionModal({
                    show: false,
                    status: "",
                    title: "",
                    requireMessage: false,
                  });
                  setEmployerMessage("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={actionLoading || (actionModal.requireMessage && !employerMessage.trim())}
                className="px-4 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={14} /> : null}
                <span>Confirm Status</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
