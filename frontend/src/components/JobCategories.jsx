import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaCode,
  FaChartLine,
  FaBullhorn,
  FaHeadset,
  FaArrowRight,
  FaHeartbeat,
  FaCogs,
  FaTruck,
  FaUserTie,
  FaGraduationCap,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// FACT: The static array no longer holds fake counts. It only holds UI configuration.
const categories = [
  // ROW 1
  {
    name: "IT & Software",
    icon: FaCode,
    color: "from-blue-500 to-cyan-400",
    blob1: "bg-blue-500",
    blob2: "bg-cyan-400",
    shadow: "shadow-blue-500/20",
    initX: -100,
    initY: -100,
    initScale: 1,
  },
  {
    name: "Banking & Finance",
    icon: FaChartLine,
    color: "from-emerald-400 to-teal-500",
    blob1: "bg-emerald-400",
    blob2: "bg-teal-500",
    shadow: "shadow-emerald-500/20",
    initX: 0,
    initY: -100,
    initScale: 1,
  },
  {
    name: "Sales & Marketing",
    icon: FaBullhorn,
    color: "from-purple-500 to-pink-500",
    blob1: "bg-purple-500",
    blob2: "bg-pink-500",
    shadow: "shadow-purple-500/20",
    initX: 100,
    initY: -100,
    initScale: 1,
  },
  // ROW 2
  {
    name: "Healthcare & Pharma",
    icon: FaHeartbeat,
    color: "from-rose-400 to-red-500",
    blob1: "bg-rose-400",
    blob2: "bg-red-500",
    shadow: "shadow-rose-500/20",
    initX: -100,
    initY: 0,
    initScale: 1,
  },
  {
    name: "Engineering & Manufacturing",
    icon: FaCogs,
    color: "from-amber-400 to-orange-600",
    blob1: "bg-amber-400",
    blob2: "bg-orange-600",
    shadow: "shadow-amber-500/20",
    initX: 0,
    initY: 0,
    initScale: 0.5,
  },
  {
    name: "Operations & Logistics",
    icon: FaTruck,
    color: "from-slate-500 to-slate-700",
    blob1: "bg-slate-500",
    blob2: "bg-slate-700",
    shadow: "shadow-slate-500/20",
    initX: 100,
    initY: 0,
    initScale: 1,
  },
  // ROW 3
  {
    name: "Customer Support",
    icon: FaHeadset,
    color: "from-indigo-500 to-blue-600",
    blob1: "bg-indigo-500",
    blob2: "bg-blue-600",
    shadow: "shadow-indigo-500/20",
    initX: -100,
    initY: 100,
    initScale: 1,
  },
  {
    name: "HR & Admin",
    icon: FaUserTie,
    color: "from-fuchsia-500 to-purple-600",
    blob1: "bg-fuchsia-500",
    blob2: "bg-purple-600",
    shadow: "shadow-fuchsia-500/20",
    initX: 0,
    initY: 100,
    initScale: 1,
  },
  {
    name: "Education & EdTech",
    icon: FaGraduationCap,
    color: "from-yellow-400 to-orange-500",
    blob1: "bg-yellow-400",
    blob2: "bg-orange-500",
    shadow: "shadow-yellow-500/20",
    initX: 100,
    initY: 100,
    initScale: 1,
  },
];

