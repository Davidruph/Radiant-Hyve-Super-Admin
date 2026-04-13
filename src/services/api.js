// Get base URL from environment variables, fallback to default
const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://app.radianthyve.com:8800";

// const BASE_URL = "http://localhost:8800";

const IMG_URL =
  process.env.REACT_APP_API_IMG_URL || "https://app.radianthyve.com:8800/";

export { BASE_URL, IMG_URL };

//super admin routes
export const LOGIN_API = BASE_URL + "/login";
export const REFRESH_TOKEN_API = BASE_URL + "/refresh_token_web";
export const LIST_SCHOOL_API = BASE_URL + "/list_school";
export const ADD_SCHOOL_API = BASE_URL + "/add_school";
export const EDIT_SCHOOL_API = BASE_URL + "/edit_school";
export const GET_SCHOOL_API = BASE_URL + "/get_school";
export const DELETE_SCHOOL_API = BASE_URL + "/delete_school";
export const CHANGE_PASSWORD_SCHOOL_API = BASE_URL + "/change_school_password";
export const CHANGE_PASSWORD_API = BASE_URL + "/change_password";
export const LOGOUT_API = BASE_URL + "/logout";

//admin routes starts here
export const FORGOT_PASSWORD_API = BASE_URL + "/forgote_password";
export const OTP_VERIFY_API = BASE_URL + "/verify_otp";
export const RESET_PASSWORD_API = BASE_URL + "/reset_password";
export const GET_PROFILE_API = BASE_URL + "/get_profile";
export const EDIT_SCHOOL_PROFILE_API = BASE_URL + "/edit_school_profile";

//principle
export const LIST_PRINCIPAL_API = BASE_URL + "/list_principal";
export const ADD_PRINCIPAL_API = BASE_URL + "/add_principal";
export const GET_PRINCIPAL_API = BASE_URL + "/get_principal";
export const EDIT_PRINCIPAL_API = BASE_URL + "/edit_principal";
export const DELETE_PRINCIPAL_API = BASE_URL + "/delete_principal";
export const BLOCK_PRINCIPAL_API = BASE_URL + "/block_principal";
export const CHANGE_PASSWORD_PRINCIPAL_API =
  BASE_URL + "/change_principal_password";

//staff
export const LIST_STAFF_API = BASE_URL + "/list_staff";
export const GET_STAFF_API = BASE_URL + "/get_staff";
export const ADD_STAFF_API = BASE_URL + "/add_staff";
export const EDIT_STAFF_API = BASE_URL + "/edit_staff";
export const DELETE_STAFF_API = BASE_URL + "/delete_staff";
export const BLOCK_STAFF_API = BASE_URL + "/block_staff";
export const CHANGE_PASSWORD_STAFF_API = BASE_URL + "/change_staff_password";

//staff leave
export const LIST_STAFF_LEAVE_API = BASE_URL + "/list_all_leave";
export const UPDATE_STAFF_LEAVE_API = BASE_URL + "/update_leave_status";
export const GET_STAFF_LEAVE_API = BASE_URL + "/list_leaves";

//shift
export const LIST_SHIFT_API = BASE_URL + "/list_shift";
export const ADD_SHIFT_API = BASE_URL + "/add_shift";
export const EDIT_SHIFT_API = BASE_URL + "/edit_shift";
export const DELETE_SHIFT_API = BASE_URL + "/delete_shift";

// Student
export const GET_SHIFT_API = BASE_URL + "/get_shift";
export const GET_NEW_STUDENT_API = BASE_URL + "/list_new_student";
export const GET_NEW_STUDENT_DETAILS_API = BASE_URL + "/get_student";
export const GET_WAITING_STUDENT_API = BASE_URL + "/list_waiting_student";
export const EDIT_STUDENT_API = BASE_URL + "/edit_student_status";
export const LIST_TEACHER_API = BASE_URL + "/list_teacher";
export const STUDENT_ASSIGN_TEACHER_API = BASE_URL + "/student_assign_teacher";
export const LIST_ALL_STUDENT_API = BASE_URL + "/list_all_student";

//parents
export const GET_PARENST_API = BASE_URL + "/list_parent";
export const ADD_PARENST_API = BASE_URL + "/add_parent";
export const GET_PARENST_DETAILS_API = BASE_URL + "/get_parent";
export const GET_PARENST_STUDENTS_API = BASE_URL + "/get_parent_student";
export const DELETE_PARENST_API = BASE_URL + "/delete_parent";
export const BLOCK_PARENST_API = BASE_URL + "/block_parent";
export const EDIT_PARENTS_API = BASE_URL + "/edit_parent";
export const CHANGE_PASSWORD_PARENST_API = BASE_URL + "/change_parent_password";

