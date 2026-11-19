import React from "react";
import UniversalHero from "../components/home/UniversalHero";
import FeaturedJobs from "../components/FeaturedJobs";
import JobCategories from "../components/JobCategories";
import BrowseByLocation from "../components/home/BrowseByLocation";
import VerifiedEmployersShowcase from "../components/home/VerifiedEmployersShowcase";
import UniversalPlatformTools from "../components/home/UniversalPlatformTools";
import UniversalCTA from "../components/home/UniversalCTA";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans transition-colors duration-150">
      <UniversalHero />

      <div className="flex-grow w-full">
        <FeaturedJobs />
        <JobCategories />
        <BrowseByLocation />
        <VerifiedEmployersShowcase />
        <UniversalPlatformTools />
        <UniversalCTA />
      </div>
    </div>
  );
}
