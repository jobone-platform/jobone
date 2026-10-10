import React, { useRef, useEffect } from "react";

const NetworkBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    let mouse = { x: -100, y: -100 };

    // Performance Cap: Keep particles low to allow CPU budget for the bloom effect
    const particleCount = 500;

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1,
          radius: 4,
        });
      }
    };
    initParticles();

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      // Clear with transparency so the CSS background shows through
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Update positions
      particles.forEach((p) => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 100 && dist > 0) {
          p.vx += (dx / dist) * -3;
          p.vy += (dy / dist) * -3;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      // 2. Draw Lines (With Bloom)
      ctx.lineWidth = 1;

      particles.forEach((p1, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            const alpha = 1 - dist / 150;

            // Bloom Effect
            // ctx.shadowBlur = 15; // Increased blur slightly to try and cut through the light background
            ctx.shadowColor = `rgba(59, 130, 246, ${alpha})`;
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;

            ctx.stroke();
          }
        }
      });

      // 3. Draw Particles (Reset shadow)
      ctx.shadowBlur = 0;

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#3b82f6"; // Blue nodes
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        // CHANGED: Radial gradient
        // Center: Pure White (#ffffff)
        // Edges: Lighter Blue (#bfdbfe) - Lighter than nodes so they don't vanish
        background:
          "radial-gradient(circle at center, #ffffff 0%, #bfdbfe 100%)",
      }}
    />
  );
};

export default NetworkBackground;
