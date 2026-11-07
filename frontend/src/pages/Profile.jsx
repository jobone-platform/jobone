import { API_BASE_URL } from "../config/api";
import axios from "axios";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  X,
  Code2,
  Bookmark,
  CheckCheck,
  FileCode,
  Plus,
  Trash2,
  Camera,
  Layers,
  Lock,
  Unlock,
  ChevronRight,
  CheckCircle2,
  Clock,
  Send,
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
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Core Data & Loading State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Resume Modal State
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);

  // Active In-Page Modal State
  // modalType: "summary" | "experience" | "education" | "project" | "certification" | "links" | "preferences" | null
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState({});
  const [modalIndex, setModalIndex] = useState(-1); // -1 = new, >= 0 = editing existing

  // Inline Quick Skill Input State
  const [newSkillInput, setNewSkillInput] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to safely parse stringified arrays
  const safeList = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_e) {
        return [];
      }
    }
    return [];
  };

  // Load Candidate Profile
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

      setProfile({
        ...data,
        skills: safeList(data.skills?.length ? data.skills : data.resumeData?.skills),
        experience: safeList(data.experience?.length ? data.experience : data.resumeData?.experience),
        education: safeList(data.education?.length ? data.education : data.resumeData?.education),
        projects: safeList(data.projects?.length ? data.projects : data.resumeData?.projects),
        certifications: safeList(data.certifications?.length ? data.certifications : data.resumeData?.certifications),
        volunteering: safeList(data.volunteering?.length ? data.volunteering : data.resumeData?.volunteering),
        portfolioLinks: safeList(data.portfolioLinks),
      });
    } catch (error) {
      console.error("Error fetching candidate profile:", error);
      showToast("Unable to load candidate profile. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Global ESC handler to dismiss modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isResumeModalOpen) setIsResumeModalOpen(false);
        if (activeModal) setActiveModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isResumeModalOpen, activeModal]);

  // Persist Updates to Backend & Sync Local State
  const saveProfileUpdates = async (updates, successMsg = "Profile updated successfully") => {
    const stored = localStorage.getItem("userInfo");
    const token = stored ? JSON.parse(stored)?.token : null;
    const userId = profile._id || profile.id;

    if (!token || !userId) {
      navigate("/login");
      return false;
    }

    try {
      setSaving(true);
      const { data } = await axios.patch(
        `${API_BASE_URL}/user/${userId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Merge updated fields into state
      setProfile((prev) => ({
        ...prev,
        ...data,
        skills: safeList(data.skills !== undefined ? data.skills : prev.skills),
        experience: safeList(data.experience !== undefined ? data.experience : prev.experience),
        education: safeList(data.education !== undefined ? data.education : prev.education),
        projects: safeList(data.projects !== undefined ? data.projects : prev.projects),
        certifications: safeList(data.certifications !== undefined ? data.certifications : prev.certifications),
        portfolioLinks: safeList(data.portfolioLinks !== undefined ? data.portfolioLinks : prev.portfolioLinks),
      }));

      // Update localStorage so AuthContext stays in sync
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            "userInfo",
            JSON.stringify({ ...parsed, ...data, token })
          );
        } catch (_err) {
          /* ignore */
        }
      }

      showToast(successMsg);
      setActiveModal(null);
      return true;
    } catch (err) {
      console.error("Save profile updates error:", err);
      const errorMsg = err.response?.data?.message || "Failed to update profile. Please try again.";
      showToast(errorMsg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Toggle Public Visibility
  const handleToggleVisibility = async () => {
    const nextState = profile.isPublic === false ? true : false;
    await saveProfileUpdates(
      { isPublic: nextState },
      nextState ? "Profile is now visible to verified recruiters" : "Profile visibility set to private"
    );
  };

  // Upload Profile Avatar Photo
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, or WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be smaller than 5MB.");
      return;
    }

    const stored = localStorage.getItem("userInfo");
    const token = stored ? JSON.parse(stored)?.token : null;
    const userId = profile._id || profile.id;

    try {
      setUploadingPhoto(true);
      showToast("Uploading profile photo...");

      // 1. Get presigned upload URL from backend
      const { data: signData } = await axios.post(
        `${API_BASE_URL}/user/${userId}/profile-picture/upload-url`,
        { fileType: file.type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Upload binary payload to S3
      await axios.put(signData.uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      // 3. Save public URL on User model
      await saveProfileUpdates(
        { profilePicture: signData.publicUrl },
        "Profile photo updated successfully!"
      );
    } catch (err) {
      console.error("Avatar upload failed:", err);
      showToast("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Copy Public Profile URL
  const handleCopyProfileLink = () => {
    const publicUrl = `${window.location.origin}/profile/${profile._id || profile.id}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    showToast("Public profile link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // View Resume in Iframe Modal
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

  // Direct Download Resume
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

  // Skill Handlers
  const handleAddSkillInline = async (e) => {
    if (e) e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    const current = profile.skills || [];
    if (current.includes(trimmed)) {
      showToast("Skill already added.");
      setNewSkillInput("");
      return;
    }
    const nextSkills = [...current, trimmed];
    setNewSkillInput("");
    await saveProfileUpdates({ skills: nextSkills }, `Skill "${trimmed}" added`);
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const nextSkills = (profile.skills || []).filter((s) => s !== skillToRemove);
    await saveProfileUpdates({ skills: nextSkills }, `Skill "${skillToRemove}" removed`);
  };

  // Modal Open Handlers
  const openModal = (type, data = {}, index = -1) => {
    setActiveModal(type);
    setModalData({ ...data });
    setModalIndex(index);
  };

  // Modal Submission Handlers
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (activeModal === "summary") {
      await saveProfileUpdates(
        { description: modalData.description || "" },
        "Executive summary updated"
      );
    } else if (activeModal === "preferences") {
      await saveProfileUpdates(
        {
          title: modalData.title || "",
          location: modalData.location || "",
          gender: modalData.gender || "",
        },
        "Career profile preferences updated"
      );
    } else if (activeModal === "experience") {
      if (!modalData.company?.trim() || !modalData.role?.trim()) {
        showToast("Company name and Role title are required.");
        return;
      }
      const list = [...(profile.experience || [])];
      if (modalIndex >= 0) {
        list[modalIndex] = modalData;
      } else {
        list.unshift(modalData);
      }
      await saveProfileUpdates({ experience: list }, "Work experience updated");
    } else if (activeModal === "education") {
      if (!modalData.degree?.trim() || !modalData.university?.trim()) {
        showToast("Degree title and University are required.");
        return;
      }
      const list = [...(profile.education || [])];
      if (modalIndex >= 0) {
        list[modalIndex] = modalData;
      } else {
        list.unshift(modalData);
      }
      await saveProfileUpdates({ education: list }, "Education history updated");
    } else if (activeModal === "project") {
      if (!modalData.title?.trim()) {
        showToast("Project title is required.");
        return;
      }
      const list = [...(profile.projects || [])];
      if (modalIndex >= 0) {
        list[modalIndex] = modalData;
      } else {
        list.unshift(modalData);
      }
      await saveProfileUpdates({ projects: list }, "Project showcase updated");
    } else if (activeModal === "certification") {
      if (!modalData.name?.trim()) {
        showToast("Certification title is required.");
        return;
      }
      const list = [...(profile.certifications || [])];
      if (modalIndex >= 0) {
        list[modalIndex] = modalData;
      } else {
        list.unshift(modalData);
      }
      await saveProfileUpdates({ certifications: list }, "Certification credential updated");
    } else if (activeModal === "links") {
      if (!modalData.platform?.trim() || !modalData.url?.trim()) {
        showToast("Platform name and URL are required.");
        return;
      }
      const list = [...(profile.portfolioLinks || [])];
      if (modalIndex >= 0) {
        list[modalIndex] = modalData;
      } else {
        list.push(modalData);
      }
      await saveProfileUpdates({ portfolioLinks: list }, "Portfolio link updated");
    }
  };

  // Delete Item from Array Fields
  const handleDeleteArrayItem = async (fieldKey, index) => {
    const list = [...(profile[fieldKey] || [])];
    list.splice(index, 1);
    await saveProfileUpdates(
      { [fieldKey]: list },
      `Entry removed from ${fieldKey}`
    );
  };

  // Dynamic Profile Strength & Checklist Calculation
  const profileAudit = useMemo(() => {
    const checks = [
      {
        id: "identity",
        label: "Contact & Identity",
        hint: "Full name and verified email",
        done: Boolean(profile.name && profile.email),
        weight: 15,
        action: () => openModal("preferences", { title: profile.title, location: profile.location, gender: profile.gender }),
      },
      {
        id: "photo",
        label: "Professional Photo",
        hint: "Upload a clean headshot",
        done: Boolean(profile.profilePicture),
        weight: 15,
        action: () => fileInputRef.current?.click(),
      },
      {
        id: "summary",
        label: "Executive Summary",
        hint: "Brief 2-3 sentence overview",
        done: Boolean(profile.description && profile.description.trim().length >= 25),
        weight: 15,
        action: () => openModal("summary", { description: profile.description }),
      },
      {
        id: "skills",
        label: "Core Skills (3+)",
        hint: "Highlight key proficiencies",
        done: Boolean(profile.skills && profile.skills.length >= 3),
        weight: 15,
        action: () => document.getElementById("skill-inline-input")?.focus(),
      },
      {
        id: "experience",
        label: "Work Experience",
        hint: "Add at least one role",
        done: Boolean(profile.experience && profile.experience.length > 0),
        weight: 15,
        action: () => openModal("experience"),
      },
      {
        id: "education",
        label: "Education Record",
        hint: "Degree and university details",
        done: Boolean(profile.education && profile.education.length > 0),
        weight: 10,
        action: () => openModal("education"),
      },
      {
        id: "resume",
        label: "ATS Resume / CV",
        hint: "Active PDF attached",
        done: Boolean(profile.resume || profile.resumeFileKey),
        weight: 15,
        action: () => navigate("/resume-builder"),
      },
    ];

    const completed = checks.filter((c) => c.done);
    const score = checks.reduce((acc, c) => (c.done ? acc + c.weight : acc), 0);
    const pendingChecks = checks.filter((c) => !c.done);

    return {
      score: Math.min(score, 100),
      completedCount: completed.length,
      totalCount: checks.length,
      checks,
      pendingChecks,
      nextAction: pendingChecks[0] || null,
    };
  }, [profile]);

  // Social & Platform Icon Helper
  const getPlatformIcon = (platform = "") => {
    const p = platform.toLowerCase();
    if (p.includes("github")) return <FaGithub className="text-[var(--theme-text)]" size={15} />;
    if (p.includes("linkedin")) return <FaLinkedinIn className="text-[var(--theme-text)]" size={15} />;
    if (p.includes("twitter") || p.includes("x")) return <FaTwitter className="text-[var(--theme-text)]" size={15} />;
    if (p.includes("dribbble")) return <FaDribbble className="text-[var(--theme-text)]" size={15} />;
    if (p.includes("behance")) return <FaBehance className="text-[var(--theme-text)]" size={15} />;
    if (p.includes("instagram")) return <FaInstagram className="text-[var(--theme-text)]" size={15} />;
    return <Globe className="text-[var(--theme-text-muted)]" size={15} />;
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
        title="Candidate Profile"
        breadcrumbs={[{ label: "Career Workspace", path: "/userdashboard" }, { label: "Candidate Profile" }]}
      >
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center shadow-xs">
            <Loader2 className="animate-spin text-[var(--theme-accent-silver)]" size={24} />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-bold text-[var(--theme-text)]">Loading Candidate Profile</h3>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1">Retrieving verified portfolio and career credentials...</p>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout
      activeTab="profile"
      title="Candidate Profile"
      breadcrumbs={[{ label: "Career Workspace", path: "/userdashboard" }, { label: "Candidate Profile" }]}
    >
      <div className="pb-16 selection:bg-[var(--theme-text)] selection:text-[var(--theme-bg)] max-w-7xl mx-auto space-y-6">
        
        {/* Hidden File Input for Avatar Photo Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoSelect}
          accept="image/*"
          className="hidden"
          aria-hidden="true"
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[var(--theme-text)] text-[var(--theme-bg)] rounded-xl shadow-2xl backdrop-blur-md text-xs sm:text-sm font-bold border border-[var(--theme-border)] animate-in fade-in slide-in-from-bottom-4 duration-200">
            <CheckCheck size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 1. CANDIDATE IDENTITY HEADER & CONTEXTUAL ACTION BAR                 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section
          aria-label="Candidate Identity"
          className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] p-5 sm:p-6 shadow-sm relative overflow-hidden"
        >
          {/* Subtle Decorative Ambient Sheen */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start justify-between gap-6">
            
            {/* Left: Avatar & Identity Details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 flex-1 min-w-0">
              
              {/* Avatar with Camera Overlay & Work Status Badge */}
              <div className="relative shrink-0 group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-0.5 bg-[var(--theme-surface-elevated)] shadow-md border border-[var(--theme-border-silver)]">
                  <img
                    src={avatarUrl}
                    alt={profile.name || "Candidate"}
                    className="w-full h-full object-cover rounded-xl bg-[var(--theme-surface)]"
                  />
                </div>

                {/* Photo Change Button Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  title="Upload profile picture"
                  aria-label="Change profile picture"
                  className="absolute inset-0.5 rounded-xl bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-2xs"
                >
                  {uploadingPhoto ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <>
                      <Camera size={16} />
                      <span className="text-[10px] font-semibold mt-0.5">Edit Photo</span>
                    </>
                  )}
                </button>

                {/* Online / Active Availability Dot */}
                <div
                  title="Actively Interviewing & Open to Opportunities"
                  className="absolute -bottom-1 -right-1 flex items-center justify-center p-1 bg-[var(--theme-surface)] rounded-full shadow-xs border border-emerald-500/40"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
              </div>

              {/* Identity, Badges & Headline */}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-[var(--theme-text)] tracking-tight">
                    {profile.name || "Candidate Name"}
                  </h1>

                  <span
                    title="Verified Candidate Profile"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border)] text-[11px] font-semibold"
                  >
                    <ShieldCheck size={12} className="text-[var(--theme-accent-silver)]" />
                    <span>Verified Talent</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleToggleVisibility}
                    title="Click to toggle public recruiter visibility"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border cursor-pointer transition-colors ${
                      profile.isPublic !== false
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20"
                    }`}
                  >
                    {profile.isPublic !== false ? (
                      <>
                        <Unlock size={11} />
                        <span>Public Portfolio</span>
                      </>
                    ) : (
                      <>
                        <Lock size={11} />
                        <span>Private Dossier</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs sm:text-sm font-medium text-[var(--theme-text-muted)] line-clamp-2 max-w-2xl leading-relaxed">
                  {profile.title ||
                    profile.description?.slice(0, 110) ||
                    "Professional Talent • Actively exploring career advancement opportunities"}
                </p>

                {/* Contact & Geography Row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3 text-xs text-[var(--theme-text-muted)]">
                  {profile.location && (
                    <span className="flex items-center gap-1.5 bg-[var(--theme-surface-elevated)] px-2.5 py-1 rounded-lg border border-[var(--theme-border)]">
                      <MapPin size={12} className="text-[var(--theme-accent-silver)] shrink-0" />
                      <span>{profile.location}</span>
                    </span>
                  )}
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-1.5 bg-[var(--theme-surface-elevated)] px-2.5 py-1 rounded-lg border border-[var(--theme-border)] hover:text-[var(--theme-text)] transition-colors truncate max-w-[240px]"
                    >
                      <Mail size={12} className="text-[var(--theme-accent-silver)] shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </a>
                  )}
                  {profile.phone && !profile.phone.startsWith("G-") && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="flex items-center gap-1.5 bg-[var(--theme-surface-elevated)] px-2.5 py-1 rounded-lg border border-[var(--theme-border)] hover:text-[var(--theme-text)] transition-colors"
                    >
                      <Phone size={12} className="text-[var(--theme-accent-silver)] shrink-0" />
                      <span>{profile.phone}</span>
                    </a>
                  )}
                  <span className="flex items-center gap-1.5 bg-[var(--theme-surface-elevated)] px-2.5 py-1 rounded-lg border border-[var(--theme-border)] text-emerald-400 font-semibold font-mono text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Open to Work</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2 w-full lg:w-48 shrink-0">
              <Link
                to="/resume-builder"
                className="flex-1 lg:flex-initial py-2.5 px-4 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-xs"
              >
                <FileCode size={14} />
                <span>Resume Builder</span>
                <span className="px-1.5 py-0.2 bg-[var(--theme-primary-btn-text)]/20 rounded text-[9px] font-mono">ATS</span>
              </Link>

              <button
                type="button"
                onClick={() => openModal("preferences", { title: profile.title, location: profile.location, gender: profile.gender })}
                className="flex-1 lg:flex-initial py-2 px-3.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] font-semibold text-xs flex items-center justify-center gap-1.5 border border-[var(--theme-border-silver)] transition-all cursor-pointer shadow-2xs"
              >
                <Edit3 size={13} className="text-[var(--theme-accent-silver)]" />
                <span>Edit Profile</span>
              </button>

              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  type="button"
                  onClick={handleCopyProfileLink}
                  title="Share public portfolio link"
                  className="py-2 px-2.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] font-semibold text-xs flex items-center justify-center gap-1.5 border border-[var(--theme-border)] transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                  <span>{copiedLink ? "Copied" : "Share"}</span>
                </button>

                <Link
                  to={`/profile/${profile._id || profile.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Preview as visible to recruiters"
                  className="py-2 px-2.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] font-semibold text-xs flex items-center justify-center gap-1.5 border border-[var(--theme-border)] transition-colors"
                >
                  <Eye size={13} />
                  <span>Public</span>
                </Link>
              </div>
            </div>

          </div>

          {/* Completeness Health Strip */}
          <div className="mt-5 pt-4 border-t border-[var(--theme-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[var(--theme-accent-silver)] shrink-0" />
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-[var(--theme-text)]">Profile Strength:</span>
                <span className="font-mono font-bold text-[var(--theme-text)]">{profileAudit.score}%</span>
                {profileAudit.nextAction && (
                  <button
                    type="button"
                    onClick={profileAudit.nextAction.action}
                    className="text-[var(--theme-accent-silver)] hover:underline text-[11px] cursor-pointer"
                  >
                    • Next: {profileAudit.nextAction.label}
                  </button>
                )}
              </div>
            </div>

            <div className="w-full sm:w-48 bg-[var(--theme-surface-elevated)] rounded-full h-2 overflow-hidden border border-[var(--theme-border)]">
              <div
                style={{ width: `${profileAudit.score}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  profileAudit.score >= 80 ? "bg-emerald-500" : "bg-[var(--theme-accent-silver)]"
                }`}
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 2. COMPACT PROFESSIONAL OVERVIEW METRICS STRIP                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section aria-label="Professional Overview" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Card 1: Experience Level */}
          <div className="bg-[var(--theme-surface)] p-4 rounded-xl border border-[var(--theme-border)] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Experience</span>
              <Briefcase size={14} className="text-[var(--theme-accent-silver)]" />
            </div>
            <div className="text-base sm:text-lg font-bold text-[var(--theme-text)]">
              {profile.experience?.length ? `${profile.experience.length} ${profile.experience.length === 1 ? "Role" : "Roles"}` : "Entry Level"}
            </div>
            <p className="text-[11px] text-[var(--theme-text-subtle)] truncate mt-0.5">
              {profile.experience?.[0]?.company ? `Latest: ${profile.experience[0].company}` : "Verified career history"}
            </p>
          </div>

          {/* Card 2: Highest Education */}
          <div className="bg-[var(--theme-surface)] p-4 rounded-xl border border-[var(--theme-border)] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Education</span>
              <GraduationCap size={14} className="text-[var(--theme-accent-silver)]" />
            </div>
            <div className="text-base sm:text-lg font-bold text-[var(--theme-text)] truncate">
              {profile.education?.[0]?.degree || "Degree Pending"}
            </div>
            <p className="text-[11px] text-[var(--theme-text-subtle)] truncate mt-0.5">
              {profile.education?.[0]?.university || "Academic accreditation"}
            </p>
          </div>

          {/* Card 3: Skills Count */}
          <div className="bg-[var(--theme-surface)] p-4 rounded-xl border border-[var(--theme-border)] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Core Skills</span>
              <Award size={14} className="text-[var(--theme-accent-silver)]" />
            </div>
            <div className="text-base sm:text-lg font-bold text-[var(--theme-text)]">
              {profile.skills?.length || 0} Competencies
            </div>
            <p className="text-[11px] text-[var(--theme-text-subtle)] truncate mt-0.5">
              {profile.skills?.slice(0, 2).join(", ") || "Technical stack"}
            </p>
          </div>

          {/* Card 4: Employment Preference */}
          <div className="bg-[var(--theme-surface)] p-4 rounded-xl border border-[var(--theme-border)] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Work Preference</span>
              <Bookmark size={14} className="text-[var(--theme-accent-silver)]" />
            </div>
            <div className="text-base sm:text-lg font-bold text-[var(--theme-text)] truncate">
              Full-Time / Hybrid
            </div>
            <p className="text-[11px] text-[var(--theme-text-subtle)] truncate mt-0.5">
              {profile.location || "Remote & Flexible"}
            </p>
          </div>

        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 3. BALANCED TWO-COLUMN ATS CONTENT WORKSPACE                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ───────────────────────────────────────────────────────────────── */}
          {/* LEFT / PRIMARY COLUMN (8 of 12 cols): Resume & Career Content     */}
          {/* ───────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">

            {/* A. Professional Summary */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--theme-border)] shadow-xs">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--theme-border)]">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)]">
                    <UserIcon size={15} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)]">
                      Executive Summary
                    </h2>
                    <p className="text-[11px] text-[var(--theme-text-muted)]">Professional career overview and core value proposition</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openModal("summary", { description: profile.description })}
                  className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] border border-[var(--theme-border)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 size={12} className="text-[var(--theme-accent-silver)]" />
                  <span>{profile.description ? "Edit Bio" : "+ Add Bio"}</span>
                </button>
              </div>

              {profile.description ? (
                <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] leading-relaxed whitespace-pre-line">
                  {profile.description}
                </p>
              ) : (
                <div className="py-6 text-center bg-[var(--theme-surface-elevated)]/30 rounded-xl border border-dashed border-[var(--theme-border)]">
                  <UserIcon size={24} className="mx-auto text-[var(--theme-text-subtle)] mb-2" />
                  <p className="text-xs font-semibold text-[var(--theme-text)]">No summary written yet</p>
                  <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5 max-w-sm mx-auto">
                    Add a concise statement describing your expertise, achievements, and career focus.
                  </p>
                  <button
                    type="button"
                    onClick={() => openModal("summary", { description: "" })}
                    className="mt-3 px-3 py-1 rounded-lg bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    + Add Summary
                  </button>
                </div>
              )}
            </div>

            {/* B. Work Experience */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--theme-border)] shadow-xs">
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[var(--theme-border)]">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)]">
                    <Briefcase size={15} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)]">
                      Work Experience
                    </h2>
                    <p className="text-[11px] text-[var(--theme-text-muted)]">Verified corporate employment and contractual engagements</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openModal("experience")}
                  className="px-2.5 py-1 rounded-lg bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold flex items-center gap-1.5 transition-opacity hover:opacity-90 cursor-pointer shadow-2xs"
                >
                  <Plus size={13} />
                  <span>Add Role</span>
                </button>
              </div>

              {profile.experience?.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--theme-border)]">
                  {profile.experience.map((exp, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline Node Dot */}
                      <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-[var(--theme-surface)] border-2 border-[var(--theme-border-silver)] flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent-silver)]" />
                      </div>

                      <div className="bg-[var(--theme-surface-elevated)]/50 p-4 rounded-xl border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] transition-all">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-[var(--theme-text)]">
                              {exp.role || "Job Role"}
                            </h3>
                            <p className="text-xs font-semibold text-[var(--theme-text-muted)] flex items-center gap-1.5 mt-0.5">
                              <Building2 size={12} className="text-[var(--theme-accent-silver)] shrink-0" />
                              <span>{exp.company || "Enterprise"}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {exp.duration && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border border-[var(--theme-border)] text-[11px] font-mono">
                                <Calendar size={11} className="text-[var(--theme-accent-silver)]" />
                                <span>{exp.duration}</span>
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => openModal("experience", exp, idx)}
                              title="Edit position"
                              className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] rounded-md transition-colors cursor-pointer"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArrayItem("experience", idx)}
                              title="Delete position"
                              className="p-1 text-[var(--theme-text-muted)] hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {exp.description && (
                          <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed mt-2.5 whitespace-pre-line border-t border-[var(--theme-border)] pt-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center bg-[var(--theme-surface-elevated)]/30 rounded-xl border border-dashed border-[var(--theme-border)]">
                  <Briefcase size={24} className="mx-auto text-[var(--theme-text-subtle)] mb-2" />
                  <p className="text-xs font-semibold text-[var(--theme-text)]">No work experience entries recorded</p>
                  <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5 max-w-sm mx-auto">
                    Add your previous positions to enhance your candidate rating in recruiter searches.
                  </p>
                  <button
                    type="button"
                    onClick={() => openModal("experience")}
                    className="mt-3 px-3 py-1 rounded-lg bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    + Add Experience
                  </button>
                </div>
              )}
            </div>

            {/* C. Education & Academics */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--theme-border)] shadow-xs">
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[var(--theme-border)]">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)]">
                    <GraduationCap size={15} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)]">
                      Education & Academics
                    </h2>
                    <p className="text-[11px] text-[var(--theme-text-muted)]">Degrees, diplomas, and collegiate qualifications</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openModal("education")}
                  className="px-2.5 py-1 rounded-lg bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold flex items-center gap-1.5 transition-opacity hover:opacity-90 cursor-pointer shadow-2xs"
                >
                  <Plus size={13} />
                  <span>Add Degree</span>
                </button>
              </div>

              {profile.education?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {profile.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-[var(--theme-text)]">
                            {edu.degree || "Degree Title"}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => openModal("education", edu, idx)}
                              title="Edit education"
                              className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] rounded transition-colors cursor-pointer"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArrayItem("education", idx)}
                              title="Delete education"
                              className="p-1 text-[var(--theme-text-muted)] hover:text-rose-400 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">
                          {edu.university || "Academic Institution"}
                        </p>

                        {(edu.started || edu.ended) && (
                          <p className="text-[11px] font-mono text-[var(--theme-accent-silver)] mt-2">
                            {edu.started} {edu.ended ? `– ${edu.ended}` : ""}
                          </p>
                        )}
                      </div>

                      {edu.CGPA && (
                        <div className="mt-3 pt-2 border-t border-[var(--theme-border)] flex items-center justify-between text-[11px] font-mono text-[var(--theme-text-muted)]">
                          <span>Grade / Performance:</span>
                          <span className="font-bold text-[var(--theme-text)]">{edu.CGPA}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center bg-[var(--theme-surface-elevated)]/30 rounded-xl border border-dashed border-[var(--theme-border)]">
                  <GraduationCap size={24} className="mx-auto text-[var(--theme-text-subtle)] mb-2" />
                  <p className="text-xs font-semibold text-[var(--theme-text)]">No education records added yet</p>
                  <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5 max-w-sm mx-auto">
                    List your degree programmes, certifications, or universities.
                  </p>
                  <button
                    type="button"
                    onClick={() => openModal("education")}
                    className="mt-3 px-3 py-1 rounded-lg bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    + Add Education
                  </button>
                </div>
              )}
            </div>

            {/* D. Skills & Technical Expertise */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--theme-border)] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-[var(--theme-border)] gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)]">
                    <Award size={15} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)] flex items-center gap-2">
                      <span>Skills & Technical Stack</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)]">
                        {profile.skills?.length || 0}
                      </span>
                    </h2>
                    <p className="text-[11px] text-[var(--theme-text-muted)]">Verified competencies used by JobOne ATS algorithms</p>
                  </div>
                </div>

                {/* Inline Quick Add Skill Input */}
                <form onSubmit={handleAddSkillInline} className="flex items-center gap-1.5">
                  <input
                    id="skill-inline-input"
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Add skill (e.g. Next.js)..."
                    className="px-3 py-1.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:border-[var(--theme-border-silver)] outline-none transition-colors w-40 sm:w-48"
                  />
                  <button
                    type="submit"
                    disabled={!newSkillInput.trim() || saving}
                    title="Add skill tag"
                    className="p-1.5 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </form>
              </div>

              {profile.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] text-xs font-semibold border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] transition-all shadow-2xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        title={`Remove ${skill}`}
                        className="text-[var(--theme-text-subtle)] hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center bg-[var(--theme-surface-elevated)]/30 rounded-xl border border-dashed border-[var(--theme-border)]">
                  <Award size={24} className="mx-auto text-[var(--theme-text-subtle)] mb-2" />
                  <p className="text-xs font-semibold text-[var(--theme-text)]">No skills registered</p>
                  <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">
                    Type a competency in the box above to immediately add it to your dossier.
                  </p>
                </div>
              )}
            </div>

            {/* E. Projects & Case Studies */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--theme-border)] shadow-xs">
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[var(--theme-border)]">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)]">
                    <Code2 size={15} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)]">
                      Projects & Engineering Portfolio
                    </h2>
                    <p className="text-[11px] text-[var(--theme-text-muted)]">Code repositories, open-source work, and product builds</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openModal("project")}
                  className="px-2.5 py-1 rounded-lg bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold flex items-center gap-1.5 transition-opacity hover:opacity-90 cursor-pointer shadow-2xs"
                >
                  <Plus size={13} />
                  <span>Add Project</span>
                </button>
              </div>

              {profile.projects?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {profile.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="group p-4 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver)] transition-colors line-clamp-1">
                            {proj.title || "Project Title"}
                          </h3>

                          <div className="flex items-center gap-1 shrink-0">
                            {proj.link && (
                              <a
                                href={proj.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open live project"
                                className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                              >
                                <ArrowUpRight size={13} />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => openModal("project", proj, idx)}
                              title="Edit project"
                              className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] rounded transition-colors cursor-pointer"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArrayItem("projects", idx)}
                              title="Delete project"
                              className="p-1 text-[var(--theme-text-muted)] hover:text-rose-400 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {proj.technologies && (
                          <p className="text-[11px] font-mono font-medium text-[var(--theme-accent-silver)] mb-2">
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
                        <div className="mt-3 pt-2 border-t border-[var(--theme-border)] text-[11px] text-[var(--theme-text-muted)] font-mono truncate">
                          {proj.link.replace(/^https?:\/\//, "")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center bg-[var(--theme-surface-elevated)]/30 rounded-xl border border-dashed border-[var(--theme-border)]">
                  <Code2 size={24} className="mx-auto text-[var(--theme-text-subtle)] mb-2" />
                  <p className="text-xs font-semibold text-[var(--theme-text)]">No projects showcased</p>
                  <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5 max-w-sm mx-auto">
                    Showcase open-source libraries, web applications, or design systems.
                  </p>
                  <button
                    type="button"
                    onClick={() => openModal("project")}
                    className="mt-3 px-3 py-1 rounded-lg bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    + Add Project
                  </button>
                </div>
              )}
            </div>

            {/* F. Certifications & Badges */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--theme-border)] shadow-xs">
              <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[var(--theme-border)]">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)]">
                    <Award size={15} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)]">
                      Certifications & Accreditations
                    </h2>
                    <p className="text-[11px] text-[var(--theme-text-muted)]">Industry badges, licenses, and verified skill credentials</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openModal("certification")}
                  className="px-2.5 py-1 rounded-lg bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold flex items-center gap-1.5 transition-opacity hover:opacity-90 cursor-pointer shadow-2xs"
                >
                  <Plus size={13} />
                  <span>Add Badge</span>
                </button>
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
                          {cert.issuer || "Issuing Authority"}
                        </p>
                        {(cert.date || cert.year) && (
                          <p className="text-[10px] font-mono text-[var(--theme-accent-silver)] mt-1.5">
                            Issued: {cert.date || cert.year}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {cert.link && (
                          <a
                            href={cert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Verify credential"
                            className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => openModal("certification", cert, idx)}
                          title="Edit certification"
                          className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] rounded transition-colors cursor-pointer"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArrayItem("certifications", idx)}
                          title="Delete certification"
                          className="p-1 text-[var(--theme-text-muted)] hover:text-rose-400 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center bg-[var(--theme-surface-elevated)]/30 rounded-xl border border-dashed border-[var(--theme-border)]">
                  <Award size={24} className="mx-auto text-[var(--theme-text-subtle)] mb-2" />
                  <p className="text-xs font-semibold text-[var(--theme-text)]">No certifications listed</p>
                  <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">
                    Add AWS, Google Cloud, Cisco, or university course certificates.
                  </p>
                  <button
                    type="button"
                    onClick={() => openModal("certification")}
                    className="mt-3 px-3 py-1 rounded-lg bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    + Add Certification
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* RIGHT / SECONDARY COLUMN (4 of 12 cols): Documents & Verification */}
          {/* ───────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">

            {/* 1. Active Resume & Document Hub */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--theme-border)]">
                <h3 className="text-xs font-bold text-[var(--theme-text)] uppercase tracking-wider flex items-center gap-2">
                  <FileText size={14} className="text-[var(--theme-accent-silver)]" />
                  <span>Resume & CV File</span>
                </h3>
                {profile.resume || profile.resumeFileKey ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Missing
                  </span>
                )}
              </div>

              {profile.resume || profile.resumeFileKey ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] text-rose-400 flex items-center justify-center shrink-0">
                      <FaFilePdf size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[var(--theme-text)] truncate">
                        {profile.name ? `${profile.name}_Resume.pdf` : "Candidate_Resume.pdf"}
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
                      <span>View PDF</span>
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
                    <span>Open in ATS Resume Builder</span>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs font-bold text-[var(--theme-text)]">No resume attached</p>
                  <p className="text-[11px] text-[var(--theme-text-muted)] mt-1">
                    Build a structured ATS-compliant resume or upload an existing PDF.
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

              {/* Document Vault Shortcut */}
              <div className="mt-4 pt-3 border-t border-[var(--theme-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="text-[11px] font-semibold text-[var(--theme-text-muted)]">Verified Document Vault</span>
                </div>
                <Link
                  to="/jobseeker-documents"
                  className="text-[11px] font-bold text-[var(--theme-text)] hover:underline flex items-center gap-1"
                >
                  <span>Vault</span>
                  <ChevronRight size={12} />
                </Link>
              </div>
            </div>

            {/* 2. Profile Completeness Checklist */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--theme-border)]">
                <h3 className="text-xs font-bold text-[var(--theme-text)] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} className="text-[var(--theme-accent-silver)]" />
                  <span>Profile Checklist</span>
                </h3>
                <span className="text-[11px] font-mono font-bold text-[var(--theme-text)]">
                  {profileAudit.completedCount} / {profileAudit.totalCount}
                </span>
              </div>

              <div className="space-y-2.5">
                {profileAudit.checks.map((chk) => (
                  <div
                    key={chk.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--theme-surface-elevated)]/30 border border-[var(--theme-border)]/60"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {chk.done ? (
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-dashed border-[var(--theme-text-subtle)] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${chk.done ? "text-[var(--theme-text)]" : "text-[var(--theme-text-muted)]"}`}>
                          {chk.label}
                        </p>
                      </div>
                    </div>

                    {!chk.done && (
                      <button
                        type="button"
                        onClick={chk.action}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] transition-colors cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Career & Recruitment Preferences */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-[var(--theme-border)]">
                <h3 className="text-xs font-bold text-[var(--theme-text)] uppercase tracking-wider flex items-center gap-2">
                  <Bookmark size={14} className="text-[var(--theme-accent-silver)]" />
                  <span>Career Preferences</span>
                </h3>
                <button
                  type="button"
                  onClick={() => openModal("preferences", { title: profile.title, location: profile.location, gender: profile.gender })}
                  className="text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-[var(--theme-border)]">
                  <span className="text-[var(--theme-text-muted)] font-medium">Availability:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Immediate / Active
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[var(--theme-border)]">
                  <span className="text-[var(--theme-text-muted)] font-medium">Preferred Mode:</span>
                  <span className="font-semibold text-[var(--theme-text)]">Full-Time / Remote</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[var(--theme-border)]">
                  <span className="text-[var(--theme-text-muted)] font-medium">Target Region:</span>
                  <span className="font-semibold text-[var(--theme-text)]">{profile.location || "Flexible / Anywhere"}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[var(--theme-text-muted)] font-medium">Headline Role:</span>
                  <span className="font-semibold text-[var(--theme-text)] truncate max-w-[160px]">{profile.title || "Software Engineer"}</span>
                </div>
              </div>
            </div>

            {/* 4. Online Presence & Portfolios */}
            <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-[var(--theme-border)]">
                <h3 className="text-xs font-bold text-[var(--theme-text)] uppercase tracking-wider flex items-center gap-2">
                  <Globe size={14} className="text-[var(--theme-accent-silver)]" />
                  <span>Online Presence</span>
                </h3>
                <button
                  type="button"
                  onClick={() => openModal("links")}
                  className="text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus size={11} />
                  <span>Add Link</span>
                </button>
              </div>

              {profile.portfolioLinks?.length > 0 ? (
                <div className="space-y-2">
                  {profile.portfolioLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] transition-all group"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 min-w-0 flex-1"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-center shrink-0">
                          {getPlatformIcon(link.platform)}
                        </div>
                        <span className="text-xs font-semibold text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver)] transition-colors truncate">
                          {link.platform || "Link"}
                        </span>
                      </a>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openModal("links", link, idx)}
                          title="Edit link"
                          className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] rounded cursor-pointer transition-colors"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArrayItem("portfolioLinks", idx)}
                          title="Delete link"
                          className="p-1 text-[var(--theme-text-muted)] hover:text-rose-400 rounded cursor-pointer transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-xs text-[var(--theme-text-muted)] italic">No social links added yet</p>
                  <button
                    type="button"
                    onClick={() => openModal("links")}
                    className="mt-2 text-xs font-semibold text-[var(--theme-text)] hover:underline cursor-pointer"
                  >
                    + Add GitHub, LinkedIn, or Portfolio
                  </button>
                </div>
              )}
            </div>

            {/* 5. Account Privacy & Data Security Notice */}
            <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] space-y-2 text-[11px] text-[var(--theme-text-muted)] leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-[var(--theme-text)]">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>JobOne Data Security</span>
              </div>
              <p>
                Your candidate identity is encrypted. Contact details and documents are only shared with verified enterprise employers whose requisitions you apply to.
              </p>
              <div className="pt-2 border-t border-[var(--theme-border)] flex items-center justify-between text-[10px] font-mono text-[var(--theme-text-subtle)]">
                <span>SOC 2 Type II Certified</span>
                <span>GDPR Compliant</span>
              </div>
            </div>

          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 4. MODAL DIALOGS FOR IN-PAGE EDITING WORKFLOWS                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}

        {/* Modal: Summary Bio */}
        {activeModal === "summary" && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="summary-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          >
            <div className="fixed inset-0" onClick={() => setActiveModal(null)} aria-hidden="true" />
            <div className="relative bg-[var(--theme-surface)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--theme-border)] overflow-hidden z-10 animate-in zoom-in-95 duration-150 p-6">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)] mb-4">
                <h3 id="summary-modal-title" className="text-base font-bold text-[var(--theme-text)]">
                  Edit Executive Summary
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Professional Bio
                  </label>
                  <textarea
                    rows={6}
                    value={modalData.description || ""}
                    onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                    placeholder="Write a clear, high-impact summary highlighting your technical strengths and years of experience..."
                    className="w-full p-3 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:border-[var(--theme-border-silver)] outline-none resize-none transition-colors"
                  />
                  <p className="text-[11px] text-[var(--theme-text-subtle)] mt-1 text-right">
                    {(modalData.description || "").length} characters
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--theme-border)]">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    <span>Save Summary</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Experience */}
        {activeModal === "experience" && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exp-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          >
            <div className="fixed inset-0" onClick={() => setActiveModal(null)} aria-hidden="true" />
            <div className="relative bg-[var(--theme-surface)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--theme-border)] overflow-hidden z-10 animate-in zoom-in-95 duration-150 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)] mb-4">
                <h3 id="exp-modal-title" className="text-base font-bold text-[var(--theme-text)]">
                  {modalIndex >= 0 ? "Edit Experience Entry" : "Add Work Experience"}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalData.company || ""}
                    onChange={(e) => setModalData({ ...modalData, company: e.target.value })}
                    placeholder="e.g. Acme Corp / Stripe"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Role / Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalData.role || ""}
                    onChange={(e) => setModalData({ ...modalData, role: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Duration / Dates
                  </label>
                  <input
                    type="text"
                    value={modalData.duration || ""}
                    onChange={(e) => setModalData({ ...modalData, duration: e.target.value })}
                    placeholder="e.g. 2022 - Present / 2 yrs"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Key Achievements & Responsibilities
                  </label>
                  <textarea
                    rows={4}
                    value={modalData.description || ""}
                    onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                    placeholder="Describe your technical contributions, metrics, tools used, and business impact..."
                    className="w-full p-3 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] resize-none transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--theme-border)]">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    <span>Save Experience</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Education */}
        {activeModal === "education" && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edu-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          >
            <div className="fixed inset-0" onClick={() => setActiveModal(null)} aria-hidden="true" />
            <div className="relative bg-[var(--theme-surface)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--theme-border)] overflow-hidden z-10 animate-in zoom-in-95 duration-150 p-6">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)] mb-4">
                <h3 id="edu-modal-title" className="text-base font-bold text-[var(--theme-text)]">
                  {modalIndex >= 0 ? "Edit Education Entry" : "Add Education Credential"}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Degree / Qualification *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalData.degree || ""}
                    onChange={(e) => setModalData({ ...modalData, degree: e.target.value })}
                    placeholder="e.g. B.Tech Computer Science / B.Sc"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    University / College *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalData.university || ""}
                    onChange={(e) => setModalData({ ...modalData, university: e.target.value })}
                    placeholder="e.g. Stanford University / IIT Delhi"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                      Start Year
                    </label>
                    <input
                      type="text"
                      value={modalData.started || ""}
                      onChange={(e) => setModalData({ ...modalData, started: e.target.value })}
                      placeholder="e.g. 2018"
                      className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      value={modalData.ended || ""}
                      onChange={(e) => setModalData({ ...modalData, ended: e.target.value })}
                      placeholder="e.g. 2022"
                      className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Grade / GPA / Percentage
                  </label>
                  <input
                    type="text"
                    value={modalData.CGPA || ""}
                    onChange={(e) => setModalData({ ...modalData, CGPA: e.target.value })}
                    placeholder="e.g. 3.9 / 4.0 or 8.8 CGPA"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--theme-border)]">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    <span>Save Education</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Project */}
        {activeModal === "project" && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="proj-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          >
            <div className="fixed inset-0" onClick={() => setActiveModal(null)} aria-hidden="true" />
            <div className="relative bg-[var(--theme-surface)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--theme-border)] overflow-hidden z-10 animate-in zoom-in-95 duration-150 p-6">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)] mb-4">
                <h3 id="proj-modal-title" className="text-base font-bold text-[var(--theme-text)]">
                  {modalIndex >= 0 ? "Edit Project" : "Add Project Showcase"}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalData.title || ""}
                    onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                    placeholder="e.g. Distributed Cache Engine"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Tech Stack / Technologies
                  </label>
                  <input
                    type="text"
                    value={modalData.technologies || ""}
                    onChange={(e) => setModalData({ ...modalData, technologies: e.target.value })}
                    placeholder="e.g. Go, Redis, Docker, gRPC"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Live Demo / Repository URL
                  </label>
                  <input
                    type="url"
                    value={modalData.link || ""}
                    onChange={(e) => setModalData({ ...modalData, link: e.target.value })}
                    placeholder="https://github.com/username/project"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Description & Highlights
                  </label>
                  <textarea
                    rows={3}
                    value={modalData.description || ""}
                    onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                    placeholder="Describe the architectural problem solved and key results achieved..."
                    className="w-full p-3 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] resize-none transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--theme-border)]">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    <span>Save Project</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Certification */}
        {activeModal === "certification" && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cert-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          >
            <div className="fixed inset-0" onClick={() => setActiveModal(null)} aria-hidden="true" />
            <div className="relative bg-[var(--theme-surface)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--theme-border)] overflow-hidden z-10 animate-in zoom-in-95 duration-150 p-6">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)] mb-4">
                <h3 id="cert-modal-title" className="text-base font-bold text-[var(--theme-text)]">
                  {modalIndex >= 0 ? "Edit Certification" : "Add Certification"}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Certification Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalData.name || ""}
                    onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                    placeholder="e.g. AWS Solutions Architect Professional"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    value={modalData.issuer || ""}
                    onChange={(e) => setModalData({ ...modalData, issuer: e.target.value })}
                    placeholder="e.g. Amazon Web Services / Google"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Issue Year / Date
                  </label>
                  <input
                    type="text"
                    value={modalData.date || modalData.year || ""}
                    onChange={(e) => setModalData({ ...modalData, date: e.target.value, year: e.target.value })}
                    placeholder="e.g. 2024"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Credential Verification URL
                  </label>
                  <input
                    type="url"
                    value={modalData.link || ""}
                    onChange={(e) => setModalData({ ...modalData, link: e.target.value })}
                    placeholder="https://credly.com/badges/..."
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--theme-border)]">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    <span>Save Certification</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Career Preferences & Headline */}
        {activeModal === "preferences" && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pref-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          >
            <div className="fixed inset-0" onClick={() => setActiveModal(null)} aria-hidden="true" />
            <div className="relative bg-[var(--theme-surface)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--theme-border)] overflow-hidden z-10 animate-in zoom-in-95 duration-150 p-6">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)] mb-4">
                <h3 id="pref-modal-title" className="text-base font-bold text-[var(--theme-text)]">
                  Edit Profile Headline & Region
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Professional Headline / Title
                  </label>
                  <input
                    type="text"
                    value={modalData.title || ""}
                    onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                    placeholder="e.g. Senior Software Architect • Distributed Systems"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Location / Target City
                  </label>
                  <input
                    type="text"
                    value={modalData.location || ""}
                    onChange={(e) => setModalData({ ...modalData, location: e.target.value })}
                    placeholder="e.g. Bengaluru, India / Remote"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Gender Identity
                  </label>
                  <select
                    value={modalData.gender || ""}
                    onChange={(e) => setModalData({ ...modalData, gender: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors cursor-pointer"
                  >
                    <option value="" className="bg-[var(--theme-surface)]">Select Gender</option>
                    <option value="Male" className="bg-[var(--theme-surface)]">Male</option>
                    <option value="Female" className="bg-[var(--theme-surface)]">Female</option>
                    <option value="Other" className="bg-[var(--theme-surface)]">Other</option>
                    <option value="Prefer not to say" className="bg-[var(--theme-surface)]">Prefer not to say</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--theme-border)]">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    <span>Save Headline</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Portfolio Link */}
        {activeModal === "links" && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="links-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          >
            <div className="fixed inset-0" onClick={() => setActiveModal(null)} aria-hidden="true" />
            <div className="relative bg-[var(--theme-surface)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--theme-border)] overflow-hidden z-10 animate-in zoom-in-95 duration-150 p-6">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)] mb-4">
                <h3 id="links-modal-title" className="text-base font-bold text-[var(--theme-text)]">
                  {modalIndex >= 0 ? "Edit Portfolio Link" : "Add Portfolio / Social Link"}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Platform / Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalData.platform || ""}
                    onChange={(e) => setModalData({ ...modalData, platform: e.target.value })}
                    placeholder="e.g. GitHub, LinkedIn, Behance, Portfolio"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
                    Profile / Repository URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={modalData.url || ""}
                    onChange={(e) => setModalData({ ...modalData, url: e.target.value })}
                    placeholder="https://github.com/yourhandle"
                    className="w-full px-3 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl text-xs sm:text-sm text-[var(--theme-text)] outline-none focus:border-[var(--theme-border-silver)] transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--theme-border)]">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    <span>Save Link</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 5. RESUME PREVIEW MODAL                                             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
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
                  <div className="w-8 h-8 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] text-rose-400 flex items-center justify-center">
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
