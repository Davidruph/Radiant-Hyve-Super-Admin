import { useEffect, useState } from "react";
import BackIcon from "../../../assets/icons/BackIcon.png";
import { useNavigate, useParams } from "react-router-dom";
import PlaceholderImg from "../../../assets/images/placeholderImg.png";
import {
  getNewStudentDetailsApi,
  getStudentAttendanceApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";

export default function StudentDetails() {
  const { id } = useParams();
  const [newStudentData, setNewStudentData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [attedanceStudentData, setAttedanceStudentData] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);

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

  const getStudentAttendance = () => {
    setBtnLoading(true);

    let obj = {
      student_id: id,
      page: pageNo
    };

    getStudentAttendanceApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setAttedanceStudentData(datas);
          setPageCount(message);
        }
        setBtnLoading(false);
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
        setBtnLoading(false);
      });
  };

  useEffect(() => {
    getStudentAttendance();
  }, [id, pageNo]);

  useEffect(() => {
    getNewStudentDetails();
  }, [id]);

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
                <Skeleton height={20} width={160} className="mt-3" />
              </>
            ) : (
              <>
                <img
                  src={newStudentData?.profile_pic || PlaceholderImg}
                  className="object-cover w-[138px] h-[138px] rounded-full"
                  alt=""
                />
                <h3 className="text-[#0F1113] font-medium md:text-base text-sm mt-4">
                  {newStudentData?.full_name}
                </h3>
                <h3 className="text-[#4B5563] font-normal md:text-sm text-xs mt-3">
                  Student Id: :{" "}
                  <span className="text-[#1F1F1F] font-normal md:text-sm text-xs">
                    {newStudentData?.id}
                  </span>
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
                value: newStudentData?.Shift?.shift_name || "-"
              },
              {
                label: "Medical Insurance Number",
                value: newStudentData?.madical_insuarance_no || "-"
              },
              { label: "Address", value: newStudentData?.address || "-" },
              {
                label: "Assigned Staff",
                value: newStudentData?.Teacher?.full_name || "-"
              },
              {
                label: "Student Status",
                value:
                  newStudentData?.request_status == "accepted"
                    ? "Accepted"
                    : "Rejected" || "-",
                isStatus: true
              },
              newStudentData?.request_status === "rejected" && {
                label: "Reject Reason",
                value: newStudentData?.rejected_reason || "-"
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <h4 className="text-[#4B5563] text-sm font-normal">
                  {item.label}
                </h4>
                <span
                  className={`text-sm font-normal text-end ${
                    item.isStatus
                      ? newStudentData?.request_status === "accepted"
                        ? "text-green-600"
                        : newStudentData?.request_status === "rejected"
                          ? "text-red-600"
                          : "text-[#1F1F1F]"
                      : "text-[#1F1F1F]"
                  }`}
                >
                  {loading ? <Skeleton height={20} width={150} /> : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:mt-0 my-4">
        <h3 className="text-[#1F1F1F] font-semibold md:text-xl text-lg">
          Attendance
        </h3>
      </div>

      <div className="grid grid-cols-12 gap-5 ">
        <div className="lg:col-span-6 col-span-12">
          <div className=" bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
            {loading ? (
              <div className="max-h-[50vh] overflow-y-auto scroll">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8FAFB]">
                    <tr>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                        Date
                      </th>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                        Attendance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(10)].map((_, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {[140, 140].map((width, i) => (
                          <td key={i} className="px-4 py-4">
                            <Skeleton width={width} height={20} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : attedanceStudentData?.length > 0 ? (
              <>
                <div className="max-h-[50vh] overflow-y-auto scroll">
                  <table className="min-w-full scroll text-sm table-fixed">
                    <thead className="bg-[#F8FAFB] block sticky top-0 z-10">
                      <tr className="table w-full table-fixed">
                        <th className="p-4 text-left text-[#3B4045] font-medium md:text-base text-sm whitespace-nowrap w-1/2">
                          Date
                        </th>
                        <th className="p-4 text-left text-[#3B4045] font-medium md:text-base text-sm whitespace-nowrap w-1/2">
                          Attendance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attedanceStudentData?.map((Item, index) => (
                        <tr
                          key={index}
                          className="table w-full table-fixed hover:bg-gray-50"
                        >
                          <td className="border-b border-[#E5E7EB] text-[#3B4045] px-4 py-3 text-sm font-normal whitespace-nowrap w-1/2">
                            {Item.date}
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-3 text-sm font-normal whitespace-nowrap w-1/2">
                            <div
                              className={`${
                                Item.attendance_status === "absent"
                                  ? "bg-[#E9ECF1] text-[#293FE3]"
                                  : "bg-[#E8F6EC] text-[#1BA345]"
                              } w-28 text-center font-normal text-sm rounded-full py-1`}
                            >
                              {Item.attendance_status}
                            </div>
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
              <div className="flex h-[50vh] justify-center items-center">
                <div className="text-center">
                  <img src={noData} className="w-32 m-auto" alt="No Data" />
                  <h4 className="text-gray-400">No data Found</h4>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* <div className='lg:col-span-8 col-span-12  bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg'>
                    <div className='flex md:flex-row flex-col md:items-center gap-3 items-start justify-between mb-5'>
                        <h3 className='text-[#243465] font-medium md:text-2xl text-xl'>Yearly Graph</h3>
                        <div className='flex items-center justify-center'>
                            <div className=''>
                                <Listbox value={selected} onChange={setSelected}>
                                    <div className="relative">
                                        <Listbox.Button className="relative border border-[#FFB30B] w-[115px] rounded-lg bg-[#FFF7E7] py-1 pl-3 pr-10 text-left cursor-pointer focus:outline-none">
                                            <span className="block text-[#1F1F1F] text-[12px] font-normal truncate">{selected.name || 'Select Class'}</span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <IoIosArrowDown className="text-xl text-[#1F1F1F]" aria-hidden="true" />
                                            </span>
                                        </Listbox.Button>

                                        <Transition
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                {years.map((item, index) => (
                                                    <Listbox.Option
                                                        key={index}
                                                        className={({ active }) =>
                                                            `relative cursor-pointer select-none py-1 px-5 border-b border-[#E9E9E9] last:border-none ${active ? 'bg-gray-100' : ''}`
                                                        }
                                                        value={item}
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block text-[#1F1F1F] font-normal text-[12px] truncate ${selected ? 'font-medium' : 'font-normal'}`}>
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
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <PrincipalYearlyGraph height={400} />
                    </div>
                </div> */}
      </div>
    </div>
  );
}
