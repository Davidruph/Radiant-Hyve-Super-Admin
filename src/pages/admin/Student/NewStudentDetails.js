import BackIcon from "../../../assets/icons/BackIcon.png";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  editStudentApi,
  getNewStudentDetailsApi,
  getTeacherListApi,
  studentAssignTeacherApi
} from "../../../services/api_services";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import PlaceholderImg from "../../../assets/images/placeholderImg.png";
import rejectModalIcon from "../../../assets/icons/rejected.png";
import pendingModalIcon from "../../../assets/icons/penging.png";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import { Listbox, Transition } from "@headlessui/react";
import { DotLoader } from "../../../base-component/Loader/Loader";

export default function NewStudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [newStudentData, setNewStudentData] = useState({});
  const isNewStudent = location.pathname.includes("new_student_details");
  const isWaitingStudent = location.pathname.includes(
    "waiting_student_details"
  );
  const [btnLoader, seBtnLoader] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [assignStaffModal, setAssignStaffModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [waitingModal, setWaitingModal] = useState(false);

  const getNewStudentDetails = () => {
    setLoading(true);

    let obj = {
      student_id: id
    };

    getNewStudentDetailsApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        console.log("message", message);
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setNewStudentData(datas);
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
          if (errs.status === 2) {
            navigate("/school_admin/student");
          }
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    getNewStudentDetails();
  }, [id]);

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
      student_id: id,
      teacher_id: selectedTeacher?.id
    };

    studentAssignTeacherApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          navigate("/school_admin/student");
          setAssignStaffModal(false);
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
    seBtnLoader(true);

    let obj = {
      status: "rejected",
      student_id: id
    };

    editStudentApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          getNewStudentDetails();
          setRejectModal(false);
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
      student_id: id
    };

    editStudentApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setWaitingModal(false);
          getNewStudentDetails();
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

      <div className="grid grid-cols-12 gap-5">
        <div className="lg:col-span-4 col-span-12 bg-white max-h-[300px] rounded-lg p-5">
          <div className="flex flex-col items-center justify-center h-full">
            {loading ? (
              <>
                <Skeleton circle height={138} width={138} />
                <Skeleton height={20} width={120} className="mt-4" />
                <Skeleton height={20} width={160} className="mt-3" />
              </>
            ) : (
              <>
                <img
                  src={newStudentData?.profile_pic || PlaceholderImg}
                  className="object-cover w-[138px] rounded-full h-[138px]"
                  alt=""
                />
                <h3 className="text-[#0F1113] font-medium md:text-base text-sm mt-4">
                  {newStudentData?.full_name}
                </h3>
                <h3 className="text-[#4B5563] font-normal md:text-sm text-xs mt-3">
                  Parents Id: :{" "}
                  <span className="text-[#1F1F1F] font-normal md:text-sm text-xs">
                    {newStudentData?.parent_id}
                  </span>
                </h3>
              </>
            )}
          </div>
        </div>
        <div className="lg:col-span-8 col-span-12 bg-white rounded-lg p-5">
          <div className="flex xl:flex-row lg:flex-col md:flex-row flex-col gap-5 items-start justify-between">
            <h2 className="text-[#1F1F1F] font-semibold md:text-xl text-lg">
              Student Information
            </h2>
          </div>

          <div className="mt-7 space-y-5">
            {[
              { label: "Full Name", value: newStudentData?.full_name },
              { label: "Parents Name", value: newStudentData?.parent_name },
              {
                label: "Home Phone Number",
                value: `${newStudentData?.country_code} ${newStudentData?.mobile_no}`
              },
              { label: "Date of Birth", value: newStudentData?.dob },
              { label: "Gender", value: newStudentData?.gender },
              {
                label: "Relation",
                value: newStudentData?.relation_to_child || "-"
              },
              {
                label: "Frequency Attendance",
                value: newStudentData?.madical_insuarance_no || "-"
              },
              {
                label: "Medical Insurance Number",
                value: newStudentData?.Shift?.shift_name || "-"
              },
              { label: "Address", value: newStudentData?.address || "-" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <h4 className="text-[#4B5563] text-sm font-normal">
                  {item.label}
                </h4>
                <span className="text-[#1F1F1F] font-normal text-end text-sm">
                  {loading ? <Skeleton height={20} width={150} /> : item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-7 max-w-lg">
            {isNewStudent && (
              <>
                {newStudentData?.request_status === "pending" ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setAssignStaffModal(true);
                        seBtnLoader(false);
                        setSelectedTeacher(null);
                      }}
                      className="w-[112px] py-1 text-center rounded-full font-normal md:text-sm text-xs bg-[#E9ECF1] text-[#293FE3]"
                    >
                      Accept
                    </button>

                    <button
                      onClick={(e) => {
                        setRejectModal(true);
                        seBtnLoader(false);
                      }}
                      className="w-[112px] py-1 text-center rounded-full font-normal md:text-sm text-xs bg-[#FFDED8] text-[#FF7373]"
                    >
                      Reject
                    </button>

                    <button
                      onClick={(e) => {
                        setWaitingModal(true);
                        seBtnLoader(false);
                      }}
                      className="w-[112px] py-1 text-center rounded-full font-normal md:text-sm text-xs bg-[#FFF4DA] text-[#E6A10A]"
                    >
                      Waiting
                    </button>
                  </div>
                ) : (
                  <div
                    className={`
                                               px-4 py-1 rounded-full font-normal md:text-sm text-xs w-fit
                                               ${
                                                 newStudentData?.request_status ===
                                                 "accepted"
                                                   ? "bg-[#D1FADF] text-[#027A48]"
                                                   : newStudentData?.request_status ===
                                                       "rejected"
                                                     ? "bg-[#FFE4E2] text-[#B42318]"
                                                     : newStudentData?.request_status ===
                                                         "waiting"
                                                       ? "bg-[#FFF4DA] text-[#E6A10A]"
                                                       : "bg-gray-200 text-gray-700"
                                               }
                                             `}
                  >
                    {newStudentData?.request_status}
                  </div>
                )}
              </>
            )}
            {isWaitingStudent && (
              <>
                {newStudentData?.request_status === "waiting" ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setAssignStaffModal(true);
                        seBtnLoader(false);
                        setSelectedTeacher(null);
                      }}
                      className="w-[112px] py-1 text-center rounded-full font-normal md:text-sm text-xs bg-[#E9ECF1] text-[#293FE3]"
                    >
                      Accept
                    </button>

                    <button
                      onClick={(e) => {
                        setRejectModal(true);
                        seBtnLoader(false);
                      }}
                      className="w-[112px] py-1 text-center rounded-full font-normal md:text-sm text-xs bg-[#FFDED8] text-[#FF7373]"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div
                    className={`px-4 py-1 rounded-full font-normal md:text-sm text-xs w-fit ${
                      newStudentData?.request_status === "accepted"
                        ? "bg-[#D1FADF] text-[#027A48]"
                        : newStudentData?.request_status === "rejected"
                          ? "bg-[#FFE4E2] text-[#B42318]"
                          : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {newStudentData?.request_status}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

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
                  Parents Information
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
                          src={newStudentData?.profile_pic || PlaceholderImg}
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
                        {newStudentData?.full_name}
                      </div>
                    </div>
                    <div className="w-full">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        Gender
                      </label>
                      <div className="border border-[#E5E7EB] text-[#6B7280] font-normal md:text-sm text-xs rounded-lg w-full py-3 px-4">
                        {newStudentData?.gender}
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex md:flex-row flex-col gap-5 mt-5">
                    <div className="w-full">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        Relation to child
                      </label>
                      <div className="border border-[#E5E7EB] text-[#6B7280] font-normal md:text-sm text-xs rounded-lg w-full py-3 px-4">
                        {newStudentData?.relation_to_child}
                      </div>
                    </div>
                    <div className="w-full">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        Frequency Attendance
                      </label>
                      <div className="border border-[#E5E7EB] text-[#6B7280] font-normal md:text-sm text-xs rounded-lg w-full py-3 px-4">
                        {newStudentData?.attendance || "Frequency Attendance"}
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
                            {selectedTeacher?.full_name || "Select Shift"}
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
                    className="bg-[#293FE3] text-white font-medium text-sm w-full h-12 rounded-lg flex items-center justify-center"
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
                  New Student Account Confirmation
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setRejectModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <div className="mt-7">
                <div className="px-2">
                  <div className="w-full flex items-center justify-center">
                    <img
                      src={rejectModalIcon}
                      className="w-[104px] h-[104px]"
                      alt=""
                    />
                  </div>
                  <div className="w-full mt-5 text-center">
                    <h4 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
                      Are you sure you want to reject this student?
                    </h4>
                    <p className="text-[#4B5563] font-normal md:text-base text-sm">
                      This decision is final and cannot be undone. Please
                      confirm to continue.
                    </p>
                  </div>
                </div>
                <div className="mt-10 flex justify-between w-full mb-3">
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
