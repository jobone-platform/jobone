import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  FileText,
  Briefcase,
  Plus,
  X,
  Save,
  Loader2,
  ArrowLeft,
  GraduationCap,
  Link as LinkIcon,
  AlertTriangle,
} from "lucide-react";

export default function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to access state passed from Login
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgUploadType, setImgUploadType] = useState("link"); // "link" or "upload"
  const [uploadingImage, setUploadingImage] = useState(false);

  // --- POPUP STATE ---
  const [showPopup, setShowPopup] = useState(false);

  // --- MAIN PROFILE STATE ---
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    profilePicture: "",
    resume: "",
  });

  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);

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

  // --- 1. LOAD DATA & CHECK POPUP ---
  useEffect(() => {
    // Check if we need to show the warning popup
    if (location.state?.showWarning) {
      setShowPopup(true);
    }

    const fetchUser = async () => {
      try {
        const storedString = localStorage.getItem("userInfo");
        if (!storedString) {
          navigate("/login");
          return;
        }

        let storedUser;
        try {
          storedUser = JSON.parse(storedString);
        } catch (e) {
          navigate("/login");
          return;
        }

        const { token, id } = storedUser;
        const userId = id || storedUser.userId;

        if (!token || !userId) {
          navigate("/login");
          return;
        }

        const { data } = await axios.get(
          `https://jobone-mrpy.onrender.com/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const safeList = (val) => {
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
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          description: data.description || "",
          profilePicture: data.profilePicture || "",
          resume: data.resume || "",
        });

        setSkills(safeList(data.skills));
        setExperience(safeList(data.experience));
        setEducation(safeList(data.education));
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, location]);

  // --- HANDLERS ---
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
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
      const storedString = localStorage.getItem("userInfo");
      if (!storedString) throw new Error("Not logged in");
      const { token, id, userId } = JSON.parse(storedString);
      const uid = id || userId;

      const { data } = await axios.post(
        `https://jobone-mrpy.onrender.com/user/${uid}/profile-picture/upload-url`,
        { fileType: file.type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.put(data.uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      setProfile(prev => ({ ...prev, profilePicture: data.publicUrl }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };
  const handleRemoveSkill = (item) =>
    setSkills(skills.filter((s) => s !== item));

  const handleExpChange = (e) =>
    setExpForm({ ...expForm, [e.target.name]: e.target.value });
  const handleAddExperience = () => {
    if (expForm.company && expForm.role) {
      setExperience([...experience, { ...expForm }]);
      setExpForm({ company: "", role: "", duration: "", description: "" });
    } else {
      alert("Company and Role are required.");
    }
  };
  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleEduChange = (e) =>
    setEduForm({ ...eduForm, [e.target.name]: e.target.value });
  const handleAddEducation = () => {
    if (eduForm.degree && eduForm.university) {
      setEducation([...education, { ...eduForm }]);
      setEduForm({
        degree: "",
        university: "",
        started: "",
        ended: "",
        CGPA: "",
      });
    } else {
      alert("Degree and University are required.");
    }
  };
  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadingImage) {
      alert("Please wait for the image upload to complete.");
      return;
    }
    setSaving(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem("userInfo"));
      const { token, id } = storedUser;
      const userId = id || storedUser.userId;

      const payload = {
        ...profile,
        skills,
        experience,
        education,
      };

      if (payload.phone === "") delete payload.phone;

      await axios.patch(
        `https://jobone-mrpy.onrender.com/user/${userId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Update failed:", error);
      alert(
        "Failed to update profile. " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 relative">
      {/* --- POPUP MODAL --- */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border-t-4 border-orange-500 transform scale-100 transition-all">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="bg-orange-100 p-3 rounded-full mb-4">
                <AlertTriangle className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Profile Incomplete
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                We noticed your profile is missing details like{" "}
                <strong>Phone Number</strong>.
                <br />
                <br />
                Please complete these details now to verify your account and
                apply for jobs.
              </p>
              <button
                onClick={() => setShowPopup(false)}
                className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-700 transition-colors w-full shadow-lg shadow-orange-200"
              >
                Okay, I'll update it
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Edit Profile
            </h1>
            <p className="text-slate-500 mt-1">
              Update your professional portfolio.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-colors"
          >
            <ArrowLeft size={16} /> Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. PERSONAL DETAILS CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
              <User className="text-blue-600" size={20} /> Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup
                label="Full Name"
                icon={<User size={18} />}
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                placeholder="e.g. Aditi Sharma"
              />
              <InputGroup
                label="Phone Number"
                icon={<Phone size={18} />}
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                placeholder="e.g. 9876543210"
              />
              <div className="md:col-span-2">
                <InputGroup
                  label="Email Address"
                  icon={<Mail size={18} />}
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="Email"
                  disabled={true}
                />
                <p className="text-xs text-gray-400 mt-1 ml-1">
                  Email cannot be changed.
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                  Profile Picture
                </label>
                <div className="flex gap-4 mb-3 border-b border-gray-100 pb-2">
                  <button
                    type="button"
                    onClick={() => setImgUploadType("link")}
                    className={`text-sm font-semibold transition-colors ${imgUploadType === "link" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    Provide Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setImgUploadType("upload")}
                    className={`text-sm font-semibold transition-colors ${imgUploadType === "upload" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    Upload Image
                  </button>
                </div>

                {imgUploadType === "link" ? (
                  <InputGroup
                    icon={<LinkIcon size={18} />}
                    name="profilePicture"
                    value={profile.profilePicture}
                    onChange={handleProfileChange}
                    placeholder="https://example.com/photo.jpg"
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
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100 cursor-pointer
                        border border-slate-200 rounded-xl p-2"
                    />
                    {uploadingImage && <Loader2 className="animate-spin text-indigo-600" size={24} />}
                  </div>
                )}
                {profile.profilePicture && !uploadingImage && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={profile.profilePicture} alt="Profile Preview" className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200" />
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">Image ready</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <InputGroup
                  label="Resume Link / Portfolio"
                  icon={<FileText size={18} />}
                  name="resume"
                  value={profile.resume}
                  onChange={handleProfileChange}
                  placeholder="https://linkedin.com/in/aditi"
                />
              </div>
            </div>
          </div>

          {/* 2. SUMMARY CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
              <FileText className="text-purple-600" size={20} /> Professional
              Summary
            </h2>
            <textarea
              name="description"
              value={profile.description}
              onChange={handleProfileChange}
              rows={4}
              placeholder="Write a short bio about your professional background and goals..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-y text-slate-700 leading-relaxed text-sm"
            />
          </div>

          {/* 3. SKILLS CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
              <span className="p-1 bg-orange-100 rounded-md text-orange-600">
                <User size={16} />
              </span>{" "}
              Skills
            </h2>
            <div className="flex gap-3 mb-4">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g. React, Python)"
                className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all text-sm"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddSkill())
                }
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="bg-orange-600 text-white px-6 rounded-xl font-medium hover:bg-orange-700 transition-colors shadow-sm"
              >
                Add
              </button>
            </div>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm group"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {skill}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No skills added yet.
              </p>
            )}
          </div>

          {/* 4. WORK EXPERIENCE CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
              <span className="p-1 bg-blue-100 rounded-md text-blue-600">
                <Briefcase size={16} />
              </span>{" "}
              Work Experience
            </h2>

            {/* Add Form */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  name="role"
                  value={expForm.role}
                  onChange={handleExpChange}
                  placeholder="Job Title"
                  className="p-3 border border-gray-200 rounded-xl focus:border-blue-500 outline-none text-sm"
                />
                <input
                  name="company"
                  value={expForm.company}
                  onChange={handleExpChange}
                  placeholder="Company Name"
                  className="p-3 border border-gray-200 rounded-xl focus:border-blue-500 outline-none text-sm"
                />
                <input
                  name="duration"
                  value={expForm.duration}
                  onChange={handleExpChange}
                  placeholder="Duration (e.g. 2 Years)"
                  className="p-3 border border-gray-200 rounded-xl focus:border-blue-500 outline-none text-sm"
                />
                <input
                  name="description"
                  value={expForm.description}
                  onChange={handleExpChange}
                  placeholder="Description (Optional)"
                  className="p-3 border border-gray-200 rounded-xl focus:border-blue-500 outline-none text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <Plus size={16} /> Add Position
              </button>
            </div>

            {/* List */}
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-gray-900">{exp.role}</h4>
                    <p className="text-sm text-blue-600 font-medium mb-1">
                      {exp.company} • {exp.duration}
                    </p>
                    <p className="text-sm text-gray-500">{exp.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 5. EDUCATION CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
              <span className="p-1 bg-green-100 rounded-md text-green-600">
                <GraduationCap size={16} />
              </span>{" "}
              Education
            </h2>

            {/* Add Form */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  name="degree"
                  value={eduForm.degree}
                  onChange={handleEduChange}
                  placeholder="Degree"
                  className="p-3 border border-gray-200 rounded-xl focus:border-green-500 outline-none text-sm"
                />
                <input
                  name="university"
                  value={eduForm.university}
                  onChange={handleEduChange}
                  placeholder="University / Institute"
                  className="p-3 border border-gray-200 rounded-xl focus:border-green-500 outline-none text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="started"
                    value={eduForm.started}
                    onChange={handleEduChange}
                    placeholder="Start Year"
                    className="p-3 border border-gray-200 rounded-xl focus:border-green-500 outline-none text-sm"
                  />
                  <input
                    name="ended"
                    value={eduForm.ended}
                    onChange={handleEduChange}
                    placeholder="End Year"
                    className="p-3 border border-gray-200 rounded-xl focus:border-green-500 outline-none text-sm"
                  />
                </div>
                <input
                  name="CGPA"
                  value={eduForm.CGPA}
                  onChange={handleEduChange}
                  placeholder="CGPA / Grade"
                  className="p-3 border border-gray-200 rounded-xl focus:border-green-500 outline-none text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <Plus size={16} /> Add Education
              </button>
            </div>

            {/* List */}
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                    <p className="text-sm text-green-600 font-medium mb-1">
                      {edu.university}
                    </p>
                    <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                      {edu.started} - {edu.ended} {edu.CGPA && `| ${edu.CGPA}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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

// --- UI HELPERS ---
const InputGroup = ({
  label,
  icon,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
        {icon}
      </div>
      <input
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      />
    </div>
  </div>
);
