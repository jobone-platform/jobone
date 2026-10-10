import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

export default function EmployerEditProfile2() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imgUploadType, setImgUploadType] = useState("link"); // "link" or "upload"
    const [uploadingImage, setUploadingImage] = useState(false);

    // State matches the backend updateEmployerProfile controller fields exactly
    const [form, setForm] = useState({
        companyName: "",
        name: "", // Contact person name
        phone: "",
        companyWebsite: "",
        location: "",
        industry: "",
        description: "",
        profilePicture: "", // URL for the logo
    });

    // --- 1. LOAD PROFILE DATA ON MOUNT ---
    useEffect(() => {
        const loadProfile = async () => {
            try {
                // 1. Get Auth Info
                const stored = localStorage.getItem("employerInfo");
                if (!stored) {
                    alert("Please log in.");
                    navigate("/employerregister");
                    return;
                }

                const dataset = JSON.parse(stored);
                const token = dataset.token;
                // Support both 'id' (frontend) and 'employerId' (backend response)
                const employerID = dataset.id || dataset.employerId;

                if (!token) {
                    navigate("/employerregister");
                    return;
                }

                // 2. Fetch Data
                const { data } = await axios.get(
                    `https://jobone-mrpy.onrender.com/employer/profile/${employerID}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                // 3. Pre-fill Form (Handle null/undefined values gracefully)
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
                alert("Could not load profile data.");
                navigate("/employerprofile"); // Fallback
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [navigate]);

    // --- 2. HANDLE INPUT CHANGES ---
    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // --- 3. SUBMIT UPDATES ---
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

            if (!token) {
                alert("Authentication error. Please log in again.");
                return;
            }

            // Send POST request to update (as per your backend route)
            await axios.post(
                "https://jobone-mrpy.onrender.com/employer/updateProfile",
                form,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Success! Redirect back to profile view
            alert("Profile updated successfully!");
            navigate(`/employerdashboard`);
        } catch (err) {
            console.error("Update failed:", err);
            alert(
                "Failed to update profile: " +
                (err.response?.data?.message || err.message)
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-gray-600 gap-2">
                <Loader2 className="animate-spin" /> Loading profile...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Edit Company Profile
                        </h1>
                        <p className="text-sm text-gray-500">
                            Update your business details and contact info
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-medium bg-gray-100 px-3 py-2 rounded-lg transition"
                    >
                        <ArrowLeft size={16} /> Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                <Building size={16} className="text-blue-500" /> Company Name
                            </label>
                            <input
                                name="companyName"
                                value={form.companyName}
                                onChange={onChange}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                placeholder="e.g. Tech Solutions Inc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                <Briefcase size={16} className="text-blue-500" /> Contact Person
                                Name
                            </label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                <Phone size={16} className="text-blue-500" /> Phone Number
                            </label>
                            <input
                                name="phone"
                                value={form.phone}
                                onChange={onChange}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    {/* Section 2: Online Presence */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                <Globe size={16} className="text-blue-500" /> Website
                            </label>
                            <input
                                name="companyWebsite"
                                value={form.companyWebsite}
                                onChange={onChange}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                placeholder="https://example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                <ImageIcon size={16} className="text-blue-500" /> Profile
                                Picture / Logo
                            </label>

                            <div className="flex gap-4 mb-3 border-b border-gray-100 pb-2">
                                <button
                                    type="button"
                                    onClick={() => setImgUploadType("link")}
                                    className={`text-sm font-semibold transition-colors ${imgUploadType === "link" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    Provide Link
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImgUploadType("upload")}
                                    className={`text-sm font-semibold transition-colors ${imgUploadType === "upload" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    Upload Image
                                </button>
                            </div>

                            {imgUploadType === "link" ? (
                                <>
                                    <input
                                        name="profilePicture"
                                        value={form.profilePicture}
                                        onChange={onChange}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                        placeholder="https://image-url.com/logo.png"
                                    />
                                    <p className="text-xs text-gray-400 mt-1 ml-1">
                                        Paste a direct link to your logo image.
                                    </p>
                                </>
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
                                    {uploadingImage && <Loader2 className="animate-spin text-blue-600" size={24} />}
                                </div>
                            )}
                            {form.profilePicture && !uploadingImage && (
                                <div className="mt-3 flex items-center gap-3">
                                    <img src={form.profilePicture} alt="Preview" className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200" />
                                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">Image ready</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                <MapPin size={16} className="text-blue-500" /> Location
                            </label>
                            <input
                                name="location"
                                value={form.location}
                                onChange={onChange}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                placeholder="City, Country"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                <Briefcase size={16} className="text-blue-500" /> Industry
                            </label>
                            <input
                                name="industry"
                                value={form.industry}
                                onChange={onChange}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                placeholder="e.g. Software, Finance"
                            />
                        </div>
                    </div>

                    {/* Section 4: About */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                            <FileText size={16} className="text-blue-500" /> About Company
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={onChange}
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none h-40 resize-y transition leading-relaxed"
                            placeholder="Tell candidates about your company culture, mission, and what makes you unique..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-6 border-t flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <Save size={20} />
                            )}
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
