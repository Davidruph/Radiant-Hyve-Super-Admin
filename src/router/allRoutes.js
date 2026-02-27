import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Login/Login";
import SchoolDetails from "../pages/ManageSchool/SchoolDetails";
import ManageSchool from "../pages/ManageSchool/ManageSchool";
import SubscriptionService from "../pages/SubscriptionService/SubscriptionService";

export const publicRouters = [
    { path: "/super_admin", element: <Login /> },
    { path: "/super_admin/login", element: <Login /> },
]

export const privateRouters = [
    { path: "/super_admin/dashboard", element: <Dashboard /> },
    { path: "/super_admin/manage_school", element: <ManageSchool /> },
    { path: "/super_admin/manage_school/school_details/:id", element: <SchoolDetails /> },
    { path: "/super_admin/subscription_service", element: <SubscriptionService /> },
]