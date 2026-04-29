import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { isAuthenticated, role } = useAuth();

  // If already authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    const dashboardPath =
      role === "super_admin"
        ? "/super_admin/dashboard"
        : role === "driver"
          ? "/driver/dashboard"
          : role === "school"
            ? "/school_admin/dashboard"
            : "/login";
    return <Navigate to={dashboardPath} />;
  }

  // If not authenticated, show the public page (e.g., login page)
  return children;
}
