import React, { useRef, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import heroVideo from "../../assets/herovideo.mp4";

/**
 * Shared architectural background video + readability overlays
 * preserved for both Candidate and Employer homepages across desktop and mobile.
 * Optimized for macOS Safari, Retina displays, and battery-conscious WebKit devices.
 * Respects Tauri desktop shell and OS reduced-motion preferences.
 */
export default function HeroBackgroundVideo() {
  const prefersReducedMotion = useReducedMotion();
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setVideoLoaded(true))
          .catch((_err) => {
            // Safari Low Power Mode, battery saver, or autoplay restriction
            // Safely caught without throwing unhandled rejection error
          });
      }
    }
  }, [prefersReducedMotion]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {!window.__TAURI__ && !prefersReducedMotion && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover opacity-20 transition-opacity duration-700 ${
            videoLoaded ? "opacity-20" : "opacity-10"
          }`}
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          webkit-playsinline="true"
          x5-playsinline="true"
          aria-hidden="true"
          style={{
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
            willChange: "transform",
          }}
          onLoadedData={() => setVideoLoaded(true)}
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
