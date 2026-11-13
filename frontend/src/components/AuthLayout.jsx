import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Sparkles, CheckCircle2, Lock } from "lucide-react";
import LogoJobOne from "./LogoJobOne";
import { useTheme } from "../routes/Context";

export default function AuthLayout({
  children,
  badge = "Enterprise Career Infrastructure",
  title = "Welcome Back",
  subtitle = "Authenticate to access your verified career workspace",
  visualHeading = "Architecting Direct Pathways Between Verified Talent & Premier Enterprises.",
  visualSubheading = "JobOne is the double-sided recruitment marketplace built for transparency. Eliminate recruitment agency noise with direct employer requisitions, authentic compensation, and real-time application tracking.",
  metrics = null,
  quote = null,
  roleType = "general", // "candidate" | "employer" | "admin" | "general"
}) {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans transition-colors duration-150">
      
      {/* ─── LEFT: EDITORIAL BRANDING & ARCHITECTURAL PANEL (Desktop Only) ─ */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-[var(--theme-surface)] border-r border-[var(--theme-border)] p-12 xl:p-16 flex-col justify-between overflow-hidden">
        {/* Subtle Ambient Sheen */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />

        {/* Top: Logo & Back Link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="inline-block" aria-label="JobOne Home">
            <LogoJobOne
              width={140}
              height={40}
              textColor={isDark ? "#FFFFFF" : "#0F172A"}
              className="w-32 h-auto"
            />
          </Link>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </button>
        </div>

        {/* Middle: Editorial Narrative */}
        <div className="relative z-10 my-auto py-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text-muted)] mb-6 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {badge}
            </span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-display font-black text-[var(--theme-text)] tracking-tight leading-tight mb-4">
            {visualHeading}
          </h2>

          <p className="text-sm xl:text-base text-[var(--theme-text-muted)] leading-relaxed font-normal mb-8">
            {visualSubheading}
          </p>

          {/* Dynamic Metrics strip if passed */}
          {metrics && Array.isArray(metrics) && metrics.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] mb-6">
              {metrics.map((m, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-lg xl:text-xl font-display font-bold text-[var(--theme-text)]">
                    {m.value}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--theme-text-subtle)] uppercase tracking-wider mt-0.5">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Dynamic Quote or Value Pillars */}
          {quote ? (
            <div className="p-4 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)]/60 text-xs text-[var(--theme-text-muted)] space-y-2">
              <p className="italic leading-relaxed">"{quote.text}"</p>
              <div className="pt-2 border-t border-[var(--theme-border)] flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-[var(--theme-text)]">{quote.author}</span>
                <span className="text-[var(--theme-text-subtle)]">{quote.role}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 pt-4 border-t border-[var(--theme-border)]">
              <div className="flex items-center gap-3 text-xs font-medium text-[var(--theme-text-muted)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% CIN and domain-authenticated employer accounts</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-[var(--theme-text-muted)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-time application telemetry and hiring status updates</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-[var(--theme-text-muted)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero candidate platform fees & transparent salary bands</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Signature */}
        <div className="relative z-10 pt-6 border-t border-[var(--theme-border)] flex items-center justify-between text-xs text-[var(--theme-text-subtle)] font-medium">
          <span>Enterprise Recruitment Architecture</span>
          <span>© {new Date().getFullYear()} JobOne</span>
        </div>
      </div>

      {/* ─── RIGHT: AUTHENTICATION FORM WELL (Desktop + Mobile) ─────────── */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 xl:p-16 overflow-y-auto min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between pb-6 mb-6 border-b border-[var(--theme-border)]">
          <Link to="/" aria-label="JobOne Home">
            <LogoJobOne
              width={120}
              height={34}
              textColor={isDark ? "#FFFFFF" : "#0F172A"}
              className="w-28 h-auto"
            />
          </Link>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        </div>

        {/* Centered Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-[var(--theme-text)] tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] mt-1.5 leading-relaxed font-normal">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Footer info */}
        <div className="w-full max-w-md mx-auto pt-6 border-t border-[var(--theme-border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--theme-text-subtle)]">
          <Link to="/about" className="hover:text-[var(--theme-text)] transition-colors">
            About JobOne
          </Link>
          <Link to="/contact?subject=privacy" className="hover:text-[var(--theme-text)] transition-colors">
            Privacy Policy
          </Link>
          <Link to="/contact?subject=terms" className="hover:text-[var(--theme-text)] transition-colors">
            Terms of Service
          </Link>
          <Link to="/contact" className="hover:text-[var(--theme-text)] transition-colors">
            Support Desk
          </Link>
        </div>
      </div>
    </div>
  );
}
