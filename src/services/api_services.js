import axios from "axios";
import { ADD_SCHOOL_API, CHANGE_PASSWORD_API, CHANGE_PASSWORD_SCHOOL_API, DELETE_SCHOOL_API, EDIT_SCHOOL_API, GET_SCHOOL_API, LIST_SCHOOL_API, LOGIN_API, LOGOUT_API, REFRESH_TOKEN_API } from "./api";

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

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem("refresh_token");

                const res = await axios.post(REFRESH_TOKEN_API, {
                    refresh_token: refreshToken,
                });

                const newAccessToken = res.data.token;
                localStorage.setItem("radient-admin-token", newAccessToken);

                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                console.error("Refresh token failed:", refreshError);
                localStorage.removeItem("radient-admin-token")
                localStorage.removeItem("refresh_token")
                localStorage.removeItem("device_Id");
                window.location.href = "/super_admin/login";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);


const header = {
    "Content-Type": "application/json",
};

const mutipartHeader = {
    "content-type": "multipart/form-data",
};

export const loginApi = (data) => {
    return axios.post(LOGIN_API, data, {
        headers: header,
    });
};

export const getSchoolListApi = (params) => {
    return axios.get(LIST_SCHOOL_API, {
        headers: header,
        params: params,
    });
};

export const addSchoolApi = (data) => {
    return axios.post(ADD_SCHOOL_API, data, {
        headers: header,
    });
};

export const editSchoolApi = (data) => {
    return axios.put(EDIT_SCHOOL_API, data, {
        headers: header,
    });
};

export const getSchoolApi = (params) => {
    return axios.get(GET_SCHOOL_API, {
        headers: header,
        params: params,
    });
};

export const deleteSchoolApi = (id, reason) => {
    return axios.delete(`${DELETE_SCHOOL_API}?id=${id}&delete_reason=${encodeURIComponent(reason)}`);
};

export const changePasswordSchoolApi = (data) => {
    return axios.patch(CHANGE_PASSWORD_SCHOOL_API, data, {
        headers: header,
    });
};

export const changePasswordApi = (data) => {
    return axios.patch(CHANGE_PASSWORD_API, data, {
        headers: header,
    });
};

export const logoutApi = () => {
    return axios.post(LOGOUT_API, {
        headers: header,
    });
};
