import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Send, Loader2, FileText, CheckCircle2, UserCircle, ExternalLink, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

const DOC_FIELD_MAP = {
  "10th Marksheet": "tenthMarksheet",
  "12th Marksheet": "twelfthMarksheet",
  "UG Marksheet": "ugMarksheet",
  "PG Marksheet": "pgMarksheet",
  "Aadhar Card": "aadharCard",
  "PAN Card": "panCard",
  "Medical Certificate": "medicalCertificate",
  "3 Months Salary Slip (if Experienced)": "salarySlips",
  "Other Documents": "otherDocuments",
};

export default function ApplyModal({ job, onClose, onSuccess }) {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const [pitch, setPitch] = useState("");
  const [answers, setAnswers] = useState(
    job.screeningQuestions?.map((q) => ({ question: q, answer: "" })) || []
  );

  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedData = localStorage.getItem("userInfo");
        if (!storedData) {
          setError("No candidate session found. Please sign in.");
          setProfileLoading(false);
          return;
        }
        const { token, id, userId: fallbackId } = JSON.parse(storedData);
        const userId = id || fallbackId;

        const { data } = await axios.get(`${API_BASE_URL}/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Could not load your candidate profile credentials.");
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index].answer = value;
    setAnswers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (answers.some((a) => !a.answer.trim())) {
      setError("Please respond to all screening questions before submitting.");
      return;
    }

    if (!userProfile?.resumeFileKey && !userProfile?.resume) {
      setError("A verified resume is required on your profile to apply.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const storedData = localStorage.getItem("userInfo");
      const token = storedData ? JSON.parse(storedData).token : null;

      if (!token) throw new Error("No authorization token found. Please sign in.");

      await axios.post(
        `${API_BASE_URL}/applications`,
        {
          jobId: job._id,
          message: pitch,
          screeningAnswers: answers,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Failed to submit application. Please verify your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const hasResume = userProfile && (userProfile.resumeFileKey || userProfile.resume);

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
        className="bg-surface-1 border border-border text-foreground w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border flex justify-between items-center bg-surface-2/60 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-silver">
                Application Submission
              </span>
            </div>
            <h2 id="apply-modal-title" className="text-lg sm:text-xl font-display font-bold text-foreground">
              {job.title}
            </h2>
            <p className="text-xs text-foreground/60">
              Submit your credentials directly to the hiring team.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close application form"
            className="p-2 rounded-xl bg-surface-1 border border-border text-foreground/60 hover:text-foreground transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-2">
              <X size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Profile Readiness */}
          {profileLoading ? (
            <div className="flex items-center justify-center py-8 text-foreground/50 text-xs font-mono">
              <Loader2 className="animate-spin mr-2" size={16} /> Retrieving candidate profile...
            </div>
          ) : userProfile ? (
            <div className="bg-surface-2/60 border border-border rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-foreground/70 flex items-center gap-2">
                <UserCircle size={15} className="text-silver" />
                <span>Candidate Dossier Readiness</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-foreground/50 text-[10px] font-mono uppercase tracking-wider mb-0.5">
                    Applicant Identity
                  </p>
                  <p className="font-semibold text-foreground">{userProfile.name}</p>
                  <p className="text-foreground/60 font-mono text-[11px] truncate">{userProfile.email}</p>
                </div>
                <div>
                  <p className="text-foreground/50 text-[10px] font-mono uppercase tracking-wider mb-0.5">
                    Profile Skills
                  </p>
                  <p className="font-medium text-foreground/80 line-clamp-2">
                    {userProfile.skills?.length > 0 ? userProfile.skills.slice(0, 6).join(", ") : "No skills indexed"}
                  </p>
                </div>
              </div>

              {/* Resume Status */}
              <div className="pt-3 border-t border-border">
                {!hasResume ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle size={15} />
                      <span>Resume Attachment Required</span>
                    </div>
                    <p className="text-amber-200/80 text-[11px] leading-relaxed">
                      This employer requires an attached resume to review applications. Please upload your resume in candidate settings.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/editprofile")}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black font-semibold text-xs transition cursor-pointer"
                    >
                      Update Profile Resume
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-1 border border-border text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-silver">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Verified Resume Attached</p>
                        <p className="text-[11px] text-foreground/50">Your active profile resume will accompany this application.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/editprofile")}
                      className="text-xs text-silver hover:underline flex items-center gap-1 cursor-pointer shrink-0 font-medium"
                    >
                      <span>Update</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>
                )}
              </div>

              {/* Requested Documents */}
              {job.requestedDocuments && job.requestedDocuments.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-foreground/60 mb-2 flex items-center gap-1.5">
                    <FileText size={13} className="text-silver" /> Requisition Specific Documents
                  </h4>
                  <div className="space-y-1.5">
                    {job.requestedDocuments.map((docName) => {
                      const field = DOC_FIELD_MAP[docName] || docName;
                      const docObj = userProfile.documents?.[field];
                      const isUploaded = !!(docObj && docObj.key);
                      return (
                        <div
                          key={docName}
                          className="flex items-center justify-between p-2 rounded-lg bg-surface-1 border border-border text-xs"
                        >
                          <span className="font-medium text-foreground">{docName}</span>
                          {isUploaded ? (
                            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                              ✓ Attached
                            </span>
                          ) : (
                            <span className="text-amber-400 font-mono text-[11px]">
                              Pending in profile
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Form */}
          <div className={`space-y-5 ${!hasResume ? "opacity-50 pointer-events-none" : ""}`}>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-foreground/70 mb-1.5">
                Cover Note / Pitch (Optional)
              </label>
              <textarea
                rows={4}
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="Detail relevant architectural accomplishments and alignment with this role..."
                className="w-full p-3.5 rounded-xl bg-surface-2 border border-border text-xs sm:text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:border-silver/60 resize-none transition-colors"
              />
            </div>

            {/* Screening Questions */}
            {job.screeningQuestions && job.screeningQuestions.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-border">
                <h3 className="text-xs font-mono uppercase tracking-widest text-foreground/70 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-silver" />
                  <span>Mandatory Screening Prompts *</span>
                </h3>
                <div className="space-y-3">
                  {job.screeningQuestions.map((question, index) => (
                    <div key={index} className="p-3.5 rounded-xl bg-surface-2 border border-border space-y-2">
                      <label className="text-xs font-semibold text-foreground block">
                        <span className="text-silver font-mono mr-1.5">Q{index + 1}.</span> {question}
                      </label>
                      <input
                        type="text"
                        value={answers[index]?.answer || ""}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        placeholder="Type your response..."
                        className="w-full px-3 py-2 rounded-lg bg-surface-1 border border-border text-xs text-foreground placeholder-foreground/30 focus:outline-none focus:border-silver/60 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-border bg-surface-2/60 shrink-0 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-border text-foreground/70 hover:text-foreground text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !hasResume || profileLoading}
            className="px-6 py-2.5 rounded-xl bg-foreground text-background font-semibold text-xs sm:text-sm flex items-center gap-2 hover:opacity-90 active:scale-[0.99] transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
            <span>{loading ? "Transmitting..." : "Submit Application"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
