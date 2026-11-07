import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  FileText,
  Briefcase,
  Plus,
  Trash2,
  Save,
  Loader2,
  ArrowLeft,
  GraduationCap,
  AlertTriangle,
  Upload,
  Sparkles,
  Code2,
  Award,
  Globe,
  ShieldCheck,
  Check,
  Camera,
  MapPin,
  Sliders,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  FileCode,
} from "lucide-react";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { API_BASE_URL } from "../config/api";
import CandidateLayout from "../components/candidate/CandidateLayout";
import { useTheme } from "../routes/Context";

export default function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("personal"); // personal | skills | experience | education | projects | certs | links | privacy
  const [statusMessage, setStatusMessage] = useState(null);
  const [genderError, setGenderError] = useState(false);

  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    description: "",
    profilePicture: "",
    resumeFileKey: "",
    location: "",
    title: "",
    isPublic: true,
  });

  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [portfolioLinks, setPortfolioLinks] = useState([]);
  const [volunteering, setVolunteering] = useState([]);

  const [newSkill, setNewSkill] = useState("");

  const [expForm, setExpForm] = useState({
    company: "",
    role: "",
    duration: "",
    description: "",
  });
  const [eduForm, setEduForm] = useState({
    degree: "",
    university: "",
    started: "",
    ended: "",
    CGPA: "",
  });
  const [projForm, setProjForm] = useState({
    title: "",
    technologies: "",
    link: "",
    description: "",
  });
  const [certForm, setCertForm] = useState({
    name: "",
    issuer: "",
    year: "",
    link: "",
  });
  const [linkForm, setLinkForm] = useState({ platform: "LinkedIn", url: "" });
  const [volForm, setVolForm] = useState({
    organization: "",
    role: "",
    duration: "",
    description: "",
  });

  const showNotification = (msg, type = "success") => {
    setStatusMessage({ msg, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const storedString = localStorage.getItem("userInfo");
        if (!storedString) return navigate("/login");
        const storedUser = JSON.parse(storedString);
        const userId = storedUser.id || storedUser.userId;

        if (!storedUser.token || !userId) return navigate("/login");

        const { data } = await axios.get(
          `${API_BASE_URL}/user/${userId}`,
          { headers: { Authorization: `Bearer ${storedUser.token}` } }
        );

        const safeList = (val) => (Array.isArray(val) ? val : []);

        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          gender: data.gender || "",
          description: data.description || data.resumeData?.description || "",
          profilePicture: data.profilePicture || "",
          resumeFileKey: data.resumeFileKey || "",
          location: data.location || "",
          title: data.title || "",
          isPublic: data.isPublic !== false,
        });

        setSkills(safeList(data.skills?.length ? data.skills : data.resumeData?.skills));
        setExperience(safeList(data.experience?.length ? data.experience : data.resumeData?.experience));
        setEducation(safeList(data.education?.length ? data.education : data.resumeData?.education));
        setProjects(safeList(data.projects?.length ? data.projects : data.resumeData?.projects));
        setCertifications(safeList(data.certifications?.length ? data.certifications : data.resumeData?.certifications));
        setPortfolioLinks(safeList(data.portfolioLinks));
        setVolunteering(safeList(data.volunteering?.length ? data.volunteering : data.resumeData?.volunteering));
      } catch (error) {
        console.error("Error loading candidate profile:", error);
        showNotification("Failed to load existing profile records.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, location]);

  // AI Resume Parser Integration
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!validTypes.includes(file.type)) {
      showNotification("Please upload a PDF, DOC, or DOCX resume.", "error");
      return;
    }

    setIsParsing(true);
    const storedData = JSON.parse(localStorage.getItem("userInfo"));
    const userId = storedData.id || storedData.userId;

    try {
      showNotification("Uploading resume to secure vault...", "info");
      const { data: s3Data } = await axios.post(
        `${API_BASE_URL}/user/${userId}/resume/upload-url`,
        { fileType: file.type },
        { headers: { Authorization: `Bearer ${storedData.token}` } }
      );

      if (window.__TAURI__) {
        const arrayBuffer = await file.arrayBuffer();
        await tauriFetch(s3Data.uploadUrl, {
          method: "PUT",
          body: new Uint8Array(arrayBuffer),
          headers: { "Content-Type": file.type },
        });
      } else {
        await fetch(s3Data.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
      }

      await axios.post(
        `${API_BASE_URL}/user/${userId}/resume/save-key`,
        { key: s3Data.key },
        { headers: { Authorization: `Bearer ${storedData.token}` } }
      );
      setProfile((prev) => ({ ...prev, resumeFileKey: s3Data.key }));

      showNotification("AI is parsing your credentials...", "info");
      let parsedData;
      if (window.__TAURI__) {
        const res = await axios.post(
          `${API_BASE_URL}/ai/parse-resume`,
          { key: s3Data.key },
          { headers: { Authorization: `Bearer ${storedData.token}` } }
        );
        parsedData = res.data;
      } else {
        const formData = new FormData();
        formData.append("resume", file);
        const res = await axios.post(
          `${API_BASE_URL}/ai/parse-resume`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${storedData.token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        parsedData = res.data;
      }

      if (parsedData.name) setProfile((p) => ({ ...p, name: parsedData.name }));
      if (parsedData.phone) setProfile((p) => ({ ...p, phone: parsedData.phone }));
      if (parsedData.description) setProfile((p) => ({ ...p, description: parsedData.description }));
      if (parsedData.skills) setSkills((p) => Array.from(new Set([...p, ...parsedData.skills])));
      if (parsedData.experience) setExperience(parsedData.experience);
      if (parsedData.education) setEducation(parsedData.education);
      if (parsedData.projects) setProjects(parsedData.projects);
      if (parsedData.certifications) setCertifications(parsedData.certifications);
      if (parsedData.volunteering) setVolunteering(parsedData.volunteering);

      showNotification("Resume parsed successfully! Review auto-filled details below.", "success");
    } catch (error) {
      console.error("Upload/Parsing failed:", error);
      showNotification("AI parsing was unable to read this file. Please fill fields manually.", "error");
    } finally {
      setIsParsing(false);
      e.target.value = null;
    }
  };

  // S3 Profile Picture Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification("Please select a valid image file (JPG, PNG, WebP).", "error");
      return;
    }

    setUploadingImage(true);
    try {
      const storedString = localStorage.getItem("userInfo");
      if (!storedString) throw new Error("Not logged in");
      const { token, id, userId } = JSON.parse(storedString);
      const uid = id || userId;

      const { data } = await axios.post(
        `${API_BASE_URL}/user/${uid}/profile-picture/upload-url`,
        { fileType: file.type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (window.__TAURI__) {
        const arrayBuffer = await file.arrayBuffer();
        await tauriFetch(data.uploadUrl, {
          method: "PUT",
          body: new Uint8Array(arrayBuffer),
          headers: { "Content-Type": file.type },
        });
      } else {
        await axios.put(data.uploadUrl, file, {
          headers: { "Content-Type": file.type },
        });
      }

      setProfile((prev) => ({ ...prev, profilePicture: data.publicUrl }));
      showNotification("Profile avatar updated!", "success");
    } catch (error) {
      console.error("Image upload failed:", error);
      showNotification("Failed to upload image. Please try again.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    if (e.target.name === "gender" && e.target.value.trim() !== "") {
      setGenderError(false);
    }
  };

  // Skill Handlers
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Section Add Handlers
  const handleAddExperience = () => {
    if (expForm.company && expForm.role) {
      setExperience([...experience, expForm]);
      setExpForm({ company: "", role: "", duration: "", description: "" });
    } else {
      showNotification("Company name and Role are required.", "error");
    }
  };

  const handleAddEducation = () => {
    if (eduForm.degree && eduForm.university) {
      setEducation([...education, eduForm]);
      setEduForm({ degree: "", university: "", started: "", ended: "", CGPA: "" });
    } else {
      showNotification("Degree title and University are required.", "error");
    }
  };

  const handleAddProject = () => {
    if (projForm.title) {
      setProjects([...projects, projForm]);
      setProjForm({ title: "", technologies: "", link: "", description: "" });
    } else {
      showNotification("Project title is required.", "error");
    }
  };

  const handleAddCert = () => {
    if (certForm.name) {
      setCertifications([...certifications, certForm]);
      setCertForm({ name: "", issuer: "", year: "", link: "" });
    } else {
      showNotification("Certification name is required.", "error");
    }
  };

  const handleAddLink = () => {
    if (linkForm.platform && linkForm.url) {
      setPortfolioLinks([...portfolioLinks, linkForm]);
      setLinkForm({ platform: "LinkedIn", url: "" });
    } else {
      showNotification("Platform and valid URL are required.", "error");
    }
  };

  const handleAddVol = () => {
    if (volForm.organization && volForm.role) {
      setVolunteering([...volunteering, volForm]);
      setVolForm({ organization: "", role: "", duration: "", description: "" });
    } else {
      showNotification("Organization and Role required.", "error");
    }
  };

  // Theme Switching Handler adhering to RULE[user_global]
  const handleThemeChange = (mode) => {
    setTheme(mode);
    showNotification(`Theme set to ${mode.charAt(0).toUpperCase() + mode.slice(1)}.`);
  };

  // Main Save Submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!profile.gender || profile.gender.trim() === "") {
      setGenderError(true);
      setActiveTab("personal");
      showNotification("Gender is required for demographic matching.", "error");
      return;
    }

    setSaving(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("userInfo"));
      const userId = storedUser.id || storedUser.userId;

      const payload = {
        ...profile,
        skills,
        experience,
        education,
        projects,
        certifications,
        portfolioLinks,
        volunteering,
      };

      const { data } = await axios.patch(
        `${API_BASE_URL}/user/${userId}`,
        payload,
        { headers: { Authorization: `Bearer ${storedUser.token}` } }
      );

      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...storedUser, ...data, isProfileComplete: true })
      );

      showNotification("Dossier updated successfully!", "success");
      setTimeout(() => navigate("/profile"), 800);
    } catch (error) {
      console.error("Update failed:", error);
      showNotification("Failed to save changes. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Contact & Bio", icon: User },
    { id: "skills", label: "Skills Matrix", icon: Award },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "projects", label: "Projects", icon: Code2 },
    { id: "certs", label: "Certifications", icon: FileText },
    { id: "links", label: "Portfolios", icon: Globe },
    { id: "privacy", label: "Settings & Privacy", icon: Sliders },
  ];

  // Reusable Form Input Classes
  const inputClass =
    "w-full rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder:[var(--theme-input-placeholder)] focus:outline-none focus:border-[var(--theme-border-silver)] focus:ring-1 focus:ring-[var(--theme-border-silver)] py-2.5 px-3.5 text-xs sm:text-sm transition-all";
  const labelClass = "block text-xs font-semibold text-[var(--theme-text)] mb-1.5";

  if (loading) {
    return (
      <CandidateLayout
        activeTab="settings"
        title="Profile & Account Settings"
        breadcrumbs={[{ label: "Profile", path: "/profile" }, { label: "Settings" }]}
      >
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center shadow-xs">
            <Loader2 className="animate-spin text-[var(--theme-accent-silver)]" size={28} />
          </div>
          <span className="text-xs text-[var(--theme-text-muted)] font-mono">Loading profile editor...</span>
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout
      activeTab="settings"
      title="Profile & Account Settings"
      breadcrumbs={[{ label: "Profile", path: "/profile" }, { label: "Settings" }]}
    >
      <div className="pb-16 selection:bg-[var(--theme-text)] selection:text-[var(--theme-bg)] max-w-5xl mx-auto">
        {/* Status Notification Toast */}
        {statusMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs sm:text-sm font-bold border transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 ${
              statusMessage.type === "error"
                ? "bg-rose-950 text-rose-100 border-rose-800"
                : "bg-[var(--theme-text)] text-[var(--theme-bg)] border-[var(--theme-border)]"
            }`}
          >
            {statusMessage.type === "error" ? (
              <AlertTriangle size={18} className="text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            )}
            <span>{statusMessage.msg}</span>
          </div>
        )}

        {/* ─── AI RESUME AUTO-FILL BANNER ─────────────────────────────────── */}
        <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden shadow-xs">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-accent-silver)] flex items-center justify-center shrink-0">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--theme-text)] flex items-center gap-2">
                <span>AI Resume Auto-Extract</span>
                <span className="px-2 py-0.5 rounded-md bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[10px] font-mono text-[var(--theme-accent-silver)]">
                  Gemini Flash
                </span>
              </h2>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5 max-w-xl">
                Upload your latest resume to automatically parse work history, education, skills, and projects into your dossier in seconds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
            <label
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                isParsing
                  ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] border border-[var(--theme-border)] cursor-not-allowed"
                  : "bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] hover:opacity-90 shadow-xs"
              }`}
            >
              {isParsing ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Parsing Document...</span>
                </>
              ) : (
                <>
                  <Upload size={15} />
                  <span>Upload & Auto-Fill</span>
                </>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={isParsing}
                className="hidden"
              />
            </label>

            <Link
              to="/resume-builder"
              className="px-4 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] border border-[var(--theme-border)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileCode size={15} />
              <span className="hidden sm:inline">ATS Builder</span>
            </Link>
          </div>
        </div>

        {/* ─── TAB NAVIGATION BAR ────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-6 scrollbar-none border-b border-[var(--theme-border)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[var(--theme-surface-elevated)] text-[var(--theme-text)] border border-[var(--theme-border-silver)] shadow-xs"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] border border-transparent"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── TAB CONTENT PANELS ───────────────────────────────────────── */}
        <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] p-5 sm:p-7 space-y-6 shadow-xs">
          
          {/* TAB 1: CONTACT & BIO */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[var(--theme-text)]">Basic Identity & Contact</h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Manage the core credentials visible to recruiters and hiring managers.
                </p>
              </div>

              {/* Avatar Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)]">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] flex items-center justify-center">
                    {profile.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={30} className="text-[var(--theme-text-muted)]" />
                    )}
                  </div>
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                      <Loader2 size={20} className="animate-spin text-white" />
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-[var(--theme-text)] text-[var(--theme-bg)] cursor-pointer shadow-md hover:opacity-90 transition-opacity"
                    title="Change profile avatar"
                  >
                    <Camera size={13} />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-[var(--theme-text)]">Profile Photo</h4>
                  <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                    Recommended: 400x400 JPG, PNG or WebP. Stored in high-resolution cloud storage.
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Full Legal Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="Adarsh Sharma"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Verified Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="adarsh@jobone.com"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="+91 98765 43210"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Gender Identity <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleProfileChange}
                    className={`${inputClass} ${genderError ? "border-red-500/80 focus:border-red-500" : ""}`}
                    required
                  >
                    <option value="">Select Gender Identity</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Non-Binary / Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {genderError && (
                    <p className="text-[11px] text-red-400 mt-1 font-medium">
                      Please select a gender option.
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={profile.title}
                    onChange={handleProfileChange}
                    placeholder="Full Stack Engineer • React & Node.js"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Target Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleProfileChange}
                    placeholder="Bengaluru, Karnataka / Remote"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Bio / Summary */}
              <div>
                <label className={labelClass}>
                  Executive Summary / Bio
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={profile.description}
                  onChange={handleProfileChange}
                  placeholder="Summarize your professional background, top technical strengths, leadership experience, and target roles..."
                  className={`${inputClass} resize-y min-h-[100px] leading-relaxed`}
                />
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS MATRIX */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[var(--theme-text)]">Technical & Domain Skills</h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Skills are matched directly against ATS algorithms and recruiter searches.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Add skill (e.g., React, TypeScript, GraphQL, Docker)..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-semibold text-xs flex items-center gap-1.5 shrink-0 hover:opacity-90 transition-opacity shadow-xs"
                >
                  <Plus size={15} />
                  <span>Add</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[var(--theme-surface-elevated)]/30 border border-[var(--theme-border)]">
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-medium text-[var(--theme-text)] group"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          className="text-[var(--theme-text-muted)] hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--theme-text-muted)] italic text-center py-4">
                    No skills added yet. Type a skill above and press Add.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[var(--theme-text)]">Work Experience</h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Record past positions, internships, and key career achievements.
                </p>
              </div>

              {/* Add Experience Form */}
              <div className="p-5 rounded-xl bg-[var(--theme-surface-elevated)]/30 border border-[var(--theme-border)] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-accent-silver)]">
                  + Add Experience Entry
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={labelClass}>Company Name *</label>
                    <input
                      type="text"
                      value={expForm.company}
                      onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                      placeholder="e.g. Google, Microsoft, Startup"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Role Title *</label>
                    <input
                      type="text"
                      value={expForm.role}
                      onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                      placeholder="e.g. Senior Frontend Architect"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Duration / Dates</label>
                    <input
                      type="text"
                      value={expForm.duration}
                      onChange={(e) => setExpForm({ ...expForm, duration: e.target.value })}
                      placeholder="e.g. Jan 2022 – Present"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Key Responsibilities & Impact</label>
                    <textarea
                      rows={3}
                      value={expForm.description}
                      onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                      placeholder="Led frontend performance migration reducing bundle size by 40%..."
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-4 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-xs transition-opacity"
                >
                  <Plus size={14} />
                  <span>Add Role to List</span>
                </button>
              </div>

              {/* Existing List */}
              <div className="space-y-3">
                {experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[var(--theme-surface-elevated)]/50 border border-[var(--theme-border)] flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-[var(--theme-text)]">{exp.role}</h4>
                      <p className="text-xs text-[var(--theme-text-muted)] font-medium">
                        {exp.company} {exp.duration ? `• ${exp.duration}` : ""}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-[var(--theme-text-muted)] mt-1.5 leading-relaxed whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                      className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EDUCATION */}
          {activeTab === "education" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[var(--theme-text)]">Education & Academics</h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  List university degrees, diplomas, and relevant coursework.
                </p>
              </div>

              {/* Add Education Form */}
              <div className="p-5 rounded-xl bg-[var(--theme-surface-elevated)]/30 border border-[var(--theme-border)] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-accent-silver)]">
                  + Add Academic Degree
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={labelClass}>Degree / Course Title *</label>
                    <input
                      type="text"
                      value={eduForm.degree}
                      onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                      placeholder="e.g. B.Tech Computer Science"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>University / College *</label>
                    <input
                      type="text"
                      value={eduForm.university}
                      onChange={(e) => setEduForm({ ...eduForm, university: e.target.value })}
                      placeholder="e.g. Indian Institute of Technology"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Start Year</label>
                    <input
                      type="text"
                      value={eduForm.started}
                      onChange={(e) => setEduForm({ ...eduForm, started: e.target.value })}
                      placeholder="e.g. 2018"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End / Graduation Year</label>
                    <input
                      type="text"
                      value={eduForm.ended}
                      onChange={(e) => setEduForm({ ...eduForm, ended: e.target.value })}
                      placeholder="e.g. 2022"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>CGPA / Grade Percentage</label>
                    <input
                      type="text"
                      value={eduForm.CGPA}
                      onChange={(e) => setEduForm({ ...eduForm, CGPA: e.target.value })}
                      placeholder="e.g. 8.75 / 10.0"
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="px-4 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-xs transition-opacity"
                >
                  <Plus size={14} />
                  <span>Add Degree to List</span>
                </button>
              </div>

              {/* Existing List */}
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[var(--theme-surface-elevated)]/50 border border-[var(--theme-border)] flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-[var(--theme-text)]">{edu.degree}</h4>
                      <p className="text-xs text-[var(--theme-text-muted)] font-medium">
                        {edu.university} {edu.started || edu.ended ? `(${edu.started} – ${edu.ended})` : ""}
                      </p>
                      {edu.CGPA && (
                        <p className="text-xs font-mono text-[var(--theme-accent-silver)] mt-1">
                          Grade: {edu.CGPA}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                      className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[var(--theme-text)]">Showcase Projects</h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Highlight live products, open-source repos, or portfolio prototypes.
                </p>
              </div>

              {/* Add Project Form */}
              <div className="p-5 rounded-xl bg-[var(--theme-surface-elevated)]/30 border border-[var(--theme-border)] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-accent-silver)]">
                  + Add Project Showcase
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={labelClass}>Project Title *</label>
                    <input
                      type="text"
                      value={projForm.title}
                      onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                      placeholder="e.g. AI-Powered ATS Pipeline"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Technologies Used</label>
                    <input
                      type="text"
                      value={projForm.technologies}
                      onChange={(e) => setProjForm({ ...projForm, technologies: e.target.value })}
                      placeholder="e.g. React, Node.js, AWS S3, Tailwind"
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Live URL or GitHub Link</label>
                    <input
                      type="url"
                      value={projForm.link}
                      onChange={(e) => setProjForm({ ...projForm, link: e.target.value })}
                      placeholder="https://github.com/..."
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Project Description</label>
                    <textarea
                      rows={3}
                      value={projForm.description}
                      onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                      placeholder="Built real-time resume parsing engine with 99% accuracy..."
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-4 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-xs transition-opacity"
                >
                  <Plus size={14} />
                  <span>Add Project</span>
                </button>
              </div>

              {/* Existing List */}
              <div className="space-y-3">
                {projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[var(--theme-surface-elevated)]/50 border border-[var(--theme-border)] flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-[var(--theme-text)]">{proj.title}</h4>
                      {proj.technologies && (
                        <p className="text-xs font-mono text-[var(--theme-accent-silver)] mt-0.5">
                          {proj.technologies}
                        </p>
                      )}
                      {proj.description && (
                        <p className="text-xs text-[var(--theme-text-muted)] mt-1.5 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:underline mt-2 inline-block truncate max-w-sm"
                        >
                          {proj.link}
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                      className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATIONS */}
          {activeTab === "certs" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[var(--theme-text)]">Certifications & Accreditations</h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Industry certifications, professional licenses, and course completions.
                </p>
              </div>

              {/* Add Cert Form */}
              <div className="p-5 rounded-xl bg-[var(--theme-surface-elevated)]/30 border border-[var(--theme-border)] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-accent-silver)]">
                  + Add Certification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={labelClass}>Certification Title *</label>
                    <input
                      type="text"
                      value={certForm.name}
                      onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                      placeholder="e.g. AWS Solutions Architect"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Issuing Organization</label>
                    <input
                      type="text"
                      value={certForm.issuer}
                      onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                      placeholder="e.g. Amazon Web Services"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Issue Year</label>
                    <input
                      type="text"
                      value={certForm.year}
                      onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                      placeholder="e.g. 2024"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Verification URL</label>
                    <input
                      type="url"
                      value={certForm.link}
                      onChange={(e) => setCertForm({ ...certForm, link: e.target.value })}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCert}
                  className="px-4 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-xs transition-opacity"
                >
                  <Plus size={14} />
                  <span>Add Certification</span>
                </button>
              </div>

              {/* Existing List */}
              <div className="space-y-3">
                {certifications.map((cert, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[var(--theme-surface-elevated)]/50 border border-[var(--theme-border)] flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-[var(--theme-text)]">{cert.name}</h4>
                      <p className="text-xs text-[var(--theme-text-muted)] font-medium">
                        {cert.issuer} {cert.year ? `• ${cert.year}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                      className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Volunteering & Community Initiatives */}
              <div className="pt-6 border-t border-[var(--theme-border)] space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-[var(--theme-text)]">Volunteering & Community Initiatives</h4>
                  <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                    Showcase non-profit mentorship, open-source maintainership, or community leadership.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">
                        Organization
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Humanitarian Org, Tech Meetup"
                        value={volForm.organization}
                        onChange={(e) => setVolForm({ ...volForm, organization: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] focus:border-[var(--theme-border-silver)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">
                        Role / Responsibility
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lead Mentor, Workshop Host"
                        value={volForm.role}
                        onChange={(e) => setVolForm({ ...volForm, role: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-xs text-[var(--theme-text)] focus:border-[var(--theme-border-silver)] focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVol}
                    className="px-4 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Volunteering</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {volunteering.map((vol, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[var(--theme-surface-elevated)]/50 border border-[var(--theme-border)] flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-[var(--theme-text)]">{vol.role}</h4>
                        <p className="text-xs text-[var(--theme-text-muted)] font-medium">
                          {vol.organization}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVolunteering(volunteering.filter((_, i) => i !== idx))}
                        className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PORTFOLIOS */}
          {activeTab === "links" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[var(--theme-text)]">Online Portfolios & Profiles</h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Link your professional social presence so recruiters can view code samples and work.
                </p>
              </div>

              {/* Add Link Form */}
              <div className="p-5 rounded-xl bg-[var(--theme-surface-elevated)]/30 border border-[var(--theme-border)] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-accent-silver)]">
                  + Add Portfolio / Social Link
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={labelClass}>Platform *</label>
                    <select
                      value={linkForm.platform}
                      onChange={(e) => setLinkForm({ ...linkForm, platform: e.target.value })}
                      className={inputClass}
                    >
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="GitHub">GitHub</option>
                      <option value="Twitter">Twitter / X</option>
                      <option value="Dribbble">Dribbble</option>
                      <option value="Behance">Behance</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Personal Website">Personal Website</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Profile URL *</label>
                    <input
                      type="url"
                      value={linkForm.url}
                      onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-4 py-2 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-xs transition-opacity"
                >
                  <Plus size={14} />
                  <span>Add Link</span>
                </button>
              </div>

              {/* Existing List */}
              <div className="space-y-3">
                {portfolioLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[var(--theme-surface-elevated)]/50 border border-[var(--theme-border)] flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-[var(--theme-text)]">{link.platform}</h4>
                      <p className="text-xs text-[var(--theme-text-muted)] font-mono truncate">{link.url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPortfolioLinks(portfolioLinks.filter((_, i) => i !== idx))}
                      className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: PRIVACY & SYSTEM SETTINGS */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[var(--theme-text)]">Account, Theme & Privacy Settings</h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Configure recruiter visibility, platform appearance, and security credentials.
                </p>
              </div>

              {/* Theme Preference per RULE[user_global] */}
              <div className="p-5 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text)]">
                  Appearance Theme
                </h4>
                <p className="text-xs text-[var(--theme-text-muted)]">
                  Choose between Dark (#050505), Light (#F8F9FA), or System Default mode.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { id: "dark", label: "Dark Theme", icon: Moon, desc: "#050505 Monochromatic" },
                    { id: "light", label: "Light Theme", icon: Sun, desc: "#F8F9FA Clean" },
                    { id: "default", label: "System Default", icon: Laptop, desc: "OS Sync" },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleThemeChange(t.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[var(--theme-surface)] border-[var(--theme-border-silver)] shadow-xs ring-1 ring-[var(--theme-border-silver)]"
                            : "bg-[var(--theme-surface)]/50 border-[var(--theme-border)] hover:border-[var(--theme-border-silver)]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon size={16} className={isSelected ? "text-[var(--theme-text)]" : "text-[var(--theme-text-muted)]"} />
                          {isSelected && <Check size={14} className="text-emerald-400" />}
                        </div>
                        <p className="text-xs font-bold text-[var(--theme-text)]">{t.label}</p>
                        <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">{t.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recruiter Visibility */}
              <div className="p-5 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[var(--theme-text)]">Recruiter Visibility</h4>
                  <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                    Allow verified recruiters and company hiring partners to find your dossier in talent searches.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={profile.isPublic}
                    onChange={(e) => setProfile({ ...profile, isPublic: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--theme-surface-elevated)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-text)] border border-[var(--theme-border)]"></div>
                </label>
              </div>

              {/* Account Security Verification Status */}
              <div className="p-5 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={22} className="text-[var(--theme-accent-silver)] shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-[var(--theme-text)]">Account Verification</h4>
                    <p className="text-xs text-[var(--theme-text-muted)]">
                      Your identity and verified email status is protected by JobOne encryption.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold shrink-0">
                  Protected
                </span>
              </div>
            </div>
          )}

        </div>

        {/* ─── STICKY BOTTOM SAVE BAR (Padded and strictly within workspace canvas) ──── */}
        <div className="sticky bottom-0 z-30 bg-[var(--theme-surface)]/95 backdrop-blur-md border border-[var(--theme-border)] rounded-2xl p-4 shadow-2xl mt-8">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="px-4 py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] border border-[var(--theme-border)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Cancel</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--theme-text-muted)] hidden sm:inline">
                Changes will sync across all applications
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-[var(--theme-primary-btn-bg)] text-[var(--theme-primary-btn-text)] text-xs sm:text-sm font-bold flex items-center gap-2 hover:opacity-90 shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Save Profile Dossier</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </CandidateLayout>
  );
}
