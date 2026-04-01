import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { OvalLoader } from "../base-component/Loader/Loader";

export default function PrivateRoute({ children, requiredRole = null }) {
  const { isAuthenticated, role, isLoading } = useAuth();

  // Show loader while checking authentication
  if (isLoading) {
    return <OvalLoader />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Only allow school and super_admin roles
  const allowedRoles = ["school", "super_admin"];
  if (!allowedRoles.includes(role)) {
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
