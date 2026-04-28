import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Pagination from "../../../base-component/Pagination/Pagination";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { GrNext, GrPrevious } from "react-icons/gr";
import documentIcon from "../../../assets/icons/document-text.png";
import { useNavigate } from "react-router-dom";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";
import Skeleton from "react-loading-skeleton";
import { CgUnblock } from "react-icons/cg";
import BlockIcon from "../../../assets/icons/block.png";
import blockModalIcon from "../../../assets/icons/BlockIcon.png";
import { DotLoader } from "../../../base-component/Loader/Loader";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoMdClose } from "react-icons/io";
import { blockStudentPaymentApi } from "../../../services/api_services";
import toast from "react-hot-toast";

export default function AllStudents({
  paginatedData,
  pageNo,
  setPageNo,
  pageCount,
  loading,
  getStudentPaymentList
}) {
  const navigate = useNavigate();
  const [blockModal, setBlockModal] = useState(false);
  const [blockStudentInfo, setBlockStudentInfo] = useState({});
  const [blockBtnLoader, setBlockBtnLoader] = useState(false);

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

  const handleBlock = () => {
    setBlockBtnLoader(true);

    let obj = {
      student_id: blockStudentInfo.id
    };

    blockStudentPaymentApi(obj)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          setBlockModal(false);
          getStudentPaymentList();
          setBlockStudentInfo({});
        }
        setBlockBtnLoader(false);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem("radient_school_token");
          localStorage.removeItem("refresh_school_token");
          localStorage.removeItem("deviceIdSchool");
          navigate("/school_admin");
        } else {
          toast.error("Error fetching data:", err);
          setBlockModal(false);
          setBlockStudentInfo({});
        }
        setBlockBtnLoader(false);
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
                    "Student Id",
                    "Student Name",
                    "Parents name",
                    "Home Phone Number",
                    "Relation",
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
          {paginatedData.length > 0 ? (
            <div className="col-span-12">
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
                        "Student Status"
                      ].map((col) => (
                        <th
                          key={col}
                          className="p-4 text-left text-[#3B4045] select-none font-medium cursor-pointer text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group"
                        >
                          {col.replace(/([A-Z])/g, " $1").trim()}
                        </th>
                      ))}
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm whitespace-nowrap flex justify-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData?.map((Item, index) => (
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
                        <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-2  text-sm font-normal whitespace-nowrap">
                          {Item.request_status === "feesPending" ? (
                            <button
                              onClick={() => {
                                setBlockModal(true);
                                setBlockStudentInfo(Item);
                              }}
                              className="bg-[#E9ECF1] py-2 flex items-center w-28 justify-center gap-1 rounded-full"
                            >
                              <img
                                src={BlockIcon}
                                className="w-4 h-4"
                                alt="Block"
                              />
                              <span className="text-[#4B5563] font-normal text-sm">
                                Block
                              </span>
                            </button>
                          ) : Item.request_status === "accepted" ? (
                            <button
                              onClick={() => {
                                setBlockModal(true);
                                setBlockStudentInfo(Item);
                              }}
                              className="bg-[#E9ECF1] py-2 flex items-center w-28 justify-center gap-1 rounded-full"
                            >
                              <img
                                src={BlockIcon}
                                className="w-4 h-4"
                                alt="Block"
                              />
                              <span className="text-[#4B5563] font-normal text-sm">
                                Block
                              </span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setBlockModal(true);
                                setBlockStudentInfo(Item);
                              }}
                              className="bg-[#E9ECF1] py-2 flex items-center w-28 justify-center gap-1 rounded-full"
                            >
                              <CgUnblock className="text-[#4B5563] text-[20px]" />
                              <span className="text-[#4B5563] font-normal text-sm">
                                UnBlock
                              </span>
                            </button>
                          )}
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
                                className="bg-white absolute -right-5 w-[240px] shadow-xl rounded p-2 text-start animate-dropdown"
                                sideOffset={5}
                              >
                                <DropdownMenu.Item
                                  className="cursor-pointer text-sm flex items-center gap-3 text-start outline-none px-4 py-3 hover:bg-gray-100"
                                  onClick={() =>
                                    navigate(
                                      `/school_admin/student/student_details/${Item.id}`
                                    )
                                  }
                                >
                                  <img
                                    src={documentIcon}
                                    className="w-[20px] h-[20px]"
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

      <Dialog open={blockModal} onClose={() => setBlockModal(false)} size="lg">
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description>
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start md:my-3 my-0">
                <h1 className="text-lg font-semibold text-[#1F1F1F]">
                  {blockStudentInfo.request_status !== "feesPending"
                    ? "Block"
                    : "Unblock"}{" "}
                  Student
                </h1>

                <button
                  className="absolute top-0 right-0"
                  onClick={() => setBlockModal(false)}
                >
                  <IoMdClose className="text-2xl text-[#6B7280]" />
                </button>
              </div>

              <div className="mt-4 px-3">
                <div className="w-full flex items-center justify-center">
                  <img
                    src={blockModalIcon}
                    className="w-[104px] h-[104px]"
                    alt=""
                  />
                </div>

                <div className="w-full mt-4 text-center">
                  <h4 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
                    Are you sure you want to{" "}
                    {blockStudentInfo.request_status !== "feesPending"
                      ? "block"
                      : "unblock"}{" "}
                    this student?
                  </h4>
                  <p className="text-[#4B5563] font-normal md:text-base text-sm">
                    This action will{" "}
                    {blockStudentInfo.request_status !== "feesPending"
                      ? "restrict the student's access."
                      : "restore the student's access."}{" "}
                    You can{" "}
                    {blockStudentInfo.request_status == "feesPending"
                      ? "block"
                      : "unblock"}{" "}
                    again later if needed. Please confirm to proceed.
                  </p>
                </div>

                <div className="mt-5 flex justify-between w-full mb-3">
                  <button
                    type="button"
                    onClick={() => setBlockModal(false)}
                    className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={blockBtnLoader}
                    type="submit"
                    onClick={() => handleBlock()}
                    className="bg-[#FF7373] text-white font-medium text-sm w-full h-12 rounded-lg"
                  >
                    {blockBtnLoader ? (
                      <DotLoader color="#fff" />
                    ) : (
                      `Yes, ${blockStudentInfo.request_status !== "feesPending" ? "Block" : "Unblock"}`
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
