import React from "react";
import CandidateHero from "../components/home/CandidateHero";
import FeaturedJobs from "../components/FeaturedJobs";
import JobCategories from "../components/JobCategories";
import BrowseByLocation from "../components/home/BrowseByLocation";
import VerifiedEmployersShowcase from "../components/home/VerifiedEmployersShowcase";
import CandidatePlatformTools from "../components/home/CandidatePlatformTools";
import CandidateCTA from "../components/home/CandidateCTA";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans transition-colors duration-150">
      <CandidateHero />

      <div className="flex-grow w-full">
        <FeaturedJobs />
        <JobCategories />
        <BrowseByLocation />
        <VerifiedEmployersShowcase />
        <CandidatePlatformTools />
        <CandidateCTA />
      </div>
    </div>
  );
}
