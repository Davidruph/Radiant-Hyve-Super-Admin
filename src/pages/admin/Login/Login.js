import React, { useEffect, useState } from "react";
import login_logo from "../../../assets/logo/login_logo2.png";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import loginBaner from "../../../assets/images/Frame.png";
import * as Yup from "yup";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { DotLoader } from "../../../base-component/Loader/Loader";
import { loginApi } from "../../../services/api_services";
import { getToken } from "firebase/messaging";
import { messaging } from "../../../firebase/Firebase";
import Dialog from "../../../base-component/Dialog/Dialog";
import { useAuth } from "../../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  let deviceId = localStorage.getItem("device_Id");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const [fcmToken, setFcmToken] = useState("");
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  const requestPermissionAndGetToken = async () => {
    try {
      const notificationsSupported =
        typeof window !== "undefined" && "Notification" in window;
      const swSupported =
        typeof navigator !== "undefined" && "serviceWorker" in navigator;
      if (!notificationsSupported || !swSupported) {
        console.warn(
          "Notifications or Service Worker not supported in this browser."
        );
        setFcmToken("");
        return null;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission not granted (", permission, ")");
        setFcmToken("");
        setIsPermissionModalOpen(true);
        return null;
      }

      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        try {
          registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
          );
        } catch (swError) {
          console.error("Failed to register service worker for FCM:", swError);
          setFcmToken("");
          return null;
        }
      }

      if (!messaging) {
        console.warn("Firebase messaging is not initialized.");
        setFcmToken("");
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
      });
      console.log("FCM Token:", token);
      setFcmToken(token || "");
      return token;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      setFcmToken("");
      return null;
    }
  };

  const handleRetryPermission = async () => {
    setIsPermissionModalOpen(false);
    await requestPermissionAndGetToken();
  };

  const handleContinueWithout = () => {
    setIsPermissionModalOpen(false);
  };

  useEffect(() => {
    requestPermissionAndGetToken();
  }, []);

  useEffect(() => {
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("device_Id", deviceId);
    }
  }, [deviceId]);

  const togglePasspwrdVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password must be at most 20 characters")
      .required("Password is required")
  });

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      setBtnLoader(true);
      let obj = {
        email: values.email,
        password: values.password,
        device_id: deviceId,
        device_type: "web",
        device_token: fcmToken || "abc",
        role: "school"
      };

      loginApi(obj)
        .then((res) => {
          const message = res.data.message;
          if (res.data.status === 1) {
            const datas = res?.data?.data;
            console.log(res?.data);

            // Determine user role from API response
            const userRole = datas?.role || "school_admin";
            const dashboardPath =
              userRole === "super_admin"
                ? "/super_admin/dashboard"
                : "/school_admin/dashboard";

            // Store in AuthContext and localStorage
            login(res.data.token, userRole, datas);
            localStorage.setItem("refresh_token", res?.data?.refresh_token);

            navigate(dashboardPath);
            toast.success(message);
          }
          setBtnLoader(false);
        })
        .catch((err) => {
          const errs = err?.response?.data;
          toast.error(errs?.message);
          setBtnLoader(false);
        });
    }
  });

  return (
    <>
      <div className="grid grid-cols-12">
        <div className="lg:col-span-6 col-span-12">
          <div className="h-screen flex items-center justify-center bg-[white]">
            <div className="xl:w-[504px] lg:w-96 md:w-[600px] w-full px-4 ">
              <div className="flex justify-center">
                <div className="mb-10 ">
                  <img
                    src={login_logo}
                    alt="..."
                    className="sm:w-[220px] w-[200px]"
                  />
                </div>
              </div>
              <div className="text-black text-center">
                <h3 className="md:text-2xl text-xl font-semibold pb-[10px]">
                  Sign in to your Account
                </h3>
                <p className="md:text-base text-sm">
                  Enter your Radiant Hyve account details to sign in and
                  continue your learning journey.
                </p>
              </div>
              <form onSubmit={formik.handleSubmit}>
                <div className="sm:mt-10 mt-7">
                  <div className="sm:mb-5 mb-4">
                    <label className="text-base text-black">Email</label>
                    <input
                      type="email"
                      name="email"
                      className={`h-[52px] bg-white block border ${formik.errors.email && formik.touched.email ? "border-red-500" : "border-gray-300"} rounded-lg px-[15px] w-full mt-1 placeholder:text-sm outline-none`}
                      placeholder="Enter email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.email && formik.errors.email ? (
                      <div className="text-red-500 text-sm mt-1">
                        {formik.errors.email}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <label className="text-base text-black">Password</label>
                    <div className="relative">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        name="password"
                        className={`h-[52px] bg-white block border ${formik.errors.password && formik.touched.password ? "border-red-500" : "border-gray-300"} rounded-lg px-[15px] w-full mt-1 placeholder:text-sm outline-none`}
                        placeholder="Enter password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {passwordVisible ? (
                        <AiOutlineEye
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 cursor-pointer"
                          onClick={togglePasspwrdVisibility}
                        />
                      ) : (
                        <AiOutlineEyeInvisible
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 cursor-pointer"
                          onClick={togglePasspwrdVisibility}
                        />
                      )}
                    </div>
                    {formik.touched.password && formik.errors.password ? (
                      <div className="text-red-500 text-sm mt-1">
                        {formik.errors.password}
                      </div>
                    ) : null}
                  </div>
                  <Link
                    className="w-full text-end flex justify-end mt-3"
                    to="/forgot_password"
                  >
                    <span className="text-[#4B5563] w-full text-right text-sm font-normal">
                      Forgot Password?
                    </span>
                  </Link>
                  <div className="xl:mt-6 mt-5">
                    <button
                      disabled={btnLoader}
                      type="submit"
                      name="signin"
                      className="bg-[#293FE3] text-white rounded-lg h-[52px] w-full font-medium outline-none"
                    >
                      {btnLoader ? <DotLoader color="#fff" /> : " Sign in"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-span-6 lg:block hidden">
          <div className="flex items-center justify-center relative">
            <img src={loginBaner} alt="login" className="w-full h-screen" />
          </div>
        </div>
      </div>

      <Dialog
        open={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        size="sm"
        staticBackdrop
      >
        <Dialog.Panel>
          <Dialog.Title>
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-slate-800">
                Enable Notifications
              </h3>
            </div>
          </Dialog.Title>
          <Dialog.Description>
            <div className="px-5 py-4 text-slate-700">
              <p className="mb-3">
                Notifications are currently blocked for this site.
              </p>
              <p className="text-sm text-slate-600">
                To receive updates, allow notifications in your browser
                settings, then click Retry. You can also continue without
                notifications.
              </p>
            </div>
          </Dialog.Description>
          <Dialog.Footer>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleContinueWithout}
                className="h-[40px] px-4 rounded-md border border-slate-300 text-slate-700"
              >
                Continue without
              </button>
              <button
                onClick={handleRetryPermission}
                className="h-[40px] px-4 rounded-md bg-[#293FE3] text-white"
              >
                Retry
              </button>
            </div>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>
    </>
  );
};

export default Login;
