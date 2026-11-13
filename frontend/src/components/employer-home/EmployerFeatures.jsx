import React from "react";
import {
  Briefcase,
  Search,
  UserCheck,
  CalendarClock,
  BarChart3,
  Building2,
  UsersRound,
} from "lucide-react";
import SectionHeader from "../shared/SectionHeader";
import FeatureGrid from "../shared/FeatureGrid";

const EMPLOYER_FEATURES = [
  {
    icon: Briefcase,
    title: "Job Posting Management",
    description:
      "Create, publish, edit, or close job requisitions with custom skills and compensation.",
    to: "/createjob",
    ctaLabel: "Post a Job",
  },
  {
    icon: Search,
    title: "Candidate Sourcing",
    description:
      "Search registered candidate profiles by skills and qualifications to source talent directly.",
    to: "/my-candidates",
    ctaLabel: "Search Candidates",
  },
  {
    icon: UserCheck,
    title: "Applicant Review",
    description:
      "Inspect submitted resumes, assess candidate qualifications, and update applicant statuses.",
    to: "/employerdashboard",
    ctaLabel: "Review Applicants",
  },
  {
    icon: CalendarClock,
    title: "Interview Scheduling",
    description:
      "Coordinate interview times, track stages, and keep shortlisted candidates informed.",
    to: "/interviews",
    ctaLabel: "Manage Interviews",
  },
  {
    icon: BarChart3,
    title: "Hiring Analytics",
    description:
      "Monitor application volume, posting engagement, and recruitment pipeline efficiency.",
    to: "/analytics",
    ctaLabel: "View Analytics",
  },
  {
    icon: Building2,
    title: "Company Profile",
    description:
      "Maintain company branding, organization overview, and employer verification documents.",
    to: "/employerprofile",
    ctaLabel: "Manage Profile",
  },
  {
    icon: UsersRound,
    title: "Team Management",
    description:
      "Collaborate across hiring managers and recruiters within a shared organization account.",
    to: "/team",
    ctaLabel: "Team Workspace",
  },
];

export default function EmployerFeatures() {
  return (
    <section
      id="employer-features"
      aria-label="Employer Recruitment Features"
      className="py-16 sm:py-20 bg-[var(--theme-bg)] text-[var(--theme-text)] border-t border-[var(--theme-border)] transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Core Capabilities for Hiring Teams"
          subtitle="Direct access to job publishing, candidate sourcing, applicant review, interview coordination, and hiring analytics."
        />

        <FeatureGrid items={EMPLOYER_FEATURES} columns={3} />
      </div>
    </section>
  );
}

