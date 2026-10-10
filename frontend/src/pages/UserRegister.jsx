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
    const [error, setError] = useState("");
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


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("https://jobone-mrpy.onrender.com/user/register", {
                name,
                email,
                password,
                phone,
            });
            // Assuming backend sends back a token
            navigate("/userotp", { state: { email } });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${login})` }}>
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Register</h2>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Name */}
                    <div>
                        <label className="block mb-1 text-gray-600">Name</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block mb-1 text-gray-600">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block mb-1 text-gray-600">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block mb-1 text-gray-600">Phone Number</label>
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
                            placeholder="Enter your phone number"
                            className=" mx-6 px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className=" w-full py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        Register
                    </button>
                </form>

                <p className="text-sm text-center text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
