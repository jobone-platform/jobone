import React, { useState } from "react";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  Layers,
  Award,
  Heart,
  Globe,
  PlusCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Copy,
  Info,
} from "lucide-react";
import {
  ACTION_VERBS,
  SKILL_CATEGORIES,
  SKILL_SUGGESTIONS,
  SECTION_METADATA,
} from "./ResumeConstants";

export default function ResumeEditorPanel({
  resumeData,
  onChange,
  activeSection,
  onSelectSection,
  onOpenATSModal,
  onOpenJobMatcher,
}) {
  const [expandedItems, setExpandedItems] = useState({});
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkillCategory, setSelectedSkillCategory] = useState("languages");
  const [showVerbCatalog, setShowVerbCatalog] = useState(false);
  const [targetBulletField, setTargetBulletField] = useState(null); // { section, index, bulletIndex }

  // Safe accessors
  const contact = resumeData.contact || {};
  const experience = resumeData.experience || [];
  const education = resumeData.education || [];
  const skills = resumeData.skills || [];
  const projects = resumeData.projects || [];
  const certifications = resumeData.certifications || [];
  const volunteering = resumeData.volunteering || [];
  const customSections = resumeData.customSections || [];
  const hiddenSections = resumeData.hiddenSections || [];
  const sectionOrder = resumeData.sectionOrder || [
    "personal",
    "summary",
    "experience",
    "skills",
    "projects",
    "education",
    "certifications",
    "volunteering",
  ];

  // Helper updater
  const updateResume = (updater) => {
    onChange((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  };

  // Toggle item expansion
  const toggleExpand = (key) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Visibility toggle
  const toggleSectionVisibility = (secKey) => {
    updateResume((prev) => {
      const currentHidden = prev.hiddenSections || [];
      const isHidden = currentHidden.includes(secKey);
      const nextHidden = isHidden
        ? currentHidden.filter((s) => s !== secKey)
        : [...currentHidden, secKey];
      return { ...prev, hiddenSections: nextHidden };
    });
  };

  // Section reordering
  const moveSection = (secKey, direction) => {
    updateResume((prev) => {
      const current = [...(prev.sectionOrder || sectionOrder)];
      const idx = current.indexOf(secKey);
      if (idx === -1) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= current.length) return prev;
      const temp = current[idx];
      current[idx] = current[targetIdx];
      current[targetIdx] = temp;
      return { ...prev, sectionOrder: current };
    });
  };

  // Contact Field Change
  const handleContactChange = (field, value) => {
    updateResume((prev) => ({
      ...prev,
      contact: { ...(prev.contact || {}), [field]: value },
    }));
  };

  // Skill Add / Remove
  const handleAddSkill = (skillName) => {
    const trimmed = (skillName || skillInput).trim();
    if (!trimmed) return;
    const exists = skills.some(
      (s) => (typeof s === "string" ? s : s.name).toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return;

    updateResume((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), trimmed],
    }));
    setSkillInput("");
  };

  const handleRemoveSkill = (skillItem) => {
    const targetName = typeof skillItem === "string" ? skillItem : skillItem.name;
    updateResume((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter(
        (s) => (typeof s === "string" ? s : s.name) !== targetName
      ),
    }));
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      role: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      bullets: [""],
    };
    updateResume((prev) => ({
      ...prev,
      experience: [newExp, ...(prev.experience || [])],
    }));
    toggleExpand(`exp_${newExp.id}`);
  };

  const handleUpdateExperience = (idx, field, value) => {
    updateResume((prev) => {
      const list = [...(prev.experience || [])];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, experience: list };
    });
  };

  const handleDeleteExperience = (idx) => {
    updateResume((prev) => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== idx),
    }));
  };

  // Bullets for Experience
  const handleAddExpBullet = (expIdx) => {
    updateResume((prev) => {
      const list = [...(prev.experience || [])];
      const curBullets = list[expIdx]?.bullets || [];
      list[expIdx] = { ...list[expIdx], bullets: [...curBullets, ""] };
      return { ...prev, experience: list };
    });
  };

  const handleUpdateExpBullet = (expIdx, bulletIdx, value) => {
    updateResume((prev) => {
      const list = [...(prev.experience || [])];
      const curBullets = [...(list[expIdx]?.bullets || [])];
      curBullets[bulletIdx] = value;
      list[expIdx] = { ...list[expIdx], bullets: curBullets };
      return { ...prev, experience: list };
    });
  };

  const handleDeleteExpBullet = (expIdx, bulletIdx) => {
    updateResume((prev) => {
      const list = [...(prev.experience || [])];
      const curBullets = (list[expIdx]?.bullets || []).filter((_, i) => i !== bulletIdx);
      list[expIdx] = { ...list[expIdx], bullets: curBullets };
      return { ...prev, experience: list };
    });
  };

  // Projects handlers
  const handleAddProject = () => {
    const newProj = {
      id: Date.now().toString(),
      title: "",
      technologies: "",
      link: "",
      github: "",
      date: "",
      description: "",
      bullets: [""],
    };
    updateResume((prev) => ({
      ...prev,
      projects: [newProj, ...(prev.projects || [])],
    }));
    toggleExpand(`proj_${newProj.id}`);
  };

  const handleUpdateProject = (idx, field, value) => {
    updateResume((prev) => {
      const list = [...(prev.projects || [])];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, projects: list };
    });
  };

  const handleDeleteProject = (idx) => {
    updateResume((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== idx),
    }));
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
      grade: "",
      description: "",
    };
    updateResume((prev) => ({
      ...prev,
      education: [newEdu, ...(prev.education || [])],
    }));
    toggleExpand(`edu_${newEdu.id}`);
  };

  const handleUpdateEducation = (idx, field, value) => {
    updateResume((prev) => {
      const list = [...(prev.education || [])];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, education: list };
    });
  };

  const handleDeleteEducation = (idx) => {
    updateResume((prev) => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== idx),
    }));
  };

  // Certifications handlers
  const handleAddCertification = () => {
    const newCert = {
      id: Date.now().toString(),
      name: "",
      issuer: "",
      date: "",
      link: "",
    };
    updateResume((prev) => ({
      ...prev,
      certifications: [newCert, ...(prev.certifications || [])],
    }));
    toggleExpand(`cert_${newCert.id}`);
  };

  const handleUpdateCertification = (idx, field, value) => {
    updateResume((prev) => {
      const list = [...(prev.certifications || [])];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, certifications: list };
    });
  };

  const handleDeleteCertification = (idx) => {
    updateResume((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== idx),
    }));
  };

  // Volunteering handlers
  const handleAddVolunteering = () => {
    const newVol = {
      id: Date.now().toString(),
      role: "",
      organization: "",
      duration: "",
      description: "",
    };
    updateResume((prev) => ({
      ...prev,
      volunteering: [newVol, ...(prev.volunteering || [])],
    }));
    toggleExpand(`vol_${newVol.id}`);
  };

  const handleUpdateVolunteering = (idx, field, value) => {
    updateResume((prev) => {
      const list = [...(prev.volunteering || [])];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, volunteering: list };
    });
  };

  const handleDeleteVolunteering = (idx) => {
    updateResume((prev) => ({
      ...prev,
      volunteering: (prev.volunteering || []).filter((_, i) => i !== idx),
    }));
  };

  // Custom Sections handlers
  const handleAddCustomSection = () => {
    const title = window.prompt("Enter title for new resume section (e.g., Publications, Awards):");
    if (!title || !title.trim()) return;
    const newSec = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      items: [
        {
          id: Date.now().toString(),
          title: "",
          subtitle: "",
          date: "",
          description: "",
        },
      ],
    };
    updateResume((prev) => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSec],
      sectionOrder: [...(prev.sectionOrder || sectionOrder), newSec.id],
    }));
  };

  const handleDeleteCustomSection = (secId) => {
    if (!window.confirm("Remove this custom section?")) return;
    updateResume((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).filter((s) => s.id !== secId),
      sectionOrder: (prev.sectionOrder || []).filter((id) => id !== secId),
    }));
  };

  // Word count helper
  const getWordCount = (str) => (str ? str.trim().split(/\s+/).filter(Boolean).length : 0);

  // Quick Action Verb insertion
  const insertVerb = (verb) => {
    if (targetBulletField) {
      const { section, index, bulletIndex } = targetBulletField;
      if (section === "experience") {
        const cur = experience[index]?.bullets?.[bulletIndex] || "";
        const updated = cur ? `${verb} ${cur}` : `${verb} `;
        handleUpdateExpBullet(index, bulletIndex, updated);
      }
    } else if (activeSection === "summary") {
      const current = resumeData.summary || "";
      const updated = current ? `${current} ${verb}` : `${verb} `;
      updateResume({ summary: updated });
    }
    setShowVerbCatalog(false);
  };

  // Check section completion status
  const isSectionComplete = (key) => {
    switch (key) {
      case "personal":
        return Boolean(contact.name && contact.email && contact.title);
      case "summary":
        return Boolean(resumeData.summary && getWordCount(resumeData.summary) >= 20);
      case "experience":
        return experience.length > 0;
      case "skills":
        return skills.length >= 5;
      case "projects":
        return projects.length > 0;
      case "education":
        return education.length > 0;
      case "certifications":
        return certifications.length > 0;
      case "volunteering":
        return volunteering.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Navigation Pills Bar */}
      <div className="px-3 py-2 bg-surface-elevated/40 border-b border-border flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
        {[
          { id: "personal", label: "Contact", icon: User },
          { id: "summary", label: "Summary", icon: FileText },
          { id: "experience", label: "Experience", icon: Briefcase },
          { id: "skills", label: "Skills", icon: Sparkles },
          { id: "projects", label: "Projects", icon: Layers },
          { id: "education", label: "Education", icon: GraduationCap },
          { id: "certifications", label: "Certifications", icon: Award },
          { id: "volunteering", label: "Volunteering", icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isComplete = isSectionComplete(tab.id);
          const isHidden = hiddenSections.includes(tab.id);
          const isActive = activeSection === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSection(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-silver/20 text-foreground border border-silver/40 shadow-sm"
                  : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
              } ${isHidden ? "opacity-50 line-through" : ""}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {isComplete && !isHidden && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              )}
            </button>
          );
        })}

        {/* Custom Sections Pills */}
        {customSections.map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelectSection(sec.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeSection === sec.id
                ? "bg-silver/20 text-foreground border border-silver/40"
                : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
            }`}
          >
            <span>{sec.title}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={handleAddCustomSection}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-silver hover:bg-surface-elevated transition-colors whitespace-nowrap"
          title="Add Custom Resume Section"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Section</span>
        </button>
      </div>

      {/* Editor Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
        {/* ========================================================================= */}
        {/* 1. CONTACT INFORMATION */}
        {/* ========================================================================= */}
        {activeSection === "personal" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-silver" />
                  <span>Contact & Identification</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Essential identification fields used by applicant tracking algorithms.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={contact.name || ""}
                  onChange={(e) => handleContactChange("name", e.target.value)}
                  placeholder="e.g. Alex Henderson"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-silver/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Professional Headline / Target Role <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={contact.title || ""}
                  onChange={(e) => handleContactChange("title", e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-silver/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={contact.email || ""}
                  onChange={(e) => handleContactChange("email", e.target.value)}
                  placeholder="alex.henderson@example.com"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-silver/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contact.phone || ""}
                  onChange={(e) => handleContactChange("phone", e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-silver/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Location (City, Country / Remote)
                </label>
                <input
                  type="text"
                  value={contact.location || ""}
                  onChange={(e) => handleContactChange("location", e.target.value)}
                  placeholder="San Francisco, CA (or Remote)"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-silver/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Personal Portfolio / Website URL
                </label>
                <input
                  type="url"
                  value={contact.website || ""}
                  onChange={(e) => handleContactChange("website", e.target.value)}
                  placeholder="https://alexhenderson.dev"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-silver/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={contact.linkedin || ""}
                  onChange={(e) => handleContactChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/alexhenderson"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-silver/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={contact.github || ""}
                  onChange={(e) => handleContactChange("github", e.target.value)}
                  placeholder="https://github.com/alexhenderson"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-silver/60"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. EXECUTIVE SUMMARY */}
        {/* ========================================================================= */}
        {activeSection === "summary" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-silver" />
                  <span>Executive Summary</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A high-impact narrative summarizing your domain expertise, engineering focus, and key wins.
                </p>
              </div>

              {/* Action Verb Helper Button */}
              <button
                type="button"
                onClick={() => {
                  setTargetBulletField(null);
                  setShowVerbCatalog(!showVerbCatalog);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-xs text-silver font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Action Verbs</span>
              </button>
            </div>

            {/* Quick Verb Chips */}
            {showVerbCatalog && (
              <div className="p-3 bg-surface-elevated border border-border rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Click a verb to insert:</span>
                  <button
                    type="button"
                    onClick={() => setShowVerbCatalog(false)}
                    className="hover:text-foreground text-[11px]"
                  >
                    Close
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                  {ACTION_VERBS.slice(0, 30).map((verb) => (
                    <button
                      key={verb}
                      type="button"
                      onClick={() => insertVerb(verb)}
                      className="px-2 py-0.5 rounded-md bg-surface border border-border hover:border-silver text-xs text-foreground hover:text-silver transition-colors"
                    >
                      {verb}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Summary Content</span>
                <span className="font-mono">
                  {getWordCount(resumeData.summary)} words / {(resumeData.summary || "").length} chars
                  <span className="ml-1 text-[11px] opacity-70">(Recommended: 30–100 words)</span>
                </span>
              </div>
              <textarea
                rows={6}
                value={resumeData.summary || ""}
                onChange={(e) => updateResume({ summary: e.target.value })}
                placeholder="Senior Full Stack Software Engineer with 6+ years of experience architecting high-scale distributed systems and cloud-native microservices. Passionate about developer tooling, real-time data streaming, and web performance optimization..."
                className="w-full bg-surface-elevated border border-border rounded-xl p-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-silver/60 leading-relaxed"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-surface-elevated/60 border border-border/60 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-silver shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">ATS Best Practice:</strong> Avoid first-person pronouns
                ("I", "me", "my"). Instead, structure your summary around role title, primary tech stack, years of
                impact, and 2-3 standout engineering achievements.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. WORK EXPERIENCE */}
        {/* ========================================================================= */}
        {activeSection === "experience" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-silver" />
                  <span>Work Experience</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reverse chronological employment history with measurable impact bullets.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddExperience}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-silver text-black font-semibold text-xs hover:bg-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            {experience.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl">
                <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-foreground">No employment history added yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Add full-time roles, contracts, or internships to demonstrate your track record.
                </p>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-silver text-black font-semibold text-xs hover:bg-white inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Role</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {experience.map((exp, idx) => {
                  const itemKey = `exp_${exp.id || idx}`;
                  const isExpanded = expandedItems[itemKey] !== false; // default expanded

                  return (
                    <div
                      key={exp.id || idx}
                      className="border border-border rounded-2xl bg-surface-elevated/40 overflow-hidden transition-all"
                    >
                      {/* Item Header / Accordion */}
                      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-surface-elevated/80 border-b border-border">
                        <div
                          className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                          onClick={() => toggleExpand(itemKey)}
                        >
                          <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-silver shrink-0">
                            <Briefcase className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <h3 className="text-sm font-semibold text-foreground truncate">
                              {exp.role || "Untitled Role"}
                              {exp.company && (
                                <span className="text-muted-foreground font-normal">
                                  {" "}
                                  at {exp.company}
                                </span>
                              )}
                            </h3>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {exp.startDate || "Start"} —{" "}
                              {exp.current ? "Present" : exp.endDate || "End"}
                              {exp.location && ` • ${exp.location}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleExpand(itemKey)}
                            className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExperience(idx)}
                            className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-rose-400"
                            title="Delete Position"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Item Fields */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Job Title <span className="text-rose-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={exp.role || ""}
                                onChange={(e) => handleUpdateExperience(idx, "role", e.target.value)}
                                placeholder="e.g. Senior Software Engineer"
                                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Company / Organization <span className="text-rose-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={exp.company || ""}
                                onChange={(e) => handleUpdateExperience(idx, "company", e.target.value)}
                                placeholder="e.g. Stripe, Acme Corp"
                                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Location
                              </label>
                              <input
                                type="text"
                                value={exp.location || ""}
                                onChange={(e) => handleUpdateExperience(idx, "location", e.target.value)}
                                placeholder="e.g. San Francisco, CA (Hybrid)"
                                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                              />
                            </div>

                            <div className="flex items-end gap-2">
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                  Start Date
                                </label>
                                <input
                                  type="text"
                                  value={exp.startDate || ""}
                                  onChange={(e) => handleUpdateExperience(idx, "startDate", e.target.value)}
                                  placeholder="e.g. Jan 2022"
                                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                                />
                              </div>

                              <div className="flex-1">
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                  End Date
                                </label>
                                <input
                                  type="text"
                                  disabled={exp.current}
                                  value={exp.current ? "Present" : exp.endDate || ""}
                                  onChange={(e) => handleUpdateExperience(idx, "endDate", e.target.value)}
                                  placeholder="e.g. Present or Dec 2024"
                                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60 disabled:opacity-50"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`curr_${exp.id || idx}`}
                              checked={Boolean(exp.current)}
                              onChange={(e) => handleUpdateExperience(idx, "current", e.target.checked)}
                              className="rounded border-border bg-surface text-silver focus:ring-silver/40"
                            />
                            <label
                              htmlFor={`curr_${exp.id || idx}`}
                              className="text-xs text-foreground cursor-pointer select-none"
                            >
                              I currently work in this position
                            </label>
                          </div>

                          {/* Bullet Points with Action Verb Support */}
                          <div className="space-y-2 pt-2 border-t border-border">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <span>Achievements & Responsibilities (Bullet Points)</span>
                                <span className="text-[10px] text-silver font-normal">
                                  (Quantify with numbers & metrics)
                                </span>
                              </label>

                              <button
                                type="button"
                                onClick={() => handleAddExpBullet(idx)}
                                className="text-xs text-silver hover:underline flex items-center gap-1 font-medium"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Bullet</span>
                              </button>
                            </div>

                            <div className="space-y-2">
                              {(exp.bullets || (exp.description ? [exp.description] : [""])).map(
                                (bullet, bIdx) => (
                                  <div key={bIdx} className="flex items-start gap-2">
                                    <span className="text-xs text-muted-foreground pt-2.5 select-none">
                                      •
                                    </span>
                                    <textarea
                                      rows={2}
                                      value={bullet}
                                      onChange={(e) => handleUpdateExpBullet(idx, bIdx, e.target.value)}
                                      placeholder="Architected and deployed microservices reducing API latency by 45% across 2M daily requests..."
                                      className="flex-1 bg-surface border border-border rounded-xl p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-silver/60 leading-relaxed"
                                    />
                                    <div className="flex flex-col gap-1 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setTargetBulletField({
                                            section: "experience",
                                            index: idx,
                                            bulletIndex: bIdx,
                                          });
                                          setShowVerbCatalog(true);
                                        }}
                                        title="Pick Action Verb"
                                        className="p-1 rounded hover:bg-surface text-muted-foreground hover:text-silver"
                                      >
                                        <Sparkles className="w-3.5 h-3.5" />
                                      </button>
                                      {(exp.bullets || []).length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteExpBullet(idx, bIdx)}
                                          title="Remove bullet"
                                          className="p-1 rounded hover:bg-surface text-muted-foreground hover:text-rose-400"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. SKILLS MATRIX */}
        {/* ========================================================================= */}
        {activeSection === "skills" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-silver" />
                  <span>Skills Matrix</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Targeted technical competencies parsed by automated applicant tracking filters.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenJobMatcher}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-xs text-silver font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Match Job Keywords</span>
              </button>
            </div>

            {/* Add Custom Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                placeholder="Type a skill and press Enter (e.g. Next.js, Kubernetes, PostgreSQL)..."
                className="flex-1 bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-silver/60"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-4 py-2 rounded-xl bg-silver text-black font-semibold text-xs hover:bg-white transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Current Active Skills */}
            <div className="p-4 bg-surface-elevated/50 border border-border rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  Active Resume Skills ({skills.length})
                </span>
                <span>{skills.length >= 8 ? "Optimal ATS Count" : "Add at least 8 skills"}</span>
              </div>

              {skills.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  No skills added. Click suggestions below or type custom skills above.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.map((skillItem, i) => {
                    const skillName = typeof skillItem === "string" ? skillItem : skillItem.name;
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-border text-xs text-foreground font-medium group hover:border-silver/50 transition-colors"
                      >
                        <span>{skillName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skillItem)}
                          className="text-muted-foreground hover:text-rose-400 transition-colors"
                          title="Remove skill"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Catalog Suggestions by Category */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Add from Catalog
                </h3>
              </div>

              {/* Category tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {SKILL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedSkillCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedSkillCategory === cat.id
                        ? "bg-silver/20 text-foreground border border-silver/40"
                        : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Category Suggestions */}
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-surface-elevated/40 border border-border/80">
                {(SKILL_SUGGESTIONS[selectedSkillCategory] || []).map((sugg) => {
                  const alreadyAdded = skills.some(
                    (s) => (typeof s === "string" ? s : s.name).toLowerCase() === sugg.toLowerCase()
                  );
                  return (
                    <button
                      key={sugg}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddSkill(sugg)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                        alreadyAdded
                          ? "bg-surface text-muted-foreground/50 border border-border/40 cursor-default"
                          : "bg-surface hover:bg-silver/20 text-foreground border border-border hover:border-silver/50"
                      }`}
                    >
                      {alreadyAdded ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Plus className="w-3 h-3 text-silver" />
                      )}
                      <span>{sugg}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. FEATURED PROJECTS */}
        {/* ========================================================================= */}
        {activeSection === "projects" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-silver" />
                  <span>Featured Projects</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showcase engineering projects, repositories, live URLs, and technical architecture.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddProject}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-silver text-black font-semibold text-xs hover:bg-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl">
                <Layers className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-foreground">No projects featured yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Adding 2-3 prominent side projects or open source contributions reinforces technical depth.
                </p>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-silver text-black font-semibold text-xs hover:bg-white inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Project</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((proj, idx) => {
                  const itemKey = `proj_${proj.id || idx}`;
                  const isExpanded = expandedItems[itemKey] !== false;

                  return (
                    <div
                      key={proj.id || idx}
                      className="border border-border rounded-2xl bg-surface-elevated/40 overflow-hidden"
                    >
                      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-surface-elevated/80 border-b border-border">
                        <div
                          className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                          onClick={() => toggleExpand(itemKey)}
                        >
                          <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-silver shrink-0">
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <h3 className="text-sm font-semibold text-foreground truncate">
                              {proj.title || "Untitled Project"}
                            </h3>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {proj.technologies || "Tech stack not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleExpand(itemKey)}
                            className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(idx)}
                            className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-rose-400"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 sm:p-5 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Project Title <span className="text-rose-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={proj.title || ""}
                                onChange={(e) => handleUpdateProject(idx, "title", e.target.value)}
                                placeholder="e.g. Distributed Task Queue"
                                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Technologies Used
                              </label>
                              <input
                                type="text"
                                value={proj.technologies || ""}
                                onChange={(e) =>
                                  handleUpdateProject(idx, "technologies", e.target.value)
                                }
                                placeholder="e.g. Go, Redis, Docker, gRPC"
                                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Live Demo URL
                              </label>
                              <input
                                type="url"
                                value={proj.link || ""}
                                onChange={(e) => handleUpdateProject(idx, "link", e.target.value)}
                                placeholder="https://myapp.demo.com"
                                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">
                                GitHub Repository URL
                              </label>
                              <input
                                type="url"
                                value={proj.github || ""}
                                onChange={(e) => handleUpdateProject(idx, "github", e.target.value)}
                                placeholder="https://github.com/user/project"
                                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Project Description & Architecture Highlights
                            </label>
                            <textarea
                              rows={3}
                              value={proj.description || ""}
                              onChange={(e) => handleUpdateProject(idx, "description", e.target.value)}
                              placeholder="Engineered an event-driven task distribution worker processing 50K concurrent jobs with zero data loss..."
                              className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-silver/60 leading-relaxed"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. EDUCATION */}
        {/* ========================================================================= */}
        {activeSection === "education" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-silver" />
                  <span>Education & Academics</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Degrees, institutions, honors, and graduation credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddEducation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-silver text-black font-semibold text-xs hover:bg-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            {education.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl">
                <GraduationCap className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-foreground">No academic history added</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Add college degrees, diplomas, or relevant academic background.
                </p>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-silver text-black font-semibold text-xs hover:bg-white inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Degree</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {education.map((edu, idx) => {
                  const itemKey = `edu_${edu.id || idx}`;
                  const isExpanded = expandedItems[itemKey] !== false;

                  return (
                    <div
                      key={edu.id || idx}
                      className="border border-border rounded-2xl bg-surface-elevated/40 overflow-hidden"
                    >
                      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-surface-elevated/80 border-b border-border">
                        <div
                          className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                          onClick={() => toggleExpand(itemKey)}
                        >
                          <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-silver shrink-0">
                            <GraduationCap className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <h3 className="text-sm font-semibold text-foreground truncate">
                              {edu.degree || "Untitled Degree"}
                            </h3>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {edu.school || "Institution not specified"}
                              {edu.endDate && ` • ${edu.endDate}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleExpand(itemKey)}
                            className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEducation(idx)}
                            className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-rose-400"
                            title="Delete Education"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 sm:p-5 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Degree / Certificate <span className="text-rose-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={edu.degree || ""}
                                onChange={(e) => handleUpdateEducation(idx, "degree", e.target.value)}
                                placeholder="e.g. B.S. in Computer Science"
                                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Institution / University <span className="text-rose-400">*</span>
                              </label>
                              <input
                                type="text"
                                value={edu.school || ""}
                                onChange={(e) => handleUpdateEducation(idx, "school", e.target.value)}
                                placeholder="e.g. Stanford University"
                                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-1">
                                Location
                              </label>
                              <input
                                type="text"
                                value={edu.location || ""}
                                onChange={(e) => handleUpdateEducation(idx, "location", e.target.value)}
                                placeholder="e.g. Stanford, CA"
                                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                  Graduation Date
                                </label>
                                <input
                                  type="text"
                                  value={edu.endDate || ""}
                                  onChange={(e) => handleUpdateEducation(idx, "endDate", e.target.value)}
                                  placeholder="e.g. May 2021"
                                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                  GPA / Honors
                                </label>
                                <input
                                  type="text"
                                  value={edu.grade || ""}
                                  onChange={(e) => handleUpdateEducation(idx, "grade", e.target.value)}
                                  placeholder="e.g. 3.8 / Magna Cum Laude"
                                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Relevant Coursework or Honors
                            </label>
                            <input
                              type="text"
                              value={edu.description || ""}
                              onChange={(e) => handleUpdateEducation(idx, "description", e.target.value)}
                              placeholder="e.g. Distributed Systems, Algorithms, Computer Architecture, Machine Learning"
                              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. CERTIFICATIONS */}
        {/* ========================================================================= */}
        {activeSection === "certifications" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-silver" />
                  <span>Certifications & Licenses</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Industry credentials, cloud certifications, and accredited licenses.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCertification}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-silver text-black font-semibold text-xs hover:bg-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Certificate</span>
              </button>
            </div>

            {certifications.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl">
                <Award className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-foreground">No certifications listed</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Adding AWS, GCP, Azure, or industry credentials increases your ATS credential score.
                </p>
                <button
                  type="button"
                  onClick={handleAddCertification}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-silver text-black font-semibold text-xs hover:bg-white inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Credential</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {certifications.map((cert, idx) => {
                  const itemKey = `cert_${cert.id || idx}`;
                  const isExpanded = expandedItems[itemKey] !== false;

                  return (
                    <div
                      key={cert.id || idx}
                      className="border border-border rounded-2xl bg-surface-elevated/40 overflow-hidden"
                    >
                      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-surface-elevated/80 border-b border-border">
                        <div
                          className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                          onClick={() => toggleExpand(itemKey)}
                        >
                          <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-silver shrink-0">
                            <Award className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <h3 className="text-sm font-semibold text-foreground truncate">
                              {cert.name || "Untitled Certification"}
                            </h3>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {cert.issuer || "Issuing Body"}
                              {cert.date && ` • ${cert.date}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleExpand(itemKey)}
                            className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCertification(idx)}
                            className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-rose-400"
                            title="Delete Certification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Certification Name <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={cert.name || ""}
                              onChange={(e) => handleUpdateCertification(idx, "name", e.target.value)}
                              placeholder="e.g. AWS Certified Solutions Architect"
                              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Issuing Organization
                            </label>
                            <input
                              type="text"
                              value={cert.issuer || ""}
                              onChange={(e) => handleUpdateCertification(idx, "issuer", e.target.value)}
                              placeholder="e.g. Amazon Web Services"
                              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Issue Date
                            </label>
                            <input
                              type="text"
                              value={cert.date || ""}
                              onChange={(e) => handleUpdateCertification(idx, "date", e.target.value)}
                              placeholder="e.g. Aug 2023"
                              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">
                              Credential ID or URL
                            </label>
                            <input
                              type="url"
                              value={cert.link || ""}
                              onChange={(e) => handleUpdateCertification(idx, "link", e.target.value)}
                              placeholder="https://credly.com/badges/..."
                              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 8. VOLUNTEERING & LEADERSHIP */}
        {/* ========================================================================= */}
        {activeSection === "volunteering" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4 text-silver" />
                  <span>Volunteering & Leadership</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Community initiatives, open-source mentoring, and leadership experience.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddVolunteering}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-silver text-black font-semibold text-xs hover:bg-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Initiative</span>
              </button>
            </div>

            {volunteering.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl">
                <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-foreground">No volunteering entries added</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Highlight non-profit involvement, community coaching, or university clubs.
                </p>
                <button
                  type="button"
                  onClick={handleAddVolunteering}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-silver text-black font-semibold text-xs hover:bg-white inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Initiative</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {volunteering.map((vol, idx) => (
                  <div
                    key={vol.id || idx}
                    className="border border-border rounded-2xl bg-surface-elevated/40 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        Initiative #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteVolunteering(idx)}
                        className="text-muted-foreground hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Role / Title
                        </label>
                        <input
                          type="text"
                          value={vol.role || ""}
                          onChange={(e) => handleUpdateVolunteering(idx, "role", e.target.value)}
                          placeholder="e.g. Technical Mentor"
                          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Organization
                        </label>
                        <input
                          type="text"
                          value={vol.organization || ""}
                          onChange={(e) =>
                            handleUpdateVolunteering(idx, "organization", e.target.value)
                          }
                          placeholder="e.g. Code2040, Girls Who Code"
                          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Description / Contribution
                      </label>
                      <textarea
                        rows={2}
                        value={vol.description || ""}
                        onChange={(e) =>
                          handleUpdateVolunteering(idx, "description", e.target.value)
                        }
                        placeholder="Mentored 15 junior developers in modern React and cloud architecture..."
                        className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-silver/60"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 9. CUSTOM SECTION HANDLER */}
        {/* ========================================================================= */}
        {customSections.map((sec) => {
          if (activeSection !== sec.id) return null;

          return (
            <div key={sec.id} className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-silver" />
                    <span>{sec.title}</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Custom resume section tailored to your domain.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updatedItems = [
                        ...(sec.items || []),
                        {
                          id: Date.now().toString(),
                          title: "",
                          subtitle: "",
                          date: "",
                          description: "",
                        },
                      ];
                      updateResume((prev) => ({
                        ...prev,
                        customSections: (prev.customSections || []).map((s) =>
                          s.id === sec.id ? { ...s, items: updatedItems } : s
                        ),
                      }));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-silver text-black font-semibold text-xs hover:bg-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCustomSection(sec.id)}
                    className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-rose-400"
                    title="Delete Custom Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {(sec.items || []).map((item, itemIdx) => (
                  <div
                    key={item.id || itemIdx}
                    className="p-4 rounded-2xl bg-surface-elevated/40 border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        Item #{itemIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedItems = (sec.items || []).filter((_, i) => i !== itemIdx);
                          updateResume((prev) => ({
                            ...prev,
                            customSections: (prev.customSections || []).map((s) =>
                              s.id === sec.id ? { ...s, items: updatedItems } : s
                            ),
                          }));
                        }}
                        className="text-muted-foreground hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={item.title || ""}
                          onChange={(e) => {
                            const updatedItems = [...(sec.items || [])];
                            updatedItems[itemIdx] = { ...item, title: e.target.value };
                            updateResume((prev) => ({
                              ...prev,
                              customSections: (prev.customSections || []).map((s) =>
                                s.id === sec.id ? { ...s, items: updatedItems } : s
                              ),
                            }));
                          }}
                          placeholder="e.g. Scalable Microservices Architecture Paper"
                          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Subtitle / Organization / Date
                        </label>
                        <input
                          type="text"
                          value={item.subtitle || ""}
                          onChange={(e) => {
                            const updatedItems = [...(sec.items || [])];
                            updatedItems[itemIdx] = { ...item, subtitle: e.target.value };
                            updateResume((prev) => ({
                              ...prev,
                              customSections: (prev.customSections || []).map((s) =>
                                s.id === sec.id ? { ...s, items: updatedItems } : s
                              ),
                            }));
                          }}
                          placeholder="e.g. IEEE Journal • 2023"
                          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-silver/60"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={item.description || ""}
                        onChange={(e) => {
                          const updatedItems = [...(sec.items || [])];
                          updatedItems[itemIdx] = { ...item, description: e.target.value };
                          updateResume((prev) => ({
                            ...prev,
                            customSections: (prev.customSections || []).map((s) =>
                              s.id === sec.id ? { ...s, items: updatedItems } : s
                            ),
                          }));
                        }}
                        placeholder="Details about the publication, patent, award, or accomplishment..."
                        className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-silver/60"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

