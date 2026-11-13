import React from "react";
import { useReducedMotion } from "framer-motion";
import heroVideo from "../../assets/herovideo.mp4";

/**
 * Shared architectural background video + readability overlays
 * preserved for both Candidate and Employer homepages across desktop and mobile.
 * Respects Tauri desktop shell and OS reduced-motion preferences.
 */
export default function HeroBackgroundVideo() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {!window.__TAURI__ && !prefersReducedMotion && (
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
      )}

      {/* Readability gradient overlay for light & dark themes */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-bg)]/45 via-transparent to-[var(--theme-bg)]/80" />

      {/* Ambient Gradient Highlights */}
      <div className="absolute top-1/4 -left-20 w-72 sm:w-96 h-72 sm:h-96 bg-white/[0.03] dark:bg-white/[0.02] rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-72 sm:w-[30rem] h-72 sm:h-[30rem] bg-white/[0.02] rounded-full blur-3xl" />

      {/* Grid Pattern Sheen */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.06),transparent)]" />
    </div>
  );
}
