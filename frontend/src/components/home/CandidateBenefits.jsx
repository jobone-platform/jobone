import React from "react";
import {
  Building2,
  Send,
  Activity,
  Bookmark,
  FileCheck2,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import SectionHeader from "../shared/SectionHeader";
import FeatureGrid from "../shared/FeatureGrid";

const CANDIDATE_BENEFITS = [
  {
    icon: Building2,
    tag: "Verified",
    title: "Discover Verified Employers",
    description:
      "Browse approved companies and inspect organization profiles before applying to open roles.",
    to: "/companies",
    ctaLabel: "Explore Companies",
  },
  {
    icon: Send,
    tag: "Direct",
    title: "Apply Directly to Job Postings",
    description:
      "Submit your profile and resume directly to company hiring teams without third-party clutter.",
    to: "/jobs",
    ctaLabel: "Browse Open Roles",
  },
  {
    icon: Activity,
    tag: "Transparency",
    title: "Track Application Progress",
    description:
      "Follow every submitted application from review and shortlisting through interview stages.",
    to: "/myapplications",
    ctaLabel: "View My Applications",
  },
  {
    icon: Bookmark,
    tag: "Organized",
    title: "Manage Saved Jobs",
    description:
      "Bookmark roles of interest and return to compare requirements and compensation anytime.",
    to: "/userdashboard",
    ctaLabel: "Open Saved Jobs",
  },
  {
    icon: FileCheck2,
    tag: "ATS-Ready",
    title: "Prepare ATS-Friendly Resumes",
    description:
      "Build structured resumes and run ATS compatibility checks tailored to target job descriptions.",
    to: "/resume-builder",
    ctaLabel: "Open Resume Builder",
  },
  {
    icon: FolderOpen,
    tag: "Documents",
    title: "Access Career Documents",
    description:
      "Store and manage your resume files and supporting career documents in one secure place.",
    to: "/jobseeker-documents",
    ctaLabel: "Manage Documents",
  },
  {
    icon: Sparkles,
    tag: "Matched",
    title: "Skill-Based Opportunity Matching",
    description:
      "Discover recommended roles aligned with your skills, experience, and career profile.",
    to: "/recommended-jobs",
    ctaLabel: "See Recommended Jobs",
  },
];

export default function CandidateBenefits() {
  return (
    <section
      aria-label="How JobOne Helps Candidates"
      className="py-16 sm:py-20 bg-[var(--theme-bg)] text-[var(--theme-text)] border-t border-[var(--theme-border)] transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badgeIcon={Sparkles}
          badgeText="How JobOne Helps Candidates"
          title="Built for Focused Career Discovery"
          subtitle="Everything candidates need to find verified openings, prepare strong applications, and stay informed throughout the hiring process."
        />

        <FeatureGrid items={CANDIDATE_BENEFITS} columns={3} />
      </div>
    </section>
  );
}

