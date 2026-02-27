import { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Calendar } from "react-multi-date-picker";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoMdClose } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
import EditIcon from "../../../assets/icons/edit.png";
import DeleteIcon from "../../../assets/icons/trash.png";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import DeleteModalIcon from "../../../assets/icons/DeleteIcon(1).png";
import datePickerIcon from "../../../assets/icons/datePicker.png";
import DatePicker from "react-multi-date-picker";
import {
  addEventApi,
  deleteEventsApi,
  editEventApi,
  getEventListApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import { DotLoader } from "../../../base-component/Loader/Loader";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import noEvents from "../../../assets/Svg/TIME_AND_DATE_OUT_SHADOW.svg";
import EventDescription from "../../../components/EventDescription/EventDescription";

export default function UpcomingEvents() {
  const [addEventModal, setAddEventModal] = useState(false);
  const [editEventModal, setEditEventModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [btnLoader, setBtnLoader] = useState(false);
  const pickerRef = useRef(null);
  const pickerInstanceRef = useRef(null);
  const [dob, setDob] = useState(null);
  const [ids, setIds] = useState(null);
  const [editData, setEditData] = useState(null);
  const navigate = useNavigate();

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

  const colors = [
    "#293FE3",
    "#1D3256",
    "#FFB30B",
    "#BF8608",
    "#FF6700",
    "#BF4D00"
  ];

  useEffect(() => {
    if (editData) {
      setDob(
        editData?.date_format
          ? moment(editData.date_format, "YYYY-MM-DD").toDate()
          : null
      );
    }
  }, [editData]);

  const getEventList = () => {
    setLoading(true);

    let obj = {
      month: currentMonth,
      year: currentYear
    };
    getEventListApi(obj)
      .then((res) => {
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          const formattedEvents = datas?.map((event) => {
            const dateObj = new Date(event.event_date);
            const day = dateObj?.getDate();
            const monthName = dateObj?.toLocaleString("default", {
              month: "long"
            });
            const month = String(dateObj?.getMonth() + 1).padStart(2, "0");
            const year = dateObj?.getFullYear();
            const formattedDate = `${year}-${month}-${day}`;

            const formatTime = (timeStr) => {
              if (!timeStr) return "";
              let [hour, min] = timeStr.slice(0, 5).split(":");
              if (hour === "00") hour = "12";
              return `${hour}:${min}`;
            };

            return {
              id: event?.id,
              date: `${day} ${monthName}, ${year}`,
              date_format: formattedDate,
              title: event.event_name,
              start_time: formatTime(event.start_time),
              end_time: formatTime(event.end_time),
              description: event.about_event,
              color: event.color_name,
              is_all: event?.is_all,
              is_parent: event?.is_parent,
              is_principal: event?.is_principal,
              is_teacher: event?.is_teacher
            };
          });

          setEventData(formattedEvents);
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
    getEventList();
  }, [currentMonth, currentYear]);

  const validationSchema = Yup.object().shape({
    event_name: Yup.string()
      .required("Event Name is required")
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be at most 50 characters"),
    event_date: Yup.date().required("Date is required"),
    start_time: Yup.string().required("Start time is required"),
    end_time: Yup.string()
      .required("End time is required")
      .test(
        "is-after-start",
        "End time must be after start time",
        function (value) {
          const { start_time } = this.parent;
          if (!start_time || !value) return true;
          return value > start_time;
        }
      ),
    about_event: Yup.string()
      .required("About Event is required")
      .min(5, "About must be at least 5 characters")
      .max(700, "About must be at most 700 characters"),
    selected_color: Yup.string().required("Color is required"),
    attendance: Yup.object().test(
      "at-least-one-checked",
      "Please select at least one attendance option",
      function () {
        const { is_all, is_principal, is_teacher, is_parent } = this.parent;
        return is_all || is_principal || is_teacher || is_parent;
      }
    )
  });

  const initialValues = {
    event_name: editData?.title || "",
    event_date: editData?.date_format || "",
    start_time: editData?.start_time?.slice(0, 5) || "",
    end_time: editData?.end_time?.slice(0, 5) || "",
    about_event: editData?.description || "",
    selected_color: editData?.color || "",
    is_all: editData?.is_all || false,
    is_teacher: editData?.is_teacher || false,
    is_parent: editData?.is_parent || false,
    is_principal: editData?.is_principal || false,
    attendance: {}
  };

  const handleSubmit = (values) => {
    setBtnLoader(true);

    let obj = {
      event_name: values?.event_name,
      event_date: values?.event_date,
      start_time: values?.start_time,
      end_time: values?.end_time,
      about_event: values?.about_event,
      color_name: values?.selected_color,
      is_all: values?.is_all,
      is_teacher: values?.is_teacher,
      is_parent: values?.is_parent,
      is_principal: values?.is_principal
    };

    addEventApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          getEventList();
          toast.success(message);
          setAddEventModal(false);
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

  const handleEditApi = (values) => {
    setBtnLoader(true);

    let obj = {
      event_id: editData?.id,
      event_name: values?.event_name,
      event_date: values?.event_date,
      start_time: values?.start_time,
      end_time: values?.end_time,
      about_event: values?.about_event,
      color_name: values?.selected_color,
      is_all: values?.is_all,
      is_teacher: values?.is_teacher,
      is_parent: values?.is_parent,
      is_principal: values?.is_principal
    };

    editEventApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          getEventList();
          toast.success(message);
          setEditEventModal(false);
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
    deleteEventsApi(ids)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          getEventList();
          setDeleteModal(false);
        }
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
    <div>
      <div className="flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-4 sy justify-between">
        <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
          Upcoming Events List
        </h2>
        <div className="flex sm:flex-row flex-col items-start md:gap-2 gap-3">
          <button
            onClick={() => {
              setDob(null);
              setEditData(null);
              setAddEventModal(true);
            }}
            className="flex items-center justify-center space-x-1 py-2 px-5 bg-[#293FE3] rounded-lg"
          >
            <FiPlus className="text-white text-2xl" />
            <span className="text-white text-sm font-normal">Add Event</span>
          </button>
        </div>
      </div>

      <div className="mt-5 flex xl:flex-row flex-col gap-5">
        <div>
          <Calendar
            onMonthChange={(date) => {
              const newMonth = date.month.number;
              setCurrentMonth(newMonth);
              if (currentMonth === 12 && newMonth === 1) {
                setCurrentYear((prevYear) => prevYear + 1);
              } else if (currentMonth === 1 && newMonth === 12) {
                setCurrentYear((prevYear) => prevYear - 1);
              }
            }}
            onYearChange={(date) => {
              setCurrentYear(date.year);
            }}
            className="events_calendar"
            mapDays={({ date }) => {
              const formattedDate = `${date.year}/${date.month.number}/${date.day}`;

              const today = new Date();
              const isToday =
                date.year === today.getFullYear() &&
                date.month.number === today.getMonth() + 1 &&
                date.day === today.getDate();

              const event = eventData.find((ev) => {
                const [day, month, year] = ev.date.replace(",", "").split(" ");
                return (
                  formattedDate ===
                  `${year}/${new Date(`${month} 1, ${year}`).getMonth() + 1}/${day}`
                );
              });

              return {
                disabled: true,
                className: event
                  ? "event-day"
                  : isToday
                    ? "today-no-event"
                    : "",
                style: {
                  backgroundColor: event
                    ? event.color && event.color.startsWith("#")
                      ? event.color
                      : "#FFB30B"
                    : isToday
                      ? "transparent"
                      : "inherit",
                  margin: "auto",
                  width: "45px",
                  color: event ? "#fff" : "inherit",
                  borderRadius: "50%",
                  pointerEvents: "none"
                }
              };
            }}
          />
        </div>

        <div className="space-y-4 w-full">
          {eventData?.map((event, index) => (
            <div
              key={index}
              className="w-full bg-white shadow rounded-lg flex items-start p-5 cursor-pointer"
            >
              <div
                className="w-3 h-3 mt-1 mr-2 rounded-full"
                style={{ backgroundColor: event.color }}
              ></div>

              <div className="w-full">
                <div className="flex items-start justify-between">
                  <p className="text-[#1F1F1F] font-medium md:text-[15px] text-sm">
                    {event.date}
                  </p>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild className="outline-none">
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
                          onClick={() => {
                            setEditData(event);
                            setEditEventModal(true);
                          }}
                        >
                          <img
                            src={EditIcon}
                            className="w-[20px] h-[20px]"
                            alt=""
                          />
                          <span className="text-[#1F1F1F] font-normal text-sm">
                            Edit
                          </span>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 pb-2 hover:bg-gray-100"
                          onClick={() => {
                            setIds(event?.id);
                            setDeleteModal(true);
                          }}
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
                </div>
                <p className="text-[#1F1F1F] font-normal md:text-[15px] text-sm">
                  {event.title}
                </p>
                <p className="text-[#1F1F1F] font-medium md:text-[15px] text-sm mt-2">
                  Time :{" "}
                  <span className="font-normal">
                    {event.start_time} to {event.end_time}
                  </span>
                </p>
                <p className="text-[#1F1F1F] font-normal md:text-[15px] text-sm mt-2">
                  <EventDescription description={event.description} />
                </p>
              </div>
            </div>
          ))}

          {eventData.length === 0 && (
            <div className="flex justify-center h-[75vh] items-center">
              <div className="m-auto flex flex-col items-center space-y-4">
                <img
                  src={noEvents}
                  alt="No Events"
                  className="w-[100px] h-[100px] object-cover"
                />
                <div className="text-center  flex items-center text-[#1F1F1F] text-sm font-normal">
                  No events found for this month.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={addEventModal}
        onClose={() => setAddEventModal(false)}
        size="xl"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="py-4">
              <div className="w-full relative sm:text-center text-start my-3 md:px-8 px-4">
                <h1 className="md:text-xl text-lg font-semibold text-[#274372]">
                  Add Event
                </h1>
                <button
                  className="absolute top-0 right-5"
                  onClick={() => setAddEventModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, setFieldValue, errors, touched }) => (
                  <Form className="mt-7 w-full">
                    <div className="md:px-10 px-4 w-full h-[580px] modalheight scroll overflow-y-auto">
                      <div className="text-start w-full mb-4">
                        <label className="block text-[#4B5563] text-sm mb-2">
                          Event Name
                        </label>
                        <Field
                          name="event_name"
                          type="text"
                          placeholder="Enter"
                          className="w-full border text-sm px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                        {touched.event_name && errors.event_name && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.event_name}
                          </div>
                        )}
                      </div>

                      <div className="text-start w-full mb-4">
                        <label className="block text-[#4B5563] text-sm mb-2">
                          Date
                        </label>
                        <div className="div" ref={pickerRef}>
                          <div className="relative w-full">
                            <DatePicker
                              ref={pickerInstanceRef}
                              value={dob}
                              onChange={(val) => {
                                setDob(val);
                                setFieldValue(
                                  "event_date",
                                  val?.format("YYYY-MM-DD")
                                );
                              }}
                              name="event_date"
                              format="YYYY-MM-DD"
                              editable={false}
                              placeholder="Select Date"
                              className="w-full  border text-sm border-[#E5E7EB] p-2 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                              inputClass="w-full border text-sm border-[#E5E7EB] p-2 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                              hideOnScroll={true}
                              minDate={new Date()}
                              containerStyle={{
                                position: "relative"
                              }}
                              style={{
                                zIndex: 100
                              }}
                              calendarPosition="bottom-center"
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
                          {touched.event_date && errors.event_date && (
                            <div className="text-red-500 text-xs mt-1">
                              {errors.event_date}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-full flex md:flex-row flex-col gap-3 mt-5">
                        {["start_time", "end_time"].map((field, idx) => (
                          <div key={field} className="w-full relative">
                            <label className="block text-[#4B5563] text-sm mb-2">
                              {idx === 0 ? "Start Time" : "End Time"}
                            </label>
                            <Field
                              name={field}
                              type="time"
                              className="w-full border text-sm px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none bg-white"
                            />
                            {touched[field] && errors[field] && (
                              <div className="text-red-500 text-xs mt-1">
                                {errors[field]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="w-full mt-5">
                        <h3 className="text-[#4B5563] text-sm text-start mb-2">
                          Attendance Request for Events
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          <label
                            className={`flex items-center space-x-2 ${
                              values.is_principal ||
                              values.is_teacher ||
                              values.is_parent
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={values.is_all}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFieldValue("is_all", checked);
                                setFieldValue("is_principal", false);
                                setFieldValue("is_teacher", false);
                                setFieldValue("is_parent", false);
                              }}
                              disabled={
                                values.is_principal ||
                                values.is_teacher ||
                                values.is_parent
                              }
                              className="hidden peer"
                            />
                            <div
                              className={`w-5 h-5 border-2 border-gray-400 flex items-center justify-center rounded-md ${
                                values.is_all
                                  ? "bg-[#293FE3] border-[#293FE3]"
                                  : ""
                              } ${
                                values.is_principal ||
                                values.is_teacher ||
                                values.is_parent
                                  ? "cursor-not-allowed"
                                  : "cursor-pointer"
                              }`}
                            >
                              {values.is_all && (
                                <FaCheck className="text-white text-sm" />
                              )}
                            </div>
                            <span className="text-sm text-[#6B757D]">All</span>
                          </label>

                          {[
                            { key: "is_principal", label: "Principal" },
                            { key: "is_teacher", label: "Teacher" },
                            { key: "is_parent", label: "Parent" }
                          ].map(({ key, label }) => (
                            <label
                              key={key}
                              className={`flex items-center space-x-2 ${values.is_all ? "cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <input
                                type="checkbox"
                                checked={values[key]}
                                disabled={values.is_all}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setFieldValue(key, checked);
                                  if (checked) {
                                    setFieldValue("is_all", false);
                                  }
                                }}
                                className="hidden peer"
                              />
                              <div
                                className={`w-5 h-5 border-2 border-gray-400 flex items-center justify-center rounded-md ${
                                  values[key]
                                    ? "bg-[#293FE3] border-[#293FE3]"
                                    : ""
                                } ${values.is_all ? "cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                {values[key] && (
                                  <FaCheck className="text-white text-sm" />
                                )}
                              </div>
                              <span className="text-sm text-[#6B757D]">
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>
                        {touched.attendance && errors.attendance && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.attendance}
                          </div>
                        )}
                      </div>

                      <div className="text-start w-full mt-4 mb-4">
                        <label className="block text-[#4B5563] text-sm mb-2">
                          About Event
                        </label>
                        <Field
                          as="textarea"
                          name="about_event"
                          placeholder="Enter"
                          className="w-full h-[110px] text-sm border px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                        {touched.about_event && errors.about_event && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.about_event}
                          </div>
                        )}
                      </div>

                      <div className="text-start w-full mt-4 mb-4">
                        <label className="block text-[#4B5563] text-sm mb-2">
                          Select Color
                        </label>
                        <div className="flex space-x-4">
                          {colors?.map((color, idx) => (
                            <div
                              key={idx}
                              style={{ backgroundColor: color }}
                              className={`w-8 h-8 rounded-lg cursor-pointer flex items-center justify-center ${values.selected_color === color ? "ring-2 ring-white" : ""}`}
                              onClick={() =>
                                setFieldValue("selected_color", color)
                              }
                            >
                              {values.selected_color === color && (
                                <FaCheck className="text-white text-xl" />
                              )}
                            </div>
                          ))}
                        </div>
                        {touched.selected_color && errors.selected_color && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.selected_color}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 md:px-8 px-4 flex justify-between md:w-[500px] mx-auto w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setAddEventModal(false)}
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

      <Dialog
        open={editEventModal}
        onClose={() => setEditEventModal(false)}
        size="xl"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="py-4">
              <div className="w-full relative sm:text-center text-start my-3 md:px-8 px-4">
                <h1 className="md:text-2xl text-lg font-semibold text-[#274372]">
                  Edit Event
                </h1>
                <button
                  className="absolute top-0 right-5"
                  onClick={() => setEditEventModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleEditApi}
              >
                {({ values, setFieldValue, errors, touched }) => (
                  <Form className="mt-7 w-full">
                    <div className="md:px-10 px-4 w-full h-[580px] modalheight scroll overflow-y-auto">
                      <div className="text-start w-full mb-4">
                        <label className="block text-[#4B5563] text-sm mb-2">
                          Event Name
                        </label>
                        <Field
                          name="event_name"
                          type="text"
                          placeholder="Enter"
                          className="w-full border text-sm px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                        {touched.event_name && errors.event_name && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.event_name}
                          </div>
                        )}
                      </div>

                      <div className="text-start w-full mb-4">
                        <label className="block text-[#4B5563] text-sm mb-2">
                          Date
                        </label>
                        <div className="div" ref={pickerRef}>
                          <div className="relative w-full">
                            <DatePicker
                              ref={pickerInstanceRef}
                              value={dob}
                              onChange={(val) => {
                                setDob(val);
                                setFieldValue(
                                  "event_date",
                                  val?.format("YYYY-MM-DD")
                                );
                              }}
                              name="event_date"
                              format="YYYY-MM-DD"
                              editable={false}
                              placeholder="Select Date"
                              className="w-full border text-sm border-[#E5E7EB] p-2 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                              inputClass="w-full border text-sm border-[#E5E7EB] p-2 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                              hideOnScroll={true}
                              minDate={new Date()}
                              containerStyle={{
                                position: "relative"
                              }}
                              style={{
                                zIndex: 100
                              }}
                              calendarPosition="bottom-center"
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
                          {touched.event_date && errors.event_date && (
                            <div className="text-red-500 text-xs mt-1">
                              {errors.event_date}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-full flex md:flex-row flex-col gap-3 mt-5">
                        {["start_time", "end_time"].map((field, idx) => (
                          <div key={field} className="w-full relative">
                            <label className="block text-[#4B5563] text-sm mb-2">
                              {idx === 0 ? "Start Time" : "End Time"}
                            </label>
                            <Field
                              name={field}
                              type="time"
                              step="60"
                              timeFormat="HH:mm"
                              className="w-full border text-sm px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none bg-white"
                            />
                            {touched[field] && errors[field] && (
                              <div className="text-red-500 text-xs mt-1">
                                {errors[field]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="w-full mt-5">
                        <h3 className="text-[#4B5563] text-sm text-start mb-2">
                          Attendance Request for Events
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          <label
                            className={`flex items-center space-x-2 ${
                              values.is_principal ||
                              values.is_teacher ||
                              values.is_parent
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={values.is_all}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFieldValue("is_all", checked);
                                setFieldValue("is_principal", false);
                                setFieldValue("is_teacher", false);
                                setFieldValue("is_parent", false);
                              }}
                              disabled={
                                values.is_principal ||
                                values.is_teacher ||
                                values.is_parent
                              }
                              className="hidden peer"
                            />
                            <div
                              className={`w-5 h-5 border-2 border-gray-400 flex items-center justify-center rounded-md ${
                                values.is_all
                                  ? "bg-[#293FE3] border-[#293FE3]"
                                  : ""
                              } ${
                                values.is_principal ||
                                values.is_teacher ||
                                values.is_parent
                                  ? "cursor-not-allowed"
                                  : "cursor-pointer"
                              }`}
                            >
                              {values.is_all && (
                                <FaCheck className="text-white text-sm" />
                              )}
                            </div>
                            <span className="text-sm text-[#6B757D]">All</span>
                          </label>

                          {[
                            { key: "is_principal", label: "Principal" },
                            { key: "is_teacher", label: "Teacher" },
                            { key: "is_parent", label: "Parent" }
                          ].map(({ key, label }) => (
                            <label
                              key={key}
                              className={`flex items-center space-x-2 ${values.is_all ? "cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <input
                                type="checkbox"
                                checked={values[key]}
                                disabled={values.is_all}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setFieldValue(key, checked);
                                  if (checked) {
                                    setFieldValue("is_all", false);
                                  }
                                }}
                                className="hidden peer"
                              />
                              <div
                                className={`w-5 h-5 border-2 border-gray-400 flex items-center justify-center rounded-md ${
                                  values[key]
                                    ? "bg-[#293FE3] border-[#293FE3]"
                                    : ""
                                } ${values.is_all ? "cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                {values[key] && (
                                  <FaCheck className="text-white text-sm" />
                                )}
                              </div>
                              <span className="text-sm text-[#6B757D]">
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>
                        {touched.attendance && errors.attendance && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.attendance}
                          </div>
                        )}
                      </div>

                      <div className="text-start w-full mt-4 mb-4">
                        <label className="block text-[#4B5563] text-sm mb-2">
                          About Event
                        </label>
                        <Field
                          as="textarea"
                          name="about_event"
                          placeholder="Enter"
                          className="w-full h-[110px] text-sm border px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                        {touched.about_event && errors.about_event && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.about_event}
                          </div>
                        )}
                      </div>

                      <div className="text-start w-full mt-4 mb-4">
                        <label className="block text-[#4B5563] text-sm mb-2">
                          Select Color
                        </label>
                        <div className="flex space-x-4">
                          {colors?.map((color, idx) => (
                            <div
                              key={idx}
                              style={{ backgroundColor: color }}
                              className={`w-8 h-8 rounded-lg cursor-pointer flex items-center justify-center ${values.selected_color === color ? "ring-2 ring-white" : ""}`}
                              onClick={() =>
                                setFieldValue("selected_color", color)
                              }
                            >
                              {values.selected_color === color && (
                                <FaCheck className="text-white text-xl" />
                              )}
                            </div>
                          ))}
                        </div>
                        {touched.selected_color && errors.selected_color && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.selected_color}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 md:px-8 px-4 flex justify-between md:w-[500px] mx-auto w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setEditEventModal(false)}
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
                  Delete Events
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
                      Are you sure you want to delete this event?
                    </h4>
                    <p>
                      This decision is final and cannot be undone. Please
                      confirm to continue.
                    </p>
                  </div>
                </div>
                <div className="flex justify-between w-full mb-3">
                  <div className="mt-5 flex justify-between w-full">
                    <button
                      type="button"
                      onClick={() => setDeleteModal(false)}
                      className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
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
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
