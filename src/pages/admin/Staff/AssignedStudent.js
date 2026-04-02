import { Fragment, useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Pagination from "../../../base-component/Pagination/Pagination";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { GrNext, GrPrevious } from "react-icons/gr";
import documentIcon from "../../../assets/icons/document-text.png";
import { useNavigate, useParams } from "react-router-dom";
import BackIcon from "../../../assets/icons/BackIcon.png";
import { IoIosArrowDown } from "react-icons/io";
import { Listbox, Transition } from "@headlessui/react";
import {
  getShiftApi,
  getTeacherStudentApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { useDebounce } from "use-debounce";
import Skeleton from "react-loading-skeleton";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";

export default function AllStudents() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(null);
  const [shiftListArray, setShiftListArray] = useState([]);
  const [newStudent, setNewStudent] = useState([]);
  const [selectedShift, setSelectedShift] = useState({
    shift_name: "All",
    id: 0
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);

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

  const getShiftList = () => {
    getShiftApi()
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          const updatedList = [{ shift_name: "All", id: 0 }, ...datas];
          setShiftListArray(updatedList);
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
    getShiftList();
  }, []);

  const getNewStudentList = () => {
    setLoading(true);

    let obj = {
      shift_id: selectedShift?.id,
      page: pageNo,
      teacher_id: id,
      search: debouncedSearch
    };

    getTeacherStudentApi(obj)
      .then((res) => {
        const gate = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setNewStudent(datas);
          setPageCount(gate);
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
            navigate("/school_admin/staff/staff_details" + id);
          }
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    getNewStudentList();
  }, [pageNo, debouncedSearch, selectedShift]);

  console.log("newStudent>>", newStudent);

  return (
    <div>
      <div className="flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-4 mb-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="">
            <button
              className="flex items-center gap-2"
              onClick={() => navigate(-1)}
            >
              <img src={BackIcon} className="w-[38px] h-[38px]" alt="" />
            </button>
          </div>
          <h2 className="text-[#1F1F1F] font-semibold md:text-xl text-lg whitespace-nowrap">
            Assigned Student
          </h2>
        </div>
        <div className="flex md:flex-row flex-col items-start md:gap-2 gap-3">
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
              placeholder="Search for student name"
              className="input flex-1 outline-none border-none bg-transparent text-gray-800 px-2"
            />
          </div>
          <Listbox value={selectedShift} onChange={setSelectedShift}>
            <div className="relative">
              <Listbox.Button className="relative w-[180px] border border-[#D1D5DB] rounded-lg bg-white py-2 pl-3 pr-10 text-left cursor-pointer focus:outline-none">
                <span className="block truncate text-sm">
                  {selectedShift?.shift_name || "Select Shift"}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <IoIosArrowDown
                    className="text-base text-[#1F1F1F]"
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
                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-auto scroll py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {shiftListArray?.length > 0 ? (
                    shiftListArray.map((shift, index) => (
                      <Listbox.Option
                        key={index}
                        className={({ focus }) =>
                          `relative cursor-pointer select-none py-3 px-5${
                            focus ? " bg-gray-100" : ""
                          }${index === 0 ? "" : " border-t border-[#E9E9E9]"}`
                        }
                        value={shift}
                      >
                        {({ selected }) => (
                          <span
                            className={`block text-[#1F1F1F] font-normal md:text-sm text-xs truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {shift.shift_name}
                          </span>
                        )}
                      </Listbox.Option>
                    ))
                  ) : (
                    <div className="text-sm px-5 py-3 text-gray-500 text-center">
                      No Shift Available
                    </div>
                  )}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
      </div>

      <div className="col-span-12">
        {loading ? (
          <div className="mt-5">
            <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F8FAFB]">
                  <tr>
                    {[
                      "Student Id",
                      "Student Name",
                      "Parent Name",
                      "Home Phone Number",
                      "Relation",
                      "Frequency Attendance",
                      "Action"
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
                      {[...Array(7)].map((__, colIndex) => (
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
        ) : newStudent?.length > 0 ? (
          <>
            <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F8FAFB]">
                  <tr>
                    {[
                      "Student Id",
                      "Student Name",
                      "Parents name",
                      "Home Phone Number",
                      "Relation",
                      "Frequency Attendance"
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
                  {newStudent?.map((Item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                        {Item?.id}
                      </td>
                      <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                        {Item?.full_name}
                      </td>
                      <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                        {Item?.parent_name}
                      </td>
                      <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                        {Item?.country_code + " " + Item?.mobile_no}
                      </td>
                      <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                        {Item?.relation_to_child}
                      </td>
                      <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2 text-sm font-normal whitespace-nowrap">
                        {Item?.shift_name}
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
                                className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 hover:bg-gray-100"
                                onClick={() =>
                                  navigate(
                                    `/school_admin/student/student_details/${Item?.id}`
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
          </>
        ) : (
          <div className="flex h-[60vh] justify-center items-center">
            <div className="text-center">
              <img src={noData} className="w-32 m-auto" alt="No Data" />
              <h4 className="text-gray-400">No data Found</h4>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
