import { API_BASE_URL } from "../config/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import login from "../assets/register.jpg";

export default function UserRegister() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
        { name: "Italy", code: "+39", flag: "🇮🇹" },
        { name: "Spain", code: "+34", flag: "🇪🇸" },
        { name: "Netherlands", code: "+31", flag: "🇳🇱" },
        { name: "Brazil", code: "+55", flag: "🇧🇷" },
        { name: "Mexico", code: "+52", flag: "🇲🇽" },
        { name: "Argentina", code: "+54", flag: "🇦🇷" },
        { name: "Chile", code: "+56", flag: "🇨🇱" },
        { name: "China", code: "+86", flag: "🇨🇳" },
        { name: "Japan", code: "+81", flag: "🇯🇵" },
        { name: "South Korea", code: "+82", flag: "🇰🇷" },
        { name: "Singapore", code: "+65", flag: "🇸🇬" },
        { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
        { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
        { name: "Israel", code: "+972", flag: "🇮🇱" },
        { name: "South Africa", code: "+27", flag: "🇿🇦" },
        { name: "Nigeria", code: "+234", flag: "🇳🇬" },
        { name: "Egypt", code: "+20", flag: "🇪🇬" },
    ];

    const handlePhoneChange = (e) => {
        // Strip any non-digit characters
        const digits = e.target.value.replace(/\D/g, "");
        if (countryCode === "+91") {
            // Strictly cap at 10 digits for Indian numbers
            if (digits.length <= 10) {
                setPhone(digits);
            }
        } else {
            // Cap at 15 digits for international
            if (digits.length <= 15) {
                setPhone(digits);
            }
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
            setError(err.response?.data?.message || "Registration failed. Please check your details and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 bg-cover bg-center bg-no-repeat p-4" style={{ backgroundImage: `url(${login})` }}>
            <div className="w-full max-w-md p-5 sm:p-8 space-y-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Candidate Registration</h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Create your profile and start applying for jobs</p>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg text-center" role="alert">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                    {/* Name */}
                    <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-slate-300">Full Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. Rahul Sharma"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white text-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-slate-300">Email Address *</label>
                        <input
                            type="email"
                            placeholder="e.g. rahul@example.com"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-slate-300">Password * (min. 6 chars)</label>
                        <input
                            type="password"
                            placeholder="Enter a secure password"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-slate-300">
                            Mobile Number * {countryCode === "+91" && <span className="text-xs font-normal text-gray-500">(10 digits)</span>}
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={countryCode}
                                onChange={handleCountryCodeChange}
                                className="w-28 sm:w-32 shrink-0 border border-gray-300 rounded-lg px-2 py-2.5 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {countryCodes.map((country) => (
                                    <option key={country.name} value={country.code}>
                                        {country.flag} {country.code}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder={countryCode === "+91" ? "10-digit number" : "Mobile number"}
                                className="flex-1 min-w-0 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white text-sm tracking-wide"
                                value={phone}
                                onChange={handlePhoneChange}
                                maxLength={countryCode === "+91" ? 10 : 15}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-[0.99] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                    >
                        {loading ? "Creating Account..." : "Register as Candidate"}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
