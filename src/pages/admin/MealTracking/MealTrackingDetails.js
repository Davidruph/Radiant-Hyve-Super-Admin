import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BackIcon from "../../../assets/icons/BackIcon.png";
import editIcon from "../../../assets/icons/edit.png";
import deleteIcon from "../../../assets/icons/trash.png";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoMdClose } from "react-icons/io";
import Select from "react-select";
import DatePicker from "react-multi-date-picker";
import datePickerIcon from "../../../assets/icons/datePicker.png";
import DeleteModalIcon from "../../../assets/icons/DeleteIcon.png";
import { FaCheck } from "react-icons/fa";
import {
  deleteMenuApi,
  editMenuApi,
  getMenuApi,
  getStudentsMealApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { DotLoader } from "../../../base-component/Loader/Loader";
import moment from "moment";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";

const MealTrackingDetails = () => {
  const { id } = useParams();
  const [editMenuModal, setEditMenuModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [btnLoader, setBtnLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [menuDetails, setMenuDetails] = useState({});
  const [studentList, setStudentList] = useState([]);
  const [dob, setDob] = useState(null);
  const pickerRef = useRef(null);
  const pickerInstanceRef = useRef(null);

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

  const selectedDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map(
    (day) => ({
      name: day.toUpperCase(),
      selected: menuDetails.MenuDay?.some((d) => d.menu_day === day)
    })
  );

  const days = [
    { value: "mon", label: "Mon" },
    { value: "tue", label: "Tue" },
    { value: "wed", label: "Wed" },
    { value: "thu", label: "Thu" },
    { value: "fri", label: "Fri" },
    { value: "sat", label: "Sat" },
    { value: "sun", label: "Sun" }
  ];

  useEffect(() => {
    if (location.state?.deleteModal) {
      setDeleteModal(true);
    }
    if (location.state) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const mealTypes = [
    { value: "", label: "Select Meal Type" },
    { value: "Breakfast", label: "Breakfast" },
    { value: "AM Snack", label: "AM Snack" },
    { value: "Lunch", label: "Lunch" },
    { value: "PM Snack", label: "PM Snack" },
    { value: "Dinner", label: "Dinner" },
    { value: "Late Snack", label: "Late Snack" }
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

  const menuDetailsApi = () => {
    setLoader(true);
    let obj = {
      menu_id: id
    };
    getMenuApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setMenuDetails(datas);
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
            navigate("/school_admin/meal_tracking");
          }
        }
        setLoader(false);
      });
  };

  useEffect(() => {
    menuDetailsApi();
  }, [id]);

  const handleDelete = () => {
    setBtnLoader(true);
    deleteMenuApi(id)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          navigate("/school_admin/meal_tracking");
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

  useEffect(() => {
    if (menuDetails?.menu_date) {
      setDob(
        menuDetails?.menu_date
          ? moment(menuDetails?.menu_date, "YYYY-MM-DD").toDate()
          : null
      );
    }
  }, [menuDetails]);

  const initialValues = useMemo(() => {
    if (!menuDetails)
      return {
        meal_type: "",
        menu_time: "",
        description: "",
        selected_days: [],
        student: null,
        all_students: false
      };

    const matchedStudent = studentList.find(
      (s) => s.value === menuDetails.student_id
    );

    return {
      meal_type: menuDetails.menu_type || "",
      menu_time: menuDetails?.menu_time?.slice(0, 5) || "",
      description: menuDetails.about_meal || "",
      selected_days: menuDetails.MenuDay?.map((d) => d.menu_day) || [],
      student: menuDetails.is_all ? null : matchedStudent || null,
      all_students: menuDetails.is_all || false
    };
  }, [menuDetails]);

  const validationSchema = Yup.object({
    meal_type: Yup.string().required("Meal type is required"),
    menu_time: Yup.string().required("Time is required"),
    description: Yup.string()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters")
      .max(200, "Description must be at most 200 characters"),
    selected_days: Yup.array()
      .min(1, "Please select at least one day")
      .required("Select at least one day"),
    all_students: Yup.boolean(),
    student: Yup.object({
      label: Yup.string().required(),
      value: Yup.mixed().required()
    })
      .nullable()
      .when("all_students", {
        is: false,
        then: (schema) => schema.required("Student is required"),
        otherwise: (schema) => schema.nullable()
      })
  });

  const handleSubmit = (values) => {
    setBtnLoader(true);

    const obj = {
      menu_id: id,
      menu_type: values.meal_type,
      menu_time: values.menu_time,
      about_meal: values.description,
      menu_days: values.selected_days,
      is_all: values.all_students
    };

    if (!values.all_students && values.student?.value) {
      obj.student_id = values.student.value;
    }

    editMenuApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          menuDetailsApi();
          toast.success(message);
          setEditMenuModal(false);
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
            <h3 className="text-xl font-semibold">Meal Information</h3>
            <div className="flex items-center gap-5 sm:mt-0 mt-4">
              <button
                className="bg-[#FFF7E7] flex items-center justify-center gap-2 py-1.5 sm:w-[132px] w-28 h-9 rounded-lg"
                onClick={() => setEditMenuModal(true)}
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
          <div>
            <div className="mb-5">
              <label className="text-[#4B5563] font-semibold md:text-base text-sm">
                This menu is meant for which meal?
              </label>
              <div className="flex text-end justify-between mt-2">
                <p className="font-normal md:text-sm text-xs text-[#4B5563]">
                  Meal type
                </p>
                <p className="font-normal md:text-base text-sm text-[#1F1F1F]">
                  {menuDetails.menu_type || "-"}
                </p>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[#4B5563] font-semibold md:text-base text-sm">
                When would you like to serve the menu?
              </label>

              <div className="flex text-end justify-between mt-2">
                <p className="font-normal md:text-sm text-xs text-[#4B5563]">
                  Time
                </p>
                <p className="font-normal md:text-base text-sm text-[#1F1F1F]">
                  {menuDetails.menu_time
                    ? moment(menuDetails.menu_time, "HH:mm:ss").format(
                        "hh:mm A"
                      )
                    : "-"}
                </p>
              </div>

              <div className="flex text-end justify-between mt-2">
                <p className="font-normal md:text-sm text-xs text-[#4B5563]">
                  Student
                </p>
                <p className="font-normal md:text-base text-sm text-[#1F1F1F]">
                  {menuDetails.is_all
                    ? "All Students"
                    : menuDetails.student?.full_name || "N/A"}
                </p>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[#4B5563] font-semibold md:text-base text-sm">
                What would you like to add?
              </label>
              <div className="text-start mt-2">
                <p className="font-normal md:text-base line-clamp-3 text-sm text-[#1F1F1F] whitespace-normal break-all">
                  {menuDetails.about_meal || "-"}
                </p>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[#4B5563] font-semibold md:text-base text-sm">
                Select Your Weekly Schedule
              </label>
              <div className="text-start mt-2">
                <div className="flex flex-wrap gap-2">
                  {selectedDays.map((day, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 w-[80px] h-[40px] text-sm rounded-lg transition-all duration-150 ${
                        day.selected
                          ? "bg-[#293FE3] text-white"
                          : "bg-white border border-[#E5E7EB] text-[#9CA3AF]"
                      }`}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={editMenuModal}
        onClose={() => setEditMenuModal(false)}
        size="xl"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="py-4">
              <div className="w-full relative sm:text-center text-start my-3 md:px-8 px-4">
                <h1 className="md:text-xl text-lg font-semibold text-[#274372]">
                  Edit Information
                </h1>
                <button
                  className="absolute top-0 right-5"
                  onClick={() => setEditMenuModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
              >
                {({ setFieldValue, values }) => (
                  <Form Form className=" w-full">
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
                          value={mealTypes?.find(
                            (opt) => opt.value === values.meal_type
                          )}
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
                        <div className="flex w-full gap-5">
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
                          name="student"
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
                            className={`md:w-6 w-4 md:h-6 h-4 md:rounded-lg rounded-md p-0.5 border-2 border-gray-400 flex items-center justify-center ${values.student ? "opacity-50 pointer-events-none" : "peer-checked:bg-[#293FE3] peer-checked:border-[#293FE3]"}`}
                          >
                            <FaCheck className="text-white" />
                          </div>
                          <span className="font-medium ml-2 text-sm text-[#6B757D] select-none">
                            All Students
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="md:px-8 px-4 flex justify-between md:w-[500px] mx-auto w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setEditMenuModal(false)}
                        className="bg-[#DFE3EA] w-full md:py-3 py-2 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
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
                  Delete Meal Tacking
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
                      Are you sure you want to delete these Meal tracking?
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
                    {btnLoader ? <DotLoader color="#fff" /> : "Yes, Delete"}
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

export default MealTrackingDetails;
