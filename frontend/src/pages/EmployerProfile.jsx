import { API_BASE_URL } from "../config/api";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import EmployerLayout from "../components/employer/EmployerLayout.jsx";
import {
  Edit,
  MapPin,
  Globe,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  FileText,
  Star,
  Calendar,
  Building,
  User,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  Clock,
  XOctagon,
  PlusCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function EmployerProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = localStorage.getItem("employerInfo");
        if (!storedData) return navigate("/login");

        const info = JSON.parse(storedData);
        const token = info.token;
        const employerID = info.id || info.employerId;

        if (!token || !employerID) return navigate("/login");

        const [profileRes, jobsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/employer/profile/${employerID}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios
            .get(`${API_BASE_URL}/jobs/employer-jobs`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: [] })),
        ]);

        setProfile(profileRes.data);
        const resolvedJobs = Array.isArray(jobsRes.data)
          ? jobsRes.data
          : jobsRes.data?.jobs || [];
        setJobs(resolvedJobs);
      } catch (err) {
        console.error("Failed to load employer profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const calculateRating = (ratings) => {
    if (!ratings || ratings.length === 0) return "5.0";
    const total = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return (total / ratings.length).toFixed(1);
  };

  if (loading) {
    return (
      <EmployerLayout activeTab="profile" title="Company Profile">
        <div className="py-24 flex flex-col items-center justify-center text-[var(--theme-text-muted)]">
          <Loader2 size={36} className="animate-spin text-[var(--theme-accent-silver)] mb-4" />
          <p className="text-sm font-semibold">Loading enterprise dossier...</p>
        </div>
      </EmployerLayout>
    );
  }

  if (!profile) {
    return (
      <EmployerLayout activeTab="profile" title="Profile Unavailable">
        <div className="py-20 text-center max-w-md mx-auto">
          <p className="text-sm text-[var(--theme-text-muted)]">
            Unable to load profile information.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[var(--theme-text)] text-[var(--theme-bg)] rounded-xl text-xs font-bold"
          >
            Retry
          </button>
        </div>
      </EmployerLayout>
    );
  }

  const companyName =
    profile.employerType === "company"
      ? profile.companyName || profile.name
      : profile.name;

  const initials = companyName
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CO";

  const isApproved = profile.isApproved === "approved";
  const employerId = profile._id || profile.id;

  return (
    <EmployerLayout
      activeTab="profile"
      title="Company Profile"
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "Company Profile" },
      ]}
      approvalStatus={profile.isApproved}
      employerInfo={profile}
    >
      <div className="space-y-6 sm:space-y-8">
        {/* 1. EDITORIAL SHOWCASE HEADER */}
        <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Logo / Initials Monogram */}
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={companyName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-[var(--theme-border-silver)] bg-[var(--theme-surface-elevated)] shadow-sm shrink-0"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex items-center justify-center font-bold text-2xl text-[var(--theme-text)] shrink-0 shadow-sm">
                  {initials}
                </div>
              )}

              {/* Company Info */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-text)] tracking-tight truncate">
                    {companyName}
                  </h1>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--theme-surface-elevated)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)]">
                    {profile.employerType === "company" ? (
                      <Building size={11} />
                    ) : (
                      <User size={11} />
                    )}
                    {profile.employerType === "company" ? "Company" : "Individual"}
                  </span>

                  {isApproved ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck size={11} />
                      Verified Employer
                    </span>
                  ) : profile.isApproved === "rejected" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                      <XOctagon size={11} />
                      Denied
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock size={11} />
                      Under Review
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--theme-text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[var(--theme-accent-silver)] shrink-0" />
                    <span>
                      {profile.officeLocation?.address || profile.location || "HQ Location Not Set"}
                    </span>
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[var(--theme-accent-silver)] shrink-0" />
                    <span>Member since {new Date(profile.createdAt || Date.now()).getFullYear()}</span>
                  </span>

                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star size={13} fill="currentColor" />
                    <span>{calculateRating(profile.ratingsReceived)}</span>
                    <span className="text-[var(--theme-text-subtle)] font-normal">
                      ({profile.ratingsReceived?.length || 0} reviews)
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <Link
                to="/employereditprofile"
                className="flex-1 md:flex-none justify-center inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-sm"
              >
                <Edit size={15} />
                <span>Edit Profile</span>
              </Link>

              {employerId && (
                <Link
                  to={`/company/${employerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none justify-center inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs sm:text-sm font-semibold text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors"
                >
                  <span>Public View</span>
                  <ExternalLink size={14} className="text-[var(--theme-accent-silver)]" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 2. MAIN BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Metadata & Documents */}
          <div className="space-y-6">
            {/* Business Dossier */}
            <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text-subtle)] font-bold">
                Enterprise Dossier
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[var(--theme-text-subtle)] block text-[11px]">Industry</span>
                  <span className="font-semibold text-[var(--theme-text)]">
                    {profile.industry || "General Industry"}
                  </span>
                </div>

                {profile.natureOfBusiness && (
                  <div>
                    <span className="text-[var(--theme-text-subtle)] block text-[11px]">
                      Nature of Business
                    </span>
                    <span className="font-semibold text-[var(--theme-text)]">
                      {profile.natureOfBusiness}
                    </span>
                  </div>
                )}

                {profile.companyWebsite && (
                  <div>
                    <span className="text-[var(--theme-text-subtle)] block text-[11px]">Website</span>
                    <a
                      href={
                        profile.companyWebsite.startsWith("http")
                          ? profile.companyWebsite
                          : `https://${profile.companyWebsite}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[var(--theme-accent-silver)] hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>{profile.companyWebsite.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Point of Contact */}
            <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text-subtle)] font-bold">
                Authorized Point of Contact
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <User size={15} className="text-[var(--theme-accent-silver)] shrink-0" />
                  <div>
                    <span className="text-[var(--theme-text-subtle)] block text-[10px]">Contact Person</span>
                    <span className="font-semibold text-[var(--theme-text)]">{profile.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="text-[var(--theme-accent-silver)] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[var(--theme-text-subtle)] block text-[10px]">Corporate Email</span>
                    <span className="font-semibold text-[var(--theme-text)] truncate block">
                      {profile.email}
                    </span>
                  </div>
                </div>

                {profile.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={15} className="text-[var(--theme-accent-silver)] shrink-0" />
                    <div>
                      <span className="text-[var(--theme-text-subtle)] block text-[10px]">Direct Line</span>
                      <span className="font-semibold text-[var(--theme-text)]">{profile.phone}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Documents Summary */}
            <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text-subtle)] font-bold">
                  KYC Verification Docs
                </h2>
                <Link
                  to="/employerdocupload"
                  className="text-[11px] font-semibold text-[var(--theme-accent-silver)] hover:underline"
                >
                  Manage
                </Link>
              </div>

              <div className="space-y-2 text-xs">
                <DocumentRow name="Aadhar Identity" uploaded={Boolean(profile.aadharCard)} />
                <DocumentRow name="PAN Verification" uploaded={Boolean(profile.panCard)} />
                {profile.employerType === "company" ? (
                  <>
                    <DocumentRow name="GST Certificate" uploaded={Boolean(profile.gstForm)} />
                    <DocumentRow
                      name="Business Incorporation"
                      uploaded={Boolean(profile.otherBusinessCertificate)}
                    />
                  </>
                ) : (
                  <>
                    <DocumentRow name="Trade License" uploaded={Boolean(profile.tradeLicense)} />
                    <DocumentRow
                      name="Educational Credentials"
                      uploaded={Boolean(profile.educationDocuments)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Story & Active Job Openings */}
          <div className="lg:col-span-2 space-y-6">
            {/* About / Corporate Story */}
            <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-6 sm:p-7 shadow-sm">
              <h2 className="text-sm font-bold text-[var(--theme-text)] mb-3 flex items-center gap-2">
                <Briefcase size={16} className="text-[var(--theme-accent-silver)]" />
                <span>About the Organization</span>
              </h2>

              <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] leading-relaxed whitespace-pre-wrap">
                {profile.description ||
                  "No company narrative provided yet. Click 'Edit Profile' to add your organization's mission and team values."}
              </p>

              {profile.description &&
                (profile.description.split(/\s+/).filter((w) => w.length > 0).length < 50 ||
                  profile.description.split(/\s+/).filter((w) => w.length > 0).length > 200) && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2">
                    <Clock size={14} className="shrink-0 mt-0.5" />
                    <span>
                      Notice: High-converting employer profiles maintain descriptions between 50 and 200 words.
                    </span>
                  </div>
                )}
            </div>

            {/* Current Open Positions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--theme-text)]">
                    Published Open Positions
                  </h2>
                  <p className="text-xs text-[var(--theme-text-muted)]">
                    Active job requisitions receiving candidate applications
                  </p>
                </div>

                <Link
                  to="/createjob"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 shadow-sm"
                >
                  <PlusCircle size={14} />
                  <span>Post Job</span>
                </Link>
              </div>

              {jobs.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-center">
                  <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] mb-3">
                    No active job listings published under this profile yet.
                  </p>
                  <Link
                    to="/createjob"
                    className="text-xs font-bold text-[var(--theme-accent-silver)] hover:underline"
                  >
                    Create Your First Job Opportunity
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      onClick={() => navigate(`/job/${job._id}`)}
                      className="p-4 sm:p-5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-xs sm:text-sm text-[var(--theme-text)] group-hover:text-[var(--theme-accent-silver-sheen)] transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase shrink-0 ${
                              job.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]"
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--theme-text-muted)] mb-3">
                          <span>{Array.isArray(job.jobType) ? job.jobType.join(", ") : job.jobType}</span>
                          <span>•</span>
                          <span className="truncate">
                            {typeof job.location === "object" ? job.location?.address : job.location || "Remote"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[var(--theme-border)] text-xs">
                        <span className="text-[11px] text-[var(--theme-text-muted)] font-mono">
                          {job.stats?.total || 0} applicants
                        </span>
                        <span className="text-[11px] font-semibold text-[var(--theme-accent-silver)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>View Dossier</span>
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </EmployerLayout>
  );
}

function DocumentRow({ name, uploaded }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[var(--theme-border)]/50 last:border-0">
      <span className="text-[var(--theme-text-muted)]">{name}</span>
      {uploaded ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
          <CheckCircle size={12} /> Verified
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--theme-text-subtle)]">
          <XCircle size={12} /> Missing
        </span>
      )}
    </div>
  );
}
