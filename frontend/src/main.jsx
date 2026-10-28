import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import "./index.css";
import App from "./App.jsx";

import { ThemeProvider, AuthProvider } from "./routes/Context.jsx";

// Configure reasonable request timeout (15s)
axios.defaults.timeout = 15000;

// Global interceptor for expired/invalid tokens
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      if (!url.includes("/login") && !url.includes("/register") && !url.includes("/verifyotp")) {
        if (url.includes("/admin") || window.location.pathname.startsWith("/admin")) {
          localStorage.removeItem("adminInfo");
          localStorage.removeItem("adminToken");
          if (!window.location.pathname.includes("/admin/login")) {
            window.location.href = "/admin/login";
          }
        } else {
          localStorage.removeItem("userInfo");
          localStorage.removeItem("userToken");
          localStorage.removeItem("employerInfo");
          localStorage.removeItem("employerToken");
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
    <StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>
  </GoogleOAuthProvider>
);
