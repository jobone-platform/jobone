import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";

import { useAuth } from "../routes/Context";

const EmployerVerifyOTP = () => {
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
      setMessage("Please provide your email address to resend OTP.");
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
      setMessage("A new 6-digit OTP code has been sent to your business email.");
      setIsError(false);
      setOtp("");
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to resend OTP. Please try again."
      );
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
      setMessage("Please enter your registered business email.");
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

      // Save token & employerInfo in centralized AuthContext & localStorage with standardized fields
      const employerData = {
        ...res.data,
        id: res.data.employerId || res.data.id,
        employerId: res.data.employerId || res.data.id,
        email: email.trim().toLowerCase(),
      };

      loginEmployer(res.data.token, employerData);

      setMessage(
        res.data.alreadyVerified
          ? "Account is already verified! Redirecting to dashboard..."
          : "Employer account verified successfully! Redirecting..."
      );
      setIsError(false);

      setTimeout(() => navigate(res.data.isProfileComplete ? "/employerdashboard" : "/employereditprofile"), 1200);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Invalid or expired OTP. Please try again."
      );
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-5 sm:p-8 w-full max-w-md border border-gray-100 dark:border-gray-700 transition-colors">
        <h2 className="text-2xl font-extrabold text-center text-indigo-600 dark:text-indigo-400 mb-2">
          Verify Employer Account
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6 text-sm">
          Enter the 6-digit verification code sent to your business email.
        </p>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm mb-4 text-center font-medium ${
              isError
                ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800"
                : "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-semibold">
              Business Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!initialEmail}
              className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition ${
                initialEmail
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-600"
                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              }`}
              placeholder="e.g. contact@company.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-semibold">
              6-Digit OTP Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={otp}
              onChange={handleOtpChange}
              required
              maxLength={6}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none tracking-widest text-center text-xl font-mono font-bold"
              placeholder="••••••"
              autoComplete="one-time-code"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full font-semibold py-2.5 rounded-lg text-white transition shadow-md ${
              loading || otp.length !== 6
                ? "bg-indigo-400 dark:bg-indigo-500/50 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]"
            }`}
          >
            {loading ? "Verifying..." : "Verify & Complete Registration"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Didn't receive the OTP?{" "}
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                {resending ? "Sending..." : "Resend OTP"}
              </button>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 font-medium">
                Resend in {timer}s
              </span>
            )}
          </p>
          <div className="mt-3">
            <Link
              to="/employerregister"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              ← Back to Registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerVerifyOTP;
