import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export const AuthContext = createContext({
  authStatus: "loading", // "loading" | "authenticated" | "unauthenticated"
  role: null,           // "jobseeker" | "employer" | "admin" | null
  user: null,           // Candidate user object or null
  employer: null,       // Employer object or null
  admin: null,          // Admin object or null
  token: null,          // Current token or null
  isProfileComplete: true,
  loginUser: () => {},
  loginEmployer: () => {},
  loginAdmin: () => {},
  logout: () => {},
  updateUser: () => {},
  updateEmployer: () => {},
  refreshAuth: () => {},
});

export const AuthProvider = ({ children }) => {
  const [authStatus, setAuthStatus] = useState("loading");
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true);

  const initAuth = useCallback(() => {
    try {
      const adminInfoStr = localStorage.getItem("adminInfo");
      const employerInfoStr = localStorage.getItem("employerInfo");
      const userInfoStr = localStorage.getItem("userInfo");
      const userToken = localStorage.getItem("userToken");
      const employerToken = localStorage.getItem("employerToken");

      // 1. Check Admin session
      if (adminInfoStr) {
        const parsedAdmin = JSON.parse(adminInfoStr);
        if (parsedAdmin && parsedAdmin.token) {
          setAdmin(parsedAdmin);
          setRole("admin");
          setToken(parsedAdmin.token);
          setAuthStatus("authenticated");
          setIsProfileComplete(true);
          return;
        }
      }

      // 2. Check Employer session
      if (employerInfoStr) {
        const parsedEmployer = JSON.parse(employerInfoStr);
        const activeToken = employerToken || parsedEmployer?.token;
        if (activeToken) {
          setEmployer(parsedEmployer);
          setRole("employer");
          setToken(activeToken);
          setIsProfileComplete(parsedEmployer.isProfileComplete !== false);
          setAuthStatus("authenticated");
          return;
        }
      }

      // 3. Check Jobseeker / Candidate session
      if (userInfoStr) {
        const parsedUser = JSON.parse(userInfoStr);
        const activeToken = userToken || parsedUser?.token;
        if (activeToken) {
          setUser(parsedUser);
          setRole("jobseeker");
          setToken(activeToken);
          setIsProfileComplete(parsedUser.isProfileComplete !== false);
          setAuthStatus("authenticated");
          return;
        }
      }

      // No active session
      setAdmin(null);
      setEmployer(null);
      setUser(null);
      setRole(null);
      setToken(null);
      setIsProfileComplete(true);
      setAuthStatus("unauthenticated");
    } catch (err) {
      console.error("Auth initialization parse error:", err);
      setAuthStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const loginUserHandler = useCallback((arg1, arg2) => {
    const data = (typeof arg1 === "object" && arg1 !== null) ? arg1 : (arg2 || {});
    const activeToken = (typeof arg1 === "string" ? arg1 : null) || data.token || localStorage.getItem("userToken");
    const payload = { ...data, token: activeToken };

    if (activeToken) {
      localStorage.setItem("userToken", activeToken);
    }
    localStorage.setItem("userInfo", JSON.stringify(payload));
    setUser(payload);
    setRole("jobseeker");
    setToken(activeToken);
    setIsProfileComplete(payload.isProfileComplete !== false);
    setAuthStatus("authenticated");
  }, []);

  const loginEmployerHandler = useCallback((arg1, arg2) => {
    const data = (typeof arg1 === "object" && arg1 !== null) ? arg1 : (arg2 || {});
    const activeToken = (typeof arg1 === "string" ? arg1 : null) || data.token || localStorage.getItem("employerToken");
    const payload = { ...data, token: activeToken };

    if (activeToken) {
      localStorage.setItem("employerToken", activeToken);
    }
    localStorage.setItem("employerInfo", JSON.stringify(payload));
    setEmployer(payload);
    setRole("employer");
    setToken(activeToken);
    setIsProfileComplete(payload.isProfileComplete !== false);
    setAuthStatus("authenticated");
  }, []);

  const loginAdminHandler = useCallback((arg1, arg2) => {
    const data = (typeof arg1 === "object" && arg1 !== null) ? arg1 : (arg2 || {});
    const activeToken = (typeof arg1 === "string" ? arg1 : null) || data.token || localStorage.getItem("adminToken");
    const payload = { ...data, token: activeToken };

    if (activeToken) {
      localStorage.setItem("adminToken", activeToken);
    }
    localStorage.setItem("adminInfo", JSON.stringify(payload));
    setAdmin(payload);
    setRole("admin");
    setToken(activeToken);
    setIsProfileComplete(true);
    setAuthStatus("authenticated");
  }, []);

  const logoutHandler = useCallback(() => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("employerToken");
    localStorage.removeItem("employerInfo");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");

    setUser(null);
    setEmployer(null);
    setAdmin(null);
    setRole(null);
    setToken(null);
    setIsProfileComplete(true);
    setAuthStatus("unauthenticated");
  }, []);

  const updateUserHandler = useCallback((updates) => {
    setUser((prev) => {
      const nextUser = { ...(prev || {}), ...updates };
      localStorage.setItem("userInfo", JSON.stringify(nextUser));
      if (updates.isProfileComplete !== undefined) {
        setIsProfileComplete(updates.isProfileComplete);
      }
      return nextUser;
    });
  }, []);

  const updateEmployerHandler = useCallback((updates) => {
    setEmployer((prev) => {
      const nextEmployer = { ...(prev || {}), ...updates };
      localStorage.setItem("employerInfo", JSON.stringify(nextEmployer));
      if (updates.isProfileComplete !== undefined) {
        setIsProfileComplete(updates.isProfileComplete);
      }
      return nextEmployer;
    });
  }, []);

  const authContextValue = useMemo(
    () => ({
      authStatus,
      role,
      user,
      employer,
      admin,
      token,
      isProfileComplete,
      loginUser: loginUserHandler,
      loginEmployer: loginEmployerHandler,
      loginAdmin: loginAdminHandler,
      logout: logoutHandler,
      updateUser: updateUserHandler,
      updateEmployer: updateEmployerHandler,
      refreshAuth: initAuth,
    }),
    [
      authStatus,
      role,
      user,
      employer,
      admin,
      token,
      isProfileComplete,
      loginUserHandler,
      loginEmployerHandler,
      loginAdminHandler,
      logoutHandler,
      updateUserHandler,
      updateEmployerHandler,
      initAuth,
    ]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
