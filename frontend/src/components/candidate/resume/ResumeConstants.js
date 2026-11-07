/**
 * JOBONE ADVANCED ATS RESUME BUILDER CONSTANTS & DEFAULTS
 * Standardized data models, suggestions, action verbs, and ATS scoring rules.
 */

export const ACTION_VERBS = [
  "Accelerated", "Architected", "Automated", "Built", "Championed", "Collaborated",
  "Constructed", "Decreased", "Delivered", "Deployed", "Designed", "Developed",
  "Devised", "Eliminated", "Engineered", "Established", "Executed", "Expanded",
  "Formulated", "Generated", "Implemented", "Improved", "Increased", "Initiated",
  "Innovated", "Integrated", "Launched", "Led", "Leveraged", "Mentored",
  "Migrated", "Modernized", "Monitored", "Negotiated", "Optimized", "Orchestrated",
  "Overhauled", "Pioneered", "Produced", "Programmed", "Redesigned", "Reduced",
  "Refactored", "Resolved", "Revamped", "Scaled", "Secured", "Simplified",
  "Spearheaded", "Standardized", "Streamlined", "Structured", "Transformed", "Upgraded"
];

export const SKILL_CATEGORIES = [
  { id: "languages", label: "Programming Languages" },
  { id: "frameworks", label: "Frameworks & Libraries" },
  { id: "cloud", label: "Cloud Platforms & DevOps" },
  { id: "databases", label: "Databases & Storage" },
  { id: "tools", label: "Developer Tools & Testing" },
  { id: "soft", label: "Leadership & Soft Skills" },
  { id: "domain", label: "Domain Expertise" },
];

export const SKILL_SUGGESTIONS = {
  languages: ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "SQL", "HTML5", "CSS3", "PHP", "Kotlin", "Swift"],
  frameworks: ["React", "Next.js", "Node.js", "Express", "Vue.js", "Angular", "Django", "FastAPI", "Spring Boot", "TailwindCSS", "Redux", "GraphQL"],
  cloud: ["AWS", "Google Cloud", "Microsoft Azure", "Docker", "Kubernetes", "Terraform", "CI/CD", "GitHub Actions", "Linux", "Serverless"],
  databases: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Elasticsearch", "Firebase", "DynamoDB", "Cassandra", "Prisma"],
  tools: ["Git", "GitHub", "Jest", "Playwright", "Cypress", "Postman", "Webpack", "Vite", "Figma", "Jira", "Prometheus"],
  soft: ["Cross-functional Leadership", "Agile / Scrum", "Technical Mentorship", "Stakeholder Communication", "System Architecture", "Problem Solving"],
  domain: ["Full Stack Development", "Cloud Architecture", "Distributed Systems", "RESTful APIs", "Microservices", "Data Engineering", "Web Security"]
};

export const RESUME_TEMPLATES = [
  {
    id: "classic",
    name: "Executive ATS",
    badge: "Recommended",
    description: "Highest parsing rate for Fortune 500 ATS scanners. Centered serif header with classic horizontal rules.",
    tag: "High ATS Pass Rate",
  },
  {
    id: "modern",
    name: "Modern Editorial",
    badge: "Popular",
    description: "Contemporary sans-serif typography with high-density graphite hierarchy and clean metadata pills.",
    tag: "Clean & Contemporary",
  },
  {
    id: "minimal",
    name: "Tech Minimal",
    badge: "Developer",
    description: "Monospace code-inspired layout optimized for software engineers, emphasizing repositories and tech stacks.",
    tag: "Developer Favorite",
  },
  {
    id: "compact",
    name: "Compact ATS",
    badge: "Single-Page",
    description: "High-density single-page format ideal for junior engineers, freshers, and concise 1-page portfolios.",
    tag: "Maximum Density",
  },
  {
    id: "academic",
    name: "Academic Classic",
    badge: "Formal",
    description: "Formal serif structure emphasizing research, education, publications, credentials, and honors.",
    tag: "Research & Academic",
  },
];

