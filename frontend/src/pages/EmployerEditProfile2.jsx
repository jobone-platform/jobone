import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import EmployerLayout from "../components/employer/EmployerLayout.jsx";
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
  CheckCircle2,
} from "lucide-react";

export default function EmployerEditProfile2() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgUploadType, setImgUploadType] = useState("link");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    name: "",
    phone: "",
    companyWebsite: "",
    location: "",
    industry: "",
    description: "",
    profilePicture: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const stored = localStorage.getItem("employerInfo");
        if (!stored) {
          navigate("/employerregister");
          return;
        }

        const dataset = JSON.parse(stored);
        const token = dataset.token;
        const employerID = dataset.id || dataset.employerId;

        if (!token) {
          navigate("/employerregister");
          return;
        }

        const { data } = await axios.get(
          `${API_BASE_URL}/employer/profile/${employerID}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setForm({
          companyName: data.companyName || "",
          name: data.name || "",
          phone: data.phone || "",
          companyWebsite: data.companyWebsite || "",
          location: data.location || "",
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
  }, [navigate]);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

      await axios.put(data.uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

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
    setSaving(true);

    try {
      const stored = localStorage.getItem("employerInfo");
      const token = stored ? JSON.parse(stored).token : null;

      if (!token) return alert("Session expired. Please log in again.");

      const { data } = await axios.post(
        `${API_BASE_URL}/employer/updateProfile`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const parsedEmployer = JSON.parse(stored);
      localStorage.setItem(
        "employerInfo",
        JSON.stringify({ ...parsedEmployer, ...data, isProfileComplete: true })
      );

      alert("Onboarding profile saved successfully!");
      navigate(`/employerdashboard`);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <EmployerLayout activeTab="settings" title="Complete Setup">
        <div className="py-24 flex flex-col items-center justify-center text-[var(--theme-text-muted)]">
          <Loader2 size={36} className="animate-spin text-[var(--theme-accent-silver)] mb-4" />
          <p className="text-sm font-semibold">Loading setup details...</p>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout
      activeTab="settings"
      title="Complete Employer Onboarding"
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "Onboarding Setup" },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border-b border-[var(--theme-border)] pb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--theme-text)] tracking-tight">
            Complete Employer Setup
          </h1>
          <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
            Configure your enterprise profile to unlock the full hiring suite
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            {/* Logo Selector */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)]">
              {form.profilePicture ? (
                <img
                  src={form.profilePicture}
                  alt="Company logo"
                  className="w-16 h-16 rounded-xl object-cover border border-[var(--theme-border-silver)] bg-[var(--theme-surface-elevated)]"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text-muted)]">
                  <Building size={24} />
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
                    placeholder="https://company.com/logo.png"
                    className="w-full p-2 text-xs rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="text-xs text-[var(--theme-text-muted)]"
                    />
                    {uploadingImage && <Loader2 size={16} className="animate-spin text-[var(--theme-accent-silver)]" />}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={onChange}
                  required
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                  Contact Person <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                  Direct Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  required
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={form.industry}
                  onChange={onChange}
                  placeholder="e.g. Information Technology"
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                Website
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

            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                Company Summary / Narrative
              </label>
              <textarea
                rows={4}
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Tell prospective candidates about your company..."
                className="w-full p-3 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] resize-y leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Save & Go to Dashboard</span>
            </button>
          </div>
        </form>
      </div>
    </EmployerLayout>
  );
}
