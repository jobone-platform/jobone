import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import EmployerLayout from "../components/employer/EmployerLayout.jsx";
import JobPreviewCard from "../components/JobPreviewCard.jsx";
import LocationPicker from "../components/LocationPicker.jsx";
import JobConfirmModal from "../components/JobConfirmModal.jsx";
import ElasticTitleDropdown from "../components/ElasticTitleDropdown.jsx";
import CourseSuggestionsDropdown from "../components/CourseSuggestionsDropdown.jsx";
import LanguageSuggestionsDropdown from "../components/LanguageSuggestionsDropdown.jsx";
import SkillSuggestionsDropdown from "../components/SkillSuggestionsDropdown.jsx";
import { API_BASE_URL } from "../config/api";
import {
  MapPin,
  Loader2,
  Users,
  Briefcase,
  FileText,
  Plus,
  X,
  Zap,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  Eye,
  Building,
  Sparkles,
  HelpCircle,
  IndianRupee,
  Clock,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

export const INDUSTRY_SUBDOMAINS = {
  "IT & Software": [
    "Software Development",
    "Data & Analytics",
    "Infrastructure & Cloud",
    "Security & Testing",
    "Design & Product",
  ],
  "Banking & Finance": [
    "Corporate & Investment Banking",
    "Core Finance & Accounting",
    "Retail Banking",
    "Wealth & Asset Management",
    "Risk & Insurance",
  ],
  "Sales & Marketing": [
    "B2B & Corporate Sales",
    "Digital Marketing",
    "Brand & Strategy",
    "Retail & B2C Sales",
    "Communications",
  ],
  "Healthcare & Pharma": [
    "Clinical & Medical",
    "Pharmaceuticals",
    "Healthcare Administration",
    "Medical Sales & Support",
    "Life Sciences",
  ],
  "Engineering & Manufacturing": [
    "Core Engineering",
    "Production & Plant Operations",
    "Quality & Process Improvement",
    "Design & Drafting",
    "Emerging Sectors",
  ],
  "Operations & Logistics": [
    "Supply Chain & Logistics",
    "E-commerce & Delivery",
    "Inventory & Warehousing",
    "Vendor Management",
    "Business Operations",
  ],
  "Customer Support": [
    "Voice Operations",
    "Non-Voice/Digital Support",
    "Technical Support",
    "Client Management",
    "Outsourcing",
  ],
  "HR & Admin": [
    "Talent Acquisition",
    "Core HR",
    "Operations & Compliance",
    "Employee Development",
    "Administration",
  ],
  "Education & EdTech": [
    "Teaching & Academics",
    "EdTech Content",
    "Student Services",
    "Institutional Operations",
    "Corporate Training",
  ],
};

const getDefaultDeadline = () => {
  const date = new Date();
  date.setDate(date.getDate() + 15);
  return date.toISOString().split("T")[0];
};

const TOP_CURRENCIES = [
  { code: "INR", iso: "in", name: "Indian Rupee", sym: "₹" },
  { code: "USD", iso: "us", name: "US Dollar", sym: "$" },
  { code: "EUR", iso: "eu", name: "Euro", sym: "€" },
  { code: "AED", iso: "ae", name: "UAE Dirham", sym: "د.إ" },
];
const REST_CURRENCIES = [
  { code: "GBP", iso: "gb", name: "British Pound", sym: "£" },
  { code: "AUD", iso: "au", name: "Australian Dollar", sym: "A$" },
  { code: "CAD", iso: "ca", name: "Canadian Dollar", sym: "C$" },
  { code: "SGD", iso: "sg", name: "Singapore Dollar", sym: "S$" },
];
const CURRENCIES = [...TOP_CURRENCIES, ...REST_CURRENCIES];

const PERKS_OPTIONS = [
  { value: "Health Insurance", icon: "🏥" },
  { value: "Travel Allowance", icon: "🚌" },
  { value: "Performance Bonus", icon: "🎯" },
  { value: "Goal Incentive", icon: "🏆" },
  { value: "Housing Allowance", icon: "🏠" },
  { value: "PF", icon: "🏦" },
  { value: "ESI", icon: "🩺" },
  { value: "Overtime Pay", icon: "⏰" },
  { value: "Gratuity", icon: "🎁" },
  { value: "Meal Allowance", icon: "🍱" },
  { value: "Internet Allowance", icon: "📶" },
  { value: "Joining Bonus", icon: "✨" },
];

export default function CreateJob() {
  const navigate = useNavigate();
  const locationState = useLocation().state;

  const [currentStep, setCurrentStep] = useState(1);
  const [job, setJob] = useState({
    title: "",
    description: "",
    jobFeatures: ["", ""],
    skillsRequired: [],
    jobType: ["full-time"],
    workDaysPattern: "Mon to Fri",
    customWorkDaysDescription: "",
    mode: ["Work from office"],
    salaryMin: "",
    salaryMax: "",
    salaryFrequency: "Month",
    salaryCurrency: "INR",
    incentives: [],
    screeningQuestions: [],
    requestedDocuments: ["Resume / CV"],
    startDate: "",
    endDate: "",
    applicationDeadline: getDefaultDeadline(),
    isLongTerm: false,
    shifts: [{ shiftName: "Shift 1", startTime: "", endTime: "" }],
    isFlexibleShifts: false,
    isFlexibleDuration: false,
    noOfPeopleRequired: "1",
    genderPreference: "No Preference",
    qualifications: [],
    courses: [],
    ageLimit: { min: "18", max: "60", isAny: false },
    languages: ["English"],
    experience: {
      relevantExperience: { min: "", max: "", isAny: true },
      totalExperience: { min: "", max: "", isAny: true },
    },
    useOfficeLocation: false,
    location: "",
    latitude: null,
    longitude: null,
    isThirdPartyRecruiting: false,
    hiringCompanyName: "",
    showHiringCompanyName: false,
  });

  const [isUnpaid, setIsUnpaid] = useState(false);
  const [jobSummary, setJobSummary] = useState("");
  const [keyResponsibilities, setKeyResponsibilities] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [pageAccess, setPageAccess] = useState("checking");
  const [blockMessage, setBlockMessage] = useState("");
  const [isPostingDisabled, setIsPostingDisabled] = useState(false);
  const [missingItems, setMissingItems] = useState([]);
  const [employerProfileName, setEmployerProfileName] = useState("Your Company");
  const [draftBanner, setDraftBanner] = useState(false);
  const [saveDraftToast, setSaveDraftToast] = useState("");

  // Check saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("jobone_job_draft");
      if (saved && !locationState?.repostData) {
        setDraftBanner(true);
      }
    } catch (_err) {
      /* ignore */
    }
  }, [locationState]);

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem("jobone_job_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.job) setJob(parsed.job);
        if (parsed.jobSummary) setJobSummary(parsed.jobSummary);
        if (parsed.keyResponsibilities) setKeyResponsibilities(parsed.keyResponsibilities);
        if (parsed.step) setCurrentStep(parsed.step);
        if (parsed.isUnpaid !== undefined) setIsUnpaid(parsed.isUnpaid);
      }
      setDraftBanner(false);
    } catch (_err) {
      /* ignore */
    }
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem("jobone_job_draft");
    } catch (_err) {
      /* ignore */
    }
    setDraftBanner(false);
  };

  const handleSaveDraft = () => {
    try {
      const payload = {
        job,
        jobSummary,
        keyResponsibilities,
        step: currentStep,
        isUnpaid,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem("jobone_job_draft", JSON.stringify(payload));
      setSaveDraftToast("Draft saved locally!");
      setTimeout(() => setSaveDraftToast(""), 3000);
    } catch (_err) {
      alert("Failed to save draft to local storage.");
    }
  };

  // Eligibility check
  useEffect(() => {
    let isMounted = true;
    const checkEligibility = async () => {
      try {
        const storedData = localStorage.getItem("employerInfo");
        if (!storedData) return navigate("/login");

        const { token } = JSON.parse(storedData);
        const res = await axios.get(`${API_BASE_URL}/employer/check-eligibility`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isMounted) return;
        const { data } = res;

        if (data.isFrozen) {
          setIsPostingDisabled(true);
          setBlockMessage("Your account is frozen. Posting new jobs is disabled.");
          setPageAccess("granted");
          return;
        }

        if (data.access === "blocked") {
          setBlockMessage(data.message || "Account verification required.");
          setPageAccess("blocked");
          return;
        }

        if (data.access === "incomplete") {
          setIsPostingDisabled(true);
          setMissingItems(data.missingItems || []);
          setBlockMessage(data.message || "Please complete company profile before posting.");
          setPageAccess("granted");
          return;
        }

        if (data.companyName || data.name) {
          setEmployerProfileName(data.companyName || data.name);
        }

        setIsPostingDisabled(false);
        setPageAccess("granted");
      } catch (err) {
        console.error("Eligibility check failed:", err);
        if (!isMounted) return;
        if (err.response?.status === 401) {
          localStorage.removeItem("employerInfo");
          navigate("/login");
        } else {
          setBlockMessage("Server check failed. Proceeding with caution.");
          setPageAccess("granted");
        }
      }
    };

    checkEligibility();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Handle repost state
  useEffect(() => {
    if (locationState?.repostData) {
      const d = locationState.repostData;
      let parsedSummary = "";
      let parsedResponsibilities = "";
      if (d.description) {
        const parts = d.description.split("<h3>Key Responsibilities</h3>");
        parsedSummary = parts[0]
          ? parts[0].replace("<h3>Job Summary</h3>", "").trim()
          : "";
        parsedResponsibilities = parts[1] ? parts[1].trim() : "";
      }

      setJob((prev) => ({
        ...prev,
        title: d.title || "",
        description: "",
        jobFeatures: d.jobFeatures?.length === 2 ? d.jobFeatures : ["", ""],
        skillsRequired: d.skillsRequired || [],
        jobType: d.jobType?.length ? d.jobType : ["full-time"],
        workDaysPattern: d.workDaysPattern || "Mon to Fri",
        customWorkDaysDescription: d.customWorkDaysDescription || "",
        mode: d.mode?.length ? d.mode : ["Work from office"],
        salaryMin: d.salaryMin || "",
        salaryMax: d.salaryMax || "",
        salaryFrequency: d.salaryFrequency || "Month",
        incentives: Array.isArray(d.incentives) ? d.incentives : [],
        screeningQuestions: d.screeningQuestions || [],
        requestedDocuments: d.requestedDocuments || ["Resume / CV"],
        startDate: d.startDate ? new Date(d.startDate).toISOString().split("T")[0] : "",
        endDate: d.endDate ? new Date(d.endDate).toISOString().split("T")[0] : "",
        applicationDeadline: getDefaultDeadline(),
        isFlexibleDuration: d.isFlexibleDuration || false,
        shifts: d.shifts?.length > 0 ? d.shifts : [{ shiftName: "Shift 1", startTime: "", endTime: "" }],
        isFlexibleShifts: d.isFlexibleShifts || false,
        noOfPeopleRequired: d.noOfPeopleRequired || "1",
        genderPreference: d.genderPreference || "No Preference",
        qualifications: d.qualifications || [],
        courses: d.courses || [],
        ageLimit: d.ageLimit || { min: "18", max: "60", isAny: false },
        languages: d.languages?.length ? d.languages : ["English"],
        experience: d.experience || {
          relevantExperience: { min: "", max: "", isAny: true },
          totalExperience: { min: "", max: "", isAny: true },
        },
        useOfficeLocation: false,
        location: d.location?.address || "",
        latitude: d.location?.coordinates?.[1] || null,
        longitude: d.location?.coordinates?.[0] || null,
      }));
      setJobSummary(parsedSummary);
      setKeyResponsibilities(parsedResponsibilities);
    }
  }, [locationState]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;
    setJob((prev) => ({ ...prev, [name]: finalValue }));
    if (touched[name]) validateField(name, finalValue);
  };

  const validateField = (name, value) => {
    let err = "";
    if (name === "title" && !value?.trim()) err = "Job title is required";
    if (name === "noOfPeopleRequired" && (!value || Number(value) < 1))
      err = "Must be at least 1";
    if (name === "salaryMin" && !isUnpaid && !value) err = "Minimum salary required";
    setErrors((prev) => ({ ...prev, [name]: err }));
    return !err;
  };

  const toggleArrayItem = (field, value) => {
    setJob((prev) => {
      const arr = prev[field] || [];
      const newArr = arr.includes(value)
        ? arr.filter((i) => i !== value)
        : [...arr, value];
      return { ...prev, [field]: newArr };
    });
  };

  // AI Details generation
  const handleAIGenerate = async () => {
    if (!job.title?.trim()) {
      alert("Please enter a Job Title in Step 1 first.");
      setCurrentStep(1);
      return;
    }
    setGeneratingAI(true);
    try {
      const storedData = localStorage.getItem("employerInfo");
      const token = storedData ? JSON.parse(storedData).token : null;
      if (!token) throw new Error("No token found");

      const { data } = await axios.post(
        `${API_BASE_URL}/ai/generate-job-details`,
        {
          title: job.title,
          jobType: (job.jobType || []).join(", "),
          mode: (job.mode || []).join(", "),
          experience: job.experience,
          skills: (job.skillsRequired || []).join(", "),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.summary) setJobSummary(data.summary);
      if (data.responsibilities) {
        const lines = data.responsibilities
          .split("\n")
          .map((line) => line.replace(/^[-*•]\s*/, "").trim())
          .filter((line) => line.length > 5);
        setKeyResponsibilities(lines.map((l) => `• ${l}`).join("\n"));
      }
      if (data.screeningQuestions && Array.isArray(data.screeningQuestions)) {
        setJob((prev) => ({
          ...prev,
          screeningQuestions: [
            ...new Set([...(prev.screeningQuestions || []), ...data.screeningQuestions]),
          ],
        }));
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      alert("Failed to auto-generate content. Please write manually.");
    } finally {
      setGeneratingAI(false);
    }
  };

  // Step Validations
  const validateStep = (stepNumber) => {
    const newErrors = {};
    let valid = true;

    if (stepNumber === 1) {
      if (!job.title?.trim()) {
        newErrors.title = "Job Title is required";
        valid = false;
      }
      if (!job.jobType || job.jobType.length === 0) {
        newErrors.jobType = "Select at least one employment type";
        valid = false;
      }
      if (!job.noOfPeopleRequired || Number(job.noOfPeopleRequired) < 1) {
        newErrors.noOfPeopleRequired = "Valid number of openings required";
        valid = false;
      }
    }

    if (stepNumber === 2) {
      if (!job.mode || job.mode.length === 0) {
        newErrors.mode = "Select workplace mode";
        valid = false;
      }
      const needsLocation =
        job.mode?.includes("Work from office") || job.mode?.includes("Work from field");
      if (needsLocation && !job.useOfficeLocation && !job.location) {
        newErrors.location = "Office location address or map pin required";
        valid = false;
      }
      if (!isUnpaid && (!job.salaryMin || Number(job.salaryMin) <= 0)) {
        newErrors.salaryMin = "Minimum compensation required";
        valid = false;
      }
    }

    if (stepNumber === 3) {
      if (!jobSummary.trim()) {
        newErrors.jobSummary = "Job summary is required";
        valid = false;
      }
      if (!keyResponsibilities.trim()) {
        newErrors.keyResponsibilities = "Key responsibilities are required";
        valid = false;
      }
      if (!job.skillsRequired || job.skillsRequired.length === 0) {
        newErrors.skillsRequired = "Add at least one core skill";
        valid = false;
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return valid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Publish Handler
  const handlePublish = async () => {
    if (loading || isPostingDisabled) return;

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      alert("Please resolve the required fields before publishing.");
      return;
    }

    try {
      setLoading(true);
      const storedData = localStorage.getItem("employerInfo");
      const token = storedData ? JSON.parse(storedData).token : null;
      if (!token) return alert("Session expired. Please log in again.");

      const parsedMin = isUnpaid ? 0 : Number(job.salaryMin || 0);
      const parsedMax = isUnpaid ? 0 : Number(job.salaryMax || job.salaryMin || 0);

      const payload = {
        ...job,
        jobSummary,
        keyResponsibilities,
        salaryMin: parsedMin,
        salaryMax: parsedMax,
        noOfPeopleRequired: Number(job.noOfPeopleRequired),
      };

      if (!payload.applicationDeadline) delete payload.applicationDeadline;
      if (payload.isFlexibleShifts) payload.shifts = [];

      const needsLocation =
        job.mode.includes("Work from office") || job.mode.includes("Work from field");

      if (!job.useOfficeLocation && needsLocation && job.latitude && job.longitude) {
        payload.location = {
          type: "Point",
          coordinates: [Number(job.longitude), Number(job.latitude)],
          address: job.location,
        };
      } else {
        delete payload.latitude;
        delete payload.longitude;
        delete payload.location;
      }

      await axios.post(`${API_BASE_URL}/jobs`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Clear draft on successful submission
      try {
        localStorage.removeItem("jobone_job_draft");
      } catch (_err) {
        /* ignore */
      }

      alert("Job opportunity created successfully! It is now live in your pipeline.");
      navigate("/employerdashboard");
    } catch (error) {
      console.error("Error posting job:", error);
      alert(`Failed to publish job: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  // Combined preview object for Modal & Preview Card
  const previewJobObject = useMemo(() => {
    return {
      ...job,
      jobSummary,
      keyResponsibilities,
      postedByCompany: employerProfileName,
      createdAt: new Date().toISOString(),
      postedAt: new Date().toISOString(),
    };
  }, [job, jobSummary, keyResponsibilities, employerProfileName]);

  // Access blocked screen
  if (pageAccess === "blocked") {
    return (
      <EmployerLayout activeTab="createjob" title="Access Denied">
        <div className="py-20 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">
            Job Posting Permission Restricted
          </h2>
          <p className="text-sm text-[var(--theme-text-muted)] mb-6 leading-relaxed">
            {blockMessage}
          </p>
          <button
            onClick={() => navigate("/employerdashboard")}
            className="px-5 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] font-bold text-xs"
          >
            Return to Dashboard
          </button>
        </div>
      </EmployerLayout>
    );
  }

  const stepsMeta = [
    { num: 1, title: "Job Basics", desc: "Role, category & scope" },
    { num: 2, title: "Location & Pay", desc: "Workplace & compensation" },
    { num: 3, title: "Description", desc: "Responsibilities & skills" },
    { num: 4, title: "Screening", desc: "Questions & document requirements" },
    { num: 5, title: "Review & Publish", desc: "Audit and launch" },
  ];

  return (
    <EmployerLayout
      activeTab="createjob"
      title="Create Job Opportunity"
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "New Posting" },
      ]}
    >
      {/* 1. TOP DRAFT NOTIFICATION BANNER */}
      {draftBanner && (
        <div className="mb-6 p-4 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border-silver)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <RotateCcw size={18} className="text-[var(--theme-accent-silver)] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[var(--theme-text)]">
                Unsaved Job Draft Detected
              </p>
              <p className="text-[11px] text-[var(--theme-text-muted)]">
                You have an unfinished job posting saved in your browser.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadDraft}
              className="px-3 py-1.5 rounded-lg bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Resume Draft
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="px-3 py-1.5 rounded-lg border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Save Draft Toast */}
      {saveDraftToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} />
          <span>{saveDraftToast}</span>
        </div>
      )}

      {/* Account Incomplete Warning Warning Strip */}
      {isPostingDisabled && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-start gap-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="text-xs flex-1">
            <p className="font-bold">Posting Locked: Verification Incomplete</p>
            <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">
              {blockMessage} Please complete your KYC verification or company profile to activate listings.
              {missingItems.length > 0 && ` (Missing: ${missingItems.join(", ")})`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/employerdocupload")}
            className="px-3 py-1 rounded-lg bg-amber-400 text-black text-xs font-bold shrink-0"
          >
            Upload KYC
          </button>
        </div>
      )}

      {/* 2. MULTI-STEP WIZARD PROGRESS TRACKER */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--theme-text)] tracking-tight">
              Post an Open Position
            </h1>
            <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
              Step {currentStep} of 5 — {stepsMeta[currentStep - 1].title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors"
              title="Save current progress"
            >
              <Save size={14} className="text-[var(--theme-accent-silver)]" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors"
              title="Preview listing modal"
            >
              <Eye size={14} className="text-[var(--theme-accent-silver)]" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {stepsMeta.map((s) => {
            const isDone = s.num < currentStep;
            const isCurrent = s.num === currentStep;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < currentStep) setCurrentStep(s.num);
                  else if (s.num > currentStep && validateStep(currentStep)) {
                    setCurrentStep(s.num);
                  }
                }}
                className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-[var(--theme-surface-elevated)] border-[var(--theme-accent-silver)] shadow-sm"
                    : isDone
                    ? "bg-[var(--theme-surface)] border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] cursor-pointer"
                    : "bg-[var(--theme-surface)]/40 border-[var(--theme-border)]/50 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-[var(--theme-text)] text-[var(--theme-bg)]"
                        : "bg-[var(--theme-surface-muted)] text-[var(--theme-text-muted)]"
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={12} /> : s.num}
                  </div>
                  <span className="text-xs font-bold text-[var(--theme-text)] truncate hidden md:inline">
                    {s.title}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--theme-text-muted)] truncate hidden lg:block">
                  {s.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. WIZARD STEP CANVAS */}
      <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-3xl p-5 sm:p-8 shadow-sm">
        {/* ========================================================================= */}
        {/* STEP 1: JOB BASICS                                                        */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-[var(--theme-border)] pb-4">
              <h2 className="text-base sm:text-lg font-bold text-[var(--theme-text)]">
                Step 1: Role Fundamentals
              </h2>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                Define the core title, employment terms, department category, and headcount.
              </p>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                Job Title <span className="text-red-400">*</span>
              </label>
              <ElasticTitleDropdown
                value={job.title}
                onChange={(val) => {
                  setJob((prev) => ({ ...prev, title: val }));
                  setErrors((prev) => ({ ...prev, title: "" }));
                }}
                placeholder="e.g. Senior Full Stack Engineer"
              />
              {errors.title && (
                <p className="text-[11px] text-red-400 mt-1 font-semibold">{errors.title}</p>
              )}
            </div>

            {/* Employment Types */}
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-2">
                Employment Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "full-time", label: "Full-time" },
                  { id: "part-time", label: "Part-time" },
                  { id: "internship", label: "Internship" },
                  { id: "contract", label: "Contract" },
                ].map((type) => {
                  const selected = job.jobType?.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleArrayItem("jobType", type.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        selected
                          ? "bg-[var(--theme-surface-elevated)] border-[var(--theme-accent-silver)] text-[var(--theme-text)] shadow-sm font-bold"
                          : "border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-[var(--theme-border-silver)] hover:text-[var(--theme-text)]"
                      }`}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
              {errors.jobType && (
                <p className="text-[11px] text-red-400 mt-1 font-semibold">{errors.jobType}</p>
              )}
            </div>

            {/* Department / Category Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                  Industry / Department
                </label>
                <select
                  value={job.department || "IT & Software"}
                  onChange={(e) => setJob((prev) => ({ ...prev, department: e.target.value }))}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-border-silver)]"
                >
                  {Object.keys(INDUSTRY_SUBDOMAINS).map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                  Subdomain Focus
                </label>
                <select
                  value={job.subdomain || ""}
                  onChange={(e) => setJob((prev) => ({ ...prev, subdomain: e.target.value }))}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-border-silver)]"
                >
                  <option value="">Select Subdomain (Optional)</option>
                  {(INDUSTRY_SUBDOMAINS[job.department || "IT & Software"] || []).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Openings & Gender Preference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                  Number of Openings <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  name="noOfPeopleRequired"
                  value={job.noOfPeopleRequired}
                  onChange={handleChange}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-border-silver)]"
                />
                {errors.noOfPeopleRequired && (
                  <p className="text-[11px] text-red-400 mt-1 font-semibold">{errors.noOfPeopleRequired}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                  Gender Preference
                </label>
                <select
                  name="genderPreference"
                  value={job.genderPreference}
                  onChange={handleChange}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-border-silver)]"
                >
                  <option value="No Preference">No Preference (Equal Opportunity)</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Experience Level Requirements */}
            <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)]/50 border border-[var(--theme-border)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[var(--theme-text)]">
                  Experience Requirement (Years)
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--theme-text-muted)]">
                  <input
                    type="checkbox"
                    checked={job.experience?.totalExperience?.isAny ?? true}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setJob((prev) => ({
                        ...prev,
                        experience: {
                          ...prev.experience,
                          totalExperience: { min: "", max: "", isAny: checked },
                          relevantExperience: { min: "", max: "", isAny: checked },
                        },
                      }));
                    }}
                    className="rounded border-[var(--theme-border)]"
                  />
                  <span>Freshers Welcome / Any Experience</span>
                </label>
              </div>

              {!job.experience?.totalExperience?.isAny && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">
                      Min Years
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={job.experience?.totalExperience?.min || ""}
                      onChange={(e) =>
                        setJob((prev) => ({
                          ...prev,
                          experience: {
                            ...prev.experience,
                            totalExperience: {
                              ...prev.experience?.totalExperience,
                              min: e.target.value,
                              isAny: false,
                            },
                          },
                        }))
                      }
                      placeholder="e.g. 2"
                      className="w-full p-2 text-xs rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">
                      Max Years
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={job.experience?.totalExperience?.max || ""}
                      onChange={(e) =>
                        setJob((prev) => ({
                          ...prev,
                          experience: {
                            ...prev.experience,
                            totalExperience: {
                              ...prev.experience?.totalExperience,
                              max: e.target.value,
                              isAny: false,
                            },
                          },
                        }))
                      }
                      placeholder="e.g. 5"
                      className="w-full p-2 text-xs rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: LOCATION & COMPENSATION                                           */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-[var(--theme-border)] pb-4">
              <h2 className="text-base sm:text-lg font-bold text-[var(--theme-text)]">
                Step 2: Location & Compensation
              </h2>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                Set workplace flexibility, geographical location, and compensation package.
              </p>
            </div>

            {/* Mode of Work */}
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-2">
                Workplace Mode <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "Work from office", label: "Work from Office", icon: Building },
                  { id: "Work from home", label: "Remote / WFH", icon: Zap },
                  { id: "Work from field", label: "Field / Hybrid", icon: MapPin },
                ].map((mode) => {
                  const selected = job.mode?.includes(mode.id);
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => toggleArrayItem("mode", mode.id)}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                        selected
                          ? "bg-[var(--theme-surface-elevated)] border-[var(--theme-accent-silver)] text-[var(--theme-text)] font-bold shadow-sm"
                          : "border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-[var(--theme-border-silver)] hover:text-[var(--theme-text)]"
                      }`}
                    >
                      <Icon size={15} />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.mode && (
                <p className="text-[11px] text-red-400 mt-1 font-semibold">{errors.mode}</p>
              )}
            </div>

            {/* Location Selector (when not pure Remote) */}
            {(job.mode?.includes("Work from office") || job.mode?.includes("Work from field")) && (
              <div className="space-y-3 p-4 rounded-2xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--theme-text)]">
                    Office / Job Site Location <span className="text-red-400">*</span>
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--theme-text-muted)]">
                    <input
                      type="checkbox"
                      checked={job.useOfficeLocation}
                      onChange={(e) =>
                        setJob((prev) => ({
                          ...prev,
                          useOfficeLocation: e.target.checked,
                          location: e.target.checked ? "Primary Company HQ" : prev.location,
                        }))
                      }
                      className="rounded"
                    />
                    <span>Same as Registered Company HQ</span>
                  </label>
                </div>

                {!job.useOfficeLocation && (
                  <div>
                    <LocationPicker
                      selectedLocation={job.location}
                      onSelect={(locData) => {
                        setJob((prev) => ({
                          ...prev,
                          location: locData.address,
                          latitude: locData.lat,
                          longitude: locData.lng,
                        }));
                        setErrors((prev) => ({ ...prev, location: "" }));
                      }}
                    />
                    {errors.location && (
                      <p className="text-[11px] text-red-400 mt-1 font-semibold">{errors.location}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Compensation & Salary Range */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[var(--theme-text)]">
                  Compensation Package
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--theme-text-muted)]">
                  <input
                    type="checkbox"
                    checked={isUnpaid}
                    onChange={(e) => {
                      setIsUnpaid(e.target.checked);
                      if (e.target.checked) {
                        setJob((prev) => ({ ...prev, salaryMin: "", salaryMax: "" }));
                      }
                    }}
                    className="rounded"
                  />
                  <span>Unpaid / Volunteer Internship</span>
                </label>
              </div>

              {!isUnpaid && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">
                      Min Amount <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="salaryMin"
                      value={job.salaryMin}
                      onChange={handleChange}
                      placeholder="e.g. 50000"
                      className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-border-silver)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">
                      Max Amount
                    </label>
                    <input
                      type="number"
                      name="salaryMax"
                      value={job.salaryMax}
                      onChange={handleChange}
                      placeholder="e.g. 80000"
                      className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-border-silver)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">
                      Frequency
                    </label>
                    <select
                      name="salaryFrequency"
                      value={job.salaryFrequency}
                      onChange={handleChange}
                      className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                    >
                      <option value="Month">Per Month</option>
                      <option value="Year">Per Year (LPA)</option>
                      <option value="Week">Per Week</option>
                      <option value="Hour">Per Hour</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">
                      Currency
                    </label>
                    <select
                      name="salaryCurrency"
                      value={job.salaryCurrency}
                      onChange={handleChange}
                      className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.sym})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {errors.salaryMin && (
                <p className="text-[11px] text-red-400 font-semibold">{errors.salaryMin}</p>
              )}
            </div>

            {/* Perks & Benefits Badges */}
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-2">
                Incentives & Perks Included
              </label>
              <div className="flex flex-wrap gap-2">
                {PERKS_OPTIONS.map((perk) => {
                  const selected = job.incentives?.includes(perk.value);
                  return (
                    <button
                      key={perk.value}
                      type="button"
                      onClick={() => toggleArrayItem("incentives", perk.value)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        selected
                          ? "bg-[var(--theme-surface-elevated)] border-[var(--theme-accent-silver)] text-[var(--theme-text)] font-bold shadow-sm"
                          : "border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-[var(--theme-border-silver)]"
                      }`}
                    >
                      <span className="mr-1.5">{perk.icon}</span>
                      {perk.value}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: JOB DESCRIPTION & REQUIREMENTS                                    */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-[var(--theme-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--theme-text)]">
                  Step 3: Description & Qualifications
                </h2>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Outline day-to-day deliverables, essential skill stacks, and educational background.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={generatingAI}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-silver/20 to-white/10 text-[var(--theme-text)] border border-[var(--theme-border-silver)] text-xs font-bold hover:opacity-90 shadow-sm transition-all"
              >
                {generatingAI ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} className="text-[var(--theme-accent-silver)]" />
                )}
                <span>Auto-Draft with AI</span>
              </button>
            </div>

            {/* Job Summary */}
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                Executive Role Summary <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={jobSummary}
                onChange={(e) => {
                  setJobSummary(e.target.value);
                  setErrors((prev) => ({ ...prev, jobSummary: "" }));
                }}
                placeholder="High-level overview of the team, mission, and why candidates should join..."
                className="w-full p-3 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-border-silver)] transition-all resize-y"
              />
              {errors.jobSummary && (
                <p className="text-[11px] text-red-400 mt-1 font-semibold">{errors.jobSummary}</p>
              )}
            </div>

            {/* Key Responsibilities */}
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                Key Responsibilities <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={5}
                value={keyResponsibilities}
                onChange={(e) => {
                  setKeyResponsibilities(e.target.value);
                  setErrors((prev) => ({ ...prev, keyResponsibilities: "" }));
                }}
                placeholder="• Lead architecture discussions&#10;• Ship features alongside cross-functional teams&#10;• Mentor junior engineers..."
                className="w-full p-3 text-xs font-mono rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-border-silver)] transition-all resize-y"
              />
              {errors.keyResponsibilities && (
                <p className="text-[11px] text-red-400 mt-1 font-semibold">
                  {errors.keyResponsibilities}
                </p>
              )}
            </div>

            {/* Skills Suggestions */}
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                Required Technical & Domain Skills <span className="text-red-400">*</span>
              </label>
              <SkillSuggestionsDropdown
                selectedSkills={job.skillsRequired || []}
                onChange={(skills) => {
                  setJob((prev) => ({ ...prev, skillsRequired: skills }));
                  setErrors((prev) => ({ ...prev, skillsRequired: "" }));
                }}
              />
              {errors.skillsRequired && (
                <p className="text-[11px] text-red-400 mt-1 font-semibold">
                  {errors.skillsRequired}
                </p>
              )}
            </div>

            {/* Education & Degree Requirements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                  Degree / Education Level
                </label>
                <CourseSuggestionsDropdown
                  selectedCourses={job.courses || []}
                  onChange={(courses) => setJob((prev) => ({ ...prev, courses }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                  Language Proficiencies
                </label>
                <LanguageSuggestionsDropdown
                  selectedLanguages={job.languages || ["English"]}
                  onChange={(languages) => setJob((prev) => ({ ...prev, languages }))}
                />
              </div>
            </div>

            {/* Shifts & Timings */}
            <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[var(--theme-text)]">
                  Shift Timing Requirements
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--theme-text-muted)]">
                  <input
                    type="checkbox"
                    checked={job.isFlexibleShifts}
                    onChange={(e) =>
                      setJob((prev) => ({ ...prev, isFlexibleShifts: e.target.checked }))
                    }
                    className="rounded"
                  />
                  <span>Flexible Working Hours</span>
                </label>
              </div>

              {!job.isFlexibleShifts && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={job.shifts?.[0]?.startTime || "09:00"}
                      onChange={(e) =>
                        setJob((prev) => ({
                          ...prev,
                          shifts: [{ ...prev.shifts[0], startTime: e.target.value }],
                        }))
                      }
                      className="w-full p-2 text-xs rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={job.shifts?.[0]?.endTime || "18:00"}
                      onChange={(e) =>
                        setJob((prev) => ({
                          ...prev,
                          shifts: [{ ...prev.shifts[0], endTime: e.target.value }],
                        }))
                      }
                      className="w-full p-2 text-xs rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: SCREENING & APPLICATION SETTINGS                                  */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-[var(--theme-border)] pb-4">
              <h2 className="text-base sm:text-lg font-bold text-[var(--theme-text)]">
                Step 4: Screening & Intake Configuration
              </h2>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                Set custom candidate screening questions, required documentation, and deadlines.
              </p>
            </div>

            {/* Custom Screening Questions */}
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-2">
                Candidate Screening Questions
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. How many years of production Kubernetes experience do you have?"
                  className="flex-1 p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] focus:outline-none focus:border-[var(--theme-border-silver)]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newQuestion.trim()) {
                      e.preventDefault();
                      setJob((prev) => ({
                        ...prev,
                        screeningQuestions: [...(prev.screeningQuestions || []), newQuestion.trim()],
                      }));
                      setNewQuestion("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newQuestion.trim()) {
                      setJob((prev) => ({
                        ...prev,
                        screeningQuestions: [...(prev.screeningQuestions || []), newQuestion.trim()],
                      }));
                      setNewQuestion("");
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Add Question
                </button>
              </div>

              {(job.screeningQuestions || []).length > 0 && (
                <ul className="space-y-2">
                  {job.screeningQuestions.map((q, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-[var(--theme-text)] font-medium">
                        {idx + 1}. {q}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setJob((prev) => ({
                            ...prev,
                            screeningQuestions: prev.screeningQuestions.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-[var(--theme-text-muted)] hover:text-red-400 transition-colors p-1"
                        title="Remove question"
                      >
                        <X size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Requested Application Documents */}
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-2">
                Requested Documents from Candidates
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {["Resume / CV", "Cover Letter", "Portfolio / Work Samples", "Degree Certificates"].map(
                  (doc) => {
                    const selected = job.requestedDocuments?.includes(doc);
                    return (
                      <button
                        key={doc}
                        type="button"
                        onClick={() => toggleArrayItem("requestedDocuments", doc)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                          selected
                            ? "bg-[var(--theme-surface-elevated)] border-[var(--theme-accent-silver)] text-[var(--theme-text)] font-bold shadow-sm"
                            : "border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-[var(--theme-border-silver)] hover:text-[var(--theme-text)]"
                        }`}
                      >
                        {doc}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Application Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={job.applicationDeadline}
                  onChange={handleChange}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1.5">
                  Target Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={job.startDate}
                  onChange={handleChange}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              </div>
            </div>

            {/* Third-Party Recruiting Toggle */}
            <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)]/40 border border-[var(--theme-border)] space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--theme-text)]">
                <input
                  type="checkbox"
                  name="isThirdPartyRecruiting"
                  checked={job.isThirdPartyRecruiting}
                  onChange={handleChange}
                  className="rounded"
                />
                <span>Hiring on behalf of a client company (Agency Recruiting)</span>
              </label>

              {job.isThirdPartyRecruiting && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <input
                    type="text"
                    name="hiringCompanyName"
                    value={job.hiringCompanyName}
                    onChange={handleChange}
                    placeholder="Client Company Name (e.g. Acme Corp)"
                    className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                  />
                  <label className="flex items-center gap-2 text-xs text-[var(--theme-text-muted)] cursor-pointer">
                    <input
                      type="checkbox"
                      name="showHiringCompanyName"
                      checked={job.showHiringCompanyName}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <span>Show client company name on public listing</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: REVIEW & PUBLISH                                                  */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-[var(--theme-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--theme-text)]">
                  Step 5: Review & Publish
                </h2>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Verify all position parameters before publishing to candidates.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)]"
              >
                <Eye size={14} className="text-[var(--theme-accent-silver)]" />
                <span>Full Modal Preview</span>
              </button>
            </div>

            {/* Quick Section Summaries with Edit Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Step 1 Summary */}
              <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)]/50 border border-[var(--theme-border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--theme-text)]">1. Basics</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[11px] font-semibold text-[var(--theme-accent-silver)] hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm font-bold text-[var(--theme-text)]">{job.title || "Untitled"}</p>
                <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                  {(job.jobType || []).join(", ") || "Full-time"} • {job.noOfPeopleRequired} openings
                </p>
              </div>

              {/* Step 2 Summary */}
              <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)]/50 border border-[var(--theme-border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--theme-text)]">2. Workplace & Pay</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-[11px] font-semibold text-[var(--theme-accent-silver)] hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm font-bold text-[var(--theme-text)]">
                  {isUnpaid ? "Unpaid" : `${job.salaryCurrency} ${job.salaryMin} - ${job.salaryMax || job.salaryMin} / ${job.salaryFrequency}`}
                </p>
                <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                  {(job.mode || []).join(", ")} • {job.useOfficeLocation ? "Company HQ" : job.location || "Remote"}
                </p>
              </div>

              {/* Step 3 Summary */}
              <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)]/50 border border-[var(--theme-border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--theme-text)]">3. Requirements</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-[11px] font-semibold text-[var(--theme-accent-silver)] hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-xs text-[var(--theme-text-muted)] line-clamp-2">
                  {jobSummary || "No summary provided"}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(job.skillsRequired || []).slice(0, 4).map((sk) => (
                    <span
                      key={sk}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--theme-surface)] text-[var(--theme-accent-silver)] border border-[var(--theme-border)]"
                    >
                      {sk}
                    </span>
                  ))}
                  {(job.skillsRequired || []).length > 4 && (
                    <span className="text-[10px] text-[var(--theme-text-subtle)] font-mono">
                      +{(job.skillsRequired || []).length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Step 4 Summary */}
              <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)]/50 border border-[var(--theme-border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--theme-text)]">4. Screening & Dates</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-[11px] font-semibold text-[var(--theme-accent-silver)] hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-xs text-[var(--theme-text)]">
                  {(job.screeningQuestions || []).length} custom screening questions
                </p>
                <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                  Deadline: {job.applicationDeadline || "Open until filled"}
                </p>
              </div>
            </div>

            {/* Publish Disclaimer */}
            <div className="p-4 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] flex items-start gap-3">
              <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                <span className="font-bold text-[var(--theme-text)]">Ready to launch listing:</span> By publishing, your opportunity becomes visible to qualified candidates. You can pause or close the listing at any time from your Job Management Tracker.
              </div>
            </div>
          </div>
        )}

        {/* 4. WIZARD FOOTER NAVIGATION CONTROLS */}
        <div className="mt-8 pt-5 border-t border-[var(--theme-border)] flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] text-xs sm:text-sm font-semibold text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/employerdashboard")}
              className="px-4 py-2.5 rounded-xl border border-[var(--theme-border)] text-xs sm:text-sm font-medium text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3.5 py-2.5 rounded-xl border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hidden sm:inline-block"
            >
              Save Draft
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity shadow-sm"
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={loading || isPostingDisabled}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs sm:text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                <span>Confirm & Publish</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. MODAL PREVIEWS & CONFIRMATIONS */}
      {previewModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="fixed inset-0" onClick={() => setPreviewModalOpen(false)} />
          <div className="relative w-full max-w-4xl z-10 animate-in zoom-in-95">
            <JobPreviewCard
              job={previewJobObject}
              onClose={() => setPreviewModalOpen(false)}
            />
          </div>
        </div>
      )}

      {showConfirm && (
        <JobConfirmModal
          job={job}
          employerProfileName={employerProfileName}
          summary={jobSummary}
          responsibilities={keyResponsibilities}
          onClose={() => setShowConfirm(false)}
          onConfirm={handlePublish}
          loading={loading}
        />
      )}
    </EmployerLayout>
  );
}
