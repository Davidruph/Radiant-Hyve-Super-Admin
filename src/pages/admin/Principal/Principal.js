import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Fragment, useEffect, useRef, useState } from "react";
import { FiPlus, FiUploadCloud } from "react-icons/fi";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import documentIcon from "../../../assets/icons/document-text.png";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import PlaceholderImg from "../../../assets/images/placeholderImg.png";
import DatePicker from "react-multi-date-picker";
import { Transition, Listbox } from "@headlessui/react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import DeleteIcon from "../../../assets/icons/trash.png";
import BlockIcon from "../../../assets/icons/block.png";
import datePickerIcon from "../../../assets/icons/datePicker.png";
import {
  addPrincipalApi,
  getPrincipalListApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { useDebounce } from "use-debounce";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";
import { DotLoader } from "../../../base-component/Loader/Loader";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import parsePhoneNumberFromString from "libphonenumber-js";
import Skeleton from "react-loading-skeleton";

const genderOptions = [
  { value: "", name: "Select gender" },
  { value: "male", name: "Male" },
  { value: "female", name: "Female" }
];

export default function Principal() {
  const [loading, setLoading] = useState(false);
  const [addPrincipalModal, setAddPrincipalModal] = useState(false);
  const [img, setImg] = useState("");
  const [image, setImage] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [principalData, setPrincipalData] = useState([]);
  const [selected, setSelected] = useState(genderOptions[0]);
  const [dob, setDob] = useState(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const pickerRef = useRef(null);
  const pickerInstanceRef = useRef(null);
  const [btnLoader, setBtnLoader] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        if (pickerInstanceRef.current) {
          pickerInstanceRef.current.closeCalendar();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              : "text-gray-600 border border-[#F0F1F2] px-4 rounded-lg font-medium md:text-base text-sm py-1.5 mr-2"
          }
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const handleImageChange = (e) => {
    setImg(e.target.files[0]);
    let profileImage = URL.createObjectURL(e.target.files[0]);
    setImage(profileImage);
  };

  const getPrincipalList = () => {
    setLoading(true);

    let obj = {
      page: pageNo,
      search: debouncedSearch
    };
    getPrincipalListApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setPrincipalData(datas);
          setPageCount(message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("pricipal____err>>>", err);

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

  const handleAddPrincipal = () => {
    setAddPrincipalModal(true);
    setImage(null);
    setSelected(genderOptions[0]);
    setImg(null);
    setDob(null);
  };

  useEffect(() => {
    getPrincipalList();
  }, [pageNo, debouncedSearch]);

  const initialValues = {
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    qualification: "",
    designation: "",
    experience: ""
    // password: "",
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
    gender: Yup.string().required("Gender is required"),
    dob: Yup.string().required("Date of birth is required"),
    qualification: Yup.string()
      .min(2, "Qualification must be at least 2 characters")
      .max(100, "Qualification must be at most 100 characters")
      .required("Qualification is required"),
    designation: Yup.string()
      .min(2, "Designation must be at least 2 characters")
      .max(100, "Designation must be at most 100 characters")
      .required("Designation is required"),
    experience: Yup.string()
      .min(1, "Experience must be at least 1 character")
      .max(50, "Experience must be at most 50 characters")
      .required("Experience is required")
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

  const handleSubmit = (values, { resetForm }) => {
    setBtnLoader(true);

    if (!img) {
      setBtnLoader(false);
      toast.error("Please upload a profile picture.");
      return;
    }

    const parsedPhone = parsePhoneNumberFromString(values?.phone);
    const [day, month, year] = values?.dob.split("-");
    const formattedDob = `${year}-${month}-${day}`;

    const formData = new FormData();
    formData.append("full_name", values?.fullName);
    formData.append("email", values?.email);
    formData.append("mobile_no", parsedPhone.nationalNumber);
    formData.append("country_code", `+${parsedPhone.countryCallingCode}`);
    formData.append("iso_code", parsedPhone.country || "in");
    formData.append("gender", values?.gender);
    formData.append("dob", formattedDob);
    formData.append("qualification", values?.qualification);
    formData.append("designation", values?.designation);
    formData.append("experience", values?.experience);
    // formData.append("password", values?.password);

    if (img) {
      formData.append("profile_pic", img);
    }

    addPrincipalApi(formData)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          getPrincipalList();
          toast.success(message);
          setAddPrincipalModal(false);
          resetForm();
          setImage(null);
          setSelected(genderOptions[0]);
          setImg(null);
          setDob(null);
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
    <div>
      <div className="flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-4 sy justify-between">
        <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
          Principal List
        </h2>
        <div className="flex sm:flex-row flex-col items-start md:gap-2 gap-3 ">
          <div className="flex items-center border bg-[#F3F4F6] border-[#E5E7EB] md:w-[400px] w-full rounded-lg px-3 py-2">
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
              placeholder="Search for principal name"
              className="input flex-1 w-full outline-none text-sm border-none bg-transparent text-gray-800 px-2"
            />
          </div>
          <button
            className="flex items-center justify-center space-x-1 py-2 px-5 bg-[#293FE3] rounded-lg"
            onClick={handleAddPrincipal}
          >
            <FiPlus className="text-white text-2xl" />
            <span className="text-white text-sm whitespace-nowrap font-normal">
              Add Principal
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-5">
          <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8FAFB]">
                <tr>
                  {[
                    "Principal Id",
                    "Name",
                    "Designation",
                    "Email",
                    "Phone Number",
                    "Actions"
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
          {principalData.length > 0 ? (
            <div className="mt-5">
              <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F8FAFB]">
                    <tr>
                      {[
                        "Principal Id",
                        "Name",
                        "Designation",
                        "Email",
                        "Phone Number"
                      ].map((col) => (
                        <th
                          key={col}
                          className="p-4 text-left text-[#3B4045] select-none font-medium cursor-pointer text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group"
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
                    {principalData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          {item?.id}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          <div className="md:w-64 w-48 truncate">
                            {item?.full_name}
                          </div>
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          <div className="md:w-64 w-48 truncate">
                            {item?.designation}
                          </div>
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          {item?.email}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          {" "}
                          {item?.country_code}
                          {item?.mobile_no ? ` ${item?.mobile_no}` : ""}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap text-end flex justify-center">
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
                                  className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 border-b border-[#E9E9E9] hover:bg-gray-100"
                                  onClick={() =>
                                    navigate(
                                      `/school_admin/principal/principal_details/${item?.id}`
                                    )
                                  }
                                >
                                  <img
                                    src={documentIcon}
                                    className="w-[24px] h-[24px]"
                                    alt=""
                                  />
                                  <span className="text-[#1F1F1F] font-normal text-sm">
                                    View Details
                                  </span>
                                </DropdownMenu.Item>

                                {item?.is_blocked == false ? (
                                  <DropdownMenu.Item
                                    className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 border-b border-[#E9E9E9] hover:bg-gray-100"
                                    onClick={() =>
                                      navigate(
                                        `/school_admin/principal/principal_details/${item?.id}`,
                                        { state: { blockModal: true } }
                                      )
                                    }
                                  >
                                    <img
                                      src={BlockIcon}
                                      className="w-[24px] h-[24px]"
                                      alt=""
                                    />
                                    <span className="text-[#1F1F1F] font-normal text-sm">
                                      Block
                                    </span>
                                  </DropdownMenu.Item>
                                ) : (
                                  <DropdownMenu.Item
                                    className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 border-b border-[#E9E9E9] hover:bg-gray-100"
                                    onClick={() =>
                                      navigate(
                                        `/school_admin/principal/principal_details/${item?.id}`,
                                        { state: { blockModal: true } }
                                      )
                                    }
                                  >
                                    <img
                                      src={BlockIcon}
                                      className="w-[24px] h-[24px]"
                                      alt=""
                                    />
                                    <span className="text-[#1F1F1F] font-normal text-sm">
                                      Unblock
                                    </span>
                                  </DropdownMenu.Item>
                                )}
                                <DropdownMenu.Item
                                  className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 hover:bg-gray-100"
                                  onClick={() =>
                                    navigate(
                                      `/school_admin/principal/principal_details/${item?.id}`,
                                      { state: { deleteModal: true } }
                                    )
                                  }
                                >
                                  <img
                                    src={DeleteIcon}
                                    className="w-[24px] h-[24px]"
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
            </div>
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
        open={addPrincipalModal}
        onClose={() => setAddPrincipalModal(false)}
        size="xl"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="py-4">
              <div className="w-full relative sm:text-center text-start my-3 md:px-8 px-4">
                <h1 className="md:text-xl text-lg font-semibold text-[#274372]">
                  Principal Information
                </h1>
                <button
                  className="absolute top-0 right-5"
                  onClick={() => setAddPrincipalModal(false)}
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
                    <div className="md:px-10 px-4 w-full h-[560px] modalheight scroll overflow-y-auto">
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
                          className="flex items-center gap-2 text-gray-700 cursor-pointer"
                        >
                          <FiUploadCloud className="text-[#6B7280] text-base" />
                          Upload Profile Picture
                        </label>
                      </div>

                      {/* Inputs */}
                      <div className="w-full flex md:flex-row flex-col justify-between gap-3 mt-5">
                        <div className="text-start w-full">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Full Name
                          </label>
                          <Field
                            type="text"
                            name="fullName"
                            placeholder="Enter full name"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <ErrorMessage
                            name="fullName"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                        <div className="text-start w-full">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Email
                          </label>
                          <Field
                            type="email"
                            name="email"
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

                      <div className="w-full flex md:flex-row flex-col justify-between gap-3 mt-5">
                        <div className="text-start w-full">
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

                      {/* DOB and Qualification */}
                      <div className="w-full flex md:flex-row flex-col justify-between gap-3 mt-5">
                        <div className="text-start w-full">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Date of Birth
                          </label>
                          <div className="div" ref={pickerRef}>
                            <div className="relative w-full">
                              <DatePicker
                                ref={pickerInstanceRef}
                                value={dob}
                                onChange={(val) => {
                                  setDob(val);
                                  setFieldValue(
                                    "dob",
                                    val?.format("DD-MM-YYYY")
                                  );
                                }}
                                format="DD-MM-YYYY"
                                editable={false}
                                placeholder="Select Date"
                                className="w-full  border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
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
                                  pickerInstanceRef.current.openCalendar()
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
                        <div className="text-start w-full">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Qualification
                          </label>
                          <Field
                            type="text"
                            name="qualification"
                            placeholder="Enter qualification"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <ErrorMessage
                            name="qualification"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>

                      {/* Designation and Experience */}
                      <div className="w-full flex md:flex-row flex-col justify-between gap-3 mt-5">
                        <div className="text-start w-full">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Designation
                          </label>
                          <Field
                            type="text"
                            name="designation"
                            placeholder="Enter designation"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <ErrorMessage
                            name="designation"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                        <div className="text-start w-full">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Experience
                          </label>
                          <Field
                            type="text"
                            name="experience"
                            placeholder="Enter experience"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <ErrorMessage
                            name="experience"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>

                      {/* Password
                      <div className="mb-4 text-start w-full mt-5">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">Password</label>
                        <div className='relative'>
                          <Field
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter password"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
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
                        <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                      </div> */}
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-5 md:px-8 px-4 flex justify-between md:w-[500px] mx-auto w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setAddPrincipalModal(false)}
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
    </div>
  );
}
