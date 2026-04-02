import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BackIcon from "../../../assets/icons/BackIcon.png";
import editIcon from "../../../assets/icons/edit.png";
import deleteIcon from "../../../assets/icons/trash.png";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoMdClose } from "react-icons/io";
import Select from "react-select";
import { PhoneInput } from "react-international-phone";
import DeleteModalIcon from "../../../assets/icons/DeleteIcon.png";
import {
  deleteMedicationApi,
  editMedicationApi,
  getMedicationDetailsApi,
  getStudentsListApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { DotLoader } from "../../../base-component/Loader/Loader";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import parsePhoneNumberFromString from "libphonenumber-js";
import Skeleton from "react-loading-skeleton";

const MedicationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [editMedication, setEditMedication] = useState(false);
  const [loader, setLoader] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [madicationDetails, setMedicationDetails] = useState({});
  const [studentList, setStudentList] = useState([]);

  useEffect(() => {
    if (location.state?.deleteModal) {
      setDeleteModal(true);
    }
    if (location.state) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const studentDataView = [
    {
      title: "Student Name",
      studentData: madicationDetails?.student_name
    },
    {
      title: "Type of Disease",
      studentData: madicationDetails?.type_disease
    },
    {
      title: "Medication Details",
      studentData: madicationDetails?.medication_details
    },
    {
      title: "Doctors Name",
      studentData: madicationDetails?.doctor_name
    },
    {
      title: "Doctor Phone Number",
      studentData:
        madicationDetails?.country_code + " " + madicationDetails?.mobile_no
    }
  ];

  const customStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "0.5rem",
      borderColor: "#E5E7EB",
      padding: "0.25rem",
      boxShadow: "none",
      cursor: "default",
      "&:hover": {
        borderColor: "#E5E7EB"
      }
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
      maxHeight: "160px",
      overflowY: "auto"
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "160px",
      overflowY: "auto"
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#E2E8F0" : "white",
      color: state.data.value === "" ? "#9CA3AF" : "#1F1F1F"
    })
  };

  const medicationDetails = () => {
    setLoader(true);
    let obj = {
      medication_id: id
    };
    getMedicationDetailsApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setMedicationDetails(datas);
        }
        setLoader(false);
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
          if (errs.status === 2) {
            navigate("/school_admin/medication");
          }
        }
        setLoader(false);
      });
  };

  const getAllStudentApi = () => {
    getStudentsListApi()
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          const formatted = datas.map((item) => ({
            label: item.full_name,
            value: item.id
          }));

          setStudentList(formatted);
        }
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
      });
  };

  useEffect(() => {
    getAllStudentApi();
  }, []);

  useEffect(() => {
    medicationDetails();
  }, [id]);

  const initialValues = {
    student:
      madicationDetails?.student_name && madicationDetails?.student_id
        ? {
            label: madicationDetails.student_name,
            value: madicationDetails.student_id
          }
        : null,
    disease: madicationDetails?.type_disease || "",
    medication: madicationDetails?.medication_details || "",
    doctorName: madicationDetails?.doctor_name || "",
    doctorPhone: madicationDetails?.mobile_no
      ? `+${madicationDetails.country_code}${madicationDetails.mobile_no}`
      : "" || ""
  };

  const validationSchema = Yup.object().shape({
    student: Yup.object().required("Student name is required"),
    disease: Yup.string()
      .required("Type of disease is required")
      .min(2, "Type of disease must be at least 2 characters")
      .max(50, "Type of disease must be at most 50 characters"),
    medication: Yup.string()
      .required("Medication details are required")
      .min(2, "Medication details must be at least 2 characters")
      .max(50, "Medication details must be at most 50 characters"),
    doctorName: Yup.string()
      .required("Doctor's name is required")
      .min(2, "Doctor's name must be at least 2 characters")
      .max(50, "Doctor's name must be at most 50 characters"),
    doctorPhone: Yup.string()
      .required("Phone number is required")
      .test("is-valid-phone", "Enter a valid phone number", (value) => {
        return value && value.replace(/\D/g, "").length > 5;
      })
  });

  const handleSubmit = (values) => {
    setBtnLoader(true);

    const parsedPhone = parsePhoneNumberFromString(values?.doctorPhone);

    let obj = {
      medication_id: id,
      student_id: values?.student?.value,
      doctor_name: values?.doctorName,
      type_disease: values?.disease,
      medication_details: values?.medication,
      iso_code: parsedPhone.country || "in",
      country_code: `+${parsedPhone.countryCallingCode}`,
      mobile_no: parsedPhone.nationalNumber
    };

    editMedicationApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          medicationDetails();
          toast.success(message);
          setEditMedication(false);
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

  const handleDelete = () => {
    setBtnLoader(true);
    deleteMedicationApi(id)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          navigate("/school_admin/medication");
        }
        setDeleteModal(false);
        setBtnLoader(false);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem("radient_school_token");
          localStorage.removeItem("refresh_school_token");
          localStorage.removeItem("deviceIdSchool");
          navigate("/school_admin");
        } else {
          toast.error("Error fetching data:", err);
        }
        setBtnLoader(false);
      });
  };

  return (
    <>
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
        <div className="bg-[#FFFFFF] 2xl:w-[768px] xl:w-[700px] md:w-[650px] w-full sm:p-5 p-4 rounded-lg">
          <div className="sm:flex items-center justify-between ">
            <h3 className="text-xl font-semibold ">Medication Information</h3>
            <div className="flex items-center gap-5 sm:mt-0 mt-4">
              <button
                className="bg-[#FFF7E7] flex items-center justify-center gap-2 py-1.5 sm:w-[132px] w-28 h-9 rounded-lg"
                onClick={() => setEditMedication(true)}
              >
                <img src={editIcon} alt="..." className="w-[22px]" />
                <p className="text-[#4B5563] text-sm">Edit</p>
              </button>
              <button
                className="bg-[#FFDED8] flex items-center justify-center gap-2 py-1.5 sm:w-[132px] w-28 h-9 rounded-lg"
                onClick={() => setDeleteModal(true)}
              >
                <img src={deleteIcon} alt="..." className="w-[22px]" />
                <p className="text-[#4B5563] text-sm">Delete</p>
              </button>
            </div>
          </div>
          <div className="mt-4 mb-6 border-b border-[#F3F4F6]"></div>
          {studentDataView &&
            studentDataView.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between ${index < 4 ? "mb-5" : ""}`}
              >
                <h4 className="text-sm text-[#4B5563]">{item?.title}</h4>

                <p className="sm:text-base text-sm text-[#1F1F1F] sm:w-auto w-40 truncate">
                  {loader ? (
                    <Skeleton width={150} height={16} />
                  ) : (
                    item?.studentData
                  )}
                </p>
              </div>
            ))}
        </div>
      </div>

      <Dialog
        open={editMedication}
        onClose={() => setEditMedication(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-xl text-lg font-semibold text-[#1F1F1F]">
                  Medication Information
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setEditMedication(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, setFieldValue }) => (
                  <Form className="mt-7 w-full">
                    <div className="px-2">
                      <div className="w-full mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Student Name
                        </label>
                        <Select
                          options={studentList}
                          styles={customStyles}
                          className="text-sm font-medium"
                          placeholder="Select Student"
                          value={values.student}
                          onChange={(option) =>
                            setFieldValue("student", option)
                          }
                        />
                        <ErrorMessage
                          name="student"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <div className="mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Type of Disease
                        </label>
                        <Field
                          type="text"
                          name="disease"
                          placeholder="Enter"
                          className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                        <ErrorMessage
                          name="disease"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <div className="mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Medication Details
                        </label>
                        <Field
                          type="text"
                          name="medication"
                          placeholder="Enter medication"
                          className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                        <ErrorMessage
                          name="medication"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <div className="mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Doctors Name
                        </label>
                        <Field
                          type="text"
                          name="doctorName"
                          placeholder="Enter doctor's name"
                          className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                        <ErrorMessage
                          name="doctorName"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <div className="text-start w-full mb-4">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Doctor Phone Number
                        </label>

                        <PhoneInput
                          country={"in"}
                          value={values.doctorPhone}
                          onChange={(value) =>
                            setFieldValue("doctorPhone", value)
                          }
                          inputClass="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg"
                          inputStyle={{ width: "100%" }}
                          isValid={(value) => {
                            const digits = value.replace(/\D/g, "");
                            return digits.length > 5;
                          }}
                        />
                        <ErrorMessage
                          name="doctorPhone"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between md:w-[500px] w-full mb-3 ">
                      <button
                        type="button"
                        onClick={() => setEditMedication(false)}
                        className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={btnLoader}
                        type="submit"
                        className="bg-[#9810FA] text-white font-medium text-sm w-full h-12 rounded-lg"
                      >
                        {btnLoader ? <DotLoader color="#fff" /> : " Save"}
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
                <h1 className="md:text-xl text-lg mr-2 font-semibold text-[#1F1F1F]">
                  Delete Medication
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setDeleteModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <div className="mt-7">
                <div className="px-2">
                  <div className="w-full flex items-center justify-center">
                    <img
                      src={DeleteModalIcon}
                      className="w-[104px] h-[104px]"
                      alt=""
                    />
                  </div>
                  <div className="w-full mt-5 text-center">
                    <h4 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
                      Are you sure you want to delete these Medication?
                    </h4>
                  </div>
                </div>
                <div className="mt-10 flex justify-between w-full mb-3">
                  <button
                    type="button"
                    onClick={() => setDeleteModal(false)}
                    className="bg-[#DFE3EA] w-full py-3 font-medium h-12 text-sm text-[#6B7280] rounded-lg mr-5"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={btnLoader}
                    type="submit"
                    className="bg-[#FF7373] text-white font-medium text-sm w-full h-12 rounded-lg"
                    onClick={handleDelete}
                  >
                    {btnLoader ? (
                      <DotLoader color="#fff" />
                    ) : (
                      "Yes, Delete Account"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </>
  );
};

export default MedicationView;
