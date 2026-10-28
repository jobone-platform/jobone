import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";

import { useAuth } from "../routes/Context";

const UserVerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();

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
      await axios.post(`${API_BASE_URL}/user/resend-otp`, { email: email.trim().toLowerCase() });
      setMessage("A new 6-digit OTP code has been sent to your email.");
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
      setMessage("Please enter your registered email address.");
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

      // Update centralized auth state
      loginUser(res.data.token, res.data);

      setMessage(
        res.data.alreadyVerified
          ? "Account is already verified! Redirecting to your dashboard..."
          : "Account verified successfully! Redirecting to complete your profile..."
      );
      setIsError(false);

      setTimeout(() => navigate(res.data.isProfileComplete ? "/userdashboard" : "/editprofile2"), 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid or expired OTP. Please try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-5 sm:p-8 w-full max-w-md border border-gray-100 dark:border-gray-700 transition-colors">
        <h2 className="text-2xl font-extrabold text-center text-indigo-700 dark:text-indigo-400 mb-2">
          Verify Your Candidate Email
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6 text-sm">
          Please enter the 6-digit verification code sent to your email inbox.
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
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!initialEmail}
              className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition ${
                initialEmail
                  ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600"
                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-semibold">
              6-Digit OTP Code
            </label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={otp}
              onChange={handleOtpChange}
              required
              maxLength="6"
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none tracking-widest text-center text-xl font-mono font-bold"
              placeholder="••••••"
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-lg transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? "Verifying Code..." : "Verify & Continue"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
          <p>
            Didn't receive the email?{" "}
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend Code"}
              </button>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 font-medium">
                Resend in {timer}s
              </span>
            )}
          </p>
          <div className="mt-3">
            <Link to="/userregister" className="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
              ← Back to Registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserVerifyOTP;
