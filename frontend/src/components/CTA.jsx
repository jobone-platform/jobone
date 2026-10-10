import React from "react";
import { motion } from "framer-motion";
import { FaBriefcase, FaUserPlus, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-20 bg-white font-sans border-t border-slate-200/60">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Candidate Card */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 md:p-12 rounded-[2rem] text-white relative overflow-hidden group shadow-[0_8px_30px_-4px_rgba(37,99,235,0.3)]"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 border border-white/20">
                <FaBriefcase size={20} className="text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">
                Looking for a job?
              </h3>
              <p className="text-blue-100 mb-8 max-w-sm font-medium leading-relaxed">
                Join thousands of professionals and find your dream role today.
                Filter by skills, location, and salary.
              </p>
              <Link to="/jobs">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm">
                  Apply Now <FaArrowRight size={12} />
                </button>
              </Link>
            </div>
            {/* Decorative background icon */}
            <FaBriefcase className="absolute -bottom-12 -right-12 text-white/5 text-[14rem] group-hover:rotate-12 group-hover:scale-110 transition-transform duration-700 ease-out" />
          </motion.div>

          {/* Employer Card */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-slate-900 p-10 md:p-12 rounded-[2rem] text-white relative overflow-hidden group shadow-[0_8px_30px_-4px_rgba(15,23,42,0.4)] border border-slate-800"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 border border-slate-700">
                <FaUserPlus size={20} className="text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">
                Are you hiring talent?
              </h3>
              <p className="text-slate-400 mb-8 max-w-sm font-medium leading-relaxed">
                Post your open roles and reach the top 1% of verified
                candidates. Screen resumes with AI instantly.
              </p>
              <Link to="/createjob">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/50">
                  Post a Job <FaArrowRight size={12} />
                </button>
              </Link>
            </div>
            {/* Decorative background icon */}
            <FaUserPlus className="absolute -bottom-12 -right-12 text-white/5 text-[14rem] group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-700 ease-out" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
