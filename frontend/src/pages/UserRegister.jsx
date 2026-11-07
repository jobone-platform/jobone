import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Mail, Lock, Phone, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "../config/api";
import AuthLayout from "../components/AuthLayout";
import GoogleAuthButton, { AuthDivider } from "../components/GoogleAuthButton";

export default function UserRegister() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
  ];

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (countryCode === "+91") {
      if (digits.length <= 10) setPhone(digits);
    } else {
      if (digits.length <= 15) setPhone(digits);
    }
  };

  const handleCountryCodeChange = (e) => {
    const newCode = e.target.value;
    setCountryCode(newCode);
    if (newCode === "+91" && phone.length > 10) {
      setPhone(phone.slice(0, 10));
    }
  };

  const validateForm = () => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return "Please enter your full name (minimum 2 characters).";
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return "Please enter a valid email address.";
    }

    if (!password || password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    if (!phone) {
      return "Phone number is required.";
    }

    if (countryCode === "+91") {
      if (phone.length !== 10) {
        return `Indian mobile number must be exactly 10 digits. You have entered ${phone.length} digit(s).`;
      }
      if (!/^[6-9]\d{9}$/.test(phone)) {
        return "Invalid Indian mobile number. Mobile numbers must start with 6, 7, 8, or 9.";
      }
    } else {
      if (phone.length < 7 || phone.length > 15) {
        return `Mobile number must be between 7 and 15 digits. Entered: ${phone.length} digit(s).`;
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/user/register`, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        countryCode,
      });

      navigate("/userotp", { state: { email: email.trim().toLowerCase() } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Candidate Registration"
      subtitle="Create your career profile to apply directly to verified employer requisitions"
      badge="Candidate Onboarding"
      roleType="candidate"
    >
      {error && (
        <div className="mb-5 p-3 rounded-xl bg-[var(--theme-danger-bg)] border border-[var(--theme-danger)]/30 text-xs text-rose-400 font-medium">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-subtle)]" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aakash Verma"
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] text-xs sm:text-sm rounded-xl outline-none focus:border-[var(--theme-border-focus)] transition-colors"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-subtle)]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] text-xs sm:text-sm rounded-xl outline-none focus:border-[var(--theme-border-focus)] transition-colors"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
            Mobile Number *
          </label>
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={handleCountryCodeChange}
              className="w-24 shrink-0 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] text-xs rounded-xl px-2.5 py-2.5 outline-none focus:border-[var(--theme-border-focus)] transition-colors cursor-pointer"
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code} className="bg-[var(--theme-surface)] text-[var(--theme-text)]">
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-subtle)]" />
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="10-digit mobile"
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] text-xs sm:text-sm rounded-xl outline-none focus:border-[var(--theme-border-focus)] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1.5">
            Password (min 6 characters) *
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-subtle)]" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-input-placeholder)] text-xs sm:text-sm rounded-xl outline-none focus:border-[var(--theme-border-focus)] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)] cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)] border border-[var(--theme-border-silver)] text-[var(--theme-text)] font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <span>Initiating Verification...</span>
          ) : (
            <>
              <span>Continue to Email Verification</span>
              <ArrowRight className="w-4 h-4 text-[var(--theme-accent-silver)]" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <AuthDivider text="or continue with" />

      {/* Google Quick Registration */}
      <div className="mb-6">
        <GoogleAuthButton
          role="candidate"
          mode="register"
          onError={setError}
        />
      </div>

      <div className="text-center text-xs text-[var(--theme-text-muted)] mt-6 pt-5 border-t border-[var(--theme-border)]">
        Already registered?{" "}
        <Link to="/login" className="text-[var(--theme-text)] font-bold hover:underline">
          Sign In here
        </Link>
      </div>
    </AuthLayout>
  );
}
