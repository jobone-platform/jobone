import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Send, Loader2, FileText, CheckCircle2, UserCircle, ExternalLink, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
  const [pitch, setPitch] = useState("");
  const [answers, setAnswers] = useState(
    job.screeningQuestions?.map((q) => ({ question: q, answer: "" })) || [],
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
          setError("No authorization token found. Please log in.");
          setProfileLoading(false);
          return;
        }
        const { token, id, userId: fallbackId } = JSON.parse(storedData);
        const userId = id || fallbackId;

        const { data } = await axios.get(
          `https://jobone-mrpy.onrender.com/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Could not load your profile details.");
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
    if (answers.some((a) => !a.answer.trim())) {
      setError("Please provide an answer for all screening questions.");
      return;
    }
    
    // Safety check
    if (!userProfile?.resumeFileKey && !userProfile?.resume) {
      setError("A resume is required to apply. Please update your profile.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const storedData = localStorage.getItem("userInfo");
      const token = storedData ? JSON.parse(storedData).token : null;

      if (!token) throw new Error("No authorization token found. Please log in.");

      await axios.post(
        "https://jobone-mrpy.onrender.com/applications",
        {
          jobId: job._id,
          message: pitch,
          screeningAnswers: answers,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      onSuccess(); 
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to submit application. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const hasResume = userProfile && (userProfile.resumeFileKey || userProfile.resume);

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Apply for {job.title}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Complete the form below to submit your application.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold border border-rose-100 flex items-center gap-2">
              <X size={16} /> {error}
            </div>
          )}

          {/* Profile Readiness Section */}
          {profileLoading ? (
            <div className="flex items-center justify-center py-6 text-slate-500">
              <Loader2 className="animate-spin mr-2" size={20} /> Loading your profile...
            </div>
          ) : userProfile ? (
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <UserCircle size={18} className="text-blue-500" />
                Profile Readiness
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-wider">Applicant</p>
                  <p className="font-semibold text-slate-900">{userProfile.name}</p>
                  <p className="text-slate-600 truncate">{userProfile.email}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-wider">Top Skills</p>
                  <p className="font-semibold text-slate-700 truncate">
                    {userProfile.skills?.length > 0 ? userProfile.skills.slice(0, 5).join(", ") : "No skills listed"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-blue-100/50">
                {!hasResume ? (
                  <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-bold text-amber-800 text-sm">Resume Required</h4>
                      <p className="text-amber-700 text-sm mt-1 mb-3">You must have a resume on your profile to apply for this job.</p>
                      <button 
                        onClick={() => navigate('/editprofile')}
                        className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Upload Resume & Edit Profile
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Resume Attached</h4>
                        <p className="text-slate-500 text-xs mt-0.5">Your profile resume will be sent to the employer.</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Is it tailored for this job?</p>
                      <button 
                        onClick={() => navigate('/editprofile')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-end sm:justify-center gap-1"
                      >
                        Edit / Update Resume <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Requested Documents Checklist */}
                {job.requestedDocuments && job.requestedDocuments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-100/60">
                    <h4 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-1.5">
                      <FileText size={16} className="text-indigo-600" />
                      Employer Requested Documents
                    </h4>
                    <p className="text-xs text-slate-600 mb-3">
                      The employer requested these documents for verification. They will be shared from your profile if uploaded:
                    </p>
                    <div className="space-y-2">
                      {job.requestedDocuments.map((docName) => {
                        const field = DOC_FIELD_MAP[docName] || docName;
                        const docObj = userProfile.documents?.[field];
                        const isUploaded = !!(docObj && docObj.key);
                        const fileName = docObj?.name || "Uploaded File";
                        return (
                          <div key={docName} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-sm">
                            <span className="font-bold text-slate-700">{docName}</span>
                            {isUploaded ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                ✓ Attached ({fileName})
                              </span>
                            ) : (
                              <span className="text-amber-600 font-bold flex items-center gap-1">
                                ⚠️ Missing in profile
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate("/jobseeker-documents");
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline flex items-center gap-1"
                      >
                        Upload / Manage Documents in Profile <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Application Form (Only interactive if they have a resume) */}
          <div className={`space-y-6 ${!hasResume ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FileText size={16} className="text-indigo-500" />
                Cover Letter / Pitch (Optional)
              </label>
              <textarea
                rows={4}
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="Why are you a great fit for this role?"
                className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm resize-none"
              />
            </div>

            {job.screeningQuestions && job.screeningQuestions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-purple-500" />
                  Employer Screening Questions <span className="text-rose-500">*</span>
                </h3>
                <div className="space-y-5 bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                  {job.screeningQuestions.map((question, index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">
                        <span className="text-purple-600 mr-1">{index + 1}.</span> {question}
                      </label>
                      <input
                        type="text"
                        value={answers[index].answer}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white shrink-0 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !hasResume || profileLoading}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
              !hasResume 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
