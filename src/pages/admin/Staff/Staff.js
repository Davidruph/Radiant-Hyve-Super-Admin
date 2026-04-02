import React, { Fragment, useEffect, useRef, useState } from "react";
import Tab from "../../../base-component/Tabs/Tabs";
import StaffList from "./StaffList";
import StaffLeave from "./StaffLeave";
import { FiPlus } from "react-icons/fi";
import { useDebounce } from "use-debounce";
import { addStaffApi, getStaffListApi } from "../../../services/api_services";
import toast from "react-hot-toast";
import Dialog from "../../../base-component/Dialog/Dialog";
import PlaceholderImg from "../../../assets/images/placeholderImg.png";
import { FiUploadCloud } from "react-icons/fi";
import { Listbox, Transition } from "@headlessui/react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import datePickerIcon from "../../../assets/icons/datePicker.png";
import DatePicker from "react-multi-date-picker";
import { ErrorMessage, Field, Form, Formik, useFormik } from "formik";
import * as Yup from "yup";
import parsePhoneNumberFromString from "libphonenumber-js";
import { DotLoader } from "../../../base-component/Loader/Loader";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";

const genderOptions = [
  { value: "", name: "Select gender" },
  { value: "male", name: "Male" },
  { value: "female", name: "Female" }
];

