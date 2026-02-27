import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("radiant-admin-token");
    const storedRole = localStorage.getItem("user-role");
    const storedUser = localStorage.getItem("user-data");

    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token, userRole, userData) => {
    setToken(token);
    setRole(userRole);
    setUser(userData);

    // Store in localStorage for persistence
    localStorage.setItem("radiant-admin-token", token);
    localStorage.setItem("user-role", userRole);
    localStorage.setItem("user-data", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);

    // Clear localStorage
    localStorage.removeItem("radiant-admin-token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user-role");
    localStorage.removeItem("user-data");
  };

  const isAuthenticated = !!token;
  const isSuperAdmin = role === "super_admin";
  const isSchoolAdmin = role === "school_admin";

  const value = {
    user,
    role,
    token,
    isLoading,
    isAuthenticated,
    isSuperAdmin,
    isSchoolAdmin,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
