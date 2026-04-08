import React, { useEffect, useState } from "react";
import school_img from "../../../assets/images/School.png";
import subscribed_img from "../../../assets/images/Subscribed.png";
import { DashboardData } from "../../../data/Data";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import documentIcon from "../../../assets/icons/document-text.png";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { FaCaretUp, FaSort, FaSortDown } from "react-icons/fa";
import revenueIcon from "../../../assets/icons/revenueIcon.png";
import toast from "react-hot-toast";
import { getSchoolListApi } from "../../../services/api_services";
import Card from "../../../components/Card/Card";
import { LuSchool } from "react-icons/lu";
import { PiRecycle } from "react-icons/pi";
import { FaCoins } from "react-icons/fa6";
import { GiCoins } from "react-icons/gi";
import { GiTwoCoins } from "react-icons/gi";

const Dashboard = () => {
  const [detailsModal, setDetailsModal] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const rowsPerPage = 5;
  const totalRows = DashboardData.length;
  const navigate = useNavigate();
  const [nodata, setNodata] = useState(false);
  const [schoolData, setSchoolData] = useState([]);
  const [pageCount, setPageCount] = useState(1);

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

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedData = [...DashboardData].sort((a, b) => {
    if (!sortColumn) return 0;
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];

    if (typeof valueA === "number") {
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    } else {
      return sortOrder === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
  });

  const paginatedData = sortedData.slice(
    (pageNo - 1) * rowsPerPage,
    pageNo * rowsPerPage
  );

  const dashboardDetails = [
    {
      icon: <LuSchool className="text-white text-2xl" />,
      title: "Total Schools",
      count: schoolData?.total_school ? schoolData?.total_school : "0",
      path: "/super_admin/manage_school"
    },
    {
      icon: <PiRecycle className="text-white text-2xl" />,
      title: "Active Subscriptions",
      count: "32",
      path: "/super_admin/subscription_service"
    },
    {
      icon: <GiTwoCoins className="text-white text-2xl" />,
      title: "Monthly Revenue",
      count: "$2000",
      path: "#"
    },
    {
      icon: <FaCoins className="text-white text-2xl" />,
      title: "Yearly Revenue",
      count: "$25,000",
      path: "#"
    }
  ];

  const handleGetSchoolList = () => {
    setNodata(true);

    let param = {
      page: pageNo
    };

    getSchoolListApi(param)
      .then((res) => {
        const data = res?.data;
        const total_page = res.data.totalPage;
        if (res.status === 200) {
          console.log(data);
          setSchoolData(data);
        }
        setPageCount(total_page);
        setNodata(false);
      })
      .catch((err) => {
        const errs = err?.response?.data;
        setNodata(false);

        if (err.response.status === 401) {
          if (errs?.errors) {
            toast.error(errs?.errors[0].msg);
          } else {
            toast.error(errs?.message);
          }
          localStorage.removeItem("device_Id");
          localStorage.removeItem("radient-admin-token");
          localStorage.removeItem("refresh_token");
          navigate("/super_admin/login");
        } else {
          if (errs?.errors) {
            toast.error(errs?.errors[0].msg);
          } else {
            toast.error(errs?.message);
          }
        }
      });
  };

  useEffect(() => {
    handleGetSchoolList();
  }, [pageNo]);

  console.log("schoolData", schoolData);

  return (
    <>
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
      <div className="grid grid-cols-12 2xl:gap-x-6 lg:gap-x-5 gap-4">
        {/* {dashboardDetails &&
          dashboardDetails.map((item, index) => (
            <div
              className="xl:col-span-3 lg:col-span-4 sm:col-span-4 col-span-12"
              key={index}
            >
              <div
                className="bg-[#FFF0E6] py-[25px] hover:shadow-lg duration-300 cursor-pointer px-[24px] rounded-lg flex items-center 2xl:gap-x-6 lg:gap-x-4 md:gap-4 gap-3 "
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
          ))} */}
        <div className="bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg col-span-12 mt-5">
          <h2 className="text-[#1F1F1F] font-medium text-lg mb-4">
            Subscription School List
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8FAFB]">
                <tr>
                  {[
                    "schoolId",
                    "schoolName",
                    "schoolAddress",
                    "plan",
                    "startDate",
                    "endDate"
                  ].map((col) => (
                    <th
                      key={col}
                      className="p-5 text-left text-[#3B4045] select-none font-medium cursor-pointer md:text-base text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group"
                      onClick={() => handleSort(col)}
                    >
                      {col.replace(/([A-Z])/g, " $1").trim()}
                      <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {sortColumn === col ? (
                          sortOrder === "asc" ? (
                            <FaSortDown className="inline-block" />
                          ) : (
                            <FaCaretUp className="inline-block" />
                          )
                        ) : (
                          <FaSort className="inline-block text-gray-400" />
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="p-5 text-left text-[#3B4045] font-medium md:text-base text-sm whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((school, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">
                      {school.schoolId}
                    </td>
                    <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">
                      {school.schoolName}
                    </td>
                    <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">
                      {school.schoolAddress}
                    </td>
                    <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">
                      {school.plan}
                    </td>
                    <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">
                      {school.startDate}
                    </td>
                    <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">
                      {school.endDate}
                    </td>
                    <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap flex justify-center">
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
                              className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-2 hover:bg-gray-100"
                              onClick={() => setDetailsModal(true)}
                            >
                              <img
                                src={documentIcon}
                                className="w-[24px] h-[24px]"
                                alt=""
                              />
                              <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
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
        </div>
        <div className="mt-5 flex w-full col-span-12 justify-center">
          <Pagination>
            <Pagination.Link
              onClick={() => handlePageChange(pageNo - 1)}
              disabled={pageNo === 1}
            >
              <GrPrevious className="text-[#1F1F1F]" />
            </Pagination.Link>
            <div className="flex items-center">{renderPaginationButtons()}</div>
            <Pagination.Link
              onClick={() => handlePageChange(pageNo + 1)}
              disabled={pageNo === pageCount}
            >
              <GrNext className="text-[#1F1F1F]" />
            </Pagination.Link>
          </Pagination>
        </div>
      </div>

      <Dialog
        open={detailsModal}
        onClose={() => setDetailsModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl pb-5">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center px-2 text-start mb-10">
                <h1 className="md:text-2xl text-lg font-semibold text-[#1F1F1F]">
                  Subscription School Details
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setDetailsModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <div className="mt-7">
                <div className="px-2 space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#4B5563] font-normal md:text-base text-sm">
                      School Name
                    </h4>
                    <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                      Marvin Cooper
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#4B5563] font-normal md:text-base text-sm">
                      School Address
                    </h4>
                    <span className="text-[#1F1F1F] font-normal md:text-base max-w-72 text-end text-sm">
                      3891 Preston Rd., South Dakota, California 62639
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#4B5563] font-normal md:text-base text-sm">
                      Subscription Plan
                    </h4>
                    <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                      Monthly
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#4B5563] font-normal md:text-base text-sm">
                      School Id
                    </h4>
                    <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                      396350
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#4B5563] font-normal md:text-base text-sm">
                      Start Date
                    </h4>
                    <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                      24 Oct, 2024
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#4B5563] font-normal md:text-base text-sm">
                      End Date
                    </h4>
                    <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                      24 Nov, 2024
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </>
  );
};

export default Dashboard;
