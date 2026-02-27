import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import login_logo from "../../assets/logo/login_logo.png";
import login_logo2 from "../../assets/logo/Frame 2.png";
import { loginApi } from "../../services/api_services";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { DotLoader } from "../../base-component/Loader/Loader";
import { messaging } from "../../firebase/Firebase";
import { getToken } from "firebase/messaging";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  let deviceId = localStorage.getItem("device_Id");
  const [fcmToken, setFcmToken] = useState("");

  const requestPermissionAndGetToken = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
        });
        console.log("FCM Token:", token);
        setFcmToken(token);
        return token;
      } else {
        console.log("Notification permission not granted");
      }
    } catch (error) {
      console.error("Error getting FCM token:", error);
    }
  };

  useEffect(() => {
    requestPermissionAndGetToken();
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  useEffect(() => {
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("device_Id", deviceId);
    }
  }, [deviceId]);

  const initialValues = {
    email: "",
    password: ""
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email format"
      )
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required")
  });

  const handleSubmit = (values) => {
    setBtnLoader(true);
    let obj = {
      email: values.email,
      password: values.password,
      device_id: deviceId,
      device_token: fcmToken || "abc",
      device_type: "web",
      role: "super_admin"
    };

    loginApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          console.log(datas);

          // Determine user role from response - adjust based on your API response
          const userRole = datas?.role || "school_admin"; // Default to school_admin
          const dashboardPath =
            userRole === "super_admin"
              ? "/super_admin/dashboard"
              : "/school_admin/dashboard";

          // Store in context and localStorage
          login(res.data.token, userRole, datas);

          localStorage.setItem("refresh_token", res.data.refresh_token);
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
  };

  return (
    <div className="grid grid-cols-12">
      <div className="xl:col-span-5 lg:col-span-6 lg:block hidden">
        <div className="flex items-center justify-center h-screen">
          <img src={login_logo} alt="..." className="xl:w-[450px] lg:w-96" />
        </div>
      </div>
      <div className="xl:col-span-7 lg:col-span-6 col-span-12">
        <div className="h-screen flex items-center justify-center bg-[#293FE3]">
          <div className="xl:w-[490px] w-96 px-4">
            <div className="flex justify-center">
              <div className="mb-10 lg:hidden block">
                <img
                  src={login_logo2}
                  alt="..."
                  className="sm:w-[250px] w-[200px]"
                />
              </div>
            </div>
            <div className="text-white text-center">
              <h3 className="2xl:text-3xl sm:text-2xl text-xl font-semibold pb-[20px]">
                Sign in to your Account
              </h3>
              <p className="2xl:text-lg xl:text-base text-sm">
                Enter your Radiant Hyve account details to sign in and continue
                your learning journey.
              </p>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values }) => (
                <Form className="sm:mt-10 mt-7">
                  <div className="sm:mb-5 mb-4">
                    <label className="text-base text-white">Email</label>
                    <Field
                      type="text"
                      name="email"
                      className="h-[52px] bg-white block rounded-lg px-[15px] w-full sm:mt-3 mt-2 placeholder:text-sm outline-none"
                      placeholder="Enter email"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-400 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-base text-white">Password</label>
                    <div className="relative">
                      <Field
                        type={passwordVisible ? "text" : "password"}
                        name="password"
                        className="h-[52px] bg-white block rounded-lg px-[15px] w-full sm:mt-3 mt-2 placeholder:text-sm outline-none"
                        placeholder="Enter password"
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
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-400 text-sm mt-1"
                    />
                  </div>
                  <div className="mt-8">
                    <button
                      disabled={btnLoader}
                      type="submit"
                      name="signin"
                      className="bg-[#FFB30B] text-[#274372] rounded-lg h-[52px] w-full text-base font-medium outline-none"
                    >
                      {btnLoader ? <DotLoader color="#fff" /> : " Sign in"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
