import { useEffect, useRef, useState } from "react";
import Pagination from "../../../base-component/Pagination/Pagination";
import { sleepLogoData } from "../../../data/Data";
import { GrNext, GrPrevious } from "react-icons/gr";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import EditIcon from "../../../assets/icons/edit.png";
import { IoMdClose } from "react-icons/io";
import Dialog from "../../../base-component/Dialog/Dialog";
import timepickerIcon from "../../../assets/icons/clock.png";
import {
  addSleepApi,
  editSleepApi,
  getSleepListApi
} from "../../../services/api_services";
import { useDebounce } from "use-debounce";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";
import moment from "moment";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { DotLoader } from "../../../base-component/Loader/Loader";
import { useNavigate } from "react-router-dom";

const SleepLogs = () => {
  const navigate = useNavigate();
  const [opensleepLogo, setOpensleepLogo] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [sleepLogsData, setSleepLogsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [btnLoader, setBtnLoader] = useState(false);
  const [idEdit, setIsEdit] = useState(0);

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
              : "text-gray-600 border border-[#F0F1F2] px-3 rounded-full py-1.5 mr-2"
          }
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const getSleepLogsList = () => {
    setLoading(true);

    let obj = {
      page: pageNo,
      search: debouncedSearch
    };

    getSleepListApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        console.log("message", message);
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setSleepLogsData(datas);
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
    getSleepLogsList();
  }, [pageNo, debouncedSearch]);

  const validationSchema = Yup.object({
    start_time: Yup.string().required("Start time is required"),
    end_time: Yup.string()
      .required("End time is required")
      .test("is-after", "End time must be after start time", function (value) {
        const { start_time } = this.parent;
        return moment(value, "HH:mm").isAfter(moment(start_time, "HH:mm"));
      })
  });

  const initialValues = {
    start_time: selectedStudent?.SleepLoag?.start_time.slice(0, 5) || "",
    end_time: selectedStudent?.SleepLoag?.end_time.slice(0, 5) || ""
  };

  const handleSubmit = (values, { resetForm }) => {
    let obj = {
      id: selectedStudent?.SleepLoag?.id,
      start_time: values.start_time,
      end_time: values.end_time
    };

    let object = {
      student_id: selectedStudent?.id,
      start_time: values.start_time,
      end_time: values.end_time
    };

    if (idEdit === 1) {
      setBtnLoader(true);

      editSleepApi(obj)
        .then((res) => {
          const message = res.data.message;
          if (res.data.status === 1) {
            const datas = res?.data?.data;
            setOpensleepLogo(false);
            getSleepLogsList();
            setSelectedStudent(null);
            toast.success(message);
          }
          resetForm();
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
    } else {
      setBtnLoader(true);
      addSleepApi(object)
        .then((res) => {
          const message = res.data.message;
          if (res.data.status === 1) {
            const datas = res?.data?.data;
            setOpensleepLogo(false);
            getSleepLogsList();
            setSelectedStudent(null);
            toast.success(message);
          }
          resetForm();
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
    }
  };

  return (
    <>
      <div className="xl:flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sleep Logs Activity Feed</h2>
        <div className="md:flex items-centert gap-5 xl:mt-0 mt-4">
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
              placeholder="Search for student name"
              className="input text-sm flex-1 outline-none border-none bg-transparent text-gray-800 px-2"
            />
          </div>
        </div>
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
                    "Parent name",
                    "Email",
                    "Daily Sleep Summary"
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
          {sleepLogsData?.length > 0 ? (
            <div className="bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg mt-5">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm ">
                  <thead className="bg-[#F8FAFB]">
                    <tr className="">
                      {[
                        "Student Id",
                        "Student Name",
                        "Parent name",
                        "Daily Sleep Summary"
                      ].map((col) => (
                        <th
                          key={col}
                          className="p-4 text-left text-[#3B4045] select-none font-medium cursor-pointer text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group"
                        >
                          {col.replace(/([A-Z])/g, " $1").trim()}
                        </th>
                      ))}
                      <th className="p-4 text-left text-[#3B4045] flex justify-center font-medium text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sleepLogsData?.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 border-b border-[#E5E7EB]"
                      >
                        <td className=" text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                          {item.id}
                        </td>
                        <td className=" text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                          {" "}
                          <div className="md:w-52 w-48 truncate">
                            {item.full_name}
                          </div>
                        </td>
                        <td className=" text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                          {" "}
                          <div className="md:w-52 w-48 truncate">
                            {item.parent_name}
                          </div>
                        </td>
                        <td className="text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                          {item?.SleepLoag ? (
                            `${moment(item.SleepLoag.start_time, "HH:mm:ss").format("hh:mm A")} to ${moment(item.SleepLoag.end_time, "HH:mm:ss").format("hh:mm A")}`
                          ) : (
                            <button
                              onClick={() => {
                                setIsEdit(0);
                                setSelectedStudent(item);
                                setOpensleepLogo(true);
                              }}
                              className="bg-[#F3F4F6] text-[#4B5563] px-4 py-1 rounded-full cursor-pointer"
                            >
                              Add Info
                            </button>
                          )}
                        </td>

                        <td className="text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap text-end flex justify-center">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger
                              asChild
                              className="outline-none"
                            >
                              <button
                                disabled={!item?.SleepLoag}
                                className={`p-2 rounded ${
                                  !item?.SleepLoag
                                    ? "opacity-50 cursor-not-allowed pointer-events-none"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <PiDotsThreeOutlineVerticalFill className="text-[#1F1F1F] text-xl" />
                              </button>
                            </DropdownMenu.Trigger>

                            {item?.SleepLoag && (
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content
                                  className="bg-white absolute -right-5 w-[240px] shadow-lg rounded p-2 text-start animate-dropdown"
                                  sideOffset={5}
                                >
                                  <DropdownMenu.Item
                                    className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-2 hover:bg-gray-100"
                                    onClick={() => {
                                      setSelectedStudent(item);
                                      setIsEdit(1);
                                      setOpensleepLogo(true);
                                    }}
                                  >
                                    <img
                                      src={EditIcon}
                                      className="w-[24px] h-[24px]"
                                      alt=""
                                    />
                                    <span className="text-[#1F1F1F] font-normal text-sm">
                                      Edit
                                    </span>
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            )}
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
        open={opensleepLogo}
        onClose={() => setOpensleepLogo(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-xl text-lg font-semibold text-[#1F1F1F]">
                  Sleep Information
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setOpensleepLogo(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                <Form className="mt-7">
                  <div className="px-2">
                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        Student Name
                      </label>
                      <input
                        type="text"
                        value={selectedStudent?.full_name || ""}
                        disabled
                        className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg disabled:text-[#6B7280]"
                      />
                    </div>

                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        Student Id
                      </label>
                      <input
                        type="text"
                        value={selectedStudent?.id || ""}
                        disabled
                        className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg disabled:text-[#6B7280]"
                      />
                    </div>

                    <div className="flex gap-6">
                      <div className="w-full">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Time to Sleeping
                        </label>
                        <Field
                          name="start_time"
                          type="time"
                          className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none bg-white text-black"
                        />
                        <ErrorMessage
                          name="start_time"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <div className="w-full">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Time to Wake up
                        </label>
                        <Field
                          name="end_time"
                          type="time"
                          className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none bg-white text-black"
                        />
                        <ErrorMessage
                          name="end_time"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-between sm:w-[400px] w-full mx-auto mb-3">
                    <button
                      type="button"
                      onClick={() => setOpensleepLogo(false)}
                      className="bg-[#DFE3EA] w-full py-3 font-medium h-12 text-sm text-[#6B7280] rounded-lg mr-5"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={btnLoader}
                      type="submit"
                      className="bg-[#9810FA] text-white font-medium text-sm w-full h-12 rounded-lg"
                    >
                      {btnLoader ? <DotLoader color="#fff" /> : "Save"}
                    </button>
                  </div>
                </Form>
              </Formik>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </>
  );
};

export default SleepLogs;
