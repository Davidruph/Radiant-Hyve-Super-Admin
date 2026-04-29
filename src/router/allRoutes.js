import Dashboard from "../pages/super_admin/Dashboard/Dashboard";
import AdminLogin from "../pages/admin/Login/Login";
import Login from "../pages/login/login";
import SuperAdminLogin from "../pages/super_admin/Login/Login";
import SchoolDetails from "../pages/super_admin/ManageSchool/SchoolDetails";
import ManageSchool from "../pages/super_admin/ManageSchool/ManageSchool";
import SubscriptionService from "../pages/super_admin/SubscriptionService/SubscriptionService";
import SearchResults from "../pages/admin/Search/SearchResults";

//admin routes
import AdminDashboard from "../pages/admin/Dashboard/Dashboard";
import ForgotPassword from "../pages/admin/ForgotPassword/ForgotPassword";
import Principal from "../pages/admin/Principal/Principal";
import Staff from "../pages/admin/Staff/Staff";
import Shift from "../pages/admin/Shift/Shift";
import Parents from "../pages/admin/Parents/Parents";
import Student from "../pages/admin/Student/Student";
import UpcomingEvents from "../pages/admin/UpcomingEvents/UpcomingEvents";
import Certification from "../pages/admin/Certification/Certification";
import MealTracking from "../pages/admin/MealTracking/MealTracking";
import SleepLogs from "../pages/admin/SleepLogs/SleepLogs";
import Medication from "../pages/admin/Medication/Medication";
import Payment from "../pages/admin/Payment/Payment";
import Subscription from "../pages/admin/Subscription/Subscription";
import UpcomingBirthday from "../pages/admin/Dashboard/UpcomingBirthday";
import BirthdayDetails from "../pages/admin/Dashboard/BirthdayDetails";
import Emergency from "../pages/admin/Dashboard/Emergency";
import PrincipalDetails from "../pages/admin/Principal/PrincipalDetails";
import StaffDetails from "../pages/admin/Staff/StaffDetails";
import ParentsDetails from "../pages/admin/Parents/ParentsDetails";
import MainStudentDetails from "../pages/admin/StudentDetails/MainStudentDetails";
import MedicationView from "../pages/admin/Medication/MedicationView";
import StudentDetails from "../pages/admin/Student/StudentDetails";
import NewStudentDetails from "../pages/admin/Student/NewStudentDetails";
import CertificationDetails from "../pages/admin/Certification/CertificationDetails";
import Profile from "../pages/admin/Profile/Profile";
import MealTrackingDetails from "../pages/admin/MealTracking/MealTrackingDetails";
import ErrorScreen from "../pages/admin/ErrorScreen/ErrorScreen";
import Programs from "../pages/admin/Programs/Programs";
import LessonPlan from "../pages/admin/LessonPlan/LessonPlan";
import AssignedStudent from "../pages/admin/Staff/AssignedStudent";
import StaffCalender from "../pages/admin/Staff/StaffCalender";
import ParentReminder from "../pages/admin/ParentReminder/ParentReminder";

import TransportationHome from "../pages/admin/Transportation/Index";
import DriverDashboard from "../pages/driver/Dashboard/Index";
import RouteExecution from "../pages/driver/Dashboard/RouteExecution";

export const publicRouters = [
  { path: "*", element: <ErrorScreen /> },
  { path: "/login", element: <Login /> },
  { path: "/super_admin/login", element: <SuperAdminLogin /> },
  { path: "/super_admin", element: <SuperAdminLogin /> },
  { path: "/school_admin/login", element: <AdminLogin /> },
  { path: "/forgot_password", element: <ForgotPassword /> },
  { path: "/school_admin/forgot_password", element: <ForgotPassword /> }
];

export const privateRouters = [
  { path: "*", element: <ErrorScreen /> },
  { path: "/super_admin/dashboard", element: <Dashboard /> },
  { path: "/super_admin/manage_school", element: <ManageSchool /> },
  {
    path: "/super_admin/manage_school/school_details/:id",
    element: <SchoolDetails />
  },
  {
    path: "/super_admin/subscription_service",
    element: <SubscriptionService />
  },

  //admin routes and components
  { path: "/school_admin/dashboard", element: <AdminDashboard /> },
  { path: "/school_admin/upcoming_birthday", element: <UpcomingBirthday /> },
  {
    path: "/school_admin/upcoming_birthday/birthday_details/:id",
    element: <BirthdayDetails />
  },
  { path: "/school_admin/emergency", element: <Emergency /> },
  { path: "/school_admin/lessonplan", element: <LessonPlan /> },
  { path: "/school_admin/principal", element: <Principal /> },
  {
    path: "/school_admin/principal/principal_details/:id",
    element: <PrincipalDetails />
  },
  { path: "/school_admin/staff", element: <Staff /> },
  { path: "/school_admin/staff/leave-calendar", element: <StaffCalender /> },
  { path: "/school_admin/staff/staff_details/:id", element: <StaffDetails /> },
  {
    path: "/school_admin/staff/staff_details/:id/students",
    element: <AssignedStudent />
  },
  { path: "/school_admin/parents", element: <Parents /> },
  {
    path: "/school_admin/parents/parents_details/:id",
    element: <ParentsDetails />
  },
  { path: "/school_admin/program", element: <Shift /> },
  { path: "/school_admin/student", element: <Student /> },
  {
    path: "/school_admin/student/student_details/:id",
    element: <StudentDetails />
  },
  {
    path: "/school_admin/student/new_student_details/:id",
    element: <NewStudentDetails />
  },
  {
    path: "/school_admin/student/waiting_student_details/:id",
    element: <NewStudentDetails />
  },
  {
    path: "/school_admin/student_details/:id",
    element: <MainStudentDetails />
  },
  { path: "/school_admin/upcoming_events", element: <UpcomingEvents /> },
  { path: "/school_admin/programs", element: <Programs /> },
  { path: "/school_admin/certification", element: <Certification /> },
  {
    path: "/school_admin/certification/certification_details/:id",
    element: <CertificationDetails />
  },
  { path: "/school_admin/meal_tracking", element: <MealTracking /> },
  {
    path: "/school_admin/meal_tracking/mealtracking_details/:id",
    element: <MealTrackingDetails />
  },
  { path: "/school_admin/sleep_logs", element: <SleepLogs /> },
  { path: "/school_admin/medication", element: <Medication /> },
  {
    path: "/school_admin/medication/medication_view/:id",
    element: <MedicationView />
  },
  { path: "/school_admin/payment", element: <Payment /> },
  { path: "/school_admin/subscription", element: <Subscription /> },
  { path: "/school_admin/profile", element: <Profile /> },
  { path: "/school_admin/parent_reminder", element: <ParentReminder /> },
  { path: "/school_admin/search", element: <SearchResults /> },
  { path: "/school_admin/transportation", element: <TransportationHome /> },
  { path: "/driver/dashboard", element: <DriverDashboard /> },
  { path: "/driver/route-execution", element: <RouteExecution /> }
];
