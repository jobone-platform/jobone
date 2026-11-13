import React from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  FileText,
  ScanSearch,
  Bookmark,
  UserCheck,
  FolderArchive,
  ArrowRight,
} from "lucide-react";
import SectionHeader from "../shared/SectionHeader";
import FeatureGrid from "../shared/FeatureGrid";

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
      "Evaluate resume structure and keyword alignment against specific job postings.",
    to: "/resume-builder",
    ctaLabel: "Analyze Resume",
  },
  {
    icon: Bookmark,
    title: "Saved Jobs",
    description:
      "Keep a curated shortlist of roles you want to review or apply to later.",
    to: "/userdashboard",
    ctaLabel: "View Saved Roles",
  },
  {
    icon: UserCheck,
    title: "Career Profile",
    description:
      "Present your skills, work history, education, and availability clearly to hiring teams.",
    to: "/profile",
    ctaLabel: "Edit Profile",
  },
  {
    icon: FolderArchive,
    title: "Documents",
    description:
      "Upload and organize resumes and career documents for fast, repeatable applications.",
    to: "/jobseeker-documents",
    ctaLabel: "Open Documents",
  },
];

export default function CandidatePlatformTools() {
  return (
    <section
      aria-label="Candidate Career Tools"
      className="py-16 sm:py-20 bg-[var(--theme-surface)]/40 text-[var(--theme-text)] border-t border-[var(--theme-border)] transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Tools Included in Your Career Center"
          subtitle="Manage your profile, ATS resumes, saved opportunities, and application pipeline in one workspace."
        />

        <FeatureGrid items={CANDIDATE_TOOLS} columns={3} />
      </div>
    </section>
  );
}

