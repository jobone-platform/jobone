import React from "react";
import Hero from "../components/Hero";
import LiveTicker from "../components/LiveTicker";
import JobCategories from "../components/JobCategories";
import CompanyCard from "../components/CompanyCard";
import FeaturedJobs from "../components/FeaturedJobs";
import ProcessBento from "../components/ProcessBento";
import VideoSection from "../components/VideoSection";
import Testimonials from "../components/Testimonials";
import CTA from "../components/CTA";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans transition-colors duration-150">
      <section aria-label="Hero Showcase" className="relative overflow-hidden bg-[var(--theme-bg)]">
        <Hero />
      </section>

      <div className="flex-grow w-full">
        <LiveTicker />
        <JobCategories />

        {/* Visual Break with subtle border */}
        <div className="w-full border-t border-[var(--theme-border)] bg-[var(--theme-bg)]">
          <CompanyCard />
        </div>

        <FeaturedJobs />

        <div className="w-full border-t border-[var(--theme-border)] bg-[var(--theme-bg)]">
          <ProcessBento />
        </div>

        <VideoSection />
        <Testimonials />
        <CTA />
      </div>
    </div>
  );
}
