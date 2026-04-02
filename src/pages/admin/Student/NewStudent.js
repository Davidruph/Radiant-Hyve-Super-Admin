import { Fragment, useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Pagination from "../../../base-component/Pagination/Pagination";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { GrNext, GrPrevious } from "react-icons/gr";
import documentIcon from "../../../assets/icons/document-text.png";
import { useNavigate } from "react-router-dom";
import PlaceholderImg from "../../../assets/images/placeholderImg.png";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import { Listbox, Textarea, Transition } from "@headlessui/react";
import {
  editStudentApi,
  getTeacherListApi,
  studentAssignTeacherApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { DotLoader } from "../../../base-component/Loader/Loader";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";
import Skeleton from "react-loading-skeleton";
import pendingModalIcon from "../../../assets/icons/penging.png";

export default function NewStudent({
  paginatedData,
  pageNo,
  setPageNo,
  pageCount,
  loading
}) {
  const [assignStaffModal, setAssignStaffModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [waitingModal, setWaitingModal] = useState(false);
  const [dataList, setDataList] = useState(paginatedData || []);
  const [btnLoader, seBtnLoader] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [indexValue, setIndexValue] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setDataList(paginatedData);
  }, [paginatedData]);

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
              : "text-gray-600 border border-[#F0F1F2] px-4 rounded-lg font-medium text-sm py-1.5 mr-2"
          }
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  const getTeacherListing = () => {
    getTeacherListApi()
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          console.log("datas>>", datas);
          setShifts(datas);
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
    getTeacherListing();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    seBtnLoader(true);

    if (!selectedTeacher) {
      seBtnLoader(false);
      toast.error("Please select a staff member");
      return;
    }

    let obj = {
      request_status: "accepted",
      student_id: selectedStudent?.id,
      teacher_id: selectedTeacher?.id
    };

    studentAssignTeacherApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          console.log("datas>>", datas);
          setAssignStaffModal(false);

          setDataList((prevList) => {
            const updatedList = [...prevList];
            updatedList.splice(indexValue, 1);
            return updatedList;
          });
        }
        seBtnLoader(false);
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
        seBtnLoader(false);
      });
  };

  const handleRejected = (e) => {
    e.preventDefault();

    if (!rejectReason.trim()) {
      setRejectReasonError("Reason is required to reject the student.");
      return;
    }

    seBtnLoader(true);

    let obj = {
      status: "rejected",
      student_id: selectedStudent?.id,
      rejected_reason: rejectReason
    };

    editStudentApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          console.log("datas>>", datas);
          setRejectModal(false);

          setDataList((prevList) => {
            const updatedList = [...prevList];
            updatedList.splice(indexValue, 1);
            return updatedList;
          });
        }
        seBtnLoader(false);
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
        seBtnLoader(false);
      });
  };

  const handleWaiting = (e) => {
    e.preventDefault();
    seBtnLoader(true);

    let obj = {
      status: "waiting",
      student_id: selectedStudent?.id
    };

    editStudentApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setWaitingModal(false);

          setDataList((prevList) => {
            const updatedList = [...prevList];
            updatedList.splice(indexValue, 1);
            return updatedList;
          });
        }
        seBtnLoader(false);
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
        seBtnLoader(false);
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
                  {["Student Id", "Student Name", "Parents name"].map((col) => (
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
                    {[...Array(3)].map((__, colIndex) => (
                      <td
                        key={colIndex}
                        className="border-b border-[#E5E7EB] px-4 py-3"
                      >
                        <Skeleton width={250} height={20} />
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
          {dataList.length > 0 ? (
            <div className="col-span-12">
              <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F8FAFB]">
                    <tr>
                      {["Student Id", "Student Name", "Parents name"].map(
                        (col) => (
                          <th
                            key={col}
                            className="p-4 text-left text-[#3B4045] select-none font-medium cursor-pointer text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group"
                          >
                            {col.replace(/([A-Z])/g, " $1").trim()}
                          </th>
                        )
                      )}
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm whitespace-nowrap"></th>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm whitespace-nowrap flex justify-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataList?.map((Item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          {Item.id}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          {Item.full_name}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          {Item.parent_name}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setAssignStaffModal(true);
                                seBtnLoader(false);
                                setSelectedTeacher(null);
                                setSelectedStudent(Item);
                                setIndexValue(index);
                              }}
                              className="w-[112px] py-1 text-center rounded-full font-normal md:text-sm text-xs bg-[#E9ECF1] text-[#9810FA]"
                            >
                              Accept
                            </button>

                            <button
                              onClick={(e) => {
                                setRejectModal(true);
                                setSelectedStudent(Item);
                                seBtnLoader(false);
                                setIndexValue(index);
                              }}
                              className="w-[112px] py-1 text-center rounded-full font-normal md:text-sm text-xs bg-[#FFDED8] text-[#FF7373]"
                            >
                              Reject
                            </button>

                            <button
                              onClick={(e) => {
                                setWaitingModal(true);
                                setSelectedStudent(Item);
                                seBtnLoader(false);
                                setIndexValue(index);
                              }}
                              className="w-[112px] py-1 text-center rounded-full font-normal md:text-sm text-xs bg-[#FFF4DA] text-[#E6A10A]"
                            >
                              Waiting
                            </button>
                          </div>
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
                                  className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-2 hover:bg-gray-100"
                                  onClick={() =>
                                    navigate(
                                      `/school_admin/student/new_student_details/${Item.id}`
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
        open={assignStaffModal}
        onClose={() => setAssignStaffModal(false)}
        size="xl"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="py-4">
              <div className="w-full relative sm:text-center text-start my-3 md:px-8 px-4">
                <h1 className="md:text-xl text-lg font-semibold text-[#274372]">
                  Student Information
                </h1>
                <button
                  className="absolute top-0 right-5"
                  onClick={() => setAssignStaffModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="mt-7 w-full">
                <div className="md:px-10 px-4 w-full h-[450px] modalheight overflow-y-auto">
                  <div className="flex flex-col items-center gap-3">
                    <label htmlFor="fileInput" className="cursor-pointer">
                      <div className="w-24 h-24 rounded-full border flex items-center justify-center overflow-hidden">
                        <img
                          src={selectedStudent?.profile_pic || PlaceholderImg}
                          className="w-[100px] h-[100px] object-cover"
                          alt=""
                        />
                      </div>
                    </label>
                  </div>
                  <div className="w-full flex md:flex-row flex-col gap-5 mt-7">
                    <div className="w-full">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        Full Name
                      </label>
                      <div className="border border-[#E5E7EB] text-[#6B7280] font-normal md:text-sm text-xs rounded-lg w-full py-3 px-4">
                        {selectedStudent?.full_name}
                      </div>
                    </div>
                    <div className="w-full">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        Gender
                      </label>
                      <div className="border border-[#E5E7EB] text-[#6B7280] font-normal md:text-sm text-xs rounded-lg w-full py-3 px-4">
                        {selectedStudent?.gender}
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex md:flex-row flex-col gap-5 mt-5">
                    <div className="w-full">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        Relation to child
                      </label>
                      <div className="border border-[#E5E7EB] text-[#6B7280] font-normal md:text-sm text-xs rounded-lg w-full py-3 px-4">
                        {selectedStudent?.relation_to_child}
                      </div>
                    </div>
                    <div className="w-full">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        Frequency Attendance
                      </label>
                      <div className="border border-[#E5E7EB] text-[#6B7280] font-normal md:text-sm text-xs rounded-lg w-full py-3 px-4">
                        {selectedStudent?.attendance || "Frequency Attendance"}
                      </div>
                    </div>
                  </div>

                  <div className="my-5">
                    <h3 className="text-[#1F1F1F] font-medium md:text-lg text-base">
                      Staff Assigned Details
                    </h3>
                  </div>
                  <Listbox
                    value={selectedTeacher}
                    onChange={setSelectedTeacher}
                  >
                    <div className="relative">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        Assigned Staff
                      </label>
                      <Listbox.Button className="relative w-[50%] border border-[#E5E7EB] rounded-lg bg-white py-2 px-4 text-left cursor-pointer focus:outline-none">
                        <div className="flex gap-2 items-center">
                          {selectedTeacher && (
                            <img
                              src={selectedTeacher?.profile_pic}
                              className="w-8 h-8 rounded-full object-cover"
                              alt=""
                            />
                          )}
                          <span className="block truncate">
                            {selectedTeacher?.full_name || "Select Staff"}
                          </span>
                        </div>
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
                        <Listbox.Options className="absolute z-10  mt-1 w-[50%] bg-white rounded-lg shadow-lg max-h-40 overflow-y-auto scrollBar py-1 text-sm ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {shifts.map((shift, index) => (
                            <Listbox.Option
                              key={index}
                              className={({ active }) =>
                                `relative cursor-pointer select-none text-sm py-3 px-5 border-b border-[#E9E9E9] ${active ? "bg-gray-100" : ""}`
                              }
                              value={shift}
                            >
                              {({ selected }) => (
                                <div className="flex gap-2 items-center">
                                  <img
                                    src={shift?.profile_pic}
                                    className="w-8 h-8 rounded-full object-cover"
                                    alt=""
                                  />
                                  <span
                                    className={`block text-[#1F1F1F] font-normal text-sm truncate ${selected ? "font-medium" : "font-normal"}`}
                                  >
                                    {shift.full_name}
                                  </span>
                                </div>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>

                <div className="mt-10 md:px-8 px-4 flex justify-between md:w-[500px] mx-auto w-full mb-3">
                  <button
                    type="button"
                    onClick={() => setAssignStaffModal(false)}
                    className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={btnLoader}
                    className="bg-[#9810FA] text-white font-medium text-sm w-full h-12 rounded-lg flex items-center justify-center"
                  >
                    {btnLoader ? <DotLoader color="#fff" size={20} /> : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={rejectModal}
        onClose={() => setRejectModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start md:my-3 my-0">
                <h1 className="md:text-lg text-base mr-2 font-semibold text-[#1F1F1F]">
                  Rejected Student Confirmation
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setRejectModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <div className="mt-5">
                <div className="px-2">
                  <div className="w-full text-center">
                    <Textarea
                      rows={4}
                      className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#c4c4c4]"
                      placeholder="Enter reason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      onBlur={() => setRejectReasonError("")}
                    />
                    {rejectReasonError && (
                      <p className="text-red-500 text-start text-xs">
                        {rejectReasonError}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-8 flex justify-between w-full mb-3">
                  <button
                    type="button"
                    onClick={() => setRejectModal(false)}
                    className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={btnLoader}
                    type="submit"
                    className="bg-[#FF7373] text-white font-medium text-sm w-full h-12 rounded-lg"
                    onClick={handleRejected}
                  >
                    {btnLoader ? (
                      <DotLoader color="#fff" />
                    ) : (
                      "Yes, Reject Student"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={waitingModal}
        onClose={() => setWaitingModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start md:my-3 my-0">
                <h1 className="md:text-lg text-base mr-2 font-semibold text-[#1F1F1F]">
                  New Student Account Confirmation
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setWaitingModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <div className="mt-7">
                <div className="px-2">
                  <div className="w-full flex items-center justify-center">
                    <img
                      src={pendingModalIcon}
                      className="w-[104px] h-[104px]"
                      alt=""
                    />
                  </div>
                  <div className="w-full mt-5 text-center">
                    <h4 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
                      This student account is currently pending approval?
                    </h4>
                    <p className="text-[#4B5563] font-normal md:text-base text-sm">
                      ThWould you like to keep them in the waiting list for now?
                      You can approve or reject later from the dashboard.
                    </p>
                  </div>
                </div>
                <div className="mt-10 flex justify-between w-full mb-3">
                  <button
                    type="button"
                    onClick={() => setWaitingModal(false)}
                    className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={btnLoader}
                    type="submit"
                    className="bg-[#FFB30B] text-white font-medium text-sm w-full h-12 rounded-lg"
                    onClick={handleWaiting}
                  >
                    {btnLoader ? (
                      <DotLoader color="#fff" />
                    ) : (
                      "Yes, Waiting Student"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
