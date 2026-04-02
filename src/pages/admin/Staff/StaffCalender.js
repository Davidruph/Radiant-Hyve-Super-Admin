import { useEffect, useState } from "react";
import CustomCalendar from "../../../base-component/CustomCalendar/CustomCalendar";
import BackIcon from "../../../assets/icons/BackIcon.png";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  getCalenderLeaveList,
  updateStaffLeaveApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { DotLoader } from "../../../base-component/Loader/Loader";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import Skeleton from "react-loading-skeleton";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";

export default function StaffCalendar() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLeave, setSelectedLeave] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [staffLeaveData, setStaffLeaveData] = useState([]);
  const [acceptLoading, setAcceptLoading] = useState({});
  const [rejectLoading, setRejectLoading] = useState({});
  const [expandedReasons, setExpandedReasons] = useState({});

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

  const getStaffLeaveList = () => {
    setLoading(true);

    const obj = {
      page: pageNo,
      date: format(selectedDate, "yyyy-MM-dd")
    };

    getCalenderLeaveList(obj)
      .then((res) => {
        if (res?.data?.status === 1) {
          const datas = res?.data?.data;
          setStaffLeaveData(datas);
          setPageCount(res?.data?.totalPage);
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
          toast.error(errs?.message || "Something went wrong.");
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    getStaffLeaveList();
  }, [pageNo, selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const formattedDate = format(date, "yyyy-MM-dd");
    console.log("formattedDate>>", formattedDate);

    const filteredLeave = staffLeaveData.filter(
      (item) => item.date == formattedDate
    );
    console.log("filteredLeave>>", filteredLeave);
    setSelectedLeave(filteredLeave);
  };

  useEffect(() => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const filteredLeave = staffLeaveData.filter(
      (item) => item.date === formattedDate
    );
    setSelectedLeave(filteredLeave);
  }, [staffLeaveData, selectedDate]);

  const handleLeaveInfoModal = (status, id, index) => {
    const params = {
      leave_id: id,
      leave_request_status: status === "accept" ? "accepted" : "rejected"
    };

    updateStaffLeaveApi(params)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          toast.success(message);

          setStaffLeaveData((prevData) => {
            const updated = [...prevData];
            updated[index] = {
              ...updated[index],
              leave_request_status: params.leave_request_status
            };
            return updated;
          });

          setAcceptLoading((prev) => ({ ...prev, [id]: false }));
          setRejectLoading((prev) => ({ ...prev, [id]: false }));
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
          toast.error(errs?.message || "Something went wrong");
        }
        setAcceptLoading((prev) => ({ ...prev, [id]: false }));
        setRejectLoading((prev) => ({ ...prev, [id]: false }));
      });
  };

  return (
    <div>
      <div className="mb-5">
        <button
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <img src={BackIcon} className="w-[38px] h-[38px]" alt="Back" />
          <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
            Back
          </span>
        </button>
      </div>

      <div className="flex lg:flex-row flex-col gap-3 h-[75vh]">
        <div className="w-full lg:max-w-[450px]">
          <CustomCalendar onDateSelect={handleDateChange} />
        </div>

        <div className="w-full">
          <div className="bg-gray-100 p-4 rounded-lg w-full">
            {loading ? (
              <div>
                {[...Array(10)].map((_, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-white shadow-md mb-4"
                  >
                    <h2 className="mb-4">
                      <Skeleton width={120} height={20} />
                    </h2>

                    <div className="mb-3">
                      <Skeleton width={100} />
                      <Skeleton width={180} />
                    </div>

                    <div className="mb-3">
                      <Skeleton width={100} />
                      <Skeleton width={220} />
                    </div>

                    <div className="mb-3">
                      <Skeleton width={100} />
                      <Skeleton count={2} />
                    </div>

                    <div className="flex justify-end gap-4">
                      <Skeleton width={100} height={40} />
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedLeave.length > 0 ? (
              <div>
                {selectedLeave.map((leave, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg bg-white shadow-md mb-4`}
                  >
                    <div className="overflow-y-auto pb-5 scrollBar">
                      <h2 className="text-base text-[#1F1F1F] font-medium">
                        {leave?.teacher_name}
                      </h2>

                      <div className="mt-5">
                        <p className="text-sm text-gray-500 mt-2">
                          Date of Leave
                        </p>
                        <p className="font-normal text-sm text-[#1F1F1F]">
                          {format(selectedDate, "yyyy-MM-dd")}
                        </p>
                      </div>

                      <div className="mt-5">
                        <p className="text-sm text-gray-500 mt-2">Leave Type</p>
                        <p className="font-normal text-sm text-[#1F1F1F]">
                          {leave?.leave_type}
                        </p>
                      </div>

                      <div className="mt-5">
                        <p className="text-sm text-gray-500 mt-2">Reason</p>
                        <p
                          className={`font-normal text-sm text-[#1F1F1F] ${
                            !expandedReasons[leave.id] ? "line-clamp-2" : ""
                          }`}
                        >
                          {leave?.reason}
                        </p>
                        {leave?.reason?.length > 80 && (
                          <button
                            onClick={() =>
                              setExpandedReasons((prev) => ({
                                ...prev,
                                [leave.id]: !prev[leave.id]
                              }))
                            }
                            className="text-blue-600 text-sm mt-1 focus:outline-none"
                          >
                            {expandedReasons[leave.id]
                              ? "Read less"
                              : "Read more"}
                          </button>
                        )}
                      </div>
                    </div>

                    {leave?.leave_request_status === "pending" ? (
                      <div className="flex gap-4 ms-auto max-w-[300px]">
                        <button
                          disabled={
                            acceptLoading[leave.id] || rejectLoading[leave.id]
                          }
                          onClick={() => {
                            setAcceptLoading((prev) => ({
                              ...prev,
                              [leave?.id]: true
                            }));
                            handleLeaveInfoModal("accept", leave?.id, index);
                          }}
                          className="bg-[#9810FA] text-white text-sm px-4 h-12 rounded-lg w-full"
                        >
                          {acceptLoading[leave?.id] ? (
                            <DotLoader color="#fff" />
                          ) : (
                            "Accept"
                          )}
                        </button>
                        <button
                          disabled={
                            acceptLoading[leave.id] || rejectLoading[leave.id]
                          }
                          onClick={() => {
                            setRejectLoading((prev) => ({
                              ...prev,
                              [leave?.id]: true
                            }));
                            handleLeaveInfoModal("reject", leave?.id, index);
                          }}
                          className="bg-[#FFDED8] text-[#FF7373] text-sm px-4 h-12 rounded-lg w-full"
                        >
                          {rejectLoading[leave?.id] ? (
                            <DotLoader color="#9810FA" />
                          ) : (
                            "Reject"
                          )}
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`
                                          w-28 text-center font-normal text-sm rounded-full py-3 ms-auto
                                          ${leave?.leave_request_status === "accepted" && "bg-[#E8F6EC] text-[#1BA345]"}
                                          ${leave?.leave_request_status === "rejected" && "bg-[#FFDED8] text-[#FF7373]"}
                                         `}
                      >
                        {leave?.leave_request_status}
                      </div>
                    )}
                  </div>
                ))}

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
                  <img src={noData} className="w-32 m-auto" alt="" />
                  <h4 className="text-gray-400 md:text-base text-sm">
                    No leave available on this date
                  </h4>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
