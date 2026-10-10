import React, { useMemo } from "react";
import { motion } from "framer-motion";

const MobileHeroBg = () => {
  // Memoize the particles so they don't re-render randomly when the parent state changes
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      // Calculate a random angle across the top curve of the planet (approx 210 to 330 degrees)
      const angleDeg = 180 + 30 + Math.random() * 120;
      const angleRad = (angleDeg * Math.PI) / 180;
      
      // Calculate X and Y on the border (radius = 50% of the container)
      const startX = 50 + 50 * Math.cos(angleRad); // %
      const startY = 50 + 50 * Math.sin(angleRad); // %

      return {
        id: i,
        size: 1 + Math.random() * 2, // 1px - 3px
        startX,
        startY,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 3,
        xDrift: (Math.random() - 0.5) * 60,
        yDistance: -200 - Math.random() * 300, 
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full block md:hidden bg-[#010614] overflow-hidden z-0">
      <div className="absolute inset-0 w-full h-full">
        {/* The glowing planet - reverted position, kept radial gradient */}
        <div className="absolute bottom-[-60vw] sm:bottom-[-40vw] left-1/2 -translate-x-1/2 w-[150vw] h-[150vw] max-w-[800px] max-h-[800px] rounded-full border-[1.5px] border-cyan-400/40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#03112e] via-[#010614] to-[#010614] shadow-[0_0_40px_rgba(34,211,238,0.5),inset_0_0_60px_rgba(34,211,238,0.2)]" />
        
        {/* Glowing dust emitting upwards */}
        <div className="absolute bottom-[-60vw] sm:bottom-[-40vw] left-1/2 -translate-x-1/2 w-[150vw] h-[150vw] max-w-[800px] max-h-[800px] pointer-events-none">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-cyan-100"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.startX}%`,
                top: `${p.startY}%`,
              }}
              animate={{
                y: [0, p.yDistance],
                x: [0, p.xDrift],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileHeroBg;
