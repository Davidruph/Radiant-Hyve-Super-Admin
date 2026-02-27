import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Storage utility using sessionStorage (cleared on browser close - more secure)
const STORAGE_KEYS = {
  TOKEN: "radiant-admin-token",
  ROLE: "user-role",
  USER: "user-data"
};

const storage = {
  setToken: (token) => sessionStorage.setItem(STORAGE_KEYS.TOKEN, token),
  getToken: () => sessionStorage.getItem(STORAGE_KEYS.TOKEN),
  removeToken: () => sessionStorage.removeItem(STORAGE_KEYS.TOKEN),

  setRole: (role) => sessionStorage.setItem(STORAGE_KEYS.ROLE, role),
  getRole: () => sessionStorage.getItem(STORAGE_KEYS.ROLE),
  removeRole: () => sessionStorage.removeItem(STORAGE_KEYS.ROLE),

  setUser: (user) =>
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
  getUser: () => {
    const user = sessionStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },
  removeUser: () => sessionStorage.removeItem(STORAGE_KEYS.USER),

  clearAll: () => {
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.ROLE);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from sessionStorage on mount
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

    // Store in sessionStorage (cleared on browser close)
    storage.setToken(token);
    storage.setRole(userRole);
    storage.setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);

    // Clear sessionStorage
    storage.clearAll();
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
