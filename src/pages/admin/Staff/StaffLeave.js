import { Fragment, useEffect, useState } from "react";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import documentIcon from "../../../assets/icons/document-text.png";
import Skeleton from "react-loading-skeleton";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import {
  getListStaffLeave,
  updateStaffLeaveApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { DotLoader } from "../../../base-component/Loader/Loader";
import { Listbox, Transition } from "@headlessui/react";
import "react-calendar/dist/Calendar.css";
import calenderIcon from "../../../assets/icons/dateCalendar.png";

const LeaveStatus = [
  { value: "null", name: "All" },
  { value: "pending", name: "Pending" },
  { value: "accepted", name: "Accepted" },
  { value: "rejected", name: "Rejected" }
];

export default function StaffLeave() {
  const navigate = useNavigate();
  const [leaveInfoModal, setLeaveInfoModal] = useState(false);
  const [staffDetails, setStaffDetails] = useState({});
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [staffLeaveData, setStaffLeaveData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(LeaveStatus[0]);
  const [selectedStaffIndex, setSelectedStaffIndex] = useState(null);

  const getStaffLeaveList = () => {
    setLoading(true);

    let obj = {
      page: pageNo
    };

    if (selectedStatus?.value !== "null") {
      obj.type = selectedStatus?.value;
    }

    getListStaffLeave(obj)
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setStaffLeaveData(datas);
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
    getStaffLeaveList();
  }, [pageNo, selectedStatus]);

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

  const handleLeaveInfoModal = (status) => {
    if (status === "accept") setAcceptLoading(true);
    if (status === "reject") setRejectLoading(true);

    const params = {
      leave_id: staffDetails.id,
      leave_request_status: status === "accept" ? "accepted" : "rejected"
    };

    updateStaffLeaveApi(params)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          toast.success(message);

          setStaffLeaveData((prevData) => {
            const updated = [...prevData];
            updated[selectedStaffIndex] = {
              ...updated[selectedStaffIndex],
              leave_request_status: params.leave_request_status
            };
            return updated;
          });

          setSelectedStaffIndex(null);
          setLeaveInfoModal(false);
          setAcceptLoading(false);
          setRejectLoading(false);
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
        setAcceptLoading(false);
        setRejectLoading(false);
      });
  };

  return (
    <div>
      {loading ? (
        <div className="mt-5">
          <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8FAFB]">
                <tr>
                  {[
                    "Staff Id",
                    "Staff Name",
                    "staffLeaves",
                    "Date",
                    "Status",
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
                        <Skeleton width={160} height={20} />
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
          {staffLeaveData?.length > 0 ? (
            <div>
              <div className="flex items-center justify-end gap-4 mb-5 sm:-mt-14 mt-0">
                <Listbox value={selectedStatus} onChange={setSelectedStatus}>
                  <div className="relative text-sm">
                    <Listbox.Button className="relative w-[150px] border border-[#D1D5DB] rounded-lg bg-white py-2 pl-3 pr-10 text-left cursor-pointer focus:outline-none">
                      <span
                        className={`block truncate ${selectedStatus.value === "" && "text-[#9CA3AF]"}`}
                      >
                        {selectedStatus.name || "Select Payment Status"}
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
                        {LeaveStatus.map((item, index) => (
                          <Listbox.Option
                            key={index}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 px-5 border-b border-[#E9E9E9] last:border-none ${active ? "bg-gray-100" : ""}`
                            }
                            value={item}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block text-[#1F1F1F] font-normal md:text-sm text-xs truncate ${item.value === "" && "text-[#9CA3AF]"} ${selected ? "font-medium" : "font-normal"}`}
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

                <button
                  className="flex items-center justify-center space-x-2 h-10 px-5 border border-[#D1D5DB] rounded-lg"
                  onClick={() => navigate(`/school_admin/staff/leave-calendar`)}
                >
                  <img className="w-5 h-5" src={calenderIcon} alt="" />
                  <span className="text-[#1F1F1F] text-sm font-normal">
                    Calendar
                  </span>
                </button>
              </div>

              <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F8FAFB]">
                    <tr>
                      {[
                        "Staff Id",
                        "Staff Name",
                        "staffLeaves",
                        "Date",
                        "Status"
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
                    {staffLeaveData?.map((Item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-3 text-sm font-normal whitespace-nowrap">
                          {Item.teacher_id}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-3 text-sm font-normal whitespace-nowrap">
                          {Item.teacher_name}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-3 text-sm font-normal whitespace-nowrap">
                          {Item.leave_type}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-3 text-sm font-normal whitespace-nowrap">
                          {Item.date}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-3 text-sm font-normal whitespace-nowrap">
                          <div
                            className={`${Item.leave_request_status === "accepted" && "bg-[#E8F6EC] text-[#1BA345]"} ${Item.leave_request_status === "pending" && "bg-[#FFF7E7] text-[#BF8608]"} ${Item.leave_request_status === "rejected" && "bg-[#FFDED8] text-[#FF7373]"} ${Item.leave_request_status === "cancelled" && "bg-gray-200 border"} w-28 text-center font-normal text-sm rounded-xl py-2`}
                          >
                            {Item?.leave_request_status &&
                              Item.leave_request_status
                                .charAt(0)
                                .toUpperCase() +
                                Item.leave_request_status.slice(1)}
                          </div>
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-4 text-sm font-normal whitespace-nowrap text-end flex justify-center">
                          <button
                            className="mt-1"
                            onClick={() => {
                              setLeaveInfoModal(true);
                              setStaffDetails(Item);
                              setSelectedStaffIndex(index);
                            }}
                          >
                            <img
                              src={documentIcon}
                              className="w-5 h-5"
                              alt=""
                            />
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

      <Dialog
        open={leaveInfoModal}
        onClose={() => setLeaveInfoModal(false)}
        size="xl"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="py-4">
              <div className="w-full relative sm:text-center text-start my-3 md:px-8 px-4">
                <h1 className="md:text-lg text-base font-semibold text-[#274372]">
                  Leave Information
                </h1>
                <button
                  className="absolute top-0 right-5"
                  onClick={() => setLeaveInfoModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <div className="md:px-10 px-4 w-full overflow-y-auto">
                <div className="flex items-center justify-center mb-5 mt-5 w-full">
                  <img
                    src={staffDetails.profile_pic}
                    className="w-24 h-24 object-cover rounded-full"
                    alt=""
                  />
                </div>

                <div className="w-full flex md:flex-row flex-col items-center justify-between gap-3 mt-5">
                  <div className="text-start mb-5 w-full">
                    <label className="block text-[#4B5563] font-normal text-sm mb-2">
                      Staff Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={staffDetails.teacher_name || ""}
                      className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg bg-gray-100 text-[#1F1F1F] cursor-not-allowed"
                    />
                  </div>

                  <div className="text-start mb-5 w-full">
                    <label className="block text-[#4B5563] font-normal text-sm mb-2">
                      Date
                    </label>
                    <input
                      type="text"
                      disabled
                      value={staffDetails.date || ""}
                      className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg bg-gray-100 text-[#1F1F1F] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="text-start mb-5 w-full">
                  <label className="block text-[#4B5563] font-normal text-sm mb-2">
                    Leave Type
                  </label>
                  <input
                    type="text"
                    disabled
                    value={staffDetails.leave_type || ""}
                    className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg bg-gray-100 text-[#1F1F1F] cursor-not-allowed"
                  />
                </div>

                <div className="text-start w-full">
                  <label className="block text-[#4B5563] font-normal text-sm mb-2">
                    Reason
                  </label>
                  <textarea
                    disabled
                    value={staffDetails.reason || ""}
                    className="w-full h-[100px] text-sm border border-[#E5E7EB] px-4 py-3 rounded-lg bg-gray-100 text-[#1F1F1F] cursor-not-allowed resize-none"
                  />
                </div>
              </div>

              {staffDetails?.leave_request_status === "pending" ? (
                <div className="mt-5 md:px-8 px-4 gap-5 flex justify-between md:w-[500px] mx-auto w-full mb-3">
                  <button
                    onClick={() => handleLeaveInfoModal("accept")}
                    className="bg-[#9810FA] text-white px-4 text-sm h-12 rounded-lg w-full"
                  >
                    {acceptLoading ? <DotLoader color="#fff" /> : " Accept"}
                  </button>
                  <button
                    onClick={() => handleLeaveInfoModal("reject")}
                    className="bg-[#FFDED8] text-[#FF7373] text-sm px-4 h-12 rounded-lg w-full"
                  >
                    {rejectLoading ? <DotLoader color="#9810FA" /> : " Reject"}
                  </button>
                </div>
              ) : (
                <div
                  className={`w-28 text-center font-normal text-sm my-4 rounded-xl py-3 m-auto ${staffDetails?.leave_request_status === "accepted" && "bg-[#E8F6EC] text-[#1BA345]"} ${staffDetails?.leave_request_status === "cancelled" && "bg-gray-200 border"} ${staffDetails?.leave_request_status === "rejected" && "bg-[#FFDED8] text-[#FF7373]"}`}
                >
                  {staffDetails?.leave_request_status &&
                    staffDetails.leave_request_status.charAt(0).toUpperCase() +
                      staffDetails.leave_request_status.slice(1)}
                </div>
              )}
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
