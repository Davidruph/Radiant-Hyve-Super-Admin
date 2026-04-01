import { useEffect, useState } from "react";
import logo from "../../../assets/logo/Frame 1.png";
import authimg from "../../../assets/images/auth.svg";
import lock from "../../../assets/images/lock.svg";
import shield from "../../../assets/images/shield.svg";
import trusted from "../../../assets/images/trusted.svg";
import lockicon from "../../../assets/images/lockicon.svg";
import smalllock from "../../../assets/images/smalllock.svg";
import { Link, useNavigate } from "react-router-dom";
import authback from "../../../assets/images/authback.svg";
import smallshield from "../../../assets/images/smallshield.svg";
import smallencrypt from "../../../assets/images/smallencrypt.svg";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  forgotPasswordApi,
  otpVerificationApi,
  resetPasswordApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { DotLoader } from "../../../base-component/Loader/Loader";

const ForgotPassword = () => {
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
              toast.error(message || "Something went wrong!!");
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
              toast.error(message || "Something went wrong!!");
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
              navigate("/");
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
              toast.error(message || "Something went wrong!!");
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
          your childcare <br className="hidden lg:flex" /> operations—all in one
          secure platform.
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
        {flag === 1 && (
          <>
            <h3 className="new-auth-title pb-2">Forgot your Password?</h3>
            <p className="new-auth-sub mb-8">
              Please enter your registered email to reset your password.
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

              <button
                type="submit"
                disabled={loading}
                className="new-auth-button w-full h-[48px] my-6 disabled:opacity-50"
              >
                {loading ? <DotLoader color="#fff" /> : "Reset Password"}
              </button>
            </form>

            <Link className="w-full text-center mt-4" to="/">
              <span className="text-[#293FE3] text-center text-sm font-normal underline underline-offset-4">
                Back to Sign in
              </span>
            </Link>
          </>
        )}

        {flag === 2 && (
          <>
            <h3 className="new-auth-title pb-2">Enter Verification Code</h3>
            <p className="new-auth-sub mb-8">
              We have just sent a 4-digit code to your registered email.
            </p>

            <form onSubmit={formik.handleSubmit} className="w-full">
              <div className="flex space-x-3 justify-center my-8">
                {formik.values.otp.map((_, index) => (
                  <div key={index} className="relative">
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
                      className="w-[50px] h-[50px] border-[0.8px] border-[#D1D5DC] rounded-[10px] font-semibold text-center text-2xl text-[#0F1113] outline-none focus:border-[#293FE3]"
                    />
                  </div>
                ))}
              </div>
              {formik.touched.otp && typeof formik.errors.otp === "string" && (
                <div className="text-red-500 text-sm text-center mb-4">
                  {formik.errors.otp}
                </div>
              )}

              <div className="text-center text-[#1F1F1F] mt-6 mb-6 text-sm">
                {timer > 0 ? (
                  `Resend code in 00:${timer < 10 ? `0${timer}` : timer}`
                ) : (
                  <button
                    type="button"
                    disabled={sending}
                    onClick={handleSendOrResendOTP}
                    className="text-[#293FE3] font-semibold text-sm bg-transparent"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="new-auth-button w-full h-[48px] my-6 disabled:opacity-50"
              >
                {loading ? <DotLoader color="#fff" /> : "Verify"}
              </button>
            </form>

            <Link className="w-full text-center mt-4" to="/">
              <span className="text-[#293FE3] text-center text-sm font-normal underline underline-offset-4">
                Back to Sign in
              </span>
            </Link>
          </>
        )}

        {flag === 3 && (
          <>
            <h3 className="new-auth-title pb-2">Reset Password</h3>
            <p className="new-auth-sub mb-8">
              Choose a password that is both memorable and secure.
            </p>

            <form onSubmit={formik.handleSubmit} className="w-full">
              <div className="flex w-full flex-col gap-2 mb-5">
                <label htmlFor="password" className="new-auth-label">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={`h-[49.60000228881836px] w-full rounded-[10px] border-[0.8px] ${
                      formik.errors.password && formik.touched.password
                        ? "border-red-500"
                        : "border-[#D1D5DC]"
                    } py-[12px] px-[16px] outline-none`}
                    placeholder="Enter new password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <AiOutlineEye className="w-6 h-6" />
                    ) : (
                      <AiOutlineEyeInvisible className="w-6 h-6" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.password}
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col gap-2 mb-5">
                <label htmlFor="confirmpassword" className="new-auth-label">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmpassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmpassword"
                    className={`h-[49.60000228881836px] w-full rounded-[10px] border-[0.8px] ${
                      formik.errors.confirmpassword &&
                      formik.touched.confirmpassword
                        ? "border-red-500"
                        : "border-[#D1D5DC]"
                    } py-[12px] px-[16px] outline-none`}
                    placeholder="Enter confirm password"
                    value={formik.values.confirmpassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEye className="w-6 h-6" />
                    ) : (
                      <AiOutlineEyeInvisible className="w-6 h-6" />
                    )}
                  </button>
                </div>
                {formik.touched.confirmpassword &&
                  formik.errors.confirmpassword && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.confirmpassword}
                    </div>
                  )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="new-auth-button w-full h-[48px] my-6 disabled:opacity-50"
              >
                {loading ? <DotLoader color="#fff" /> : "Update Password"}
              </button>
            </form>

            <Link className="w-full text-center mt-4" to="/login">
              <span className="text-[#293FE3] text-center text-sm font-normal underline underline-offset-4">
                Back to Sign in
              </span>
            </Link>
          </>
        )}

        <div className="w-full h-[0.8px] bg-[#E5E7EB] my-4 mt-8" />

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
      </div>
    </section>
  );
};

export default ForgotPassword;
