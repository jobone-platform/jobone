import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import JobPreviewCard from "../components/JobPreviewCard.jsx";
import LocationPicker from "../components/LocationPicker.jsx";
import JobConfirmModal from "../components/JobConfirmModal.jsx";
import ElasticTitleDropdown from "../components/ElasticTitleDropdown.jsx";
import CourseSuggestionsDropdown from "../components/CourseSuggestionsDropdown.jsx";
import LanguageSuggestionsDropdown from "../components/LanguageSuggestionsDropdown.jsx";
import SkillSuggestionsDropdown from "../components/SkillSuggestionsDropdown.jsx";

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

import {
  MapPin,
  Loader2,
  Users,
  Monitor,
  Building,
  FileText,
  Plus,
  X,
  Globe,
  Zap,
  Calendar,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

const getDefaultDeadline = () => {
  const date = new Date();
  date.setDate(date.getDate() + 15);
  return date.toISOString().split("T")[0];
};

const getMinDeadline = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
};

const getMaxDeadline = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split("T")[0];
};

export default function CreateJob() {
  const navigate = useNavigate();
  const locationState = useLocation().state;

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
    requestedDocuments: [],
    startDate: "",
    endDate: "",
    applicationDeadline: getDefaultDeadline(),
    isLongTerm: false,
    shifts: [{ shiftName: "Shift 1", startTime: "", endTime: "" }],
    isFlexibleDuration: false,
    noOfPeopleRequired: "",
    genderPreference: "No Preference",
    qualifications: [],
    courses: [],
    ageLimit: { min: "15", max: "60", isAny: false },
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
  const [customPerkInput, setCustomPerkInput] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [step, setStep] = useState(1);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [pageAccess, setPageAccess] = useState("checking");
  const [blockMessage, setBlockMessage] = useState("");
  const [missingItems, setMissingItems] = useState([]);
  const currencyRef = useRef(null);
  const [isPostingDisabled, setIsPostingDisabled] = useState(false);
  const [employerProfileName, setEmployerProfileName] = useState("Confidential Employer");

  const flagUrl = (iso) => `https://flagcdn.com/20x15/${iso}.png`;

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

  useEffect(() => {
    const handler = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target))
        setCurrencyOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let interval;

    const checkEligibility = async () => {
      try {
        const storedData = localStorage.getItem("employerInfo");
        if (!storedData) return navigate("/login");

        const { token } = JSON.parse(storedData);

        const res = await axios.get(
          "https://jobone-mrpy.onrender.com/employer/check-eligibility",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!isMounted) return;

        const { data } = res;

        if (data.isFrozen) {
          setIsPostingDisabled(true);
          setBlockMessage("Your account is frozen. Posting new jobs is disabled.");
          setPageAccess("granted"); // Allow page load
          return;
        }

        if (data.access === "blocked") {
          setBlockMessage(data.message);
          setPageAccess("blocked"); // Kick out
          return;
        }

        if (data.access === "incomplete") {
          setIsPostingDisabled(true);
          setMissingItems(data.missingItems);
          setBlockMessage(data.message);
          setPageAccess("granted"); // Allow them to see form but can't post
          return;
        }

        // Capture employer names for live preview
        if (data.companyName || data.name) {
          setEmployerProfileName(data.companyName || data.name);
        }

        setIsPostingDisabled(false);
        setPageAccess("granted");
      } catch (err) {
        console.error("Eligibility check failed:", err);
        if (interval) clearInterval(interval);
        if (!isMounted) return;
        
        // --- THIS FIX STOPS THE LOADING LOOP ---
        if (err.response?.status === 401) {
          localStorage.removeItem("employerInfo");
          navigate("/login");
        } else {
          // If server error, show a message instead of spinning forever
          setBlockMessage("Server error. Please try again later.");
          setPageAccess("blocked"); 
        }
      }
    };

    checkEligibility();
    interval = setInterval(checkEligibility, 300000); // 5 min heartbeat

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [navigate]);

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

      setJob({
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
        requestedDocuments: d.requestedDocuments || [],
        startDate: d.startDate
          ? new Date(d.startDate).toISOString().split("T")[0]
          : "",
        endDate: d.endDate
          ? new Date(d.endDate).toISOString().split("T")[0]
          : "",
        applicationDeadline: getDefaultDeadline(),
        isFlexibleDuration: d.isFlexibleDuration || false,
        shifts:
          d.shifts?.length > 0
            ? d.shifts
            : [{ shiftName: "Shift 1", startTime: "", endTime: "" }],
        isFlexibleShifts: d.isFlexibleShifts || false,
        noOfPeopleRequired: d.noOfPeopleRequired || "",
        genderPreference: d.genderPreference || "No Preference",
        qualifications: d.qualifications || [],
        courses: d.courses || [],
        ageLimit: d.ageLimit || { min: "15", max: "60", isAny: false },
        languages: d.languages?.length ? d.languages : ["English"],
        experience: d.experience || {
          relevantExperience: { min: "", max: "", isAny: true },
          totalExperience: { min: "", max: "", isAny: true },
        },
        useOfficeLocation: false,
        location: d.location?.address || "",
        latitude: d.location?.coordinates?.[1] || null,
        longitude: d.location?.coordinates?.[0] || null,
      });
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

  const handleAgeChange = (field, value) => {
    setJob((prev) => ({
      ...prev,
      ageLimit: { ...prev.ageLimit, [field]: value },
    }));
  };
  const handleExperienceChange = (type, field, value) => {
    setJob((prev) => ({
      ...prev,
      experience: {
        ...prev.experience,
        [type]: {
          ...prev.experience[type],
          [field]: value,
          isAny: false,
        },
      },
    }));
  };

  const toggleExperienceAny = (type, checked) => {
    setJob((prev) => ({
      ...prev,
      experience: {
        ...prev.experience,
        [type]: { min: "", max: "", isAny: checked },
      },
    }));
  };

  const toggleArrayItem = (field, value) => {
    setJob((prev) => {
      const arr = prev[field];
      const newArr = arr.includes(value)
        ? arr.filter((i) => i !== value)
        : [...arr, value];
      if (touched[field]) validateField(field, newArr);
      return { ...prev, [field]: newArr };
    });
  };

  const handleAddQuestion = () => {
    if (
      newQuestion.trim() &&
      !job.screeningQuestions.includes(newQuestion.trim())
    ) {
      setJob((prev) => ({
        ...prev,
        screeningQuestions: [...prev.screeningQuestions, newQuestion.trim()],
      }));
      setNewQuestion("");
    }
  };

  const handleRemoveQuestion = (index) => {
    setJob((prev) => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.filter((_, i) => i !== index),
    }));
  };

  const updateShift = (index, field, value) => {
    setJob((prev) => {
      const updatedShifts = [...prev.shifts];
      updatedShifts[index][field] = value;
      return { ...prev, shifts: updatedShifts };
    });
  };

  const addShift = () =>
    setJob((prev) => ({
      ...prev,
      shifts: [
        ...prev.shifts,
        {
          shiftName: `Shift ${prev.shifts.length + 1}`,
          startTime: "",
          endTime: "",
        },
      ],
    }));

  const removeShift = (index) =>
    setJob((prev) => ({
      ...prev,
      shifts: prev.shifts
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, shiftName: `Shift ${i + 1}` })),
    }));

  const blockManualInput = (e) => {
    e.preventDefault();
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errorMsg = "";
    if (name === "title" && !value) errorMsg = "Job Title is required";
    if (name === "jobType" && value.length === 0)
      errorMsg = "Select at least one job type";
    if (name === "mode" && value.length === 0)
      errorMsg = "Select at least one work mode";
    if (name === "salaryMin" && !isUnpaid && !value)
      errorMsg = "Minimum salary is required";
    if (name === "noOfPeopleRequired" && !value) errorMsg = "Openings required";
    if (
      name === "workDaysPattern" &&
      value === "Custom" &&
      !job.customWorkDaysDescription
    )
      errorMsg = "Please describe the custom work days";

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const handleLocationSelect = useCallback((locData) => {
    setJob((prev) => ({
      ...prev,
      location: locData.address,
      latitude: locData.latitude,
      longitude: locData.longitude,
    }));
    setErrors((prev) => ({ ...prev, location: "" }));
  }, []);

  const typeWriterEffect = async (text, setterState, speed = 10) => {
    setterState("");
    for (let i = 0; i < text.length; i++) {
      setterState((prev) => prev + text.charAt(i));
      await new Promise((resolve) => setTimeout(resolve, speed));
    }
  };

  const handleAIGenerate = async () => {
    if (!job.title?.trim())
      return alert("You must enter a Job Title in Step 1 first!");
    setGeneratingAI(true);
    setJobSummary("");
    setKeyResponsibilities("");

    try {
      const storedData = localStorage.getItem("employerInfo");
      const token = storedData ? JSON.parse(storedData).token : null;
      if (!token) throw new Error("No token found");

      const { data } = await axios.post(
        "https://jobone-if7l.onrender.com/ai/generate-job-details",
        {
          title: job.title,
          jobType: job.jobType.join(", "),
          mode: job.mode.join(", "),
          experience: job.experience,
          skills: job.skillsRequired.join(", "),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // FACT: Format for a standard textarea (Plain text with bullet points and line breaks)
      const lines = data.responsibilities
        .split("\n")
        .map((line) => line.replace(/^[-*•]\s*/, "").trim())
        .filter((line) => line.length > 5);

      const plainTextList = lines.map((line) => `• ${line}`).join("\n");
      setKeyResponsibilities(plainTextList);

      // FACT: Merge AI questions with employer's manual questions without duplicates
      if (data.screeningQuestions && Array.isArray(data.screeningQuestions)) {
        setJob((prev) => {
          const existing = prev.screeningQuestions || [];
          const combined = [...existing, ...data.screeningQuestions];
          // Use Set to remove identical duplicate questions
          return { ...prev, screeningQuestions: [...new Set(combined)] };
        });
      }

      // Check if typeWriterEffect exists (CreateJob has it, EditJob might not)
      if (typeof typeWriterEffect === "function") {
        await typeWriterEffect(data.summary, setJobSummary, 10);
      } else {
        setJobSummary(data.summary);
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      alert("Failed to generate AI content.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const validateStep1 = () => {
    let isValid = true;
    const newErrors = {};
    const newTouched = {
      title: true,
      jobType: true,
      mode: true,
      salaryMin: true,
      noOfPeopleRequired: true,
    };

    if (!job.title) {
      newErrors.title = "Required";
      isValid = false;
    }
    if (job.jobType.length === 0) {
      newErrors.jobType = "Select type";
      isValid = false;
    }
    if (job.mode.length === 0) {
      newErrors.mode = "Select mode";
      isValid = false;
    }
    if (!isUnpaid && !job.salaryMin) {
      newErrors.salaryMin = "Required";
      isValid = false;
    }
    if (!job.noOfPeopleRequired) {
      newErrors.noOfPeopleRequired = "Required";
      isValid = false;
    }
    if (job.workDaysPattern === "Custom" && !job.customWorkDaysDescription) {
      newErrors.workDaysPattern = "Required";
      isValid = false;
    }

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" }); // FACT: Forces page to top
    } else {
      alert("Please fill in all required fields highlighted in red.");
    }
  };

  const handleSubmit = async () => {
    if (!job.isFlexibleShifts) {
      for (const shift of job.shifts) {
        if (!shift.startTime || !shift.endTime) {
          alert(
            `Please complete Start and End times for ${shift.shiftName} under the Timings section.`,
          );
          return;
        }
      }
    }

    const needsLocation =
      job.mode.includes("Work from office") ||
      job.mode.includes("Work from field");
    if (needsLocation && !job.useOfficeLocation && !job.location) {
      alert(
        "Please drop a pin on the map or select 'Same as Office Location'.",
      );
      return;
    }

    if (!jobSummary.trim() || !keyResponsibilities.trim())
      return alert("Job Summary and Key Responsibilities are required.");

    try {
      setLoading(true);
      const storedData = localStorage.getItem("employerInfo");
      const token = storedData ? JSON.parse(storedData).token : null;
      if (!token) return alert("No token found. Please log in again.");

      const parsedMin = isUnpaid
        ? 0
        : job.salaryMin === ""
          ? 0
          : Number(job.salaryMin);
      const parsedMax = isUnpaid
        ? 0
        : job.salaryMax === ""
          ? 0
          : Number(job.salaryMax);

      if (!isUnpaid && (parsedMin === 0 || parsedMax === 0)) {
        alert("Please enter a valid minimum and maximum salary.");
        setLoading(false);
        return;
      }

      const payload = {
        ...job,
        jobSummary: jobSummary,
        keyResponsibilities: keyResponsibilities,
        salaryMin: parsedMin,
        salaryMax: parsedMax,
        noOfPeopleRequired: Number(job.noOfPeopleRequired),
      };

      if (!payload.applicationDeadline) {
        delete payload.applicationDeadline;
      }

      if (payload.isFlexibleShifts) {
        payload.shifts = [];
      }

      if (!job.useOfficeLocation && needsLocation) {
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

      await axios.post("https://jobone-mrpy.onrender.com/jobs", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Job posted successfully!");
      navigate("/employerdashboard");
    } catch (error) {
      console.error("Error posting job:", error);
      alert(
        `Failed to post job: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName, hasIcon = false) => {
    const base = `w-full p-3 ${hasIcon ? "pl-10" : ""} border rounded-xl outline-none transition-all duration-200`;
    return `${base} ${touched[fieldName] && errors[fieldName] ? "border-red-500 focus:ring-red-200 bg-red-50" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100 bg-gray-50 focus:bg-white"}`;
  };

  // --- SECURITY BARRIERS ---
  if (pageAccess === "checking") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 flex-col gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-500 font-bold animate-pulse">
          Verifying account eligibility...
        </p>
      </div>
    );
  }

  if (pageAccess === "blocked") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-rose-600" size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
            Access Denied
          </h2>
          <p className="text-slate-600 font-medium mb-8 leading-relaxed">
            {blockMessage}
          </p>
          <button
            onClick={() => navigate("/employerdashboard")}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (pageAccess === "incomplete") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <FileText className="text-amber-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Profile Incomplete
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Missing required data
              </p>
            </div>
          </div>
          <p className="text-slate-600 font-medium mb-6 leading-relaxed">
            {blockMessage}
          </p>
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-8 max-h-48 overflow-y-auto">
            <ul className="space-y-2">
              {missingItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm font-bold text-rose-600"
                >
                  <X size={16} />{" "}
                  {item
                    .replace(/([A-Z])/g, " $1")
                    .trim()
                    .toUpperCase()}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/employereditprofile")}
              className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg text-center"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate("/employerdocupload")}
              className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 py-3.5 rounded-xl font-bold hover:bg-blue-100 transition text-center"
            >
              Upload Docs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-24 pb-10 sm:py-20 md:flex-row gap-4 sm:gap-10 p-4 sm:p-8 bg-gray-50 min-h-screen">
      {isPostingDisabled && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl mb-6 font-bold flex items-center gap-3">
          <AlertTriangle size={20} />
          {blockMessage}
        </div>
      )}
      <div className="w-full md:w-1/2 bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-gray-100 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            {locationState?.repostData ? "Repost a Job" : "Create a Job"}
          </h1>
          <span className="text-xs sm:text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
            Step {step} of 2
          </span>
        </div>

        {/* --- STEP 1: CORE DETAILS --- */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Job Title <span className="text-red-500">*</span>
              </label>
              <ElasticTitleDropdown
                value={job.title}
                onChange={(val) => {
                  setJob((prev) => ({ ...prev, title: val }));
                  if (touched.title) validateField("title", val);
                }}
                hasError={touched.title && errors.title}
              />
              {touched.title && errors.title && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.title}
                </p>
              )}
            </div>

            {/* THIRD-PARTY RECRUITING */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={job.isThirdPartyRecruiting}
                  onChange={(e) => {
                    setJob((prev) => ({
                      ...prev,
                      isThirdPartyRecruiting: e.target.checked,
                      hiringCompanyName: e.target.checked ? prev.hiringCompanyName : "",
                      showHiringCompanyName: e.target.checked ? prev.showHiringCompanyName : false,
                    }));
                  }}
                  className="w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-gray-800">
                  I am recruiting on behalf of another company (Agency/Third-Party)
                </span>
              </label>

              {job.isThirdPartyRecruiting && (
                <div className="mt-4 pl-8 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Client Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={job.hiringCompanyName}
                      onChange={(e) => setJob({ ...job, hiringCompanyName: e.target.value })}
                      placeholder="e.g. Google, Microsoft, Confidential Client"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={job.showHiringCompanyName}
                      onChange={(e) => setJob({ ...job, showHiringCompanyName: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 font-medium">
                      Show the client's company name publicly on the Job Card
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Skills Required
              </label>
              <SkillSuggestionsDropdown
                skills={job.skillsRequired}
                jobTitle={job.title}
                onAdd={(skill) =>
                  setJob((prev) => ({
                    ...prev,
                    skillsRequired: [...prev.skillsRequired, skill],
                  }))
                }
                onRemove={(idx) =>
                  setJob((prev) => ({
                    ...prev,
                    skillsRequired: prev.skillsRequired.filter(
                      (_, i) => i !== idx,
                    ),
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Industry / Sector <span className="text-red-500">*</span>
                </label>
                <select
                  name="industry"
                  value={job.industry}
                  onChange={(e) => {
                    setJob((prev) => ({
                      ...prev,
                      industry: e.target.value,
                      subdomain: "",
                    })); // Reset subdomain when industry changes
                    if (touched.industry)
                      validateField("industry", e.target.value);
                  }}
                  className={getInputClass("industry")}
                >
                  <option value="">Select Industry</option>
                  {Object.keys(INDUSTRY_SUBDOMAINS).map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
                {touched.industry && errors.industry && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.industry}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Subdomain Speciality <span className="text-red-500">*</span>
                </label>
                <select
                  name="subdomain"
                  value={job.subdomain}
                  onChange={handleChange}
                  disabled={!job.industry}
                  className={getInputClass("subdomain")}
                >
                  <option value="">Select Subdomain</option>
                  {job.industry &&
                    INDUSTRY_SUBDOMAINS[job.industry].map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                </select>
                {touched.subdomain && errors.subdomain && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.subdomain}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Work Mode <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { val: "Work from home", icon: <Monitor size={16} /> },
                  { val: "Work from office", icon: <Building size={16} /> },
                  { val: "Work from field", icon: <Globe size={16} /> },
                ].map((m) => {
                  const isSelected = job.mode.includes(m.val);
                  return (
                    <label
                      key={m.val}
                      className={`flex-1 min-w-[120px] cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${isSelected ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        onChange={() => toggleArrayItem("mode", m.val)}
                      />
                      {m.icon}{" "}
                      <span className="text-xs text-center font-bold">
                        {m.val}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Type <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "permanent",
                  "temporary",
                  "internship",
                  "part-time",
                  "full-time",
                  "contractual",
                  "freelance",
                  "volunteer opportunity",
                ].map((type) => {
                  const isSelected = job.jobType.includes(type);
                  return (
                    <label
                      key={type}
                      className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg border transition-all capitalize ${isSelected ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:bg-indigo-50"}`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        onChange={() => toggleArrayItem("jobType", type)}
                      />
                      {type}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Work Days <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {["Mon to Fri", "Mon to Sat", "Sat to Sun", "Custom"].map(
                  (pattern) => (
                    <label
                      key={pattern}
                      className={`cursor-pointer py-2 px-1 text-center text-[11px] font-extrabold uppercase tracking-wide rounded-lg border transition-all ${job.workDaysPattern === pattern ? "bg-slate-800 text-white border-slate-800 shadow-md" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"}`}
                    >
                      <input
                        type="radio"
                        name="workDaysPattern"
                        value={pattern}
                        checked={job.workDaysPattern === pattern}
                        onChange={handleChange}
                        className="hidden"
                      />
                      {pattern}
                    </label>
                  ),
                )}
              </div>
              {job.workDaysPattern === "Custom" && (
                <input
                  type="text"
                  name="customWorkDaysDescription"
                  value={job.customWorkDaysDescription}
                  onChange={handleChange}
                  placeholder="e.g. 3 days a week, flexible days..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />
              )}
            </div>

            <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-green-900">
                  Compensation Range <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="unpaid-check"
                    checked={isUnpaid}
                    onChange={(e) => {
                      setIsUnpaid(e.target.checked);
                      if (e.target.checked)
                        setJob((prev) => ({
                          ...prev,
                          salaryMin: "",
                          salaryMax: "",
                        }));
                    }}
                    className="accent-green-600 cursor-pointer"
                  />
                  <label
                    htmlFor="unpaid-check"
                    className="text-xs font-bold text-green-700 cursor-pointer"
                  >
                    Unpaid / Volunteer
                  </label>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                <div className="relative" ref={currencyRef}>
                  <button
                    type="button"
                    onClick={() => setCurrencyOpen((o) => !o)}
                    className="flex items-center gap-1.5 h-11 px-3 border border-green-200 rounded-xl bg-white text-sm font-bold text-gray-700 hover:bg-green-50 min-w-[88px]"
                  >
                    <img
                      src={flagUrl(
                        CURRENCIES.find((c) => c.code === job.salaryCurrency)
                          ?.iso,
                      )}
                      width={20}
                      height={15}
                      style={{ borderRadius: 2, objectFit: "cover" }}
                      alt={job.salaryCurrency}
                    />
                    <span>{job.salaryCurrency}</span>
                  </button>
                  {currencyOpen && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-56 max-h-64 overflow-y-auto">
                      <input
                        autoFocus
                        type="text"
                        value={currencySearch}
                        onChange={(e) => setCurrencySearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full px-3 py-2 text-xs border-b border-gray-100 outline-none"
                      />
                      {TOP_CURRENCIES.filter(
                        (c) =>
                          c.code
                            .toLowerCase()
                            .includes(currencySearch.toLowerCase()) ||
                          c.name
                            .toLowerCase()
                            .includes(currencySearch.toLowerCase()),
                      ).map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setJob((p) => ({ ...p, salaryCurrency: c.code }));
                            setCurrencyOpen(false);
                            setCurrencySearch("");
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-gray-50 text-left"
                        >
                          <img
                            src={flagUrl(c.iso)}
                            width={20}
                            height={15}
                            style={{
                              borderRadius: 2,
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                            alt={c.code}
                          />
                          <span className="font-bold w-8">{c.code}</span>
                          <span className="text-gray-400">{c.name}</span>
                        </button>
                      ))}
                      <div className="border-t border-gray-100 my-1" />
                      {REST_CURRENCIES.filter(
                        (c) =>
                          c.code
                            .toLowerCase()
                            .includes(currencySearch.toLowerCase()) ||
                          c.name
                            .toLowerCase()
                            .includes(currencySearch.toLowerCase()),
                      ).map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setJob((p) => ({ ...p, salaryCurrency: c.code }));
                            setCurrencyOpen(false);
                            setCurrencySearch("");
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-gray-50 text-left"
                        >
                          <img
                            src={flagUrl(c.iso)}
                            width={20}
                            height={15}
                            style={{
                              borderRadius: 2,
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                            alt={c.code}
                          />
                          <span className="font-bold w-8">{c.code}</span>
                          <span className="text-gray-400">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex items-center gap-2 sm:gap-3 w-full">
                  <input
                    type="number"
                    placeholder="Min Salary"
                    disabled={isUnpaid}
                    value={job.salaryMin ?? ""}
                    onChange={(e) =>
                      setJob((prev) => ({ ...prev, salaryMin: e.target.value }))
                    }
                    className="w-full p-3 border border-green-200 rounded-xl outline-none focus:ring-2 focus:ring-green-300 disabled:bg-green-100/50 font-bold"
                  />
                  <span className="text-green-600 font-bold">-</span>
                  <input
                    type="number"
                    placeholder="Max Salary"
                    disabled={isUnpaid}
                    value={job.salaryMax ?? ""}
                    onChange={(e) =>
                      setJob((prev) => ({ ...prev, salaryMax: e.target.value }))
                    }
                    className="w-full p-3 border border-green-200 rounded-xl outline-none focus:ring-2 focus:ring-green-300 disabled:bg-green-100/50 font-bold"
                  />
                </div>

                <select
                  value={job.salaryFrequency}
                  onChange={(e) =>
                    setJob((prev) => ({
                      ...prev,
                      salaryFrequency: e.target.value,
                    }))
                  }
                  className="p-2.5 border border-green-200 rounded-xl outline-none bg-white text-sm font-bold text-green-800"
                >
                  <option value="Month">/ Month</option>
                  <option value="Year">/ Year</option>
                  <option value="Hour">/ Hour</option>
                  <option value="Lump-Sum">Lump-Sum</option>
                </select>
              </div>

              {/* Perks */}
              <div>
                <label className="block text-xs font-semibold text-green-800 mb-2">
                  Perks & Benefits (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PERKS_OPTIONS.map((perk) => {
                    const isSelected = job.incentives.includes(perk.value);
                    return (
                      <button
                        key={perk.value}
                        type="button"
                        onClick={() =>
                          setJob((prev) => ({
                            ...prev,
                            incentives: isSelected
                              ? prev.incentives.filter((i) => i !== perk.value)
                              : [...prev.incentives, perk.value],
                          }))
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${isSelected ? "bg-green-600 text-white border-green-600 shadow-sm" : "bg-white text-green-700 border-green-200 hover:bg-green-50"}`}
                      >
                        <span>{perk.icon}</span> {perk.value}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Add custom perk..."
                    value={customPerkInput}
                    onChange={(e) => setCustomPerkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = customPerkInput.trim();
                        if (val && !job.incentives.includes(val)) {
                          setJob((prev) => ({
                            ...prev,
                            incentives: [...prev.incentives, val],
                          }));
                        }
                        setCustomPerkInput("");
                      }
                    }}
                    className="flex-1 p-2 text-xs border border-green-200 rounded-xl outline-none focus:ring-2 focus:ring-green-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = customPerkInput.trim();
                      if (val && !job.incentives.includes(val)) {
                        setJob((prev) => ({
                          ...prev,
                          incentives: [...prev.incentives, val],
                        }));
                      }
                      setCustomPerkInput("");
                    }}
                    className="px-3 py-1.5 bg-green-100 text-green-800 text-xs font-bold rounded-xl hover:bg-green-200"
                  >
                    Add
                  </button>
                </div>
                {job.incentives.filter(
                  (i) => !PERKS_OPTIONS.map((p) => p.value).includes(i),
                ).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.incentives
                      .filter(
                        (i) => !PERKS_OPTIONS.map((p) => p.value).includes(i),
                      )
                      .map((custom, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full text-xs font-semibold"
                        >
                          {custom}{" "}
                          <button
                            type="button"
                            onClick={() =>
                              setJob((prev) => ({
                                ...prev,
                                incentives: prev.incentives.filter(
                                  (i) => i !== custom,
                                ),
                              }))
                            }
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 bg-purple-50 border border-purple-100 rounded-2xl space-y-4">
              <label className="block text-sm font-bold text-purple-900 flex items-center gap-2">
                <HelpCircle size={18} /> Candidate Screening Questions
              </label>
              <p className="text-xs text-purple-700">
                Add questions candidates must answer when applying (e.g., Notice
                period? Willing to relocate?).
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddQuestion();
                    }
                  }}
                  placeholder="Type a question..."
                  className="flex-1 p-2.5 border border-purple-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 shadow-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  "What is your notice period?",
                  "What are your salary expectations?",
                  "Are you willing to relocate for this role?",
                  "Do you require visa sponsorship?",
                  "How many years of relevant experience do you have?",
                  "Are you comfortable working in the specified shifts?"
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      if (!job.screeningQuestions.includes(q)) {
                         setJob(prev => ({ ...prev, screeningQuestions: [...prev.screeningQuestions, q] }));
                      }
                    }}
                    className="text-[11px] font-bold bg-white border border-purple-200 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
                  >
                    + Add: {q}
                  </button>
                ))}
              </div>
              {job.screeningQuestions.length > 0 && (
                <ul className="space-y-2 mt-4">
                  {job.screeningQuestions.map((q, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center bg-white p-3 border border-purple-100 rounded-lg text-sm text-purple-900"
                    >
                      <span className="font-medium">
                        {idx + 1}. {q}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                No. of Openings <span className="text-red-500">*</span>
              </label>
              <div className="relative w-1/2">
                <Users
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  type="number"
                  name="noOfPeopleRequired"
                  value={job.noOfPeopleRequired}
                  min={1}
                  max={9999}
                  onChange={handleChange}
                  className={getInputClass("noOfPeopleRequired", true)}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: DEMOGRAPHICS, DATES, AI, LOCATION --- */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-5">
              <h3 className="font-bold text-indigo-900 border-b border-indigo-200 pb-2">
                Candidate Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-indigo-800 mb-1.5 uppercase">
                    Qualifications
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[
                      "10th Pass",
                      "12th Pass",
                      "Diploma",
                      "Graduation",
                      "Post-Graduation",
                      "Any",
                    ].map((q) => (
                      <label
                        key={q}
                        className={`cursor-pointer px-2 py-1 text-[10px] font-bold rounded border transition-all ${job.qualifications.includes(q) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-100"}`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          onChange={() => toggleArrayItem("qualifications", q)}
                        />{" "}
                        {q}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-800 mb-1.5 uppercase">
                    Courses / Streams
                  </label>
                  <CourseSuggestionsDropdown
                    courses={job.courses}
                    onAdd={(course) =>
                      setJob((prev) => ({
                        ...prev,
                        courses: [...prev.courses, course],
                      }))
                    }
                    onRemove={(idx) =>
                      setJob((prev) => ({
                        ...prev,
                        courses: prev.courses.filter((_, i) => i !== idx),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-800 mb-1.5 uppercase">
                    Age Limit
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        Min
                      </label>
                      <input
                        type="number"
                        min={15}
                        max={59}
                        value={job.ageLimit?.min || ""}
                        onChange={(e) => handleAgeChange("min", e.target.value)}
                        onBlur={(e) => {
                          const val = Math.max(
                            15,
                            Math.min(59, Number(e.target.value)),
                          );
                          handleAgeChange("min", val);
                        }}
                        className="w-16 p-1.5 border border-indigo-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-200 text-center"
                      />
                    </div>
                    <span className="text-xs text-indigo-400 mt-4">—</span>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">
                        Max
                      </label>
                      <input
                        type="number"
                        min={16}
                        max={60}
                        value={job.ageLimit.max}
                        onChange={(e) => handleAgeChange("max", e.target.value)}
                        onBlur={(e) => {
                          const val = Math.max(
                            16,
                            Math.min(60, Number(e.target.value)),
                          );
                          handleAgeChange("max", val);
                        }}
                        className="w-16 p-1.5 border border-indigo-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-200 text-center"
                      />
                    </div>
                    <p className="text-[10px] text-indigo-400 mt-4">yrs</p>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-indigo-800 mb-3 uppercase">
                    Experience Required
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white border border-indigo-100 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-indigo-700">
                        Relevant Field Experience
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-400 mb-0.5 block">
                            Min (yrs)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={
                              job.experience?.relevantExperience?.min || ""
                            }
                            onChange={(e) =>
                              handleExperienceChange(
                                "relevantExperience",
                                "min",
                                e.target.value,
                              )
                            }
                            disabled={job.experience.relevantExperience.isAny}
                            className="w-full p-2 border border-indigo-200 rounded-lg text-xs outline-none disabled:bg-gray-50 disabled:text-gray-300 focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-400 mb-0.5 block">
                            Max (yrs)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="10"
                            value={job.experience.relevantExperience.max}
                            onChange={(e) =>
                              handleExperienceChange(
                                "relevantExperience",
                                "max",
                                e.target.value,
                              )
                            }
                            disabled={job.experience.relevantExperience.isAny}
                            className="w-full p-2 border border-indigo-200 rounded-lg text-xs outline-none disabled:bg-gray-50 disabled:text-gray-300 focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={job.experience.relevantExperience.isAny}
                          onChange={(e) =>
                            toggleExperienceAny(
                              "relevantExperience",
                              e.target.checked,
                            )
                          }
                          className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Any / Freshers welcome
                      </label>
                    </div>

                    <div className="p-3 bg-white border border-indigo-100 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-indigo-700">
                        Total Work Experience
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-400 mb-0.5 block">
                            Min (yrs)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={job.experience.totalExperience.min}
                            onChange={(e) =>
                              handleExperienceChange(
                                "totalExperience",
                                "min",
                                e.target.value,
                              )
                            }
                            disabled={job.experience.totalExperience.isAny}
                            className="w-full p-2 border border-indigo-200 rounded-lg text-xs outline-none disabled:bg-gray-50 disabled:text-gray-300 focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-400 mb-0.5 block">
                            Max (yrs)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="10"
                            value={job.experience.totalExperience.max}
                            onChange={(e) =>
                              handleExperienceChange(
                                "totalExperience",
                                "max",
                                e.target.value,
                              )
                            }
                            disabled={job.experience.totalExperience.isAny}
                            className="w-full p-2 border border-indigo-200 rounded-lg text-xs outline-none disabled:bg-gray-50 disabled:text-gray-300 focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={job.experience.totalExperience.isAny}
                          onChange={(e) =>
                            toggleExperienceAny(
                              "totalExperience",
                              e.target.checked,
                            )
                          }
                          className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Any / Freshers welcome
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-800 mb-1.5 uppercase">
                    Preferred Gender
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "No Preference", label: "No Preference" },
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                      { value: "Other", label: "Other" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`cursor-pointer px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${job.genderPreference === option.value ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"}`}
                      >
                        <input
                          type="radio"
                          name="genderPreference"
                          value={option.value}
                          checked={job.genderPreference === option.value}
                          onChange={handleChange}
                          className="hidden"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-800 mb-1.5 uppercase">
                    Languages
                  </label>
                  <LanguageSuggestionsDropdown
                    languages={job.languages}
                    onAdd={(lang) =>
                      setJob((prev) => ({
                        ...prev,
                        languages: [...prev.languages, lang],
                      }))
                    }
                    onRemove={(idx) =>
                      setJob((prev) => ({
                        ...prev,
                        languages: prev.languages.filter((_, i) => i !== idx),
                      }))
                    }
                  />
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t border-indigo-200/60">
                  <label className="block text-xs font-bold text-indigo-900 mb-1.5 uppercase tracking-wide">
                    Requested Candidate Documents (Optional Checklist for Applicants)
                  </label>
                  <p className="text-xs text-indigo-700 mb-3">
                    Select any specific documents you require candidates to provide when applying to this job posting:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "10th Marksheet",
                      "12th Marksheet",
                      "UG Marksheet",
                      "PG Marksheet",
                      "Aadhar Card",
                      "PAN Card",
                      "Medical Certificate",
                      "3 Months Salary Slip (if Experienced)",
                      "Other Documents",
                    ].map((docName) => {
                      const isSelected = (job.requestedDocuments || []).includes(docName);
                      return (
                        <button
                          key={docName}
                          type="button"
                          onClick={() => {
                            setJob((prev) => {
                              const current = prev.requestedDocuments || [];
                              const updated = isSelected
                                ? current.filter((d) => d !== docName)
                                : [...current, docName];
                              return { ...prev, requestedDocuments: updated };
                            });
                          }}
                          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                          }`}
                        >
                          <span>{isSelected ? "✓" : "+"}</span> {docName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Duration & Dates Block */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Duration & Dates
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-blue-600 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFlexibleDuration"
                      checked={job.isFlexibleDuration}
                      onChange={handleChange}
                      className="rounded text-blue-600"
                    />{" "}
                    Flexible Dates
                  </label>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">
                        Start Date
                      </label>
                      {/* FACT: No longer disabled by Flexible */}
                      <input
                        type="date"
                        name="startDate"
                        value={job.startDate}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-200 rounded text-xs outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={job.isLongTerm ? "" : job.endDate}
                        onChange={handleChange}
                        disabled={job.isLongTerm}
                        className="w-full p-2 border border-gray-200 rounded text-xs outline-none disabled:bg-gray-100 bg-white"
                      />
                    </div>
                  </div>
                  {/* FACT: Restored Long Term Checkbox */}
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isLongTerm"
                      checked={job.isLongTerm}
                      onChange={handleChange}
                      className="rounded text-indigo-600"
                    />{" "}
                    Long Term Role (No fixed end date)
                  </label>

                  <div className="pt-2 border-t border-gray-200">
                    <label className="text-[10px] text-rose-500 font-bold uppercase mb-1 block flex items-center gap-1">
                      <Calendar size={12} /> Application Deadline (Optional)
                    </label>
                    <input
                      type="date"
                      name="applicationDeadline"
                      value={job.applicationDeadline}
                      onChange={handleChange}
                      className="w-full p-2 border border-rose-200 rounded text-xs outline-none focus:ring-2 focus:ring-rose-200 bg-rose-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Timings Block */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                    Expected Timings {!job.isFlexibleShifts && <span className="text-red-500">*</span>}
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-blue-600 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFlexibleShifts"
                      checked={job.isFlexibleShifts}
                      onChange={handleChange}
                      className="rounded text-blue-600"
                    />{" "}
                    Flexible Hours
                  </label>
                </div>

                {/* FACT: Removed the condition that hides this block. Shifts are always visible now. */}
                <div className="space-y-2">
                  {job.shifts.map((shift, index) => (
                    <div
                      key={index}
                      className="flex gap-1 items-center bg-white p-1 rounded border border-slate-200"
                    >
                      <input
                        type="time"
                        value={shift.startTime}
                        onChange={(e) =>
                          updateShift(index, "startTime", e.target.value)
                        }
                        className="flex-1 p-1.5 rounded text-xs outline-none"
                      />
                      <span className="text-gray-400 text-xs font-bold">
                        to
                      </span>
                      <input
                        type="time"
                        value={shift.endTime}
                        onChange={(e) =>
                          updateShift(index, "endTime", e.target.value)
                        }
                        className="flex-1 p-1.5 rounded text-xs outline-none"
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeShift(index)}
                          className="text-red-400 p-1"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addShift}
                    className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-1"
                  >
                    <Plus size={12} /> Add Shift
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <label className="block text-sm font-bold text-amber-900 flex items-center gap-1.5">
                <Zap size={16} className="text-amber-500" /> Job Highlights
              </label>
              <p className="text-xs text-amber-700">
                Add two key selling points about this role.
              </p>
              <input
                type="text"
                value={job.jobFeatures[0]}
                onChange={(e) =>
                  setJob((p) => {
                    const arr = [...p.jobFeatures];
                    arr[0] = e.target.value;
                    return { ...p, jobFeatures: arr };
                  })
                }
                placeholder="Feature 1 (e.g., Fast-paced startup environment)"
                className="w-full p-2.5 border border-amber-200 focus:border-amber-400 rounded-xl text-sm outline-none"
              />
              <input
                type="text"
                value={job.jobFeatures[1]}
                onChange={(e) =>
                  setJob((p) => {
                    const arr = [...p.jobFeatures];
                    arr[1] = e.target.value;
                    return { ...p, jobFeatures: arr };
                  })
                }
                placeholder="Feature 2 (e.g., Weekly team lunches)"
                className="w-full p-2.5 border border-amber-200 focus:border-amber-400 rounded-xl text-sm outline-none"
              />
            </div>

            <div className="border border-indigo-100 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between bg-indigo-50 p-4 border-b border-indigo-100">
                <div>
                  <h4 className="font-bold text-indigo-900 text-sm">
                    ✨ AI Auto-Writer
                  </h4>
                  <p className="text-xs text-indigo-700">
                    Auto-generate the summary and responsibilities.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={generatingAI}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {generatingAI ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    "Generate"
                  )}
                </button>
              </div>
              <div className="p-4 space-y-6 bg-white">
                <div>
                  <label className="inline-block text-sm font-extrabold text-blue-900 bg-blue-100 px-3 py-1.5 rounded-lg mb-2 shadow-sm border border-blue-200">
                    Job Summary <span className="text-red-500">*</span>
                  </label>
                  {/* FACT: Replaced WYSIWYG with a clean Textarea */}
                  <textarea
                    value={jobSummary}
                    onChange={(e) => setJobSummary(e.target.value)}
                    placeholder="Enter a professional summary for this role..."
                    className="w-full p-4 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium min-h-[150px] resize-y bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="inline-block text-sm font-extrabold text-purple-900 bg-purple-100 px-3 py-1.5 rounded-lg mb-2 shadow-sm border border-purple-200">
                    Key Responsibilities <span className="text-red-500">*</span>
                  </label>
                  {/* FACT: Replaced WYSIWYG with a clean Textarea */}
                  <textarea
                    value={keyResponsibilities}
                    onChange={(e) => setKeyResponsibilities(e.target.value)}
                    placeholder="• Enter key responsibilities here&#10;• Hit enter for a new line"
                    className="w-full p-4 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 font-medium min-h-[150px] resize-y bg-slate-50 focus:bg-white transition-colors leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {(job.mode.includes("Work from office") ||
              job.mode.includes("Work from field")) && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 justify-between text-base sm:text-lg">
                  <span className="flex items-center gap-2">
                    <MapPin className="text-blue-600" /> Job Location{" "}
                    <span className="text-red-500 text-sm">*</span>
                  </span>
                  <label className="flex items-center gap-2 text-sm font-bold text-indigo-600 cursor-pointer bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                    <input
                      type="checkbox"
                      name="useOfficeLocation"
                      checked={job.useOfficeLocation}
                      onChange={handleChange}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />{" "}
                    Same as Office Location
                  </label>
                </h3>
                {!job.useOfficeLocation && (
                  <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-800 mb-3 font-medium">
                      Search & Drop a pin on the map
                    </p>
                    <div className="rounded-lg overflow-hidden border border-blue-200 mb-3">
                      <LocationPicker onLocationSelect={handleLocationSelect} />
                    </div>
                    <input
                      name="location"
                      value={job.location}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Refine Address (e.g. 303-B, Sweethomes Apt...)"
                      className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-end mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  // FACT: This guarantees the separate fields are injected BEFORE the preview opens
                  setJob((prev) => ({
                    ...prev,
                    jobSummary: jobSummary,
                    keyResponsibilities: keyResponsibilities,
                    description: `<h3>Job Summary</h3>${jobSummary}<h3>Key Responsibilities</h3>${keyResponsibilities}`,
                  }));
                  setPreview(true);
                }}
                className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
              >
                Preview
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={loading || isPostingDisabled} // <--- THIS DISABLES THE BUTTON
                className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 
    ${isPostingDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"}`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : null}
                {isPostingDisabled ? "Posting Disabled" : "Post Job"}
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => {
              setStep(1);
              window.scrollTo({ top: 0, behavior: "smooth" }); // FACT: Scroll up on back too
            }}
            disabled={step === 1}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${step === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Back
          </button>
          {step === 1 && (
            <button
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all"
            >
              Next Step
            </button>
          )}
        </div>
      </div>

      <div className="hidden lg:block w-5/12 pl-8 sticky top-10 h-fit">
        {preview ? (
          <JobPreviewCard job={job} onClose={() => setPreview(false)} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <FileText size={32} className="text-gray-300" />
            </div>
            <p className="font-medium">Live Preview</p>
          </div>
        )}
      </div>

      {preview && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <JobPreviewCard job={job} onClose={() => setPreview(false)} />
          </div>
        </div>
      )}
      {showConfirm && (
        <JobConfirmModal
          job={job}
          employerProfileName={employerProfileName}
          summary={jobSummary}
          responsibilities={keyResponsibilities}
          loading={loading}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false);
            handleSubmit();
          }}
        />
      )}
    </div>
  );
}
