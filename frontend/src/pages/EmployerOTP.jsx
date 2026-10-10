// src/pages/VerifyOTP.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If you passed email from register page
  const initialEmail = location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    try {
      setLoading(true);
      await axios.post("https://jobone-mrpy.onrender.com/employer/resend-otp", { email });
      setMessage("✅ A new OTP has been sent to your email!");
      setOtp("");
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "https://jobone-mrpy.onrender.com/employer/verifyotp",
        { email, otp }
      );
      // Save token in localStorage
      localStorage.setItem("employerToken", res.data.token);
      localStorage.setItem("employerInfo", JSON.stringify(res.data));

      setMessage("✅ Verification successful! Redirecting...");
      setTimeout(() => navigate("/employereditprofile"), 1500);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "❌ Invalid or expired OTP. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-100 to-blue-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-[400px]">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Verify Your Email
        </h2>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!initialEmail}
              className={`w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none ${initialEmail ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength="6"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none tracking-widest text-center text-lg"
              placeholder="Enter 6-digit code"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-700">{message}</p>
        )}

        <p className="text-center text-gray-500 mt-4 text-sm">
          Didn’t receive the code?{" "}
          <button
            onClick={handleResend}
            className="text-indigo-600 font-medium"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
