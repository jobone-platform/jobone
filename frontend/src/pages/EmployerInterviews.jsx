import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  Phone,
  User,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Loader2,
  X,
  MessageSquare,
  CalendarClock,
  Sparkles,
  CheckSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config/api";
import EmployerLayout from "../components/employer/EmployerLayout";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function EmployerInterviews() {
  const navigate = useNavigate();

  // Primary calendar view mode: "month" | "week" | "day" | "list"
  const [calendarView, setCalendarView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data state
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "scheduled", "conducted", "reschedule"

  // Selected interview for details modal
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Scheduling Workflow Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: "",
    interviewDate: new Date().toISOString().split("T")[0],
    interviewTime: "10:00",
    interviewType: "Online Video", // "Online Video", "In-Person", "Phone"
    meetingLink: "",
    locationAddress: "",
    notes: "",
  });
  const [scheduleConflict, setScheduleConflict] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Reschedule & Cancel Modals
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    time: "",
    notes: "",
    meetingLink: "",
  });
  const [rescheduleReviewApp, setRescheduleReviewApp] = useState(null);
  const [employerReviewMessage, setEmployerReviewMessage] = useState("");

  // Fetch all applications
  const fetchApplications = useCallback(async () => {
    try {
      const stored = localStorage.getItem("employerInfo");
      if (!stored) return navigate("/login");
      const { token } = JSON.parse(stored);

      const { data } = await axios.get(`${API_BASE_URL}/employer/my-candidates`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load interview candidates", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Filter applications that have interview info
  const interviewEvents = useMemo(() => {
    return applications
      .filter((app) => {
        const isInterviewStage =
          app.status === "Interview Scheduled" ||
          app.status === "Interview Conducted" ||
          app.rescheduleRequest?.isRequested;

        if (!isInterviewStage) return false;

        const candidateName = app.appliedBy?.name?.toLowerCase() || "";
        const jobTitle = app.job_id?.title?.toLowerCase() || "";
        const matchesSearch =
          candidateName.includes(searchQuery.toLowerCase()) ||
          jobTitle.includes(searchQuery.toLowerCase());

        if (statusFilter === "scheduled") return matchesSearch && app.status === "Interview Scheduled";
        if (statusFilter === "conducted") return matchesSearch && app.status === "Interview Conducted";
        if (statusFilter === "reschedule") return matchesSearch && app.rescheduleRequest?.requestStatus === "pending";

        return matchesSearch;
      })
      .map((app) => {
        // Parse date from employerMessage or reschedule request or appliedAt
        const createdDate = new Date(app.appliedAt || app.createdAt || Date.now());
        // Stored meeting time or fall back to application creation date
        const eventDate = app.interviewDate ? new Date(app.interviewDate) : createdDate;

        return {
          id: app._id,
          application: app,
          candidate: app.appliedBy,
          job: app.job_id,
          date: eventDate,
          status: app.status,
          meetingLink: app.meetingLink,
          notes: app.employerMessage,
          rescheduleRequest: app.rescheduleRequest,
          type: app.meetingLink?.startsWith("http") ? "Online Video" : "In-Person",
        };
      });
  }, [applications, searchQuery, statusFilter]);

  // Candidates available for scheduling (e.g. status "applied" or "shortlisted")
  const schedulableCandidates = useMemo(() => {
    return applications.filter(
      (app) => app.status === "shortlisted" || app.status === "applied"
    );
  }, [applications]);

  // Calendar Navigation Handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (calendarView === "month") {
      d.setMonth(d.getMonth() - 1);
    } else if (calendarView === "week") {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (calendarView === "month") {
      d.setMonth(d.getMonth() + 1);
    } else if (calendarView === "week") {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month Grid Calculation
  const monthGridDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
      });
    }

    // Next month padding to reach 35 or 42 cells
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: new Date(year, month + 1, d),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  // Week Grid Days
  const weekGridDays = useMemo(() => {
    const curr = new Date(currentDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day; // Sunday start

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(curr.setDate(diff + i));
      weekDays.push(new Date(nextDay));
    }
    return weekDays;
  }, [currentDate]);

  // Conflict detection for scheduled time
  const checkTimeConflict = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const target = `${dateStr}T${timeStr}`;

    const conflict = interviewEvents.find((evt) => {
      const evtIso = evt.date.toISOString().slice(0, 16);
      return evtIso === target && evt.status === "Interview Scheduled";
    });

    return conflict || null;
  };

  // Submit Schedule Interview
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleForm.applicationId) {
      alert("Please select a candidate to interview.");
      return;
    }

    const conflict = checkTimeConflict(scheduleForm.interviewDate, scheduleForm.interviewTime);
    if (conflict) {
      setScheduleConflict(conflict);
      const proceed = window.confirm(
        `Warning: An interview with ${conflict.candidate?.name || "another candidate"} is already scheduled around this time. Do you wish to schedule anyway?`
      );
      if (!proceed) return;
    }

    setActionLoading(true);
    try {
      const stored = localStorage.getItem("employerInfo");
      const { token } = JSON.parse(stored);

      const meetingDetails =
        scheduleForm.interviewType === "Online Video"
          ? scheduleForm.meetingLink
          : scheduleForm.locationAddress;

      const employerMessage = `Interview Scheduled for ${scheduleForm.interviewDate} at ${scheduleForm.interviewTime} (${scheduleForm.interviewType}). ${
        scheduleForm.notes ? `Preparation note: ${scheduleForm.notes}` : ""
      }`;

      await axios.patch(
        `${API_BASE_URL}/applications/${scheduleForm.applicationId}/status`,
        {
          status: "Interview Scheduled",
          employerMessage,
          meetingLink: meetingDetails,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh applications
      await fetchApplications();
      setScheduleModalOpen(false);
      setScheduleForm({
        applicationId: "",
        interviewDate: new Date().toISOString().split("T")[0],
        interviewTime: "10:00",
        interviewType: "Online Video",
        meetingLink: "",
        locationAddress: "",
        notes: "",
      });
      setScheduleConflict(null);
    } catch (err) {
      console.error("Failed to schedule interview", err);
      alert("Error scheduling interview. Please verify candidate status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reschedule Confirmation Submit
  const handleRescheduleSubmit = async () => {
    if (!selectedEvent) return;
    setActionLoading(true);

    try {
      const stored = localStorage.getItem("employerInfo");
      const { token } = JSON.parse(stored);

      const message = `Interview rescheduled to ${rescheduleData.date} at ${rescheduleData.time}. ${rescheduleData.notes || ""}`;

      await axios.patch(
        `${API_BASE_URL}/applications/${selectedEvent.id}/status`,
        {
          status: "Interview Scheduled",
          employerMessage: message,
          meetingLink: rescheduleData.meetingLink || selectedEvent.meetingLink,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchApplications();
      setRescheduleModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error("Reschedule failed", err);
      alert("Failed to reschedule interview.");
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Interview Submit
  const handleCancelInterviewSubmit = async () => {
    if (!selectedEvent) return;
    setActionLoading(true);

    try {
      const stored = localStorage.getItem("employerInfo");
      const { token } = JSON.parse(stored);

      await axios.patch(
        `${API_BASE_URL}/applications/${selectedEvent.id}/status`,
        {
          status: "shortlisted",
          employerMessage: "Previous interview session was cancelled. Status restored to shortlisted.",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchApplications();
      setCancelModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error("Cancel failed", err);
      alert("Failed to cancel interview.");
    } finally {
      setActionLoading(false);
    }
  };

  // Respond to candidate reschedule request
  const handleRescheduleReviewResponse = async (action) => {
    if (!rescheduleReviewApp) return;
    setActionLoading(true);

    try {
      const token = JSON.parse(localStorage.getItem("employerInfo")).token;
      await axios.patch(
        `${API_BASE_URL}/applications/${rescheduleReviewApp._id}/reschedule/respond`,
        { action, employerMessage: employerReviewMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchApplications();
      setRescheduleReviewApp(null);
      setEmployerReviewMessage("");
    } catch (err) {
      console.error("Reschedule review response error", err);
      alert("Failed to process response.");
    } finally {
      setActionLoading(false);
    }
  };

  const isToday = (d) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  if (loading) {
    return (
      <EmployerLayout
      activeTab="interviews"
      title="Interviews"
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "Interviews" },
      ]}
    >
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-silver mb-3" size={36} />
          <p className="text-xs font-mono tracking-widest text-foreground/50 uppercase">
            Loading Interview Schedule & Calendar...
          </p>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout
      activeTab="interviews"
      title="Interviews"
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "Interviews" },
      ]}
    >
      <div className="space-y-6 pb-20">
        {/* HEADER & ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono tracking-widest text-foreground/50 uppercase">
                Hiring Workspace
              </span>
              <span className="text-foreground/30 font-mono">/</span>
              <span className="text-xs font-mono text-silver uppercase">
                Interview Operations
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
              Interview Calendar & Scheduling
            </h1>
            <p className="text-xs font-sans text-foreground/50 mt-1">
              Real-time schedule of candidate interviews across all positions. Timezone:{" "}
              <span className="font-mono text-silver">Local Device Time (IST / UTC +05:30)</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} /> Schedule Interview
            </button>
          </div>
        </div>

        {/* PENDING RESCHEDULE NOTIFICATION BANNER */}
        {applications.some((a) => a.rescheduleRequest?.requestStatus === "pending") && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarClock className="text-amber-400 shrink-0" size={20} />
              <div>
                <p className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wide">
                  Candidate Time Reschedule Requests Pending
                </p>
                <p className="text-xs font-sans text-amber-200/80 mt-0.5">
                  Candidates have requested alternate interview slots due to timing conflicts.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const pendingApp = applications.find(
                  (a) => a.rescheduleRequest?.requestStatus === "pending"
                );
                if (pendingApp) setRescheduleReviewApp(pendingApp);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-mono uppercase tracking-wider shrink-0 transition-colors"
            >
              Review Requests
            </button>
          </div>
        )}

        {/* CALENDAR CONTROLS & VIEW SWITCHER */}
        <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Navigation (Prev, Today, Next) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-elevated border border-border text-foreground hover:bg-surface transition-colors"
              title="Previous period"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 rounded-xl bg-elevated border border-border text-xs font-mono text-foreground hover:bg-surface transition-colors"
            >
              Today
            </button>

            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-elevated border border-border text-foreground hover:bg-surface transition-colors"
              title="Next period"
            >
              <ChevronRight size={16} />
            </button>

            <h2 className="text-base sm:text-lg font-display font-bold text-foreground ml-2">
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>

          {/* Search text filter */}
          <div className="relative flex-1 max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate or job..."
              className="w-full pl-9 pr-3 py-1.5 bg-elevated border border-border rounded-xl text-xs font-sans text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver transition-colors"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-foreground/50 uppercase">Stage:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-elevated border border-border text-xs font-mono text-foreground px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-silver cursor-pointer"
            >
              <option value="all">All Stages</option>
              <option value="scheduled">Scheduled</option>
              <option value="conducted">Conducted</option>
              <option value="reschedule">Reschedule Pending</option>
            </select>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-elevated border border-border">
            {[
              { id: "month", label: "Month" },
              { id: "week", label: "Week" },
              { id: "day", label: "Day" },
              { id: "list", label: "Upcoming" },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setCalendarView(v.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                  calendarView === v.id
                    ? "bg-surface text-foreground font-bold shadow-sm border border-border"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. MONTH VIEW                                                             */}
        {/* ========================================================================= */}
        {calendarView === "month" && (
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-border bg-elevated/70 text-center py-2.5">
              {DAYS_OF_WEEK.map((day) => (
                <span
                  key={day}
                  className="text-[11px] font-mono text-foreground/60 uppercase tracking-widest font-semibold"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Month Day Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-border">
              {monthGridDays.map((cell, idx) => {
                const cellIso = cell.date.toISOString().split("T")[0];
                const dayEvents = interviewEvents.filter(
                  (evt) => evt.date.toISOString().split("T")[0] === cellIso
                );
                const currentDay = isToday(cell.date);

                return (
                  <div
                    key={idx}
                    className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                      cell.isCurrentMonth
                        ? "bg-surface hover:bg-elevated/30"
                        : "bg-surface/40 text-foreground/30"
                    } ${currentDay ? "ring-1 ring-silver/60" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono px-1.5 py-0.5 rounded-md ${
                          currentDay
                            ? "bg-foreground text-background font-bold"
                            : cell.isCurrentMonth
                            ? "text-foreground"
                            : "text-foreground/30"
                        }`}
                      >
                        {cell.date.getDate()}
                      </span>

                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-mono text-silver font-bold">
                          {dayEvents.length} session{dayEvents.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Day Events */}
                    <div className="space-y-1 mt-1 overflow-y-auto max-h-[80px]">
                      {dayEvents.map((evt) => (
                        <button
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className={`w-full text-left p-1.5 rounded-lg border text-[10px] font-mono truncate transition-all ${
                            evt.status === "Interview Conducted"
                              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                              : evt.rescheduleRequest?.requestStatus === "pending"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                              : "bg-purple-500/10 text-purple-300 border-purple-500/30 hover:border-purple-400"
                          }`}
                          title={`${evt.candidate?.name || "Candidate"} - ${evt.job?.title || "Job"}`}
                        >
                          <div className="font-bold truncate">{evt.candidate?.name}</div>
                          <div className="text-[9px] text-foreground/50 truncate">
                            {evt.job?.title}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. WEEK VIEW                                                              */}
        {/* ========================================================================= */}
        {calendarView === "week" && (
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border bg-elevated/70 divide-x divide-border">
              {weekGridDays.map((d, i) => {
                const currentDay = isToday(d);
                return (
                  <div key={i} className="py-3 px-2 text-center">
                    <span className="block text-[11px] font-mono text-foreground/50 uppercase">
                      {DAYS_OF_WEEK[d.getDay()]}
                    </span>
                    <span
                      className={`inline-block text-sm font-display font-bold mt-0.5 px-2 py-0.5 rounded-lg ${
                        currentDay ? "bg-foreground text-background" : "text-foreground"
                      }`}
                    >
                      {d.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-7 divide-x divide-border min-h-[400px]">
              {weekGridDays.map((d, i) => {
                const dIso = d.toISOString().split("T")[0];
                const dayEvents = interviewEvents.filter(
                  (evt) => evt.date.toISOString().split("T")[0] === dIso
                );

                return (
                  <div key={i} className="p-2 space-y-2 bg-surface hover:bg-elevated/20 transition-colors">
                    {dayEvents.length === 0 ? (
                      <p className="text-[10px] font-mono text-foreground/20 text-center pt-8">
                        No sessions
                      </p>
                    ) : (
                      dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className="p-2.5 rounded-xl bg-elevated border border-border hover:border-silver/40 cursor-pointer transition-all space-y-1.5 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                              {evt.type}
                            </span>
                          </div>
                          <p className="text-xs font-display font-bold text-foreground truncate">
                            {evt.candidate?.name}
                          </p>
                          <p className="text-[10px] font-sans text-foreground/50 truncate">
                            {evt.job?.title}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. DAY VIEW                                                               */}
        {/* ========================================================================= */}
        {calendarView === "day" && (
          <div className="bg-surface border border-border rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs font-mono uppercase text-silver">Single Day Agenda</span>
                <h3 className="text-xl font-display font-bold text-foreground">
                  {currentDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-elevated border border-border text-xs font-mono text-foreground">
                Sessions on this day:{" "}
                <strong className="text-silver">
                  {
                    interviewEvents.filter(
                      (evt) =>
                        evt.date.toISOString().split("T")[0] ===
                        currentDate.toISOString().split("T")[0]
                    ).length
                  }
                </strong>
              </span>
            </div>

            {/* List of day sessions */}
            <div className="space-y-3 pt-2">
              {interviewEvents.filter(
                (evt) =>
                  evt.date.toISOString().split("T")[0] ===
                  currentDate.toISOString().split("T")[0]
              ).length === 0 ? (
                <div className="py-16 text-center text-foreground/40 text-xs font-mono">
                  No interview sessions scheduled for this date.
                </div>
              ) : (
                interviewEvents
                  .filter(
                    (evt) =>
                      evt.date.toISOString().split("T")[0] ===
                      currentDate.toISOString().split("T")[0]
                  )
                  .map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className="p-4 rounded-xl bg-elevated border border-border hover:border-silver/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            evt.candidate?.profilePicture ||
                            (evt.candidate?.gender === "Female"
                              ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                              : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                          }
                          alt={evt.candidate?.name}
                          className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                        />
                        <div>
                          <h4 className="font-display font-bold text-sm text-foreground">
                            {evt.candidate?.name}
                          </h4>
                          <p className="text-xs font-mono text-foreground/50">
                            Position: {evt.job?.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {evt.meetingLink && (
                          <a
                            href={evt.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 rounded-lg bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors inline-flex items-center gap-1.5"
                          >
                            <Video size={13} /> Launch Video
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedEvent(evt)}
                          className="px-3 py-1.5 rounded-lg bg-surface border border-border text-foreground text-xs font-mono"
                        >
                          Details & Actions
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. UPCOMING / LIST VIEW                                                   */}
        {/* ========================================================================= */}
        {calendarView === "list" && (
          <div className="space-y-4">
            {interviewEvents.length === 0 ? (
              <div className="p-16 rounded-3xl bg-surface border border-border text-center">
                <CalendarClock size={36} className="mx-auto text-foreground/30 mb-3" />
                <h4 className="text-base font-display font-bold text-foreground">
                  No upcoming interview sessions found
                </h4>
                <p className="text-xs font-sans text-foreground/50 mt-1 mb-6">
                  Click "+ Schedule Interview" to book sessions with shortlisted candidates.
                </p>
                <button
                  onClick={() => setScheduleModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors"
                >
                  Schedule an Interview
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interviewEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-5 rounded-2xl bg-surface border border-border hover:border-silver/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              evt.candidate?.profilePicture ||
                              (evt.candidate?.gender === "Female"
                                ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                                : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                            }
                            alt={evt.candidate?.name}
                            className="w-12 h-12 rounded-xl object-cover border border-border shrink-0 bg-elevated"
                          />
                          <div className="min-w-0">
                            <h4 className="font-display font-bold text-base text-foreground truncate">
                              {evt.candidate?.name}
                            </h4>
                            <p className="text-xs font-mono text-foreground/50 truncate">
                              {evt.job?.title}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                            evt.status === "Interview Conducted"
                              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                              : "bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold"
                          }`}
                        >
                          {evt.status === "Interview Conducted" ? "Conducted" : "Scheduled"}
                        </span>
                      </div>

                      {/* Date & Mode block */}
                      <div className="p-3 rounded-xl bg-elevated border border-border text-xs font-mono space-y-1.5">
                        <div className="flex items-center justify-between text-foreground/70">
                          <span>Interview Date:</span>
                          <span className="text-foreground font-semibold">
                            {evt.date.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-foreground/70">
                          <span>Format:</span>
                          <span className="text-silver">{evt.type}</span>
                        </div>
                        {evt.meetingLink && (
                          <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                            <span className="text-[11px] text-foreground/50 truncate max-w-[170px]">
                              {evt.meetingLink}
                            </span>
                            <a
                              href={evt.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-foreground text-background text-[11px] font-bold hover:bg-silver transition-colors inline-flex items-center gap-1"
                            >
                              <Video size={12} /> Launch
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="px-3 py-1.5 rounded-xl bg-elevated border border-border text-foreground hover:bg-surface text-xs font-mono"
                      >
                        Details / Manage
                      </button>

                      <button
                        onClick={() => navigate(`/profile/${evt.candidate?._id}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors inline-flex items-center gap-1"
                      >
                        Profile &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCHEDULE INTERVIEW WORKFLOW MODAL                                         */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {scheduleModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <CalendarClock size={20} className="text-silver" />
                    <h3 className="font-display font-bold text-lg text-foreground">
                      Schedule Candidate Interview
                    </h3>
                  </div>
                  <button
                    onClick={() => setScheduleModalOpen(false)}
                    className="p-1 rounded-lg text-foreground/40 hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs font-sans">
                  {scheduleConflict && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-mono text-[11px] uppercase">Schedule Time Warning</strong>
                        <span>
                          Another interview with {scheduleConflict.candidate?.name || "a candidate"} is already scheduled at this time.
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Select candidate */}
                  <div>
                    <label className="block font-mono text-foreground/70 uppercase text-[11px] mb-1">
                      Select Candidate *
                    </label>
                    {schedulableCandidates.length === 0 ? (
                      <p className="p-3 rounded-xl bg-elevated border border-border text-foreground/50 font-mono text-xs">
                        No shortlisted candidates currently pending an interview. Shortlist candidates from the Applicant Pipeline first.
                      </p>
                    ) : (
                      <select
                        required
                        value={scheduleForm.applicationId}
                        onChange={(e) =>
                          setScheduleForm({ ...scheduleForm, applicationId: e.target.value })
                        }
                        className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-silver cursor-pointer"
                      >
                        <option value="">-- Choose Candidate --</option>
                        {schedulableCandidates.map((app) => (
                          <option key={app._id} value={app._id}>
                            {app.appliedBy?.name} &bull; {app.job_id?.title} ({app.status})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-foreground/70 uppercase text-[11px] mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={scheduleForm.interviewDate}
                        onChange={(e) =>
                          setScheduleForm({ ...scheduleForm, interviewDate: e.target.value })
                        }
                        className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-silver"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-foreground/70 uppercase text-[11px] mb-1">
                        Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={scheduleForm.interviewTime}
                        onChange={(e) =>
                          setScheduleForm({ ...scheduleForm, interviewTime: e.target.value })
                        }
                        className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-silver"
                      />
                    </div>
                  </div>

                  {/* Interview Type */}
                  <div>
                    <label className="block font-mono text-foreground/70 uppercase text-[11px] mb-1">
                      Interview Format
                    </label>
                    <select
                      value={scheduleForm.interviewType}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, interviewType: e.target.value })
                      }
                      className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-silver cursor-pointer"
                    >
                      <option value="Online Video">Online Video (Google Meet / Zoom)</option>
                      <option value="In-Person">In-Person (HQ / Office)</option>
                      <option value="Phone">Phone Call</option>
                    </select>
                  </div>

                  {/* Meeting link or address */}
                  {scheduleForm.interviewType === "Online Video" ? (
                    <div>
                      <label className="block font-mono text-foreground/70 uppercase text-[11px] mb-1">
                        Meeting Link
                      </label>
                      <input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        value={scheduleForm.meetingLink}
                        onChange={(e) =>
                          setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })
                        }
                        className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground font-mono placeholder:text-foreground/40 focus:outline-none focus:border-silver"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-mono text-foreground/70 uppercase text-[11px] mb-1">
                        Office Location Address
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Floor 4, Tower B, HQ Bangalore"
                        value={scheduleForm.locationAddress}
                        onChange={(e) =>
                          setScheduleForm({ ...scheduleForm, locationAddress: e.target.value })
                        }
                        className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground font-mono placeholder:text-foreground/40 focus:outline-none focus:border-silver"
                      />
                    </div>
                  )}

                  {/* Preparation Notes */}
                  <div>
                    <label className="block font-mono text-foreground/70 uppercase text-[11px] mb-1">
                      Notes / Candidate Instructions
                    </label>
                    <textarea
                      placeholder="e.g. Bring a portfolio walkthrough and prepared system design notes..."
                      value={scheduleForm.notes}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, notes: e.target.value })
                      }
                      className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-silver h-20 resize-y"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex justify-end gap-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setScheduleModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-mono border border-border text-foreground hover:bg-elevated transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading || schedulableCandidates.length === 0}
                      className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-background bg-foreground hover:bg-silver transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                      Confirm & Send Invite
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* INTERVIEW EVENT DETAILS & ACTIONS MODAL                                   */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {selectedEvent && (
            <div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl relative space-y-4"
              >
                <div className="flex items-start justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        selectedEvent.candidate?.profilePicture ||
                        (selectedEvent.candidate?.gender === "Female"
                          ? "https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
                          : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                      }
                      alt={selectedEvent.candidate?.name}
                      className="w-12 h-12 rounded-xl object-cover border border-border bg-elevated"
                    />
                    <div>
                      <h3 className="font-display font-bold text-base text-foreground">
                        {selectedEvent.candidate?.name}
                      </h3>
                      <p className="text-xs font-mono text-silver">
                        {selectedEvent.job?.title}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Event Metadata */}
                <div className="p-3.5 bg-elevated border border-border rounded-xl text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-foreground/70">
                    <span>Status:</span>
                    <span className="text-foreground uppercase font-bold">
                      {selectedEvent.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-foreground/70">
                    <span>Scheduled Date:</span>
                    <span className="text-foreground">
                      {selectedEvent.date.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-foreground/70">
                    <span>Format:</span>
                    <span className="text-silver">{selectedEvent.type}</span>
                  </div>
                  {selectedEvent.meetingLink && (
                    <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                      <span className="text-[11px] text-foreground/50 truncate max-w-[200px]">
                        {selectedEvent.meetingLink}
                      </span>
                      <a
                        href={selectedEvent.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors inline-flex items-center gap-1 shrink-0"
                      >
                        <Video size={13} /> Launch Meeting
                      </a>
                    </div>
                  )}
                  {selectedEvent.notes && (
                    <div className="pt-2 border-t border-border">
                      <span className="text-foreground/40 text-[10px] uppercase block">
                        Interviewer Notes:
                      </span>
                      <p className="text-foreground/80 font-sans italic text-xs mt-0.5">
                        "{selectedEvent.notes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Contextual Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRescheduleData({
                          date: selectedEvent.date.toISOString().split("T")[0],
                          time: "11:00",
                          notes: "",
                          meetingLink: selectedEvent.meetingLink || "",
                        });
                        setRescheduleModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-elevated border border-border text-foreground hover:bg-surface text-xs font-mono"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => setCancelModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-mono"
                    >
                      Cancel Session
                    </button>
                  </div>

                  <button
                    onClick={() => navigate(`/profile/${selectedEvent.candidate?._id}`)}
                    className="px-4 py-1.5 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-silver transition-colors"
                  >
                    View Dossier &rarr;
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* RESCHEDULE CONFIRMATION MODAL                                             */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {rescheduleModalOpen && selectedEvent && (
            <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
              >
                <h3 className="font-display font-bold text-base text-foreground">
                  Reschedule Interview: {selectedEvent.candidate?.name}
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-mono text-foreground/70 uppercase text-[11px] mb-1">
                      New Date
                    </label>
                    <input
                      type="date"
                      value={rescheduleData.date}
                      onChange={(e) =>
                        setRescheduleData({ ...rescheduleData, date: e.target.value })
                      }
                      className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-silver"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-foreground/70 uppercase text-[11px] mb-1">
                      New Time
                    </label>
                    <input
                      type="time"
                      value={rescheduleData.time}
                      onChange={(e) =>
                        setRescheduleData({ ...rescheduleData, time: e.target.value })
                      }
                      className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-silver"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-foreground/70 uppercase text-[11px] mb-1">
                      Updated Meeting Link (optional)
                    </label>
                    <input
                      type="url"
                      value={rescheduleData.meetingLink}
                      onChange={(e) =>
                        setRescheduleData({ ...rescheduleData, meetingLink: e.target.value })
                      }
                      className="w-full p-2.5 bg-elevated border border-border rounded-xl text-foreground font-mono focus:outline-none focus:border-silver"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-border">
                  <button
                    onClick={() => setRescheduleModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-mono border border-border text-foreground hover:bg-elevated"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRescheduleSubmit}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-foreground text-background hover:bg-silver"
                  >
                    {actionLoading ? "Updating..." : "Save New Time"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* CANCEL INTERVIEW MODAL                                                    */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {cancelModalOpen && selectedEvent && (
            <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle size={20} />
                  <h3 className="font-display font-bold text-base text-foreground">
                    Cancel Interview Session?
                  </h3>
                </div>
                <p className="text-xs font-sans text-foreground/70 leading-relaxed">
                  Are you sure you want to cancel the interview for{" "}
                  <strong className="text-foreground">{selectedEvent.candidate?.name}</strong>?
                  Their application will be returned to the <strong className="text-silver">shortlisted</strong> stage.
                </p>

                <div className="pt-2 flex justify-end gap-2 border-t border-border">
                  <button
                    onClick={() => setCancelModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-mono border border-border text-foreground hover:bg-elevated"
                  >
                    Keep Session
                  </button>
                  <button
                    onClick={handleCancelInterviewSubmit}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                  >
                    {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* CANDIDATE RESCHEDULE REVIEW MODAL                                         */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {rescheduleReviewApp && (
            <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
              >
                <h3 className="font-display font-bold text-base text-foreground">
                  Review Reschedule: {rescheduleReviewApp.appliedBy?.name}
                </h3>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5 text-xs font-mono text-amber-200">
                  <p>
                    <strong>Reason:</strong> {rescheduleReviewApp.rescheduleRequest?.reason}
                  </p>
                  <p>
                    <strong>Proposed Time:</strong> {rescheduleReviewApp.rescheduleRequest?.proposedTime}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-foreground/70 uppercase mb-1">
                    Response Note to Candidate
                  </label>
                  <textarea
                    value={employerReviewMessage}
                    onChange={(e) => setEmployerReviewMessage(e.target.value)}
                    placeholder="Enter approval details or alternative suggestion..."
                    className="w-full p-2.5 bg-elevated border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-silver h-20 resize-y"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-border">
                  <button
                    onClick={() => setRescheduleReviewApp(null)}
                    className="px-4 py-2 rounded-xl text-xs font-mono border border-border text-foreground hover:bg-elevated"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleRescheduleReviewResponse("rejected")}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleRescheduleReviewResponse("approved")}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20"
                  >
                    Approve Proposal
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </EmployerLayout>
  );
}
