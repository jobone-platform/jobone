import React from "react";
import { Link } from "react-router-dom";
import { Compass, Home, Briefcase, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-lg w-full text-center bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Compass className="w-10 h-10 animate-pulse" />
        </div>

        <span className="text-sm font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
          404 Error
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2 mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
          The page you are looking for doesn't exist, was removed, or may have had its URL changed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <Link
            to="/jobs"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-sm transition active:scale-[0.98]"
          >
            <Briefcase className="w-4 h-4" />
            Explore Jobs
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Go back to previous page
          </button>
        </div>
      </div>
    </div>
  );
}