export default function Staff() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [addStaffModal, setAddStaffModal] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  // const [showPassword, setShowPassword] = useState("");
  const [selected, setSelected] = useState(genderOptions[0]);
  const dobPickerRef = useRef(null);
  const dobInstanceRef = useRef(null);
  const joinPickerRef = useRef(null);
  const joinInstanceRef = useRef(null);
  const [dob, setDob] = useState(null);
  const [joinDate, setJoinDate] = useState(null);
  const [btnLoader, setBtnLoader] = useState(false);
  const [img, setImg] = useState("");

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dobPickerRef.current &&
        !dobPickerRef.current.contains(event.target)
      ) {
        dobInstanceRef.current?.closeCalendar();
      }
      if (
        joinPickerRef.current &&
        !joinPickerRef.current.contains(event.target)
      ) {
        joinInstanceRef.current?.closeCalendar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  const getStaffList = () => {
    setLoading(true);

    let obj = {
      page: pageNo,
      search: debouncedSearch
    };

    getStaffListApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        console.log("message", message);
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setStaffData(datas);
          setPageCount(message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("getStaffListApi>>>", err);
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

  const handleAddStaff = () => {
    setAddStaffModal(true);
    setImage(null);
    setSelected(genderOptions[0]);
    setImg(null);
    setDob(null);
    setJoinDate(null);
  };

  useEffect(() => {
    getStaffList();
  }, [pageNo, debouncedSearch]);

  const handleImageChange = (e) => {
    setImg(e.target.files[0]);
    let profileImage = URL.createObjectURL(e.target.files[0]);
    setImage(profileImage);
  };

  const validationSchema = Yup.object({
    fullName: Yup.string()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be at most 50 characters")
      .required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
      .min(6, "Phone number must be at least 6 digits")
      .required("Phone number is required")
      .test("is-valid-phone", "Enter a valid phone number", (value) => {
        return value && value.replace(/\D/g, "").length > 5;
      }),
    about: Yup.string()
      .min(5, "About must be at least 5 characters")
      .max(500, "About must be at most 500 characters")
      .required("About is required"),
    gender: Yup.string().required("Gender is required"),
    dob: Yup.date().required("Date of Birth is required"),
    joinDate: Yup.date().required("Joining Date is required"),
    experience: Yup.string()
      .min(1, "Experience must be at least 1 character")
      .max(50, "Experience must be at most 100 characters")
      .required("Experience is required")
    // password: Yup.string()
    //   .min(8, 'Minimum 8 characters')
    //   .max(20, 'Maximum 20 characters')
    //   .required('Password is required')
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
    dob: "",
    joinDate: "",
    experience: "",
    about: "",
    password: ""
  };

  const handleSubmit = (values, { setSubmitting }) => {
    setBtnLoader(true);

    if (!img) {
      setBtnLoader(false);
      toast.error("Please upload a profile picture.");
      return;
    }

    const parsedPhone = parsePhoneNumberFromString(values?.phone);

    const dobStr = moment(values.dob).format("DD-MM-YYYY");
    const joinDateStr = moment(values.joinDate).format("DD-MM-YYYY");
    const [dobDay, dobMonth, dobYear] = dobStr.split("-");
    const formattedDob = `${dobYear}-${dobMonth}-${dobDay}`;
    const [joinDay, joinMonth, joinYear] = joinDateStr.split("-");
    const formattedJoin = `${joinYear}-${joinMonth}-${joinDay}`;

    const formData = new FormData();
    formData.append("full_name", values?.fullName);
    formData.append("email", values?.email);
    formData.append("mobile_no", parsedPhone.nationalNumber);
    formData.append("country_code", `+${parsedPhone.countryCallingCode}`);
    formData.append("iso_code", parsedPhone.country || "in");
    formData.append("gender", values?.gender);
    formData.append("dob", formattedDob);
    formData.append("joining_date", formattedJoin);
    formData.append("about_staff", values?.about);
    formData.append("experience", values?.experience);
    // formData.append("password", values?.password);

    if (img) {
      formData.append("profile_pic", img);
    }

    addStaffApi(formData)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          getStaffList();
          toast.success(message);
          setAddStaffModal(false);
        }
        setSubmitting(false);
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
    <div>
      <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
        {activeTab === 0 ? "Staff List" : "Staff Leave"}
      </h2>

      <div>
        <div className="sm:space-y-0 space-y-4">
          <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
            <div
              className={`flex ${activeTab == 0 ? "xl:flex-row flex-col" : "sm:flex-row flex-col"} justify-between xl:gap-0 gap-4`}
            >
              <Tab.List variant="link-tabs" className="w-[20%]">
                <Tab>
                  <Tab.Button
                    className="w-full py-2 whitespace-nowrap"
                    as="button"
                  >
                    Staff List
                  </Tab.Button>
                </Tab>

                <Tab>
                  <Tab.Button
                    className="w-full py-2 whitespace-nowrap"
                    as="button"
                  >
                    Staff Leave
                  </Tab.Button>
                </Tab>
              </Tab.List>

              {activeTab === 0 && (
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
                      placeholder="Search for staff name"
                      className="input flex-1 text-sm outline-none border-none bg-transparent text-gray-800 px-2"
                    />
                  </div>

                  <button
                    className="flex items-center justify-center space-x-1 py-2 px-5 bg-[#9810FA] rounded-lg"
                    onClick={handleAddStaff}
                  >
                    <FiPlus className="text-white text-2xl" />
                    <span className="text-white text-sm font-normal">
                      Add Staff
                    </span>
                  </button>
                </div>
              )}
            </div>

            <Tab.Panels className="mt-5">
              <Tab.Panel className="leading-relaxed">
                {activeTab === 0 && (
                  <StaffList
                    paginatedData={staffData}
                    pageNo={pageNo}
                    setPageNo={setPageNo}
                    pageCount={pageCount}
                    loading={loading}
                  />
                )}
              </Tab.Panel>

              <Tab.Panel className="leading-relaxed">
                {activeTab === 1 && <StaffLeave />}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>

      <Dialog
        open={addStaffModal}
        onClose={() => setAddStaffModal(false)}
        size="xl"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="py-4">
              <div className="w-full relative sm:text-center text-start my-3 md:px-8 px-4">
                <h1 className="md:text-lg text-base font-semibold text-[#274372]">
                  Staff Information
                </h1>
                <button
                  className="absolute top-0 right-5"
                  onClick={() => setAddStaffModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ setFieldValue, values }) => (
                  <Form className="mt-7 w-full">
                    <div className="md:px-10 px-4 w-full h-[600px] modalheight scroll overflow-y-auto">
                      {/* Profile Image Upload */}
                      <div className="flex flex-col items-center gap-3">
                        <label htmlFor="fileInput" className="cursor-pointer">
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
                          <FiUploadCloud className="text-[#6B7280] text-base" />
                          Upload Profile Picture
                        </label>
                      </div>

                      {/* Full Name & Email */}
                      <div className="flex flex-col md:flex-row gap-3 mt-5">
                        <div className="w-full">
                          <label className="text-sm text-gray-600 mb-1 block">
                            Full Name
                          </label>
                          <Field
                            name="fullName"
                            type="text"
                            placeholder="Enter full name"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <ErrorMessage
                            name="fullName"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        <div className="w-full">
                          <label className="text-sm text-gray-600 mb-1 block">
                            Email
                          </label>
                          <Field
                            name="email"
                            type="email"
                            placeholder="Enter email"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>

                      {/* Phone & Gender */}
                      <div className="flex flex-col md:flex-row gap-3 mt-5">
                        <div className="w-full">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Phone Number
                          </label>
                          <PhoneInput
                            country={"in"}
                            value={values.phone}
                            onChange={(value) => setFieldValue("phone", value)}
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

                      {/* Date Pickers */}
                      <div className="flex flex-col md:flex-row gap-3 mt-5">
                        <div className="w-full">
                          <label className="text-sm text-gray-600 mb-1 block">
                            Date of Birth
                          </label>
                          <div className="div" ref={dobPickerRef}>
                            <div className="relative w-full">
                              <DatePicker
                                ref={dobInstanceRef}
                                value={dob}
                                onChange={(val) => {
                                  setDob(val);
                                  setFieldValue("dob", val?.toDate?.() ?? val);
                                }}
                                name="dob"
                                format="DD-MM-YYYY"
                                editable={false}
                                placeholder="Select Date"
                                className="w-full border text-sm border-[#E5E7EB] p-2 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                                inputClass="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                                maxDate={new Date()}
                                containerStyle={{
                                  position: "relative"
                                }}
                                style={{
                                  zIndex: 100
                                }}
                                calendarPosition="top-center"
                              />
                              <div
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                onClick={() =>
                                  dobInstanceRef.current?.openCalendar()
                                }
                              >
                                <img
                                  src={datePickerIcon}
                                  className="w-5 h-5"
                                  alt="Calendar Icon"
                                />
                              </div>
                            </div>
                            <ErrorMessage
                              name="dob"
                              component="div"
                              className="text-red-500 text-xs mt-1"
                            />
                          </div>
                        </div>

                        <div className="w-full">
                          <label className="text-sm text-gray-600 mb-1 block">
                            Joining Date
                          </label>
                          <div className="div" ref={joinPickerRef}>
                            <div className="relative w-full">
                              <DatePicker
                                ref={joinInstanceRef}
                                value={joinDate}
                                onChange={(val) => {
                                  setJoinDate(val);
                                  setFieldValue(
                                    "joinDate",
                                    val?.toDate?.() ?? val
                                  );
                                }}
                                name="joinDate"
                                format="DD-MM-YYYY"
                                editable={false}
                                placeholder="Select Date"
                                className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                                inputClass="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                                hideOnScroll={true}
                              />
                              <div
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                onClick={() =>
                                  joinInstanceRef.current?.openCalendar()
                                }
                              >
                                <img
                                  src={datePickerIcon}
                                  className="w-5 h-5"
                                  alt="Calendar Icon"
                                />
                              </div>
                            </div>
                            <ErrorMessage
                              name="joinDate"
                              component="div"
                              className="text-red-500 text-xs mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="mt-5 w-full">
                        <label className="text-sm text-gray-600 mb-1 block">
                          Experience
                        </label>
                        <Field
                          name="experience"
                          type="text"
                          placeholder="Enter experience"
                          className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                        <ErrorMessage
                          name="experience"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      {/* About */}
                      <div className="mt-5 w-full">
                        <label className="text-sm text-gray-600 mb-1 block">
                          About Staff
                        </label>
                        <Field
                          name="about"
                          as="textarea"
                          placeholder="Enter"
                          className="w-full border h-[100px] text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                        <ErrorMessage
                          name="about"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      {/* Password */}
                      {/* <div className="mt-5 w-full mb-4">
                        <label className="text-sm text-gray-600 mb-1 block">Password</label>
                        <div className="relative">
                          <Field
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                          >
                            {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                          </button>
                        </div>
                        <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                      </div> */}
                    </div>

                    <div className="mt-5 md:px-8 px-4 flex justify-between md:w-[500px] mx-auto w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setAddStaffModal(false)}
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
    </div>
  );
}
