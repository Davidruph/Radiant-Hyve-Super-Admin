import { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Pagination from "../../../base-component/Pagination/Pagination";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { GrNext, GrPrevious } from "react-icons/gr";
import documentIcon from "../../../assets/icons/document-text.png";
import BackIcon from "../../../assets/icons/BackIcon.png";
import { useNavigate } from "react-router-dom";
import { getBirthdayListApi } from "../../../services/api_services";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";

export default function UpcomingBirthday() {
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("principal");
  const [birthdayData, setBirthdayData] = useState([]);
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
              ? "bg-[#293FE3] text-white rounded-lg px-4 py-1.5 mr-2 font-medium text-base border"
              : "text-gray-600 border border-[#F0F1F2] px-4 rounded-lg font-medium md:text-base text-sm py-1.5 mr-2"
          }
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const getBirthListDataApi = () => {
    setLoading(true);
    let params = {
      page: pageNo,
      type: activeTab
    };

    getBirthdayListApi(params)
      .then((res) => {
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setBirthdayData(datas);
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
          toast.error(errs?.message);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    getBirthListDataApi();
  }, [pageNo, activeTab]);

  const getNavigatePath = (id) => {
    console.log("getNavigatePath", id);

    if (activeTab === "staff") {
      return `/school_admin/staff/staff_details/${id}`;
    } else if (activeTab === "principal") {
      return `/school_admin/principal/principal_details/${id}`;
    } else {
      return `/school_admin/student/student_details/${id}`;
    }
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
      <div className="col-span-12">
        <div className="w-full flex md:flex-row flex-col md:items-center items-start gap-4 justify-between mb-4">
          <h2 className="text-[#1F1F1F] font-medium text-lg">
            Upcoming Birthday
          </h2>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("principal")}
            className={`py-2 px-4 font-medium md:text-base text-sm focus:outline-none ${activeTab === "principal" ? "text-[#293FE3] border-b-2 border-[#293FE3]" : "text-gray-500 hover:text-gray-700"}`}
          >
            Principal
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`py-2 px-4 font-medium md:text-base text-sm focus:outline-none ${activeTab === "staff" ? "text-[#293FE3] border-b-2 border-[#293FE3]" : "text-gray-500 hover:text-gray-700"}`}
          >
            Teacher
          </button>
          <button
            onClick={() => setActiveTab("student")}
            className={`py-2 px-4 font-medium md:text-base text-sm focus:outline-none ${activeTab === "student" ? "text-[#293FE3] border-b-2 border-[#293FE3]" : "text-gray-500 hover:text-gray-700"}`}
          >
            Student
          </button>
        </div>

        {loading ? (
          <div className="mt-5">
            <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F8FAFB]">
                  <tr>
                    {[
                      "Id",
                      "Name",
                      "Date of Birth",
                      activeTab === "student" ? "Parent Name" : "Email"
                    ].map((col) => (
                      <th
                        key={col}
                        className="p-4 text-left text-[#3B4045] font-medium text-sm whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                    <th className="p-4 text-center text-[#3B4045] font-medium text-sm whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(10)].map((_, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {[...Array(5)].map((__, colIndex) => (
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
        ) : birthdayData?.length > 0 ? (
          <div className="mt-5">
            <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F8FAFB]">
                  <tr>
                    {[
                      "Id",
                      "Name",
                      "Date of Birth",
                      activeTab === "student" ? "Parent Name" : "Email"
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
                  {birthdayData?.map((Item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                        {Item.id}
                      </td>
                      <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                        {Item.full_name}
                      </td>
                      <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                        {Item.dob}
                      </td>
                      <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                        {activeTab === "student"
                          ? Item.parent_name
                          : Item.email}
                      </td>
                      <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap text-end flex justify-center">
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
                                  navigate(getNavigatePath(Item.id))
                                }
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
      </div>
    </div>
  );
}
