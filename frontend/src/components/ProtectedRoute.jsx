import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem("userToken");
    const userInfoStr = localStorage.getItem("userInfo");
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (userInfoStr) {
        try {
            const userInfo = JSON.parse(userInfoStr);
            // FACT: If they registered via Google and haven't filled required fields, force redirect
            if (userInfo.isProfileComplete === false) {
                // Ensure we do not trap them in a redirect loop if they are already on the edit pages
                if (location.pathname !== "/editprofile" && location.pathname !== "/editprofile2") {
                    return <Navigate to="/editprofile" replace state={{ showWarning: true }} />;
                }
            }
        } catch (e) {
            console.error("Error parsing userInfo", e);
        }
    }

    return children;
}
