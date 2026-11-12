import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Briefcase,
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowUp,
  ExternalLink,
  CheckCircle2,
  Globe2,
} from "lucide-react";
import {
  FaLinkedinIn,
  FaInstagram,
  FaWhatsapp,
  FaGithub,
  FaTwitter,
} from "react-icons/fa";
import LogoJobOne from "./LogoJobOne";
import { useTheme } from "../routes/Context";

export default function Footer() {
  const location = useLocation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // --- 1. ROUTE SUPPRESSION BOUNDARY ---
  // Public footer must NOT appear inside Candidate, Employer, or Admin authenticated portal layouts
  const currentPath =
    location.pathname.toLowerCase().split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

  // Standalone auth views (login, OTP, register flows)
  const isStandaloneAuth = [
    "/userotp",
    "/employerotp",
    "/verifyotp",
    "/verify-otp",
    "/login",
    "/register",
    "/signup",
    "/userregister",
    "/jobseeker/register",
    "/employerregister",
    "/employer-register",
    "/employer/register",
    "/employer/signup",
    "/employerregisteroption",
    "/forgot-password",
    "/reset-password",
    "/admin/login",
  ].includes(currentPath);

  // Dedicated authenticated portal layouts (Admin, Employer Workspace, Candidate Command Center)
  const isPortalLayout =
    currentPath.startsWith("/admin") ||
    [
      "/employerdashboard",
      "/createjob",
      "/employerprofile",
      "/employereditprofile",
      "/employereditprofile2",
      "/employerdocupload",
      "/candidates",
      "/my-candidates",
      "/interviews",
      "/employer-interviews",
      "/analytics",
      "/employer-analytics",
      "/team",
      "/employer-team",
    ].some((p) => currentPath === p || currentPath.startsWith(p + "/")) ||
    currentPath.startsWith("/job/") ||
    currentPath.startsWith("/editjob/") ||
    [
      "/userdashboard",
      "/myapplications",
      "/profile",
      "/editprofile",
      "/editprofile2",
      "/jobseeker-documents",
      "/jobseekerdoc",
      "/resume-builder",
      "/resumebuilder",
    ].some((p) => currentPath === p || currentPath.startsWith(p + "/")) ||
    currentPath.startsWith("/apply/");

  // Suppress rendering if inside portal, standalone auth, or Tauri desktop container
  if (isStandaloneAuth || isPortalLayout || window.__TAURI__) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    {
      name: "LinkedIn",
      icon: FaLinkedinIn,
      url: "https://www.linkedin.com/company/simtraksolutions/",
      color: "hover:text-[#0A66C2] hover:border-[#0A66C2]/40",
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      url: "https://whatsapp.com/channel/jobone",
      color: "hover:text-[#25D366] hover:border-[#25D366]/40",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      url: "https://instagram.com/jobone.official",
      color: "hover:text-[#E4405F] hover:border-[#E4405F]/40",
    },
    {
      name: "Twitter / X",
      icon: FaTwitter,
      url: "https://twitter.com",
      color: "hover:text-white dark:hover:text-white hover:border-white/40",
    },
    {
      name: "GitHub",
      icon: FaGithub,
      url: "https://github.com",
      color: "hover:text-white dark:hover:text-white hover:border-white/40",
    },
  ];

  return (
    <footer
      aria-label="JobOne Site Footer"
      className="relative w-full border-t border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans transition-colors duration-150 overflow-hidden"
    >
      {/* Top Silver Accent Line with subtle Sheen */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent-silver)]/40 to-transparent pointer-events-none" />

      {/* Decorative ambient background glows (Dark mode only) */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Main Grid: Brand summary + 4 Link Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-12 border-b border-[var(--theme-border)]">
          {/* Brand & Mission Statement (Span 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link
              to="/"
              className="inline-flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent-silver)] rounded-xl"
              aria-label="JobOne Home"
            >
              <LogoJobOne
                width={132}
                height={38}
                textColor={isDark ? "#FFFFFF" : "#0F172A"}
                className="w-[124px] md:w-[136px] h-auto object-contain"
              />
            </Link>

            <p className="text-sm leading-relaxed text-[var(--theme-text-muted)] max-w-sm font-normal">
              Connecting verified career seekers with premier enterprises through high-precision matching, transparent recruitment pipelines, and modern hiring infrastructure.
            </p>

            {/* Platform Operational Telemetry Badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text-muted)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-[var(--theme-text)]">Systems Operational</span>
              <span className="text-[var(--theme-text-subtle)]">•</span>
              <span className="text-[11px] text-[var(--theme-text-subtle)] font-mono">99.98% Platform Uptime</span>
            </div>

            {/* Social channels */}
            <div className="pt-2">
              <span className="block text-xs uppercase tracking-wider font-semibold text-[var(--theme-text-subtle)] mb-3">
                Official Channels
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {socialLinks.map(({ name, icon: Icon, url, color }) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow JobOne on ${name}`}
                    className={`relative w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${color} focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent-silver)]`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Link Columns (Span 8 cols -> 4 sub-columns on desktop) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Column 1: Talent Discovery */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text)] mb-4 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" />
                Discovery
              </h3>
              <ul className="space-y-2.5 text-sm font-medium">
                <li>
                  <Link
                    to="/jobs"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Browse All Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/companies"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Explore Companies
                  </Link>
                </li>
                <li>
                  <Link
                    to="/recommended-jobs"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Recommended Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobs?workplaceType=Remote"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Remote Positions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobs?industry=Technology"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Tech & Engineering
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: For Employers */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text)] mb-4 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" />
                For Employers
              </h3>
              <ul className="space-y-2.5 text-sm font-medium">
                <li>
                  <Link
                    to="/employerregister"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Post a Position
                  </Link>
                </li>
                <li>
                  <Link
                    to="/employerdashboard"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Employer Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/candidates"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Candidate Search
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Hiring Solutions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about#verification"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Employer Verification
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform & Company */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text)] mb-4 flex items-center gap-2">
                <Globe2 className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" />
                Company
              </h3>
              <ul className="space-y-2.5 text-sm font-medium">
                <li>
                  <Link
                    to="/about"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    About JobOne
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Enterprise Services
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Direct Contact Desk
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about#story"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Our Mission
                  </Link>
                </li>
                <li>
                  <a
                    href="https://simtrak.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
                  >
                    Simtrak Solutions
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Trust, Security & Legal */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text)] mb-4 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" />
                Trust & Legal
              </h3>
              <ul className="space-y-2.5 text-sm font-medium">
                <li>
                  <Link
                    to="/contact?subject=privacy"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact?subject=terms"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact?subject=security"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Security Standards
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about#verification"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Verification Guarantee
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors inline-block"
                  >
                    Candidate Help Desk
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Strip: Phone, Email, Location */}
        <div className="py-6 border-b border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-[var(--theme-text-muted)]">
          <div className="flex flex-wrap items-center gap-6">
            <a
              href="tel:+919876543210"
              className="inline-flex items-center gap-2 hover:text-[var(--theme-text)] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" />
              <span>+91 98765 43210</span>
            </a>
            <a
              href="mailto:support@jobone.com"
              className="inline-flex items-center gap-2 hover:text-[var(--theme-text)] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" />
              <span>support@jobone.com</span>
            </a>
            <div className="inline-flex items-center gap-2 text-[var(--theme-text-subtle)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" />
              <span>329 Sarojini Street, New Delhi, India</span>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent-silver)]"
            aria-label="Back to top of page"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Bar: Copyright & Simtrak Signature */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-[var(--theme-text-subtle)]">
          <p>
            © {new Date().getFullYear()} JobOne Platform Inc. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            <span>Engineered by</span>
            <a
              href="https://simtrak.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
            >
              Simtrak Solutions
            </a>
            <span>•</span>
            <span className="font-mono text-[11px]">Recruitment Architecture</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
