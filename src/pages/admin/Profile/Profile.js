import React, { useEffect, useState } from "react";
import editIcon from "../../../assets/icons/edit.png";
import BackIcon from "../../../assets/icons/BackIcon.png";
import { useNavigate } from "react-router-dom";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoMdClose } from "react-icons/io";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import {
  changePasswordApi,
  editSchoolProfileApi,
  getProfileApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { DotLoader, OvalLoader } from "../../../base-component/Loader/Loader";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const Profile = () => {
  const navigate = useNavigate();
  const [openSchoolInfo, setOpenSchoolInfo] = useState(false);
  const [openAccountInfo, setOpenAccountInfo] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileDetails] = useState({});
  const [showPassword, setShowPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const customGoogleplaceStyles = (hasError) => ({
    control: (provided) => ({
      ...provided,
      border: `1px solid ${hasError ? "#EF4444" : "#E5E7EB"}`,
      borderRadius: "10px",
      padding: "4px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "none"
      },
      minHeight: "52px",
      width: "100%",
      textAlign: "start",
      fontSize: "14px"
    }),
    input: (provided) => ({
      ...provided,
      color: "#333",
      width: "100%",
      fontSize: "14px",
      textAlign: "start"
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#888",
      textAlign: "start",
      fontSize: "14px"
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "4px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#f1f1f1" : "white",
      color: "#333",
      padding: "10px 15px",
      cursor: "pointer",
      textAlign: "start",
      fontSize: "14px"
    })
  });

  const handleLatLog = (value, formik) => {
    if (value) {
      formik.setFieldValue("address", value.label || "");

      const placeId = value.value.place_id;
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );

      service.getDetails({ placeId }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          formik.setFieldValue("longitude", lng);
          formik.setFieldValue("latitude", lat);
        } else {
          console.error("Error fetching place details:", status);
        }
      });
    } else {
      formik.setFieldValue("address", "");
      formik.setFieldValue("longitude", "");
      formik.setFieldValue("latitude", "");
    }
  };

  const handleGetProfile = () => {
    setLoading(true);

    getProfileApi()
      .then((res) => {
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setProfileDetails(datas);
          setSchoolName(datas?.school_name);
          setAddress(datas?.address);
          setLatitude(datas?.latitude);
          setLongitude(datas?.longitude);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          navigate("/school_admin/login");
          localStorage.removeItem("radient_school_token");
          localStorage.removeItem("refresh_school_token");
          localStorage.removeItem("deviceIdSchool");
        } else {
          const errs = err?.response?.data;
          toast.error(errs?.message);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    handleGetProfile();
  }, []);

  const profileDetails = [
    {
      title: "School Information",
      information: [
        {
          name: "School Name",
          value: profileData?.school_name
        },
        {
          name: "School Address",
          value: profileData?.address
        }
      ]
    },
    {
      title: "Account Details",
      information: [
        {
          name: "Email",
          value: profileData?.email
        },
        {
          name: "Password",
          value: "**********"
        }
      ]
    }
  ];

  const validationSchema = Yup.object({
    oldPassword: Yup.string().required("Old password is required"),
    newPassword: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required")
  });

  const initialValues = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  };

  const handleSubmit = (values) => {
    setBtnLoader(true);

    let obj = {
      password: values?.oldPassword,
      newPassword: values?.newPassword
    };

    changePasswordApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setOpenAccountInfo(false);
          toast.success(message);
        }
        setBtnLoader(false);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          navigate("/school_admin/login");
          localStorage.removeItem("radient_school_token");
          localStorage.removeItem("refresh_school_token");
          localStorage.removeItem("deviceIdSchool");
        } else {
          const errs = err?.response?.data;
          toast.error(errs?.message);
        }
        setBtnLoader(false);
      });
  };

  const validation = Yup.object({
    schoolName: Yup.string()
      .required("School name is required")
      .min(2, "Must be at least 2 characters"),
    address: Yup.string()
      .required("Address is required")
      .min(5, "Must be at least 5 characters"),
    latitude: Yup.number().required("Latitude is required"),
    longitude: Yup.number().required("Longitude is required")
  });

  const initial = {
    schoolName,
    address,
    longitude,
    latitude
  };

  const handleSubmitButton = (values) => {
    setBtnLoader(true);

    let obj = {
      name: values?.schoolName,
      longitude: values?.longitude,
      latitude: values?.latitude,
      address: values?.address
    };

    editSchoolProfileApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          handleGetProfile();
          setOpenSchoolInfo(false);
          toast.success(message);
        }
        setBtnLoader(false);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          navigate("/school_admin/login");
          localStorage.removeItem("radient_school_token");
          localStorage.removeItem("refresh_school_token");
          localStorage.removeItem("deviceIdSchool");
        } else {
          const errs = err?.response?.data;
          toast.error(errs?.message);
        }
        setBtnLoader(false);
      });
  };

  return (
    <>
      <div className="mb-5">
        <button
          className="flex items-center gap-2"
          onClick={() => navigate("/school_admin/dashboard")}
        >
          <img src={BackIcon} className="w-[38px] h-[38px]" alt="" />
          <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
            Back
          </span>
        </button>
      </div>

      {loading ? (
        <OvalLoader />
      ) : (
        <>
          {profileDetails &&
            profileDetails?.map((item, index) => (
              <div
                key={index}
                className={`bg-[#FFFFFF] 2xl:w-[1032px] xl:w-[900px] lg:w-[700px] md:w-[600px] sm:w-[500px] w-full rounded-lg px-6 py-5 ${index === 0 ? "mb-5" : ""}`}
              >
                <div className="sm:flex items-center justify-between">
                  <h3 className="md:text-lg text-base font-semibold">
                    {item?.title}
                  </h3>
                  <button
                    className="bg-[#FFF7E7] flex items-center justify-center gap-2 py-1.5 sm:w-[132px] w-28 h-9 rounded-lg sm:mt-0 mt-4"
                    onClick={() => {
                      if (item?.title === "School Information") {
                        setOpenSchoolInfo(true);
                      } else {
                        setOpenAccountInfo(true);
                      }
                    }}
                  >
                    <img src={editIcon} alt="..." className="w-[22px]" />
                    <span className="text-[#4B5563] text-sm">Edit</span>
                  </button>
                </div>

                <div className="border border-[#F3F4F6] mt-4 mb-5"></div>
                {item?.information?.map((ele, i) => (
                  <div
                    key={i}
                    className={`md:flex items-center justify-between ${i === 0 ? "mb-4" : ""}`}
                  >
                    <h4 className="text-sm text-[#4B5563] md:mb-0 mb-1">
                      {ele?.name}
                    </h4>
                    <p className="text-sm text-[#1F1F1F] lg:w-auto md:w-72">
                      {ele?.value}
                    </p>
                  </div>
                ))}
              </div>
            ))}
        </>
      )}

      <Dialog
        open={openSchoolInfo}
        onClose={() => setOpenSchoolInfo(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-xl text-lg font-semibold text-[#1F1F1F]">
                  Update School Information
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setOpenSchoolInfo(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <Formik
                initialValues={initial}
                validationSchema={validation}
                enableReinitialize
                onSubmit={handleSubmitButton}
              >
                {(formik) => (
                  <Form className="mt-7">
                    <div className="px-2">
                      <div className="mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          School Name
                        </label>
                        <Field
                          name="schoolName"
                          type="text"
                          placeholder="Enter the school name"
                          className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                        <ErrorMessage
                          name="schoolName"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <GooglePlacesAutocomplete
                        apiKey="AIzaSyBBLcXrmcY2pdzrI4uiyhFdOefMDZhxVc4"
                        selectProps={{
                          placeholder: "Search location",
                          isClearable: true,
                          styles: customGoogleplaceStyles(
                            formik.touched.address && formik.errors.address
                          ),
                          name: "address",
                          value: formik.values.address
                            ? {
                                label: formik.values.address,
                                value: formik.values.address
                              }
                            : null,
                          onChange: (value) => handleLatLog(value, formik)
                        }}
                        className="w-full text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:outline-none"
                      />
                      <ErrorMessage
                        name="address"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="mt-10 flex justify-between w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setOpenSchoolInfo(false)}
                        className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#9810FA] text-white font-medium text-sm w-full h-12 rounded-lg"
                      >
                        {btnLoader ? <DotLoader color="#fff" /> : "update"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={openAccountInfo}
        onClose={() => setOpenAccountInfo(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-xl text-lg font-semibold text-[#274372]">
                  Update Account Information
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setOpenAccountInfo(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {() => (
                  <Form className="mt-7">
                    <div className="px-2">
                      <div className="mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileData?.email}
                          disabled
                          readOnly
                          className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg disabled:text-[#6B7280] focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                      </div>

                      {/* Old Password */}
                      <div className="mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Old Password
                        </label>
                        <div className="relative">
                          <Field
                            name="oldPassword"
                            type={showOldPassword ? "text" : "password"}
                            placeholder="Enter old password"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-3 -bottom-0 flex items-center"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                          >
                            {showOldPassword ? (
                              <AiOutlineEye />
                            ) : (
                              <AiOutlineEyeInvisible />
                            )}
                          </button>
                        </div>
                        <ErrorMessage
                          name="oldPassword"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      {/* New Password */}
                      <div className="mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Field
                            name="newPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-3 -bottom-0 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <AiOutlineEye />
                            ) : (
                              <AiOutlineEyeInvisible />
                            )}
                          </button>
                        </div>
                        <ErrorMessage
                          name="newPassword"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      {/* Confirm Password */}
                      <div className="mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Field
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Enter confirm password"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-3 -bottom-0 flex items-center"
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
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>

                    <div className="mt-10 flex justify-between w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setOpenAccountInfo(false)}
                        className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={btnLoader}
                        type="submit"
                        className="bg-[#9810FA] text-white font-medium text-sm w-full h-12 rounded-lg"
                      >
                        {btnLoader ? <DotLoader color="#fff" /> : "update"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </>
  );
};

export default Profile;
