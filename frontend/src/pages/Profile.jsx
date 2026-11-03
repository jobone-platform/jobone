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
  ChevronRight,
  Download,
  Share2,
  Check,
  CheckCircle2,
  Sparkles,
  Clock,
  Building2,
  Calendar,
  ArrowUpRight,
  Eye,
  HeartHandshake,
  ShieldCheck,
  Layers,
  FileCheck,
  X,
  Code2,
  Bookmark,
  CheckCheck,
} from "lucide-react";
import {
  FaGithub,
  FaLinkedinIn,
  FaTwitter,
  FaGlobe,
  FaInstagram,
  FaDribbble,
  FaBehance,
  FaFilePdf,
} from "react-icons/fa";

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
        } catch (e) {
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

        // Safe parse helper
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
      items.push("Write an about me bio");
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
      items.push("Upload your resume / CV");
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
    showToast("Public profile link copied to clipboard!");
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
      showToast("No resume uploaded yet. Visit My Documents to add one.");
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
    if (p.includes("github")) return <FaGithub className="text-slate-800 dark:text-white" size={17} />;
    if (p.includes("linkedin")) return <FaLinkedinIn className="text-blue-600 dark:text-blue-400" size={17} />;
    if (p.includes("twitter") || p.includes("x")) return <FaTwitter className="text-sky-500" size={17} />;
    if (p.includes("dribbble")) return <FaDribbble className="text-pink-500" size={17} />;
    if (p.includes("behance")) return <FaBehance className="text-blue-500" size={17} />;
    if (p.includes("instagram")) return <FaInstagram className="text-rose-500" size={17} />;
    return <Globe className="text-indigo-500" size={17} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </div>
          <div className="text-center">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Loading Candidate Profile
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Fetching career records, credentials & portfolio...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl =
    profile.profilePicture ||
    (profile.gender === "Female"
      ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
      : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png");

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24 selection:bg-blue-600 selection:text-white transition-colors duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-950 rounded-2xl shadow-2xl backdrop-blur-md text-xs sm:text-sm font-bold border border-white/10 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCheck size={18} className="text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── 1. TOP COVER BANNER ────────────────────────────────────────── */}
      <div className="relative w-full h-52 sm:h-64 md:h-72 overflow-hidden bg-linear-to-r from-blue-700 via-indigo-700 to-violet-800 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 border-b border-blue-600/30 dark:border-slate-800">
        {/* Subtle Geometric Graphic Overlays */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Banner Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Candidate Profile
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyProfileLink}
              title="Copy public profile link"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {copiedLink ? <Check size={14} className="text-emerald-300" /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{copiedLink ? "Copied" : "Share"}</span>
            </button>

            <Link
              to={`/profile/${profile._id || profile.id}`}
              target="_blank"
              title="View public profile view"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Eye size={14} />
              <span className="hidden sm:inline">Public View</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. PROFILE HERO OVERLAY CARD ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.07)] p-5 sm:p-7 md:p-8 transition-colors">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 md:gap-8">
            
            {/* Avatar & Key Header Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 md:gap-6 min-w-0 flex-1">
              {/* Avatar with Live Green Status Pulse */}
              <div className="relative shrink-0 group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-3xl overflow-hidden p-1 bg-white dark:bg-slate-900 shadow-xl ring-4 ring-blue-500/20 dark:ring-blue-500/30">
                  <img
                    src={avatarUrl}
                    alt={profile.name || "Candidate Avatar"}
                    className="w-full h-full object-cover rounded-[22px] bg-slate-100 dark:bg-slate-800"
                  />
                </div>
                {/* Live Green Online / Open to Work Indicator (Platform Standard) */}
                <div
                  title="Open to Work • Actively Interviewing"
                  className="absolute bottom-1 right-1 flex items-center justify-center p-1.5 bg-white dark:bg-slate-900 rounded-full shadow-md ring-2 ring-emerald-500/40"
                >
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                </div>
              </div>

              {/* Identity & Headline Details */}
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {profile.name || "Candidate"}
                  </h1>
                  <span
                    title="Verified Candidate Account"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-black"
                  >
                    <ShieldCheck size={13} className="text-blue-600 dark:text-blue-400" />
                    Verified
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Open to Work
                  </span>
                </div>

                <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  {profile.title || "Jobseeker • Exploring Career Opportunities"}
                </p>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3.5 mt-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {profile.location && (
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                      <MapPin size={14} className="text-rose-500 shrink-0" />
                      <span>{profile.location}</span>
                    </span>
                  )}
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Mail size={14} className="text-blue-500 shrink-0" />
                      <span className="truncate max-w-[200px]">{profile.email}</span>
                    </a>
                  )}
                  {profile.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      <Phone size={14} className="text-emerald-500 shrink-0" />
                      <span>{profile.phone}</span>
                    </a>
                  )}
                  {profile.gender && (
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                      <UserIcon size={14} className="text-purple-500 shrink-0" />
                      <span>{profile.gender}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Top Action CTAs */}
            <div className="flex flex-row lg:flex-col gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0 justify-center">
              <button
                type="button"
                onClick={() => navigate("/editprofile")}
                className="flex-1 lg:flex-initial px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/jobseeker-documents")}
                className="flex-1 lg:flex-initial px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <FileText size={16} className="text-indigo-500" />
                <span>My Documents</span>
              </button>

              {(profile.resume || profile.resumeFileKey) && (
                <button
                  type="button"
                  onClick={handleOpenResume}
                  disabled={loadingResume}
                  className="flex-1 lg:flex-initial px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loadingResume ? (
                    <Loader2 size={16} className="animate-spin text-blue-400" />
                  ) : (
                    <Eye size={16} className="text-blue-400 dark:text-blue-600" />
                  )}
                  <span>View Resume</span>
                </button>
              )}
            </div>
          </div>

          {/* ─── Profile Strength & Completion Strip ───────────────────────── */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
                  <Sparkles size={16} />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Profile Completeness
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {profileStrength.nextStep}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                  {profileStrength.score}%
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {profileStrength.score >= 80 ? "All Star" : "In Progress"}
                </span>
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                style={{ width: `${profileStrength.score}%` }}
                className={`h-full rounded-full transition-all duration-700 ${
                  profileStrength.score >= 80
                    ? "bg-linear-to-r from-blue-500 to-emerald-500"
                    : "bg-linear-to-r from-amber-500 to-blue-500"
                }`}
              />
            </div>
          </div>
        </div>

        {/* ─── 3. MODERN TAB NAVIGATION ──────────────────────────────────── */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "overview", label: "Overview", icon: Layers },
            { id: "experience", label: "Experience & Projects", icon: Briefcase },
            { id: "education", label: "Education & Credentials", icon: GraduationCap },
            { id: "documents", label: "Resume & Documents", icon: FileCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
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
                {/* 1. About Me / Bio Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
                        <UserIcon size={18} />
                      </div>
                      <span>About Me</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => navigate("/editprofile")}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                  </div>

                  {profile.description ? (
                    <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {profile.description}
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <UserIcon size={32} className="mx-auto text-slate-400 mb-2 opacity-60" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        No professional summary added yet
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Add a compelling executive summary to capture employer attention.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/editprofile")}
                        className="mt-3.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition-all"
                      >
                        Add Summary
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Work Experience Timeline */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                        <Briefcase size={18} />
                      </div>
                      <span>Work Experience</span>
                    </h2>
                    <span className="text-xs font-bold text-slate-400">
                      {profile.experience?.length || 0} {profile.experience?.length === 1 ? "Role" : "Roles"}
                    </span>
                  </div>

                  {profile.experience?.length > 0 ? (
                    <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                      {profile.experience.map((exp, idx) => (
                        <div key={idx} className="relative group">
                          {/* Timeline Node Dot */}
                          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-400 flex items-center justify-center shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                          </div>

                          <div className="bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 group-hover:border-indigo-200 dark:group-hover:border-indigo-800/70 transition-all">
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                              <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                  {exp.role || "Role Position"}
                                </h3>
                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mt-0.5">
                                  <Building2 size={14} />
                                  <span>{exp.company || "Company"}</span>
                                </p>
                              </div>
                              {exp.duration && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-bold shadow-xs">
                                  <Calendar size={12} className="text-indigo-500" />
                                  <span>{exp.duration}</span>
                                </span>
                              )}
                            </div>

                            {exp.description && (
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2.5 whitespace-pre-line">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <Briefcase size={32} className="mx-auto text-slate-400 mb-2 opacity-60" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        No work history recorded
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Add past employers, roles, achievements, and impact to stand out.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/editprofile")}
                        className="mt-3.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer transition-all"
                      >
                        Add Experience
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Featured Projects */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
                        <Code2 size={18} />
                      </div>
                      <span>Featured Projects</span>
                    </h2>
                    <span className="text-xs font-bold text-slate-400">
                      {profile.projects?.length || 0} {profile.projects?.length === 1 ? "Project" : "Projects"}
                    </span>
                  </div>

                  {profile.projects?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.projects.map((proj, idx) => (
                        <div
                          key={idx}
                          className="group p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {proj.title || "Untitled Project"}
                              </h3>
                              {proj.link && (
                                <a
                                  href={proj.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open project link"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
                                >
                                  <ArrowUpRight size={17} />
                                </a>
                              )}
                            </div>

                            {proj.technologies && (
                              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                                {proj.technologies}
                              </p>
                            )}

                            {proj.description && (
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                                {proj.description}
                              </p>
                            )}
                          </div>

                          {proj.link && (
                            <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-500">
                              <span className="truncate max-w-[200px]">{proj.link.replace(/^https?:\/\//, "")}</span>
                              <ExternalLink size={13} className="shrink-0" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <Code2 size={32} className="mx-auto text-slate-400 mb-2 opacity-60" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        No projects showcased yet
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Highlight open-source repositories, case studies, or portfolio builds.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/editprofile")}
                        className="mt-3.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-all"
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
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400">
                        <GraduationCap size={18} />
                      </div>
                      <span>Education & Academics</span>
                    </h2>
                    <span className="text-xs font-bold text-slate-400">
                      {profile.education?.length || 0} {profile.education?.length === 1 ? "Entry" : "Entries"}
                    </span>
                  </div>

                  {profile.education?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.education.map((edu, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-rose-50/20 dark:bg-slate-800/40 border border-rose-100/70 dark:border-slate-800 flex flex-col justify-between"
                        >
                          <div>
                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-black uppercase tracking-wider mb-2">
                              Degree
                            </span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                              {edu.degree || "Degree Program"}
                            </h3>
                            <p className="text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 mt-1">
                              {edu.university || "University / College"}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-rose-100/40 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>
                              {edu.started || "Year"} - {edu.ended || "Year"}
                            </span>
                            {edu.CGPA && (
                              <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold border border-slate-200 dark:border-slate-700 shadow-xs">
                                CGPA: {edu.CGPA}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <GraduationCap size={32} className="mx-auto text-slate-400 mb-2 opacity-60" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        No education records listed
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/editprofile")}
                        className="mt-3.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer transition-all"
                      >
                        Add Education
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. Certifications & Achievements */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400">
                        <Award size={18} />
                      </div>
                      <span>Certifications & Accreditations</span>
                    </h2>
                  </div>

                  {profile.certifications?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {profile.certifications.map((cert, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800 transition-all"
                        >
                          <div className="min-w-0 pr-3">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {cert.name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              {cert.issuer} {cert.year ? `• ${cert.year}` : ""}
                            </p>
                          </div>
                          {cert.link && (
                            <a
                              href={cert.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Verify certificate"
                              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 shadow-xs transition-all shrink-0"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No certifications added.</p>
                  )}
                </div>

                {/* 6. Volunteering & Leadership (if any) */}
                {profile.volunteering?.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
                    <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400">
                          <HeartHandshake size={18} />
                        </div>
                        <span>Volunteering & Community Impact</span>
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {profile.volunteering.map((vol, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                        >
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {vol.role}
                          </h4>
                          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                            {vol.organization}
                          </p>
                          {vol.description && (
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                              {vol.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB: DOCUMENTS & RESUME */}
            {activeTab === "documents" && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                      <FileCheck size={18} />
                    </div>
                    <span>Resume & Professional Documents</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate("/jobseeker-documents")}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Manage Documents
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0 shadow-xs">
                      <FaFilePdf size={28} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {profile.name ? `${profile.name.replace(/\s+/g, "_")}_Resume.pdf` : "Candidate_Resume.pdf"}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {profile.resume || profile.resumeFileKey
                          ? "Verified PDF format • Ready for employer submissions"
                          : "No resume uploaded"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                    {(profile.resume || profile.resumeFileKey) ? (
                      <>
                        <button
                          type="button"
                          onClick={handleOpenResume}
                          disabled={loadingResume}
                          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                        >
                          <Eye size={14} />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadResume}
                          className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate("/jobseeker-documents")}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      >
                        <FileText size={14} />
                        <span>Upload Resume</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ──── RIGHT SIDEBAR (4 of 12 cols on desktop) ────────────────── */}
          <div className="lg:col-span-4 space-y-6">

            {/* 1. Resume Quick Access Box */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" />
                  <span>Resume / CV</span>
                </h3>
                {(profile.resume || profile.resumeFileKey) && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                    Active
                  </span>
                )}
              </div>

              {(profile.resume || profile.resumeFileKey) ? (
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <FaFilePdf size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {profile.name ? `${profile.name}_Resume.pdf` : "Resume.pdf"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Ready for direct apply</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleOpenResume}
                      disabled={loadingResume}
                      className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadResume}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    No resume linked yet
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Upload your resume to apply for verified jobs in 1 click.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/jobseeker-documents")}
                    className="mt-3.5 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition-all"
                  >
                    Upload Resume
                  </button>
                </div>
              )}
            </div>

            {/* 2. Core Skills & Competencies */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Award size={16} className="text-amber-500" />
                  <span>Core Skills</span>
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/editprofile")}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {profile.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200/60 dark:border-slate-700 hover:border-blue-400 transition-colors shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
              )}
            </div>

            {/* 3. Online Presence & Portfolios */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Globe size={16} className="text-indigo-500" />
                  <span>Online Presence</span>
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/editprofile")}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {profile.portfolioLinks?.length > 0 ? (
                <div className="space-y-2.5">
                  {profile.portfolioLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                          {getPlatformIcon(link.platform)}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {link.platform || "Portfolio Link"}
                        </span>
                      </div>
                      <ExternalLink
                        size={14}
                        className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-colors"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400 italic">No links added.</p>
                  <button
                    type="button"
                    onClick={() => navigate("/editprofile")}
                    className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    + Add GitHub, LinkedIn, Website
                  </button>
                </div>
              )}
            </div>

            {/* 4. Career Preferences Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Bookmark size={16} className="text-emerald-500" />
                <span>Job Preferences</span>
              </h3>

              <div className="space-y-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 font-bold">Status:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Actively Interviewing
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 font-bold">Preferred Type:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Full-Time / Hybrid
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-400 font-bold">Target Location:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl h-[88vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                  <FaFilePdf size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {profile.name ? `${profile.name} - Resume Preview` : "Resume Preview"}
                  </h3>
                  <p className="text-[11px] text-slate-400">PDF Viewer</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadResume}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body / Iframe Viewer */}
            <div className="flex-1 w-full h-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
              {resumeUrl ? (
                <iframe
                  src={`${resumeUrl}#toolbar=0`}
                  title="Candidate Resume"
                  className="w-full h-full border-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <p className="text-sm font-bold">Unable to render document frame.</p>
                  <button
                    type="button"
                    onClick={handleDownloadResume}
                    className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
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
  );
}
