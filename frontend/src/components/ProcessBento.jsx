import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUserPlus,
  FaSearchDollar,
  FaPaperPlane,
  FaCheckDouble,
} from "react-icons/fa";

export default function ProcessBento() {
  const [activeBlobs, setActiveBlobs] = useState({
    b1: "bg-blue-600",
    b2: "bg-indigo-500",
  });

  // FACT: Added initX and initY so each card enters from a unique direction
  const steps = [
    {
      num: "01",
      title: "Create Profile",
      desc: "Upload your resume and let our AI instantly parse your skills and experience.",
      icon: <FaUserPlus size={32} />,
      circleColor: "bg-blue-500",
      iconColor: "text-blue-500",
      blob1: "bg-blue-500",
      blob2: "bg-cyan-400",
      initX: -100,
      initY: 0, // Comes from Left
    },
    {
      num: "02",
      title: "Smart Search",
      desc: "Our matching engine automatically filters roles that fit your exact expertise.",
      icon: <FaSearchDollar size={32} />,
      circleColor: "bg-indigo-500",
      iconColor: "text-indigo-500",
      blob1: "bg-indigo-500",
      blob2: "bg-purple-500",
      initX: 0,
      initY: -100, // Drops from Top
    },
    {
      num: "03",
      title: "Quick Apply",
      desc: "Submit your profile to verified employers instantly with a single click.",
      icon: <FaPaperPlane size={32} />,
      circleColor: "bg-emerald-500",
      iconColor: "text-emerald-500",
      blob1: "bg-emerald-500",
      blob2: "bg-teal-400",
      initX: 0,
      initY: 100, // Rises from Bottom
    },
    {
      num: "04",
      title: "Get Hired",
      desc: "Track application statuses in real-time and chat directly with HRs.",
      icon: <FaCheckDouble size={32} />,
      circleColor: "bg-amber-500",
      iconColor: "text-amber-500",
      blob1: "bg-amber-500",
      blob2: "bg-orange-500",
      initX: 100,
      initY: 0, // Comes from Right
    },
  ];

  // FACT: Random Twirl Engine implemented for the process icons
  const [twirlingIndex, setTwirlingIndex] = useState(null);

  useEffect(() => {
    // Disable random icon twirling on mobile to save JS execution cycles
    if (window.innerWidth <= 768) return;

    const triggerRandomTwirl = () => {
      const randomIndex = Math.floor(Math.random() * steps.length);
      setTwirlingIndex(randomIndex);

      setTimeout(() => {
        setTwirlingIndex(null);
      }, 1500);

      const nextInterval = Math.random() * 5000 + 100;
      setTimeout(triggerRandomTwirl, nextInterval);
    };

    const initialTimer = setTimeout(triggerRandomTwirl, 5000);
    return () => clearTimeout(initialTimer);
  }, [steps.length]);

  return (
    <section className="relative py-24 bg-[#F8FAFC] font-sans overflow-hidden border-t border-slate-200/60">
      {/* FREEROAMING LAVA LAMP BACKGROUNDS (Desktop Only for Performance) */}
      <div className="hidden md:block absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: ["0vw", "40vw", "-20vw", "30vw", "0vw"],
            y: ["0vh", "30vh", "10vh", "-20vh", "0vh"],
            scale: [1, 1.2, 0.8, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className={`absolute top-[10%] left-[10%] w-[25rem] h-[25rem] rounded-full mix-blend-multiply blur-[100px] opacity-30 transition-colors duration-1000 ease-in-out ${activeBlobs.b1}`}
        />

        <motion.div
          animate={{
            x: ["0vw", "-30vw", "20vw", "-40vw", "0vw"],
            y: ["0vh", "-20vh", "40vh", "10vh", "0vh"],
            scale: [1, 0.9, 1.3, 0.9, 1],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className={`absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full mix-blend-multiply blur-[120px] opacity-30 transition-colors duration-1000 ease-in-out ${activeBlobs.b2}`}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header - Static on Mobile, Animated on Desktop */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-6 h-[2px] bg-blue-600 rounded-full"></span>
            <span className="text-blue-600 font-bold tracking-widest uppercase text-[10px]">
              How it works
            </span>
            <span className="w-6 h-[2px] bg-blue-600 rounded-full"></span>
          </div>
          <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight">
            Your path to a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              new career
            </span>
          </h2>
          <p className="text-slate-500 mt-4 font-medium text-lg max-w-xl mx-auto">
            Simplified, automated, and designed for maximum speed. Skip the long
            forms and get straight to the interviews.
          </p>
        </motion.div>

        {/* Static Header for Mobile */}
        <div className="block md:hidden text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-4 h-[1px] bg-blue-600 rounded-full"></span>
            <span className="text-blue-600 font-bold tracking-widest uppercase text-[9px]">
              How it works
            </span>
            <span className="w-4 h-[1px] bg-blue-600 rounded-full"></span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Your path to a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              new career
            </span>
          </h2>
          <p className="text-slate-500 mt-3 font-medium text-sm max-w-xl mx-auto px-2">
            Simplified, automated, and designed for maximum speed. Skip the long
            forms and get straight to the interviews.
          </p>
        </div>

        {/* Card Grid */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
          onMouseLeave={() =>
            setActiveBlobs({ b1: "bg-blue-600", b2: "bg-indigo-500" })
          }
        >
          {steps.map((step, i) => {
            const cardContent = (
              <>
                {/* Top-Right Decorative Circle */}
                <div
                  className={`w-16 h-16 md:w-28 md:h-28 absolute -right-3 -top-3 md:-right-6 md:-top-6 rounded-full transition-transform duration-500 group-hover:scale-110 ${step.circleColor} flex items-end justify-start pb-2 pl-4 md:pb-5 md:pl-7`}
                >
                  <p className="text-white text-lg md:text-3xl font-black leading-none drop-shadow-md">
                    {step.num}
                  </p>
                </div>

                {/* Card Content */}
                <div className="relative z-10">
                  {/* Desktop Only Twirl Animation */}
                  <div className="hidden md:block">
                    <motion.div
                      animate={
                        twirlingIndex === i
                          ? { y: [0, -15, 0], rotate: [0, 720, 720] }
                          : { y: 0, rotate: 0 }
                      }
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      className={`mb-6 inline-block ${step.iconColor}`}
                    >
                      <div className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110">
                        {step.icon}
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Static Icon for Mobile */}
                  <div className={`block md:hidden mb-4 inline-block ${step.iconColor}`}>
                     {React.cloneElement(step.icon, { size: 20 })}
                  </div>

                  <h3 className="font-extrabold text-sm md:text-xl text-slate-900 mb-2 md:mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                    {step.title}
                  </h3>

                  <p className="text-[10px] md:text-sm text-slate-500 font-medium leading-snug md:leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </>
            );

            return (
              <React.Fragment key={i}>
                {/* Desktop Animated Card */}
                <motion.div
                  initial={{ opacity: 0, x: step.initX, y: step.initY }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    delay: i * 0.1,
                  }}
                  onMouseEnter={() =>
                    setActiveBlobs({ b1: step.blob1, b2: step.blob2 })
                  }
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="hidden md:flex relative bg-white/80 backdrop-blur-sm shadow-[0_4px_15px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_-4px_rgba(0,0,0,0.08)] border border-slate-200/80 hover:border-slate-300 p-8 pt-10 rounded-[2rem] overflow-hidden group transition-colors duration-300 flex-col h-full cursor-default"
                >
                  {cardContent}
                </motion.div>

                {/* Mobile Static Card (No animations) */}
                <div
                  onClick={() => setActiveBlobs({ b1: step.blob1, b2: step.blob2 })}
                  className="flex md:hidden relative bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] border border-slate-200/80 p-4 pt-5 rounded-2xl overflow-hidden group flex-col h-full cursor-default"
                >
                  {cardContent}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
