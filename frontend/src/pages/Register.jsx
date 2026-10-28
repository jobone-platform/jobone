import { API_BASE_URL } from "../config/api";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import login from "../assets/login.jpg";


import { useAuth } from "../routes/Context";

const RegisterOption = () => {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [error, setError] = React.useState("");

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const { data } = await axios.post(`${API_BASE_URL}/user/google-login`, {
                token: credentialResponse.credential,
            });

            loginUser(data.token, data);

            if (data.isProfileComplete === false) {
                navigate("/editprofile", { state: { showWarning: true } });
            } else {
                navigate("/userdashboard");
            }
        } catch (err) {
            console.error("Google Login Error:", err);
            setError("Google Registration failed. Please try again.");
        }
    };

    const handleEmailSignup = () => {
        navigate("/userregister"); // 👈 goes to your existing email registration page
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4" style={{ backgroundImage: `url(${login})` }}>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    Sign Up & Apply to Verified Jobs
                </h1>
                <p className="text-gray-600 dark:text-slate-300 text-lg">
                    Connect with active hiring employers on <span className="font-semibold">JobOne</span>
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 shadow-lg rounded-xl p-8 w-full max-w-md text-center">
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
                    className="w-full py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium text-gray-700 dark:text-slate-100"
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

export default RegisterOption;
