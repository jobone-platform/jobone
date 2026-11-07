import React from "react";
import { ExternalLink, Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

/**
 * Universal Resume Document Renderer supporting 5 ATS templates.
 * All templates enforce black-on-white high contrast print accuracy and selectable text.
 */
export default function ResumeDocumentRenderer({ resumeData, template = "classic" }) {
  if (!resumeData) return null;

  const {
    contact = {},
    summary = "",
    skills = [],
    experience = [],
    education = [],
    projects = [],
    certifications = [],
    achievements = [],
    volunteering = [],
    languages = [],
    customSections = [],
    hiddenSections = [],
  } = resumeData;

  const isHidden = (secId) => hiddenSections?.includes(secId);

  // Format skills as clean strings regardless of whether stored as object or string
  const formattedSkills = (skills || []).map((s) => (typeof s === "object" ? s.name : s)).filter(Boolean);

  // Switch between templates
  switch (template) {
    case "modern":
      return (
        <ModernTemplate
          contact={contact}
          summary={summary}
          skills={formattedSkills}
          experience={experience}
          education={education}
          projects={projects}
          certifications={certifications}
          achievements={achievements}
          volunteering={volunteering}
          languages={languages}
          customSections={customSections}
          isHidden={isHidden}
        />
      );
    case "minimal":
      return (
        <MinimalTemplate
          contact={contact}
          summary={summary}
          skills={formattedSkills}
          experience={experience}
          education={education}
          projects={projects}
          certifications={certifications}
          achievements={achievements}
          volunteering={volunteering}
          languages={languages}
          customSections={customSections}
          isHidden={isHidden}
        />
      );
    case "compact":
      return (
        <CompactTemplate
          contact={contact}
          summary={summary}
          skills={formattedSkills}
          experience={experience}
          education={education}
          projects={projects}
          certifications={certifications}
          achievements={achievements}
          volunteering={volunteering}
          languages={languages}
          customSections={customSections}
          isHidden={isHidden}
        />
      );
    case "academic":
      return (
        <AcademicTemplate
          contact={contact}
          summary={summary}
          skills={formattedSkills}
          experience={experience}
          education={education}
          projects={projects}
          certifications={certifications}
          achievements={achievements}
          volunteering={volunteering}
          languages={languages}
          customSections={customSections}
          isHidden={isHidden}
        />
      );
    case "classic":
    default:
      return (
        <ClassicTemplate
          contact={contact}
          summary={summary}
          skills={formattedSkills}
          experience={experience}
          education={education}
          projects={projects}
          certifications={certifications}
          achievements={achievements}
          volunteering={volunteering}
          languages={languages}
          customSections={customSections}
          isHidden={isHidden}
        />
      );
  }
}

/* ==========================================================================
   1. CLASSIC EXECUTIVE ATS TEMPLATE (Gold Standard Fortune 500 ATS Compatibility)
   ========================================================================== */
function ClassicTemplate({
  contact,
  summary,
  skills,
  experience,
  education,
  projects,
  certifications,
  achievements,
  volunteering,
  languages,
  customSections,
  isHidden,
}) {
  return (
    <div className="font-serif text-[12.5px] leading-relaxed text-black">
      {/* Header */}
      {!isHidden("personal") && (
        <header className="text-center border-b border-slate-400 pb-3.5 mb-4 avoid-break">
          <h1 className="text-2xl font-bold tracking-tight text-black uppercase font-sans">
            {contact.name || "CANDIDATE NAME"}
          </h1>
          {contact.title && (
            <p className="text-[12px] font-semibold text-slate-800 tracking-wide mt-0.5 font-sans">
              {contact.title}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-700 font-sans mt-2">
            {contact.location && <span>{contact.location}</span>}
            {contact.phone && <span>• {contact.phone}</span>}
            {contact.email && (
              <span>
                • <a href={`mailto:${contact.email}`} className="text-black hover:underline">{contact.email}</a>
              </span>
            )}
            {contact.linkedin && (
              <span>
                • <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-black hover:underline">LinkedIn</a>
              </span>
            )}
            {contact.github && (
              <span>
                • <a href={contact.github} target="_blank" rel="noreferrer" className="text-black hover:underline">GitHub</a>
              </span>
            )}
            {contact.website && (
              <span>
                • <a href={contact.website} target="_blank" rel="noreferrer" className="text-black hover:underline">Portfolio</a>
              </span>
            )}
          </div>
        </header>
      )}

      {/* Summary */}
      {!isHidden("summary") && summary && (
        <section className="mb-4 avoid-break">
          <h2 className="text-[11.5px] font-bold font-sans uppercase tracking-widest text-black border-b border-slate-300 pb-0.5 mb-1.5">
            Professional Summary
          </h2>
          <p className="text-slate-800 text-justify leading-relaxed whitespace-pre-wrap">{summary}</p>
        </section>
      )}

      {/* Core Competencies */}
      {!isHidden("skills") && skills.length > 0 && (
        <section className="mb-4 avoid-break">
          <h2 className="text-[11.5px] font-bold font-sans uppercase tracking-widest text-black border-b border-slate-300 pb-0.5 mb-1.5">
            Technical & Core Skills
          </h2>
          <p className="text-slate-800 leading-normal">{skills.join(" • ")}</p>
        </section>
      )}

      {/* Experience */}
      {!isHidden("experience") && experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11.5px] font-bold font-sans uppercase tracking-widest text-black border-b border-slate-300 pb-0.5 mb-2">
            Professional Experience
          </h2>
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={idx} className="space-y-1 avoid-break">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold font-sans text-black text-[13px]">{exp.role}</span>
                  <span className="text-[11px] font-mono text-slate-700">
                    {exp.duration || `${exp.startDate || ""} – ${exp.current ? "Present" : exp.endDate || ""}`}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-[11.5px] italic text-slate-800">
                  <span>{exp.company}</span>
                  {exp.location && <span className="text-[11px] not-italic text-slate-600">{exp.location}</span>}
                </div>

                {/* Bullets or Description */}
                {exp.bullets && exp.bullets.length > 0 ? (
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-[11.5px] text-slate-800 mt-1">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                ) : exp.description ? (
                  <p className="text-[11.5px] text-slate-800 leading-relaxed whitespace-pre-wrap pl-2.5 border-l border-slate-300">
                    {exp.description}
                  </p>
                ) : null}

                {exp.technologies && (
                  <p className="text-[10.5px] font-sans text-slate-600 pt-0.5">
                    <strong>Technologies:</strong> {Array.isArray(exp.technologies) ? exp.technologies.join(", ") : exp.technologies}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {!isHidden("projects") && projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11.5px] font-bold font-sans uppercase tracking-widest text-black border-b border-slate-300 pb-0.5 mb-2">
            Featured Technical Projects
          </h2>
          <div className="space-y-2.5">
            {projects.map((proj, idx) => (
              <div key={idx} className="space-y-0.5 avoid-break">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold font-sans text-black text-[12.5px]">{proj.title}</span>
                  {proj.technologies && (
                    <span className="text-[10.5px] font-mono text-slate-600">
                      [{typeof proj.technologies === "string" ? proj.technologies : proj.technologies.join(", ")}]
                    </span>
                  )}
                </div>
                {proj.link && (
                  <a href={proj.link} target="_blank" rel="noreferrer" className="text-[11px] font-sans text-slate-700 underline block">
                    {proj.link}
                  </a>
                )}
                {proj.bullets && proj.bullets.length > 0 ? (
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-[11.5px] text-slate-800 mt-0.5">
                    {proj.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                ) : proj.description ? (
                  <p className="text-[11.5px] text-slate-800 leading-relaxed">{proj.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {!isHidden("education") && education.length > 0 && (
        <section className="mb-4 avoid-break">
          <h2 className="text-[11.5px] font-bold font-sans uppercase tracking-widest text-black border-b border-slate-300 pb-0.5 mb-2">
            Education & Academic Credentials
          </h2>
          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={idx} className="flex items-baseline justify-between text-[12px] avoid-break">
                <div>
                  <span className="font-bold text-black">{edu.degree}</span>
                  <span className="text-slate-800"> — {edu.university}</span>
                  {edu.coursework && (
                    <p className="text-[11px] text-slate-600 italic">Coursework: {edu.coursework}</p>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-700 shrink-0 ml-2">
                  {edu.ended || edu.endDate || ""} {edu.CGPA ? `(${edu.CGPA})` : ""}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {!isHidden("certifications") && certifications.length > 0 && (
        <section className="mb-4 avoid-break">
          <h2 className="text-[11.5px] font-bold font-sans uppercase tracking-widest text-black border-b border-slate-300 pb-0.5 mb-1.5">
            Certifications & Licenses
          </h2>
          <div className="space-y-1.5">
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex items-baseline justify-between text-[11.5px] avoid-break">
                <div>
                  <span className="font-bold text-black">{cert.name}</span>
                  {cert.issuer && <span className="text-slate-700"> — {cert.issuer}</span>}
                </div>
                <span className="text-[11px] font-mono text-slate-600">{cert.year || cert.date || ""}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Honors & Achievements */}
      {!isHidden("achievements") && achievements.length > 0 && (
        <section className="mb-4 avoid-break">
          <h2 className="text-[11.5px] font-bold font-sans uppercase tracking-widest text-black border-b border-slate-300 pb-0.5 mb-1.5">
            Honors & Achievements
          </h2>
          <div className="space-y-1.5">
            {achievements.map((ach, idx) => (
              <div key={idx} className="text-[11.5px] avoid-break">
                <span className="font-bold text-black">{ach.title}</span>
                {ach.issuer && <span className="text-slate-700"> — {ach.issuer}</span>}
                {ach.date && <span className="text-[11px] font-mono text-slate-600"> ({ach.date})</span>}
                {ach.description && <p className="text-slate-700 leading-relaxed">{ach.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Volunteering */}
      {!isHidden("volunteering") && volunteering.length > 0 && (
        <section className="mb-4 avoid-break">
          <h2 className="text-[11.5px] font-bold font-sans uppercase tracking-widest text-black border-b border-slate-300 pb-0.5 mb-1.5">
            Volunteering & Leadership
          </h2>
          <div className="space-y-1.5">
            {volunteering.map((vol, idx) => (
              <div key={idx} className="flex items-baseline justify-between text-[11.5px] avoid-break">
                <div>
                  <span className="font-bold text-black">{vol.role}</span>
                  <span className="text-slate-700"> — {vol.organization}</span>
                  {vol.description && <p className="text-slate-700 text-[11px]">{vol.description}</p>}
                </div>
                <span className="text-[11px] font-mono text-slate-600">{vol.duration || ""}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {!isHidden("languages") && languages.length > 0 && (
        <section className="mb-4 avoid-break">
          <h2 className="text-[11.5px] font-bold font-sans uppercase tracking-widest text-black border-b border-slate-300 pb-0.5 mb-1.5">
            Languages
          </h2>
          <p className="text-slate-800 text-[11.5px]">
            {languages.map((l) => `${l.name} (${l.proficiency || "Fluent"})`).join(" • ")}
          </p>
        </section>
      )}

      {/* Custom Sections */}
      {customSections.map((cSec, sIdx) => {
        if (isHidden(`custom_${cSec.id || sIdx}`)) return null;
        return (
          <section key={sIdx} className="mb-4 avoid-break">
            <h2 className="text-[11.5px] font-bold font-sans uppercase tracking-widest text-black border-b border-slate-300 pb-0.5 mb-1.5">
              {cSec.heading || "Additional Information"}
            </h2>
            {cSec.description && <p className="text-slate-800 text-justify mb-2">{cSec.description}</p>}
            <div className="space-y-2">
              {(cSec.items || []).map((item, iIdx) => (
                <div key={iIdx} className="text-[11.5px]">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-black">{item.title}</span>
                    {item.date && <span className="text-[11px] font-mono text-slate-600">{item.date}</span>}
                  </div>
                  {item.subtitle && <p className="italic text-slate-700">{item.subtitle}</p>}
                  {item.text && <p className="text-slate-800">{item.text}</p>}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ==========================================================================
   2. MODERN EDITORIAL TEMPLATE (Contemporary Sans Serif with Bold Typography)
   ========================================================================== */
function ModernTemplate({
  contact,
  summary,
  skills,
  experience,
  education,
  projects,
  certifications,
  achievements,
  volunteering,
  languages,
  customSections,
  isHidden,
}) {
  return (
    <div className="font-sans text-[12px] leading-relaxed text-slate-900">
      {/* Header */}
      {!isHidden("personal") && (
        <header className="border-b-2 border-slate-950 pb-4 mb-4 avoid-break">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
              {contact.name || "CANDIDATE NAME"}
            </h1>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
              {contact.title || "Software Specialist"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 mt-2 font-mono">
            {contact.email && <span>{contact.email}</span>}
            {contact.phone && <span>• {contact.phone}</span>}
            {contact.location && <span>• {contact.location}</span>}
            {contact.linkedin && <span>• {contact.linkedin}</span>}
            {contact.github && <span>• {contact.github}</span>}
            {contact.website && <span>• {contact.website}</span>}
          </div>
        </header>
      )}

      {/* Summary */}
      {!isHidden("summary") && summary && (
        <section className="mb-4 avoid-break">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-1.5">
            Executive Summary
          </h2>
          <p className="text-slate-700 leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {!isHidden("skills") && skills.length > 0 && (
        <section className="mb-4 avoid-break">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-1.5">
            Core Competencies
          </h2>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {skills.map((s, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {!isHidden("experience") && experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2">
            Professional Experience
          </h2>
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={idx} className="space-y-1 avoid-break">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-950 text-[13px]">{exp.role}</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {exp.duration || `${exp.startDate || ""} – ${exp.current ? "Present" : exp.endDate || ""}`}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-[11.5px] text-slate-700 font-semibold">
                  <span>{exp.company}</span>
                  {exp.location && <span className="font-normal text-slate-500 text-[11px]">{exp.location}</span>}
                </div>
                {exp.bullets && exp.bullets.length > 0 ? (
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-[11.5px] text-slate-700 mt-1">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                ) : exp.description ? (
                  <p className="text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {!isHidden("projects") && projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2">
            Featured Projects
          </h2>
          <div className="space-y-2.5">
            {projects.map((proj, idx) => (
              <div key={idx} className="space-y-0.5 avoid-break">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-950">{proj.title}</span>
                  {proj.technologies && (
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {typeof proj.technologies === "string" ? proj.technologies : proj.technologies.join(", ")}
                    </span>
                  )}
                </div>
                {proj.description && <p className="text-[11.5px] text-slate-700">{proj.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {!isHidden("education") && education.length > 0 && (
        <section className="mb-4 avoid-break">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-1.5">
            {education.map((edu, idx) => (
              <div key={idx} className="flex items-baseline justify-between text-[11.5px] avoid-break">
                <div>
                  <span className="font-bold text-slate-950">{edu.degree}</span>
                  <span className="text-slate-600"> — {edu.university}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">{edu.ended || edu.endDate || ""}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {!isHidden("certifications") && certifications.length > 0 && (
        <section className="mb-3 avoid-break">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-1.5">
            Certifications
          </h2>
          <div className="space-y-1">
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex items-baseline justify-between text-[11.5px]">
                <span className="font-semibold text-slate-900">{cert.name} — {cert.issuer}</span>
                <span className="text-[10.5px] font-mono text-slate-500">{cert.year || cert.date}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ==========================================================================
   3. TECH MINIMAL TEMPLATE (Developer-centric Monospace Syntax)
   ========================================================================== */
function MinimalTemplate({
  contact,
  summary,
  skills,
  experience,
  education,
  projects,
  certifications,
  achievements,
  volunteering,
  languages,
  customSections,
  isHidden,
}) {
  return (
    <div className="font-mono text-[11.5px] leading-normal text-slate-950">
      {/* Header */}
      {!isHidden("personal") && (
        <header className="border-b border-dashed border-slate-400 pb-3 mb-4 avoid-break">
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            {contact.name || "CANDIDATE NAME"}
          </h1>
          <p className="text-[11px] text-slate-700 mt-0.5">
            {contact.title || "Software Specialist"} | {contact.location || "Remote"}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {[contact.email, contact.phone, contact.linkedin, contact.github, contact.website]
              .filter(Boolean)
              .join(" | ")}
          </p>
        </header>
      )}

      {/* Summary */}
      {!isHidden("summary") && summary && (
        <section className="mb-4 avoid-break">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-dashed border-slate-300 pb-0.5 mb-1">
            &gt; SUMMARY
          </h2>
          <p className="text-slate-800 leading-relaxed text-[11px]">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {!isHidden("skills") && skills.length > 0 && (
        <section className="mb-4 avoid-break">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-dashed border-slate-300 pb-0.5 mb-1">
            &gt; SKILLS
          </h2>
          <p className="text-slate-800 text-[11px]">{skills.join(" | ")}</p>
        </section>
      )}

      {/* Experience */}
      {!isHidden("experience") && experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-dashed border-slate-300 pb-0.5 mb-1.5">
            &gt; EXPERIENCE
          </h2>
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={idx} className="space-y-0.5 avoid-break">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900">{exp.role} @ {exp.company}</span>
                  <span className="text-[10.5px] text-slate-600">
                    [{exp.duration || `${exp.startDate || ""} – ${exp.endDate || ""}`}]
                  </span>
                </div>
                {exp.bullets && exp.bullets.length > 0 ? (
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-[11px] text-slate-800">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                ) : exp.description ? (
                  <p className="text-[11px] text-slate-800">{exp.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {!isHidden("projects") && projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-dashed border-slate-300 pb-0.5 mb-1.5">
            &gt; PROJECTS
          </h2>
          <div className="space-y-2">
            {projects.map((proj, idx) => (
              <div key={idx} className="avoid-break">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900">{proj.title}</span>
                  {proj.technologies && (
                    <span className="text-[10px] text-slate-600">[{proj.technologies}]</span>
                  )}
                </div>
                {proj.description && <p className="text-[11px] text-slate-800">{proj.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {!isHidden("education") && education.length > 0 && (
        <section className="mb-3 avoid-break">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-dashed border-slate-300 pb-0.5 mb-1">
            &gt; EDUCATION
          </h2>
          <div className="space-y-1 text-[11px]">
            {education.map((edu, idx) => (
              <div key={idx} className="flex items-baseline justify-between">
                <span>{edu.degree} — {edu.university}</span>
                <span className="text-[10px] text-slate-600">[{edu.ended || ""}]</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ==========================================================================
   4. COMPACT ATS TEMPLATE (High-Density Single-Page Optimization)
   ========================================================================== */
function CompactTemplate({
  contact,
  summary,
  skills,
  experience,
  education,
  projects,
  certifications,
  achievements,
  volunteering,
  languages,
  customSections,
  isHidden,
}) {
  return (
    <div className="font-sans text-[11px] leading-snug text-slate-900">
      {/* Header */}
      {!isHidden("personal") && (
        <header className="border-b border-slate-800 pb-2 mb-3 avoid-break">
          <div className="flex items-baseline justify-between">
            <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase">
              {contact.name || "CANDIDATE NAME"}
            </h1>
            <span className="text-[11px] font-bold text-slate-700">
              {contact.title || "Software Specialist"}
            </span>
          </div>
          <p className="text-[10px] text-slate-600 mt-0.5">
            {[contact.email, contact.phone, contact.location, contact.linkedin, contact.github]
              .filter(Boolean)
              .join(" • ")}
          </p>
        </header>
      )}

      {/* Summary */}
      {!isHidden("summary") && summary && (
        <section className="mb-2.5 avoid-break">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1">
            Summary
          </h2>
          <p className="text-slate-800 leading-tight">{summary}</p>
        </section>
      )}

      {/* Skills */}
      {!isHidden("skills") && skills.length > 0 && (
        <section className="mb-2.5 avoid-break">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1">
            Skills
          </h2>
          <p className="text-slate-800 leading-tight">{skills.join(" • ")}</p>
        </section>
      )}

      {/* Experience */}
      {!isHidden("experience") && experience.length > 0 && (
        <section className="mb-2.5">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Experience
          </h2>
          <div className="space-y-2">
            {experience.map((exp, idx) => (
              <div key={idx} className="avoid-break">
                <div className="flex items-baseline justify-between font-bold">
                  <span>{exp.role} <span className="font-normal text-slate-600">— {exp.company}</span></span>
                  <span className="text-[10px] font-mono font-normal text-slate-600">{exp.duration}</span>
                </div>
                {exp.description && <p className="text-slate-700 text-[10.5px] mt-0.5">{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {!isHidden("education") && education.length > 0 && (
        <section className="mb-2 avoid-break">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 mb-1">
            Education
          </h2>
          <div className="space-y-1">
            {education.map((edu, idx) => (
              <div key={idx} className="flex items-baseline justify-between text-[10.5px]">
                <span className="font-semibold">{edu.degree} — {edu.university}</span>
                <span className="font-mono text-slate-600 text-[10px]">{edu.ended}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ==========================================================================
   5. ACADEMIC CLASSIC TEMPLATE (Formal Editorial Structure for Research/Higher Ed)
   ========================================================================== */
function AcademicTemplate({
  contact,
  summary,
  skills,
  experience,
  education,
  projects,
  certifications,
  achievements,
  volunteering,
  languages,
  customSections,
  isHidden,
}) {
  return (
    <div className="font-serif text-[12px] leading-relaxed text-slate-950">
      {/* Header */}
      {!isHidden("personal") && (
        <header className="text-center border-b-2 border-slate-900 pb-4 mb-4 avoid-break">
          <h1 className="text-2xl font-bold tracking-tight text-black">
            {contact.name || "CANDIDATE NAME"}
          </h1>
          <p className="italic text-[12px] text-slate-800 mt-0.5 font-sans">
            {contact.title || "Research & Engineering Specialist"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-700 font-sans mt-2">
            {contact.email && <span>{contact.email}</span>}
            {contact.phone && <span>• {contact.phone}</span>}
            {contact.location && <span>• {contact.location}</span>}
            {contact.website && <span>• {contact.website}</span>}
          </div>
        </header>
      )}

      {/* Education First for Academic Template */}
      {!isHidden("education") && education.length > 0 && (
        <section className="mb-4 avoid-break">
          <h2 className="text-[12px] font-bold font-sans uppercase tracking-widest text-black border-b border-slate-300 pb-0.5 mb-2">
            Higher Education & Qualifications
          </h2>
          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={idx} className="text-[12px] avoid-break">
                <div className="flex items-baseline justify-between font-bold">
                  <span>{edu.degree}</span>
                  <span className="text-[11px] font-mono font-normal">{edu.ended}</span>
                </div>
                <p className="italic text-slate-700">{edu.university}</p>
                {edu.coursework && <p className="text-[11px] text-slate-600">Coursework: {edu.coursework}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Professional & Academic Experience */}
      {!isHidden("experience") && experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[12px] font-bold font-sans uppercase tracking-widest text-black border-b border-slate-300 pb-0.5 mb-2">
            Academic & Industry Appointments
          </h2>
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={idx} className="avoid-break space-y-0.5">
                <div className="flex items-baseline justify-between font-bold">
                  <span>{exp.role}</span>
                  <span className="text-[11px] font-mono font-normal">{exp.duration}</span>
                </div>
                <p className="italic text-slate-700">{exp.company}</p>
                {exp.description && <p className="text-[11.5px] text-slate-800 leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Publications / Projects */}
      {!isHidden("projects") && projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[12px] font-bold font-sans uppercase tracking-widest text-black border-b border-slate-300 pb-0.5 mb-2">
            Publications, Grants & Key Projects
          </h2>
          <div className="space-y-2">
            {projects.map((proj, idx) => (
              <div key={idx} className="avoid-break">
                <span className="font-bold">{proj.title}</span>
                {proj.technologies && <span className="text-[11px] text-slate-600 italic"> ({proj.technologies})</span>}
                {proj.description && <p className="text-[11.5px] text-slate-800">{proj.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

