import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
    let token = localStorage.getItem("radient-admin-token");
    return token ? <Navigate to="/super_admin/dashboard" /> : children;
}
