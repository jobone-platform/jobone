import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EmployerRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        userType: "",
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            // Prepare the backend payload
            const payload = {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                password: formData.password,
                phone: formData.mobile,
                companyName: formData.userType === "Company" ? formData.companyName : "",
            };

            const { data } = await axios.post(
                "https://jobone-mrpy.onrender.com/employer/register",
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            // Save token to localStorage
            localStorage.setItem("employerInfo", JSON.stringify(data));

            setLoading(false);

            // Redirect to Employer Dashboard after successful registration
            setTimeout(() => navigate("/employerotp", { state: { email: formData.email } }), 1500);
        } catch (err) {
            setLoading(false);
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to register. Please try again."
            );
        }
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-white">
            {/* LEFT SECTION: Animated background + heading */}
            <div className="relative flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 text-white p-10">
                <div className="absolute top-6 left-8 z-20 text-3xl font-bold tracking-wide cursor-pointer">
                    JOBONE
                </div>
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
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Build Your Dream Team
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-md mx-auto">
                        Join hundreds of companies hiring smarter. Post jobs and connect with top candidates effortlessly.
                    </p>
                </motion.div>
            </div>

            {/* RIGHT SECTION: Form (static) */}
            <div className="flex items-center justify-center p-10 bg-gray-50">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                        Create Employer Account
                    </h2>

                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-3 text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 text-green-700 p-3 rounded-md mb-3 text-center">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <input
                            type="email"
                            name="email"
                            placeholder="Email ID"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="w-25  border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            placeholder="Mobile Number"
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                            className=" mx-4 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <label className="block text-gray-600 mb-1">User Type</label>
                        <div className="w-full border border-gray-300 rounded-lg p-3">
                            <label className="mr-4">
                                <input
                                    type="radio"
                                    name="userType"
                                    value="Company"
                                    checked={formData.userType === "Company"}
                                    onChange={handleChange}
                                    required
                                    className="mr-2"
                                />
                                Company
                            </label>
                            <label className="mr-4">
                                <input
                                    type="radio"
                                    name="userType"
                                    value="Recruiter"
                                    checked={formData.userType === "Recruiter"}
                                    onChange={handleChange}
                                    required
                                    className="mr-2"
                                />
                                Individual
                            </label>
                        </div>
                        {formData.userType === "Company" && (
                            <>
                                <input
                                    type="text"
                                    name="companyName"
                                    placeholder="Company Name"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    name="companyEmail"
                                    placeholder="Company Email"
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </>
                            )}
                        <input
                            type="password"
                            name="password"
                            placeholder="Password (min 6 characters)"
                            value={formData.password}
                            onChange={handleChange}
                            minLength="6"
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            {loading ? "Creating Account..." : "Create Employer Account"}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            Already registered?{" "}
                            <a href="/login" className="text-blue-600 hover:underline">
                                Login
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmployerRegister;
