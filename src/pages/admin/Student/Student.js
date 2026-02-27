import React, { useEffect, useState } from "react";
import Tab from "../../../base-component/Tabs/Tabs";
import AllStudents from "./AllStudents";
import NewStudent from "./NewStudent";
import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { IoIosArrowDown } from "react-icons/io";
import {
  getAllStudentListApi,
  getNewStudentListApi,
  getShiftApi,
  getWaitingStudentListApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import WaitingStudent from "./WaitingStudent";
import { useDebounce } from "use-debounce";
import { useLocation, useNavigate } from "react-router-dom";

export default function Staff() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [shiftListArray, setShiftListArray] = useState([]);
  const [selectedShift, setSelectedShift] = useState({
    shift_name: "All",
    id: 0
  });
  const [newStudentData, setNewStudentData] = useState([]);
  const [allStudentData, setAllStudentData] = useState([]);
  const [waitingStudentData, setWaitingStudentData] = useState([]);
  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchVelue, setSearchVelue] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [debouncedSearchText] = useDebounce(searchText, 500);
  const [debouncedSearchVelue] = useDebounce(searchVelue, 500);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pageNo1, setPageNo1] = useState(1);
  const [pageCount1, setPageCount1] = useState(1);
  const [pageNo2, setPageNo2] = useState(1);
  const [pageCount2, setPageCount2] = useState(1);

  let Type;

  try {
    const { type } = location.state;
    Type = type;
  } catch (error) {}

  useEffect(() => {
    if (Type == 1) {
      setActiveTab(1);
    }
  }, [Type]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    setSearch("");
    setSearchText("");
    setSelectedShift({
      shift_name: "All",
      id: 0
    });
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
      page: pageNo1,
      search: debouncedSearch
    };

    getNewStudentListApi(obj)
      .then((res) => {
        const gate = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setNewStudentData(datas);
          setPageCount1(gate);
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
    getNewStudentList();
  }, [pageNo1, debouncedSearch, activeTab]);

  const getAllStudentList = () => {
    setLoading(true);

    let obj = {
      shift_id: selectedShift?.id,
      page: pageNo,
      search: debouncedSearchText
    };

    getAllStudentListApi(obj)
      .then((res) => {
        const total = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setAllStudentData(datas);
          setPageCount(total);
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
    getAllStudentList();
  }, [selectedShift, activeTab, debouncedSearchText]);

  const getWaitingStudentList = () => {
    setLoading(true);

    let obj = {
      page: pageNo2,
      search: debouncedSearchVelue
    };

    getWaitingStudentListApi(obj)
      .then((res) => {
        const totalPage = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setWaitingStudentData(datas);
          setPageCount2(totalPage);
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
    getWaitingStudentList();
  }, [pageNo2, debouncedSearchVelue, activeTab]);

  return (
    <div>
      <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
        Student List
      </h2>

      <div>
        <div className="sm:space-y-0 space-y-4">
          <Tab.Group onChange={(index) => handleTabChange(index)}>
            <div
              className={`flex ${activeTab === 0 ? "xl:flex-row flex-col" : "sm:flex-row flex-col"} justify-between xl:gap-0 gap-4`}
            >
              <Tab.List variant="link-tabs" className="w-[20%]">
                <Tab>
                  <Tab.Button
                    className="w-full py-2 whitespace-nowrap"
                    as="button"
                  >
                    All Student
                  </Tab.Button>
                </Tab>
                <Tab>
                  <Tab.Button
                    className="w-full py-2 whitespace-nowrap"
                    as="button"
                  >
                    New Student
                  </Tab.Button>
                </Tab>

                <Tab>
                  <Tab.Button
                    className="w-full py-2 whitespace-nowrap"
                    as="button"
                  >
                    Waiting Student
                  </Tab.Button>
                </Tab>
              </Tab.List>

              {activeTab === 0 ? (
                <div className="flex md:flex-row flex-col md:items-center items-start md:gap-4 gap-3">
                  <div className="">
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
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Search"
                      className="input text-sm h-6 flex-1 outline-none border-none bg-transparent text-gray-800 px-2"
                    />
                  </div>
                </div>
              ) : activeTab === 1 ? (
                <div className="flex md:flex-row flex-col md:items-center items-start md:gap-4 gap-3">
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
                      placeholder="Search"
                      className="input text-sm flex-1 outline-none border-none bg-transparent text-gray-800 px-2"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex md:flex-row flex-col md:items-center items-start md:gap-4 gap-3">
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
                      value={searchVelue}
                      onChange={(e) => setSearchVelue(e.target.value)}
                      placeholder="Search"
                      className="input text-sm flex-1 outline-none border-none bg-transparent text-gray-800 px-2"
                    />
                  </div>
                </div>
              )}
            </div>

            <Tab.Panels className="mt-5">
              <Tab.Panel className="leading-relaxed">
                {activeTab === 0 && (
                  <AllStudents
                    paginatedData={allStudentData}
                    pageNo={pageNo}
                    setPageNo={setPageNo}
                    getStudentPaymentList={getAllStudentList}
                    pageCount={pageCount}
                    loading={loading}
                  />
                )}
              </Tab.Panel>
              <Tab.Panel className="leading-relaxed">
                {activeTab === 1 && (
                  <NewStudent
                    paginatedData={newStudentData}
                    pageNo={pageNo1}
                    setPageNo={setPageNo1}
                    pageCount={pageCount1}
                    loading={loading}
                  />
                )}
              </Tab.Panel>
              <Tab.Panel className="leading-relaxed">
                {activeTab === 2 && (
                  <WaitingStudent
                    paginatedData={waitingStudentData}
                    pageNo={pageNo2}
                    setPageNo={setPageNo2}
                    pageCount={pageCount2}
                    loading={loading}
                  />
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
}
