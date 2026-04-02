import React, { useState } from "react";
import { HiBars3 } from "react-icons/hi2";
import notification from "../../assets/icons/notification.png";
import notificationIcon from "../../assets/icons/notificationIcon.png";
import logOutIcon from "../../assets/icons/logout.png";
import logOut from "../../assets/icons/logOutIcon.png";
import keyIcon from "../../assets/icons/key.png";
import logo from "../../assets/logo/blacklogo.svg";
import { useNavigate } from "react-router-dom";
import Popover from "../../base-component/Popover/Popover";
import { notificationsData } from "../../data/Data";
import { IoMdClose } from "react-icons/io";
import Menu from "../../base-component/Menu/Menu";
import Dialog from "../../base-component/Dialog/Dialog";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useFormik } from "formik";
import * as Yup from "yup";
import { changePasswordApi, logoutApi } from "../../services/api_services";
import toast from "react-hot-toast";
import { DotLoader } from "../../base-component/Loader/Loader";
import { useAuth } from "../../context/AuthContext";
import dropicon from "../../assets/images/drop.svg";

const Header = (props) => {
  const [changePassModal, setChangePassModal] = useState(false);
  const [logOutModal, setLogOutModal] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [btnLoader, setbtnLoader] = useState(false);
  const [showPassword, setShowPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState("");
  // const location = useLocation();
  // const isHiddenRoute = matchPath(
  //   "/super_admin/manage_school/school_details/:id",
  //   location.pathname
  // );
  const navigate = useNavigate();
  const { logout, user, role } = useAuth();
  console.log("User in Header:", user, role);

  // Get user's full name and generate initials
  const userName = user?.full_name || user?.email || "User";
  const userInitials = userName
    .split(" ")
    .map((name) => name.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  const userRole = user?.role || role;

  const [searchValue, setSearchValue] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/school_admin/search?q=${encodeURIComponent(searchValue)}`);
      setSearchValue("");
    }
  };

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required("Old password is required"),
      newPassword: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("New password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Passwords must match")
        .required("Confirm your password")
    }),

    onSubmit: (values) => {
      setbtnLoader(true);

      const obj = {
        password: values?.oldPassword,
        newPassword: values?.newPassword
      };

      changePasswordApi(obj)
        .then((res) => {
          if (res.status === 200) {
            toast.success(res?.data.message);
            setChangePassModal(false);
            formik.resetForm();
          }
          setbtnLoader(false);
        })
        .catch((err) => {
          if (err?.response?.status === 401) {
            localStorage.removeItem("device_Id");
            localStorage.removeItem("radient-admin-token");
            localStorage.removeItem("refresh_token");
            navigate("/super_admin");
          } else {
            toast.error(err?.response?.data?.message);
          }
          setbtnLoader(false);
        });
    }
  });

  const handleLogoutApi = () => {
    setbtnLoader(true);
    logoutApi()
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          logout(); // Use AuthContext logout instead of manual clearing
          setLogOutModal(false);
          navigate("/login");
        }
        setbtnLoader(false);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          logout(); // Clear auth state on 401
          navigate("/login");
        } else {
          toast.error(err?.response?.data?.message || "Logout failed");
        }
        setbtnLoader(false);
      });
  };

  return (
    <div>
      <div className="bg-[#F3F5F9]">
        <header className="sticky top-0 flex w-full bg-[#FFFFFFCC] header-bg  overflow-visible">
          <div
            className="px-6 py-5 cursor-pointer hidden lg:flex items-center"
            onClick={() => navigate("/")}
          >
            <img src={logo} className="w-[200px] h-[40px]" alt="Logo" />
          </div>
          <div className="flex flex-grow items-center justify-between lg:justify-between py-4 px-4 shadow-2 md:px-6">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <button
                aria-controls="sidebar"
                className="block rounded-sm bg-none p-1.5 shadow-sm 2xl:hidden xl:hidden lg:hidden"
                onClick={() => {
                  props.setSidebarOpen(!props.sidebarOpen);
                }}
              >
                <HiBars3
                  className={`text-3xl text-black ${!props?.sidebarOpen && "w-full delay-300"}`}
                />
              </button>
              {/* {!isHiddenRoute && (
                <div className="sm:flex items-center hidden">
                  <p className="text-[#274372] 2xl:text-xl text-lg font-semibold">
                    {props.activeTab}
                  </p>
                </div>
              )}
              {isHiddenRoute && (
                <div className="sm:flex items-center hidden">
                  <p className="text-[#274372] 2xl:text-xl text-lg font-semibold">
                    School Details
                  </p>
                </div>
              )} */}
              {/* <form
                onSubmit={handleSearchSubmit}
                className="hidden md:flex items-center bg-white border border-[#E5E7EB] rounded-lg px-4 py-2 ml-4 w-full max-w-2xl relative"
              >
                <input
                  type="text"
                  placeholder="Search students, staff, parents..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="outline-0 bg-transparent text-sm text-[#6B7280] w-full"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 text-[#9CA3AF]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </form> */}
            </div>
            <div className="flex items-center 2xl:gap-6 xl:gap-2 md:gap-2 gap-2">
              <div>
                <Popover className="relative">
                  {({ close }) => (
                    <>
                      <Popover.Button className="outline-0">
                        <div className="w-[40px] h-[40px] rounded-full border-2 border-[#D1D5DB] bg-white flex items-center justify-center">
                          <img
                            src={notification}
                            alt="..."
                            className="md:w-6 md:h-6 w-5 h-5"
                          />
                        </div>
                      </Popover.Button>

                      <Popover.Panel
                        id="notifyside"
                        className="lg:w-[450px] sm:w-[380px] w-[270px] overflow-x-hidden mt-2 fixed z-[9999] bg-white rounded-lg shadow-2xl border border-[#E5E7EB] top-20 right-4 left-auto"
                      >
                        <div className="flex items-center justify-between relative md:py-5 py-3 sm:px-6 px-3 border-b border-[#E5E7EB]">
                          <h3 className="text-[#0F1113] font-semibold md:text-lg text-base">
                            Notifications
                          </h3>
                          <button
                            className="absolute md:top-4 top-3 right-3"
                            onClick={close}
                          >
                            <IoMdClose className="text-2xl text-black" />
                          </button>
                        </div>
                        <div className="cursor-pointer sm:px-6 px-3 mt-5 md:h-[400px] h-[350px] popoverheight overflow-y-auto">
                          {notificationsData.map((items, index) => {
                            return (
                              <div
                                key={index}
                                className="flex justify-start items-start py-4 hover:bg-[#F3F4F6] rounded-lg duration-200 border-b border-[#E5E7EB]"
                                onClick={close}
                              >
                                <img
                                  src={notificationIcon}
                                  crossOrigin="anonymous"
                                  className="sm:w-12 w-10 sm:h-12 h-10 object-cover rounded-full"
                                  alt=""
                                />
                                <div className="ps-3">
                                  <p className="m-0 text-black font-medium sm:text-base text-sm">
                                    {items.message || "-"}
                                  </p>
                                  <p className="sm:text-sm text-xs text-gray-500">
                                    {items.timestamp}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Popover.Panel>
                    </>
                  )}
                </Popover>
              </div>
              <div>
                <Menu>
                  <Menu.Button className="block">
                    {/* <div className="xl:w-[48px] xl:h-[48px] md:w-11 md:h-11 w-10 h-10 rounded-full border-2 border-[#D1D5DB] bg-white flex items-center justify-center">
                      <img
                        src={radianthvye_logo}
                        alt="..."
                        className="md:w-6 md:h-6 w-5 h-5"
                      />
                    </div> */}
                    <div className="flex gap-2 items-center w-auto rounded-[14px] p-[12px]">
                      <div className="w-[36px] h-[36px] avatar-box rounded-[10px] flex items-center justify-center text-white font-semibold text-sm">
                        {userInitials}
                      </div>
                      <div className="flex flex-col">
                        <p className="auth-name">{userName}</p>
                        <p className="auth-role">
                          {userRole === "school"
                            ? "Administrator"
                            : userRole === "super_admin"
                              ? "Super Admin"
                              : userRole}
                        </p>
                      </div>
                      <img src={dropicon} alt="drop down" />
                    </div>
                  </Menu.Button>
                  <Menu.Items className="w-60 bg-white mt-2 absolute z-[9999] right-0 shadow-2xl border border-[#E5E7EB] rounded-lg">
                    <Menu.Item
                      className=" text-[#0F1113] flex font-normal md:text-base text-sm items-center py-2 border-b border-[#E5E7EB]"
                      onClick={() => {
                        setChangePassModal(true);
                      }}
                    >
                      <img src={keyIcon} alt="" className="w-[20px] h-[20px]" />
                      <div className="flex items-center">
                        <p className="m-0 ms-3">Change Password</p>
                      </div>
                    </Menu.Item>
                    <Menu.Item
                      className="text-[#FF7373] flex font-normal md:text-base text-sm items-center py-2"
                      onClick={() => {
                        setLogOutModal(true);
                      }}
                    >
                      <img
                        src={logOutIcon}
                        alt=""
                        className="w-[20px] h-[20px]"
                      />
                      <div className="flex items-center">
                        <p className="m-0 ms-3">Log out</p>
                      </div>
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              </div>
            </div>
          </div>
        </header>
      </div>

      <Dialog
        open={changePassModal}
        onClose={() => setChangePassModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-xl text-lg font-semibold text-[#274372]">
                  Change Password
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setChangePassModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <form className="mt-7" onSubmit={formik.handleSubmit}>
                <div className="px-2">
                  <div className="mb-4 text-start">
                    <label className="block text-[#4B5563] font-normal text-sm mb-2">
                      Old Password
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        name="oldPassword"
                        placeholder="Enter old password"
                        className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.oldPassword}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? (
                          <AiOutlineEye />
                        ) : (
                          <AiOutlineEyeInvisible />
                        )}
                      </button>
                    </div>
                    {formik.touched.oldPassword &&
                      formik.errors.oldPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {formik.errors.oldPassword}
                        </p>
                      )}
                  </div>

                  <div className="mb-4 text-start">
                    <label className="block text-[#4B5563] font-normal text-sm mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="Enter new password"
                        className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.newPassword}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <AiOutlineEye />
                        ) : (
                          <AiOutlineEyeInvisible />
                        )}
                      </button>
                    </div>
                    {formik.touched.newPassword &&
                      formik.errors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {formik.errors.newPassword}
                        </p>
                      )}
                  </div>

                  <div className="mb-4 text-start">
                    <label className="block text-[#4B5563] font-normal text-sm mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Enter confirm password"
                        className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.confirmPassword}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <AiOutlineEye />
                        ) : (
                          <AiOutlineEyeInvisible />
                        )}
                      </button>
                    </div>
                    {formik.touched.confirmPassword &&
                      formik.errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {formik.errors.confirmPassword}
                        </p>
                      )}
                  </div>
                </div>

                <div className="mt-6 flex justify-between w-full mb-3">
                  <button
                    type="button"
                    onClick={() => setChangePassModal(false)}
                    className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#9810FA] text-white font-medium text-sm w-full h-12 rounded-lg"
                  >
                    {btnLoader ? <DotLoader color="#fff" /> : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={logOutModal}
        onClose={() => setLogOutModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-xl text-lg font-semibold text-[#1F1F1F]">
                  Log Out of the System
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setLogOutModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <div className="mt-7">
                <div className="px-2">
                  <div className="w-full flex items-center justify-center">
                    <img src={logOut} className="w-[104px] h-[104px]" alt="" />
                  </div>
                  <div className="w-full mt-5 text-center">
                    <h4 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
                      Are you sure you want to log out?
                    </h4>
                    <p className="text-[#4B5563] font-normal  text-sm">
                      Logging out will end your current session, and you’ll need
                      to sign in again to access your account.
                    </p>
                  </div>
                </div>
                <div className="mt-10 flex justify-between w-full mb-3">
                  <button
                    type="button"
                    onClick={() => setLogOutModal(false)}
                    className="bg-[#DFE3EA] w-full font-medium h-12 text-sm text-[#6B7280] rounded-lg mr-5"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={btnLoader}
                    type="submit"
                    className="bg-[#FF7373] text-white font-medium h-12 text-sm w-full rounded-lg"
                    onClick={() => handleLogoutApi()}
                  >
                    {btnLoader ? <DotLoader color="#fff" /> : " Yes, Log Out"}
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

export default Header;
