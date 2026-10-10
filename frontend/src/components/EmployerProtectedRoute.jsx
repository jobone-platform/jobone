import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const EmployerProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState("loading");
  const storedData = localStorage.getItem("employerInfo");
  const location = useLocation();

  useEffect(() => {
    const verifyStatus = async () => {
      const storedData = localStorage.getItem("employerInfo");
      if (!storedData) {
        setIsAuthorized("unauthorized");
        return;
      }

      try {
        const { token } = JSON.parse(storedData);
        await axios.get(
          "https://jobone-mrpy.onrender.com/employer/check-eligibility",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setIsAuthorized("authorized");
      } catch (err) {
        console.error("Auth check failed:", err.response?.status);

        // Only redirect to login if the token is 401 (Invalid/Expired)
        // If it is 403 (Forbidden/Frozen), allow access so the page can show the warning
        if (err.response?.status === 401) {
          localStorage.removeItem("employerInfo");
          setIsAuthorized("unauthorized");
        } else {
          // Allow access even if 403 or 500 so they don't get kicked out
          setIsAuthorized("authorized");
        }
      }
    };
    verifyStatus();
  }, [storedData]);

  if (isAuthorized === "loading")
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (isAuthorized === "unauthorized") return <Navigate to="/login" />;

  // FACT: If they registered via Google and haven't filled required fields, force redirect
  if (storedData) {
    try {
      const employerInfo = JSON.parse(storedData);
      if (employerInfo.isProfileComplete === false) {
         if (location.pathname !== "/employereditprofile" && location.pathname !== "/employerotp/employereditprofile2") {
             return <Navigate to="/employereditprofile" replace state={{ showWarning: true }} />;
         }
      }
    } catch (e) {
      console.error(e);
    }
  }

  return children;
};
export default EmployerProtectedRoute;
