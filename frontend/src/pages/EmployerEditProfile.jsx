import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import EmployerLayout from "../components/employer/EmployerLayout.jsx";
import LocationPicker from "../components/LocationPicker.jsx";
import {
  Loader2,
  Save,
  ArrowLeft,
  Building,
  Globe,
  MapPin,
  Phone,
  FileText,
  Image as ImageIcon,
  Briefcase,
  User,
  AlertTriangle,
  X,
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";

export default function EmployerEditProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [imgUploadType, setImgUploadType] = useState("link"); // "link" or "upload"
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    employerType: "company",
    companyName: "",
    natureOfBusiness: "",
    name: "",
    phone: "",
    companyWebsite: "",
    location: "",
    latitude: null,
    longitude: null,
    industry: "",
    description: "",
    profilePicture: "",
  });

  const wordCount = form.description
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const MIN_WORDS = 50;
  const MAX_WORDS = 200;

  useEffect(() => {
    if (location.state?.showWarning) setShowPopup(true);

    const loadProfile = async () => {
      try {
        const stored = localStorage.getItem("employerInfo");
        if (!stored) return navigate("/login");

        const dataset = JSON.parse(stored);
        const { token, id, employerId } = dataset;
        const targetId = id || employerId;

        const { data } = await axios.get(
          `${API_BASE_URL}/employer/profile/${targetId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setForm({
          employerType: data.employerType || "company",
          companyName: data.companyName || "",
          natureOfBusiness: data.natureOfBusiness || "",
          name: data.name || "",
          phone: data.phone ? String(data.phone) : "",
          companyWebsite: data.companyWebsite || "",
          location: data.officeLocation?.address || data.location || "",
          latitude: data.officeLocation?.coordinates?.[1] || null,
          longitude: data.officeLocation?.coordinates?.[0] || null,
          industry: data.industry || "",
          description: data.description || "",
          profilePicture: data.profilePicture || "",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate, location]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLocationSelect = useCallback((locData) => {
    setForm((prev) => ({
      ...prev,
      location: locData.address,
      latitude: locData.latitude,
      longitude: locData.longitude,
    }));
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    setUploadingImage(true);
    try {
      const storedString = localStorage.getItem("employerInfo");
      if (!storedString) throw new Error("Not logged in");
      const { token } = JSON.parse(storedString);

      const { data } = await axios.post(
        `${API_BASE_URL}/employer/profile-picture/upload-url`,
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

      setForm((prev) => ({ ...prev, profilePicture: data.publicUrl }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadingImage) {
      alert("Please wait for the image upload to complete.");
      return;
    }

    if (wordCount < MIN_WORDS) {
      alert(`Company narrative must be at least ${MIN_WORDS} words. You currently have ${wordCount}.`);
      return;
    }
    if (wordCount > MAX_WORDS) {
      alert(`Company narrative cannot exceed ${MAX_WORDS} words. You currently have ${wordCount}.`);
      return;
    }

    if (!form.phone?.trim() || !form.latitude) {
      alert("Phone number and office location pin are mandatory.");
      return;
    }

    if (
      form.employerType === "company" &&
      (!form.companyName?.trim() || !form.natureOfBusiness?.trim())
    ) {
      alert("Company Name and Nature of Business are mandatory for registered organizations.");
      return;
    }

    setSaving(true);
    try {
      const storedEmployer = JSON.parse(localStorage.getItem("employerInfo"));
      const token = storedEmployer.token;

      const officeLocation = {
        type: "Point",
        coordinates: [Number(form.longitude), Number(form.latitude)],
        address: form.location,
      };

      const payload = {
        name: form.name,
        phone: form.phone,
        employerType: form.employerType,
        companyName: form.employerType === "company" ? form.companyName : "",
        natureOfBusiness: form.employerType === "company" ? form.natureOfBusiness : "",
        companyWebsite: form.employerType === "company" ? form.companyWebsite : "",
        location: form.location,
        officeLocation: officeLocation,
        industry: form.industry,
        description: form.description,
        profilePicture: form.profilePicture,
      };

      const { data } = await axios.post(
        `${API_BASE_URL}/employer/updateProfile`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem(
        "employerInfo",
        JSON.stringify({ ...storedEmployer, ...data, isProfileComplete: true })
      );

      alert("Company profile updated successfully!");
      navigate(`/employerprofile`);
    } catch (err) {
      alert("Failed to update profile: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <EmployerLayout activeTab="settings" title="Edit Profile">
        <div className="py-24 flex flex-col items-center justify-center text-[var(--theme-text-muted)]">
          <Loader2 size={36} className="animate-spin text-[var(--theme-accent-silver)] mb-4" />
          <p className="text-sm font-semibold">Loading profile settings...</p>
        </div>
      </EmployerLayout>
    );
  }

  const wordProgress = Math.min(100, Math.round((wordCount / MIN_WORDS) * 100));

  return (
    <EmployerLayout
      activeTab="settings"
      title="Company Profile Settings"
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "Company Profile", path: "/employerprofile" },
        { label: "Settings" },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        {/* Warning Alert if redirected */}
        {showPopup && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>Please complete your company profile details below before posting open positions.</span>
            </div>
            <button type="button" onClick={() => setShowPopup(false)} className="hover:text-white">
              <X size={15} />
            </button>
          </div>
        )}
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/employerprofile")}
              className="p-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--theme-text)] tracking-tight">
                Company Profile Settings
              </h1>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                Manage enterprise branding, authorized representatives, and headquarters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/employerprofile"
              className="px-4 py-2 rounded-xl border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* 1. Identity & Branding */}
        <section className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[var(--theme-text)] flex items-center gap-2 border-b border-[var(--theme-border)] pb-3">
            <Building size={16} className="text-[var(--theme-accent-silver)]" />
            <span>Brand Identity & Organization</span>
          </h2>

          {/* Logo / Avatar Preview & Uploader */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)]">
            {form.profilePicture ? (
              <img
                src={form.profilePicture}
                alt="Brand logo"
                className="w-16 h-16 rounded-xl object-cover border border-[var(--theme-border-silver)] bg-[var(--theme-surface-elevated)]"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text-muted)]">
                <ImageIcon size={24} />
              </div>
            )}

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setImgUploadType("link")}
                  className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                    imgUploadType === "link"
                      ? "border-[var(--theme-accent-silver)] text-[var(--theme-text)] font-bold"
                      : "border-transparent text-[var(--theme-text-muted)]"
                  }`}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setImgUploadType("upload")}
                  className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                    imgUploadType === "upload"
                      ? "border-[var(--theme-accent-silver)] text-[var(--theme-text)] font-bold"
                      : "border-transparent text-[var(--theme-text-muted)]"
                  }`}
                >
                  Upload File
                </button>
              </div>

              {imgUploadType === "link" ? (
                <input
                  type="text"
                  name="profilePicture"
                  value={form.profilePicture}
                  onChange={onChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full p-2 text-xs rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="text-xs text-[var(--theme-text-muted)] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-[var(--theme-border)] file:bg-[var(--theme-surface-elevated)] file:text-[var(--theme-text)] file:text-xs file:font-semibold"
                  />
                  {uploadingImage && <Loader2 size={16} className="animate-spin text-[var(--theme-accent-silver)]" />}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                Employer Type
              </label>
              <select
                name="employerType"
                value={form.employerType}
                onChange={onChange}
                className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
              >
                <option value="company">Registered Company / Enterprise</option>
                <option value="individual">Individual Recruiter / Proprietor</option>
              </select>
            </div>

            {form.employerType === "company" && (
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                  Company Legal Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={onChange}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                Industry Sector
              </label>
              <input
                type="text"
                name="industry"
                value={form.industry}
                onChange={onChange}
                placeholder="e.g. Information Technology & SaaS"
                className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
              />
            </div>

            {form.employerType === "company" && (
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                  Nature of Business <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="natureOfBusiness"
                  value={form.natureOfBusiness}
                  onChange={onChange}
                  placeholder="e.g. Software Product Development, B2B SaaS"
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
              Official Website
            </label>
            <input
              type="text"
              name="companyWebsite"
              value={form.companyWebsite}
              onChange={onChange}
              placeholder="https://company.com"
              className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
            />
          </div>
        </section>

        {/* 2. Point of Contact */}
        <section className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[var(--theme-text)] flex items-center gap-2 border-b border-[var(--theme-border)] pb-3">
            <User size={16} className="text-[var(--theme-accent-silver)]" />
            <span>Authorized Point of Contact</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                Representative Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                Direct Contact Phone <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="+91 9876543210"
                className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
              />
            </div>
          </div>
        </section>

        {/* 3. Corporate Narrative / Story */}
        <section className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-3">
            <h2 className="text-sm font-bold text-[var(--theme-text)] flex items-center gap-2">
              <FileText size={16} className="text-[var(--theme-accent-silver)]" />
              <span>Corporate Story & Description</span>
            </h2>

            <span
              className={`text-xs font-mono font-bold ${
                wordCount < MIN_WORDS
                  ? "text-amber-400"
                  : wordCount > MAX_WORDS
                  ? "text-red-400"
                  : "text-emerald-400"
              }`}
            >
              {wordCount} / {MIN_WORDS}-{MAX_WORDS} words
            </span>
          </div>

          <p className="text-xs text-[var(--theme-text-muted)]">
            A comprehensive profile description (50–200 words) unlocks full job posting capabilities.
          </p>

          {/* Word count progress meter */}
          <div className="w-full h-1.5 rounded-full bg-[var(--theme-surface-elevated)] overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                wordCount < MIN_WORDS
                  ? "bg-amber-400"
                  : wordCount > MAX_WORDS
                  ? "bg-red-400"
                  : "bg-emerald-400"
              }`}
              style={{ width: `${wordProgress}%` }}
            />
          </div>

          <textarea
            rows={5}
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Share your company's founding vision, engineering culture, and value proposition for top talent..."
            className="w-full p-3 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] resize-y leading-relaxed"
          />
        </section>

        {/* 4. Headquarters Location & Map Pin */}
        <section className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-[var(--theme-text)] flex items-center gap-2 border-b border-[var(--theme-border)] pb-3">
            <MapPin size={16} className="text-[var(--theme-accent-silver)]" />
            <span>Corporate Headquarters Location</span>
          </h2>

          <p className="text-xs text-[var(--theme-text-muted)]">
            Select your physical office address and drop a map pin for geographic proximity matching.
          </p>

          <LocationPicker
            selectedLocation={form.location}
            onSelect={handleLocationSelect}
          />
        </section>

        {/* Bottom Save Action */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/employerprofile"
            className="px-5 py-2.5 rounded-xl border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </EmployerLayout>
  );
}
