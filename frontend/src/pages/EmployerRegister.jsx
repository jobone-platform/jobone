import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Building2, UserCheck, ShieldCheck, Mail, Phone, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../config/api";
import AuthLayout from "../components/AuthLayout";
import GoogleAuthButton, { AuthDivider } from "../components/GoogleAuthButton";

const countryCodes = [
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
  { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
];

export default function EmployerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    userType: "Company",
    companyName: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMobileChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (countryCode === "+91") {
      if (digits.length <= 10) {
        setFormData((prev) => ({ ...prev, mobile: digits }));
      }
    } else {
      if (digits.length <= 15) {
        setFormData((prev) => ({ ...prev, mobile: digits }));
      }
    }
  };

  const handleCountryCodeChange = (e) => {
    const newCode = e.target.value;
    setCountryCode(newCode);
    if (newCode === "+91" && formData.mobile.length > 10) {
      setFormData((prev) => ({ ...prev, mobile: prev.mobile.slice(0, 10) }));
    }
  };

  const validateForm = () => {
    const fName = formData.firstName.trim();
    const lName = formData.lastName.trim();

    if (!fName || fName.length < 2) {
      return "First name must be at least 2 characters long.";
    }
    if (!lName || lName.length < 1) {
      return "Last name is required.";
    }

    const emailTrimmed = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      return "Please enter a valid business email address.";
    }

    if (!formData.mobile) {
      return "Mobile phone number is required.";
    }

    if (countryCode === "+91") {
      if (formData.mobile.length !== 10) {
        return `Indian mobile number must be exactly 10 digits. Entered: ${formData.mobile.length} digit(s).`;
      }
      if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
        return "Invalid Indian mobile number. Mobile numbers must start with 6, 7, 8, or 9.";
      }
    } else {
      if (formData.mobile.length < 7 || formData.mobile.length > 15) {
        return `Mobile number must be between 7 and 15 digits. Entered: ${formData.mobile.length} digit(s).`;
      }
    }

    if (formData.userType === "Company" && !formData.companyName.trim()) {
      return "Company / Organization Name is required for company accounts.";
    }

    if (!formData.password || formData.password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const payload = {
        name: fullName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.mobile.trim(),
        countryCode,
        userType: formData.userType,
        companyName: formData.userType === "Company" ? formData.companyName.trim() : "",
      };

      await axios.post(`${API_BASE_URL}/employer/register`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      setSuccess("Account initiated! Redirecting to email verification...");
      setLoading(false);

      setTimeout(() => {
        navigate("/employerotp", { state: { email: formData.email.trim().toLowerCase() } });
      }, 1100);
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to initiate employer registration. Please check your details and try again."
      );
    }
  };

  return (
    <AuthLayout
      title="Create Employer Account"
      subtitle="Publish verified requisitions and connect directly with pre-screened talent"
      badge="Enterprise Talent Acquisition"
      visualHeading="Hire premier talent with speed and precision."
      visualSubheading="Streamline your hiring funnel with verified credentials, structured candidate evaluation, and automated pipeline intelligence."
      metrics={[
        { value: "48h", label: "Median Time to Shortlist" },
        { value: "96%", label: "Candidate Response Rate" },
        { value: "10k+", label: "Verified Tech Candidates" },
      ]}
      quote={{
        text: "JobOne cut our technical hiring cycle down by more than half. The caliber of pre-verified candidates is unmatched.",
        author: "Devon Vance",
        role: "Head of Talent, Vertex Dynamics",
      }}
    >
      {error && (
        <div role="alert" className="mb-4 p-3.5 rounded-xl text-xs font-medium border border-rose-500/20 bg-rose-500/10 text-rose-300 dark:text-rose-400">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="mb-4 p-3.5 rounded-xl text-xs font-medium border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 dark:text-emerald-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Account Type Selector */}
        <div>
          <label className="block text-[11px] font-mono tracking-wider uppercase text-foreground/70 mb-1.5">
            Employer Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-2 border border-border">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, userType: "Company" }))}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                formData.userType === "Company"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <Building2 size={14} /> Registered Company
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, userType: "Recruiter" }))}
              className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                formData.userType === "Recruiter"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <UserCheck size={14} /> Agency / Recruiter / FreeLancer
            </button>
          </div>
        </div>

        {formData.userType === "Company" && (
          <div>
            <label className="block text-[11px] font-mono tracking-wider uppercase text-foreground/70 mb-1.5">
              Company / Organization Name *
            </label>
            <div className="relative">
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Acme Innovations Corp"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground placeholder-foreground/40 text-sm focus:outline-none focus:border-silver/60 transition-colors"
              />
              <Building2 size={16} className="absolute left-3.5 top-3 text-foreground/40 pointer-events-none" />
            </div>
          </div>
        )}

        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono tracking-wider uppercase text-foreground/70 mb-1.5">
              First Name *
            </label>
            <div className="relative">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Devon"
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground placeholder-foreground/40 text-sm focus:outline-none focus:border-silver/60 transition-colors"
              />
              <User size={16} className="absolute left-3 top-3 text-foreground/40 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-mono tracking-wider uppercase text-foreground/70 mb-1.5">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Vance"
              required
              className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground placeholder-foreground/40 text-sm focus:outline-none focus:border-silver/60 transition-colors"
            />
          </div>
        </div>

        {/* Business Email */}
        <div>
          <label className="block text-[11px] font-mono tracking-wider uppercase text-foreground/70 mb-1.5">
            Business Email Address *
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="talent@company.com"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground placeholder-foreground/40 text-sm focus:outline-none focus:border-silver/60 transition-colors"
            />
            <Mail size={16} className="absolute left-3.5 top-3 text-foreground/40 pointer-events-none" />
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-[11px] font-mono tracking-wider uppercase text-foreground/70 mb-1.5">
            Mobile Number * {countryCode === "+91" && <span className="text-foreground/40 normal-case">(10 digits)</span>}
          </label>
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={handleCountryCodeChange}
              className="w-28 px-2 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground text-xs font-mono focus:outline-none focus:border-silver/60 cursor-pointer"
            >
              {countryCodes.map((item) => (
                <option key={item.name} value={item.code} className="bg-surface-1 text-foreground">
                  {item.flag} {item.code}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <input
                type="tel"
                name="mobile"
                inputMode="numeric"
                value={formData.mobile}
                onChange={handleMobileChange}
                placeholder={countryCode === "+91" ? "9876543210" : "Mobile number"}
                maxLength={countryCode === "+91" ? 10 : 15}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground placeholder-foreground/40 text-sm font-mono tracking-wide focus:outline-none focus:border-silver/60 transition-colors"
              />
              <Phone size={16} className="absolute left-3.5 top-3 text-foreground/40 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-mono tracking-wider uppercase text-foreground/70 mb-1.5">
            Password * <span className="text-foreground/40 normal-case">(min. 6 characters)</span>
          </label>
          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong recruitment password"
              minLength={6}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground placeholder-foreground/40 text-sm focus:outline-none focus:border-silver/60 transition-colors"
            />
            <Lock size={16} className="absolute left-3.5 top-3 text-foreground/40 pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-3 rounded-xl bg-foreground text-background font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition shadow-md disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Creating Employer Account...</span>
            </>
          ) : (
            <>
              <span>Create Employer Account</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <AuthDivider text="or continue with" />

      {/* Google Quick Registration */}
      <div className="mb-6">
        <GoogleAuthButton
          role="employer"
          mode="register"
          onError={setError}
        />
      </div>

      <div className="pt-4 border-t border-border space-y-3">
        <p className="text-center text-xs text-foreground/70">
          Already have an employer account?{" "}
          <Link to="/login?tab=employer" className="text-foreground font-bold hover:underline">
            Sign In
          </Link>
        </p>

        <div className="flex items-center justify-center gap-2 text-[11px] text-foreground/40">
          <ShieldCheck size={14} />
          <span>SOC 2 Type II Certified & GDPR Compliant</span>
        </div>
      </div>
    </AuthLayout>
  );
}
