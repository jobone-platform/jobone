import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  FileText,
  ScanSearch,
  Bookmark,
  UserCheck,
  FolderArchive,
  Briefcase,
  Search,
  CalendarClock,
  BarChart3,
  Building2,
  UsersRound,
  User,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import SectionHeader from "../shared/SectionHeader";
import FeatureGrid from "../shared/FeatureGrid";
import { useAuth } from "../../routes/Context";

const CANDIDATE_TOOLS = [
  {
    icon: Activity,
    title: "Application Tracking",
    description:
      "Monitor real-time status updates across all submitted applications in your candidate workspace.",
    to: "/myapplications",
    ctaLabel: "Track Applications",
  },
  {
    icon: FileText,
    title: "Resume Builder",
    description:
      "Create and customize clean, structured resumes using your JobOne profile data.",
    to: "/resume-builder",
    ctaLabel: "Launch Builder",
  },
  {
    icon: ScanSearch,
    title: "ATS Resume Analysis",
    description:
      "Evaluate resume structure and keyword alignment against specific target job requisitions.",
    to: "/resume-builder",
    ctaLabel: "Analyze Resume",
  },
  {
    icon: Bookmark,
    title: "Saved Opportunities",
    description:
      "Keep a curated shortlist of roles you want to review, compare, or apply to later.",
    to: "/userdashboard",
    ctaLabel: "View Saved Roles",
  },
  {
    icon: UserCheck,
    title: "Verified Talent Dossier",
    description:
      "Present your skills, work history, education, and credentials directly to verified employers.",
    to: "/profile",
    ctaLabel: "Edit Profile",
  },
  {
    icon: FolderArchive,
    title: "Document Vault",
    description:
      "Upload and manage verification credentials, certifications, and portfolios securely.",
    to: "/jobseeker-documents",
    ctaLabel: "Open Documents",
  },
];

const EMPLOYER_TOOLS = [
  {
    icon: Briefcase,
    title: "Requisition Publishing",
    description:
      "Create, publish, edit, or close job postings with precise skill and compensation filters.",
    to: "/createjob",
    ctaLabel: "Post a Job",
  },
  {
    icon: Search,
    title: "Candidate Sourcing",
    description:
      "Filter verified talent by experience, location, and validated skill proficiencies.",
    to: "/candidates",
    ctaLabel: "Search Candidates",
  },
  {
    icon: UserCheck,
    title: "Applicant Management",
    description:
      "Review incoming applications, evaluate qualifications, and progress candidates in pipeline.",
    to: "/employerdashboard",
    ctaLabel: "Review Applicants",
  },
  {
    icon: CalendarClock,
    title: "Interview Coordination",
    description:
      "Schedule interviews, manage milestones, and keep applicants informed at every phase.",
    to: "/employer-interviews",
    ctaLabel: "Manage Interviews",
  },
  {
    icon: BarChart3,
    title: "Hiring Telemetry & Analytics",
    description:
      "Track pipeline conversion, requisition views, applicant volume, and time-to-hire metrics.",
    to: "/employer-analytics",
    ctaLabel: "View Analytics",
  },
  {
    icon: Building2,
    title: "Enterprise Profile & Brand",
    description:
      "Showcase your organizational culture, perks, verified credentials, and active openings.",
    to: "/employerprofile",
    ctaLabel: "Manage Profile",
  },
];

export default function UniversalPlatformTools() {
  const { user, employer, admin, role, authStatus } = useAuth();
  const isEmployer = authStatus === "authenticated" && (role === "employer" || Boolean(employer && !admin));
  const isCandidate = authStatus === "authenticated" && (role === "jobseeker" || Boolean(user && !employer && !admin));

  const [audience, setAudience] = useState(() => (isEmployer ? "employer" : "candidate"));

  const currentTools = audience === "employer" ? EMPLOYER_TOOLS : CANDIDATE_TOOLS;

  return (
    <section
      aria-label="Universal Platform Tools & Capabilities"
      className="py-16 sm:py-20 bg-[var(--theme-surface)]/40 text-[var(--theme-text)] border-t border-[var(--theme-border)] transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase bg-[var(--theme-gold-surface)] border border-[var(--theme-gold-border)] text-[var(--theme-gold)] mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--theme-gold)]" />
              <span>Full-Stack Platform Capabilities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--theme-text)] tracking-tight">
              Tools Engineered for Career Acceleration & Modern Hiring
            </h2>
            <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] max-w-xl mt-1">
              Purpose-built workflows designed to streamline every step from initial talent discovery to structured interview offers.
            </p>
          </div>

          {/* Interactive Audience Switcher for Tools */}
          <div className="flex items-center rounded-2xl bg-[var(--theme-surface-elevated)] p-1 border border-[var(--theme-border)] self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setAudience("candidate")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                audience === "candidate"
                  ? "bg-[var(--theme-gold)] text-black shadow-sm"
                  : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>For Candidates</span>
            </button>

            <button
              type="button"
              onClick={() => setAudience("employer")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                audience === "employer"
                  ? "bg-[var(--theme-gold)] text-black shadow-sm"
                  : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>For Employers</span>
            </button>
          </div>
        </div>

        <FeatureGrid items={currentTools} columns={3} />
      </div>
    </section>
  );
}

