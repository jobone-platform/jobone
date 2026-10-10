import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import LocationPicker from "../components/LocationPicker.jsx";
import ElasticTitleDropdown from "../components/ElasticTitleDropdown.jsx";
import CourseSuggestionsDropdown from "../components/CourseSuggestionsDropdown.jsx";
import LanguageSuggestionsDropdown from "../components/LanguageSuggestionsDropdown.jsx";
import SkillSuggestionsDropdown from "../components/SkillSuggestionsDropdown.jsx";
import {
  Loader2,
  Save,
  ArrowLeft,
  Briefcase,
  MapPin,
  IndianRupee,
  Clock,
  CalendarDays,
  Users,
  AlignLeft,
  X,
  Target,
  Plus,
  Building,
  Globe,
  Monitor,
  Zap,
  GraduationCap,
  Languages,
  UserCircle2,
  Calendar,
  HelpCircle,
} from "lucide-react";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [job, setJob] = useState({
    title: "",
    status: "active",
    description: "",
    jobFeatures: ["", ""],
    skillsRequired: [],
    jobType: [],
    workDaysPattern: "Mon to Fri",
    customWorkDaysDescription: "",
    mode: [],
    salaryMin: "",
    salaryMax: "",
    salaryFrequency: "Monthly",
    salaryCurrency: "INR",
    incentives: [],
    screeningQuestions: [],
    requestedDocuments: [],
    startDate: "",
    endDate: "",
    applicationDeadline: "",
    isLongTerm: false,
    shifts: [{ shiftName: "Shift 1", startTime: "", endTime: "" }],
    isFlexibleShifts: false,
    isFlexibleDuration: false,
    noOfPeopleRequired: "",
    genderPreference: "No Preference",
    qualifications: [],
    courses: [],
    ageLimit: { min: "", max: "", isAny: true },
    languages: [],
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
  const [originalLocation, setOriginalLocation] = useState(null);

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const currencyRef = useRef(null);

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
    const fetchJobData = async () => {
      try {
        const stored = localStorage.getItem("employerInfo");
        if (!stored) return navigate("/login");
        const token = JSON.parse(stored).token;

        const { data } = await axios.get(
          `https://jobone-mrpy.onrender.com/jobs/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const d = data.job || data;
        setOriginalLocation(d.location);

        const formatDate = (dateStr) => {
          if (!dateStr) return "";
          return new Date(dateStr).toISOString().split("T")[0];
        };

        const rawDesc = d.description || "";
        const parts = rawDesc.split("<h3>Key Responsibilities</h3>");
        setJobSummary(
          d.jobSummary ||
            (parts[0]
              ? parts[0].replace("<h3>Job Summary</h3>", "").trim()
              : rawDesc),
        );
        setKeyResponsibilities(
          d.keyResponsibilities || (parts[1] ? parts[1].trim() : ""),
        );

        const isCurrentlyUnpaid =
          (d.salaryMin === 0 && d.salaryMax === 0) || d.salaryAmount === 0;
        setIsUnpaid(isCurrentlyUnpaid);

        setJob({
          title: d.title || "",
          status: d.status || "active",
          jobFeatures:
            d.jobFeatures?.length === 2
              ? d.jobFeatures
              : [d.jobFeatures?.[0] || "", d.jobFeatures?.[1] || ""],
          skillsRequired: d.skillsRequired || [],
          jobType: d.jobType?.length ? d.jobType : ["full-time"],
          workDaysPattern: d.workDaysPattern || "Mon to Fri",
          customWorkDaysDescription: d.customWorkDaysDescription || "",
          mode: d.mode?.length ? d.mode : ["Work from office"],
          salaryMin: isCurrentlyUnpaid
            ? ""
            : d.salaryMin ?? d.salaryAmount ?? "",
          salaryMax: isCurrentlyUnpaid
            ? ""
            : d.salaryMax ?? d.salaryAmount ?? "",
          salaryFrequency: d.salaryFrequency || "Month",
          salaryCurrency: d.salaryCurrency || "INR",
          incentives: Array.isArray(d.incentives) ? d.incentives : [],
          screeningQuestions: d.screeningQuestions || [],
          requestedDocuments: d.requestedDocuments || [],
          startDate: formatDate(d.startDate),
          endDate: formatDate(d.endDate),
          applicationDeadline: formatDate(d.applicationDeadline),
          isLongTerm: d.isLongTerm || false,
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
          ageLimit: d.ageLimit || { min: "", max: "", isAny: true },
          languages: d.languages?.length ? d.languages : [],
          experience: d.experience || {
            relevantExperience: { min: "", max: "", isAny: true },
            totalExperience: { min: "", max: "", isAny: true },
          },
          useOfficeLocation: false,
          location:
            typeof d.location === "object"
              ? d.location?.address
              : d.location || "",
          latitude:
            typeof d.location === "object"
              ? d.location?.coordinates?.[1]
              : null,
          longitude:
            typeof d.location === "object"
              ? d.location?.coordinates?.[0]
              : null,
          isThirdPartyRecruiting: d.isThirdPartyRecruiting || false,
          hiringCompanyName: d.hiringCompanyName || "",
          showHiringCompanyName: d.showHiringCompanyName || false,
        });
      } catch (err) {
        console.error("Error fetching job:", err);
        alert("Could not load job details.");
        navigate("/employerdashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchJobData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJob((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAgeChange = (field, value) => {
    setJob((prev) => ({
      ...prev,
      ageLimit: { ...prev.ageLimit, [field]: value, isAny: false },
    }));
  };

  const handleExperienceChange = (type, field, value) => {
    setJob((prev) => ({
      ...prev,
      experience: {
        ...prev.experience,
        [type]: { ...prev.experience[type], [field]: value, isAny: false },
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
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((i) => i !== value)
          : [...arr, value],
      };
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
  const handleLocationSelect = useCallback(
    (locData) =>
      setJob((prev) => ({
        ...prev,
        location: locData.address,
        latitude: locData.latitude,
        longitude: locData.longitude,
      })),
    [],
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!job.title || job.mode.length === 0 || job.jobType.length === 0) {
      return alert("Title, Mode, and Job Type are required.");
    }
    setSaving(true);
    try {
      const stored = localStorage.getItem("employerInfo");
      const token = JSON.parse(stored).token;

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
        setSaving(false);
        return;
      }

      const payload = {
        ...job,
        jobSummary: jobSummary,
        keyResponsibilities: keyResponsibilities,
        description: `<h3>Job Summary</h3>${jobSummary}<h3>Key Responsibilities</h3>${keyResponsibilities}`,
        salaryMin: parsedMin,
        salaryMax: parsedMax,
        noOfPeopleRequired: Number(job.noOfPeopleRequired),
      };

      if (job.isLongTerm) payload.endDate = null;
      if (!payload.applicationDeadline) delete payload.applicationDeadline;
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;

      const needsLocation =
        job.mode.includes("Work from office") ||
        job.mode.includes("Work from field");
      if (
        !job.useOfficeLocation &&
        needsLocation &&
        job.latitude &&
        job.longitude
      ) {
        payload.location = {
          type: "Point",
          coordinates: [Number(job.longitude), Number(job.latitude)],
          address: job.location,
        };
      } else if (!needsLocation) {
        payload.location = {
          type: "Point",
          coordinates: [0, 0],
          address: "Remote",
        };
      } else if (!job.useOfficeLocation) {
        payload.location = originalLocation;
      } else {
        delete payload.location;
      }

      delete payload.latitude;
      delete payload.longitude;

      await axios.patch(
        `https://jobone-mrpy.onrender.com/jobs/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Job updated successfully!");
      navigate(`/job/${id}`);
    } catch (err) {
      console.error("Update failed:", err);
      alert(
        "Failed to update job: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans mt-16 sm:mt-20">
      {/* FACT: Sticky Top Header Removed. Back button and Title moved to standard flow. */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        <div className="flex items-center gap-4 mb-6 border-b border-slate-200 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white shadow-sm border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Edit Posting
            </h1>
            <p className="text-sm font-medium text-slate-500 truncate max-w-sm">
              {job.title || "Untitled Job"}
            </p>
          </div>
        </div>

        {/* CORE DETAILS */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200">
          <h2 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Briefcase size={20} className="text-indigo-600" /> Core Details
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Job Title
                </label>
                <ElasticTitleDropdown
                  value={job.title}
                  onChange={(val) =>
                    setJob((prev) => ({ ...prev, title: val }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Job Status
                </label>
                <select
                  name="status"
                  value={job.status}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                  <option value="closed">Closed</option>
                  <option value="deadline passed">Deadline Passed</option>
                </select>
              </div>
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
                  className="w-5 h-5 text-indigo-600 rounded border-blue-300 focus:ring-indigo-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={job.showHiringCompanyName}
                      onChange={(e) => setJob({ ...job, showHiringCompanyName: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600 font-medium">
                      Show the client's company name publicly on the Job Card
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Job Type
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
                  ].map((type) => (
                    <label
                      key={type}
                      className={`cursor-pointer px-4 py-2 text-xs font-bold rounded-xl border transition-all capitalize ${job.jobType.includes(type) ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        onChange={() => toggleArrayItem("jobType", type)}
                      />{" "}
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Openings Required
                </label>
                <div className="relative">
                  <Users
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="number"
                    name="noOfPeopleRequired"
                    value={job.noOfPeopleRequired}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Work Mode
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { val: "Work from home", icon: <Monitor size={14} /> },
                  { val: "Work from office", icon: <Building size={14} /> },
                  { val: "Work from field", icon: <Globe size={14} /> },
                ].map((m) => (
                  <label
                    key={m.val}
                    className={`flex-1 min-w-[150px] cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${job.mode.includes(m.val) ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      onChange={() => toggleArrayItem("mode", m.val)}
                    />
                    {m.icon} <span className="text-sm font-bold">{m.val}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FACT: Fully Synced Compensation Block */}
        <section className="p-6 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-green-200 pb-4 mb-2">
            <h2 className="text-lg font-extrabold text-green-900 flex items-center gap-2">
              <IndianRupee size={20} className="text-green-600" /> Compensation
              & Perks
            </h2>
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
                className="text-sm font-bold text-green-700 cursor-pointer"
              >
                Unpaid / Volunteer
              </label>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative" ref={currencyRef}>
              <button
                type="button"
                onClick={() => setCurrencyOpen((o) => !o)}
                className="flex items-center justify-between gap-2 h-12 px-4 border border-green-200 rounded-xl bg-white text-sm font-bold text-gray-700 hover:bg-green-50 min-w-[110px]"
              >
                <div className="flex items-center gap-2">
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
                </div>
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
                  {CURRENCIES.filter(
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

            <div className="flex-1 flex items-center gap-3 w-full">
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
                setJob((prev) => ({ ...prev, salaryFrequency: e.target.value }))
              }
              className="w-full md:w-auto p-3 border border-green-200 rounded-xl outline-none bg-white text-sm font-bold text-green-800"
            >
              <option value="Month">/ Month</option>
              <option value="Year">/ Year</option>
              <option value="Hour">/ Hour</option>
              <option value="Lump-Sum">Lump-Sum</option>
            </select>
          </div>

          <div className="pt-4 mt-4 border-t border-green-200/50">
            <label className="block text-xs font-semibold text-green-800 mb-3">
              Perks & Benefits
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
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
            <div className="flex gap-2">
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
                className="max-w-xs p-2.5 text-sm border border-green-200 rounded-xl outline-none focus:ring-2 focus:ring-green-300 bg-white"
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
                className="px-4 py-2 bg-green-200 text-green-800 text-sm font-bold rounded-xl hover:bg-green-300 transition-colors"
              >
                Add
              </button>
            </div>
            {job.incentives.filter(
              (i) => !PERKS_OPTIONS.map((p) => p.value).includes(i),
            ).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {job.incentives
                  .filter((i) => !PERKS_OPTIONS.map((p) => p.value).includes(i))
                  .map((custom, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-xs font-semibold"
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
        </section>

        {/* DEMOGRAPHICS & SKILLS */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200">
          <h2 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <UserCircle2 size={20} className="text-blue-600" /> Candidate
            Profile & Skills
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Qualifications
              </label>
              <div className="flex flex-wrap gap-2.5">
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
                    className={`cursor-pointer px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all ${job.qualifications.includes(q) ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
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
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
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

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-indigo-800 mb-3 uppercase">
                Experience Required
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-indigo-100 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-indigo-700">
                    Relevant Field Experience
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={job.experience.relevantExperience.min || ""}
                      onChange={(e) =>
                        handleExperienceChange(
                          "relevantExperience",
                          "min",
                          e.target.value,
                        )
                      }
                      disabled={job.experience.relevantExperience.isAny}
                      className="flex-1 p-2.5 border border-indigo-200 rounded-lg text-sm outline-none disabled:bg-gray-50 focus:ring-2 focus:ring-indigo-200"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={job.experience.relevantExperience.max || ""}
                      onChange={(e) =>
                        handleExperienceChange(
                          "relevantExperience",
                          "max",
                          e.target.value,
                        )
                      }
                      disabled={job.experience.relevantExperience.isAny}
                      className="flex-1 p-2.5 border border-indigo-200 rounded-lg text-sm outline-none disabled:bg-gray-50 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm font-bold text-indigo-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={job.experience.relevantExperience.isAny}
                      onChange={(e) =>
                        toggleExperienceAny(
                          "relevantExperience",
                          e.target.checked,
                        )
                      }
                      className="rounded w-4 h-4 text-indigo-600"
                    />{" "}
                    Any / Freshers welcome
                  </label>
                </div>
                <div className="p-4 bg-white border border-indigo-100 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-indigo-700">
                    Total Work Experience
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={job.experience.totalExperience.min || ""}
                      onChange={(e) =>
                        handleExperienceChange(
                          "totalExperience",
                          "min",
                          e.target.value,
                        )
                      }
                      disabled={job.experience.totalExperience.isAny}
                      className="flex-1 p-2.5 border border-indigo-200 rounded-lg text-sm outline-none disabled:bg-gray-50 focus:ring-2 focus:ring-indigo-200"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={job.experience.totalExperience.max || ""}
                      onChange={(e) =>
                        handleExperienceChange(
                          "totalExperience",
                          "max",
                          e.target.value,
                        )
                      }
                      disabled={job.experience.totalExperience.isAny}
                      className="flex-1 p-2.5 border border-indigo-200 rounded-lg text-sm outline-none disabled:bg-gray-50 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm font-bold text-indigo-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={job.experience.totalExperience.isAny}
                      onChange={(e) =>
                        toggleExperienceAny("totalExperience", e.target.checked)
                      }
                      className="rounded w-4 h-4 text-indigo-600"
                    />{" "}
                    Any / Freshers welcome
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Age Limit
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={job.ageLimit.min || ""}
                  onChange={(e) => handleAgeChange("min", e.target.value)}
                  disabled={job.ageLimit.isAny}
                  className="w-24 p-3 border rounded-xl text-sm outline-none disabled:bg-slate-100 focus:border-indigo-500"
                />
                <span className="text-sm text-slate-400 font-bold">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={job.ageLimit.max || ""}
                  onChange={(e) => handleAgeChange("max", e.target.value)}
                  disabled={job.ageLimit.isAny}
                  className="w-24 p-3 border rounded-xl text-sm outline-none disabled:bg-slate-100 focus:border-indigo-500"
                />
                <label className="flex items-center gap-2 text-sm font-bold text-indigo-600 ml-2 bg-indigo-50 px-4 py-3 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={job.ageLimit.isAny}
                    onChange={(e) =>
                      setJob((prev) => ({
                        ...prev,
                        ageLimit: { min: "", max: "", isAny: e.target.checked },
                      }))
                    }
                    className="rounded w-4 h-4"
                  />{" "}
                  Any
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Gender Preference
              </label>
              <select
                name="genderPreference"
                value={job.genderPreference}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl text-sm outline-none font-bold text-slate-700 bg-white focus:border-indigo-500"
              >
                <option value="No Preference">No Preference</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
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

            <div className="col-span-1 md:col-span-2 pt-6 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Required Skills
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
          </div>
        </section>

        {/* TIMINGS & DATES */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200">
          <h2 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Clock size={20} className="text-purple-600" /> Schedule & Deadlines
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Work Days
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {["Mon to Fri", "Mon to Sat", "Sat to Sun", "Custom"].map(
                    (p) => (
                      <label
                        key={p}
                        className={`cursor-pointer py-2.5 text-center text-xs font-bold rounded-xl border transition-all ${job.workDaysPattern === p ? "bg-slate-800 text-white border-slate-800 shadow-md" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                      >
                        <input
                          type="radio"
                          name="workDaysPattern"
                          value={p}
                          checked={job.workDaysPattern === p}
                          onChange={handleChange}
                          className="hidden"
                        />{" "}
                        {p}
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
                    placeholder="Describe custom days..."
                    className="w-full p-3 border rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                    Expected Timings {!job.isFlexibleShifts && <span className="text-red-500">*</span>}
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-blue-600 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    <input
                      type="checkbox"
                      name="isFlexibleShifts"
                      checked={job.isFlexibleShifts}
                      onChange={handleChange}
                      className="rounded"
                    />{" "}
                    Flexible
                  </label>
                </div>
                <div className="space-y-2">
                  {job.shifts.map((shift, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <input
                        value={shift.shiftName}
                        onChange={(e) =>
                          updateShift(index, "shiftName", e.target.value)
                        }
                        className="w-24 bg-transparent text-xs font-bold outline-none text-slate-700"
                        placeholder="Shift Name"
                      />
                      <input
                        type="time"
                        value={shift.startTime}
                        onChange={(e) =>
                          updateShift(index, "startTime", e.target.value)
                        }
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 font-mono font-bold"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="time"
                        value={shift.endTime}
                        onChange={(e) =>
                          updateShift(index, "endTime", e.target.value)
                        }
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 font-mono font-bold"
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeShift(index)}
                          className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addShift}
                    className="text-xs font-bold text-indigo-600 flex items-center gap-1 mt-2 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    <Plus size={14} /> Add Shift
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Duration & Dates
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold text-blue-600 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                  <input
                    type="checkbox"
                    name="isFlexibleDuration"
                    checked={job.isFlexibleDuration}
                    onChange={handleChange}
                    className="rounded"
                  />{" "}
                  Flexible Dates
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={job.startDate}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 font-bold text-slate-700"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={job.isLongTerm ? "" : job.endDate}
                    onChange={handleChange}
                    disabled={job.isLongTerm}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none disabled:bg-slate-100 disabled:text-slate-400 bg-white font-bold text-slate-700 focus:border-indigo-500"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <input
                  type="checkbox"
                  name="isLongTerm"
                  checked={job.isLongTerm}
                  onChange={handleChange}
                  className="rounded w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />{" "}
                Long Term Role (No fixed end date)
              </label>

              <div className="pt-4 border-t border-slate-200">
                <label className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1 block">
                  <Calendar size={14} /> Application Deadline
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={job.applicationDeadline}
                  onChange={handleChange}
                  className="w-full p-3 border border-rose-200 bg-white rounded-xl text-sm outline-none focus:border-rose-500 font-bold text-rose-700 shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SCREENING QUESTIONS */}
        <section className="bg-purple-50 border border-purple-100 rounded-3xl p-6 sm:p-8 space-y-4">
          <label className="block text-lg font-extrabold text-purple-900 flex items-center gap-2">
            <HelpCircle size={20} /> Candidate Screening Questions
          </label>
          <p className="text-sm text-purple-700 font-medium">
            Add questions candidates must answer when applying.
          </p>
          <div className="flex gap-3">
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
              className="flex-1 p-3.5 border border-purple-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-300 bg-white"
            />
            <button
              type="button"
              onClick={handleAddQuestion}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-purple-700 shadow-md"
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
                className="text-[11px] font-bold bg-white border border-purple-200 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors shadow-sm"
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
                  className="flex justify-between items-center bg-white p-4 border border-purple-100 rounded-xl text-sm font-medium text-purple-900 shadow-sm"
                >
                  <span>
                    <strong className="text-purple-600 mr-2">
                      Q{idx + 1}.
                    </strong>{" "}
                    {q}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-rose-400 hover:text-rose-600 p-1"
                  >
                    <X size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* REQUESTED DOCUMENTS CHECKLIST */}
        <section className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-3xl p-6 sm:p-8 border border-blue-200 shadow-sm">
          <h2 className="text-lg font-extrabold text-blue-900 mb-2 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" /> Requested Candidate Documents (Optional Checklist)
          </h2>
          <p className="text-sm text-blue-800 mb-6">
            Select any specific documents you require applicants to provide when applying for this position:
          </p>
          <div className="flex flex-wrap gap-2.5">
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
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  <span>{isSelected ? "✓" : "+"}</span> {docName}
                </button>
              );
            })}
          </div>
        </section>

        {/* FEATURES & DESCRIPTION */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200">
          <h2 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <AlignLeft size={20} className="text-amber-500" /> Description &
            Highlights
          </h2>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl p-6 mb-8 shadow-sm">
            <label className="block text-sm font-extrabold text-amber-900 uppercase mb-3 flex items-center gap-1.5">
              <Zap size={16} /> Job Highlights / Features
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={job.jobFeatures[0] || ""}
                onChange={(e) =>
                  setJob((p) => {
                    const arr = [...p.jobFeatures];
                    arr[0] = e.target.value;
                    return { ...p, jobFeatures: arr };
                  })
                }
                placeholder="Feature 1"
                className="p-3.5 rounded-xl border border-amber-200 text-sm font-bold text-amber-900 outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
              <input
                type="text"
                value={job.jobFeatures[1] || ""}
                onChange={(e) =>
                  setJob((p) => {
                    const arr = [...p.jobFeatures];
                    arr[1] = e.target.value;
                    return { ...p, jobFeatures: arr };
                  })
                }
                placeholder="Feature 2"
                className="p-3.5 rounded-xl border border-amber-200 text-sm font-bold text-amber-900 outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Job Summary
              </label>
              <textarea
                value={jobSummary}
                onChange={(e) => setJobSummary(e.target.value)}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm min-h-[150px] outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 leading-relaxed font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Key Responsibilities
              </label>
              <textarea
                value={keyResponsibilities}
                onChange={(e) => setKeyResponsibilities(e.target.value)}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm min-h-[150px] outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 leading-relaxed font-medium"
              />
            </div>
          </div>
        </section>

        {/* LOCATION */}
        {(job.mode.includes("Work from office") ||
          job.mode.includes("Work from field")) && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <MapPin size={20} className="text-rose-500" /> Office Location
              </h2>
              <label className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl cursor-pointer flex items-center gap-2 border border-indigo-100 hover:bg-indigo-100 transition-colors">
                <input
                  type="checkbox"
                  name="useOfficeLocation"
                  checked={job.useOfficeLocation}
                  onChange={handleChange}
                  className="rounded text-indigo-600"
                />{" "}
                Use Profile Office Location
              </label>
            </div>
            {!job.useOfficeLocation && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="rounded-xl overflow-hidden border border-slate-300 mb-4 shadow-sm">
                  <LocationPicker onLocationSelect={handleLocationSelect} />
                </div>
                <input
                  name="location"
                  value={job.location}
                  onChange={handleChange}
                  placeholder="Refine specific address..."
                  className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>
            )}
          </section>
        )}

        {/* FACT: Save Button Moved to Bottom Right */}
        <div className="flex gap-4 justify-end mt-12 pt-8 border-t border-slate-200">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
