import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, Building2, ShieldCheck, Sparkles } from "lucide-react";

export default function CompanyCard() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Subtle 3D tilt
  const rotateX = useTransform(scrollYProgress, [0, 1], ["10deg", "-10deg"]);
  const rotateY = useTransform(scrollYProgress, [0, 1], ["-10deg", "10deg"]);

  return (
    <section
      ref={containerRef}
      aria-label="Verified Employer Ecosystem"
      className="px-4 py-16 md:py-20 bg-[var(--theme-bg)] text-[var(--theme-text)] flex justify-center items-center font-sans overflow-hidden transition-colors duration-150"
      style={{ perspective: 1800 }}
    >
      <motion.div
        className="w-full max-w-6xl"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="relative w-full rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border-silver)] shadow-2xl p-8 sm:p-12 md:p-16 overflow-hidden"
        >
          {/* Subtle Ambient Glows */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/[0.02] blur-3xl pointer-events-none"
            style={{ transform: "translateZ(-40px)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/[0.015] blur-3xl pointer-events-none"
            style={{ transform: "translateZ(-40px)" }}
          />

          <div
            className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 lg:gap-14"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Left Content */}
            <div className="w-full md:w-3/5 text-left" style={{ transformStyle: "preserve-3d" }}>
              <div
                className="inline-flex items-center gap-2 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] px-3 py-1.5 text-xs font-semibold text-[var(--theme-text-muted)] mb-5"
                style={{ transform: "translateZ(30px)" }}
              >
                <ShieldCheck className="w-4 h-4 text-[var(--theme-accent-silver)]" />
                <span>Enterprise Employer Directory</span>
              </div>

              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--theme-text)] leading-[1.12]"
                style={{ transform: "translateZ(60px)" }}
              >
                Connect directly with <br />
                <span className="bg-gradient-to-r from-[var(--theme-text)] via-[var(--theme-accent-silver)] to-[var(--theme-text)] bg-clip-text text-transparent">
                  actively hiring companies.
                </span>
              </h2>

              <p
                className="mt-4 text-sm sm:text-base text-[var(--theme-text-muted)] leading-relaxed max-w-lg font-normal"
                style={{ transform: "translateZ(40px)" }}
              >
                Bypass legacy aggregator boards. Discover verified enterprise employers actively publishing requisitions and reviewing candidate portfolios in tech, finance, and engineering.
              </p>

              <div
                className="mt-8 flex flex-wrap items-center gap-4"
                style={{ transform: "translateZ(50px)" }}
              >
                <button
                  type="button"
                  onClick={() => navigate("/companies")}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-sm transition-all hover:scale-105 shadow-sm cursor-pointer group"
                >
                  <span>Explore Verified Companies</span>
                  <ArrowRight className="w-4 h-4 text-[var(--theme-accent-silver)] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/employerregisteroption")}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-transparent hover:bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] font-semibold text-sm transition-colors cursor-pointer"
                >
                  <span>Register Company</span>
                </button>
              </div>
            </div>

            {/* Right Metric Cards Visual Cluster */}
            <div
              className="w-full md:w-2/5 grid grid-cols-2 gap-4"
              style={{ transform: "translateZ(40px)" }}
            >
              <div className="p-5 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-left space-y-2">
                <Building2 className="w-5 h-5 text-[var(--theme-accent-silver)]" />
                <div className="text-2xl font-black text-[var(--theme-text)]">100%</div>
                <div className="text-xs text-[var(--theme-text-muted)] font-medium">
                  Verified Employer Identity
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-left space-y-2">
                <Sparkles className="w-5 h-5 text-[var(--theme-accent-silver)]" />
                <div className="text-2xl font-black text-[var(--theme-text)]">Zero</div>
                <div className="text-xs text-[var(--theme-text-muted)] font-medium">
                  Ghosted Application Queues
                </div>
              </div>

              <div className="col-span-2 p-5 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-left flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-[var(--theme-text-subtle)]">
                    Recruiter Telemetry
                  </div>
                  <div className="text-sm font-bold text-[var(--theme-text)] mt-0.5">
                    Direct Hiring Pipeline
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
