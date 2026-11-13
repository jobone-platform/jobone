import React from "react";
import {
  ShieldCheck,
  Search,
  GitBranch,
  CalendarClock,
} from "lucide-react";
import SectionHeader from "../shared/SectionHeader";
import FeatureGrid from "../shared/FeatureGrid";

const EMPLOYER_BENEFITS = [
  {
    icon: ShieldCheck,
    tag: "Trust",
    title: "Verified Organization Credibility",
    description:
      "Attract top talent with an approved employer badge and a verified company profile.",
  },
  {
    icon: Search,
    tag: "Sourcing",
    title: "Proactive Candidate Sourcing",
    description:
      "Discover qualified professionals filtered by verified skills, experience, and location.",
  },
  {
    icon: GitBranch,
    tag: "Pipeline",
    title: "Structured Applicant Pipelines",
    description:
      "Move candidates smoothly from initial screening to shortlist with organized status tracking.",
  },
  {
    icon: CalendarClock,
    tag: "Coordination",
    title: "Integrated Interview Management",
    description:
      "Coordinate interview schedules and communicate next steps directly within your employer portal.",
  },
];

export default function EmployerBenefits() {
  return (
    <section
      id="employer-benefits"
      aria-label="Employer Platform Benefits"
      className="py-16 sm:py-20 bg-[var(--theme-bg)] text-[var(--theme-text)] border-t border-[var(--theme-border)] transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Built for Structured, Verified Hiring"
          subtitle="Streamline how your team discovers talent, reviews applicants, coordinates interviews, and builds candidate trust."
        />

        <FeatureGrid items={EMPLOYER_BENEFITS} columns={4} />
      </div>
    </section>
  );
}

