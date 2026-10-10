import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { FaUserTie, FaBuilding } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import BackgroundJoin from "../components/BackgroundJoin";

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = activeTab === "user" 
      ? localStorage.getItem("lastJobseekerEmail") 
      : localStorage.getItem("lastEmployerEmail");
    
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      setEmail("");
    }
    setPassword("");
  }, [activeTab]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const endpoint =
        activeTab === "employer"
          ? "https://jobone-mrpy.onrender.com/employer/google-login"
          : "https://jobone-mrpy.onrender.com/user/google-login";

      const { data } = await axios.post(endpoint, {
        token: credentialResponse.credential,
      });

      if (activeTab === "employer") {
        localStorage.setItem("employerToken", data.token);
        localStorage.setItem("employerInfo", JSON.stringify(data));

        if (data.isProfileComplete === false) {
          navigate("/employereditprofile", { state: { showWarning: true } });
        } else {
          navigate("/employerdashboard");
        }
      } else {
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userInfo", JSON.stringify(data));

        if (data.isProfileComplete === false) {
          navigate("/editprofile", { state: { showWarning: true } });
        } else {
          navigate("/userdashboard");
        }
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      setError("Google Login failed. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        activeTab === "employer"
          ? "https://jobone-mrpy.onrender.com/employer/login"
          : "https://jobone-mrpy.onrender.com/user/login";

      const { data } = await axios.post(endpoint, { email, password });

      if (activeTab === "employer") {
        localStorage.setItem("employerToken", data.token);
        localStorage.setItem("employerInfo", JSON.stringify(data));
        localStorage.setItem("lastEmployerEmail", email);
        navigate("/employerdashboard");
      } else {
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userInfo", JSON.stringify(data));
        localStorage.setItem("lastJobseekerEmail", email);
        navigate("/userdashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // FACT: Replaced 100dvh with min-h-screen to prevent the desktop band issue.
    // Removed unnecessary w-full that conflicts with Windows scrollbars.
    // UPDATE: Now fully fixed to screen to prevent any scrolling.
    <div className={`fixed inset-0 flex flex-col justify-center items-center font-sans p-4 sm:p-8 overflow-hidden transition-colors duration-700 ${
      activeTab === "employer" ? "bg-[#0a0b22]" : "bg-slate-950"
    }`}>
      {/* FACT: The background is pinned directly to the screen viewport */}
      <div className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-700 ${
        activeTab === "employer" ? "bg-[#0a0b22]" : "bg-slate-950"
      }`}>
        <div className="absolute inset-0 z-0">
          <BackgroundJoin theme={activeTab} />
        </div>
      </div>

      {/* Admin Portal Button */}
      <button
        type="button"
        onClick={() => navigate("/admin/login")}
        className="fixed top-12 right-4 sm:top-14 sm:right-8 z-50 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-full px-4 py-2 text-xs font-bold transition-all backdrop-blur-md shadow-lg"
      >
        <span className="w-2 h-2 rounded-full bg-red-500/80"></span>
        Admin
      </button>

      <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-400 text-sm">
              Sign in to continue your journey.
            </p>
          </div>

          <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/10">
            <button
              onClick={() => {
                setActiveTab("user");
                setError("");
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

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl mb-4 text-center">
              {error}
            </div>
          )}

          <div className="flex justify-center w-full mb-2">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login Failed")}
              theme="filled_black"
              size="large"
              text="continue_with"
            />
          </div>



          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                id={activeTab === "user" ? "user-email" : "employer-email"}
                name={activeTab === "user" ? "user-email" : "employer-email"}
                autoComplete="username"
                type="email"
                placeholder="Email Address"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm rounded-xl p-3.5 outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="relative">
                <input
                  id={activeTab === "user" ? "user-password" : "employer-password"}
                  name={activeTab === "user" ? "user-password" : "employer-password"}
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm rounded-xl p-3.5 outline-none focus:border-blue-500 focus:bg-white/10 transition-colors pr-12 hide-password-toggle"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-200 focus:outline-none ${
                    activeTab === "user"
                      ? "text-blue-500 hover:bg-blue-500 hover:text-white"
                      : "text-indigo-500 hover:bg-indigo-500 hover:text-white"
                  }`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <style>{`
                .hide-password-toggle::-ms-reveal,
                .hide-password-toggle::-ms-clear {
                  display: none;
                }
              `}</style>
              <div className="text-right mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-sm mt-2 transition-all shadow-lg ${
                activeTab === "user"
                  ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
              } disabled:opacity-50`}
            >
              {loading
                ? "Authenticating..."
                : activeTab === "employer"
                  ? "Sign In as Employer"
                  : "Sign In"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            New to JOBONE? Register{" "}
            <Link
              to="/userregister"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Jobseeker
            </Link>{" "}
            <span className="text-slate-600 mx-1">/</span>{" "}
            <Link
              to="/employerregister"
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              Employer
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
