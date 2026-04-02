import React, { useEffect, useState } from "react";
import EditIcon from "../../../assets/icons/edit.png";
import DeleteIcon from "../../../assets/icons/trash.png";
import BackIcon from "../../../assets/icons/BackIcon.png";
import DeleteModalIcon from "../../../assets/icons/DeleteIcon(1).png";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoMdClose } from "react-icons/io";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import {
  changePasswordSchoolApi,
  deleteSchoolApi,
  editSchoolApi,
  getSchoolApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { DotLoader, OvalLoader } from "../../../base-component/Loader/Loader";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

export default function SchoolDetails() {
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [schoolDetails, setSchoolDetails] = useState({});
  const [allCount, setAllCount] = useState({});
  const [loader, setLoader] = useState(false);
  const [btnLoader, setbtnLoader] = useState(false);
  const [editAccountModal, setEditAccountModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteReasonError, setDeleteReasonError] = useState("");

  const handleGetSchoolDetails = () => {
    setLoader(true);

    let param = {
      id: id
    };

    getSchoolApi(param)
      .then((res) => {
        const data = res?.data?.data;
        if (res.status == 200) {
          setSchoolDetails(data);
          setAllCount({
            teacher_count: res?.data?.teacher_count,
            principal_count: res?.data?.principal_count,
            parent_count: res?.data?.parent_count,
            student_count: res?.data?.student_count,
            latitude: res?.data?.latitude,
            longitude: res?.data?.longitude
          });
        }
        setLoader(false);
      })
      .catch((err) => {
        const errs = err?.response?.data;
        setLoader(false);
        if (err.response.status === 401) {
          if (errs?.errors) {
            toast.error(errs?.errors[0].msg);
          } else {
            toast.error(errs?.message);
          }
          localStorage.removeItem("device_Id");
          localStorage.removeItem("radient-admin-token");
          localStorage.removeItem("refresh_token");
          navigate("/super_admin/login");
        } else {
          if (errs?.errors) {
            toast.error(errs?.errors[0].msg);
          } else {
            toast.error(errs?.message);
          }
          if (errs.status === 2) {
            navigate("/super_admin/manage_school");
          }
        }
      });
  };

  useEffect(() => {
    handleGetSchoolDetails();
  }, [id]);

  const schoolData = [
    {
      section: "School Details",
      details: [
        { label: "School Name", value: schoolDetails?.school_name },
        { label: "School Address", value: schoolDetails?.address }
      ]
    },
    {
      section: "Account Details",
      details: [
        { label: "Email", value: schoolDetails?.email },
        { label: "Password", value: "Test@123" }
      ]
    }
  ];

  const StaffData = [
    { title: "Total Principal", value: allCount?.principal_count },
    { title: "Total Teachers", value: allCount?.teacher_count },
    { title: "Total Student", value: allCount?.student_count },
    { title: "Total Parents", value: allCount?.parent_count }
  ];

  const initialValues = {
    schoolName: schoolDetails?.school_name || "",
    schoolAddress: schoolDetails?.address || "",
    latitude: schoolDetails?.latitude || "",
    longitude: schoolDetails?.longitude || ""
  };

  const validationSchema = Yup.object().shape({
    schoolName: Yup.string().required("School name is required"),
    schoolAddress: Yup.string().required("School address is required"),
    latitude: Yup.number().required("Latitude is required"),
    longitude: Yup.number().required("Longitude is required")
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    setbtnLoader(true);

    let param = {
      id: id,
      name: values?.schoolName,
      address: values?.schoolAddress,
      latitude: values?.latitude,
      longitude: values?.longitude
    };

    editSchoolApi(param)
      .then((res) => {
        const data = res?.data;

        if (res.status == 200) {
          setEditModal(false);
          setSubmitting(false);
          resetForm();
          handleGetSchoolDetails();
          toast.success(data?.message);
        }
        setbtnLoader(false);
      })
      .catch((err) => {
        const errs = err?.response?.data;
        setbtnLoader(false);

        if (err.response.status === 401) {
          if (errs?.errors) {
            toast.error(errs?.errors[0].msg);
          } else {
            toast.error(errs?.message);
          }
          localStorage.removeItem("device_Id");
          localStorage.removeItem("radient-admin-token");
          localStorage.removeItem("refresh_token");
          navigate("/super_admin/login");
        } else {
          if (errs?.errors) {
            toast.error(errs?.errors[0].msg);
          } else {
            toast.error(errs?.message);
          }
        }
      });
  };

  const handleDelete = () => {
    if (!deleteReason.trim()) {
      setDeleteReasonError("Reason is required to delete the account.");
      return;
    }

    setbtnLoader(true);
    deleteSchoolApi(id, deleteReason)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          navigate("/super_admin/manage_school");
        }
        setDeleteModal(false);
        setbtnLoader(false);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem("device_Id");
          localStorage.removeItem("radient-admin-token");
          localStorage.removeItem("refresh_token");
          navigate("/super_admin");
        } else {
          toast.error("Error fetching data:", err);
        }
        setbtnLoader(false);
      });
  };

  const initial = {
    email: schoolDetails?.email,
    newPassword: "",
    confirmPassword: ""
  };

  const validation = Yup.object().shape({
    newPassword: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required")
  });

  const handleChangePassword = (values, { setSubmitting }) => {
    setbtnLoader(true);
    const obj = {
      id: id,
      password: values.newPassword
    };

    changePasswordSchoolApi(obj)
      .then((res) => {
        if (res.status === 200) {
          toast.success(res?.data.message);
          handleGetSchoolDetails();
        }
        setEditAccountModal(false);
        setbtnLoader(false);
        setSubmitting(false);
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
        setSubmitting(false);
      });
  };

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
      formik.setFieldValue("schoolAddress", value.label || "");

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
      formik.setFieldValue("schoolAddress", "");
      formik.setFieldValue("longitude", "");
      formik.setFieldValue("latitude", "");
    }
  };

  return (
    <div>
      <div className="mb-5">
        <button
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <img src={BackIcon} className="w-[38px] h-[38px]" alt="" />
          <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
            Back
          </span>
        </button>
      </div>

      {loader ? (
        <OvalLoader />
      ) : (
        <div className="grid grid-cols-12 gap-5 w-full">
          <div className="xl:col-span-4 col-span-12 bg-white rounded-xl p-4">
            <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-5">
              Staff Details
            </h2>
            <div className="w-full">
              {StaffData.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#F9F9F9] p-5 my-4 rounded-xl w-full flex items-center justify-between"
                >
                  <h3 className="text-[#3B4045] font-medium text-base">
                    {item.title}
                  </h3>
                  <span className="text-[#3B4045] md:text-xl text-lg font-semibold">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-8 col-span-12 space-y-5">
            {schoolData.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="bg-white p-5 rounded-xl w-full"
              >
                <div className="w-full flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-2 justify-between">
                  <h3 className="text-[#1F1F1F] font-semibold text-base">
                    {section.section}
                  </h3>
                  {section.section === "School Details" ? (
                    <div className="flex items-center gap-2">
                      <button
                        className="bg-[#FFF7E7] px-3 py-2 flex items-center gap-2 rounded-xl"
                        onClick={() => setEditModal(true)}
                      >
                        <img
                          src={EditIcon}
                          className="w-[20px] h-[20px]"
                          alt="Edit"
                        />
                        <span className="text-[#4B5563] font-normal text-sm">
                          Edit School
                        </span>
                      </button>
                      <button
                        className="bg-[#FFDED8] px-3 py-2 flex items-center gap-2 rounded-xl"
                        onClick={() => setDeleteModal(true)}
                      >
                        <img
                          src={DeleteIcon}
                          className="w-[20px] h-[20px]"
                          alt="Delete"
                        />
                        <span className="text-[#4B5563] font-normal text-sm">
                          Delete
                        </span>
                      </button>
                    </div>
                  ) : (
                    <button
                      className="bg-[#F9F9F9] px-3 py-2 flex items-center gap-2 rounded-xl"
                      onClick={() => setEditAccountModal(true)}
                    >
                      <img
                        src={EditIcon}
                        className="w-[20px] h-[20px]"
                        alt="Edit"
                      />
                      <span className="text-[#4B5563] font-normal text-sm">
                        Edit Details
                      </span>
                    </button>
                  )}
                </div>

                <div className="w-full bg-[#F3F4F6] h-[1px] my-4"></div>

                {section.details.map((detail, detailIndex) => (
                  <div
                    key={detailIndex}
                    className="w-full flex sm:flex-row flex-col sm:items-center items-start justify-between mb-5"
                  >
                    <h3 className="text-[#4B5563] font-normal text-sm">
                      {detail.label}
                    </h3>
                    <p className="text-[#1F1F1F] font-normal text-sm">
                      {detail.label === "Password"
                        ? "*".repeat(detail.value.length)
                        : detail.value}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={editModal} onClose={() => setEditModal(false)} size="lg">
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 md:py-4 p-4">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-xl text-lg font-semibold text-[#274372]">
                  Update School Information
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setEditModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {(formik) => (
                  <Form className="mt-7">
                    <div className="px-2">
                      <div className="mb-6">
                        <div className="mb-4 text-start">
                          <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                            School Name
                          </label>
                          <Field
                            type="text"
                            name="schoolName"
                            placeholder="Enter school name"
                            className="w-full border border-[#E5E7EB] text-sm px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <ErrorMessage
                            name="schoolName"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>

                        <div className="mb-4 text-start">
                          <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                            School Address
                          </label>

                          <GooglePlacesAutocomplete
                            apiKey="AIzaSyBBLcXrmcY2pdzrI4uiyhFdOefMDZhxVc4"
                            selectProps={{
                              placeholder: "Search location",
                              isClearable: true,
                              styles: customGoogleplaceStyles(
                                formik.touched.schoolAddress &&
                                  formik.errors.schoolAddress
                              ),
                              name: "schoolAddress",
                              value: formik.values.schoolAddress
                                ? {
                                    label: formik.values.schoolAddress,
                                    value: formik.values.schoolAddress
                                  }
                                : null,
                              onChange: (value) => handleLatLog(value, formik)
                            }}
                            className="w-full text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:outline-none"
                          />
                          <ErrorMessage
                            name="schoolAddress"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 flex justify-between w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setEditModal(false)}
                        className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={btnLoader}
                        className="bg-[#9810FA] text-white font-medium text-sm w-full h-12 rounded-lg"
                      >
                        {btnLoader ? <DotLoader color="#fff" /> : "Update"}
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
        open={editAccountModal}
        onClose={() => setEditAccountModal(false)}
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
                  onClick={() => setEditAccountModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <Formik
                initialValues={initial}
                validationSchema={validation}
                onSubmit={handleChangePassword}
              >
                {({ isSubmitting }) => (
                  <Form className="mt-7">
                    <div className="px-2">
                      <div className="mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Admin Email
                        </label>
                        <Field
                          type="email"
                          name="email"
                          disabled
                          readOnly
                          className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg disabled:text-[#6B7280] focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                      </div>

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
                        <ErrorMessage
                          name="newPassword"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

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
                        onClick={() => setEditAccountModal(false)}
                        className="bg-[#DFE3EA] w-full font-medium h-12 text-sm text-[#6B7280] rounded-lg mr-5"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || btnLoader}
                        className="bg-[#9810FA] text-white font-medium h-12 text-sm w-full rounded-lg"
                      >
                        {btnLoader ? <DotLoader color="#fff" /> : "Update"}
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
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start md:my-3 my-0">
                <h1 className="md:text-xl text-lg mr-2 font-semibold text-[#274372]">
                  Delete School Account Permanently
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setDeleteModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <div className="mt-7">
                <div className="w-full flex items-center justify-center">
                  <img
                    src={DeleteModalIcon}
                    className="w-[80px] h-[80px]"
                    alt=""
                  />
                </div>
                <div className="w-full mt-5 text-center">
                  <h4 className="text-[#1F1F1F] font-semibold text-lg mb-4">
                    Are you sure you want to delete an account?
                  </h4>
                  <p className="text-[#4B5563] font-normal text-base">
                    This decision is final and cannot be undone. <br />
                    Please confirm to continue.
                  </p>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl p-3 mt-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#c4c4c4]"
                    placeholder="Enter reason"
                    value={deleteReason}
                    onChange={(e) => {
                      setDeleteReason(e.target.value);
                      setDeleteReasonError("");
                    }}
                  />
                  {deleteReasonError && (
                    <p className="text-red-500 text-start text-xs">
                      {deleteReasonError}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-5 flex justify-between w-full mb-3">
                <button
                  type="button"
                  onClick={() => setDeleteModal(false)}
                  className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                >
                  Cancel
                </button>
                <button
                  disabled={btnLoader}
                  type="button"
                  className="bg-[#FF7373] text-white font-medium text-sm w-full h-12 rounded-lg"
                  onClick={() => handleDelete()}
                >
                  {btnLoader ? (
                    <DotLoader color="#fff" />
                  ) : (
                    "Yes, Delete Account"
                  )}
                </button>
              </div>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
