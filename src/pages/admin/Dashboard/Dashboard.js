import React, { Fragment, useEffect, useState } from "react";
import PrincipaleIcon from "../../../assets/icons/PrincipalIcon.png";
import StaffIcon from "../../../assets/icons/StaffIcon.png";
import StudentIcon from "../../../assets/icons/StudentIcon.png";
import ParentsIcon from "../../../assets/icons/FamilyIcon.png";
import EarningsIcon from "../../../assets/icons/EarningIcon.png";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import ReportBarChart1 from "../../../components/BarChart/BarChart";
import { Calendar } from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/yellow.css";
import { Listbox, Transition } from "@headlessui/react";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import {
  getBirthdayCountApi,
  getDashboardApi,
  getEventListApi,
  getRemainingFeesApi,
  getStudentFeesListApi,
  getStudentPaymentReceiptApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import noEvents from "../../../assets/Svg/TIME_AND_DATE_OUT_SHADOW.svg";
import Skeleton from "react-loading-skeleton";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";
import { DotLoader } from "../../../base-component/Loader/Loader";
import Dialog from "../../../base-component/Dialog/Dialog";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Card from "../../../components/Card/Card";
import { LiaCoinsSolid } from "react-icons/lia";
import { GrUserExpert } from "react-icons/gr";
import { AiOutlineUser } from "react-icons/ai";
import { LuUserRoundPen } from "react-icons/lu";
import { FaUserGraduate } from "react-icons/fa";

const weeks = [
  { name: "Today", value: "today" },
  { name: "This week", value: "week" },
  { name: "This Month", value: "month" }
];

const reminderValidationSchema = Yup.object().shape({
  reminderTitle: Yup.string()
    .required("Reminder title is required")
    .min(3, "Reminder title must be at least 3 characters")
    .max(100, "Reminder title must not exceed 100 characters"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters")
});

const Dashboard = () => {
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [dashboardData, setDasboardData] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [birthdayCount, setBirthdayCount] = useState("");
  const [eventData, setEventData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loader, setLoader] = useState(false);
  const [loaders, setLoaders] = useState(false);
  const [selected, setSelected] = useState(weeks[2]);
  const [selectedAttendance, setSelectedAttendance] = useState(weeks[1]);
  const [studentPaymentData, setStudentPaymentData] = useState([]);
  const [openParentsIfo, setOpenParentsIfo] = useState(false);
  const [parentsInfo, setParentsInfo] = useState(null);

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
              ? "bg-[#9810FA] text-white rounded-lg px-4 py-1.5 mr-2 font-medium text-base border"
              : "text-gray-600 border border-[#F0F1F2] px-4 rounded-lg font-medium md:text-base text-sm py-1.5 mr-2"
          }
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const dashboardDetails = [
    {
      icon: <LuUserRoundPen className="text-white text-2xl" />,
      title: "Total Principals",
      count: dashboardData?.total_principal || 0,
      path: "/school_admin/principal"
    },
    {
      icon: <GrUserExpert className="text-white text-2xl" />,
      title: "Total Staff",
      count: dashboardData?.total_staff || 0,
      path: "/school_admin/staff"
    },
    {
      icon: <AiOutlineUser className="text-white text-2xl" />,
      title: "Total Parents",
      count: dashboardData?.total_parent || 0,
      path: "/school_admin/parents"
    },
    {
      icon: <FaUserGraduate className="text-white text-2xl" />,
      title: "Total Students",
      count: dashboardData?.total_student || 0,
      path: "/school_admin/student"
    },

    {
      icon: <LiaCoinsSolid className="text-white text-2xl" />,
      title: "Total Earnings",
      count: `$${!isNaN(parseFloat(dashboardData?.total_earning)) ? parseFloat(dashboardData?.total_earning).toFixed(2) : "0.00"}`,
      path: "/school_admin/payment"
    }
  ];

  const getDashboardCountApi = () => {
    setLoader(true);
    getDashboardApi()
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setDasboardData(datas);
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
        }
        setLoader(false);
      });
  };

  const getBirthCountApi = () => {
    setLoaders(true);
    let params = {
      filter: selected?.value
    };

    getBirthdayCountApi(params)
      .then((res) => {
        if (res.data.status === 1) {
          const datas = res?.data;
          setBirthdayCount(datas);
        }
        setLoaders(false);
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
        setLoaders(false);
      });
  };

  useEffect(() => {
    getDashboardCountApi();
  }, []);

  useEffect(() => {
    getBirthCountApi();
  }, [selected]);

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

  const eventMap = {};
  eventData.forEach((event) => {
    const formatted = new Date(event.date_format).toLocaleDateString("fr-CA");
    eventMap[formatted] = {
      ...event,
      className: "event-day",
      bgColor: event.color?.startsWith("#") ? event.color : "#FFB30B"
    };
  });

  useEffect(() => {
    getEventList();
  }, [currentMonth, currentYear]);

  const getStudentPaymentList = () => {
    setLoading(true);

    let obj = {
      page: 1,
      month: currentMonth,
      year: currentYear,
      type: 0
    };

    getStudentFeesListApi(obj)
      .then((res) => {
        const message = res.data.total_page;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setStudentPaymentData(datas);
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

  useEffect(() => {
    getStudentPaymentList();
  }, [currentMonth, currentYear, pageNo]);

  const handleParentsInfo = (item) => {
    setOpenParentsIfo(true);
    setParentsInfo(item);
  };

  const handleReminderSubmit = (values, { setSubmitting, resetForm }) => {
    console.log("Form values:", values);

    let obj = {
      student_id: parentsInfo.id,
      title: values.reminderTitle,
      body: values.description,
      year: currentYear,
      month: currentMonth
    };

    getRemainingFeesApi(obj)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          getStudentPaymentList();
          setOpenParentsIfo(false);
          resetForm();
          setSubmitting(false);
        }
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
        setSubmitting(false);
      });
  };

  return (
    <>
      {/* <div className="grid grid-cols-12 2xl:gap-x-6 lg:gap-x-5 gap-4">
        {loader
          ? [...Array(5)].map((_, index) => (
              <div
                className="xl:col-span-3 lg:col-span-4 sm:col-span-4 col-span-12"
                key={index}
              >
                <div className="bg-[#FFF0E6] py-[25px] px-[24px] rounded-lg flex items-center gap-4 animate-pulse">
                  <div className="bg-white rounded-full 2xl:w-[70px] 2xl:h-[70px] xl:w-[65px] xl:h-[65px] lg:w-[58px] lg:h-[58px] w-[48px] h-[48px] flex items-center justify-center">
                    <div className="bg-gray-300 w-[30px] h-[30px] rounded-full"></div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="bg-gray-300 h-4 w-24 rounded"></div>
                    <div className="bg-gray-300 h-4 w-16 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          : dashboardDetails.map((item, index) => (
              <div
                className="xl:col-span-3 lg:col-span-4 sm:col-span-4 col-span-12"
                key={index}
              >
                <div
                  className="bg-[#FFF0E6] py-[25px] hover:shadow-lg duration-300 cursor-pointer px-[24px] rounded-lg flex items-center 2xl:gap-x-6 lg:gap-x-4 md:gap-4 gap-3"
                  onClick={() => navigate(item.path)}
                >
                  <div className="bg-[#FFFFFF] rounded-full 2xl:w-[70px] 2xl:h-[70px] xl:w-[65px] xl:h-[65px] lg:w-[58px] lg:h-[58px] md:w-[50px] md:h-[50px] w-[48px] h-[48px] flex items-center justify-center">
                    <img
                      src={item?.image}
                      alt="..."
                      className="2xl:w-[40px] xl:w-[35px] lg:w-[30px] w-7"
                    />
                  </div>
                  <div>
                    <p className="text-[#4B5563] text-lg font-semibold">
                      {item?.name}
                    </p>
                    <p className="text-[#4B5563] text-lg font-medium">
                      {item?.count}
                    </p>
                  </div>
                </div>
              </div>
            ))}
      </div> */}

      <div className="w-full flex flex-wrap gap-4 mb-5 items-center justify-center md:items-start md:justify-start">
        {dashboardDetails &&
          dashboardDetails.map((item, index) => (
            <Card
              key={index}
              title={item.title}
              count={item.count}
              summary={item.summary}
              icon={item.icon}
            />
          ))}
      </div>

      <div className="grid grid-cols-12 gap-5 w-full mt-5">
        <div className="2xl:col-span-4 col-span-12 bg-[#FFFFFF] p-5 w-full">
          <div className="flex md:flex-row flex-col md:items-center items-start justify-between mb-5">
            <h3 className="text-[#243465] font-medium md:text-lg text-base">
              Attendance
            </h3>
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-[#9810FA]"></div>
                  <span className="text-[#1F1F1F] font-normal md:text-sm text-xs">
                    Present
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-[#FFB30B]"></div>
                  <span className="text-[#1F1F1F] font-normal md:text-sm text-xs">
                    Absent
                  </span>
                </div>
                <Listbox
                  value={selectedAttendance}
                  onChange={setSelectedAttendance}
                >
                  <div className="relative">
                    <Listbox.Button className="relative border border-[#FFB30B] w-[115px] rounded-lg bg-[#FFF7E7] py-1 pl-3 pr-10 text-left cursor-pointer focus:outline-none">
                      <span className="block text-[#1F1F1F] text-[12px] font-normal truncate">
                        {selectedAttendance.name || "Select Class"}
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
                      <Listbox.Options className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {weeks.map((item, index) => (
                          <Listbox.Option
                            key={index}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-1 px-5 border-b border-[#E9E9E9] last:border-none ${active ? "bg-gray-100" : ""}`
                            }
                            value={item}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block text-[#1F1F1F] font-normal text-[12px] truncate ${selected ? "font-medium" : "font-normal"}`}
                                >
                                  {item.name}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
            </div>
          </div>
          <ReportBarChart1 height={250} />
        </div>

        <div className="2xl:col-span-3 xl:col-span-6 col-span-12 bg-[#FFFFFF] p-5 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-[#243465] font-medium md:text-lg text-base">
              Overview
            </h3>
            <div className="relative">
              <Listbox value={selected} onChange={setSelected}>
                <div className="relative">
                  <Listbox.Button className="relative border border-[#FFB30B] w-[115px] rounded-lg bg-[#FFF7E7] py-1 pl-3 pr-10 text-left cursor-pointer focus:outline-none">
                    <span className="block text-[#1F1F1F] text-[12px] font-normal truncate">
                      {selected.name || "Select Class"}
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
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {weeks.map((item, index) => (
                        <Listbox.Option
                          key={index}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-1 px-5 border-b border-[#E9E9E9] last:border-none ${active ? "bg-gray-100" : ""}`
                          }
                          value={item}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block text-[#1F1F1F] font-normal text-[12px] truncate ${selected ? "font-medium" : "font-normal"}`}
                              >
                                {item.name}
                              </span>
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <div
              className="p-5 bg-[#F8FAFB] rounded-lg flex items-center justify-between cursor-pointer"
              onClick={() => navigate("/school_admin/payment")}
            >
              <h4 className="text-[#3B4045] font-medium md:text-base text-sm">
                Invoice
              </h4>
              {loaders ? (
                <div className="h-6 w-10 bg-gray-300 rounded animate-pulse"></div>
              ) : (
                <span className="text-[#3B4045] font-medium md:text-xl text-base">
                  {birthdayCount?.invoice_count || 0}
                </span>
              )}
            </div>

            <div
              className="p-5 bg-[#F8FAFB] rounded-lg flex items-center justify-between cursor-pointer"
              onClick={() => navigate("/school_admin/upcoming_birthday")}
            >
              <h4 className="text-[#3B4045] font-medium md:text-base text-sm">
                Upcoming Birthday
              </h4>
              {loaders ? (
                <div className="h-6 w-10 bg-gray-300 rounded animate-pulse"></div>
              ) : (
                <span className="text-[#3B4045] font-medium md:text-xl text-base">
                  {birthdayCount?.birthday_count || 0}
                </span>
              )}
            </div>

            <div
              className="p-5 bg-[#F8FAFB] rounded-lg flex items-center justify-between cursor-pointer"
              onClick={() => navigate("/school_admin/emergency")}
            >
              <h4 className="text-[#3B4045] font-medium md:text-base text-sm">
                Emergency
              </h4>
              {loaders ? (
                <div className="h-6 w-10 bg-gray-300 rounded animate-pulse"></div>
              ) : (
                <span className="text-[#3B4045] font-medium md:text-xl text-base">
                  {birthdayCount?.sos_count || 0}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="2xl:col-span-5 xl:col-span-6 col-span-12 bg-[#FFFFFF] p-5 w-full">
          <h3 className="text-[#243465] font-medium md:text-lg w-full mb-3 text-base">
            Events Calendar
          </h3>
          <div className="flex md:flex-row flex-col items-start gap-2">
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
              className="border-none p-2 dashboard_calender z-0 relative"
              mapDays={({ date }) => {
                const formattedDate = `${date.year}/${date.month.number}/${date.day}`;

                const today = new Date();
                const isToday =
                  date.year === today.getFullYear() &&
                  date.month.number === today.getMonth() + 1 &&
                  date.day === today.getDate();

                const event = eventData.find((ev) => {
                  const [day, month, year] = ev.date
                    .replace(",", "")
                    .split(" ");
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
                    width: "30px",
                    color: event ? "#fff" : "inherit",
                    borderRadius: "50%",
                    pointerEvents: "none"
                  }
                };
              }}
            />

            <div className="w-full h-[260px] scroll overflow-y-auto px-3">
              {loading ? (
                [...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-[#F9F9F9] p-3 rounded-lg mb-2 animate-pulse"
                  >
                    <div className="flex justify-start items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                      <div className="h-4 bg-gray-300 rounded w-40"></div>
                    </div>
                    <div className="mt-3">
                      <div className="h-4 bg-gray-300 rounded w-48"></div>
                    </div>
                  </div>
                ))
              ) : eventData.length > 0 ? (
                eventData.map((event, index) => (
                  <div key={index} className="bg-[#F9F9F9] p-3 rounded-lg mb-2">
                    <div className="flex justify-start items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: event.color || "#FFB30B" }}
                      ></div>
                      <span className="text-[#1F1F1F] text-sm font-normal">
                        {new Date(event.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-[#1F1F1F] text-sm font-normal">
                        {event.title}
                      </h4>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center h-[260px] items-center">
                  <div className="m-auto flex flex-col items-center space-y-4">
                    <img
                      src={noEvents}
                      alt="No Events"
                      className="w-[50px] h-[50px] object-cover"
                    />
                    <div className="text-center flex items-center text-[#1F1F1F] text-xs font-normal">
                      No events found for this month.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg col-span-12 my-5">
        <h2 className="text-[#1F1F1F] font-medium text-lg mb-4">
          Outstanding Payments
        </h2>
        <div className="overflow-x-auto">
          {loading ? (
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8FAFB]">
                <tr>
                  {[
                    "Student Id",
                    "Student Name",
                    "Parents name",
                    "Amount",
                    "Student Fees",
                    "Invoice"
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
          ) : (
            <>
              {studentPaymentData.length > 0 ? (
                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm ">
                      <thead className="bg-[#F8FAFB]">
                        <tr>
                          {[
                            { name: "Student Id", class: "text-start" },
                            { name: "Student Name", class: "text-start" },
                            { name: "Parents name", class: "text-start" },
                            { name: "Amount", class: "text-center" },
                            { name: "Student Fees", class: "text-center" },
                            { name: "Invoice", class: "text-center" }
                          ].map((col) => (
                            <th
                              key={col.name}
                              className={`p-4 ${col.class ? col.class : "text-center"} text-[#3B4045] select-none font-medium cursor-pointer text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group`}
                            >
                              {col.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(studentPaymentData) &&
                          studentPaymentData?.map((item, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 text-center"
                            >
                              <td className="border-b border-[#E5E7EB] text-start text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                                {item.id}
                              </td>
                              <td className="border-b border-[#E5E7EB] text-start text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                                {item.full_name}
                              </td>
                              <td className="border-b border-[#E5E7EB] text-start text-[#4B5563] px-4 py-4 text-sm font-normal whitespace-nowrap">
                                {item.parent_name}
                              </td>
                              <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                                ${item.shift_fee}
                              </td>
                              <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                                <span
                                  className={` font-normal text-sm rounded-full px-5 py-1 ${item?.is_pay == 0 ? "bg-[#FFDED8] text-[#FF7373]" : "bg-[#E8F6EC] text-[#1BA345]"}`}
                                >
                                  {item.is_pay == 0 ? "Unpaid" : "Paid"}
                                </span>
                              </td>
                              <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 text-sm font-normal whitespace-nowrap cursor-pointer">
                                <button
                                  onClick={() => handleParentsInfo(item)}
                                  className={` font-normal text-sm rounded-full h-10 px-5 bg-[#F3F4F6] text-[#4B5563]`}
                                >
                                  Reminder to Parents
                                </button>
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
        </div>
      </div>

      <Dialog
        open={openParentsIfo}
        onClose={() => setOpenParentsIfo(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="h-full overflow-auto md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3 sm:pr-0 pr-6">
                <h1 className="text-lg font-semibold text-[#1F1F1F]">
                  Reminder to Parents Information
                </h1>
                <button className="absolute top-0 right-0 ">
                  <IoMdClose
                    className="text-2xl text-[#6B7280]"
                    onClick={() => setOpenParentsIfo(false)}
                  />
                </button>
              </div>
              <Formik
                initialValues={{
                  reminderTitle: "",
                  description: ""
                }}
                validationSchema={reminderValidationSchema}
                onSubmit={handleReminderSubmit}
              >
                {({
                  isSubmitting,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  values
                }) => (
                  <Form className="mt-7">
                    <div className="px-2 text-sm">
                      <div>
                        <div className="mb-4 text-start">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Student Name
                          </label>
                          <input
                            type="text"
                            value={parentsInfo?.full_name || ""}
                            disabled
                            className="w-full border border-[#E5E7EB]  px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none bg-gray-50"
                          />
                        </div>
                        <div className="mb-4 text-start">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Reminder Title{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field
                            name="reminderTitle"
                            type="text"
                            placeholder="Enter reminder title"
                            className={`w-full border px-4 py-3 rounded-lg focus:ring-1 focus:outline-none ${
                              errors.reminderTitle && touched.reminderTitle
                                ? "border-red-500 focus:ring-red-400"
                                : "border-[#E5E7EB] focus:ring-gray-400"
                            }`}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.reminderTitle}
                          />
                          <ErrorMessage
                            name="reminderTitle"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                        <div className="mb-4 text-start">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <Field
                            name="description"
                            as="textarea"
                            rows={4}
                            placeholder="Enter description"
                            className={`w-full border px-4 py-3 rounded-lg focus:ring-1 focus:outline-none resize-none ${
                              errors.description && touched.description
                                ? "border-red-500 focus:ring-red-400"
                                : "border-[#E5E7EB] focus:ring-gray-400"
                            }`}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.description}
                          />
                          <ErrorMessage
                            name="description"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between w-full mb-3">
                      <button
                        type="button"
                        className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                        onClick={() => setOpenParentsIfo(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#9810FA] text-white font-medium text-sm w-full h-12 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? <DotLoader color="#fff" /> : "Submit"}
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

export default Dashboard;
