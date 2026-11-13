import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { KeyRound, Mail, ArrowRight, Loader2, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../routes/Context";
import AuthLayout from "../components/AuthLayout";

export default function UserOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();

  const initialEmail = location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cancelling, setCancelling] = useState(false);
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

  // Handle browser back button: discard pending registration
  useEffect(() => {
    const handlePopState = () => {
      if (email) {
        try {
          if (navigator.sendBeacon) {
            const blob = new Blob(
              [JSON.stringify({ email: email.trim().toLowerCase() })],
              { type: "application/json" }
            );
            navigator.sendBeacon(`${API_BASE_URL}/user/cancel-registration`, blob);
          } else {
            axios.post(`${API_BASE_URL}/user/cancel-registration`, {
              email: email.trim().toLowerCase(),
            });
          }
        } catch (_err) {
          /* ignore */
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [email]);

  const handleCancelRegistration = async () => {
    if (cancelling) return;
    setCancelling(true);
    try {
      if (email) {
        await axios.post(`${API_BASE_URL}/user/cancel-registration`, {
          email: email.trim().toLowerCase(),
        });
      }
    } catch (_err) {
      /* ignore */
    } finally {
      navigate("/userregister", { replace: true });
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
  };

  const handleResend = async () => {
    if (resending) return;
    if (!email.trim()) {
      setMessage("Please provide your email address to resend the code.");
      setIsError(true);
      return;
    }
    try {
      setResending(true);
      setMessage("");
      setIsError(false);
      await axios.post(`${API_BASE_URL}/user/resend-otp`, { email: email.trim().toLowerCase() });
      setMessage("A fresh 6-digit verification code has been dispatched to your email inbox.");
      setIsError(false);
      setOtp("");
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend OTP. Please try again.");
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
      setMessage("Please enter your registered candidate email address.");
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
      const res = await axios.post(`${API_BASE_URL}/user/verifyotp`, {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      loginUser(res.data.token, res.data);

      setMessage(
        res.data.alreadyVerified
          ? "Account verified! Redirecting to your candidate dashboard..."
          : "Verification successful! Welcome to JobOne. Redirecting to dashboard..."
      );
      setIsError(false);

      setTimeout(() => navigate("/userdashboard"), 1100);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        "Invalid or expired verification code. If abandoned or expired, please register again.";
      setMessage(errMsg);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  // If user lands directly on this route with no registration session
  if (!email && !initialEmail) {
    return (
      <AuthLayout
        title="Candidate Verification"
        subtitle="No active registration session found"
        badge="Session Inactive"
        visualHeading="Start your candidate journey."
        visualSubheading="Accounts are securely created only after verifying your email. Sessions automatically expire after 10 minutes of inactivity."
      >
        <div className="text-center py-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] mx-auto flex items-center justify-center text-[var(--theme-accent-silver)]">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[var(--theme-text)]">
              No Pending Verification
            </h3>
            <p className="text-xs text-[var(--theme-text-muted)] max-w-sm mx-auto">
              You must complete the registration form to receive a verification code. Inactive registrations are discarded.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/userregister"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--theme-text)] text-[var(--theme-bg)] text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <span>Start Registration</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify Candidate Email"
      subtitle={`We've dispatched a 6-digit verification code to ${email ? email : "your email"}`}
      badge="Security Verification"
      visualHeading="Verified candidates earn priority review."
      visualSubheading="Completing your email verification unlocks instant application routing, verified badges, and automated recruiter notifications."
      metrics={[
        { value: "100%", label: "Encrypted & Compliant" },
        { value: "0 Spam", label: "Direct-only Recruiters" },
        { value: "Instant", label: "Dashboard Access" },
      ]}
      quote={{
        text: "The verification process confirms your authenticity to top-tier engineering organizations.",
        author: "JobOne Trust & Security",
        role: "Compliance Engineering",
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
            Registered Email Address
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
              placeholder="candidate@example.com"
            />
            <Mail size={16} className="absolute left-3.5 top-3 text-foreground/40 pointer-events-none" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-mono tracking-wider uppercase text-foreground/70">
              6-Digit Verification Code
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
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <span>Verify & Launch Dashboard</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <div className="pt-3 text-center border-t border-border flex flex-col items-center gap-2">
          <p className="text-xs text-foreground/60">
            Didn't receive the email?{" "}
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

          <button
            type="button"
            onClick={handleCancelRegistration}
            disabled={cancelling}
            className="text-xs text-foreground/40 hover:text-foreground transition-colors cursor-pointer inline-flex items-center gap-1 mt-1"
          >
            {cancelling ? <Loader2 size={12} className="animate-spin" /> : null}
            <span>← Cancel &amp; Start Over</span>
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
