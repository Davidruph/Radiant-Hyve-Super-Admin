import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
    let token = localStorage.getItem("radient-admin-token");
    return token ? children : <Navigate to="/super_admin/login" />;
}
