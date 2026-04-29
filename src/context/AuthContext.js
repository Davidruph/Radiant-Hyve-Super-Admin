import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Storage utility using localStorage
const STORAGE_KEYS = {
  TOKEN: "radiant-admin-token",
  ROLE: "user-role",
  USER: "user-data"
};

const storage = {
  setToken: (token) => localStorage.setItem(STORAGE_KEYS.TOKEN, token),
  getToken: () => localStorage.getItem(STORAGE_KEYS.TOKEN),
  removeToken: () => localStorage.removeItem(STORAGE_KEYS.TOKEN),

  setRole: (role) => localStorage.setItem(STORAGE_KEYS.ROLE, role),
  getRole: () => localStorage.getItem(STORAGE_KEYS.ROLE),
  removeRole: () => localStorage.removeItem(STORAGE_KEYS.ROLE),

  setUser: (user) =>
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
  getUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },
  removeUser: () => localStorage.removeItem(STORAGE_KEYS.USER),

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = storage.getToken();
    const storedRole = storage.getRole();
    const storedUser = storage.getUser();

    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
      if (storedUser) {
        setUser(storedUser);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token, userRole, userData) => {
    setToken(token);
    setRole(userRole);
    setUser(userData);

    // Store in localStorage
    storage.setToken(token);
    storage.setRole(userRole);
    storage.setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);

    // Clear localStorage
    storage.clearAll();
  };

  const isAuthenticated = !!token;
  const isSuperAdmin = role === "super_admin";
  const isSchoolAdmin = role === "school_admin";
  const isDriver = role === "driver";

  const value = {
    user,
    role,
    token,
    isLoading,
    isAuthenticated,
    isSuperAdmin,
    isSchoolAdmin,
    isDriver,
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
