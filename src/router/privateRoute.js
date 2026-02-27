import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, requiredRole = null }) {
  const { isAuthenticated, role } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If a specific role is required, check if user has that role
  if (requiredRole && role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const fallbackPath =
      role === "super_admin"
        ? "/super_admin/dashboard"
        : "/school_admin/dashboard";
    return <Navigate to={fallbackPath} />;
  }

  return children;
}
