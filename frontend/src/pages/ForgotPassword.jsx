import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Building2, Mail, Lock, KeyRound, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "../config/api";
import AuthLayout from "../components/AuthLayout";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("user");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint =
        activeTab === "employer"
          ? `${API_BASE_URL}/employer/forgot-password`
          : `${API_BASE_URL}/user/forgot-password`;

      const { data } = await axios.post(endpoint, { email: normalizedEmail });
      setMessage(data.message || "A secure 6-digit password reset code has been dispatched to your email.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to dispatch reset code. Please verify your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.replace(/\D/g, "");

    if (!normalizedEmail) {
      setError("Email address is required.");
      return;
    }
    if (cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP reset code.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint =
        activeTab === "employer"
          ? `${API_BASE_URL}/employer/reset-password`
          : `${API_BASE_URL}/user/reset-password`;

      const { data } = await axios.post(endpoint, { email: normalizedEmail, otp: cleanOtp, newPassword });
      setMessage(data.message || "Password updated successfully! Redirecting to sign in...");

      setTimeout(() => {
        navigate(activeTab === "employer" ? "/login?tab=employer" : "/login?tab=user");
      }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please check your OTP code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? "Reset Account Password" : "Set New Password"}
      subtitle={
        step === 1
          ? "Enter your registered email to receive a secure recovery code"
          : `Enter the 6-digit code sent to ${email} and choose your new password`
      }
      badge="Security Recovery"
      visualHeading="Regain access to your recruitment pipeline."
      visualSubheading="JobOne ensures encrypted credentials, multi-factor authentication, and secure password recovery mechanisms."
      metrics={[
        { value: "End-to-End", label: "Encrypted Protocol" },
        { value: "15 min", label: "OTP Code Expiry" },
        { value: "Instant", label: "Security Confirmation" },
      ]}
      quote={{
        text: "Account safety and privacy are fundamental pillars of the JobOne architectural framework.",
        author: "JobOne Platform Security",
        role: "Identity Governance",
      }}
    >
      {/* Account Type Tabs (Step 1 only) */}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-2 border border-border mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab("user");
              setError("");
              setMessage("");
            }}
            className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "user"
                ? "bg-foreground text-background shadow-sm"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <User size={14} /> Candidate
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("employer");
              setError("");
              setMessage("");
            }}
            className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "employer"
                ? "bg-foreground text-background shadow-sm"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <Building2 size={14} /> Employer
          </button>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-foreground" : "bg-border"}`} />
        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-foreground" : "bg-border"}`} />
      </div>

      {error && (
        <div role="alert" className="mb-4 p-3.5 rounded-xl text-xs font-medium border border-rose-500/20 bg-rose-500/10 text-rose-300 dark:text-rose-400">
          {error}
        </div>
      )}

      {message && (
        <div role="status" className="mb-4 p-3.5 rounded-xl text-xs font-medium border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono tracking-wider uppercase text-foreground/70 mb-1.5">
              {activeTab === "employer" ? "Corporate Email Address" : "Registered Email Address"}
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={activeTab === "employer" ? "recruiter@company.com" : "candidate@example.com"}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground placeholder-foreground/40 text-sm focus:outline-none focus:border-silver/60 transition-colors"
              />
              <Mail size={16} className="absolute left-3.5 top-3 text-foreground/40 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full mt-2 py-3 rounded-xl bg-foreground text-background font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition shadow-md disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Dispatching Code...</span>
              </>
            ) : (
              <>
                <span>Send Reset Code</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono tracking-wider uppercase text-foreground/70 mb-1.5">
              6-Digit Reset Code
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                maxLength={6}
                required
                className="w-full text-center py-3 px-4 rounded-xl bg-surface-2 border border-border text-foreground font-mono text-xl tracking-[0.3em] font-bold focus:outline-none focus:border-silver/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono tracking-wider uppercase text-foreground/70 mb-1.5">
              New Password <span className="text-foreground/40 normal-case">(min. 6 characters)</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                placeholder="Enter new strong password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground placeholder-foreground/40 text-sm focus:outline-none focus:border-silver/60 transition-colors"
              />
              <Lock size={16} className="absolute left-3.5 top-3 text-foreground/40 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
                setMessage("");
              }}
              className="py-3 px-4 rounded-xl border border-border text-foreground/70 hover:text-foreground text-xs font-semibold cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || otp.length !== 6 || !newPassword}
              className="flex-1 py-3 rounded-xl bg-foreground text-background font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Reset & Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="pt-4 mt-4 border-t border-border text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground font-medium transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Return to Sign In</span>
        </Link>
      </div>
    </AuthLayout>
  );
}
