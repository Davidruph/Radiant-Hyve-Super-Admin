import React, { useEffect, useState } from "react";
import Tab from "../../../base-component/Tabs/Tabs";
import AllStudents from "./AllStudents";
import NewStudent from "./NewStudent";
import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
  getAllStudentListApi,
  getNewStudentListApi,
  getShiftApi,
  getWaitingStudentListApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import WaitingStudent from "./WaitingStudent";
import { useDebounce } from "use-debounce";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlus, FiUploadCloud, FiX } from "react-icons/fi";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { PhoneInput } from "react-international-phone";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import * as Yup from "yup";
import PlaceholderImg from "../../../assets/images/placeholderImg.png";
import { DotLoader } from "../../../base-component/Loader/Loader";

const genderOptions = [
  { value: "", name: "Select gender" },
  { value: "male", name: "Male" },
  { value: "female", name: "Female" }
];

export default function Staff() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [shiftListArray, setShiftListArray] = useState([]);
  const [selectedShift, setSelectedShift] = useState({
    shift_name: "All",
    id: 0
  });
  const [newStudentData, setNewStudentData] = useState([]);
  const [allStudentData, setAllStudentData] = useState([]);
  const [waitingStudentData, setWaitingStudentData] = useState([]);
  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchVelue, setSearchVelue] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [debouncedSearchText] = useDebounce(searchText, 500);
  const [debouncedSearchVelue] = useDebounce(searchVelue, 500);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pageNo1, setPageNo1] = useState(1);
  const [pageCount1, setPageCount1] = useState(1);
  const [pageNo2, setPageNo2] = useState(1);
  const [pageCount2, setPageCount2] = useState(1);
  const [addStudentsModal, setAddStudentsModal] = useState(false);
  const [selected, setSelected] = useState(genderOptions[0]);
  const [img, setImg] = useState("");
  const [image, setImage] = useState("");
  const [btnLoader, setBtnLoader] = useState(false);

  const handleAddStudents = () => {
    setAddStudentsModal(true);
    setSelected(genderOptions[0]);
    setImage(null);
    setImg(null);
  };

  const validationSchema = Yup.object().shape({
    fullName: Yup.string()
      .required("Full name is required")
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be at most 50 characters"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .test("is-valid-phone", "Enter a valid phone number", (value) => {
        return value && value.replace(/\D/g, "").length > 5;
      }),
    gender: Yup.string().required("Gender is required"),
    address: Yup.string()
      .required("Address is required")
      .min(5, "Address must be at least 5 characters")
      .max(100, "Address must be at most 100 characters")
    // password: Yup.string()
    //   .min(8, "Password must be at least 8 characters")
    //   .max(20, "Password must be at most 20 characters")
    //   .required("Password is required")
    //   .matches(
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
    //     ,
    //     "Password must have uppercase, lowercase, number, and special character"
    //   ),
  });

  const initialValues = {
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    address: ""
  };

  let Type;

  try {
    const { type } = location.state;
    Type = type;
  } catch (error) {}

  useEffect(() => {
    if (Type == 1) {
      setActiveTab(1);
    }
  }, [Type]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    setSearch("");
    setSearchText("");
    setSelectedShift({
      shift_name: "All",
      id: 0
    });
  };

  const getShiftList = () => {
    getShiftApi()
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          const updatedList = [{ shift_name: "All", id: 0 }, ...datas];
          setShiftListArray(updatedList);
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
    getShiftList();
  }, []);

  const getNewStudentList = () => {
    setLoading(true);

    let obj = {
      page: pageNo1,
      search: debouncedSearch
    };

    getNewStudentListApi(obj)
      .then((res) => {
        const gate = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setNewStudentData(datas);
          setPageCount1(gate);
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

  const handleImageChange = (e) => {
    setImg(e.target.files[0]);
    let profileImage = URL.createObjectURL(e.target.files[0]);
    setImage(profileImage);
  };

  const handleRemoveImage = () => {
    setImg(null);
    setImage(null);
    document.getElementById("fileInput").value = "";
  };

  useEffect(() => {
    getNewStudentList();
  }, [pageNo1, debouncedSearch, activeTab]);

  const getAllStudentList = () => {
    setLoading(true);

    let obj = {
      shift_id: selectedShift?.id,
      page: pageNo,
      search: debouncedSearchText
    };

    getAllStudentListApi(obj)
      .then((res) => {
        const total = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setAllStudentData(datas);
          setPageCount(total);
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
    getAllStudentList();
  }, [selectedShift, activeTab, debouncedSearchText]);

  const getWaitingStudentList = () => {
    setLoading(true);

    let obj = {
      page: pageNo2,
      search: debouncedSearchVelue
    };

    getWaitingStudentListApi(obj)
      .then((res) => {
        const totalPage = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setWaitingStudentData(datas);
          setPageCount2(totalPage);
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
    getWaitingStudentList();
  }, [pageNo2, debouncedSearchVelue, activeTab]);

  const handleStudentSubmit = (values) => {
    // setBtnLoader(true);
    console.log(values);
  };

  return (
    <div>
      <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
        Student List
      </h2>

      <div>
        <div className="sm:space-y-0 space-y-4">
          <Tab.Group onChange={(index) => handleTabChange(index)}>
            <div
              className={`flex ${activeTab === 0 ? "xl:flex-row flex-col" : "sm:flex-row flex-col"} justify-between xl:gap-0 gap-4`}
            >
              <Tab.List variant="link-tabs" className="w-[20%]">
                <Tab>
                  <Tab.Button
                    className="w-full py-2 whitespace-nowrap"
                    as="button"
                  >
                    All Student
                  </Tab.Button>
                </Tab>
                <Tab>
                  <Tab.Button
                    className="w-full py-2 whitespace-nowrap"
                    as="button"
                  >
                    New Student
                  </Tab.Button>
                </Tab>

                <Tab>
                  <Tab.Button
                    className="w-full py-2 whitespace-nowrap"
                    as="button"
                  >
                    Waiting Student
                  </Tab.Button>
                </Tab>
              </Tab.List>

              {activeTab === 0 ? (
                <div className="flex md:flex-row flex-col md:items-center items-start md:gap-4 gap-3">
                  <div className="">
                    <Listbox value={selectedShift} onChange={setSelectedShift}>
                      <div className="relative">
                        <Listbox.Button className="relative w-[180px] border border-[#D1D5DB] rounded-lg bg-white py-2 pl-3 pr-10 text-left cursor-pointer focus:outline-none">
                          <span className="block truncate text-sm">
                            {selectedShift?.shift_name || "Select Shift"}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <IoIosArrowDown
                              className="text-base text-[#1F1F1F]"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>

                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-auto scroll py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {shiftListArray?.length > 0 ? (
                              shiftListArray.map((shift, index) => (
                                <Listbox.Option
                                  key={index}
                                  className={({ focus }) =>
                                    `relative cursor-pointer select-none py-3 px-5${
                                      focus ? " bg-gray-100" : ""
                                    }${index === 0 ? "" : " border-t border-[#E9E9E9]"}`
                                  }
                                  value={shift}
                                >
                                  {({ selected }) => (
                                    <span
                                      className={`block text-[#1F1F1F] font-normal md:text-sm text-xs truncate ${
                                        selected ? "font-medium" : "font-normal"
                                      }`}
                                    >
                                      {shift.shift_name}
                                    </span>
                                  )}
                                </Listbox.Option>
                              ))
                            ) : (
                              <div className="text-sm px-5 py-3 text-gray-500 text-center">
                                No Shift Available
                              </div>
                            )}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>

                  <div className="flex items-center border bg-[#F3F4F6] border-[#E5E7EB] xl:w-[400px] sm:w-[300px] w-full rounded-lg px-3 py-2">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="w-5 h-5"
                      fill="#9CA3AF"
                    >
                      <g>
                        <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
                      </g>
                    </svg>
                    <input
                      type="search"
                      maxLength={50}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Search"
                      className="input text-sm h-6 flex-1 outline-none border-none bg-transparent text-gray-800 px-2"
                    />
                  </div>
                  {/* <button
                    className="flex items-center justify-center space-x-1 py-2 px-5 bg-[#9810FA] rounded-lg"
                    onClick={handleAddStudents}
                  >
                    <FiPlus className="text-white text-2xl" />
                    <span className="text-white text-sm font-normal">
                      Add Student
                    </span>
                  </button> */}
                </div>
              ) : activeTab === 1 ? (
                <div className="flex md:flex-row flex-col md:items-center items-start md:gap-4 gap-3">
                  <div className="flex items-center border bg-[#F3F4F6] border-[#E5E7EB] xl:w-[400px] sm:w-[300px] w-full rounded-lg px-3 py-2">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="w-5 h-5"
                      fill="#9CA3AF"
                    >
                      <g>
                        <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
                      </g>
                    </svg>
                    <input
                      type="search"
                      maxLength={50}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search"
                      className="input text-sm flex-1 outline-none border-none bg-transparent text-gray-800 px-2"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex md:flex-row flex-col md:items-center items-start md:gap-4 gap-3">
                  <div className="flex items-center border bg-[#F3F4F6] border-[#E5E7EB] xl:w-[400px] sm:w-[300px] w-full rounded-lg px-3 py-2">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="w-5 h-5"
                      fill="#9CA3AF"
                    >
                      <g>
                        <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
                      </g>
                    </svg>
                    <input
                      type="search"
                      maxLength={50}
                      value={searchVelue}
                      onChange={(e) => setSearchVelue(e.target.value)}
                      placeholder="Search"
                      className="input text-sm flex-1 outline-none border-none bg-transparent text-gray-800 px-2"
                    />
                  </div>
                </div>
              )}
            </div>

            <Tab.Panels className="mt-5">
              <Tab.Panel className="leading-relaxed">
                {activeTab === 0 && (
                  <AllStudents
                    paginatedData={allStudentData}
                    pageNo={pageNo}
                    setPageNo={setPageNo}
                    getStudentPaymentList={getAllStudentList}
                    pageCount={pageCount}
                    loading={loading}
                  />
                )}
              </Tab.Panel>
              <Tab.Panel className="leading-relaxed">
                {activeTab === 1 && (
                  <NewStudent
                    paginatedData={newStudentData}
                    pageNo={pageNo1}
                    setPageNo={setPageNo1}
                    pageCount={pageCount1}
                    loading={loading}
                  />
                )}
              </Tab.Panel>
              <Tab.Panel className="leading-relaxed">
                {activeTab === 2 && (
                  <WaitingStudent
                    paginatedData={waitingStudentData}
                    pageNo={pageNo2}
                    setPageNo={setPageNo2}
                    pageCount={pageCount2}
                    loading={loading}
                  />
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>

        <Dialog
          open={addStudentsModal}
          onClose={() => setAddStudentsModal(false)}
          size="xl"
        >
          <Dialog.Panel className="rounded-2xl">
            <Dialog.Description className="">
              <div className="py-4">
                <div className="w-full relative sm:text-center text-start my-3 md:px-8 px-4">
                  <h1 className="md:text-xl text-lg font-semibold text-[#274372]">
                    Parents Information
                  </h1>
                  <button
                    className="absolute top-0 right-5"
                    onClick={() => setAddStudentsModal(false)}
                  >
                    <IoMdClose className="text-2xl text-black" />
                  </button>
                </div>

                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleStudentSubmit}
                >
                  {({ setFieldValue, values }) => (
                    <Form className="mt-7 w-full">
                      <div className="md:px-10 px-4 w-full h-[490px] scroll modalheight overflow-y-auto">
                        <div className="flex flex-col items-center gap-3">
                          <label className="cursor-pointer relative">
                            <div className="w-24 h-24 rounded-full border flex items-center justify-center overflow-hidden">
                              {image ? (
                                <img
                                  src={image}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img
                                  src={PlaceholderImg}
                                  className="w-[100px] h-[100px] object-cover"
                                  alt=""
                                />
                              )}
                            </div>
                            {image && (
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-0 -right-0 bg-[#9810FA] border border-gray-300 rounded-full p-1 shadow"
                              >
                                <FiX className="text-white w-4 h-4" />
                              </button>
                            )}
                          </label>

                          <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            accept=".jpg, .jpeg, .png"
                            onChange={handleImageChange}
                          />
                          <label
                            htmlFor="fileInput"
                            className="flex text-sm items-center gap-2 text-gray-700 cursor-pointer"
                          >
                            <FiUploadCloud className="text-[#6B7280]" />
                            Upload Profile Picture
                          </label>
                        </div>

                        <div className="w-full flex md:flex-row flex-col justify-between gap-3 mt-5">
                          <div className="w-full">
                            <label className="block text-sm text-[#4B5563] mb-2">
                              Full Name
                            </label>
                            <Field
                              name="fullName"
                              type="text"
                              placeholder="Enter full name"
                              className="w-full border border-[#E5E7EB] text-sm px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                            />
                            <ErrorMessage
                              name="fullName"
                              component="div"
                              className="text-red-500 text-xs mt-1"
                            />
                          </div>
                          <div className="w-full">
                            <label className="block text-sm text-[#4B5563] mb-2">
                              Email
                            </label>
                            <Field
                              name="email"
                              type="email"
                              placeholder="Enter email"
                              className="w-full border border-[#E5E7EB] text-sm px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                            />
                            <ErrorMessage
                              name="email"
                              component="div"
                              className="text-red-500 text-xs mt-1"
                            />
                          </div>
                        </div>

                        <div className="w-full flex md:flex-row flex-col justify-between gap-3 mt-5">
                          <div className="text-start w-full">
                            <label className="block text-[#4B5563] font-normal text-sm mb-2">
                              Phone Number
                            </label>
                            <PhoneInput
                              country={"in"}
                              value={values.phone}
                              onChange={(value) =>
                                setFieldValue("phone", value)
                              }
                              inputClass="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg"
                              inputStyle={{ width: "100%" }}
                              isValid={(value) => {
                                const digits = value.replace(/\D/g, "");
                                return digits.length > 5;
                              }}
                            />
                            <ErrorMessage
                              name="phone"
                              component="div"
                              className="text-red-500 text-xs mt-1"
                            />
                          </div>

                          <div className="w-full">
                            <label className="block text-[#4B5563] font-normal text-sm mb-2">
                              Gender
                            </label>
                            <Listbox
                              value={selected}
                              onChange={(value) => {
                                setSelected(value);
                                setFieldValue("gender", value.value);
                              }}
                            >
                              <div className="relative">
                                <Listbox.Button className="relative w-full border border-[#D1D5DB] text-sm rounded-lg bg-white py-3 pl-3 pr-10 text-left cursor-pointer focus:outline-none">
                                  <span
                                    className={`block truncate ${selected.value === "" && "text-[#9CA3AF]"}`}
                                  >
                                    {selected.name}
                                  </span>
                                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <IoIosArrowDown
                                      className="text-xl text-[#1F1F1F]"
                                      aria-hidden="true"
                                    />
                                  </span>
                                </Listbox.Button>
                                <Transition
                                  as={Fragment}
                                  leave="transition ease-in duration-100"
                                  leaveFrom="opacity-100"
                                  leaveTo="opacity-0"
                                >
                                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 py-1 text-sm ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {genderOptions.map((item, index) => (
                                      <Listbox.Option
                                        key={index}
                                        value={item}
                                        className="cursor-pointer py-2 px-5 border-b last:border-none border-[#E9E9E9]"
                                      >
                                        <span className="block text-[#1F1F1F] font-normal md:text-sm text-xs truncate">
                                          {item.name}
                                        </span>
                                      </Listbox.Option>
                                    ))}
                                  </Listbox.Options>
                                </Transition>
                              </div>
                            </Listbox>
                            <ErrorMessage
                              name="gender"
                              component="div"
                              className="text-red-500 text-xs mt-1"
                            />
                          </div>
                        </div>

                        <div className="w-full mt-5">
                          <label className="block text-sm text-[#4B5563] mb-2">
                            Address
                          </label>
                          <Field
                            name="address"
                            type="text"
                            placeholder="Enter address"
                            className="w-full border border-[#E5E7EB] text-sm px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <ErrorMessage
                            name="address"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>

                      <div className="md:px-8 px-4 flex justify-between md:w-[500px] mx-auto w-full mb-3">
                        <button
                          type="button"
                          onClick={() => setAddStudentsModal(false)}
                          className="bg-[#DFE3EA] w-full font-medium text-sm h-12 text-[#6B7280] rounded-lg mr-5"
                        >
                          Cancel
                        </button>
                        <button
                          // disabled={btnLoader}
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
      </div>
    </div>
  );
}
