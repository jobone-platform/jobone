import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
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
  // FACT: Adjusted minimum word count based on tester feedback.
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
          `https://jobone-mrpy.onrender.com/employer/profile/${targetId}`,
          { headers: { Authorization: `Bearer ${token}` } },
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
        `https://jobone-mrpy.onrender.com/employer/profile-picture/upload-url`,
        { fileType: file.type },
        { headers: { Authorization: `Bearer ${token}` } },
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

    // FACT: Validating against the new 50-word minimum
    if (wordCount < MIN_WORDS) {
      alert(
        `Description must be at least ${MIN_WORDS} words. You currently have ${wordCount}.`,
      );
      return;
    }
    if (wordCount > MAX_WORDS) {
      alert(
        `Description cannot exceed ${MAX_WORDS} words. You currently have ${wordCount}.`,
      );
      return;
    }

    if (!form.phone?.trim() || !form.latitude) {
      alert("Phone Number and Office Location map pin are mandatory.");
      return;
    }

    if (
      form.employerType === "company" &&
      (!form.companyName?.trim() || !form.natureOfBusiness?.trim())
    ) {
      alert("Company Name and Nature of Business are mandatory for companies.");
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
        natureOfBusiness:
          form.employerType === "company" ? form.natureOfBusiness : "",
        companyWebsite:
          form.employerType === "company" ? form.companyWebsite : "",
        location: form.location,
        officeLocation: officeLocation,
        industry: form.industry,
        description: form.description,
        profilePicture: form.profilePicture,
      };

      const { data } = await axios.post(
        "https://jobone-mrpy.onrender.com/employer/updateProfile",
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // FACT: Mark profile as complete so ProtectedRoute stops blocking them
      localStorage.setItem(
        "employerInfo",
        JSON.stringify({ ...storedEmployer, ...data, isProfileComplete: true }),
      );

      alert("Profile updated successfully!");
      navigate(`/employerprofile`);
    } catch (err) {
      alert(
        "Failed to update profile: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-slate-500 gap-2">
        <Loader2 className="animate-spin" /> Loading profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-4 px-0 sm:py-10 sm:px-4 relative font-sans">
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border-t-4 border-red-500">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Profile Incomplete
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                To proceed, you must fill out all required fields, including
                pinning your location and writing a {MIN_WORDS}+ word
                description.
              </p>
              <button
                onClick={() => setShowPopup(false)}
                className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 w-full"
              >
                Okay, I'll update it
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white sm:rounded-2xl shadow-lg p-3 sm:p-8 border-y sm:border border-slate-100">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800">
              Edit Profile
            </h1>
            <p className="text-sm text-slate-500">
              Update your business or professional details
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium bg-slate-50 px-3 py-2 rounded-lg transition-colors border border-slate-200"
          >
            <ArrowLeft size={16} /> Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-slate-50 p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-3 sm:mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600" /> Entity Type
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <label
                className={`flex-1 flex items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all text-xs sm:text-sm ${form.employerType === "company" ? "border-blue-600 bg-blue-50 text-blue-700 font-bold" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}
              >
                <input
                  type="radio"
                  name="employerType"
                  value="company"
                  checked={form.employerType === "company"}
                  onChange={onChange}
                  className="hidden"
                />
                <Building size={20} /> Registered Company
              </label>
              <label
                className={`flex-1 flex items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all text-xs sm:text-sm ${form.employerType === "individual" ? "border-blue-600 bg-blue-50 text-blue-700 font-bold" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}
              >
                <input
                  type="radio"
                  name="employerType"
                  value="individual"
                  checked={form.employerType === "individual"}
                  onChange={onChange}
                  className="hidden"
                />
                <User size={20} /> Individual / Professional
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {form.employerType === "company" && (
              <>
                <div className="md:col-span-1">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                    <Building size={16} className="text-blue-500" /> Company
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={onChange}
                    className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    required={form.employerType === "company"}
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                    <Briefcase size={16} className="text-blue-500" /> Nature of
                    Business <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="natureOfBusiness"
                    value={form.natureOfBusiness}
                    onChange={onChange}
                    className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition bg-white"
                    required={form.employerType === "company"}
                  >
                    <option value="">Select Type...</option>
                    <option value="Proprietorship">Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="LLP">
                      LLP (Limited Liability Partnership)
                    </option>
                    <option value="Private LTD">Private LTD</option>
                    <option value="Public LTD">Public LTD</option>
                    <option value="Trust/NGO">Trust / NGO</option>
                    <option value="ERP">ERP</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                    <Globe size={16} className="text-blue-500" /> Website
                  </label>
                  <input
                    name="companyWebsite"
                    value={form.companyWebsite}
                    onChange={onChange}
                    className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <User size={16} className="text-blue-500" /> Contact Person
              </label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <Phone size={16} className="text-blue-500" /> Phone Number{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <ImageIcon size={16} className="text-blue-500" /> Profile/Logo
              </label>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setImgUploadType("link")}
                  className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                    imgUploadType === "link"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Provide Link
                </button>
                <button
                  type="button"
                  onClick={() => setImgUploadType("upload")}
                  className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                    imgUploadType === "upload"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Upload File
                </button>
              </div>

              {imgUploadType === "link" ? (
                <input
                  name="profilePicture"
                  value={form.profilePicture}
                  onChange={onChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                />
              ) : (
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100 cursor-pointer
                      border border-slate-200 rounded-xl p-2"
                  />
                  {uploadingImage && (
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                  )}
                </div>
              )}
              {form.profilePicture && !uploadingImage && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={form.profilePicture}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200"
                  />
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                    Image ready
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" /> Office Location{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="bg-blue-50 p-2 sm:p-5 rounded-xl border border-blue-100 mb-3">
              <div className="rounded-lg overflow-hidden border border-blue-200 shadow-sm">
                <LocationPicker onLocationSelect={handleLocationSelect} />
              </div>
            </div>
            <input
              name="location"
              value={form.location}
              onChange={onChange}
              className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
              placeholder="Refine specific address"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-500" /> Industry{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              name="industry"
              value={form.industry}
              onChange={onChange}
              className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition bg-white"
              required
            >
              <option value="">Select Industry...</option>
              <option value="IT/Software">IT / Software</option>
              <option value="Healthcare">Healthcare & Medical</option>
              <option value="Finance">Finance & Banking</option>
              <option value="Education">Education & E-Learning</option>
              <option value="Manufacturing">Manufacturing & Logistics</option>
              <option value="Retail">Retail & E-Commerce</option>
              <option value="Construction">Construction & Real Estate</option>
              <option value="Consulting">Consulting / Agency</option>
              {/* FACT: Added new missing categories per tester request */}
              <option value="Social Work">Social Work</option>
              <option value="NGO Sector">NGO Sector</option>
              <option value="Community Outreach">Community Outreach</option>
              <option value="Development Sector">Development Sector</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-end mb-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText size={16} className="text-blue-500" /> About Details{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex justify-between items-center mt-2 mb-2">
                <span
                  className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md ${wordCount >= MIN_WORDS && wordCount <= MAX_WORDS ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
                >
                  {wordCount} / {MAX_WORDS} words max (min {MIN_WORDS})
                </span>
              </div>
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              className={`w-full p-3 sm:p-4 text-xs sm:text-sm border rounded-xl focus:ring-2 outline-none h-48 resize-y transition leading-relaxed ${wordCount >= MIN_WORDS && wordCount <= MAX_WORDS ? "border-slate-200 focus:border-blue-500 focus:ring-blue-100" : "border-red-300 focus:border-red-500 focus:ring-red-100"}`}
              placeholder={`Provide a detailed description (${MIN_WORDS}-${MAX_WORDS} words)...`}
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="w-full sm:flex-1 flex items-center justify-center  gap-2 bg-blue-600 text-white p-2.5 sm:p-3 text-xs sm:text-sm rounded-xl font-bold hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
