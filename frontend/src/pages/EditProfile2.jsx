import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Plus,
  Trash2,
  Save,
  Loader2,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Upload,
  MapPin,
  Check,
  FileCode,
  Layers,
} from "lucide-react";
import CandidateLayout from "../components/candidate/CandidateLayout";

export default function EditProfile2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    location: "",
    title: "",
    description: "",
    profilePicture: "",
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [genderError, setGenderError] = useState(false);

  const showNotification = (msg, type = "success") => {
    setStatusMessage({ msg, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  useEffect(() => {
    if (location.state?.showWarning) {
      setShowWarningModal(true);
    }

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

        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          gender: data.gender || "",
          location: data.location || "",
          title: data.title || "",
          description: data.description || "",
          profilePicture: data.profilePicture || "",
        });

        const safeList = (val) => (Array.isArray(val) ? val : []);
        setSkills(safeList(data.skills));
      } catch (error) {
        console.error("Error loading profile for onboarding:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, location]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    if (e.target.name === "gender" && e.target.value.trim() !== "") {
      setGenderError(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (s) => {
    setSkills(skills.filter((item) => item !== s));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!profile.gender || profile.gender.trim() === "") {
        setGenderError(true);
        showNotification("Please select a gender before proceeding.", "error");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleFinishOnboarding = async () => {
    if (!profile.gender || profile.gender.trim() === "") {
      setGenderError(true);
      setCurrentStep(1);
      showNotification("Gender is required by hiring partners.", "error");
      return;
    }

    setSaving(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("userInfo"));
      const userId = storedUser.id || storedUser.userId;

      const payload = {
        ...profile,
        skills,
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

      showNotification("Profile completed! Welcome to JobOne.", "success");
      setTimeout(() => navigate("/userdashboard"), 800);
    } catch (err) {
      console.error("Onboarding failed:", err);
      showNotification("Failed to save changes. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <CandidateLayout
        activeTab="settings"
        title="Candidate Onboarding"
        breadcrumbs={[{ label: "Career Workspace", path: "/userdashboard" }, { label: "Onboarding" }]}
      >
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center">
            <Loader2 className="animate-spin text-[var(--theme-text)]" size={24} />
          </div>
          <span className="text-xs text-[var(--theme-text-muted)]">Initializing career onboarding...</span>
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout
      activeTab="settings"
      title="Candidate Onboarding"
      breadcrumbs={[{ label: "Career Workspace", path: "/userdashboard" }, { label: "Guided Onboarding" }]}
    >
      <div className="pb-20 max-w-3xl mx-auto selection:bg-[var(--theme-text)] selection:text-[var(--theme-bg)]">
        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs sm:text-sm font-bold border transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 ${
              statusMessage.type === "error"
                ? "bg-rose-950 text-rose-100 border-rose-800"
                : "bg-[var(--theme-text)] text-[var(--theme-bg)] border-[var(--theme-border)]"
            }`}
          >
            {statusMessage.type === "error" ? (
              <AlertTriangle size={16} className="text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            )}
            <span>{statusMessage.msg}</span>
          </div>
        )}

        {/* Warning Modal if user had missing profile fields */}
        {showWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--theme-surface)] rounded-3xl p-6 sm:p-7 max-w-md w-full border border-[var(--theme-border)] shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text)]">
                <AlertTriangle size={24} className="text-[var(--theme-accent-silver)]" />
              </div>
              <h3 className="text-lg font-black text-[var(--theme-text)]">Complete Your Candidate Profile</h3>
              <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                Before applying for verified positions, employers require verified identity details, gender demographic information, and your core technical skills.
              </p>
              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                className="w-full py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
              >
                Let&apos;s Complete My Profile
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP PROGRESS INDICATOR ──────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-[var(--theme-text)]">
            <span className="uppercase tracking-wider text-[11px] text-[var(--theme-text-muted)]">
              Step {currentStep} of 3
            </span>
            <span>
              {currentStep === 1 && "Identity & Role"}
              {currentStep === 2 && "Core Skill Stack"}
              {currentStep === 3 && "Review & Launch"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep >= step ? "bg-[var(--theme-text)]" : "bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ─── ONBOARDING CARD CONTAINER ─────────────────────────────────── */}
        <div className="bg-[var(--theme-surface)] rounded-3xl border border-[var(--theme-border)] p-6 sm:p-8 shadow-sm">
          
          {/* STEP 1: IDENTITY */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-black text-[var(--theme-text)]">Personal Details & Role</h2>
                <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                  Ensure your contact credentials and current professional standing are accurate.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="e.g. Adarsh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs sm:text-sm focus:outline-none focus:border-[var(--theme-border-silver)]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        placeholder="+91 9876543210"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs sm:text-sm focus:outline-none focus:border-[var(--theme-border-silver)] pl-9"
                      />
                      <Phone size={14} className="absolute left-3 top-3 text-[var(--theme-text-muted)]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={handleProfileChange}
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border text-xs sm:text-sm focus:outline-none ${
                        genderError
                          ? "border-rose-500 text-rose-500 ring-1 ring-rose-500"
                          : "border-[var(--theme-border)] text-[var(--theme-text)] focus:border-[var(--theme-border-silver)]"
                      }`}
                    >
                      <option value="">Select Gender (Required)</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Non-binary / Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    {genderError && (
                      <p className="text-[10px] text-rose-500 font-semibold mt-1">
                        Gender is strictly required for candidate matching.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                      Target Role / Headline
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={profile.title}
                      onChange={handleProfileChange}
                      placeholder="e.g. Frontend Engineer"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs sm:text-sm focus:outline-none focus:border-[var(--theme-border-silver)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                      Location / Preferred City
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="location"
                        value={profile.location}
                        onChange={handleProfileChange}
                        placeholder="e.g. Bengaluru / Remote"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs sm:text-sm focus:outline-none focus:border-[var(--theme-border-silver)] pl-9"
                      />
                      <MapPin size={14} className="absolute left-3 top-3 text-[var(--theme-text-muted)]" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                    Brief Bio / Executive Summary
                  </label>
                  <textarea
                    rows={3}
                    name="description"
                    value={profile.description}
                    onChange={handleProfileChange}
                    placeholder="Tell employers what drives your career and your core achievements..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs sm:text-sm focus:outline-none focus:border-[var(--theme-border-silver)] resize-y leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CORE SKILLS */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-black text-[var(--theme-text)]">Technical & Core Skills</h2>
                <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                  Tag 3 or more skills so our recommendation engine matches you with relevant positions.
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
                  placeholder="Type a skill and press Enter (e.g. React, Node.js, Python)..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs sm:text-sm focus:outline-none focus:border-[var(--theme-border-silver)]"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Suggestions */}
              <div>
                <p className="text-[11px] font-bold text-[var(--theme-text-muted)] mb-2 uppercase tracking-wider">
                  Popular Suggestions:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["React", "Node.js", "TypeScript", "Python", "SQL", "TailwindCSS", "AWS", "Docker", "REST APIs"].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (!skills.includes(tag)) setSkills([...skills, tag]);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-medium text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:border-[var(--theme-border-silver)] transition-colors cursor-pointer"
                      >
                        + {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] min-h-[100px]">
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-xs font-bold text-[var(--theme-text)] shadow-2xs"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          className="p-0.5 rounded-md hover:bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--theme-text-muted)] text-center py-5 italic">
                    No skills added yet. Add at least 3 skills to stand out.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & LAUNCH */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={28} className="text-[var(--theme-accent-silver)]" />
                </div>
                <h2 className="text-xl font-black text-[var(--theme-text)]">You&apos;re All Set!</h2>
                <p className="text-xs text-[var(--theme-text-muted)] mt-1 max-w-md mx-auto">
                  Your baseline candidate dossier is configured. You can edit full work history, education, and credentials at any time in Profile Settings.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[var(--theme-border)]">
                  <span className="text-[var(--theme-text-muted)] font-medium">Candidate Name:</span>
                  <span className="font-bold text-[var(--theme-text)]">{profile.name || "—"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--theme-border)]">
                  <span className="text-[var(--theme-text-muted)] font-medium">Phone Number:</span>
                  <span className="font-bold text-[var(--theme-text)]">{profile.phone || "—"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--theme-border)]">
                  <span className="text-[var(--theme-text-muted)] font-medium">Gender:</span>
                  <span className="font-bold text-[var(--theme-text)]">{profile.gender || "—"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--theme-border)]">
                  <span className="text-[var(--theme-text-muted)] font-medium">Headline:</span>
                  <span className="font-bold text-[var(--theme-text)]">{profile.title || "—"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[var(--theme-text-muted)] font-medium">Core Skills:</span>
                  <span className="font-bold text-[var(--theme-text)]">{skills.length} skills listed</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[var(--theme-text)]">Next Step: Build ATS Resume</h4>
                  <p className="text-[11px] text-[var(--theme-text-muted)]">
                    Generate an ATS-tested PDF resume with our new Split Editor.
                  </p>
                </div>
                <Link
                  to="/resume-builder"
                  className="px-3 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] text-[var(--theme-text)] border border-[var(--theme-border)] text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FileCode size={13} />
                  <span>Resume Builder</span>
                </Link>
              </div>
            </div>
          )}

          {/* Stepper Controls */}
          <div className="mt-8 pt-6 border-t border-[var(--theme-border)] flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface)] text-[var(--theme-text)] border border-[var(--theme-border)] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/userdashboard")}
                className="text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
              >
                Skip for now
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Complete & Go to Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </CandidateLayout>
  );
}
