import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Loader2,
  MapPin,
  Mail,
  Phone,
  User as UserIcon,
  Briefcase,
  Award,
  FileText,
  Edit,
  GraduationCap,
  Link as LinkIcon,
  ExternalLink,
  ChevronRight,
  Globe,
} from "lucide-react";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

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
        const id = storedUser?.userId;

        if (!storedUser?.token || !id) {
          navigate("/login");
          return;
        }

        const { data } = await axios.get(
          `https://jobone-mrpy.onrender.com/user/${id}`,
          { headers: { Authorization: `Bearer ${storedUser.token}` } },
        );

        // Safe Parse function
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
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [location, navigate]);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-500 font-bold animate-pulse">
            Loading your professional profile...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* --- HERO SECTION (Glassmorphic) --- */}
      <div className="relative bg-slate-900 overflow-hidden pt-24 pb-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[100px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-600/20 blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group">
              <img
                src={
                  profile.profilePicture ||
                  (profile.gender === "Female"
                    ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                    : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                }
                alt="Profile"
                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-2 border-white/10 shadow-2xl bg-slate-800"
              />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20"></div>
            </div>

            <div className="flex-1 text-center md:text-left pt-2">
              <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold tracking-widest uppercase mb-3">
                Professional Profile
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                {profile.name}
              </h1>
              <p className="text-slate-300 text-lg mb-6 max-w-2xl leading-relaxed">
                {profile.title || "Job Seeker"}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-slate-400">
                {profile.location && (
                  <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                    <MapPin size={16} className="text-rose-400" />{" "}
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                  <Mail size={16} className="text-blue-400" /> {profile.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                    <Phone size={16} className="text-emerald-400" />{" "}
                    {profile.phone}
                  </span>
                )}
                {profile.gender && (
                  <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                    <UserIcon size={16} className="text-purple-400" />{" "}
                    {profile.gender}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto mt-4 md:mt-0">
              <button
                onClick={() => navigate("/editprofile")}
                className="w-full md:w-auto px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95"
              >
                <Edit size={18} /> Edit Profile
              </button>
              <button
                onClick={() => navigate("/jobseeker-documents")}
                className="w-full md:w-auto px-6 py-3 bg-indigo-600/90 text-white border border-indigo-500 rounded-xl font-bold hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:scale-105 active:scale-95"
              >
                <FileText size={18} className="text-indigo-300" /> My Documents
              </button>
              {(profile.resume || profile.resumeFileKey) && (
                <button
                  onClick={async () => {
                    if (profile.resume) {
                      window.open(profile.resume, "_blank");
                    } else if (profile.resumeFileKey) {
                      try {
                        const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
                        const { data } = await axios.get(`https://jobone-mrpy.onrender.com/user/${profile._id}/resume/view`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        if (data.viewableUrl) {
                          window.open(data.viewableUrl, "_blank");
                        }
                      } catch (e) {
                        console.error(e);
                        alert("Failed to load resume");
                      }
                    }
                  }}
                  className="w-full md:w-auto px-6 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={18} className="text-blue-400" /> View Resume
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 relative z-20 space-y-6">
        {/* TOP ROW: About & Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* About Me */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <UserIcon size={20} />
              </div>
              About Me
            </h2>
            <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
              {profile.description || (
                <span className="italic text-slate-400">
                  Update your profile to add a summary.
                </span>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6">
              <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                <Award size={20} />
              </div>
              Core Skills
            </h2>
            {profile.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyState text="No skills added." />
            )}
          </div>
        </div>

        {/* MIDDLE ROW: Experience & Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Experience Timeline */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Briefcase size={20} />
              </div>
              Experience
            </h2>
            {profile.experience?.length > 0 ? (
              <div className="space-y-6">
                {profile.experience.map((exp, i) => (
                  <div
                    key={i}
                    className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:bottom-auto last:before:h-full"
                  >
                    <div className="absolute left-[-5px] top-2 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-50"></div>
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                      <h3 className="text-base font-bold text-slate-900">
                        {exp.role}
                      </h3>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-extrabold uppercase tracking-widest rounded-md">
                        {exp.duration}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-indigo-600 mb-2">
                      {exp.company}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No experience added." />
            )}
          </div>

          {/* Projects */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <FileText size={20} />
              </div>
              Projects
            </h2>
            {profile.projects?.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {profile.projects.map((proj, i) => (
                  <div
                    key={i}
                    className="group p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {proj.title}
                      </h3>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-emerald-600"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No projects added." />
            )}
          </div>
        </div>

        {/* BOTTOM ROW: Education, Certs, Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Education */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                <GraduationCap size={20} />
              </div>
              Education
            </h2>
            {profile.education?.length > 0 ? (
              <div className="space-y-5">
                {profile.education.map((edu, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-rose-50/30 border border-rose-100/50"
                  >
                    <h3 className="font-bold text-slate-900 text-sm mb-1">
                      {edu.degree}
                    </h3>
                    <p className="text-xs font-semibold text-rose-600 mb-2">
                      {edu.university}
                    </p>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>
                        {edu.started} - {edu.ended}
                      </span>
                      {edu.CGPA && (
                        <span className="bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                          CGPA: {edu.CGPA}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No education listed." />
            )}
          </div>

          {/* Certifications & Volunteering */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <Award size={20} />
              </div>
              Achievements
            </h2>

            {/* Certifications */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Certifications
              </h3>
              {profile.certifications?.length > 0 ? (
                <div className="space-y-3">
                  {profile.certifications.map((cert, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {cert.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {cert.issuer} • {cert.year}
                        </p>
                      </div>
                      {cert.link && (
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white rounded-lg shadow-sm hover:text-amber-600 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">None added.</p>
              )}
            </div>

            {/* Volunteering */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Volunteering
              </h3>
              {profile.volunteering?.length > 0 ? (
                <div className="space-y-3">
                  {profile.volunteering.map((vol, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <p className="text-sm font-bold text-slate-800">
                        {vol.role}
                      </p>
                      <p className="text-xs text-slate-500 mb-1">
                        {vol.organization}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {vol.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">None added.</p>
              )}
            </div>
          </div>

          {/* Portfolio Links */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6">
              <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                <Globe size={20} />
              </div>
              Online Presence
            </h2>
            {profile.portfolioLinks?.length > 0 ? (
              <div className="space-y-3">
                {profile.portfolioLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 hover:shadow-sm transition-all group"
                  >
                    <span className="font-bold text-slate-700 group-hover:text-purple-700 transition-colors">
                      {link.platform}
                    </span>
                    <ChevronRight
                      size={16}
                      className="text-slate-400 group-hover:text-purple-600 transition-colors"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <EmptyState text="No links added." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---
function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
        <FileText size={20} className="text-slate-300" />
      </div>
      <p className="text-sm font-medium text-slate-500 text-center">{text}</p>
    </div>
  );
}

export default Profile;
