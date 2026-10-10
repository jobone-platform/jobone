import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserTie, FaBuilding } from "react-icons/fa";
import BackgroundJoin from "../components/BackgroundJoin";

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
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint =
        activeTab === "employer"
          ? "https://jobone-mrpy.onrender.com/employer/forgot-password"
          : "https://jobone-mrpy.onrender.com/user/forgot-password";

      const { data } = await axios.post(endpoint, { email });
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint =
        activeTab === "employer"
          ? "https://jobone-mrpy.onrender.com/employer/reset-password"
          : "https://jobone-mrpy.onrender.com/user/reset-password";

      const { data } = await axios.post(endpoint, { email, otp, newPassword });
      setMessage(data.message);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen bg-slate-950 font-sans p-4 sm:p-8 overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-slate-950 pointer-events-none">
        <div className="opacity-50">
          <BackgroundJoin />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl mt-8 mb-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-white mb-2">
              Forgot Password
            </h2>
            <p className="text-slate-400 text-sm">
              {step === 1 ? "Enter your email to receive a reset code." : "Enter your code and new password."}
            </p>
          </div>

          {step === 1 && (
            <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/10">
              <button
                onClick={() => {
                  setActiveTab("user");
                  setError("");
                  setMessage("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "user"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FaUserTie /> Jobseeker
              </button>
              <button
                onClick={() => {
                  setActiveTab("employer");
                  setError("");
                  setMessage("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "employer"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FaBuilding /> Employer
              </button>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl mb-4 text-center">
              {message}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm rounded-xl p-3.5 outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-sm mt-2 transition-all shadow-lg ${
                  activeTab === "user"
                    ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
                    : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
                } disabled:opacity-50`}
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm rounded-xl p-3.5 outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm rounded-xl p-3.5 outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !otp || !newPassword}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-sm mt-2 transition-all shadow-lg ${
                  activeTab === "user"
                    ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
                    : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
                } disabled:opacity-50`}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <p className="text-center text-slate-400 text-sm mt-6">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
