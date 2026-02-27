import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Fragment, useEffect, useState } from "react";
import { FiPlus, FiUploadCloud, FiX } from "react-icons/fi";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import documentIcon from "../../../assets/icons/document-text.png";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import { Listbox, Transition } from "@headlessui/react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import DeleteIcon from "../../../assets/icons/trash.png";
import BlockIcon from "../../../assets/icons/block.png";
import { useDebounce } from "use-debounce";
import {
  addParentsApi,
  getParentsListApi
} from "../../../services/api_services";
import Skeleton from "react-loading-skeleton";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";
import toast from "react-hot-toast";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import PlaceholderImg from "../../../assets/images/placeholderImg.png";
import parsePhoneNumberFromString from "libphonenumber-js";
import { DotLoader } from "../../../base-component/Loader/Loader";

const genderOptions = [
  { value: "", name: "Select gender" },
  { value: "male", name: "Male" },
  { value: "female", name: "Female" }
];

export default function Parents() {
  const [addParentsModal, setAddParentsModal] = useState(false);
  // const [showPassword, setShowPassword] = useState("");
  const [img, setImg] = useState("");
  const [image, setImage] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const navigate = useNavigate();
  const [selected, setSelected] = useState(genderOptions[0]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [parentsData, setParentsData] = useState([]);
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

  const getParentsList = () => {
    setLoading(true);

    let obj = {
      page: pageNo,
      search: debouncedSearch
    };

    getParentsListApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        console.log("message", message);
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setParentsData(datas);
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
    getParentsList();
  }, [pageNo, debouncedSearch]);

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
    // password: '',
  };

  const handleSubmit = (values) => {
    setBtnLoader(true);

    const parsedPhone = parsePhoneNumberFromString(values?.phone);
    const formData = new FormData();
    formData.append("full_name", values?.fullName);
    formData.append("email", values?.email);
    formData.append("mobile_no", parsedPhone.nationalNumber);
    formData.append("country_code", `+${parsedPhone.countryCallingCode}`);
    formData.append("iso_code", parsedPhone.country || "in");
    formData.append("gender", values?.gender);
    formData.append("address", values?.address);
    // formData.append("password", values?.password);

    if (img) {
      formData.append("profile_pic", img);
    }

    addParentsApi(formData)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          getParentsList();
          toast.success(message);
          setAddParentsModal(false);
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

  const handleAddParents = () => {
    setAddParentsModal(true);
    setSelected(genderOptions[0]);
    setImage(null);
    setImg(null);
  };

  const handleRemoveImage = () => {
    setImg(null);
    setImage(null);
    document.getElementById("fileInput").value = "";
  };

  return (
    <div>
      <div className="flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-4 sy justify-between">
        <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
          Parents List
        </h2>
        <div className="flex sm:flex-row flex-col items-start md:gap-2 gap-3">
          <div className="flex items-center border bg-[#F3F4F6] border-[#E5E7EB] sm:w-[400px] w-full rounded-lg px-3 py-2">
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
              placeholder="Search for parents name"
              className="input flex-1 text-sm outline-none border-none bg-transparent text-gray-800 px-2"
            />
          </div>
          <button
            className="flex items-center justify-center space-x-1 py-2 px-5 bg-[#293FE3] rounded-lg"
            onClick={handleAddParents}
          >
            <FiPlus className="text-white text-2xl" />
            <span className="text-white text-sm font-normal">Add Parents</span>
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
                    "Parents Id",
                    "Parents Name",
                    "Email",
                    "Number of Student"
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
                    {[...Array(5)].map((__, colIndex) => (
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
          {parentsData?.length > 0 ? (
            <div className="mt-5">
              <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F8FAFB]">
                    <tr>
                      {[
                        "Parents Id",
                        "Parents Name",
                        "Email",
                        "Number of Student"
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
                    {parentsData?.map((Item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          {Item.id}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          <div className="w-64 truncate">{Item.full_name}</div>
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          {Item.email}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          {Item.total_student}
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
                                      `/school_admin/parents/parents_details/${Item.id}`
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
                                  className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 border-b border-[#E9E9E9] hover:bg-gray-100"
                                  onClick={() =>
                                    navigate(
                                      `/school_admin/parents/parents_details/${Item.id}`,
                                      { state: { blockModal: true } }
                                    )
                                  }
                                >
                                  <img
                                    src={BlockIcon}
                                    className="w-[20px] h-[20px]"
                                    alt=""
                                  />
                                  <span className="text-[#1F1F1F] font-normal text-sm">
                                    Block
                                  </span>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 hover:bg-gray-100"
                                  onClick={() =>
                                    navigate(
                                      `/school_admin/parents/parents_details/${Item.id}`,
                                      { state: { deleteModal: true } }
                                    )
                                  }
                                >
                                  <img
                                    src={DeleteIcon}
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
        open={addParentsModal}
        onClose={() => setAddParentsModal(false)}
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
                  onClick={() => setAddParentsModal(false)}
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
                              className="absolute top-0 -right-0 bg-[#293FE3] border border-gray-300 rounded-full p-1 shadow"
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

                      {/* 
                      <div className="my-5 mb-3">
                        <h3 className="text-[#1F1F1F] font-medium text-base">Parents App Login Details</h3>
                      </div>
                      
                      <div className="mb-4 text-start  w-full">
                        <label className="block text-sm text-[#4B5563] mb-2">Password</label>
                        <div className="relative">
                          <Field
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password"
                            className="w-full border border-[#E5E7EB] text-sm px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <AiOutlineEye className="text-xl" /> : <AiOutlineEyeInvisible className="text-xl" />}
                          </button>
                        </div>
                        <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                      </div> */}
                    </div>

                    <div className="md:px-8 px-4 flex justify-between md:w-[500px] mx-auto w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setAddParentsModal(false)}
                        className="bg-[#DFE3EA] w-full font-medium text-sm h-12 text-[#6B7280] rounded-lg mr-5"
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
