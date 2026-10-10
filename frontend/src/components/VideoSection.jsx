import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaArrowRight, FaBolt, FaUsers, FaClock } from "react-icons/fa";

export default function VideoSection() {
  const containerRef = useRef(null);

  // FACT: The Hydration Lock & Mobile Detection
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Check initial width for mobile optimization
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // ── INTRO ELEMENTS ──────────────────────────────────────
  const subtitleOpacity = useTransform(
    scrollYProgress,
    [0, 0.07, 0.13],
    [1, 1, 0],
  );
  const subtitleY = useTransform(
    scrollYProgress,
    [0.07, 0.13],
    ["0px", "-28px"],
  );
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);
  const progressScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // ── TEXT ZOOM (Desktop) & FADE (Mobile) ────────────────────────────────────────────
  const textScale = useTransform(
    scrollYProgress,
    [0, 0.1, 0.45, 0.85, 0.95, 1.0],
    [1, 1, 300, 300, 1, 1],
  );
  
  const textOpacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.48], // Perfectly synced: finishes fading exactly when the final text (0.48) begins
    [1, 1, 0]
  );

  // ── VIDEO DARKENING ──────────────────────────────────────
  const videoOverlay = useTransform(
    scrollYProgress,
    [0.43, 0.5, 0.8, 0.9],
    [
      "rgba(4, 8, 20, 0)",
      "rgba(4, 8, 20, 0.85)",
      "rgba(4, 8, 20, 0.85)",
      "rgba(4, 8, 20, 0)",
    ],
  );

  // ── FINAL CONTENT ────────────────────────────────────────
  const finalOpacity = useTransform(
    scrollYProgress,
    [0.48, 0.55, 0.8, 0.88],
    [0, 1, 1, 0],
  );
  const finalY = useTransform(
    scrollYProgress,
    [0.48, 0.55, 0.8, 0.88],
    ["60px", "0px", "0px", "-40px"],
  );

  const stat1Op = useTransform(scrollYProgress, [0.5, 0.54], [0, 1]);
  const stat2Op = useTransform(scrollYProgress, [0.52, 0.56], [0, 1]);
  const stat3Op = useTransform(scrollYProgress, [0.54, 0.58], [0, 1]);

  const stat1Y = useTransform(scrollYProgress, [0.5, 0.54], ["30px", "0px"]);
  const stat2Y = useTransform(scrollYProgress, [0.52, 0.56], ["30px", "0px"]);
  const stat3Y = useTransform(scrollYProgress, [0.54, 0.58], ["30px", "0px"]);

  return (
    <section
      ref={containerRef}
      className={`relative ${isMobile ? 'h-[300vh]' : 'h-[600vh]'} bg-white font-sans`}
    >
      {/* FACT: Added [perspective:1000px] to enable 3D GPU sorting inside the sticky container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-white flex items-center justify-center isolate [perspective:1000px]">
        {/* Subtle grain texture */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "150px 150px",
          }}
        />

        {/* ── LAYER 0: FULL-SCREEN VIDEO OR IMAGE ──────────────────── */}
        <div className="absolute inset-0 z-10">
          {!isMobile ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            >
              <source src="/video.mp4" type="video/mp4" />
            </video>
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1080&q=80" 
              alt="Professionals collaborating" 
              className="w-full h-full object-cover" 
            />
          )}
          {/* Base darkening to ensure the white mask doesn't erase the letters */}
          <div className="absolute inset-0 bg-slate-950/40" />
        </div>

        {/* ── LAYER 1: MASK & TEXT EFFECTS ─────────────────────── */}
        {!isMobile ? (
          /* DESKTOP: 300x Zoom through mix-blend hole punch */
          <div className="absolute inset-0 z-20 bg-white mix-blend-screen flex items-center justify-center pointer-events-none [transform:translateZ(-10px)]">
            <motion.div style={{ scale: textScale, transformOrigin: "34% 50%" }}>
              <h1
                className="text-black font-black leading-[0.88] tracking-tight uppercase select-none"
                style={{
                  fontSize: "clamp(100px, 28vw, 320px)",
                  letterSpacing: "-0.02em",
                }}
              >
                JOBONE
              </h1>
            </motion.div>
          </div>
        ) : (
          /* MOBILE: High performance opacity crossfade (Zero blending overhead) */
          <motion.div 
            style={{ opacity: textOpacity }} 
            className="absolute inset-0 z-20 bg-white flex items-center justify-center pointer-events-none [transform:translateZ(-10px)]"
          >
            <h1
              className="text-black font-black leading-[0.88] tracking-tight uppercase select-none"
              style={{
                fontSize: "clamp(60px, 15vw, 100px)",
                letterSpacing: "-0.02em",
              }}
            >
              JOBONE
            </h1>
          </motion.div>
        )}

        {/* ── LAYER 2: INTRO SUBTITLE (Visible on load) ─────────────────────── */}
        <motion.div
          style={{ opacity: subtitleOpacity, y: subtitleY }}
          className="absolute bottom-[22%] z-30 text-center pointer-events-none px-6"
        >
          <p className="text-slate-500 text-sm md:text-base font-medium tracking-[0.22em] uppercase">
            Discover your next opportunity
          </p>
        </motion.div>

        {/* ── SCROLL HINTS & PROGRESS ───────────────────────────── */}
        <motion.div
          style={{ opacity: scrollHintOpacity }}
          className="absolute bottom-8 z-30 flex flex-col items-center gap-2 pointer-events-none"
        >
          <div className="w-5 h-8 border-[1.5px] border-slate-400/60 rounded-full flex items-start justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 9, 0] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-[3px] h-[6px] bg-slate-400/70 rounded-full"
            />
          </div>
          <span className="text-[10px] text-slate-400/60 uppercase tracking-[0.2em] font-medium">
            Scroll
          </span>
        </motion.div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 h-24 w-[2px] bg-white/10 z-30 rounded-full overflow-hidden">
          <motion.div
            style={{ scaleY: progressScaleY, originY: 0 }}
            className="w-full h-full bg-blue-500/60 rounded-full"
          />
        </div>

        {/* ── HYDRATION LOCK: ONLY RENDERS AFTER JS HAS LOADED ──────────────── */}
        {isMounted && (
          <>
            {/* ── LAYER 3: DYNAMIC VIDEO DARKENING ───────────── */}
            {/* FACT: translateZ(50px) pushes the dark overlay FORWARD */}
            <motion.div
              style={{ backgroundColor: videoOverlay }}
              className="absolute inset-0 z-40 pointer-events-none [transform:translateZ(50px)]"
            />

            {/* ── LAYER 4: FINAL TEXT & CTA ────────────── */}
            {/* FACT: translateZ(100px) pushes the final text completely to the front of the 3D space */}
            <motion.div
              style={{ opacity: finalOpacity, y: finalY }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center px-6 [transform:translateZ(100px)] pointer-events-none"
            >
              <div className="flex items-center gap-3 mb-5 justify-center">
                <span className="w-8 h-px bg-blue-400/70 rounded-full" />
                <span className="text-blue-400 font-semibold tracking-[0.28em] uppercase text-[10px]">
                  Product Tour
                </span>
                <span className="w-8 h-px bg-blue-400/70 rounded-full" />
              </div>

              <h2 className="text-4xl md:text-6xl lg:text-[72px] font-extrabold text-white tracking-tight leading-[1.05] mb-5">
                How JOBONE helps you
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-indigo-400">
                  grow faster.
                </span>
              </h2>

              <p className="text-slate-300/90 text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed font-normal">
                Discover top talent or your next big opportunity — powered by AI
                that actually understands your career.
              </p>

              <div className="flex items-center gap-8 md:gap-12 mb-10">
                <motion.div
                  style={{ opacity: stat1Op, y: stat1Y }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <FaUsers className="text-blue-400" size={13} />
                    <span className="text-2xl md:text-3xl font-black text-white">
                      1M+
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    Community
                  </span>
                </motion.div>

                <div className="w-px h-10 bg-white/10" />

                <motion.div
                  style={{ opacity: stat2Op, y: stat2Y }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <FaBolt className="text-violet-400" size={12} />
                    <span className="text-2xl md:text-3xl font-black text-white">
                      98%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    Match Rate
                  </span>
                </motion.div>

                <div className="w-px h-10 bg-white/10" />

                <motion.div
                  style={{ opacity: stat3Op, y: stat3Y }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <FaClock className="text-indigo-400" size={12} />
                    <span className="text-2xl md:text-3xl font-black text-white">
                      48h
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    Avg. Hire Time
                  </span>
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-sm md:text-base shadow-[0_0_40px_rgba(99,102,241,0.45)] hover:bg-blue-500 transition-colors flex items-center gap-2.5 mx-auto pointer-events-auto"
              >
                Get Started Free <FaArrowRight size={13} />
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
