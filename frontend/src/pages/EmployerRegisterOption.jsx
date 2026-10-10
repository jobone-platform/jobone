import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import login from "../assets/login.jpg";


const EmployerRegisterOption = () => {
    const navigate = useNavigate();

    const [error, setError] = React.useState("");

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const { data } = await axios.post("https://jobone-mrpy.onrender.com/employer/google-login", {
                token: credentialResponse.credential,
            });

            localStorage.setItem("employerToken", data.token);
            localStorage.setItem("employerInfo", JSON.stringify(data));

            if (data.isProfileComplete === false) {
                navigate("/employereditprofile", { state: { showWarning: true } });
            } else {
                navigate("/employerdashboard");
            }
        } catch (err) {
            console.error("Google Login Error:", err);
            setError("Google Registration failed. Please try again.");
        }
    };

    const handleEmailSignup = () => {
        navigate("/employerregister"); // 👈 goes to your existing email registration page
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4" style={{ backgroundImage: `url(${login})` }}>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    Sign-up and apply for free
                </h1>
                <p className="text-gray-600 text-lg">
                    3,00,000+ employers hiring on <span className="font-semibold">First Job</span>
                </p>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {/* Google Sign-up */}
                <div className="mb-4 flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Google Signup Failed")}
                        text="signup_with"
                        shape="rectangular"
                        width="100%"
                    />
                </div>

                {/* OR Divider */}
                <button
                    onClick={handleEmailSignup}
                    className="w-full py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition font-medium text-gray-700"
                >
                    Sign up with Email
                </button>


                {/* Terms */}
                <p className="text-sm text-gray-500 mt-4">
                    By signing up, you agree to our{" "}
                    <Link to="/terms" className="text-blue-600 hover:underline">
                        Terms and Conditions
                    </Link>.
                </p>

                {/* Login link */}
                <p className="mt-3 text-gray-600 text-sm">
                    Already registered?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default EmployerRegisterOption;