export const TEMPLATES = RESUME_TEMPLATES;

export const INITIAL_RESUME_SCHEMA = {
  id: "default",
  versionName: "Master Resume",
  template: "classic",
  lastModified: new Date().toISOString(),
  contact: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },
  summary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  achievements: [],
  volunteering: [],
  languages: [],
  customSections: [],
  sectionOrder: [
    "personal",
    "summary",
    "experience",
    "skills",
    "projects",
    "education",
    "certifications",
    "achievements",
    "volunteering",
    "languages"
  ],
  hiddenSections: [],
};

export const SECTION_METADATA = {
  personal: { label: "Contact Information", iconName: "User", required: true },
  summary: { label: "Executive Summary", iconName: "FileText", required: true },
  experience: { label: "Work Experience", iconName: "Briefcase", required: true },
  skills: { label: "Skills Matrix", iconName: "Sparkles", required: true },
  projects: { label: "Featured Projects", iconName: "Layers", required: false },
  education: { label: "Education & Academics", iconName: "GraduationCap", required: true },
  certifications: { label: "Certifications & Licenses", iconName: "Award", required: false },
  achievements: { label: "Honors & Achievements", iconName: "Trophy", required: false },
  volunteering: { label: "Volunteering & Leadership", iconName: "Heart", required: false },
  languages: { label: "Languages", iconName: "Globe", required: false },
  custom: { label: "Custom Section", iconName: "PlusCircle", required: false },
};

/**
 * Calculates ATS readiness score (0 - 100) based on realistic parsing criteria
 */
