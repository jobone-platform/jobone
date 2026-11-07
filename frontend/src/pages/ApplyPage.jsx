import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Loader2,
  Briefcase,
  MapPin,
  IndianRupee,
  Send,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  ShieldCheck,
  Calendar,
  Sparkles,
  FileText,
  User,
  Check,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../routes/Context";

export default function ApplyPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // Job & Similar Jobs State
  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [jobLoading, setJobLoading] = useState(true);

  // Candidate Profile State
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Stepper State: 1 = Dossier & Resume, 2 = Screening Questions, 3 = Candidate Pitch, 4 = Review, 5 = Submitted
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [screeningAnswers, setScreeningAnswers] = useState([]);
  const [pitchMessage, setPitchMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [submittedApp, setSubmittedApp] = useState(null);

  // Resolve user ID & token
  const activeToken = useMemo(() => {
    if (token) return token;
    try {
      const stored = JSON.parse(localStorage.getItem("userInfo"));
      return stored?.token || localStorage.getItem("userToken");
    } catch {
      return null;
    }
  }, [token]);

  const resolvedUserId = useMemo(() => {
    if (user?.userId || user?.id || user?.user?.id || user?.user?._id || user?._id) {
      return user.userId || user.id || user.user?.id || user.user?._id || user._id;
    }
    try {
      const stored = JSON.parse(localStorage.getItem("userInfo"));
      return stored?.userId || stored?.id || stored?.user?.id || stored?.user?._id || stored?._id;
    } catch {
      return null;
    }
  }, [user]);

  // 1. Fetch Job Data & Similar Openings
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setJobLoading(true);
        const [jobRes, similarRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/jobs/${jobId}`),
          axios.get(`${API_BASE_URL}/jobs/${jobId}/similar`).catch(() => ({ data: [] })),
        ]);

        const jobData = jobRes.data.job || jobRes.data;
        setJob(jobData);
        setSimilarJobs(similarRes.data || []);

        // Initialize screening answers if job has screening questions
        if (jobData?.screeningQuestions && Array.isArray(jobData.screeningQuestions)) {
          const initialAnswers = jobData.screeningQuestions.map((q) => {
            const questionText = typeof q === "string" ? q : q.question || "";
            return { question: questionText, answer: "" };
          });
          setScreeningAnswers(initialAnswers);
        }
      } catch (error) {
        console.error("Failed to fetch job details:", error);
      } finally {
        setJobLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  // 2. Fetch Candidate Profile Dossier
  useEffect(() => {
    const fetchProfile = async () => {
      if (!resolvedUserId || !activeToken) {
        setProfileLoading(false);
        return;
      }
      try {
        setProfileLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/user/${resolvedUserId}`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch candidate profile", err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [resolvedUserId, activeToken]);

  // Handle Screening Answer Input
  const handleAnswerChange = (index, value) => {
    setScreeningAnswers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], answer: value };
      return updated;
    });
  };

  // Has screening questions flag
  const hasScreeningQuestions = job?.screeningQuestions && job.screeningQuestions.length > 0;

  // Step Validation logic
  const canProceedFromStep = (step) => {
    if (step === 1) {
      return true; // Profile review
    }
    if (step === 2) {
      if (!hasScreeningQuestions) return true;
      return screeningAnswers.every((a) => a.answer.trim().length > 0);
    }
    if (step === 3) {
      return true; // Pitch is optional but encouraged
    }
    return true;
  };

  // 3. Final Submission Handler
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setSubmissionError("");

    if (!activeToken) {
      setSubmissionError("You must be logged in as a candidate to submit your application.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        jobId,
        message: pitchMessage.trim(),
        screeningAnswers: hasScreeningQuestions ? screeningAnswers : [],
      };

      const res = await axios.post(`${API_BASE_URL}/applications`, payload, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });

      setSubmittedApp(res.data.application || res.data);
      setCurrentStep(5); // Success step
    } catch (err) {
      console.error("Application submission failed:", err);
      const errMsg =
        err.response?.data?.message ||
        "Failed to submit application. Please check your connection and try again.";
      setSubmissionError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper values
  const companyName = job?.postedByCompany || job?.postedByName || "Verified Employer";
  const locationStr =
    typeof job?.location === "object"
      ? job.location?.address || "Remote"
      : job?.location || "Remote";
  const salaryStr = job?.salary
    ? `₹${Number(job.salary).toLocaleString()}`
    : "Compensation on Request";

  // Loading Screen
  if (jobLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4">
        <Loader2 className="animate-spin text-silver mb-3" size={36} />
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Loading Structured Application Console...
        </p>
      </div>
    );
  }

  // Not Found Screen
  if (!job) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-muted-foreground mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold mb-2">Requisition Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
          The job posting you are trying to apply for may have been filled, archived, or removed by the employer.
        </p>
        <Link
          to="/jobs"
          className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity"
        >
          Explore Other Opportunities
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-border pb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} /> Back to Job Details
          </button>
          <span className="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-silver/10 text-silver border border-silver/20">
            JobOne Talent Gateway
          </span>
        </div>

        {/* Requisition Summary Card */}
        <div className="p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 size={13} className="text-silver" />
              <span className="font-semibold text-foreground truncate">{companyName}</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-silver" /> {locationStr}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono pt-1">
              <span className="font-semibold text-foreground">{salaryStr}</span>
              <span>•</span>
              <span>{job.jobType || "Full-time"}</span>
              {job.experienceLevel && (
                <>
                  <span>•</span>
                  <span>{job.experienceLevel}</span>
                </>
              )}
            </div>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-border/70 pt-3 sm:pt-0">
            <span className="text-[11px] font-mono uppercase text-muted-foreground">Requisition Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Actively Hiring
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* STEPPER PROGRESS INDICATOR                               */}
        {/* ======================================================== */}
        {currentStep < 5 && (
          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-surface-elevated/40">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { step: 1, label: "Profile & Resume" },
                { step: 2, label: hasScreeningQuestions ? "Screening Questions" : "Verification" },
                { step: 3, label: "Candidate Pitch" },
                { step: 4, label: "Review & Submit" },
              ].map((s) => {
                const isPassed = currentStep > s.step;
                const isCurrent = currentStep === s.step;

                return (
                  <div key={s.step} className="space-y-1.5">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                          isPassed
                            ? "bg-silver text-background"
                            : isCurrent
                            ? "bg-foreground text-background ring-2 ring-silver/40"
                            : "bg-surface border border-border text-muted-foreground"
                        }`}
                      >
                        {isPassed ? <Check size={14} /> : s.step}
                      </div>
                    </div>
                    <p
                      className={`text-[11px] font-semibold truncate ${
                        isCurrent
                          ? "text-foreground"
                          : isPassed
                          ? "text-silver"
                          : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {submissionError && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <span>{submissionError}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 1: CANDIDATE DOSSIER & RESUME VERIFICATION          */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-surface space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Step 1: Verify Candidate Dossier
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review your candidate credentials that will be presented to {companyName}.
              </p>
            </div>

            {profileLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin text-silver mx-auto mb-2" />
                Loading your profile details...
              </div>
            ) : (
              <div className="space-y-5">
                {/* Contact Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-surface-elevated border border-border">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">Full Name</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">
                      {profile?.name || user?.name || "Candidate Name"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">Verified Email</span>
                    <p className="text-sm font-bold text-foreground mt-0.5 font-mono truncate">
                      {profile?.email || user?.email || "Email Not Set"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">Contact Phone</span>
                    <p className="text-sm font-bold text-foreground mt-0.5 font-mono">
                      {profile?.phone || profile?.phoneNumber || "Phone on file"}
                    </p>
                  </div>
                </div>

                {/* Resume Status Card */}
                <div className="p-5 rounded-2xl border border-border bg-surface-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-silver shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Active Candidate Resume</h3>
                      <p className="text-xs text-muted-foreground">
                        {profile?.resume || profile?.resumeFileKey
                          ? "Official PDF attached to your candidate profile"
                          : "No resume on file. Please upload before applying."}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/jobseeker-documents"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-semibold text-foreground hover:bg-surface-elevated transition-colors self-start sm:self-auto shrink-0"
                  >
                    <span>Manage Documents</span> <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Continue to {hasScreeningQuestions ? "Screening Questions" : "Pitch"} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: SCREENING QUESTIONS                              */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-surface space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Step 2: Employer Screening Questions
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {companyName} has requested responses to specific questions for this requisition.
              </p>
            </div>

            {hasScreeningQuestions ? (
              <div className="space-y-5">
                {screeningAnswers.map((item, idx) => (
                  <div key={idx} className="space-y-2 p-4 rounded-2xl bg-surface-elevated border border-border">
                    <label className="block text-xs font-bold text-foreground">
                      <span className="text-silver font-mono mr-1.5">Q{idx + 1}.</span>
                      {item.question} <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={item.answer}
                      onChange={(e) => handleAnswerChange(idx, e.target.value)}
                      placeholder="Type your response here..."
                      className="w-full p-3 rounded-xl bg-surface border border-border focus:border-silver focus:ring-1 focus:ring-silver/40 text-foreground placeholder:text-muted-foreground text-xs outline-none transition-all resize-y"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-border bg-surface-elevated/40 text-center space-y-2">
                <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-1" />
                <h4 className="text-sm font-bold text-foreground">No Screening Questions Required</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  This employer does not require preliminary questionnaire responses for this opening.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                disabled={!canProceedFromStep(2)}
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Continue to Candidate Pitch <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: CANDIDATE PITCH / COVER NOTE                     */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-surface space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Step 3: Candidate Pitch & Cover Message
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Introduce your candidacy and highlight why your qualifications align with this role.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Cover Pitch (Optional)</span>
                <span className="font-mono text-muted-foreground text-[11px]">
                  {pitchMessage.length} / 1500 characters
                </span>
              </div>
              <textarea
                rows={6}
                maxLength={1500}
                value={pitchMessage}
                onChange={(e) => setPitchMessage(e.target.value)}
                placeholder="Share your technical background, specific relevant achievements, or reasons why you are excited about this opportunity..."
                className="w-full p-4 rounded-2xl bg-surface-elevated border border-border focus:border-silver focus:ring-1 focus:ring-silver/40 text-foreground placeholder:text-muted-foreground text-xs outline-none transition-all resize-y leading-relaxed"
              />
              <p className="text-[11px] text-muted-foreground">
                Tip: Concise pitches detailing specific project accomplishments receive 2.4x higher response rates from hiring teams.
              </p>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Review Application <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: REVIEW & FINAL SUBMISSION                        */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-surface space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Step 4: Review Application Package
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verify your final submission package before delivering it to {companyName}.
              </p>
            </div>

            <div className="space-y-4">
              {/* Summary Dossier */}
              <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-2 text-xs">
                <span className="font-mono uppercase text-muted-foreground font-semibold">Candidate</span>
                <p className="text-sm font-bold text-foreground">
                  {profile?.name || user?.name || "Candidate Name"}
                </p>
                <p className="text-muted-foreground font-mono">
                  {profile?.email || user?.email} • {profile?.phone || "Phone verified"}
                </p>
              </div>

              {/* Screening Answers Summary */}
              {hasScreeningQuestions && (
                <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-3 text-xs">
                  <span className="font-mono uppercase text-muted-foreground font-semibold">
                    Screening Responses ({screeningAnswers.length})
                  </span>
                  <div className="space-y-2">
                    {screeningAnswers.map((item, idx) => (
                      <div key={idx} className="border-t border-border/50 pt-2 first:border-0 first:pt-0">
                        <p className="font-bold text-foreground">Q: {item.question}</p>
                        <p className="text-muted-foreground mt-0.5 pl-3 border-l-2 border-silver">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pitch Summary */}
              {pitchMessage && (
                <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-1.5 text-xs">
                  <span className="font-mono uppercase text-muted-foreground font-semibold">Pitch Note</span>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed pl-3 border-l-2 border-silver">
                    {pitchMessage}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-40 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Delivering Application...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Confirm & Submit Application
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 5: APPLICATION SUCCESS CONFIRMATION                 */}
        {/* ======================================================== */}
        {currentStep === 5 && (
          <div className="p-8 sm:p-12 rounded-3xl border border-border bg-surface text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-silver">
                Application Transmitted
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Candidacy Submitted Successfully
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Your application package has been officially delivered to the hiring team at{" "}
                <span className="font-semibold text-foreground">{companyName}</span> for the{" "}
                <span className="font-semibold text-foreground">{job.title}</span> role.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/myapplications"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
              >
                <Briefcase size={14} /> Track in Applications
              </Link>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-elevated border border-border text-foreground hover:bg-surface-hover text-xs font-semibold transition-colors"
              >
                Browse Other Roles
              </Link>
            </div>
          </div>
        )}

        {/* Similar Opportunities Section */}
        {similarJobs.length > 0 && currentStep !== 5 && (
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Similar Roles in this Domain
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {similarJobs.slice(0, 2).map((sim) => (
                <Link
                  key={sim._id}
                  to={`/apply/${sim._id}`}
                  className="p-4 rounded-2xl border border-border bg-surface hover:bg-surface-elevated hover:border-silver/40 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-foreground truncate">{sim.title}</h4>
                    <p className="text-muted-foreground truncate">{sim.postedByCompany || "Company"}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
