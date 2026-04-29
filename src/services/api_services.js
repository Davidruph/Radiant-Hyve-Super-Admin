import axios from "axios";
import {
  ADD_SCHOOL_API,
  CHANGE_PASSWORD_API,
  CHANGE_PASSWORD_SCHOOL_API,
  DELETE_SCHOOL_API,
  EDIT_SCHOOL_API,
  GET_SCHOOL_API,
  LIST_SCHOOL_API,
  LOGIN_API,
  LOGOUT_API,
  REFRESH_TOKEN_API,
  ADD_CERTIFICATION_API,
  ADD_EMERGENCY_API,
  ADD_EVENTS_API,
  ADD_MEDIFICATION_API,
  ADD_MENU_API,
  ADD_PARENST_API,
  ADD_PRINCIPAL_API,
  ADD_SHIFT_API,
  ADD_SLEEP_API,
  ADD_STAFF_API,
  BIRTHDAY_COUNT_API,
  BIRTHDAY_LIST_API,
  BLOCK_PARENST_API,
  BLOCK_PRINCIPAL_API,
  BLOCK_STAFF_API,
  BLOCK_STUDENT_PAYMENT_API,
  CHANGE_PASSWORD_PARENST_API,
  CHANGE_PASSWORD_PRINCIPAL_API,
  CHANGE_PASSWORD_STAFF_API,
  DASHBOARD_API,
  DELETE_CERTI_API,
  DELETE_EVENT_API,
  DELETE_MEDI_API,
  DELETE_MENU_API,
  DELETE_PARENST_API,
  DELETE_PRINCIPAL_API,
  DELETE_SHIFT_API,
  DELETE_STAFF_API,
  EDIT_CERTI_API,
  EDIT_EVENT_API,
  EDIT_MEDIFICATION_DETAILS_API,
  EDIT_MENU_API,
  EDIT_PARENTS_API,
  EDIT_PRINCIPAL_API,
  EDIT_SCHOOL_PROFILE_API,
  EDIT_SHIFT_API,
  EDIT_SLEEP_API,
  EDIT_STAFF_API,
  EDIT_STUDENT_API,
  EXPORT_STUDENT_FEES_API,
  FORGOT_PASSWORD_API,
  GET_ALL_STUDENT_API,
  GET_ALL_STUDENT_MEAL_API,
  GET_ATTENDACE_COUNT,
  GET_CERTIFICATION_DETAILS_API,
  GET_CHAT_MESSAGES_AS,
  GET_EMERGENCY_LIST_API,
  GET_EMERGENCY_TABLE_API,
  GET_LIST_CERTIFICATION_API,
  GET_LIST_NOTIFICATION,
  GET_MEDIFICATION_DETAILS_API,
  GET_MENU_API,
  GET_NEW_STUDENT_API,
  GET_NEW_STUDENT_DETAILS_API,
  GET_OTHER_ATTENDANCE_API,
  GET_PARENST_API,
  GET_PARENST_DETAILS_API,
  GET_PARENST_STUDENTS_API,
  GET_PARENT_ADMIN_API,
  GET_PRINCIPAL_API,
  GET_PROFILE_API,
  GET_SHIFT_API,
  GET_STAFF_API,
  GET_STAFF_LEAVE_API,
  GET_STUDENT_ATTENDANCE_API,
  GET_STUDENT_PAYMENT_RECEIPT_API,
  GET_TEACHER_STUDENT_API,
  GET_UNREAD_COUNT,
  GET_WAITING_STUDENT_API,
  LIST_ALL_STUDENT_API,
  LIST_EVENTS_API,
  LIST_MEDIFICATION_API,
  LIST_MENU_API,
  LIST_PRINCIPAL_API,
  LIST_SHIFT_API,
  LIST_SLEEP_API,
  LIST_STAFF_API,
  LIST_STAFF_LEAVE_API,
  LIST_STUDENT_FEES_API,
  LIST_TEACHER_API,
  MAKE_PAYMENT_API,
  OTP_VERIFY_API,
  PARENT_PUSH_NOTIFICATION_API,
  REMAINING_FEES_API,
  RESET_PASSWORD_API,
  SEND_MESSAGES_AS,
  STUDENT_ASSIGN_TEACHER_API,
  UPDATE_STAFF_LEAVE_API,
  CREATE_SUBSCRIPTION_API,
  GET_SUBSCRIPTION_API,
  UPDATE_SUBSCRIPTION_API,
  ADD_VEHICLE_API,
  GET_VEHICLES_API,
  UPDATE_VEHICLE_API,
  ASSIGN_DRIVER_VEHICLE_API,
  CREATE_ROUTE_API,
  GET_ROUTES_API,
  START_ROUTE_API,
  UPDATE_PICKUP_STATUS_API,
  COMPLETE_DROPOFF_API,
  END_ROUTE_API,
  GET_DRIVER_ROUTES_API,
  START_DRIVER_ROUTE_API,
  UPDATE_DRIVER_PICKUP_STATUS_API,
  COMPLETE_DRIVER_DROPOFF_API,
  END_DRIVER_ROUTE_API,
  ADD_DROPOFF_RECIPIENT_API,
  GET_TRANSPORT_LOGS_API,
  GET_TRANSPORT_EXCEPTIONS_API,
  RESOLVE_EXCEPTION_API
} from "./api";

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("radient-admin-token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't auto-refresh for logout endpoint
    if (originalRequest.url?.includes("/logout")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");

        const res = await axios.post(REFRESH_TOKEN_API, {
          refresh_token: refreshToken
        });

        const newAccessToken = res.data.token;
        localStorage.setItem("radient-admin-token", newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        localStorage.removeItem("radient-admin-token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("device_Id");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const header = {
  "Content-Type": "application/json"
};

const mutipartHeader = {
  "content-type": "multipart/form-data"
};

export const createSubscriptionApi = (data) => {
  return axios.post(CREATE_SUBSCRIPTION_API, data, {
    headers: header
  });
};

export const getSubscriptionApi = (data) => {
  return axios.get(GET_SUBSCRIPTION_API, data, {
    headers: header
  });
};

export const updateSubscriptionApi = (data) => {
  return axios.put(UPDATE_SUBSCRIPTION_API, data, {
    headers: header
  });
};

export const loginApi = (data) => {
  return axios.post(LOGIN_API, data, {
    headers: header
  });
};

export const getSchoolListApi = (params) => {
  return axios.get(LIST_SCHOOL_API, {
    headers: header,
    params: params
  });
};

export const addSchoolApi = (data) => {
  return axios.post(ADD_SCHOOL_API, data, {
    headers: header
  });
};

export const editSchoolApi = (data) => {
  return axios.put(EDIT_SCHOOL_API, data, {
    headers: header
  });
};

export const getSchoolApi = (params) => {
  return axios.get(GET_SCHOOL_API, {
    headers: header,
    params: params
  });
};

export const deleteSchoolApi = (id, reason) => {
  return axios.delete(
    `${DELETE_SCHOOL_API}?id=${id}&delete_reason=${encodeURIComponent(reason)}`
  );
};

export const changePasswordSchoolApi = (data) => {
  return axios.patch(CHANGE_PASSWORD_SCHOOL_API, data, {
    headers: header
  });
};

export const changePasswordApi = (data) => {
  return axios.patch(CHANGE_PASSWORD_API, data, {
    headers: header
  });
};

export const logoutApi = () => {
  return axios.post(
    LOGOUT_API,
    {},
    {
      headers: header
    }
  );
};

export const forgotPasswordApi = (data) => {
  return axios.post(FORGOT_PASSWORD_API, data, {
    headers: header
  });
};

export const otpVerificationApi = (data) => {
  return axios.post(OTP_VERIFY_API, data, {
    headers: header
  });
};

export const resetPasswordApi = (data) => {
  return axios.post(RESET_PASSWORD_API, data, {
    headers: header
  });
};

export const getProfileApi = () => {
  return axios.get(GET_PROFILE_API, {
    headers: header
  });
};

export const editSchoolProfileApi = (data) => {
  return axios.put(EDIT_SCHOOL_PROFILE_API, data, {
    headers: header
  });
};

//principal
export const getPrincipalListApi = (data) => {
  return axios.get(LIST_PRINCIPAL_API, {
    headers: header,
    params: data
  });
};

export const addPrincipalApi = (data) => {
  return axios.post(ADD_PRINCIPAL_API, data, {
    headers: mutipartHeader
  });
};

export const getPrincipalProfileApi = (data) => {
  return axios.get(GET_PRINCIPAL_API, {
    params: data,
    headers: header
  });
};

export const editPrincipalApi = (data) => {
  return axios.put(EDIT_PRINCIPAL_API, data, {
    headers: mutipartHeader
  });
};

export const deletePrincipalApi = (id, reason) => {
  return axios.delete(
    `${DELETE_PRINCIPAL_API}?principal_id=${id}&delete_reason=${encodeURIComponent(reason)}`
  );
};

export const BlockPrincipalApi = (data) => {
  return axios.post(BLOCK_PRINCIPAL_API, data, {
    headers: header
  });
};

export const changePasswordPrincipalApi = (data) => {
  return axios.patch(CHANGE_PASSWORD_PRINCIPAL_API, data, {
    headers: header
  });
};

//list_staff
export const getStaffListApi = (data) => {
  return axios.get(LIST_STAFF_API, {
    headers: header,
    params: data
  });
};

export const getStaffProfileApi = (data) => {
  return axios.get(GET_STAFF_API, {
    params: data,
    headers: header
  });
};

export const addStaffApi = (data) => {
  return axios.post(ADD_STAFF_API, data, {
    headers: mutipartHeader
  });
};

export const editStaffApi = (data) => {
  return axios.put(EDIT_STAFF_API, data, {
    headers: mutipartHeader
  });
};

export const deleteStaffApi = (id, reason) => {
  return axios.delete(
    `${DELETE_STAFF_API}?staff_id=${id}&delete_reason=${encodeURIComponent(reason)}`
  );
};

export const BlockStaffApi = (data) => {
  return axios.post(BLOCK_STAFF_API, data, {
    headers: header
  });
};

export const changePasswordStaffApi = (data) => {
  return axios.patch(CHANGE_PASSWORD_STAFF_API, data, {
    headers: header
  });
};

export const getListStaffLeave = (data) => {
  return axios.get(LIST_STAFF_LEAVE_API, {
    headers: header,
    params: data
  });
};

export const getCalenderLeaveList = (data) => {
  return axios.get(GET_STAFF_LEAVE_API, {
    headers: header,
    params: data
  });
};

export const updateStaffLeaveApi = (data) => {
  return axios.put(UPDATE_STAFF_LEAVE_API, data, {
    headers: header
  });
};

//SHIFT=
export const getShiftListApi = (data) => {
  return axios.get(LIST_SHIFT_API, {
    headers: header,
    params: data
  });
};

export const addShiftApi = (data) => {
  return axios.post(ADD_SHIFT_API, data, {
    headers: header
  });
};

export const editShiftApi = (data) => {
  return axios.put(EDIT_SHIFT_API, data, {
    headers: header
  });
};

export const deleteShiftApi = (id) => {
  return axios.delete(`${DELETE_SHIFT_API}?shift_id=${id}`);
};

//Student
export const getShiftApi = () => {
  return axios.get(GET_SHIFT_API, {
    headers: header
  });
};

export const getNewStudentListApi = (data) => {
  return axios.get(GET_NEW_STUDENT_API, {
    headers: header,
    params: data
  });
};

export const getWaitingStudentListApi = (data) => {
  return axios.get(GET_WAITING_STUDENT_API, {
    headers: header,
    params: data
  });
};

export const getNewStudentDetailsApi = (data) => {
  return axios.get(GET_NEW_STUDENT_DETAILS_API, {
    headers: header,
    params: data
  });
};

export const getTeacherListApi = () => {
  return axios.get(LIST_TEACHER_API, {
    headers: header
  });
};

export const editStudentApi = (data) => {
  return axios.patch(EDIT_STUDENT_API, data, {
    headers: header
  });
};

export const studentAssignTeacherApi = (data) => {
  return axios.patch(STUDENT_ASSIGN_TEACHER_API, data, {
    headers: header
  });
};

export const getAllStudentListApi = (data) => {
  return axios.get(LIST_ALL_STUDENT_API, {
    headers: header,
    params: data
  });
};

//PARENTS
export const getParentsListApi = (data) => {
  return axios.get(GET_PARENST_API, {
    headers: header,
    params: data
  });
};

export const addParentsApi = (data) => {
  return axios.post(ADD_PARENST_API, data, {
    headers: mutipartHeader
  });
};

export const getParentsDetailsApi = (data) => {
  return axios.get(GET_PARENST_DETAILS_API, {
    params: data,
    headers: header
  });
};

export const getParentsStudentsApi = (data) => {
  return axios.get(GET_PARENST_STUDENTS_API, {
    params: data,
    headers: header
  });
};

export const deleteParentApi = (id, reason) => {
  return axios.delete(
    `${DELETE_PARENST_API}?parent_id=${id}&delete_reason=${encodeURIComponent(reason)}`
  );
};

export const BlockParentApi = (data) => {
  return axios.post(BLOCK_PARENST_API, data, {
    headers: header
  });
};

export const changePasswordParentApi = (data) => {
  return axios.patch(CHANGE_PASSWORD_PARENST_API, data, {
    headers: header
  });
};

export const editParentsApi = (data) => {
  return axios.put(EDIT_PARENTS_API, data, {
    headers: mutipartHeader
  });
};

//CertificationList
export const getCertificationListApi = (data) => {
  return axios.get(GET_LIST_CERTIFICATION_API, {
    headers: header,
    params: data
  });
};

export const getCertificationDetailsApi = (data) => {
  return axios.get(GET_CERTIFICATION_DETAILS_API, {
    params: data,
    headers: header
  });
};

export const addCertificationApi = (data) => {
  return axios.post(ADD_CERTIFICATION_API, data, {
    headers: header
  });
};

export const deleteCertificationApi = (id) => {
  return axios.delete(`${DELETE_CERTI_API}?certificate_id=${id}`);
};

export const editCertification = (data) => {
  return axios.put(EDIT_CERTI_API, data, {
    headers: header
  });
};

//MEDIFICATION
export const medicationListApi = (data) => {
  return axios.get(LIST_MEDIFICATION_API, {
    headers: header,
    params: data
  });
};

export const addMedicationApi = (data) => {
  return axios.post(ADD_MEDIFICATION_API, data, {
    headers: header
  });
};

export const getStudentsListApi = () => {
  return axios.get(GET_ALL_STUDENT_API, {
    headers: header
  });
};

export const getMedicationDetailsApi = (data) => {
  return axios.get(GET_MEDIFICATION_DETAILS_API, {
    params: data,
    headers: header
  });
};

export const editMedicationApi = (data) => {
  return axios.put(EDIT_MEDIFICATION_DETAILS_API, data, {
    headers: header
  });
};

export const deleteMedicationApi = (id) => {
  return axios.delete(`${DELETE_MEDI_API}?medication_id=${id}`);
};

//events
export const getEventListApi = (data) => {
  return axios.get(LIST_EVENTS_API, {
    headers: header,
    params: data
  });
};

export const addEventApi = (data) => {
  return axios.post(ADD_EVENTS_API, data, {
    headers: header
  });
};

export const deleteEventsApi = (id) => {
  return axios.delete(`${DELETE_EVENT_API}?event_id=${id}`);
};

export const editEventApi = (data) => {
  return axios.put(EDIT_EVENT_API, data, {
    headers: header
  });
};

//menu
export const getMenuListApi = (data) => {
  return axios.get(LIST_MENU_API, {
    headers: header,
    params: data
  });
};

export const addMenuApi = (data) => {
  return axios.post(ADD_MENU_API, data, {
    headers: header
  });
};

export const getMenuApi = (data) => {
  return axios.get(GET_MENU_API, {
    params: data,
    headers: header
  });
};

export const getStudentsMealApi = () => {
  return axios.get(GET_ALL_STUDENT_MEAL_API, {
    headers: header
  });
};

export const deleteMenuApi = (id) => {
  return axios.delete(`${DELETE_MENU_API}?menu_id=${id}`);
};

export const editMenuApi = (data) => {
  return axios.put(EDIT_MENU_API, data, {
    headers: header
  });
};

// Sleep
export const getSleepListApi = (data) => {
  return axios.get(LIST_SLEEP_API, {
    headers: header,
    params: data
  });
};

export const editSleepApi = (data) => {
  return axios.put(EDIT_SLEEP_API, data, {
    headers: header
  });
};

export const addSleepApi = (data) => {
  return axios.post(ADD_SLEEP_API, data, {
    headers: header
  });
};

// Dashboard
export const getDashboardApi = () => {
  return axios.get(DASHBOARD_API, {
    headers: header
  });
};

export const getBirthdayCountApi = (param) => {
  return axios.get(BIRTHDAY_COUNT_API, {
    params: param,
    headers: header
  });
};

export const getBirthdayListApi = (param) => {
  return axios.get(BIRTHDAY_LIST_API, {
    params: param,
    headers: header
  });
};

//ATTENDANCE
export const getAttendanceListApi = (data) => {
  return axios.get(GET_OTHER_ATTENDANCE_API, {
    params: data,
    headers: header
  });
};

export const getStudentAttendanceApi = (data) => {
  return axios.get(GET_STUDENT_ATTENDANCE_API, {
    params: data,
    headers: header
  });
};

export const getTeacherStudentApi = (data) => {
  return axios.get(GET_TEACHER_STUDENT_API, {
    params: data,
    headers: header
  });
};

export const getChatMessageList = (data) => {
  return axios.get(GET_CHAT_MESSAGES_AS, {
    headers: header,
    params: data
  });
};

export const sendMessageApi = (data) => {
  return axios.post(SEND_MESSAGES_AS, data, {
    headers: mutipartHeader
  });
};

export const getUnreadCount = () => {
  return axios.get(GET_UNREAD_COUNT, {
    headers: header
  });
};

export const getAttendanceCountApi = (data) => {
  return axios.get(GET_ATTENDACE_COUNT, {
    headers: header,
    params: data
  });
};

export const getListNotificationApi = (params) => {
  return axios.get(GET_LIST_NOTIFICATION, {
    headers: header,
    params: params
  });
};

//emergency
export const getEmergencyListApi = (params) => {
  return axios.get(GET_EMERGENCY_LIST_API, {
    headers: header,
    params: params
  });
};

export const getEmergencyTableApi = (params) => {
  return axios.get(GET_EMERGENCY_TABLE_API, {
    headers: header,
    params: params
  });
};

export const addEmergencyApi = (data) => {
  return axios.post(ADD_EMERGENCY_API, data, {
    headers: header
  });
};

//payment
export const getStudentFeesListApi = (params) => {
  return axios.get(LIST_STUDENT_FEES_API, {
    headers: header,
    params: params
  });
};

export const blockStudentPaymentApi = (data) => {
  return axios.post(BLOCK_STUDENT_PAYMENT_API, data, {
    headers: header
  });
};

export const getStudentPaymentReceiptApi = (params) => {
  return axios.get(GET_STUDENT_PAYMENT_RECEIPT_API, {
    headers: header,
    params: params
  });
};

export const makePaymentApi = (data) => {
  return axios.post(MAKE_PAYMENT_API, data, {
    headers: header
  });
};

export const getRemainingFeesApi = (params) => {
  return axios.post(REMAINING_FEES_API, params, {
    headers: header
  });
};

export const studentFeesListHistoryApi = (params) => {
  return axios.get(EXPORT_STUDENT_FEES_API, {
    headers: header,
    params: params
  });
};

export const getParentAdminApi = () => {
  return axios.get(GET_PARENT_ADMIN_API, {
    headers: header
  });
};

export const parentPushNotificationApi = (data) => {
  return axios.post(PARENT_PUSH_NOTIFICATION_API, data, {
    headers: header
  });
};
// =====================================================
// TRANSPORTATION - VEHICLE MANAGEMENT
// =====================================================

export const addVehicleApi = (data) => {
  return axios.post(require("./api").ADD_VEHICLE_API, data, {
    headers: header
  });
};

export const getVehiclesApi = (params) => {
  return axios.get(require("./api").GET_VEHICLES_API, {
    headers: header,
    params
  });
};

export const updateVehicleApi = (vehicleId, data) => {
  return axios.put(
    `${require("./api").UPDATE_VEHICLE_API}/${vehicleId}`,
    data,
    { headers: header }
  );
};

export const assignDriverToVehicleApi = (data) => {
  return axios.post(require("./api").ASSIGN_DRIVER_VEHICLE_API, data, {
    headers: header
  });
};

// =====================================================
// TRANSPORTATION - ROUTE MANAGEMENT
// =====================================================

export const createRouteApi = (data) => {
  return axios.post(require("./api").CREATE_ROUTE_API, data, {
    headers: header
  });
};

export const getRoutesApi = (params) => {
  // Check if user is a driver
  const userRole = localStorage.getItem("user-role");
  const apiEndpoint =
    userRole === "driver" ? GET_DRIVER_ROUTES_API : GET_ROUTES_API;

  return axios.get(apiEndpoint, {
    headers: header,
    params
  });
};

// =====================================================
// TRANSPORTATION - ROUTE EXECUTION
// =====================================================

export const startRouteApi = (data) => {
  const userRole = localStorage.getItem("user-role");
  const apiEndpoint =
    userRole === "driver" ? START_DRIVER_ROUTE_API : START_ROUTE_API;
  return axios.post(apiEndpoint, data, {
    headers: header
  });
};

export const updatePickupStatusApi = (data) => {
  const userRole = localStorage.getItem("user-role");
  const apiEndpoint =
    userRole === "driver"
      ? UPDATE_DRIVER_PICKUP_STATUS_API
      : UPDATE_PICKUP_STATUS_API;
  return axios.put(apiEndpoint, data, {
    headers: header
  });
};

export const completeDropoffApi = (data) => {
  const userRole = localStorage.getItem("user-role");
  const apiEndpoint =
    userRole === "driver" ? COMPLETE_DRIVER_DROPOFF_API : COMPLETE_DROPOFF_API;
  return axios.post(apiEndpoint, data, {
    headers: header
  });
};

export const endRouteApi = (data) => {
  const userRole = localStorage.getItem("user-role");
  const apiEndpoint =
    userRole === "driver" ? END_DRIVER_ROUTE_API : END_ROUTE_API;
  return axios.post(apiEndpoint, data, { headers: header });
};

// =====================================================
// TRANSPORTATION - DROP-OFF RECIPIENTS
// =====================================================

export const addDropoffRecipientApi = (data) => {
  return axios.post(require("./api").ADD_DROPOFF_RECIPIENT_API, data, {
    headers: header
  });
};

// =====================================================
// TRANSPORTATION - LOGS & EXCEPTIONS
// =====================================================

export const getTransportLogsApi = (params) => {
  return axios.get(require("./api").GET_TRANSPORT_LOGS_API, {
    headers: header,
    params
  });
};

export const getTransportExceptionsApi = (params) => {
  return axios.get(require("./api").GET_TRANSPORT_EXCEPTIONS_API, {
    headers: header,
    params
  });
};

export const resolveExceptionApi = (exceptionId, data) => {
  return axios.put(
    `${require("./api").RESOLVE_EXCEPTION_API}/${exceptionId}`,
    data,
    { headers: header }
  );
};
