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
          // Only clear session and redirect if an authorization token was actually sent and rejected
          const sentAuth = Boolean(
            error.config?.headers?.Authorization || error.config?.headers?.authorization
          );
          if (sentAuth) {
            const isEmployerRequest =
              url.includes("/employer") || window.location.pathname.startsWith("/employer");
            if (isEmployerRequest) {
              localStorage.removeItem("employerInfo");
              localStorage.removeItem("employerToken");
            } else {
              localStorage.removeItem("userInfo");
              localStorage.removeItem("userToken");
            }

            const currentPath = window.location.pathname;
            const isPublicPage =
              currentPath === "/" ||
              currentPath === "/employer" ||
              ["/profile/", "/company/", "/jobs", "/companies", "/about", "/services", "/contact"].some(
                (p) => currentPath.startsWith(p)
              );

            if (!isPublicPage && !currentPath.includes("/login")) {
              window.location.href = isEmployerRequest ? "/login" : "/login";
            }
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
