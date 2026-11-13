import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import EmployerLayout from "../components/employer/EmployerLayout.jsx";
import LocationPicker from "../components/LocationPicker.jsx";
import ElasticTitleDropdown from "../components/ElasticTitleDropdown.jsx";
import CourseSuggestionsDropdown from "../components/CourseSuggestionsDropdown.jsx";
import LanguageSuggestionsDropdown from "../components/LanguageSuggestionsDropdown.jsx";
import SkillSuggestionsDropdown from "../components/SkillSuggestionsDropdown.jsx";
import {
  INDUSTRIES,
  DEPARTMENTS,
  getDepartmentsForIndustry,
} from "../constants/taxonomy";
import {
  Loader2,
  Save,
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Users,
  X,
  Target,
  Plus,
  Building,
  Zap,
  GraduationCap,
  Languages,
  UserCircle2,
  Calendar,
  HelpCircle,
  FileText,
  CheckCircle2,
  Power,
} from "lucide-react";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [job, setJob] = useState({
    title: "",
    industry: "Information Technology & Software",
    department: "Engineering & Development",
    subdomain: "",
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
    noOfPeopleRequired: "1",
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
  const [originalLocation, setOriginalLocation] = useState(null);

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

  const CURRENCIES = [
    { code: "INR", name: "Indian Rupee", sym: "₹" },
    { code: "USD", name: "US Dollar", sym: "$" },
    { code: "EUR", name: "Euro", sym: "€" },
    { code: "AED", name: "UAE Dirham", sym: "د.إ" },
    { code: "GBP", name: "British Pound", sym: "£" },
    { code: "AUD", name: "Australian Dollar", sym: "A$" },
    { code: "CAD", name: "Canadian Dollar", sym: "C$" },
    { code: "SGD", name: "Singapore Dollar", sym: "S$" },
  ];

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const stored = localStorage.getItem("employerInfo");
        if (!stored) return navigate("/login");
        const token = JSON.parse(stored).token;

        const { data } = await axios.get(`${API_BASE_URL}/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
            (parts[0] ? parts[0].replace("<h3>Job Summary</h3>", "").trim() : rawDesc)
        );
        setKeyResponsibilities(d.keyResponsibilities || (parts[1] ? parts[1].trim() : ""));

        const isCurrentlyUnpaid =
          (d.salaryMin === 0 && d.salaryMax === 0) || d.salaryAmount === 0;
        setIsUnpaid(isCurrentlyUnpaid);

        setJob({
          title: d.title || "",
          industry: d.industry || "Information Technology & Software",
          department: d.department || "Engineering & Development",
          subdomain: d.subdomain || "",
          status: d.status || "active",
          jobFeatures: d.jobFeatures?.length === 2 ? d.jobFeatures : ["", ""],
          skillsRequired: d.skillsRequired || [],
          jobType: d.jobType?.length ? d.jobType : ["full-time"],
          workDaysPattern: d.workDaysPattern || "Mon to Fri",
          customWorkDaysDescription: d.customWorkDaysDescription || "",
          mode: d.mode?.length ? d.mode : ["Work from office"],
          salaryMin: isCurrentlyUnpaid ? "" : d.salaryMin ?? d.salaryAmount ?? "",
          salaryMax: isCurrentlyUnpaid ? "" : d.salaryMax ?? d.salaryAmount ?? "",
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
          noOfPeopleRequired: d.noOfPeopleRequired || "1",
          genderPreference: d.genderPreference || "No Preference",
          qualifications: d.qualifications || [],
          courses: d.courses || [],
          ageLimit: d.ageLimit || { min: "", max: "", isAny: true },
          languages: d.languages || [],
          experience: d.experience || {
            relevantExperience: { min: "", max: "", isAny: true },
            totalExperience: { min: "", max: "", isAny: true },
          },
          useOfficeLocation: false,
          location: typeof d.location === "object" ? d.location?.address || "" : d.location || "",
          latitude: d.location?.coordinates?.[1] || null,
          longitude: d.location?.coordinates?.[0] || null,
          isThirdPartyRecruiting: d.isThirdPartyRecruiting || false,
          hiringCompanyName: d.hiringCompanyName || "",
          showHiringCompanyName: d.showHiringCompanyName || false,
        });
      } catch (err) {
        console.error("Failed to load job data:", err);
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

  const toggleArrayItem = (field, value) => {
    setJob((prev) => {
      const arr = prev[field] || [];
      const newArr = arr.includes(value)
        ? arr.filter((i) => i !== value)
        : [...arr, value];
      return { ...prev, [field]: newArr };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!job.title || job.mode.length === 0 || job.jobType.length === 0) {
      return alert("Title, Mode, and Job Type are required.");
    }

    setSaving(true);
    try {
      const stored = localStorage.getItem("employerInfo");
      const token = JSON.parse(stored).token;

      const parsedMin = isUnpaid ? 0 : Number(job.salaryMin || 0);
      const parsedMax = isUnpaid ? 0 : Number(job.salaryMax || job.salaryMin || 0);

      const payload = {
        ...job,
        jobSummary,
        keyResponsibilities,
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
        job.mode.includes("Work from office") || job.mode.includes("Work from field");

      if (!job.useOfficeLocation && needsLocation && job.latitude && job.longitude) {
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

      await axios.patch(`${API_BASE_URL}/jobs/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Job posting updated successfully!");
      navigate(`/job/${id}`);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update job: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <EmployerLayout activeTab="dashboard" title="Loading Posting...">
        <div className="py-24 flex flex-col items-center justify-center text-[var(--theme-text-muted)]">
          <Loader2 size={36} className="animate-spin text-[var(--theme-accent-silver)] mb-4" />
          <p className="text-sm font-semibold">Retrieving posting details...</p>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout
      activeTab="dashboard"
      title={`Edit: ${job.title || "Job"}`}
      breadcrumbs={[
        { label: "Dashboard", path: "/employerdashboard" },
        { label: "Job Details", path: `/job/${id}` },
        { label: "Edit" },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/job/${id}`)}
              className="p-2 rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--theme-text)] tracking-tight">
                Edit Job Posting
              </h1>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                Updating position dossier for {job.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/job/${id}`}
              className="px-4 py-2 rounded-xl border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* 1. Core Fundamentals */}
        <section className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[var(--theme-text)] flex items-center gap-2 border-b border-[var(--theme-border)] pb-3">
            <Briefcase size={16} className="text-[var(--theme-accent-silver)]" />
            <span>Role Fundamentals</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                Job Title
              </label>
              <ElasticTitleDropdown
                value={job.title}
                onChange={(val) => setJob((prev) => ({ ...prev, title: val }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                  Listing Status
                </label>
                <select
                  name="status"
                  value={job.status}
                  onChange={handleChange}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                >
                  <option value="active">Active (Accepting Applicants)</option>
                  <option value="closed">Closed (Paused)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                  Openings
                </label>
                <input
                  type="number"
                  min="1"
                  name="noOfPeopleRequired"
                  value={job.noOfPeopleRequired}
                  onChange={handleChange}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              </div>
            </div>

            {/* Real-World Industry Taxonomy & Department Classification */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                  Industry Vertical
                </label>
                <select
                  value={job.industry || "Information Technology & Software"}
                  onChange={(e) => {
                    const newInd = e.target.value;
                    const deps = getDepartmentsForIndustry(newInd);
                    setJob((prev) => ({
                      ...prev,
                      industry: newInd,
                      department: deps[0] || prev.department || "Engineering & Development",
                    }));
                  }}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind.id} value={ind.name}>
                      {ind.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                  Department / Function
                </label>
                <select
                  value={job.department || "Engineering & Development"}
                  onChange={(e) => setJob((prev) => ({ ...prev, department: e.target.value }))}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                >
                  <optgroup label="Key Industry Departments">
                    {getDepartmentsForIndustry(job.industry).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Corporate Functions">
                    {DEPARTMENTS.filter(
                      (d) => !getDepartmentsForIndustry(job.industry).includes(d)
                    ).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                  Specialization / Subdomain
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cloud, Wealth Mgmt"
                  value={job.subdomain || ""}
                  onChange={(e) => setJob((prev) => ({ ...prev, subdomain: e.target.value }))}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-2">
                Employment Types
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["full-time", "part-time", "internship", "contract"].map((type) => {
                  const sel = job.jobType?.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleArrayItem("jobType", type)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        sel
                          ? "bg-[var(--theme-surface-elevated)] border-[var(--theme-accent-silver)] text-[var(--theme-text)] font-bold shadow-sm"
                          : "border-[var(--theme-border)] text-[var(--theme-text-muted)]"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Workplace & Compensation */}
        <section className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[var(--theme-text)] flex items-center gap-2 border-b border-[var(--theme-border)] pb-3">
            <MapPin size={16} className="text-[var(--theme-accent-silver)]" />
            <span>Workplace & Compensation</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-2">
                Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Work from office", "Work from home", "Work from field"].map((m) => {
                  const sel = job.mode?.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleArrayItem("mode", m)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        sel
                          ? "bg-[var(--theme-surface-elevated)] border-[var(--theme-accent-silver)] text-[var(--theme-text)] font-bold shadow-sm"
                          : "border-[var(--theme-border)] text-[var(--theme-text-muted)]"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {(job.mode?.includes("Work from office") || job.mode?.includes("Work from field")) && (
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                  Location Address & Pin
                </label>
                <LocationPicker
                  selectedLocation={job.location}
                  onSelect={(locData) => {
                    setJob((prev) => ({
                      ...prev,
                      location: locData.address,
                      latitude: locData.lat,
                      longitude: locData.lng,
                    }));
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">Min Salary</label>
                <input
                  type="number"
                  name="salaryMin"
                  value={job.salaryMin}
                  onChange={handleChange}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">Max Salary</label>
                <input
                  type="number"
                  name="salaryMax"
                  value={job.salaryMax}
                  onChange={handleChange}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">Frequency</label>
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
                <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">Currency</label>
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
          </div>
        </section>

        {/* 3. Description & Responsibilities */}
        <section className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[var(--theme-text)] flex items-center gap-2 border-b border-[var(--theme-border)] pb-3">
            <FileText size={16} className="text-[var(--theme-accent-silver)]" />
            <span>Description & Deliverables</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                Executive Role Summary
              </label>
              <textarea
                rows={4}
                value={jobSummary}
                onChange={(e) => setJobSummary(e.target.value)}
                className="w-full p-3 text-xs rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                Key Responsibilities
              </label>
              <textarea
                rows={5}
                value={keyResponsibilities}
                onChange={(e) => setKeyResponsibilities(e.target.value)}
                className="w-full p-3 text-xs font-mono rounded-xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-[var(--theme-text)] resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--theme-text)] mb-1">
                Skills Stack
              </label>
              <SkillSuggestionsDropdown
                selectedSkills={job.skillsRequired || []}
                onChange={(skills) => setJob((prev) => ({ ...prev, skillsRequired: skills }))}
              />
            </div>
          </div>
        </section>

        {/* Bottom Save Action */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            to={`/job/${id}`}
            className="px-5 py-2.5 rounded-xl border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save & Apply Updates</span>
          </button>
        </div>
      </form>
    </EmployerLayout>
  );
}
