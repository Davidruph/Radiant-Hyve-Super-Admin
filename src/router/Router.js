import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";
import { privateRouters, publicRouters } from "../router/allRoutes";
import MainLayout from "../layout/Layout";
import PrivateRoute from "../router/privateRoute";
import PublicRoute from "../router/publicRoute";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Handle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    if (location.pathname === "/") {
      // If authenticated, redirect to appropriate dashboard
      if (isAuthenticated) {
        const dashboardPath =
          role === "super_admin"
            ? "/super_admin/dashboard"
            : role === "driver"
              ? "/driver/dashboard"
              : role === "school"
                ? "/school_admin/dashboard"
                : "/login";
        navigate(dashboardPath);
      } else {
        navigate("/login");
      }
    }
  }, [location.pathname, navigate, isAuthenticated, role, isLoading]);
};

function RouterData() {
  return (
    <BrowserRouter>
      <Handle />
      <Routes>
        {publicRouters.map((item, index) => (
          <Route
            key={index}
            path={item.path}
            element={<PublicRoute>{item.element}</PublicRoute>}
          />
        ))}

        {privateRouters.map((item, index) => (
          <Route
            key={index}
            path={item.path}
            element={
              <PrivateRoute>
                <MainLayout>{item.element}</MainLayout>
              </PrivateRoute>
            }
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default RouterData;
