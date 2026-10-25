import { API_BASE_URL } from "../config/api";
import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const EmployerRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        userType: "Company",
        companyName: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [countryCode, setCountryCode] = useState("+91");

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMobileChange = (e) => {
        const digits = e.target.value.replace(/\D/g, "");
        if (countryCode === "+91") {
            if (digits.length <= 10) {
                setFormData((prev) => ({ ...prev, mobile: digits }));
            }
        } else {
            if (digits.length <= 15) {
                setFormData((prev) => ({ ...prev, mobile: digits }));
            }
        }
    };

    const handleCountryCodeChange = (e) => {
        const newCode = e.target.value;
        setCountryCode(newCode);
        if (newCode === "+91" && formData.mobile.length > 10) {
            setFormData((prev) => ({ ...prev, mobile: prev.mobile.slice(0, 10) }));
        }
    };

    const validateForm = () => {
        const fName = formData.firstName.trim();
        const lName = formData.lastName.trim();

        if (!fName || fName.length < 2) {
            return "First name must be at least 2 characters long.";
        }
        if (!lName || lName.length < 1) {
            return "Last name is required.";
        }

        const emailTrimmed = formData.email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
            return "Please enter a valid business email address.";
        }

        if (!formData.mobile) {
            return "Mobile number is required.";
        }

        if (countryCode === "+91") {
            if (formData.mobile.length !== 10) {
                return `Indian mobile number must be exactly 10 digits. Entered: ${formData.mobile.length} digit(s).`;
            }
            if (!/^[5-9]\d{9}$/.test(formData.mobile)) {
                return "Invalid Indian mobile number. Mobile numbers must start with 5, 6, 7, 8, or 9.";
            }
        } else {
            if (formData.mobile.length < 7 || formData.mobile.length > 15) {
                return `Mobile number must be between 7 and 15 digits. Entered: ${formData.mobile.length} digit(s).`;
            }
        }

        if (formData.userType === "Company") {
            if (!formData.companyName.trim()) {
                return "Company Name is required for company registrations.";
            }
        }

        if (!formData.password || formData.password.length < 6) {
            return "Password must be at least 6 characters long.";
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
            const payload = {
                name: fullName,
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                phone: formData.mobile.trim(),
                countryCode,
                userType: formData.userType,
                companyName: formData.userType === "Company" ? formData.companyName.trim() : "",
            };

            await axios.post(
                `${API_BASE_URL}/employer/register`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            setSuccess("Registration initiated! Redirecting to email verification...");
            setLoading(false);

            // Redirect to OTP verification page without storing unverified tokens
            setTimeout(() => navigate("/employerotp", { state: { email: formData.email.trim().toLowerCase() } }), 1200);
        } catch (err) {
            setLoading(false);
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to register. Please check your details and try again."
            );
        }
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-white">
            {/* LEFT SECTION: Animated background + heading */}
            <div className="relative flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-10">
                <Link to="/" className="absolute top-6 left-8 z-20 text-3xl font-extrabold tracking-wide hover:opacity-90 transition">
                    JOBONE
                </Link>
                {/* Floating shapes */}
                <motion.div
                    className="absolute top-10 left-10 w-28 h-28 bg-blue-300 rounded-full filter blur-2xl opacity-40"
                    animate={{ y: [0, 20, 0], x: [0, 15, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-16 right-20 w-36 h-36 bg-indigo-300 rounded-full filter blur-2xl opacity-40"
                    animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/3 w-20 h-20 bg-white rounded-full filter blur-lg opacity-20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Heading text */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Build Your Dream Team
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-md mx-auto">
                        Join hundreds of verified companies hiring faster with intelligent applicant matching.
                    </p>
                </motion.div>
            </div>

            {/* RIGHT SECTION: Form */}
            <div className="flex items-center justify-center p-6 sm:p-10 bg-gray-50">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                        Create Employer Account
                    </h2>
                    <p className="text-center text-sm text-gray-500 mb-6">
                        Post openings and connect with verified talent
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4 text-sm text-center">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="e.g. John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="e.g. Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Mobile Number * {countryCode === "+91" && <span className="font-normal text-gray-500">(10 digits)</span>}
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={countryCode}
                                    onChange={handleCountryCodeChange}
                                    className="w-32 border border-gray-300 rounded-lg px-2 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {countryCodes.map((country) => (
                                        <option key={country.name} value={country.code}>
                                            {country.flag} {country.code}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="tel"
                                    name="mobile"
                                    inputMode="numeric"
                                    placeholder={countryCode === "+91" ? "10-digit number" : "Mobile number"}
                                    value={formData.mobile}
                                    onChange={handleMobileChange}
                                    maxLength={countryCode === "+91" ? 10 : 15}
                                    required
                                    className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-wide"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Employer Type *</label>
                            <div className="grid grid-cols-2 gap-2 border border-gray-300 rounded-lg p-1.5 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, userType: "Company" })}
                                    className={`py-2 text-xs font-bold rounded-md transition ${
                                        formData.userType === "Company"
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    🏢 Registered Company
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, userType: "Recruiter" })}
                                    className={`py-2 text-xs font-bold rounded-md transition ${
                                        formData.userType === "Recruiter"
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    👤 Individual Recruiter
                                </button>
                            </div>
                        </div>

                        {formData.userType === "Company" && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Company / Organization Name *</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    placeholder="e.g. Acme Innovations Pvt Ltd"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Password * (min. 6 characters)</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Create a secure password"
                                value={formData.password}
                                onChange={handleChange}
                                minLength="6"
                                required
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 active:scale-[0.99] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {loading ? "Creating Account..." : "Create Employer Account"}
                        </button>

                        <p className="text-center text-sm text-gray-600 pt-2">
                            Already registered?{" "}
                            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                                Login here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmployerRegister;
