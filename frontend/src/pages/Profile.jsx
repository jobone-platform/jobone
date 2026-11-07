import { API_BASE_URL } from "../config/api";
import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Loader2,
  MapPin,
  Mail,
  Phone,
  User as UserIcon,
  Briefcase,
  Award,
  FileText,
  Edit3,
  GraduationCap,
  Globe,
  ExternalLink,
  Download,
  Share2,
  Check,
  Sparkles,
  Building2,
  Calendar,
  ArrowUpRight,
  Eye,
  ShieldCheck,
  Layers,
  FileCheck,
  X,
  Code2,
  Bookmark,
  CheckCheck,
  FileCode,
  HeartHandshake,
} from "lucide-react";
import {
  FaGithub,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaDribbble,
  FaBehance,
  FaFilePdf,
} from "react-icons/fa";
import CandidateLayout from "../components/candidate/CandidateLayout";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "experience" | "education" | "documents"
  const [copiedLink, setCopiedLink] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const storedString = localStorage.getItem("userInfo");
        if (!storedString) {
          navigate("/login");
          return;
        }

        let storedUser;
        try {
          storedUser = JSON.parse(storedString);
        } catch (_e) {
          localStorage.removeItem("userInfo");
          navigate("/login");
          return;
        }

        const id =
          storedUser?.userId ||
          storedUser?.id ||
          storedUser?.user?.id ||
          storedUser?.user?._id ||
          storedUser?._id;

        if (!storedUser?.token || !id) {
          navigate("/login");
          return;
        }

        const { data } = await axios.get(`${API_BASE_URL}/user/${id}`, {
          headers: { Authorization: `Bearer ${storedUser.token}` },
        });

        // Safe parse helper for JSON array strings
        const safeParse = (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") {
            try {
              return JSON.parse(val);
            } catch (_e) {
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
          projects: safeParse(data.projects),
          certifications: safeParse(data.certifications),
          volunteering: safeParse(data.volunteering),
          portfolioLinks: safeParse(data.portfolioLinks),
        });
      } catch (error) {
        console.error("Error fetching candidate profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [location, navigate]);

  // Escape key handler for resume preview modal
  useEffect(() => {
    if (!isResumeModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsResumeModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isResumeModalOpen]);

  // Dynamic Profile Strength Calculation
  const profileStrength = useMemo(() => {
    let score = 0;
    const items = [];

    if (profile.name && profile.email) {
      score += 20;
    } else {
      items.push("Add basic contact details");
    }

    if (profile.profilePicture) {
      score += 10;
    } else {
      items.push("Upload a professional photo");
    }

    if (profile.description && profile.description.trim().length > 20) {
      score += 15;
    } else {
      items.push("Write an executive bio");
    }

    if (profile.skills && profile.skills.length >= 3) {
      score += 15;
    } else {
      items.push("Add at least 3 core skills");
    }

    if (profile.experience && profile.experience.length > 0) {
      score += 15;
    } else {
      items.push("Add your work experience");
    }

    if (profile.education && profile.education.length > 0) {
      score += 10;
    } else {
      items.push("Add your educational background");
    }

    if (profile.resume || profile.resumeFileKey) {
      score += 15;
    } else {
      items.push("Upload or build your resume / CV");
    }

    return {
      score: Math.min(score, 100),
      nextStep: items[0] || "Profile complete! You're ready for top recruiters.",
      isComplete: score >= 90,
    };
  }, [profile]);

  // Copy Public Profile URL
  const handleCopyProfileLink = () => {
    const publicUrl = `${window.location.origin}/profile/${profile._id || profile.id}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    showToast("Public dossier link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // View / Preview Resume Handler
  const handleOpenResume = async () => {
    if (profile.resume) {
      setResumeUrl(profile.resume);
      setIsResumeModalOpen(true);
      return;
    }

    if (!profile.resumeFileKey) {
      showToast("No resume uploaded yet. Visit Resume Builder or Documents to add one.");
      return;
    }

    try {
      setLoadingResume(true);
      const stored = localStorage.getItem("userInfo");
      const token = stored ? JSON.parse(stored)?.token : null;
      const { data } = await axios.get(
        `${API_BASE_URL}/user/${profile._id || profile.id}/resume/view`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data?.viewableUrl) {
        setResumeUrl(data.viewableUrl);
        setIsResumeModalOpen(true);
      } else {
        showToast("Resume preview URL unavailable.");
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to retrieve resume preview.");
    } finally {
      setLoadingResume(false);
    }
  };

  // Direct Download Resume Handler
  const handleDownloadResume = async () => {
    if (profile.resume) {
      window.open(profile.resume, "_blank");
      return;
    }

    if (!profile.resumeFileKey) {
      showToast("No resume file available to download.");
      return;
    }

    try {
      showToast("Preparing resume download...");
      const stored = localStorage.getItem("userInfo");
      const token = stored ? JSON.parse(stored)?.token : null;
      const { data } = await axios.get(
        `${API_BASE_URL}/user/${profile._id || profile.id}/resume/view`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data?.viewableUrl) {
        const response = await fetch(data.viewableUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${(profile.name || "Candidate").replace(/\s+/g, "_")}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        showToast("Resume downloaded successfully!");
      }
    } catch (err) {
      console.error("Resume download failed:", err);
      showToast("Error downloading resume file.");
    }
  };

  // Helper for Social & Portfolio Icons
  const getPlatformIcon = (platform = "") => {
    const p = platform.toLowerCase();
    if (p.includes("github")) return <FaGithub className="text-[var(--theme-text)]" size={16} />;
    if (p.includes("linkedin")) return <FaLinkedinIn className="text-[var(--theme-text)]" size={16} />;
    if (p.includes("twitter") || p.includes("x")) return <FaTwitter className="text-[var(--theme-text)]" size={16} />;
    if (p.includes("dribbble")) return <FaDribbble className="text-[var(--theme-text)]" size={16} />;
    if (p.includes("behance")) return <FaBehance className="text-[var(--theme-text)]" size={16} />;
    if (p.includes("instagram")) return <FaInstagram className="text-[var(--theme-text)]" size={16} />;
    return <Globe className="text-[var(--theme-text-muted)]" size={16} />;
  };

  const avatarUrl =
    profile.profilePicture ||
    (profile.gender === "Female"
      ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
      : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png");

  if (loading) {
    return (
      <CandidateLayout
        activeTab="profile"
        title="Candidate Dossier"
        breadcrumbs={[{ label: "Career Workspace", path: "/userdashboard" }, { label: "Candidate Dossier" }]}
      >
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center shadow-xs">
              <Loader2 className="animate-spin text-[var(--theme-accent-silver)]" size={28} />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--theme-accent-silver)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--theme-accent-silver)]"></span>
            </span>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-bold text-[var(--theme-text)]">Loading Candidate Dossier</h3>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1">Retrieving verified credentials and portfolio...</p>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout
      activeTab="profile"
      title="Candidate Dossier"
      breadcrumbs={[{ label: "Career Workspace", path: "/userdashboard" }, { label: "Candidate Dossier" }]}
    >
      <div className="pb-16 selection:bg-[var(--theme-text)] selection:text-[var(--theme-bg)]">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[var(--theme-text)] text-[var(--theme-bg)] rounded-2xl shadow-2xl backdrop-blur-md text-xs sm:text-sm font-bold border border-[var(--theme-border)] animate-in fade-in slide-in-from-bottom-4 duration-200">
            <CheckCheck size={18} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ─── 1. TOP COVER BANNER ────────────────────────────────────────── */}
        <div className="relative w-full h-40 sm:h-52 md:h-56 rounded-3xl overflow-hidden bg-linear-to-r from-[var(--theme-surface-elevated)] via-[var(--theme-surface)] to-[var(--theme-surface-elevated)] border border-[var(--theme-border)] shadow-xs">
          {/* Subtle Geometric Graphic Overlays */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(var(--theme-border)_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[var(--theme-accent-silver)]/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Banner Navigation Bar */}
          <div className="px-5 sm:px-6 h-14 flex items-center justify-between relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-surface)]/80 backdrop-blur-md border border-[var(--theme-border)] text-[var(--theme-text)] text-xs font-bold tracking-wide shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Candidate Dossier</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyProfileLink}
                title="Copy public dossier link"
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[var(--theme-surface)]/85 hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] backdrop-blur-md border border-[var(--theme-border)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                <span className="hidden sm:inline">{copiedLink ? "Copied" : "Share"}</span>
              </button>

              <Link
                to={`/profile/${profile._id || profile.id}`}
                target="_blank"
                title="View public profile"
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[var(--theme-surface)]/85 hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] backdrop-blur-md border border-[var(--theme-border)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Eye size={14} />
                <span className="hidden sm:inline">Public View</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 2. PROFILE HERO OVERLAY CARD ───────────────────────────────── */}
        <div className="-mt-14 sm:-mt-16 px-3 sm:px-6 relative z-20">
          <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-border)] shadow-xl p-5 sm:p-7 md:p-8 transition-colors">
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 md:gap-8">
              
              {/* Avatar & Key Header Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 md:gap-6 min-w-0 flex-1">
                {/* Avatar with Status Pulse */}
                <div className="relative shrink-0 group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden p-1 bg-[var(--theme-surface-elevated)] shadow-lg border border-[var(--theme-border-silver)]">
                    <img
                      src={avatarUrl}
                      alt={profile.name || "Candidate Avatar"}
                      className="w-full h-full object-cover rounded-xl bg-[var(--theme-surface)]"
                    />
                  </div>
                  {/* Live Green Online / Open to Work Indicator */}
                  <div
                    title="Open to Work • Actively Interviewing"
                    className="absolute bottom-1 right-1 flex items-center justify-center p-1.5 bg-[var(--theme-surface)] rounded-full shadow-md border border-emerald-500/40"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  </div>
                </div>

                {/* Identity & Headline Details */}
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--theme-text)] tracking-tight">
                      {profile.name || "Candidate"}
                    </h1>
                    <span
                      title="Verified Candidate Account"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border)] text-[11px] font-semibold"
                    >
                      <ShieldCheck size={13} className="text-[var(--theme-accent-silver)]" />
                      Verified Talent
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Open to Work
                    </span>
                  </div>

                  <p className="text-sm font-medium text-[var(--theme-text-muted)] max-w-2xl leading-relaxed">
                    {profile.title || profile.description?.slice(0, 95) || "Jobseeker • Actively exploring career opportunities"}
                  </p>

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 text-xs font-medium text-[var(--theme-text-muted)]">
                    {profile.location && (
                      <span className="flex items-center gap-1.5 bg-[var(--theme-surface-elevated)] px-2.5 py-1 rounded-xl border border-[var(--theme-border)]">
                        <MapPin size={13} className="text-[var(--theme-accent-silver)] shrink-0" />
                        <span>{profile.location}</span>
                      </span>
                    )}
                    {profile.email && (
                      <a
                        href={`mailto:${profile.email}`}
                        className="flex items-center gap-1.5 bg-[var(--theme-surface-elevated)] px-2.5 py-1 rounded-xl border border-[var(--theme-border)] hover:text-[var(--theme-text)] transition-colors"
                      >
                        <Mail size={13} className="text-[var(--theme-accent-silver)] shrink-0" />
                        <span className="truncate max-w-[200px]">{profile.email}</span>
                      </a>
                    )}
                    {profile.phone && (
                      <a
                        href={`tel:${profile.phone}`}
                        className="flex items-center gap-1.5 bg-[var(--theme-surface-elevated)] px-2.5 py-1 rounded-xl border border-[var(--theme-border)] hover:text-[var(--theme-text)] transition-colors"
                      >
                        <Phone size={13} className="text-[var(--theme-accent-silver)] shrink-0" />
                        <span>{profile.phone}</span>
                      </a>
                    )}
                    {profile.gender && (
                      <span className="flex items-center gap-1.5 bg-[var(--theme-surface-elevated)] px-2.5 py-1 rounded-xl border border-[var(--theme-border)]">
                        <UserIcon size={13} className="text-[var(--theme-accent-silver)] shrink-0" />
                        <span>{profile.gender}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons (Aligned to Employer Portal Hierarchy) */}
              <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2 w-full lg:w-auto shrink-0 justify-center">
                <Link
                  to="/resume-builder"
                  className="flex-1 lg:flex-initial px-4 py-2.5 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-xs"
                >
                  <FileCode size={15} />
                  <span>Resume Builder</span>
                  <span className="px-1.5 py-0.2 bg-[var(--theme-primary-btn-text)]/20 rounded text-[9px] font-mono uppercase">ATS</span>
                </Link>

                <button
                  type="button"
                  onClick={() => navigate("/editprofile")}
                  className="flex-1 lg:flex-initial px-4 py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[var(--theme-border)] transition-colors cursor-pointer"
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/jobseeker-documents")}
                  className="flex-1 lg:flex-initial px-4 py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[var(--theme-border)] transition-colors cursor-pointer"
                >
                  <FileText size={14} />
                  <span>Documents & CV</span>
                </button>

                {(profile.resume || profile.resumeFileKey) && (
                  <button
                    type="button"
                    onClick={handleOpenResume}
                    disabled={loadingResume}
                    className="flex-1 lg:flex-initial px-4 py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[var(--theme-border)] transition-colors cursor-pointer"
                  >
                    {loadingResume ? (
                      <Loader2 size={14} className="animate-spin text-[var(--theme-accent-silver)]" />
                    ) : (
                      <Eye size={14} className="text-[var(--theme-accent-silver)]" />
                    )}
                    <span>View Resume</span>
                  </button>
                )}
              </div>
            </div>

            {/* Profile Strength & Completion Progress Strip */}
            <div className="mt-6 pt-5 border-t border-[var(--theme-border)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)]">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--theme-text)] uppercase tracking-wider">
                      Dossier Completeness
                    </span>
                    <p className="text-xs text-[var(--theme-text-muted)]">
                      {profileStrength.nextStep}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-[var(--theme-text)] font-mono">
                    {profileStrength.score}%
                  </span>
                  <span className="text-xs font-medium text-[var(--theme-text-muted)]">
                    {profileStrength.score >= 80 ? "Complete" : "In Progress"}
                  </span>
                </div>
              </div>

              <div className="w-full bg-[var(--theme-surface-elevated)] rounded-full h-2 overflow-hidden border border-[var(--theme-border)]">
                <div
                  style={{ width: `${profileStrength.score}%` }}
                  className={`h-full rounded-full transition-all duration-700 ${
                    profileStrength.score >= 80
                      ? "bg-[var(--theme-accent-silver)]"
                      : "bg-slate-400"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* ─── 3. MODERN SEGMENTED TAB NAVIGATION ────────────────────────── */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: "overview", label: "Overview", icon: Layers },
              { id: "experience", label: "Experience & Projects", icon: Briefcase },
              { id: "education", label: "Education & Academics", icon: GraduationCap },
              { id: "documents", label: "Credentials & Documents", icon: FileCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] shadow-xs"
                      : "bg-[var(--theme-surface)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)]"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ─── 4. MAIN BENTO GRID CONTENT ────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
            
            {/* ──── LEFT MAIN COLUMN (8 of 12 cols on desktop) ─────────────── */}
            <div className="lg:col-span-8 space-y-6">

              {/* TAB: OVERVIEW (Displays summary, featured experience, projects) */}
              {(activeTab === "overview" || activeTab === "experience") && (
                <>
                  {/* 1. Executive Summary */}
                  <div className="bg-[var(--theme-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--theme-border)] shadow-xs">
                    <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--theme-border)]">
                      <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)] flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)]">
                          <UserIcon size={16} />
                        </div>
                        <span>Executive Summary</span>
                      </h2>
                      <button
                        type="button"
                        onClick={() => navigate("/editprofile")}
                        className="text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                    </div>

                    {profile.description ? (
                      <div className="text-[var(--theme-text-muted)] text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                        {profile.description}
                      </div>
                    ) : (
                      <div className="py-8 text-center bg-[var(--theme-surface-elevated)]/40 rounded-xl border border-dashed border-[var(--theme-border)]">
                        <UserIcon size={28} className="mx-auto text-[var(--theme-text-muted)] mb-2 opacity-60" />
                        <p className="text-sm font-semibold text-[var(--theme-text)]">
                          No executive summary added yet
                        </p>
                        <p className="text-xs text-[var(--theme-text-muted)] mt-1 max-w-sm mx-auto">
                          Add a compelling professional bio to capture attention from top employers.
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate("/editprofile")}
                          className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-semibold text-xs cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          Add Summary
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. Work Experience Timeline */}
                  <div className="bg-[var(--theme-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--theme-border)] shadow-xs">
                    <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[var(--theme-border)]">
                      <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)] flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)]">
                          <Briefcase size={16} />
                        </div>
                        <span>Work Experience</span>
                      </h2>
                      <span className="text-xs font-medium text-[var(--theme-text-muted)]">
                        {profile.experience?.length || 0} {profile.experience?.length === 1 ? "Role" : "Roles"}
                      </span>
                    </div>

                    {profile.experience?.length > 0 ? (
                      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--theme-border)]">
                        {profile.experience.map((exp, idx) => (
                          <div key={idx} className="relative group">
                            {/* Timeline Node Dot */}
                            <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-[var(--theme-surface)] border-2 border-[var(--theme-border-silver)] flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent-silver)]"></span>
                            </div>

                            <div className="bg-[var(--theme-surface-elevated)]/50 p-4 rounded-xl border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] transition-all">
                              <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                                <div>
                                  <h3 className="text-sm font-bold text-[var(--theme-text)]">
                                    {exp.role || "Role Position"}
                                  </h3>
                                  <p className="text-xs font-medium text-[var(--theme-text-muted)] flex items-center gap-1.5 mt-0.5">
                                    <Building2 size={13} className="text-[var(--theme-accent-silver)]" />
                                    <span>{exp.company || "Company"}</span>
                                  </p>
                                </div>
                                {exp.duration && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border border-[var(--theme-border)] text-[11px] font-medium font-mono">
                                    <Calendar size={11} className="text-[var(--theme-accent-silver)]" />
                                    <span>{exp.duration}</span>
                                  </span>
                                )}
                              </div>

                              {exp.description && (
                                <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed mt-2 whitespace-pre-line">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center bg-[var(--theme-surface-elevated)]/40 rounded-xl border border-dashed border-[var(--theme-border)]">
                        <Briefcase size={28} className="mx-auto text-[var(--theme-text-muted)] mb-2 opacity-60" />
                        <p className="text-sm font-semibold text-[var(--theme-text)]">
                          No work history recorded
                        </p>
                        <p className="text-xs text-[var(--theme-text-muted)] mt-1 max-w-sm mx-auto">
                          Add past employers, roles, achievements, and impact to stand out.
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate("/editprofile")}
                          className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-semibold text-xs cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          Add Experience
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 3. Featured Projects */}
                  <div className="bg-[var(--theme-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--theme-border)] shadow-xs">
                    <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[var(--theme-border)]">
                      <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)] flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)]">
                          <Code2 size={16} />
                        </div>
                        <span>Featured Projects</span>
                      </h2>
                      <span className="text-xs font-medium text-[var(--theme-text-muted)]">
                        {profile.projects?.length || 0} {profile.projects?.length === 1 ? "Project" : "Projects"}
                      </span>
                    </div>

                    {profile.projects?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {profile.projects.map((proj, idx) => (
                          <div
                            key={idx}
                            className="group p-4 rounded-xl bg-[var(--theme-surface-elevated)]/50 border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <h3 className="text-sm font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver)] transition-colors line-clamp-1">
                                  {proj.title || "Untitled Project"}
                                </h3>
                                {proj.link && (
                                  <a
                                    href={proj.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Open project link"
                                    className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-all shrink-0 cursor-pointer"
                                  >
                                    <ArrowUpRight size={15} />
                                  </a>
                                )}
                              </div>

                              {proj.technologies && (
                                <p className="text-[11px] font-mono text-[var(--theme-accent-silver)] mb-2 font-medium">
                                  {proj.technologies}
                                </p>
                              )}

                              {proj.description && (
                                <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed line-clamp-3">
                                  {proj.description}
                                </p>
                              )}
                            </div>

                            {proj.link && (
                              <div className="mt-3.5 pt-2.5 border-t border-[var(--theme-border)] flex items-center justify-between text-[11px] text-[var(--theme-text-muted)]">
                                <span className="truncate max-w-[200px]">{proj.link.replace(/^https?:\/\//, "")}</span>
                                <ExternalLink size={12} className="shrink-0" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center bg-[var(--theme-surface-elevated)]/40 rounded-xl border border-dashed border-[var(--theme-border)]">
                        <Code2 size={28} className="mx-auto text-[var(--theme-text-muted)] mb-2 opacity-60" />
                        <p className="text-sm font-semibold text-[var(--theme-text)]">
                          No projects showcased yet
                        </p>
                        <p className="text-xs text-[var(--theme-text-muted)] mt-1 max-w-sm mx-auto">
                          Highlight open-source repositories, case studies, or portfolio builds.
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate("/editprofile")}
                          className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-semibold text-xs cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          Add Project
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TAB: EDUCATION & CREDENTIALS */}
              {(activeTab === "overview" || activeTab === "education") && (
                <>
                  {/* 4. Education History */}
                  <div className="bg-[var(--theme-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--theme-border)] shadow-xs">
                    <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[var(--theme-border)]">
                      <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)] flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)]">
                          <GraduationCap size={16} />
                        </div>
                        <span>Education & Academics</span>
                      </h2>
                      <span className="text-xs font-medium text-[var(--theme-text-muted)]">
                        {profile.education?.length || 0} {profile.education?.length === 1 ? "Entry" : "Entries"}
                      </span>
                    </div>

                    {profile.education?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {profile.education.map((edu, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] flex flex-col justify-between"
                          >
                            <div>
                              <h3 className="text-sm font-bold text-[var(--theme-text)]">
                                {edu.degree || "Degree Title"}
                              </h3>
                              <p className="text-xs font-medium text-[var(--theme-text-muted)] mt-0.5">
                                {edu.university || "University"}
                              </p>
                              {(edu.started || edu.ended) && (
                                <p className="text-[11px] font-mono text-[var(--theme-accent-silver)] mt-2">
                                  {edu.started} {edu.ended ? `– ${edu.ended}` : ""}
                                </p>
                              )}
                            </div>
                            {edu.CGPA && (
                              <div className="mt-3 pt-2 border-t border-[var(--theme-border)] text-[11px] text-[var(--theme-text-muted)] font-mono">
                                Grade / CGPA: <span className="font-bold text-[var(--theme-text)]">{edu.CGPA}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center bg-[var(--theme-surface-elevated)]/40 rounded-xl border border-dashed border-[var(--theme-border)]">
                        <GraduationCap size={28} className="mx-auto text-[var(--theme-text-muted)] mb-2 opacity-60" />
                        <p className="text-sm font-semibold text-[var(--theme-text)]">
                          No educational credentials added
                        </p>
                        <p className="text-xs text-[var(--theme-text-muted)] mt-1 max-w-sm mx-auto">
                          Add your degrees, certifications, or academic institutions.
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate("/editprofile")}
                          className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-semibold text-xs cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          Add Education
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 5. Certifications & Badges */}
                  <div className="bg-[var(--theme-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--theme-border)] shadow-xs">
                    <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[var(--theme-border)]">
                      <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)] flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)]">
                          <Award size={16} />
                        </div>
                        <span>Certifications & Accreditations</span>
                      </h2>
                      <span className="text-xs font-medium text-[var(--theme-text-muted)]">
                        {profile.certifications?.length || 0}
                      </span>
                    </div>

                    {profile.certifications?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {profile.certifications.map((cert, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] flex items-start justify-between gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-bold text-[var(--theme-text)] truncate">
                                {cert.name || "Certification"}
                              </h3>
                              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5 truncate">
                                {cert.issuer || "Issuing Body"}
                              </p>
                              {cert.year && (
                                <p className="text-[10px] font-mono text-[var(--theme-accent-silver)] mt-1.5">
                                  Issued: {cert.year}
                                </p>
                              )}
                            </div>
                            {cert.link && (
                              <a
                                href={cert.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors shrink-0"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--theme-text-muted)] italic text-center py-4">
                        No certifications listed yet.
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* TAB: DOCUMENTS & CREDENTIALS VAULT */}
              {(activeTab === "overview" || activeTab === "documents") && (
                <div className="bg-[var(--theme-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--theme-border)] shadow-xs">
                  <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[var(--theme-border)]">
                    <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)] flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)]">
                        <FileCheck size={16} />
                      </div>
                      <span>Verified Document Vault</span>
                    </h2>
                    <Link
                      to="/jobseeker-documents"
                      className="text-xs font-semibold text-[var(--theme-accent-silver)] hover:underline flex items-center gap-1"
                    >
                      <span>Manage Vault</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>

                  <p className="text-xs text-[var(--theme-text-muted)] mb-4 leading-relaxed">
                    Official credential documents and government proofs are encrypted and securely stored. Verified employers can inspect them during candidate verification.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} className="text-[var(--theme-accent-silver)] shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-[var(--theme-text)]">Academic Marksheets</p>
                          <p className="text-[10px] text-[var(--theme-text-muted)] font-mono">10th, 12th, UG, PG</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]">
                        Vault
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-[var(--theme-text)]">Government ID / Tax</p>
                          <p className="text-[10px] text-[var(--theme-text-muted)] font-mono">Aadhar & PAN Proofs</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Secure
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ──── RIGHT SIDEBAR (4 of 12 cols on desktop) ────────────────── */}
            <div className="lg:col-span-4 space-y-6">

              {/* 1. Resume Quick Access Box */}
              <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--theme-border)]">
                  <h3 className="text-xs font-bold text-[var(--theme-text)] uppercase tracking-wider flex items-center gap-2">
                    <FileText size={15} className="text-[var(--theme-accent-silver)]" />
                    <span>Resume / CV</span>
                  </h3>
                  {(profile.resume || profile.resumeFileKey) && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  )}
                </div>

                {(profile.resume || profile.resumeFileKey) ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[var(--theme-surface-elevated)]/50 border border-[var(--theme-border)] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] text-red-400 flex items-center justify-center shrink-0">
                        <FaFilePdf size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[var(--theme-text)] truncate">
                          {profile.name ? `${profile.name}_Resume.pdf` : "Resume.pdf"}
                        </p>
                        <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">Ready for direct application</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleOpenResume}
                        disabled={loadingResume}
                        className="px-3 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-[var(--theme-border)] transition-colors"
                      >
                        <Eye size={13} className="text-[var(--theme-accent-silver)]" />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadResume}
                        className="px-3 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-[var(--theme-border)] transition-colors"
                      >
                        <Download size={13} className="text-[var(--theme-accent-silver)]" />
                        <span>Download</span>
                      </button>
                    </div>

                    <Link
                      to="/resume-builder"
                      className="w-full py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      <FileCode size={13} />
                      <span>Edit in Resume Builder</span>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs font-bold text-[var(--theme-text)]">
                      No resume linked yet
                    </p>
                    <p className="text-[11px] text-[var(--theme-text-muted)] mt-1">
                      Build an ATS-optimized resume or upload an existing file.
                    </p>
                    <div className="mt-3.5 space-y-2">
                      <Link
                        to="/resume-builder"
                        className="w-full py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                      >
                        <FileCode size={13} />
                        <span>Build ATS Resume</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => navigate("/jobseeker-documents")}
                        className="w-full py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] border border-[var(--theme-border)] font-semibold text-xs cursor-pointer transition-colors"
                      >
                        Upload Document
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Core Skills & Competencies */}
              <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-[var(--theme-border)]">
                  <h3 className="text-xs font-bold text-[var(--theme-text)] uppercase tracking-wider flex items-center gap-2">
                    <Award size={15} className="text-[var(--theme-accent-silver)]" />
                    <span>Core Skills</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigate("/editprofile")}
                    className="text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                {profile.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] text-xs font-medium border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] transition-colors shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--theme-text-muted)] italic">No skills listed yet.</p>
                )}
              </div>

              {/* 3. Online Presence & Portfolios */}
              <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-[var(--theme-border)]">
                  <h3 className="text-xs font-bold text-[var(--theme-text)] uppercase tracking-wider flex items-center gap-2">
                    <Globe size={15} className="text-[var(--theme-accent-silver)]" />
                    <span>Online Presence</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigate("/editprofile")}
                    className="text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                {profile.portfolioLinks?.length > 0 ? (
                  <div className="space-y-2">
                    {profile.portfolioLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] transition-all group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center shrink-0 shadow-2xs">
                            {getPlatformIcon(link.platform)}
                          </div>
                          <span className="text-xs font-semibold text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver)] transition-colors truncate">
                            {link.platform || "Portfolio Link"}
                          </span>
                        </div>
                        <ExternalLink
                          size={13}
                          className="text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] shrink-0 transition-colors"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-xs text-[var(--theme-text-muted)] italic">No links added.</p>
                    <button
                      type="button"
                      onClick={() => navigate("/editprofile")}
                      className="mt-1.5 text-xs font-semibold text-[var(--theme-text)] hover:underline cursor-pointer"
                    >
                      + Add GitHub, LinkedIn, Website
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Career Preferences Card */}
              <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-xs">
                <h3 className="text-xs font-bold text-[var(--theme-text)] uppercase tracking-wider mb-3.5 flex items-center gap-2">
                  <Bookmark size={15} className="text-[var(--theme-accent-silver)]" />
                  <span>Job Preferences</span>
                </h3>

                <div className="space-y-2.5 text-xs font-medium text-[var(--theme-text-muted)]">
                  <div className="flex items-center justify-between py-1 border-b border-[var(--theme-border)]">
                    <span className="text-[var(--theme-text-muted)] font-medium">Status:</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Actively Interviewing
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[var(--theme-border)]">
                    <span className="text-[var(--theme-text-muted)] font-medium">Preferred Type:</span>
                    <span className="font-semibold text-[var(--theme-text)]">
                      Full-Time / Hybrid / Remote
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[var(--theme-text-muted)] font-medium">Target Location:</span>
                    <span className="font-semibold text-[var(--theme-text)]">
                      {profile.location || "Flexible / Remote"}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ─── 5. RESUME PREVIEW MODAL ────────────────────────────────────── */}
        {isResumeModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div className="fixed inset-0" onClick={() => setIsResumeModalOpen(false)} aria-hidden="true" />
            <div className="relative bg-[var(--theme-surface)] rounded-2xl w-full max-w-4xl h-[88vh] flex flex-col shadow-2xl border border-[var(--theme-border)] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="px-5 py-3.5 border-b border-[var(--theme-border)] flex items-center justify-between bg-[var(--theme-surface-elevated)] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] text-red-400 flex items-center justify-center">
                    <FaFilePdf size={16} />
                  </div>
                  <div>
                    <h3 id="resume-modal-title" className="text-sm sm:text-base font-bold text-[var(--theme-text)]">
                      {profile.name ? `${profile.name} - Resume Preview` : "Resume Preview"}
                    </h3>
                    <p className="text-[11px] text-[var(--theme-text-muted)]">Verified Document Viewer</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadResume}
                    className="px-3 py-1.5 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-90 shadow-xs"
                  >
                    <Download size={13} />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResumeModalOpen(false)}
                    className="p-1.5 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] cursor-pointer transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body / Iframe Viewer */}
              <div className="flex-1 w-full h-full bg-[var(--theme-surface-elevated)] overflow-hidden relative">
                {resumeUrl ? (
                  <iframe
                    src={`${resumeUrl}#toolbar=0`}
                    title="Candidate Resume"
                    className="w-full h-full border-none"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[var(--theme-text-muted)]">
                    <p className="text-sm font-bold text-[var(--theme-text)]">Unable to render document frame.</p>
                    <button
                      type="button"
                      onClick={handleDownloadResume}
                      className="mt-3 px-4 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-bold text-xs"
                    >
                      Download PDF Instead
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </CandidateLayout>
  );
}
