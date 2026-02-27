import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import documentIcon from "../../../assets/icons/document-text.png";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import DeleteIcon from "../../../assets/icons/trash.png";
import Dialog from "../../../base-component/Dialog/Dialog";
import Select from "react-select";
import DatePicker from "react-multi-date-picker";
import {
  addMenuApi,
  getMenuListApi,
  getStudentsMealApi
} from "../../../services/api_services";
import { useDebounce } from "use-debounce";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import datePickerIcon from "../../../assets/icons/datePicker.png";
import Skeleton from "react-loading-skeleton";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";
import { DotLoader } from "../../../base-component/Loader/Loader";
import moment from "moment";

export default function MealTracking() {
  const navigate = useNavigate();
  const [addMenuModal, setAddMenuModal] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [menuData, setMenuData] = useState([]);
  const pickerRef = useRef(null);
  const pickerInstanceRef = useRef(null);
  const [btnLoader, setBtnLoader] = useState(false);
  const [dob, setDob] = useState(null);
  const [studentList, setStudentList] = useState([]);

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

  const mealTypes = [
    { value: "", label: "Select Meal Type" },
    { value: "Breakfast", label: "Breakfast" },
    { value: "AM Snack", label: "AM Snack" },
    { value: "Lunch", label: "Lunch" },
    { value: "PM Snack", label: "PM Snack" },
    { value: "Dinner", label: "Dinner" },
    { value: "Late Snack", label: "Late Snack" }
  ];

  const days = [
    { value: "mon", label: "Mon" },
    { value: "tue", label: "Tue" },
    { value: "wed", label: "Wed" },
    { value: "thu", label: "Thu" },
    { value: "fri", label: "Fri" },
    { value: "sat", label: "Sat" },
    { value: "sun", label: "Sun" }
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
      zIndex: 50
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#E2E8F0" : "white",
      color: state.data.value === "" ? "#9CA3AF" : "#1F1F1F"
    })
  };

  const getMenuList = () => {
    setLoading(true);

    let obj = {
      page: pageNo,
      search: debouncedSearch
    };

    getMenuListApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        console.log("message", message);
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setMenuData(datas);
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
    getMenuList();
  }, [pageNo, debouncedSearch]);

  const initialValues = {
    meal_type: "",
    menu_date: "",
    menu_time: "",
    description: "",
    selected_days: [],
    student: null,
    all_students: false
  };

  const validationSchema = Yup.object({
    meal_type: Yup.string().required("Meal type is required"),
    menu_date: Yup.string().required("Date is required"),
    menu_time: Yup.string().required("Time is required"),
    description: Yup.string()
      .min(10, "Description must be at least 10 characters")
      .max(200, "Description must be at most 200 characters")
      .required("Description is required"),
    selected_days: Yup.array()
      .min(1, "Please select at least one day")
      .required("Select at least one day"),
    all_students: Yup.boolean(),
    student: Yup.object({
      label: Yup.string().required(),
      value: Yup.string().required()
    }).when("all_students", {
      is: false,
      then: (schema) => schema.required("Student is required"),
      otherwise: (schema) => schema.nullable()
    })
  });

  const handleSubmit = (values) => {
    setBtnLoader(true);

    const [day, month, year] = values.menu_date.split("-");
    const formattedDob = `${year}-${month}-${day}`;

    const obj = {
      menu_type: values.meal_type,
      menu_date: formattedDob,
      menu_time: values.menu_time,
      about_meal: values.description,
      menu_days: values.selected_days,
      is_all: values.all_students,
      ...(values.all_students ? {} : { student_id: values.student?.value })
    };

    addMenuApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          getMenuList();
          toast.success(message);
          setAddMenuModal(false);
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

  const getAllStudentApi = () => {
    getStudentsMealApi()
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

  return (
    <div>
      <div className="flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-4 sy justify-between">
        <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
          Meal Tracking Activity Feed
        </h2>
        <div className="flex sm:flex-row flex-col items-start md:gap-2 gap-3">
          <button
            className="flex items-center justify-center w-[180px] space-x-1 py-2 px-5 bg-[#293FE3] rounded-lg"
            onClick={() => {
              setBtnLoader(false);
              setDob(null);
              setAddMenuModal(true);
            }}
          >
            <FiPlus className="text-white text-2xl" />
            <span className="text-white text-sm font-normal">Add Menu</span>
          </button>
        </div>
      </div>

      <div className="flex items-start lg:flex-row flex-col gap-5 mt-5">
        <div className="flex items-center border bg-[#F3F4F6] border-[#E5E7EB] sm:w-[400px] w-full rounded-lg px-3 py-3">
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
            placeholder="Search Meal type"
            className="input text-sm flex-1 outline-none border-none bg-transparent text-gray-800 px-2"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-5">
          <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8FAFB]">
                <tr>
                  {["Meal type", "Time", "Weekly Schedule", "Student"].map(
                    (col) => (
                      <th
                        key={col}
                        className="p-4 text-left text-[#3B4045] font-medium text-sm whitespace-nowrap"
                      >
                        {col}
                      </th>
                    )
                  )}
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
          {menuData?.length > 0 ? (
            <div className="mt-5">
              <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F8FAFB]">
                    <tr>
                      {["Meal type", "Time", "Weekly Schedule", "Student"].map(
                        (col) => (
                          <th
                            key={col}
                            className="p-4 text-left text-[#3B4045] select-none font-medium cursor-pointer text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group"
                          >
                            {col.replace(/([A-Z])/g, " $1").trim()}
                          </th>
                        )
                      )}
                      <th className="p-4 text-center text-[#3B4045] font-medium text-sm whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuData?.map((Item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          {Item.menu_type}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          {moment(Item.menu_time, "HH:mm").format("hh:mm A")}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          <div className="flex gap-3">
                            {Item.MenuDay?.map((days, index) => (
                              <div
                                key={index}
                                className={`w-[70px] py-1 text-center bg-[#E8F6EC] text-[#1BA345] rounded-full font-normal md:text-sm text-xs`}
                              >
                                {days?.menu_day}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          {Item?.is_all == true
                            ? " All Students"
                            : Item.student?.full_name}
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
                                  className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 border-b border-[#E9E9E9] hover:bg-gray-100"
                                  onClick={() =>
                                    navigate(
                                      `/school_admin/meal_tracking/mealtracking_details/${Item.id}`
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
                                <DropdownMenu.Item
                                  className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 border-b border-[#E9E9E9] hover:bg-gray-100"
                                  onClick={() =>
                                    navigate(
                                      `/school_admin/meal_tracking/mealtracking_details/${Item.id}`,
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
        open={addMenuModal}
        onClose={() => setAddMenuModal(false)}
        size="xl"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="py-4">
              <div className="w-full relative sm:text-center text-start my-3 md:px-8 px-4">
                <h1 className="md:text-xl text-lg font-semibold text-[#274372]">
                  Add Menu Details
                </h1>
                <button
                  className="absolute top-0 right-5"
                  onClick={() => setAddMenuModal(false)}
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
                  <Form Form className="mt-7 w-full">
                    <div className="md:px-10 px-4 w-full h-[570px] modalheight scroll overflow-y-auto">
                      <div className="w-full text-start mb-5">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          This menu is meant for which meal?
                        </label>
                        <Select
                          options={mealTypes}
                          onChange={(opt) =>
                            setFieldValue("meal_type", opt?.value)
                          }
                          placeholder="Select"
                          styles={customStyles}
                          className="md:text-sm text-xs font-medium"
                        />
                        <ErrorMessage
                          name="meal_type"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <div className="w-full mb-5">
                        <label className="block text-[#4B5563] font-normal text-sm mb-1">
                          When would you like to serve the menu?
                        </label>

                        <div className="relative w-full">
                          <Field
                            name="menu_time"
                            type="time"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none pr-12 bg-white text-black"
                          />
                          <ErrorMessage
                            name="menu_time"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>

                      <div className="w-full mb-5 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-1">
                          What would you like to add?
                        </label>
                        <Field
                          as="textarea"
                          name="description"
                          placeholder="Enter"
                          className="w-full h-[110px] border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                        <ErrorMessage
                          name="description"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <div className="w-full mb-5">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Select Your Weekly Schedule
                        </label>
                        <div className="flex w-full text-sm overflow-x-auto space-x-2">
                          {days.map((day) => (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => {
                                const updated = values.selected_days.includes(
                                  day.value
                                )
                                  ? values.selected_days.filter(
                                      (d) => d !== day.value
                                    )
                                  : [...values.selected_days, day.value];
                                setFieldValue("selected_days", updated);
                              }}
                              className={`lg:px-4 px-2 py-2 border border-[#E5E7EB] rounded-lg lg:w-[70px] w-[60px] h-[40px] text-[#9CA3AF] font-normal md:text-sm text-xs transition ${
                                values.selected_days.includes(day.value)
                                  ? "bg-[#293FE3] text-white"
                                  : "bg-white"
                              }`}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                        <ErrorMessage
                          name="selected_days"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>
                      <div className="w-full text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Which student is this menu for?
                        </label>
                        <Select
                          options={studentList}
                          styles={customStyles}
                          className="text-sm font-medium"
                          placeholder="Select Student"
                          value={values.student}
                          isDisabled={values.all_students}
                          onChange={(option) => {
                            setFieldValue("student", option);
                            if (option) {
                              setFieldValue("all_students", false);
                            }
                          }}
                        />

                        <ErrorMessage
                          name="student"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <div className="mb-5 mt-4">
                        <label className="flex text-sm items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={values.all_students}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFieldValue("all_students", checked);
                              if (checked) {
                                setFieldValue("student", null);
                              }
                            }}
                            className="hidden peer"
                          />
                          <div
                            className={`md:w-6 w-4 md:h-6 h-4 md:rounded-lg rounded-md p-0.5 border-2 border-gray-400 flex items-center justify-center ${
                              values.student
                                ? "opacity-50 pointer-events-none"
                                : "peer-checked:bg-[#293FE3] peer-checked:border-[#293FE3]"
                            }`}
                          >
                            <FaCheck className="text-white" />
                          </div>
                          <span className="font-medium ml-2 text-sm text-[#6B757D] select-none">
                            All Students
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-10 md:px-8 px-4 flex justify-between md:w-[500px] mx-auto w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setAddMenuModal(false)}
                        className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={btnLoader}
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
