import React from "react";
import {
  FaWhatsapp,
  FaInstagram,
  FaLinkedinIn,
  FaFacebookF,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import Hero from "../components/Hero";
import Testimonials from "../components/Testimonials";
import JobCategories from "../components/JobCategories";
import FeaturedJobs from "../components/FeaturedJobs";
import CompanyCard from "../components/CompanyCard";
import VideoSection from "../components/VideoSection";
import LiveTicker from "../components/LiveTicker";
import ProcessBento from "../components/ProcessBento";
import Footer from "../components/Footer";
import CTA from "../components/CTA";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900">
      <header className="relative overflow-hidden bg-slate-900">
        <Hero />
      </header>

      {/* FACT: Removed space-y-20 so components sit flush and manage their own padding */}
      <main className="flex-grow w-full">
        <LiveTicker />
        <JobCategories />

        {/* Visual Break with subtle border */}
        <div className="w-full border-t border-slate-200/60 bg-white">
          <CompanyCard />
        </div>

        <FeaturedJobs />

        <div className="w-full border-t border-slate-200/60 bg-white">
          <ProcessBento />
        </div>

        <VideoSection />
        <Testimonials />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
