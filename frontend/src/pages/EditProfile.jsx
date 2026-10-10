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
  Upload,
  Sparkles,
  Code,
  Award,
  Globe,
  HeartHandshake,
} from "lucide-react";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

export default function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [imgUploadType, setImgUploadType] = useState("link");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    description: "",
    profilePicture: "",
    resumeFileKey: "",
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
  const [linkForm, setLinkForm] = useState({ platform: "", url: "" });
  const [volForm, setVolForm] = useState({
    organization: "",
    role: "",
    duration: "",
    description: "",
  });

  useEffect(() => {
    if (location.state?.showWarning) setShowPopup(true);

    const fetchUser = async () => {
      try {
        const storedString = localStorage.getItem("userInfo");
        if (!storedString) return navigate("/login");
        const storedUser = JSON.parse(storedString);
        const userId = storedUser.id || storedUser.userId;

        if (!storedUser.token || !userId) return navigate("/login");

        const { data } = await axios.get(
          `https://jobone-mrpy.onrender.com/user/${userId}`,
          { headers: { Authorization: `Bearer ${storedUser.token}` } },
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
        });

        // FACT: Now intelligently checks resumeData fallback if manual arrays are empty
        setSkills(
          safeList(data.skills?.length ? data.skills : data.resumeData?.skills),
        );
        setExperience(
          safeList(
            data.experience?.length
              ? data.experience
              : data.resumeData?.experience,
          ),
        );
        setEducation(
          safeList(
            data.education?.length
              ? data.education
              : data.resumeData?.education,
          ),
        );
        setProjects(
          safeList(
            data.projects?.length ? data.projects : data.resumeData?.projects,
          ),
        );
        setCertifications(
          safeList(
            data.certifications?.length
              ? data.certifications
              : data.resumeData?.certifications,
          ),
        );
        setPortfolioLinks(safeList(data.portfolioLinks));
        setVolunteering(
          safeList(
            data.volunteering?.length
              ? data.volunteering
              : data.resumeData?.volunteering,
          ),
        );
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate, location]);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!validTypes.includes(file.type))
      return alert("Please upload a PDF, DOC, or DOCX file.");

    setIsParsing(true);
    const storedData = JSON.parse(localStorage.getItem("userInfo"));
    const userId = storedData.id || storedData.userId;

    try {
      const { data: s3Data } = await axios.post(
        `https://jobone-if7l.onrender.com/user/${userId}/resume/upload-url`,
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
        `https://jobone-if7l.onrender.com/user/${userId}/resume/save-key`,
        { key: s3Data.key },
        { headers: { Authorization: `Bearer ${storedData.token}` } }
      );
      setProfile((prev) => ({ ...prev, resumeFileKey: s3Data.key }));

      let parsedData;
      if (window.__TAURI__) {
        const res = await axios.post(
          "https://jobone-if7l.onrender.com/ai/parse-resume",
          { key: s3Data.key },
          {
            headers: {
              Authorization: `Bearer ${storedData.token}`,
            },
          }
        );
        parsedData = res.data;
      } else {
        const formData = new FormData();
        formData.append("resume", file);

        const res = await axios.post(
          "https://jobone-if7l.onrender.com/ai/parse-resume",
          formData,
          {
            headers: {
              Authorization: `Bearer ${storedData.token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        parsedData = res.data;
      }

      if (parsedData.name) setProfile((p) => ({ ...p, name: parsedData.name }));
      if (parsedData.phone)
        setProfile((p) => ({ ...p, phone: parsedData.phone }));
      if (parsedData.description)
        setProfile((p) => ({ ...p, description: parsedData.description }));
      if (parsedData.skills)
        setSkills((p) => Array.from(new Set([...p, ...parsedData.skills])));

      if (parsedData.experience) setExperience(parsedData.experience);
      if (parsedData.education) setEducation(parsedData.education);

      // FACT: Added missing state updates so AI extraction actually updates the frontend form!
      if (parsedData.projects) setProjects(parsedData.projects);
      if (parsedData.certifications)
        setCertifications(parsedData.certifications);
      if (parsedData.volunteering) setVolunteering(parsedData.volunteering);

      alert(
        "Resume parsed successfully! The original file has been securely saved for recruiters. Please review the auto-filled details below.",
      );
    } catch (error) {
      console.error("Upload/Parsing failed:", error);
      alert("Failed to process resume. Please try again.");
    } finally {
      setIsParsing(false);
      e.target.value = null;
    }
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

      setProfile(prev => ({ ...prev, profilePicture: data.publicUrl }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };
  const handleAddExperience = () => {
    if (expForm.company && expForm.role) {
      setExperience([...experience, expForm]);
      setExpForm({ company: "", role: "", duration: "", description: "" });
    } else alert("Company and Role required.");
  };
  const handleAddEducation = () => {
    if (eduForm.degree && eduForm.university) {
      setEducation([...education, eduForm]);
      setEduForm({
        degree: "",
        university: "",
        started: "",
        ended: "",
        CGPA: "",
      });
    } else alert("Degree and University required.");
  };
  const handleAddProject = () => {
    if (projForm.title) {
      setProjects([...projects, projForm]);
      setProjForm({ title: "", technologies: "", link: "", description: "" });
    } else alert("Project title required.");
  };
  const handleAddCert = () => {
    if (certForm.name) {
      setCertifications([...certifications, certForm]);
      setCertForm({ name: "", issuer: "", year: "", link: "" });
    } else alert("Certification name required.");
  };
  const handleAddLink = () => {
    if (linkForm.platform && linkForm.url) {
      setPortfolioLinks([...portfolioLinks, linkForm]);
      setLinkForm({ platform: "", url: "" });
    } else alert("Platform and URL required.");
  };
  const handleAddVol = () => {
    if (volForm.organization && volForm.role) {
      setVolunteering([...volunteering, volForm]);
      setVolForm({ organization: "", role: "", duration: "", description: "" });
    } else alert("Organization and Role required.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profile.gender || profile.gender.trim() === "") {
      alert(
        "Gender is a strictly required field. Employers use this to filter candidates based on specific job requirements. Please select a gender before saving.",
      );
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
        `https://jobone-if7l.onrender.com/user/${userId}`,
        payload,
        { headers: { Authorization: `Bearer ${storedUser.token}` } },
      );

      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...storedUser, ...data, isProfileComplete: true }),
      );
      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans relative overflow-hidden selection:bg-orange-500/30">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes lava-rise {
          0% { transform: translateY(10vh) scaleX(1) scaleY(1); border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
          50% { transform: translateY(-30vh) scaleX(1.1) scaleY(0.9); border-radius: 60% 40% 30% 70% / 50% 60% 40% 50%; }
          100% { transform: translateY(10vh) scaleX(1) scaleY(1); border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
        }
        @keyframes lava-fall {
          0% { transform: translateY(-20vh) scaleX(1) scaleY(1); border-radius: 50% 50% 40% 60% / 60% 40% 50% 50%; }
          50% { transform: translateY(40vh) scaleX(0.9) scaleY(1.2); border-radius: 40% 60% 60% 40% / 50% 50% 60% 40%; }
          100% { transform: translateY(-20vh) scaleX(1) scaleY(1); border-radius: 50% 50% 40% 60% / 60% 40% 50% 50%; }
        }
        .animate-lava-rise { animation: lava-rise 15s infinite ease-in-out; }
        .animate-lava-fall { animation: lava-fall 18s infinite ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-5000 { animation-delay: 5s; }
      `,
        }}
      />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-white">
        <div className="absolute -bottom-[20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-500/60 filter blur-[100px] animate-lava-rise"></div>
        <div className="absolute -top-[10%] right-[-20%] w-[55vw] h-[55vw] bg-blue-700/50 filter blur-[160px] animate-lava-fall animation-delay-2000"></div>
        <div className="absolute top-[20%] left-[10%] w-[50vw] h-[50vw] bg-cyan-500/40 filter blur-[125px] animate-lava-rise animation-delay-5000"></div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight drop-shadow-sm">
            Edit Profile
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white/50 hover:bg-white backdrop-blur-xl border border-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft size={16} /> Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* AI MAGIC BANNER */}
          <GlassCard className="border-orange-200 bg-orange-50/40 shadow-[0_0_40px_rgba(249,115,22,0.08)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                  <Sparkles className="text-blue-600" size={20} /> AI Resume
                  Auto-Fill
                </h3>
                <p className="text-sm text-orange-900/70 mt-1">
                  Upload PDF/DOCX to securely save the file and auto-fill your
                  details.
                </p>
              </div>
              <div className="relative group shrink-0">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  disabled={isParsing}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <button
                  type="button"
                  disabled={isParsing}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all w-full"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Parsing...
                    </>
                  ) : (
                    <>
                      <Upload size={18} /> Upload Resume
                    </>
                  )}
                </button>
              </div>
            </div>
            {profile.resumeFileKey && (
              <p className="mt-4 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full inline-block ">
                ✓ Resume securely attached
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-blue-200/60 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-950">Verification & Credential Documents</p>
                <p className="text-xs text-blue-800">Upload optional marksheets, ID proofs, and salary slips.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/jobseeker-documents")}
                className="bg-white text-blue-700 hover:bg-blue-50 border border-blue-300 px-4 py-2 rounded-xl font-bold text-sm transition shadow-sm"
              >
                Manage Documents →
              </button>
            </div>
          </GlassCard>

          {/* 1. PERSONAL DETAILS */}
          <GlassCard>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200/50 pb-4">
              <User className="text-blue-600" size={22} /> Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup
                label="Full Name"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
              />
              <InputGroup
                label="Phone Number"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
              />
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Gender <span className="text-blue-600">*</span>
                </label>
                <select
                  name="gender"
                  value={profile.gender || ""}
                  onChange={handleProfileChange}
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 text-slate-900 transition-all appearance-none shadow-sm "
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Profile Picture
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
                  <InputGroup
                    label=""
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
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100 cursor-pointer
                        border border-slate-200 rounded-xl p-2"
                    />
                    {uploadingImage && <Loader2 className="animate-spin text-blue-600" size={24} />}
                  </div>
                )}
                {profile.profilePicture && !uploadingImage && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={profile.profilePicture} alt="Profile Preview" className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200" />
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">Image ready</span>
                  </div>
                )}
              </div>
              <InputGroup
                label="Email Address"
                name="email"
                value={profile.email}
                disabled={true}
              />
            </div>
          </GlassCard>

          {/* 2. SUMMARY */}
          <GlassCard>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200/50 pb-4">
              <FileText className="text-blue-600" size={22} /> Professional
              Summary
            </h2>
            <textarea
              name="description"
              value={profile.description}
              onChange={handleProfileChange}
              rows={4}
              className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 text-slate-900 placeholder-slate-400 transition-all resize-none shadow-sm "
              placeholder="Tell employers about yourself..."
            />
          </GlassCard>

          {/* 3. SKILLS */}
          <GlassCard>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200/50 pb-4">
              <Code className="text-blue-600" size={22} /> Skills
            </h2>
            <div className="flex gap-3 mb-6">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Type a skill..."
                className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 text-slate-900 placeholder-slate-400 transition-all shadow-sm "
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddSkill())
                }
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold shadow-md transition-all"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg shadow-sm"
                >
                  <span className="text-sm font-medium text-white">
                    {skill}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((s) => s !== skill))}
                    className="text-white/50 hover:text-rose-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 4. WORK EXPERIENCE */}
          <GlassCard>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200/50 pb-4">
              <Briefcase className="text-blue-600" size={22} /> Work Experience
            </h2>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 shadow-inner ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <GlassInput
                  value={expForm.role}
                  onChange={(e) =>
                    setExpForm({ ...expForm, role: e.target.value })
                  }
                  placeholder="Job Title"
                />
                <GlassInput
                  value={expForm.company}
                  onChange={(e) =>
                    setExpForm({ ...expForm, company: e.target.value })
                  }
                  placeholder="Company"
                />
                <GlassInput
                  value={expForm.duration}
                  onChange={(e) =>
                    setExpForm({ ...expForm, duration: e.target.value })
                  }
                  placeholder="Duration (e.g. 2020 - Present)"
                />
                <GlassInput
                  value={expForm.description}
                  onChange={(e) =>
                    setExpForm({ ...expForm, description: e.target.value })
                  }
                  placeholder="Description"
                />
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 font-bold text-slate-700 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={18} /> Add Position
              </button>
            </div>
            <div className="space-y-4">
              {experience.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-start backdrop-blur-md shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">
                      {item.role}
                    </h4>
                    <p className="text-sm text-red-600 font-medium mb-2">
                      {item.company}{" "}
                      <span className="text-slate-300 px-2">•</span>{" "}
                      {item.duration}
                    </p>
                    {item.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExperience(experience.filter((_, i) => i !== idx))
                    }
                    className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 5. EDUCATION */}
          <GlassCard>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200/50 pb-4">
              <GraduationCap className="text-blue-600" size={22} /> Education
            </h2>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 shadow-inner ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <GlassInput
                    value={eduForm.degree}
                    onChange={(e) =>
                      setEduForm({ ...eduForm, degree: e.target.value })
                    }
                    placeholder="Degree (e.g. B.Tech Computer Science)"
                  />
                </div>
                <div className="md:col-span-2">
                  <GlassInput
                    value={eduForm.university}
                    onChange={(e) =>
                      setEduForm({ ...eduForm, university: e.target.value })
                    }
                    placeholder="University / College"
                  />
                </div>
                <GlassInput
                  value={eduForm.started}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, started: e.target.value })
                  }
                  placeholder="Start Year"
                />
                <GlassInput
                  value={eduForm.ended}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, ended: e.target.value })
                  }
                  placeholder="End Year (or Expected)"
                />
                <div className="md:col-span-2">
                  <GlassInput
                    value={eduForm.CGPA}
                    onChange={(e) =>
                      setEduForm({ ...eduForm, CGPA: e.target.value })
                    }
                    placeholder="CGPA / Percentage"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 font-bold text-slate-700 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={18} /> Add Education
              </button>
            </div>
            <div className="space-y-4">
              {education.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-start backdrop-blur-md shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">
                      {item.degree}
                    </h4>
                    <p className="text-sm text-blue-700 font-medium mb-1">
                      {item.university}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {item.started} - {item.ended}{" "}
                      {item.CGPA && (
                        <span className="ml-2 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                          CGPA: {item.CGPA}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEducation(education.filter((_, i) => i !== idx))
                    }
                    className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 6. PROJECTS */}
          <GlassCard>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200/50 pb-4">
              <FileText className="text-blue-600" size={22} /> Projects
            </h2>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 shadow-inner ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <GlassInput
                  value={projForm.title}
                  onChange={(e) =>
                    setProjForm({ ...projForm, title: e.target.value })
                  }
                  placeholder="Project Title"
                />
                <GlassInput
                  value={projForm.link}
                  onChange={(e) =>
                    setProjForm({ ...projForm, link: e.target.value })
                  }
                  placeholder="Project URL"
                />
                <div className="md:col-span-2">
                  <GlassInput
                    value={projForm.technologies}
                    onChange={(e) =>
                      setProjForm({ ...projForm, technologies: e.target.value })
                    }
                    placeholder="Technologies Used"
                  />
                </div>
                <div className="md:col-span-2">
                  <textarea
                    value={projForm.description}
                    onChange={(e) =>
                      setProjForm({ ...projForm, description: e.target.value })
                    }
                    placeholder="Description"
                    rows={3}
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 text-slate-900 placeholder-slate-400 transition-all resize-none shadow-sm "
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddProject}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 font-bold text-slate-700 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={18} /> Add Project
              </button>
            </div>
            <div className="space-y-4">
              {projects.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-start backdrop-blur-md shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-sm text-rose-600 font-medium my-1">
                      {item.technologies}
                    </p>
                    {item.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setProjects(projects.filter((_, i) => i !== idx))
                    }
                    className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 7. CERTIFICATIONS */}
          <GlassCard>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200/50 pb-4">
              <Award className="text-blue-600" size={22} /> Certifications
            </h2>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 shadow-inner ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <GlassInput
                    value={certForm.name}
                    onChange={(e) =>
                      setCertForm({ ...certForm, name: e.target.value })
                    }
                    placeholder="Certification Name"
                  />
                </div>
                <GlassInput
                  value={certForm.issuer}
                  onChange={(e) =>
                    setCertForm({ ...certForm, issuer: e.target.value })
                  }
                  placeholder="Issuer"
                />
                <GlassInput
                  value={certForm.year}
                  onChange={(e) =>
                    setCertForm({ ...certForm, year: e.target.value })
                  }
                  placeholder="Year"
                />
                <div className="md:col-span-2">
                  <GlassInput
                    value={certForm.link}
                    onChange={(e) =>
                      setCertForm({ ...certForm, link: e.target.value })
                    }
                    placeholder="Credential URL"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddCert}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 font-bold text-slate-700 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={18} /> Add Certification
              </button>
            </div>
            <div className="space-y-4">
              {certifications.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-start backdrop-blur-md shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">
                      {item.name}
                    </h4>
                    <p className="text-sm text-red-600 font-medium mb-1">
                      {item.issuer}{" "}
                      <span className="text-slate-300 px-1">•</span> {item.year}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCertifications(
                        certifications.filter((_, i) => i !== idx),
                      )
                    }
                    className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 8. ONLINE PRESENCE */}
          <GlassCard>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200/50 pb-4">
              <Globe className="text-blue-600" size={22} /> Online Presence
            </h2>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 shadow-inner ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <GlassInput
                  value={linkForm.platform}
                  onChange={(e) =>
                    setLinkForm({ ...linkForm, platform: e.target.value })
                  }
                  placeholder="Platform (e.g. GitHub)"
                />
                <GlassInput
                  value={linkForm.url}
                  onChange={(e) =>
                    setLinkForm({ ...linkForm, url: e.target.value })
                  }
                  placeholder="URL"
                />
              </div>
              <button
                type="button"
                onClick={handleAddLink}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 font-bold text-slate-700 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={18} /> Add Link
              </button>
            </div>
            <div className="space-y-4">
              {portfolioLinks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white border border-slate-200 rounded-xl flex justify-between items-center backdrop-blur-md shadow-sm"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900">
                      {item.platform}
                    </h4>
                    <p className="text-sm text-blue-700 truncate mt-0.5">
                      {item.url}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPortfolioLinks(
                        portfolioLinks.filter((_, i) => i !== idx),
                      )
                    }
                    className="text-slate-400 hover:text-blue-600 transition-colors p-2 shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 9. VOLUNTEERING */}
          <GlassCard>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200/50 pb-4">
              <HeartHandshake className="text-blue-600" size={22} />{" "}
              Volunteering
            </h2>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 shadow-inner ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <GlassInput
                    value={volForm.organization}
                    onChange={(e) =>
                      setVolForm({ ...volForm, organization: e.target.value })
                    }
                    placeholder="Organization"
                  />
                </div>
                <GlassInput
                  value={volForm.role}
                  onChange={(e) =>
                    setVolForm({ ...volForm, role: e.target.value })
                  }
                  placeholder="Role"
                />
                <GlassInput
                  value={volForm.duration}
                  onChange={(e) =>
                    setVolForm({ ...volForm, duration: e.target.value })
                  }
                  placeholder="Duration"
                />
                <div className="md:col-span-2">
                  <textarea
                    value={volForm.description}
                    onChange={(e) =>
                      setVolForm({ ...volForm, description: e.target.value })
                    }
                    placeholder="Description"
                    rows={3}
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 text-slate-900 placeholder-slate-400 transition-all resize-none shadow-sm "
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddVol}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 font-bold text-slate-700 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={18} /> Add Volunteering
              </button>
            </div>
            <div className="space-y-4">
              {volunteering.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white border border-slate-200 rounded-2xl flex justify-between items-start backdrop-blur-md shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">
                      {item.organization}
                    </h4>
                    <p className="text-sm text-rose-600 font-medium my-1">
                      {item.role} <span className="text-slate-300 px-1">•</span>{" "}
                      {item.duration}
                    </p>
                    {item.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setVolunteering(volunteering.filter((_, i) => i !== idx))
                    }
                    className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 pb-20">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-4 bg-white hover:bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl  transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || isParsing}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 border border-transparent text-white font-bold rounded-2xl flex justify-center items-center gap-2 transition-all shadow-md shadow-blue-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={20} />
              )}{" "}
              {saving ? "Saving..." : "Save & Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// FACT: Reusable Smart Glass Components for White Mode
const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white/40  border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] ${className}`}
  >
    {children}
  </div>
);

const InputGroup = ({ label, name, value, onChange, disabled = false }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
      {label}
    </label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 text-slate-900 placeholder-slate-400 transition-all shadow-sm ${disabled ? "opacity-60 bg-slate-100 cursor-not-allowed" : "bg-white"}`}
    />
  </div>
);

const GlassInput = ({ value, onChange, placeholder }) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 text-slate-900 placeholder-slate-400 transition-all shadow-sm"
  />
);
