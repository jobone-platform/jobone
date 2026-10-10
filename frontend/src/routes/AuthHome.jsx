import { Navigate } from "react-router-dom";
import Home from "../pages/Home";
import UserDashboard from "../pages/UserDashboard";
import EmployerDashboard from "../pages/EmployerDashboard";

const AuthHome = () => {
    const userToken = localStorage.getItem("userToken");
    const employerToken = localStorage.getItem("employerToken");

    if (userToken) {
        return <UserDashboard />;
    }

    if (employerToken) {
        return <EmployerDashboard />;
    }

    // not logged in
    return <Home />;
};

export default AuthHome;

