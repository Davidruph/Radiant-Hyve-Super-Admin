import React, { useEffect, useState } from "react";
import logo from "../../assets/logo/Frame 1.png";
import authimg from "../../assets/images/auth.svg";
import lock from "../../assets/images/lock.svg";
import shield from "../../assets/images/shield.svg";
import trusted from "../../assets/images/trusted.svg";
import lockicon from "../../assets/images/lockicon.svg";
import smalllock from "../../assets/images/smalllock.svg";
import { Link, useNavigate } from "react-router-dom";
import authback from "../../assets/images/authback.svg";
import smallshield from "../../assets/images/smallshield.svg";
import smallencrypt from "../../assets/images/smallencrypt.svg";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import * as Yup from "yup";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { DotLoader } from "../../base-component/Loader/Loader";
import { loginApi } from "../../services/api_services";
import { getToken } from "firebase/messaging";
import { messaging } from "../../firebase/Firebase";
import Dialog from "../../base-component/Dialog/Dialog";
import { useAuth } from "../../context/AuthContext";
import logoBlack from "../../assets/logo/blacklogo.svg";

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
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

  const togglePasswordVisibility = () => {
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
        device_token: fcmToken || "abc"
      };

      loginApi(obj)
        .then((res) => {
          const message = res.data.message;
          if (res.data.status === 1) {
            const datas = res?.data?.data;
            const userRole = datas?.role;
            console.log("user data:", res?.data);

            // Check if user role is allowed for web login
            if (userRole !== "school" && userRole !== "super_admin") {
              toast.error(
                "This role is only available on the mobile app. Please use the mobile app to continue."
              );
              setBtnLoader(false);
              return;
            }

            // Determine dashboard path based on role
            const dashboardPath =
              userRole === "school"
                ? "/school_admin/dashboard"
                : "/super_admin/dashboard";

            // Store in AuthContext and localStorage
            authLogin(res.data.token, userRole, datas);
            localStorage.setItem("refresh_token", res?.data?.refresh_token);

            navigate(dashboardPath);
            toast.success(message);
          }
          setBtnLoader(false);
        })
        .catch((err) => {
          const errs = err?.response?.data;
          toast.error(errs?.message || "Login failed");
          setBtnLoader(false);
        });
    }
  });
  return (
    <>
      <section className="w-full h-screen p-0 flex">
        <div className="w-1/2 new-auth-bg md:flex flex-col items-center justify-center hidden px-8">
          <img src={logo} alt="" className="w-[259px] h-[48px] mb-8" />

          <h2 className="new-auth-header mb-6 text-[36px] md:text-[48px]">
            Welcome to Your <br className="hidden lg:flex" />
            Childcare Hub
          </h2>

          <p className="new-auth-text mb-6">
            Sign in to manage students, communicate with parents,{" "}
            <br className="hidden lg:flex" /> track attendance, and streamline
            your childcare <br className="hidden lg:flex" /> operations—all in
            one secure platform.
          </p>

          <img src={authimg} alt="Authentication" />

          <div className="w-full max-w-[480px] flex items-center justify-around">
            <div className="flex items-center flex-col justify-center gap-2">
              <img src={shield} alt="shield" />
              <p className="auth-tag">Secure</p>
            </div>

            <div className="flex items-center flex-col justify-center gap-2">
              <img src={trusted} alt="trusted" />
              <p className="auth-tag">Trusted</p>
            </div>

            <div className="flex items-center flex-col justify-center gap-2">
              <img src={lock} alt="lock" />
              <p className="auth-tag">Private</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white flex flex-col items-start justify-center py-8 md:py-12 lg:py-[148.84px] px-6 md:px-12 lg:px-[156.2px]">
          <div className="flex w-full justify-start mb-8 md:hidden">
            <img src={logoBlack} alt="Logo" className="w-[259px] h-[48px]" />
          </div>
          <h3 className="new-auth-title pb-2">Sign In to Radiant Hyve</h3>
          <p className="new-auth-sub mb-8">
            Enter your credentials to access your account
          </p>

          <form onSubmit={formik.handleSubmit} className="w-full">
            <div className="flex w-full flex-col gap-2 mb-5">
              <label htmlFor="email" className="new-auth-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                className={`h-[49.60000228881836px] w-full rounded-[10px] border-[0.8px] ${
                  formik.errors.email && formik.touched.email
                    ? "border-red-500"
                    : "border-[#D1D5DC]"
                } py-[12px] px-[16px] outline-none`}
                placeholder="Enter email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.email}
                </div>
              ) : null}
            </div>

            <div className="flex w-full flex-col gap-2 mb-5">
              <label htmlFor="password" className="new-auth-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  className={`h-[49.60000228881836px] w-full rounded-[10px] border-[0.8px] ${
                    formik.errors.password && formik.touched.password
                      ? "border-red-500"
                      : "border-[#D1D5DC]"
                  } py-[12px] px-[16px] outline-none`}
                  placeholder="Enter password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {passwordVisible ? (
                  <AiOutlineEye
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 cursor-pointer"
                    onClick={togglePasswordVisibility}
                  />
                ) : (
                  <AiOutlineEyeInvisible
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 cursor-pointer"
                    onClick={togglePasswordVisibility}
                  />
                )}
              </div>
              {formik.touched.password && formik.errors.password ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.password}
                </div>
              ) : null}
            </div>

            <div className="flex w-full justify-between items-center mt-5">
              <p className="auth-remember">Remember me</p>{" "}
              <Link className="auth-forgot-password" to="/forgot_password">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={btnLoader}
              className="new-auth-button w-full h-[48px] my-6 disabled:opacity-50"
            >
              {btnLoader ? <DotLoader color="#fff" /> : "Sign In"}
            </button>
          </form>

          <div className="w-full h-[0.8px] bg-[#E5E7EB] my-4" />

          <div className="flex w-full items-center justify-around mt-3 flex-wrap gap-4">
            <div className="flex flex-col gap-2 items-center justify-center">
              <img src={lockicon} alt="lock icon" width="20" height="20" />
              <p className="auth-tag-text">Secure Login</p>
            </div>

            <div className="flex flex-col gap-2 items-center justify-center">
              <img
                src={smallshield}
                alt="small shield icon"
                width="20"
                height="20"
              />
              <p className="auth-tag-text">Role-Based Access</p>
            </div>

            <div className="flex flex-col gap-2 items-center justify-center">
              <img
                src={smallencrypt}
                alt="small encrypt icon"
                width="20"
                height="20"
              />
              <p className="auth-tag-text">Encrypted Data</p>
            </div>
          </div>

          <p className="auth-question w-full text-center mt-6">
            Don't have access? <span>Contact your school administrator</span>
          </p>

          <p className="auth-tag-auth flex w-full items-center gap-2 justify-center mt-6">
            <img src={smalllock} alt="small lock icon" />
            Your data is securely protected and encrypted.
          </p>

          <Link
            to="/"
            className="auth-back mt-6 flex items-center gap-2 justify-center w-full"
          >
            <img src={authback} alt="back icon" />
            Back to Home
          </Link>
        </div>
      </section>

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
