import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  ChevronRight,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  CheckSquare,
  MessageSquareQuote,
  X,
  FilterX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function JobApplicants() {
  const { id } = useParams(); // Job ID
  const navigate = useNavigate();

  // FACT: Read the URL search parameters to check if we should filter
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");

  const [selectedApps, setSelectedApps] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionModal, setActionModal] = useState({
    show: false,
    status: "",
    title: "",
    requireMessage: false,
    appId: null,
    requestData: null,
  });
  const [employerMessage, setEmployerMessage] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [pitchModal, setPitchModal] = useState({
    show: false,
    message: "",
    name: "",
  });
  const [assessmentModal, setAssessmentModal] = useState({
    show: false,
    answers: [],
    name: "",
  });

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const stored = localStorage.getItem("employerInfo");
        if (!stored) return navigate("/login");

        const { token } = JSON.parse(stored);

        const { data } = await axios.get(
          `https://jobone-mrpy.onrender.com/applications/job/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setApplicants(data);

        const jobRes = await axios.get(
          `https://jobone-mrpy.onrender.com/jobs/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setJobTitle(jobRes.data.title || jobRes.data.job?.title || "Job");
      } catch (err) {
        console.error("Failed to load applicants", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [id, navigate]);

  // FACT: Dynamically filter the applicants based on Search Query and Status
  const displayApplicants = applicants.filter((app) => {
    const candidate = app.appliedBy || app.applicant;
    const candidateName = candidate?.name?.toLowerCase() || "";
    const matchesSearch = candidateName.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedApps.length === displayApplicants.length) setSelectedApps([]);
    else setSelectedApps(displayApplicants.map((app) => app._id));
  };

  const handleSelectOne = (appId) => {
    if (selectedApps.includes(appId))
      setSelectedApps(selectedApps.filter((id) => id !== appId));
    else setSelectedApps([...selectedApps, appId]);
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedApps.length === 0) return;
    setActionLoading(true);

    try {
      const stored = localStorage.getItem("employerInfo");
      const { token } = JSON.parse(stored);

      await Promise.all(
        selectedApps.map((appId) =>
          axios.patch(
            `https://jobone-mrpy.onrender.com/applications/${appId}/status`,
            { status: actionModal.status, employerMessage, meetingLink },
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ),
      );

      setApplicants((prev) =>
        prev.map((app) =>
          selectedApps.includes(app._id)
            ? { ...app, status: actionModal.status }
            : app,
        ),
      );

      setSelectedApps([]);
      setActionModal({
        show: false,
        status: "",
        title: "",
        requireMessage: false,
        appId: null,
        requestData: null,
      });
      setEmployerMessage("");
      setMeetingLink("");
    } catch (error) {
      alert("Failed to update some candidates.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescheduleResponse = async (action) => {
    setActionLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("employerInfo")).token;
      await axios.patch(
        `https://jobone-mrpy.onrender.com/applications/${actionModal.appId}/reschedule/respond`,
        { action, employerMessage },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setApplicants((prev) =>
        prev.map((app) =>
          app._id === actionModal.appId
            ? {
                ...app,
                rescheduleRequest: {
                  ...app.rescheduleRequest,
                  requestStatus: action,
                },
                employerMessage,
              }
            : app,
        ),
      );

      setActionModal({
        show: false,
        status: "",
        title: "",
        requireMessage: false,
        appId: null,
        requestData: null,
      });
      setEmployerMessage("");
    } catch (err) {
      alert("Failed to process response. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "hired":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md text-xs font-bold uppercase border border-emerald-200">
            Hired
          </span>
        );
      case "NCTT":
        return (
          <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-md text-xs font-bold uppercase border border-rose-200">
            NCTT
          </span>
        );
      case "Interview Scheduled":
        return (
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-xs font-bold uppercase border border-purple-200">
            Interview
          </span>
        );
      // FACT: Missing badge logic successfully injected
      case "Interview Conducted":
        return (
          <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-md text-xs font-bold uppercase border border-cyan-200">
            Conducted
          </span>
        );
      case "Assignment Scheduled":
        return (
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-md text-xs font-bold uppercase border border-orange-200">
            Assignment
          </span>
        );
      case "shortlisted":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-bold uppercase border border-blue-200">
            Shortlisted
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-bold uppercase border border-slate-200">
            Applied
          </span>
        );
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 font-sans pb-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-2 transition-colors font-bold text-sm uppercase tracking-wide"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Applicants for {jobTitle}
            </h1>

            {/* Unified Filter UI */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <input
                type="text"
                placeholder="Search by candidate name..."
                className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  if (e.target.value === "all") {
                    searchParams.delete("status");
                  } else {
                    searchParams.set("status", e.target.value);
                  }
                  setSearchParams(searchParams);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Interview Conducted">Interview Conducted</option>
                <option value="Assignment Scheduled">Assignment Scheduled</option>
                <option value="hired">Hired</option>
                <option value="NCTT">Not a Fit (NCTT)</option>
              </select>
            </div>
          </div>
          <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-600">
            Filtered Candidates:{" "}
            <span className="text-indigo-600 text-lg ml-1">
              {displayApplicants.length}
            </span>
          </div>
        </div>

        {/* BULK ACTION TOOLBAR */}
        <AnimatePresence>
          {selectedApps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900 p-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4"
            >
              <div className="px-4 text-white font-bold border-r border-slate-700">
                {selectedApps.length} Selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setActionModal({
                      show: true,
                      status: "shortlisted",
                      title: "Shortlist Candidates",
                      requireMessage: true,
                    })
                  }
                  className="px-4 py-2 bg-slate-800 text-blue-400 font-bold rounded-xl hover:bg-slate-700 transition-colors text-sm"
                >
                  Shortlist
                </button>
                <button
                  onClick={() =>
                    setActionModal({
                      show: true,
                      status: "Interview Scheduled",
                      title: "Schedule Interviews",
                      requireMessage: true,
                    })
                  }
                  className="px-4 py-2 bg-slate-800 text-purple-400 font-bold rounded-xl hover:bg-slate-700 transition-colors text-sm"
                >
                  Interview
                </button>

                {/* FACT: Added the Conducted button */}
                <button
                  onClick={() =>
                    setActionModal({
                      show: true,
                      status: "Interview Conducted",
                      title: "Mark Interview Conducted",
                      requireMessage: true,
                    })
                  }
                  className="px-4 py-2 bg-slate-800 text-cyan-400 font-bold rounded-xl hover:bg-slate-700 transition-colors text-sm"
                >
                  Conducted
                </button>

                <button
                  onClick={() =>
                    setActionModal({
                      show: true,
                      status: "Assignment Scheduled",
                      title: "Schedule Assignments",
                      requireMessage: true,
                    })
                  }
                  className="px-4 py-2 bg-slate-800 text-orange-400 font-bold rounded-xl hover:bg-slate-700 transition-colors text-sm"
                >
                  Assignment
                </button>
                <button
                  onClick={() =>
                    setActionModal({
                      show: true,
                      status: "NCTT",
                      title: "Mark as NCTT",
                      requireMessage: false,
                    })
                  }
                  className="px-4 py-2 bg-slate-800 text-rose-400 font-bold rounded-xl hover:bg-slate-700 transition-colors text-sm"
                >
                  NCTT
                </button>
                <button
                  onClick={() =>
                    setActionModal({
                      show: true,
                      status: "hired",
                      title: "Hire Candidates",
                      requireMessage: false,
                    })
                  }
                  className="px-5 py-2 bg-emerald-500 text-slate-900 font-extrabold rounded-xl hover:bg-emerald-400 transition-colors text-sm shadow-lg shadow-emerald-500/20"
                >
                  Hire
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DATA TABLE */}
        {displayApplicants.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <User className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              No candidates found
            </h3>
            <p className="text-slate-500 mt-2 font-medium">
              Try clearing your filters or check back later.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedApps.length === displayApplicants.length &&
                          displayApplicants.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 cursor-pointer"
                      />
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Applied On
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayApplicants.map((app) => {
                    const candidate = app.appliedBy || app.applicant;
                    if (!candidate) return null;
                    const isSelected = selectedApps.includes(app._id);

                    return (
                      <tr
                        key={app._id}
                        className={`hover:bg-slate-50 transition-colors ${isSelected ? "bg-indigo-50/30" : ""}`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(app._id)}
                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 cursor-pointer"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                candidate.profilePicture ||
                                (candidate.gender === "Female" 
                                  ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                                  : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                              }
                              alt="Avatar"
                              className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            />
                            <span className="font-bold text-slate-900">
                              {candidate.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1 text-sm text-slate-600 font-medium">
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-slate-400" />{" "}
                              {candidate.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-slate-400" />{" "}
                              {candidate.phone || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-bold text-slate-600">
                          {new Date(
                            app.createdAt || app.appliedAt,
                          ).toLocaleDateString()}
                        </td>
                        <td className="p-4">{getStatusBadge(app.status)}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {app.applicantMessage && (
                              <button
                                onClick={() =>
                                  setPitchModal({
                                    show: true,
                                    message: app.applicantMessage,
                                    name: candidate.name,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 font-bold px-3 py-2 rounded-lg hover:bg-amber-100 transition-all text-sm shadow-sm"
                                title="Read Pitch"
                              >
                                <MessageSquareQuote size={16} /> Pitch
                              </button>
                            )}

                            {app.screeningAnswers && app.screeningAnswers.length > 0 && (
                              <button
                                onClick={() =>
                                  setAssessmentModal({
                                    show: true,
                                    answers: app.screeningAnswers,
                                    name: candidate.name,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 font-bold px-3 py-2 rounded-lg hover:bg-blue-100 transition-all text-sm shadow-sm"
                                title="Read Assessment"
                              >
                                <CheckSquare size={16} /> Assessment
                              </button>
                            )}

                            {app.rescheduleRequest?.requestStatus ===
                              "pending" && (
                              <button
                                onClick={() =>
                                  setActionModal({
                                    show: true,
                                    status: "reschedule_review",
                                    title: `Review Time: ${candidate.name}`,
                                    requireMessage: false,
                                    appId: app._id,
                                    requestData: app.rescheduleRequest,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 font-bold px-3 py-2 rounded-lg hover:bg-orange-100 transition-all text-sm shadow-sm animate-pulse"
                              >
                                <Clock size={16} /> Review Time
                              </button>
                            )}

                            {/* FACT: Generating the master list of IDs to pass to the next page for arrows */}
                            <button
                              onClick={() => {
                                const masterList = displayApplicants
                                  .map(
                                    (a) => a.appliedBy?._id || a.applicant?._id,
                                  )
                                  .filter(Boolean);
                                navigate(`/profile/${candidate._id}`, {
                                  state: {
                                    applicationId: app._id,
                                    status: app.status,
                                    applicantList: masterList, // Pass the entire array to the profile viewer
                                  },
                                });
                              }}
                              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-indigo-600 font-bold px-4 py-2 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-all text-sm shadow-sm"
                            >
                              Profile <ChevronRight size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {pitchModal.show && (
          <div
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() =>
              setPitchModal({ show: false, message: "", name: "" })
            }
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() =>
                  setPitchModal({ show: false, message: "", name: "" })
                }
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-4 text-amber-600">
                <MessageSquareQuote size={28} />
                <h3 className="text-xl font-extrabold text-slate-900">
                  Pitch from {pitchModal.name}
                </h3>
              </div>
              <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                  "{pitchModal.message}"
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {assessmentModal.show && (
          <div
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() =>
              setAssessmentModal({ show: false, answers: [], name: "" })
            }
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() =>
                  setAssessmentModal({ show: false, answers: [], name: "" })
                }
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-6 text-blue-600">
                <CheckSquare size={28} />
                <h3 className="text-xl font-extrabold text-slate-900">
                  Assessment: {assessmentModal.name}
                </h3>
              </div>
              <div className="space-y-4">
                {assessmentModal.answers.map((qa, index) => (
                  <div key={index} className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                    <p className="font-bold text-slate-800 mb-2">Q: {qa.question}</p>
                    <p className="text-slate-700 font-medium whitespace-pre-wrap">A: {qa.answer}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {actionModal.show && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">
              {actionModal.title}
            </h3>

            {actionModal.status === "reschedule_review" ? (
              <div className="mb-6 mt-4">
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl mb-5 space-y-2">
                  <p className="text-sm text-orange-900">
                    <strong className="font-extrabold text-orange-950">
                      Reason:
                    </strong>{" "}
                    {actionModal.requestData?.reason}
                  </p>
                  <p className="text-sm text-orange-900">
                    <strong className="font-extrabold text-orange-950">
                      Proposed Time:
                    </strong>{" "}
                    {actionModal.requestData?.proposedTime}
                  </p>
                </div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Message to Candidate
                </label>
                <textarea
                  value={employerMessage}
                  onChange={(e) => setEmployerMessage(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-28 resize-y text-sm font-medium"
                />
              </div>
            ) : actionModal.requireMessage ? (
              <div className="mb-6 mt-4">
                {actionModal.status === "Interview Scheduled" && (
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://zoom.us/j/..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    />
                  </div>
                )}
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Message (Sent to {selectedApps.length} Candidates via Email)
                </label>
                <textarea
                  value={employerMessage}
                  onChange={(e) => setEmployerMessage(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-y text-sm font-medium"
                />
              </div>
            ) : (
              <p className="text-slate-600 mb-6 mt-2 font-medium">
                Are you sure you want to apply{" "}
                <strong className="text-slate-900">{actionModal.status}</strong>{" "}
                to {selectedApps.length} candidates?
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setActionModal({
                    show: false,
                    status: "",
                    title: "",
                    requireMessage: false,
                  });
                  setEmployerMessage("");
                  setMeetingLink("");
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              {actionModal.status === "reschedule_review" ? (
                <>
                  <button
                    onClick={() => handleRescheduleResponse("rejected")}
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleRescheduleResponse("approved")}
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}{" "}
                    Approve
                  </button>
                </>
              ) : (
                <button
                  onClick={handleBulkStatusUpdate}
                  disabled={
                    actionLoading ||
                    (actionModal.requireMessage && !employerMessage.trim())
                  }
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-200"
                >
                  {actionLoading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <CheckSquare size={18} />
                  )}{" "}
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
