import React from "react";

export default function Services() {
return(
<section id="services" className="min-h-screen bg-slate-50 dark:bg-slate-950 py-32 px-6 transition-colors duration-150">
    <div className="container mx-auto max-w-5xl">
      <h3 className="text-3xl font-bold text-center mb-10 text-blue-600 dark:text-blue-400">
          Our Services
      </h3>
      <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl p-6 text-center hover:shadow-md transition-all">
              <h4 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Job Listings</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Browse thousands of job opportunities tailored for you.
              </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl p-6 text-center hover:shadow-md transition-all">
              <h4 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Resume Builder</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Create professional resumes to stand out from the crowd.
              </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl p-6 text-center hover:shadow-md transition-all">
              <h4 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Career Guidance</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Get expert advice to build and grow your career.
              </p>
          </div>
      </div>
    </div>
</section>
)}