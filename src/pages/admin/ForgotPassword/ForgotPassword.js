import { useEffect, useState } from "react";
import login_logo from "../../../assets/logo/login_logo2.png";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import loginBaner from "../../../assets/images/Frame.png";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  forgotPasswordApi,
  otpVerificationApi,
  resetPasswordApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { DotLoader } from "../../../base-component/Loader/Loader";

const Login = () => {
  const [showPassword, setShowPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState("");
  const [flag, setFlag] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [hasTimerStarted, setHasTimerStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;

    if (flag === 2 && !hasTimerStarted) {
      setHasTimerStarted(true);
      setTimer(60);
    }

    if (flag === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [flag, timer, hasTimerStarted]);

  const validationSchemas = [
    Yup.object({
      email: Yup.string()
        .matches(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          "Invalid email address"
        )
        .required("Email is required")
    }),
    Yup.object({
      otp: Yup.array().of(Yup.string().required("OTP is required"))
    }),
    Yup.object({
      password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Must contain at least one uppercase letter")
        .matches(/[a-z]/, "Must contain at least one lowercase letter")
        .matches(/[0-9]/, "Must contain at least one number")
        .matches(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Must contain at least one special character"
        ),
      confirmpassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required")
    })
  ];

  const formik = useFormik({
    initialValues: {
      email: "",
      otp: ["", "", "", ""],
      password: "",
      confirmpassword: ""
    },
    validationSchema: validationSchemas[flag - 1],
    onSubmit: (values, { resetForm }) => {
      if (flag === 1) {
        setLoading(true);
        let params = {
          email: values.email,
          role: "school"
        };
        forgotPasswordApi(params)
          .then((res) => {
            const message = res?.data?.message;
            const status = res?.data?.status;
            if (status === 1) {
              setLoading(false);
              setFlag((prev) => prev + 1);
              setTimer(60);
              toast.success(message);
              resetForm({
                values: {
                  email: values.email,
                  otp: ["", "", "", ""],
                  password: "",
                  confirmpassword: ""
                }
              });
            } else {
              setLoading(false);
              toast.error(message);
            }
          })
          .catch((err) => {
            setLoading(false);
            const message = err?.response?.data?.message;
            if (message) {
              toast.error(message || "Somthing went wrong!!");
            }
          });
      } else if (flag === 2) {
        setLoading(true);
        let params = {
          email: values.email,
          otp: values.otp.join(""),
          role: "school"
        };
        otpVerificationApi(params)
          .then((res) => {
            const message = res?.data?.message;
            const status = res?.data?.status;
            if (status === 1) {
              setLoading(false);
              setFlag((prev) => prev + 1);
              toast.success(message);
              resetForm({
                values: {
                  email: values.email,
                  otp: ["", "", "", ""],
                  password: "",
                  confirmpassword: ""
                }
              });
            } else {
              setLoading(false);
              toast.error(message);
            }
          })
          .catch((err) => {
            setLoading(false);
            const message = err?.response?.data?.message;
            if (message) {
              toast.error(message || "Somthing went wrong!!");
            }
          });
      } else if (flag === 3) {
        setLoading(true);
        let params = {
          email: values.email,
          newPassword: values.confirmpassword
        };
        resetPasswordApi(params)
          .then((res) => {
            const message = res?.data?.message;
            const status = res?.data?.status;
            if (status === 1) {
              setLoading(false);
              navigate("/school_admin/login");
              toast.success(message);
              resetForm({
                values: {
                  email: values.email,
                  otp: ["", "", "", ""],
                  password: "",
                  confirmpassword: ""
                }
              });
            } else {
              setLoading(false);
              toast.error(message);
            }
          })
          .catch((err) => {
            setLoading(false);
            const message = err?.response?.data?.message;
            if (message) {
              toast.error(message || "Somthing went wrong!!");
            }
          });
      }
    }
  });

  const handleSendOrResendOTP = () => {
    if (flag !== 2) return;

    setSending(true);
    setTimer(60);
    setHasTimerStarted(true);

    let params = {
      email: formik.values.email,
      role: "school"
    };

    forgotPasswordApi(params)
      .then((res) => {
        const message = res?.data?.message;
        const status = res?.data?.status;
        if (status === 1) {
          setSending(false);
          toast.success(message);
        } else {
          setSending(false);
          toast.error(message);
        }
      })
      .catch((err) => {
        setSending(false);
        const message = err?.response?.data?.message;
        toast.error(message || "Something went wrong!!");
      });
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...formik.values.otp];
    newOtp[index] = value;

    formik.setFieldValue("otp", newOtp);

    if (value && index < newOtp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpBackspace = (e, index) => {
    if (e.key === "Backspace") {
      handleOtpChange("", index);
      if (index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  return (
    <div className="grid grid-cols-12 ">
      <div className="xl:col-span-6 lg:col-span-6 col-span-12 ">
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
            {flag === 1 && (
              <>
                <div className="text-black text-center">
                  <h3 className="md:text-2xl text-xl font-semibold pb-[10px]">
                    Forgot your Password?
                  </h3>
                  <p className="md:text-base text-sm">
                    Please enter your registered email to reset your password.
                  </p>
                </div>
                <form onSubmit={formik.handleSubmit}>
                  <div className="sm:mt-10 mt-7">
                    <div className="sm:mb-5 mb-4">
                      <label className="text-base text-black">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="h-[52px] bg-white block border border-[#E5E7EB] rounded-lg px-[15px] w-full mt-2 placeholder:text-sm outline-none"
                        placeholder="Enter email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <div className="text-red-500 text-sm mt-2">
                          {formik.errors.email}
                        </div>
                      )}
                    </div>
                    <div className="xl:mt-10 mt-5">
                      <button
                        type="submit"
                        name="signin"
                        disabled={loading}
                        className="bg-[#293FE3] text-white rounded-lg h-[52px] w-full text-sm font-medium outline-none"
                      >
                        {loading ? (
                          <DotLoader color="#fff" />
                        ) : (
                          " Forgot Password"
                        )}
                      </button>
                    </div>
                    <Link
                      className="w-full flex items-center gap-2 justify-center mt-5"
                      to={"/school_admin/login"}
                    >
                      <MdOutlineKeyboardBackspace className="text-[#293FE3] text-xl" />
                      <span className="text-[#293FE3] text-center text-sm font-normal underline underline-offset-4">
                        Back to Sign in
                      </span>
                    </Link>
                  </div>
                </form>
              </>
            )}
            {flag === 2 && (
              <>
                <div className="text-black text-center">
                  <h3 className="md:text-2xl text-xl font-semibold pb-[10px]">
                    Enter verification Code
                  </h3>
                  <p className="md:text-base text-sm">
                    We have just sent a 4-digit code to your registered email.
                  </p>
                </div>
                <form onSubmit={formik.handleSubmit}>
                  <div className="w-full max-w-lg mx-auto">
                    <div className="flex space-x-4 justify-center mt-10">
                      {formik.values.otp.map((_, index) => (
                        <div
                          key={index}
                          className="relative w-[64px] h-[64px] border border-[#9CA3AF] rounded-xl flex items-center justify-center"
                        >
                          <input
                            id={`otp-${index}`}
                            type="tel"
                            maxLength="1"
                            name={`otp[${index}]`}
                            value={formik.values.otp[index]}
                            onChange={(e) => {
                              formik.setFieldValue(
                                `otp[${index}]`,
                                e.target.value.replace(/[^0-9]/g, "")
                              );
                              if (e.target.value && index < 3) {
                                const next = document.getElementById(
                                  `otp-${index + 1}`
                                );
                                if (next) next.focus();
                              }
                            }}
                            onBlur={formik.handleBlur}
                            onKeyDown={(e) => handleOtpBackspace(e, index)}
                            autoFocus={index === 0}
                            className="absolute inset-0 w-full h-full font-medium text-center text-2xl text-[#0F1113] bg-transparent focus:outline-none"
                          />
                          {!formik.values.otp[index] && (
                            <span className="text-gray-400 text-lg select-none">
                              -
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {formik.touched.otp &&
                      typeof formik.errors.otp === "string" && (
                        <div className="text-red-500 text-sm mt-2 text-center">
                          {formik.errors.otp}
                        </div>
                      )}
                    <div className="text-center text-[#1F1F1F] mt-5 text-lg">
                      {timer > 0 ? (
                        `00:${timer < 10 ? `0${timer}` : timer}`
                      ) : (
                        <div>
                          <p className="text-[#4B5563] font-normal md:text-base text-sm mb-5">
                            Didn't receive the code?
                          </p>
                          <button
                            disabled={sending}
                            onClick={handleSendOrResendOTP}
                            className="text-[#1F1F1F] font-normal md:text-base text-sm bg-transparent"
                          >
                            Resend code
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="xl:mt-10 mt-5">
                      <button
                        type="submit"
                        disabled={loading}
                        name="signin"
                        className="bg-[#293FE3] text-white rounded-lg h-[52px] w-full md:text-base text-sm font-medium outline-none"
                      >
                        {loading ? <DotLoader color="#fff" /> : " Verify"}
                      </button>
                    </div>
                    <Link
                      className="w-full flex items-center gap-2 justify-center mt-5"
                      to={"/school_admin/login"}
                    >
                      <MdOutlineKeyboardBackspace className="text-[#293FE3] text-xl" />
                      <span className="text-[#293FE3] text-center md:text-base text-sm font-normal underline underline-offset-4">
                        Back to Sign in
                      </span>
                    </Link>
                  </div>
                </form>
              </>
            )}
            {flag === 3 && (
              <>
                <div className="text-black text-center">
                  <h3 className="2md:text-2xl text-xl font-semibold pb-[10px]">
                    Reset password
                  </h3>
                  <p className="md:text-base text-sm">
                    Choose a password that is both memorable and secure.
                  </p>
                </div>
                <form onSubmit={formik.handleSubmit}>
                  <div className="sm:mt-10 mt-7">
                    <div className="mb-5 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter new password"
                          className={`w-full border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none`}
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-3 -bottom-0 flex items-center text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <AiOutlineEye className="text-gray-500 text-xl" />
                          ) : (
                            <AiOutlineEyeInvisible className="text-gray-500 text-xl" />
                          )}
                        </button>
                      </div>
                      {formik.touched.password && formik.errors.password && (
                        <div className="text-red-500 text-sm mt-2">
                          {formik.errors.password}
                        </div>
                      )}
                    </div>
                    <div className="mb-5 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmpassword"
                          placeholder="Enter confirm password"
                          className={`w-full border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none`}
                          value={formik.values.confirmpassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-3 -bottom-0 flex items-center text-gray-500"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <AiOutlineEye className="text-gray-500 text-xl" />
                          ) : (
                            <AiOutlineEyeInvisible className="text-gray-500 text-xl" />
                          )}
                        </button>
                      </div>
                      {formik.touched.confirmpassword &&
                        formik.errors.confirmpassword && (
                          <div className="text-red-500 text-sm mt-2">
                            {formik.errors.confirmpassword}
                          </div>
                        )}
                    </div>
                    <div className="mt-10">
                      <button
                        type="submit"
                        disabled={loading}
                        name="signin"
                        className="bg-[#293FE3] text-white rounded-lg h-[52px] w-full md:text-base text-sm font-medium outline-none"
                      >
                        {loading ? (
                          <DotLoader color="#fff" />
                        ) : (
                          " Update Password"
                        )}
                      </button>
                    </div>
                    <Link
                      className="w-full flex items-center gap-2 justify-center mt-5"
                      to={"/school_admin/login"}
                    >
                      <MdOutlineKeyboardBackspace className="text-[#293FE3] text-xl" />
                      <span className="text-[#293FE3] text-center md:text-base text-sm font-normal underline underline-offset-4">
                        Back to Sign in
                      </span>
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="xl:col-span-6 lg:col-span-6 lg:block hidden">
        <div className="flex items-center justify-center relative">
          <img src={loginBaner} alt="" className="w-full h-screen" />
        </div>
      </div>
    </div>
  );
};

export default Login;
