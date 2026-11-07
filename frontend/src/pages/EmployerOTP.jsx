import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Building2, Mail, ArrowRight, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../routes/Context";
import AuthLayout from "../components/AuthLayout";

export default function EmployerOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginEmployer } = useAuth();

  const initialEmail = location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
  };

  const handleResend = async () => {
    if (resending) return;
    if (!email.trim()) {
      setMessage("Please provide your business email address to resend the code.");
      setIsError(true);
      return;
    }
    try {
      setResending(true);
      setMessage("");
      setIsError(false);
      await axios.post(`${API_BASE_URL}/employer/resend-otp`, {
        email: email.trim().toLowerCase(),
      });
      setMessage("A fresh 6-digit verification code has been dispatched to your corporate email.");
      setIsError(false);
      setOtp("");
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend code. Please try again.");
      setIsError(true);
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMessage("");
    setIsError(false);

    if (!email.trim()) {
      setMessage("Please enter your registered corporate email.");
      setIsError(true);
      return;
    }

    if (otp.length !== 6) {
      setMessage("Please enter the complete 6-digit verification code.");
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/employer/verifyotp`, {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      const employerData = {
        ...res.data,
        id: res.data.employerId || res.data.id,
        employerId: res.data.employerId || res.data.id,
        email: email.trim().toLowerCase(),
      };

      loginEmployer(res.data.token, employerData);

      setMessage(
        res.data.alreadyVerified
          ? "Account verified! Redirecting to employer recruitment dashboard..."
          : "Employer account verified! Redirecting to recruitment console..."
      );
      setIsError(false);

      setTimeout(() => navigate("/employerdashboard"), 1100);
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid or expired verification code. Please check your corporate email.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Employer Account"
      subtitle={`Enter the 6-digit security code dispatched to ${email ? email : "your corporate email"}`}
      badge="Enterprise Verification"
      visualHeading="Verified employers hire with elevated authority."
      visualSubheading="Verifying your enterprise credentials activates job publishing privileges, direct candidate outreach, and the verified company trust badge."
      metrics={[
        { value: "Instant", label: "Requisition Publishing" },
        { value: "Direct", label: "Candidate Communication" },
        { value: "Verified", label: "Employer Trust Seal" },
      ]}
      quote={{
        text: "The verification standard ensures candidate safety and elevates company brand perception across top candidates.",
        author: "JobOne Enterprise Operations",
        role: "Recruitment Security Team",
      }}
    >
      {message && (
        <div
          role={isError ? "alert" : "status"}
          className={`mb-4 p-3.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${
            isError
              ? "border-rose-500/20 bg-rose-500/10 text-rose-300 dark:text-rose-400"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 dark:text-emerald-400"
          }`}
        >
          {!isError && <CheckCircle2 size={16} className="shrink-0" />}
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-[11px] font-mono tracking-wider uppercase text-foreground/70 mb-1.5">
            Corporate Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!initialEmail}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-colors ${
                initialEmail
                  ? "bg-surface-2/60 border-border/60 text-foreground/60 cursor-not-allowed"
                  : "bg-surface-2 border-border text-foreground focus:outline-none focus:border-silver/60"
              }`}
              placeholder="recruiter@company.com"
            />
            <Mail size={16} className="absolute left-3.5 top-3 text-foreground/40 pointer-events-none" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-mono tracking-wider uppercase text-foreground/70">
              6-Digit Security Code
            </label>
            <span className="text-[11px] text-foreground/40 font-mono">
              {otp.length}/6
            </span>
          </div>
          <div className="relative">
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={otp}
              onChange={handleOtpChange}
              required
              maxLength={6}
              autoFocus
              autoComplete="one-time-code"
              placeholder="••••••"
              className="w-full text-center py-3.5 px-4 rounded-xl bg-surface-2 border border-border text-foreground font-mono text-2xl tracking-[0.4em] font-bold focus:outline-none focus:border-silver focus:ring-1 focus:ring-silver/40 transition-all placeholder-foreground/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full mt-2 py-3 rounded-xl bg-foreground text-background font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition shadow-md disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Verifying Employer...</span>
            </>
          ) : (
            <>
              <span>Verify & Launch Recruitment Console</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <div className="pt-3 text-center border-t border-border flex flex-col items-center gap-2">
          <p className="text-xs text-foreground/60">
            Didn't receive the OTP?{" "}
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline cursor-pointer disabled:opacity-50"
              >
                {resending ? <RefreshCw size={12} className="animate-spin" /> : null}
                <span>Resend Code</span>
              </button>
            ) : (
              <span className="text-foreground/40 font-mono">Resend available in {timer}s</span>
            )}
          </p>

          <Link
            to="/employerregister"
            className="text-xs text-foreground/40 hover:text-foreground transition-colors"
          >
            ← Back to Employer Registration
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
