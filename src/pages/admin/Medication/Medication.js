import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import documentIcon from "../../../assets/icons/note.png";
import EditIcon from "../../../assets/icons/edit.png";
import deleteIcon from "../../../assets/icons/Dashboard.png";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { PhoneInput } from "react-international-phone";
import Select from "react-select";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import {
  addMedicationApi,
  getStudentsListApi,
  medicationListApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { DotLoader } from "../../../base-component/Loader/Loader";
import parsePhoneNumberFromString from "libphonenumber-js";

const Medication = () => {
  const navigate = useNavigate();
  const [addMedication, setAddMedication] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [medicationData, setMedicationData] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [btnLoader, setBtnLoader] = useState(false);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pageCount) {
      setPageNo(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPaginationButtons = () => {
    const maxPagesToShow = 3;
    const buttons = [];
    const startPage = Math.max(1, pageNo - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(pageCount, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={
            i === pageNo
              ? "bg-[#293FE3] text-white rounded-lg px-4 py-1.5 mr-2 font-medium text-base border"
              : "text-gray-600 border border-[#F0F1F2] px-4 rounded-lg font-medium text-sm py-1.5 mr-2"
          }
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

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

  const getMedicationList = () => {
    setLoading(true);

    let obj = {
      page: pageNo
    };

    medicationListApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        console.log("message", message);
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setMedicationData(datas);
          setPageCount(message);
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
    getMedicationList();
  }, [pageNo]);

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

  const initialValues = {
    student: null,
    disease: "",
    medication: "",
    doctorName: "",
    doctorPhone: ""
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
      student_id: values?.student?.value,
      doctor_name: values?.doctorName,
      type_disease: values?.disease,
      medication_details: values?.medication,
      iso_code: parsedPhone.country || "in",
      country_code: `+${parsedPhone.countryCallingCode}`,
      mobile_no: parsedPhone.nationalNumber
    };

    addMedicationApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          getMedicationList();
          toast.success(message);
          setAddMedication(false);
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
      <div className="sm:flex items-center justify-between">
        <h2 className="md:text-lg text-base text-[#1F1F1F] font-semibold">
          Medication Activity Feed
        </h2>
        <button
          className="bg-[#293FE3] px-3 py-2 rounded-lg text-white text-sm flex items-center gap-1.5 sm:mt-0 mt-4"
          onClick={() => {
            setBtnLoader(false);
            setAddMedication(true);
          }}
        >
          <FiPlus className="text-white text-xl" />
          Add Medication
        </button>
      </div>

      {loading ? (
        <div className="mt-5">
          <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8FAFB]">
                <tr>
                  {[
                    "Student Id",
                    "Student Name",
                    "Type of Disease",
                    "Medication",
                    "Doctor Name",
                    "Doctor Phone Number"
                  ].map((col) => (
                    <th
                      key={col}
                      className="p-4 text-left text-[#3B4045] font-medium text-sm whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(10)].map((_, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {[...Array(6)].map((__, colIndex) => (
                      <td
                        key={colIndex}
                        className="border-b border-[#E5E7EB] px-4 py-3"
                      >
                        <Skeleton height={20} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {medicationData.length > 0 ? (
            <>
              <div className="bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg mt-5">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm ">
                    <thead className="bg-[#F8FAFB]">
                      <tr>
                        {[
                          "Student Id",
                          "Student Name",
                          "Type of Disease",
                          "Medication",
                          "Doctor Name",
                          "Doctor Phone Number"
                        ].map((col) => (
                          <th
                            key={col}
                            className="p-3 text-left text-[#3B4045] select-none font-medium cursor-pointer text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group"
                          >
                            {col.replace(/([A-Z])/g, " $1").trim()}
                          </th>
                        ))}
                        <th className="p-4 text-center text-[#3B4045] font-medium text-sm whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicationData?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                            {item.student_id}
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                            <div className="md:w-52 w-48 truncate">
                              {item.student_name}
                            </div>
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                            <div className="md:w-52 w-48 truncate">
                              {item.type_disease}
                            </div>
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                            <div className="md:w-52 w-48 truncate">
                              {item.medication_details}
                            </div>
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                            <div className="md:w-52 w-48 truncate">
                              {item.doctor_name}
                            </div>
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                            {item.country_code + " " + item.mobile_no}
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap text-end flex justify-center">
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger
                                asChild
                                className="outline-none"
                              >
                                <button className="p-2">
                                  <PiDotsThreeOutlineVerticalFill className="text-[#1F1F1F] text-xl" />
                                </button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content
                                  className="bg-white absolute -right-5 w-[240px] shadow-lg rounded p-2 text-start animate-dropdown"
                                  sideOffset={5}
                                >
                                  <DropdownMenu.Item
                                    className="cursor-pointer flex items-center gap-3 text-start border-b border-[#E9E9E9] outline-none px-4 py-2 hover:bg-gray-100"
                                    onClick={() =>
                                      navigate(
                                        `/school_admin/medication/medication_view/${item.id}`
                                      )
                                    }
                                  >
                                    <img
                                      src={documentIcon}
                                      className="w-[20px] h-[20px]"
                                      alt=""
                                    />
                                    <span className="text-[#1F1F1F] font-normal text-sm">
                                      View Details
                                    </span>
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item
                                    className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-2 hover:bg-gray-100"
                                    onClick={() =>
                                      navigate(
                                        `/school_admin/medication/medication_view/${item.id} `,
                                        { state: { deleteModal: true } }
                                      )
                                    }
                                  >
                                    <img
                                      src={deleteIcon}
                                      className="w-[20px] h-[20px]"
                                      alt=""
                                    />
                                    <span className="text-[#1F1F1F] font-normal text-sm">
                                      Delete
                                    </span>
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-5 flex w-full col-span-12 justify-center">
                <Pagination>
                  <Pagination.Link
                    onClick={() => handlePageChange(pageNo - 1)}
                    disabled={pageNo === 1}
                  >
                    <GrPrevious className="text-[#1F1F1F]" />
                  </Pagination.Link>
                  <div className="flex items-center">
                    {renderPaginationButtons()}
                  </div>
                  <Pagination.Link
                    onClick={() => handlePageChange(pageNo + 1)}
                    disabled={pageNo === pageCount}
                  >
                    <GrNext className="text-[#1F1F1F]" />
                  </Pagination.Link>
                </Pagination>
              </div>
            </>
          ) : (
            <div className="flex h-[70vh] justify-center items-center">
              <div className="text-center">
                <img src={noData} className="w-32" alt="" />
                <h4 className="text-gray-400">No data Found</h4>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog
        open={addMedication}
        onClose={() => setAddMedication(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-4 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-xl text-lg font-semibold text-[#1F1F1F]">
                  Medication Information
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setAddMedication(false)}
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
                        onClick={() => setAddMedication(false)}
                        className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={btnLoader}
                        type="submit"
                        className="bg-[#293FE3] text-white font-medium text-sm w-full h-12 rounded-lg"
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
    </>
  );
};

export default Medication;
