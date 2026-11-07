import React from "react";
import { Link } from "react-router-dom";
import { Compass, Home, Briefcase, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-background text-foreground transition-colors">
      <div className="max-w-md w-full text-center bg-surface-1 rounded-3xl p-8 sm:p-12 shadow-2xl border border-border">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-surface-2 border border-border text-silver flex items-center justify-center">
          <Compass className="w-8 h-8 animate-pulse text-silver" />
        </div>

        <span className="text-[11px] font-mono tracking-widest uppercase text-silver">
          HTTP 404 • ROUTE UNRESOLVED
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mt-2 mb-3">
          Requisition Not Found
        </h1>
        <p className="text-foreground/60 text-xs sm:text-sm leading-relaxed mb-8">
          The requested page or resource does not exist, has expired, or may have been relocated across the platform architecture.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-foreground text-background font-semibold text-xs transition hover:opacity-90 active:scale-[0.99] shadow-md"
          >
            <Home size={14} />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/jobs"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-foreground border border-border font-semibold text-xs transition"
          >
            <Briefcase size={14} />
            <span>Browse Active Jobs</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-foreground/50 hover:text-foreground transition cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Step back to previous view</span>
          </button>
        </div>
      </div>
    </div>
  );
}