export default function JobCategories() {
  const navigate = useNavigate();

  // FACT: Added dynamic state for the live database counts
  const [realCounts, setRealCounts] = useState({});
  const [activeBlobs, setActiveBlobs] = useState({
    b1: "bg-blue-600",
    b2: "bg-indigo-500",
  });

  useEffect(() => {
    // FACT: Fetch the aggregated counts from the database on mount
    const fetchCategoryCounts = async () => {
      try {
        const { data } = await axios.get(
          "https://jobone-mrpy.onrender.com/jobs/category-counts",
        );
        setRealCounts(data);
      } catch (err) {
        console.error("Failed to fetch live job counts:", err);
      }
    };
    fetchCategoryCounts();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/jobs?industry=${encodeURIComponent(category)}`);
  };

  return (
    <section className="relative py-10 bg-[#F8FAFC] font-sans overflow-hidden w-full">
      {/* FREEROAMING LAVA LAMP BACKGROUNDS */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Desktop Animated Blobs */}
        <div className="hidden md:block">
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
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`absolute top-[40%] right-[10%] w-[35rem] h-[35rem] rounded-full mix-blend-multiply blur-[120px] opacity-30 transition-colors duration-1000 ease-in-out ${activeBlobs.b2}`}
          />
        </div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 lg:px-16 mx-auto max-w-[1600px]">
        {/* Desktop Animated Heading */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[2px] bg-blue-600 rounded-full"></span>
              <span className="text-blue-600 font-bold tracking-widest uppercase text-[10px]">
                Industries
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Browse by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                Specialty
              </span>
            </h2>
          </div>
          <button className="text-slate-500 text-sm font-semibold hover:text-blue-600 transition-colors flex items-center gap-1.5 group pb-1">
            View all categories
            <FaArrowRight
              className="group-hover:translate-x-1 transition-transform"
              size={12}
            />
          </button>
        </motion.div>

        {/* Mobile Static Heading */}
        <div className="flex md:hidden flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[2px] bg-blue-600 rounded-full"></span>
              <span className="text-blue-600 font-bold tracking-widest uppercase text-[10px]">
                Industries
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Browse by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                Specialty
              </span>
            </h2>
          </div>
          <button className="text-slate-500 text-xs font-semibold hover:text-blue-600 transition-colors flex items-center gap-1.5 group pb-1">
            View all categories
            <FaArrowRight size={10} />
          </button>
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5"
          onMouseLeave={() =>
            setActiveBlobs({ b1: "bg-blue-600", b2: "bg-indigo-500" })
          }
        >
          {categories.map((cat, index) => {
            // FACT: Dynamically extracting the database count for this exact card
            // We map "Engineering & Mfg." strictly back to the DB schema string for lookup
            const lookupName =
              cat.name === "Engineering & Mfg."
                ? "Engineering & Manufacturing"
                : cat.name;
            const liveCount = realCounts[lookupName] || 0;
            const countLabel = liveCount === 1 ? "1 Job" : `${liveCount} Jobs`;

            const cardContent = (
              <>
                <div
                  className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${cat.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20 hidden md:block`}
                />

                <div className="relative z-10 flex flex-col h-full justify-between gap-3 md:gap-6">
                  {/* Static logo wrapper */}
                  <div className="w-8 h-8 md:w-12 md:h-12">
                    <div
                      className={`w-full h-full rounded-xl md:rounded-xl rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-lg ${cat.shadow} group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300`}
                    >
                      <cat.icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h3 className="text-xs md:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-slate-500 font-medium text-[10px] md:text-sm mt-1 md:mt-1.5 flex items-center gap-1.5 md:gap-2">
                      <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${liveCount > 0 ? "bg-emerald-400" : "bg-slate-400"}`}
                        ></span>
                        <span
                          className={`relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 ${liveCount > 0 ? "bg-emerald-500" : "bg-slate-400"}`}
                        ></span>
                      </span>
                      {countLabel}
                    </p>
                  </div>
                </div>

                {/* Diagonal Arrow */}
                <div className="absolute bottom-5 right-5 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hidden md:block">
                  <div className="p-2.5 rounded-full bg-slate-50 text-slate-900 border border-slate-200 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                    <FaArrowRight className="-rotate-45" size={12} />
                  </div>
                </div>
              </>
            );

            return (
              <React.Fragment key={index}>
                {/* Desktop Animated Card */}
                <motion.div
                  initial={{
                    opacity: 0,
                    x: cat.initX,
                    y: cat.initY,
                    scale: cat.initScale,
                  }}
                  whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 15,
                    delay: index === 4 ? 0.2 : 0,
                  }}
                  onClick={() => handleCategoryClick(lookupName)}
                  onMouseEnter={() =>
                    setActiveBlobs({ b1: cat.blob1, b2: cat.blob2 })
                  }
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="hidden md:flex flex-col group relative overflow-hidden rounded-2xl bg-white/30 backdrop-blur-md p-6 border border-slate-200/80 shadow-[0_4px_15px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_-4px_rgba(0,0,0,0.1)] hover:border-slate-300 cursor-pointer transition-colors duration-300 h-full"
                >
                  {cardContent}
                </motion.div>

                {/* Mobile Static Card (No animations, pure HTML/CSS) */}
                <div
                  onClick={() => handleCategoryClick(lookupName)}
                  className="flex md:hidden flex-col group relative overflow-hidden rounded-xl bg-white p-3.5 border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] cursor-pointer h-full"
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
