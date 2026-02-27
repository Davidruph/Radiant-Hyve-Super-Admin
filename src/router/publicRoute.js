import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { isAuthenticated, role } = useAuth();

  // If already authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    const dashboardPath =
      role === "super_admin"
        ? "/super_admin/dashboard"
        : "/school_admin/dashboard";
    return <Navigate to={dashboardPath} />;
  }

  // If not authenticated, show the public page (e.g., login page)
  return children;
}
