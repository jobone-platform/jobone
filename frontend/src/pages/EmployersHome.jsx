import React from "react";
import EmployerHero from "../components/employer-home/EmployerHero";
import EmployerBenefits from "../components/employer-home/EmployerBenefits";
import EmployerWorkflow from "../components/employer-home/EmployerWorkflow";
import EmployerFeatures from "../components/employer-home/EmployerFeatures";
import EmployerCTA from "../components/employer-home/EmployerCTA";

export default function EmployersHome() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans transition-colors duration-150">
      <EmployerHero />

      <div className="flex-grow w-full">
        <EmployerBenefits />
        <EmployerWorkflow />
        <EmployerFeatures />
        <EmployerCTA />
      </div>
    </div>
  );
}