export function calculateATSScore(resume) {
  if (!resume) return { score: 0, categoryScores: {}, criticalIssues: [], warnings: [], strengths: [], tips: [] };

  let score = 0;
  const criticalIssues = [];
  const warnings = [];
  const strengths = [];
  const tips = [];
  const categoryScores = {
    contact: 0,
    summary: 0,
    experience: 0,
    skills: 0,
    education: 0,
    formatting: 0,
  };

  // 1. Contact (Max 20)
  let contactScore = 0;
  if (resume.contact?.name && resume.contact.name.trim().length >= 2) contactScore += 5;
  else criticalIssues.push("Candidate name is required for ATS parsing.");

  if (resume.contact?.email && /^\S+@\S+\.\S+$/.test(resume.contact.email)) contactScore += 5;
  else criticalIssues.push("A valid professional email address is required.");

  if (resume.contact?.phone && resume.contact.phone.trim().length >= 8) contactScore += 4;
  else warnings.push("Phone number is strongly recommended for recruiter outreach.");

  if (resume.contact?.title && resume.contact.title.trim().length >= 3) contactScore += 3;
  else warnings.push("Add a target headline matching the position (e.g. Senior Frontend Engineer).");

  if (resume.contact?.location && resume.contact.location.trim().length >= 2) contactScore += 3;
  else warnings.push("Add your city/country or specify 'Remote' to pass geographic filters.");

  categoryScores.contact = contactScore;
  score += contactScore;

  // 2. Summary (Max 15)
  let summaryScore = 0;
  const summaryLength = (resume.summary || "").trim().split(/\s+/).filter(Boolean).length;
  if (summaryLength >= 30 && summaryLength <= 100) {
    summaryScore += 15;
    strengths.push("Executive summary length is ideal (30–100 words).");
  } else if (summaryLength > 0 && summaryLength < 30) {
    summaryScore += 8;
    warnings.push("Executive summary is a bit brief. Expand to 3-4 sentences detailing core achievements.");
    tips.push("Highlight your years of experience, primary tech stack, and proudest engineering win.");
  } else if (summaryLength > 100) {
    summaryScore += 8;
    warnings.push("Executive summary exceeds 100 words. Keep it punchy for quick ATS scanning.");
  } else {
    criticalIssues.push("Executive summary is missing. Recruiters prioritize a concise value proposition.");
    tips.push("Add a 3-sentence summary highlighting your primary domain and career focus.");
  }
  categoryScores.summary = summaryScore;
  score += summaryScore;

  // 3. Work Experience (Max 25)
  let expScore = 0;
  const exps = resume.experience || [];
  if (exps.length > 0) {
    expScore += 10;
    let hasActionVerbs = false;
    let hasMetrics = false;
    let totalBullets = 0;

    exps.forEach((exp) => {
      const text = `${exp.description || ""} ${(exp.bullets || []).join(" ")}`.toLowerCase();
      totalBullets += (exp.bullets || []).length || (exp.description ? 1 : 0);

      ACTION_VERBS.forEach((verb) => {
        if (text.includes(verb.toLowerCase())) hasActionVerbs = true;
      });

      if (/\d+%|\$\d+|\d+\+|\d+x/i.test(text)) {
        hasMetrics = true;
      }
    });

    if (hasActionVerbs) {
      expScore += 7;
      strengths.push("Experience statements incorporate high-impact action verbs.");
    } else {
      warnings.push("Use strong action verbs (e.g., 'Architected', 'Accelerated', 'Deployed').");
    }

    if (hasMetrics) {
      expScore += 8;
      strengths.push("Quantified metrics and measurable impact detected (percentages, multipliers).");
    } else {
      warnings.push("Add measurable numbers to bullet points (e.g., 'Reduced latency by 35%').");
      tips.push("Quantify outcomes: team size, percentage improvements, revenue growth, or scale.");
    }
  } else {
    warnings.push("No work experience listed. Add professional positions or internships.");
  }
  categoryScores.experience = expScore;
  score += expScore;

  // 4. Skills Matrix (Max 20)
  let skillScore = 0;
  const skillsCount = (resume.skills || []).length;
  if (skillsCount >= 8) {
    skillScore += 20;
    strengths.push(`Rich skill catalog with ${skillsCount} verified technical competencies.`);
  } else if (skillsCount >= 4) {
    skillScore += 12;
    warnings.push("Add 4+ additional skills to increase keyword matching across automated ATS filters.");
  } else if (skillsCount > 0) {
    skillScore += 6;
    warnings.push("Skill list is sparse. Include core languages, frameworks, cloud, and tools.");
  } else {
    criticalIssues.push("No skills listed. Technical ATS filters screen candidates by skill tags.");
  }
  categoryScores.skills = skillScore;
  score += skillScore;

  // 5. Education & Credentials (Max 15)
  let eduScore = 0;
  const edus = resume.education || [];
  if (edus.length > 0) {
    eduScore += 10;
    strengths.push("Academic background clearly recorded.");
  } else {
    warnings.push("Add your degree or highest education credential.");
  }

  const certs = resume.certifications || [];
  if (certs.length > 0) {
    eduScore += 5;
    strengths.push("Professional certifications bolster candidate credibility.");
  }
  categoryScores.education = eduScore;
  score += eduScore;

  // 6. Formatting & Simplicity (Max 5)
  let formatScore = 5;
  if (!resume.hiddenSections?.includes("experience") && !resume.hiddenSections?.includes("skills")) {
    strengths.push("Standard ATS single-column hierarchy maintained.");
  }
  categoryScores.formatting = formatScore;
  score += formatScore;

  // Overall Tier
  let tier = "Needs Improvement";
  let tierColor = "text-rose-400";
  if (score >= 90) {
    tier = "Exceptional ATS Readiness";
    tierColor = "text-emerald-400";
  } else if (score >= 75) {
    tier = "Strong ATS Compatibility";
    tierColor = "text-silver";
  } else if (score >= 55) {
    tier = "Moderate ATS Readiness";
    tierColor = "text-amber-400";
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    tier,
    tierColor,
    categoryScores,
    criticalIssues,
    warnings,
    strengths,
    tips,
  };
}
