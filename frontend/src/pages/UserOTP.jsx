// src/pages/UserVerifyOTP.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const UserVerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If registration page passed email through navigate()
  const initialEmail = location.state?.email;

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    try {
      setLoading(true);
      await axios.post("https://jobone-mrpy.onrender.com/user/resend-otp", { email });
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
        "https://jobone-mrpy.onrender.com/user/verifyotp",
        { email, otp }
      );
      // Save JWT token in localStorage
      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userInfo", JSON.stringify(res.data));
      setMessage("✅ Account verified successfully! Redirecting...");
      setTimeout(() => navigate("/editprofile2"), 1500);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "❌ Invalid or expired OTP. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-[400px]">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-600 mb-4 text-sm">
          Please enter the 6-digit code sent to your email to verify your
          account.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!initialEmail}
              className={`w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none ${initialEmail ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              OTP Code
            </label>
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

export default UserVerifyOTP;
