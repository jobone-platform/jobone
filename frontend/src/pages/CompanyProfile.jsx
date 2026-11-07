import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Building2,
  MapPin,
  Globe,
  Briefcase,
  ExternalLink,
  ArrowLeft,
  Clock,
  IndianRupee,
  Users,
  Mail,
  Phone,
  UserCircle,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import JobDetailsModal from "../components/JobDetailsModal";
import { API_BASE_URL } from "../config/api";

export default function CompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const [profileRes, jobsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/employer/profile/${id}`),
          axios.get(`${API_BASE_URL}/jobs`).catch(() => ({ data: [] })),
        ]);

        setCompany(profileRes.data);

        const allJobs = Array.isArray(jobsRes.data.data)
          ? jobsRes.data.data
          : jobsRes.data;
        const companyJobs = (allJobs || []).filter(
          (j) =>
            j.postedBy === id &&
            j.status !== "pending_approval" &&
            j.status !== "rejected" &&
            j.status !== "disregarded"
        );
        setJobs(companyJobs);
      } catch (err) {
        console.error("Failed to load company profile", err);
        setError("This employer profile is currently unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  const renderArray = (val) => {
    if (!val) return "";
    if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "";
    return String(val);
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center">
        <Loader2 className="animate-spin text-silver mb-3" size={36} />
        <p className="text-xs font-mono uppercase tracking-widest text-foreground/50">
          Loading Enterprise Dossier...
        </p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4">
        <div className="bg-surface-1 p-8 rounded-3xl border border-border text-center max-w-md w-full shadow-2xl">
          <Building2 className="mx-auto text-foreground/30 mb-4" size={54} />
          <h2 className="text-xl font-display font-bold text-foreground mb-2">
            Enterprise Not Found
          </h2>
          <p className="text-foreground/60 text-xs mb-6">
            {error || "This employer profile could not be retrieved from the directory."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/companies")}
            className="w-full py-3 rounded-xl bg-foreground text-background font-semibold text-xs tracking-wide hover:opacity-90 transition cursor-pointer"
          >
            Return to Employer Directory
          </button>
        </div>
      </div>
    );
  }

  const companyDisplayLocation =
    typeof company.location === "object"
      ? company.location?.address
      : company.location;
  const logo = company.profilePicture || company.image;
  const displayName = company.companyName || company.name || "Enterprise Employer";

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 transition-colors">
      {/* --- HERO ARCHITECTURAL COVER --- */}
      <div className="h-44 sm:h-60 bg-surface-2 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-40" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative flex items-start pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-1/80 border border-border text-xs font-mono text-foreground/80 hover:text-foreground backdrop-blur-md transition cursor-pointer"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10 space-y-8">
        {/* --- MAIN HEADER CARD --- */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-1 rounded-3xl p-6 sm:p-8 border border-border shadow-2xl flex flex-col sm:flex-row gap-6 items-center sm:items-end text-center sm:text-left"
        >
          {/* Logo */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 bg-surface-2 rounded-2xl border-2 border-border flex items-center justify-center shrink-0 shadow-lg overflow-hidden mt-[-3.5rem] sm:mt-[-4.5rem] relative z-20">
            {logo ? (
              <img
                src={logo}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 size={48} className="text-foreground/40" />
            )}
          </div>

          <div className="flex-1 pb-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-surface-2 border border-border text-silver flex items-center gap-1">
                <ShieldCheck size={12} className="text-silver" />
                <span>Verified Enterprise</span>
              </span>
              {company.industry && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-surface-2 border border-border text-foreground/70">
                  {company.industry}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-foreground mb-1.5">
              {displayName}
            </h1>

            <p className="text-xs sm:text-sm text-foreground/60 flex items-center justify-center sm:justify-start gap-1.5">
              <MapPin size={14} className="text-foreground/40" />
              <span>{companyDisplayLocation || "Distributed / Global Workplace"}</span>
            </p>
          </div>

          {company.companyWebsite && (
            <div className="pb-1">
              <a
                href={
                  company.companyWebsite.startsWith("http")
                    ? company.companyWebsite
                    : `https://${company.companyWebsite}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground hover:border-silver/60 text-xs font-semibold transition shadow-sm"
              >
                <Globe size={14} className="text-silver" />
                <span>Corporate Site</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN: ABOUT & ACTIVE REQUISITIONS --- */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-surface-1 rounded-3xl p-6 sm:p-8 border border-border shadow-sm">
              <h2 className="text-xs font-mono uppercase tracking-widest text-foreground/60 mb-4 pb-3 border-b border-border flex items-center gap-2">
                <Building2 size={14} className="text-silver" />
                <span>Enterprise Overview</span>
              </h2>
              {company.description ? (
                <div className="text-xs sm:text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed font-sans">
                  {company.description}
                </div>
              ) : (
                <p className="text-xs text-foreground/50 italic">
                  No editorial description provided for this organization.
                </p>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-border">
                <h2 className="text-lg font-display font-bold text-foreground">
                  Active Requisitions
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-surface-2 border border-border text-foreground">
                  {jobs.length} Open
                </span>
              </div>

              {jobs.length === 0 ? (
                <div className="bg-surface-1 rounded-3xl p-10 text-center border border-border shadow-sm">
                  <Briefcase className="mx-auto text-foreground/30 mb-3" size={40} />
                  <h3 className="text-base font-display font-bold text-foreground">
                    No active postings
                  </h3>
                  <p className="text-xs text-foreground/50 mt-1 max-w-xs mx-auto">
                    This employer currently has no active requisitions published on JobOne.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => {
                    const jobLocation =
                      typeof job.location === "object"
                        ? job.location.address
                        : job.location || "Remote";
                    return (
                      <div
                        key={job._id}
                        onClick={() => setSelectedJob(job)}
                        className="bg-surface-1 rounded-2xl p-5 border border-border hover:border-silver/60 transition-all cursor-pointer group flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm hover:shadow-md"
                      >
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-display font-bold text-foreground group-hover:text-silver transition-colors line-clamp-1 mb-2">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-xs text-foreground/60">
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-silver" />
                              <span className="truncate max-w-[150px]">{jobLocation}</span>
                            </span>
                            <span>•</span>
                            <span className="capitalize">{renderArray(job.jobType)}</span>
                            <span>•</span>
                            <span className="font-mono">
                              {job.salaryAmount
                                ? `₹${job.salaryAmount.toLocaleString()}`
                                : job.salaryMin && job.salaryMax
                                ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()}`
                                : "Competitive"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                          <span className="text-[10px] font-mono text-foreground/40">
                            {formatTimeAgo(job.postedAt || job.createdAt)}
                          </span>
                          <span className="px-3.5 py-1.5 rounded-xl bg-surface-2 border border-border text-foreground font-semibold text-xs group-hover:bg-foreground group-hover:text-background transition-all">
                            Review Role →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* --- RIGHT COLUMN: ENTERPRISE SNAPSHOT --- */}
          <div className="lg:col-span-1">
            <section className="bg-surface-1 rounded-3xl p-6 sm:p-7 border border-border shadow-sm sticky top-24 space-y-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-foreground/60 pb-3 border-b border-border">
                Enterprise Dossier
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <UserCircle size={12} className="text-silver" /> Talent Representative
                  </p>
                  <p className="font-semibold text-foreground">
                    {company.name || "Talent Acquisition Team"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Mail size={12} className="text-silver" /> Verified Domain Email
                  </p>
                  <p className="font-mono text-foreground/90 break-all">
                    {company.email ? (
                      <a href={`mailto:${company.email}`} className="hover:underline">
                        {company.email}
                      </a>
                    ) : (
                      "Protected"
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Building2 size={12} className="text-silver" /> Primary Industry
                  </p>
                  <p className="font-semibold text-foreground">
                    {company.industry || "Technology & Services"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Users size={12} className="text-silver" /> Company Size
                  </p>
                  <p className="font-semibold text-foreground">
                    {company.companySize ? `${company.companySize} Team Members` : "Enterprise Scale"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* --- INTEGRATED JOB DETAILS MODAL --- */}
      <AnimatePresence>
        {selectedJob && (
          <JobDetailsModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
