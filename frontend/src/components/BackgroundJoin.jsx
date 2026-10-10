import React, { useRef, useEffect } from "react";

const BackgroundJoin = ({ theme = "user" }) => {
  const canvasRef = useRef(null);
  const colorRef = useRef("59, 130, 246");

  useEffect(() => {
    colorRef.current = theme === "employer" ? "99, 102, 241" : "59, 130, 246";
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      // FACT: Using clientWidth/clientHeight ignores the Windows scrollbar.
      // This permanently stops the horizontal scroll blowout on PCs.
      canvas.width = document.documentElement.clientWidth;
      canvas.height = document.documentElement.clientHeight;
    };
    resizeCanvas();

    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    // CONFIGURATION
    const particleCount = 80;
    const connectionDistance = 140;
    const mouseDistance = 280;

    const initParticles = () => {
      particles = [];
      const isMobile = document.documentElement.clientWidth < 640;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: isMobile ? 3 : 6,
        });
      }
    };
    initParticles();

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorRef.current}, 0.8)`;
        ctx.fill();

        for (let j = index; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const alpha = 1 - dist / connectionDistance;
            ctx.strokeStyle = `rgba(${colorRef.current}, ${alpha})`;
            ctx.stroke();
          }
        }

        const distToMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (distToMouse < mouseDistance) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          const alpha = 1 - distToMouse / mouseDistance;
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.stroke();
        }
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
        display: "block",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: -1,
      }}
    />
  );
};

export default BackgroundJoin;