//certification
export const GET_LIST_CERTIFICATION_API = BASE_URL + "/list_certification";
export const GET_CERTIFICATION_DETAILS_API = BASE_URL + "/get_certification";
export const ADD_CERTIFICATION_API = BASE_URL + "/add_certification";
export const DELETE_CERTI_API = BASE_URL + "/delete_certification";
export const EDIT_CERTI_API = BASE_URL + "/edit_certification";

//medification
export const LIST_MEDIFICATION_API = BASE_URL + "/list_medification";
export const ADD_MEDIFICATION_API = BASE_URL + "/add_medification";
export const GET_ALL_STUDENT_API = BASE_URL + "/list_students";
export const GET_MEDIFICATION_DETAILS_API = BASE_URL + "/get_medification";
export const EDIT_MEDIFICATION_DETAILS_API = BASE_URL + "/edit_medification";
export const DELETE_MEDI_API = BASE_URL + "/delete_medification";

//EVENTS
export const LIST_EVENTS_API = BASE_URL + "/list_event";
export const DELETE_EVENT_API = BASE_URL + "/delete_event";
export const ADD_EVENTS_API = BASE_URL + "/add_event";
export const EDIT_EVENT_API = BASE_URL + "/edit_event";

//menu
export const LIST_MENU_API = BASE_URL + "/list_menu";
export const ADD_MENU_API = BASE_URL + "/add_menu";
export const GET_MENU_API = BASE_URL + "/get_menu";
export const GET_ALL_STUDENT_MEAL_API = BASE_URL + "/get_all_student";
export const DELETE_MENU_API = BASE_URL + "/delete_menu";
export const EDIT_MENU_API = BASE_URL + "/edit_menu";

//sleep
export const LIST_SLEEP_API = BASE_URL + "/list_sleep_loag";
export const EDIT_SLEEP_API = BASE_URL + "/edit_sleep_loag";
export const ADD_SLEEP_API = BASE_URL + "/add_sleep_loag";

//dashboard
export const DASHBOARD_API = BASE_URL + "/deshbord_count";
export const BIRTHDAY_COUNT_API = BASE_URL + "/birthday_count";
export const BIRTHDAY_LIST_API = BASE_URL + "/list_upcoming_birthday";

//attendance
export const GET_OTHER_ATTENDANCE_API = BASE_URL + "/get_other_attendance";
export const GET_STUDENT_ATTENDANCE_API =
  BASE_URL + "/get_all_student_attedance";
export const GET_TEACHER_STUDENT_API = BASE_URL + "/get_teacher_student";

export const GET_CHAT_MESSAGES_AS = BASE_URL + "/get_lesson_chat_message";
export const SEND_MESSAGES_AS = BASE_URL + "/send_lesson_chat_message";
export const GET_UNREAD_COUNT = BASE_URL + "/get_unread_count";
export const GET_ATTENDACE_COUNT = BASE_URL + "/get_attedance_count";
export const GET_LIST_NOTIFICATION = BASE_URL + "/list_notification";

//emergency
export const GET_EMERGENCY_LIST_API = BASE_URL + "/list_sos";
export const GET_EMERGENCY_TABLE_API = BASE_URL + "/get_sos";
export const ADD_EMERGENCY_API = BASE_URL + "/create_sos";

//payment
export const LIST_STUDENT_FEES_API = BASE_URL + "/list_student_fees";
export const BLOCK_STUDENT_PAYMENT_API = BASE_URL + "/block_student";
export const GET_STUDENT_PAYMENT_RECEIPT_API = BASE_URL + "/get_invoice";
export const MAKE_PAYMENT_API = BASE_URL + "/make_payment";
export const REMAINING_FEES_API = BASE_URL + "/remaining_fees";

//parent push notification
export const PARENT_PUSH_NOTIFICATION_API = BASE_URL + "/admin_notification";

//export
export const EXPORT_STUDENT_FEES_API = BASE_URL + "/list_student_fees_history";
export const GET_PARENT_ADMIN_API = BASE_URL + "/get_parent_admin";

//subscription
export const CREATE_SUBSCRIPTION_API = BASE_URL + "/create_subscription_plan";
export const GET_SUBSCRIPTION_API = BASE_URL + "/list_subscription_plans";
export const UPDATE_SUBSCRIPTION_API = BASE_URL + "/update_subscription_plan";
