import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoMdClose } from "react-icons/io";
import EditIcon from "../../../assets/icons/edit.png";
import { useDebounce } from "use-debounce";
import {
  addShiftApi,
  deleteShiftApi,
  editShiftApi,
  getShiftListApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { DotLoader } from "../../../base-component/Loader/Loader";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "../../../assets/icons/trash.png";

export default function Shift() {
  const navigate = useNavigate();
  const [addShiftModal, setAddShiftModal] = useState(false);
  const [editShiftModal, setEditShiftModal] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);
  const [shiftData, setshiftData] = useState([]);
  const [btnLoader, setBtnLoader] = useState(false);
  const [editData, setEditData] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);

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

  const getShiftList = () => {
    setLoading(true);

    let obj = {
      page: pageNo,
      search: debouncedSearch
    };

    getShiftListApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        console.log("message", message);
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setshiftData(datas);
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
    getShiftList();
  }, [pageNo, debouncedSearch]);

  const initialValues = {
    shiftName: editData?.shift_name || "",
    shiftFee: editData?.shift_fee || "",
    lateFee: editData?.penalty || ""
  };

  const validationSchema = Yup.object({
    shiftName: Yup.string()
      .min(2, "Program name must be at least 2 characters")
      .max(50, "Program name must be at most 50 characters")
      .required("Program name is required"),
    shiftFee: Yup.number()
      .typeError("Fee must be a number")
      .positive("Fee must be positive")
      .max(9999999, "Fee must be at most 7 digits")
      .required("Program fee is required"),
    lateFee: Yup.number()
      .typeError("Late fee must be a number")
      .positive("Late fee must be positive")
      .max(9999999, "Late fee must be at most 7 digits")
      .required("Late fee is required")
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    setBtnLoader(true);

    let obj = {
      shift_name: values?.shiftName,
      shift_fee: values?.shiftFee,
      penalty: values?.lateFee
    };

    addShiftApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          getShiftList();
          toast.success(message);
        }
        setAddShiftModal(false);
        setSubmitting(false);
        resetForm();
        setBtnLoader(false);
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
        setBtnLoader(false);
      });
  };

  const handleEditSubmit = (values, { setSubmitting, resetForm }) => {
    setBtnLoader(true);

    let obj = {
      shift_name: values?.shiftName,
      shift_fee: values?.shiftFee,
      shift_id: editData?.id,
      penalty: values?.lateFee
    };

    editShiftApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          getShiftList();
          toast.success(message);
        }
        resetForm();
        setEditShiftModal(false);
        setSubmitting(false);
        setBtnLoader(false);
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
        setBtnLoader(false);
      });
  };

  const handleDelete = (id) => {
    setBtnLoader(true);

    deleteShiftApi(id)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          getShiftList();
        }
        setDeleteModal(false);
        setBtnLoader(false);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem("radient_school_token");
          localStorage.removeItem("refresh_school_token");
          localStorage.removeItem("deviceIdSchool");
          navigate("/school_admin");
        } else {
          toast.error("Error fetching data:", err);
        }
        setBtnLoader(false);
      });
  };

  return (
    <div>
      <div className="flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-4 sy justify-between">
        <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
          Programs List
        </h2>
        <div className="flex sm:flex-row flex-col items-start md:gap-2 gap-3">
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
              placeholder="Search for Program name"
              className="input text-sm flex-1 outline-none border-none bg-transparent text-gray-800 px-2"
            />
          </div>
          <button
            className="flex items-center justify-center space-x-1 py-2 px-5 bg-[#293FE3] rounded-lg"
            onClick={() => {
              setAddShiftModal(true);
              setEditData({});
            }}
          >
            <FiPlus className="text-white text-2xl" />
            <span className="text-white text-sm font-normal">Add Program</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-5">
          <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8FAFB]">
                <tr>
                  {["Program Id", "Program Name", "Program Fee", "Action"].map(
                    (col) => (
                      <th
                        key={col}
                        className="p-4 text-left text-[#3B4045] font-medium text-sm whitespace-nowrap"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {[...Array(10)].map((_, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {[...Array(4)].map((__, colIndex) => (
                      <td
                        key={colIndex}
                        className="border-b border-[#E5E7EB] px-4 py-3"
                      >
                        <Skeleton width={200} height={20} />
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
          {shiftData.length > 0 ? (
            <div className="mt-5">
              <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F8FAFB]">
                    <tr>
                      {[
                        "Program Id",
                        "Program Name",
                        "Program Fee",
                        "Late Fee"
                      ].map((col) => (
                        <th
                          key={col}
                          className="p-4 text-left text-[#3B4045] select-none font-medium cursor-pointer  text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group"
                        >
                          {col.replace(/([A-Z])/g, " $1").trim()}
                        </th>
                      ))}
                      <th className="p-4 text-center text-[#3B4045] font-medium  text-sm whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiftData?.map((Item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2  text-sm font-normal whitespace-nowrap">
                          {Item.id}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2  text-sm font-normal whitespace-nowrap">
                          {Item.shift_name}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2  text-sm font-normal whitespace-nowrap">
                          ${Item.shift_fee}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2  text-sm font-normal whitespace-nowrap">
                          ${Item.penalty}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2  text-sm font-normal whitespace-nowrap text-end flex justify-center">
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
                                  onClick={() => {
                                    setEditShiftModal(true);
                                    setEditData(Item);
                                  }}
                                >
                                  <img
                                    src={EditIcon}
                                    className="w-[20px] h-[20px]"
                                    alt=""
                                  />
                                  <span className="text-[#1F1F1F] font-normal text-sm">
                                    Edit
                                  </span>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-2 hover:bg-gray-100"
                                  onClick={() => handleDelete(Item.id)}
                                >
                                  <img
                                    src={DeleteIcon}
                                    className="w-[20px] h-[20px]"
                                    alt=""
                                  />
                                  <span className="text-[#1F1F1F] font-normal text-sm">
                                    Delete
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
        open={addShiftModal}
        onClose={() => setAddShiftModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-xl text-lg font-semibold text-[#1F1F1F]">
                  Program Information
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setAddShiftModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched }) => (
                  <Form className="mt-7">
                    <div className="px-2">
                      <div>
                        <div className="mb-4 text-start">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Program Name
                          </label>
                          <Field
                            name="shiftName"
                            type="text"
                            placeholder="Enter Program name"
                            className={`w-full border text-sm px-4 py-3 rounded-lg disabled:text-[#6B7280] focus:ring-2 focus:outline-none ${
                              errors.shiftName && touched.shiftName
                                ? "border-red-500 focus:ring-red-200"
                                : "border-[#E5E7EB] focus:ring-gray-400"
                            }`}
                          />
                          <ErrorMessage
                            name="shiftName"
                            component="div"
                            className="text-red-600 text-xs mt-1"
                          />
                        </div>

                        <div className="mb-4 text-start">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Program Fee
                          </label>

                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">
                              $
                            </span>
                            <Field
                              name="shiftFee"
                              type="number"
                              min="0"
                              placeholder="Enter fees"
                              className={`w-full text-sm border pl-8 pr-4 py-3 rounded-lg disabled:text-[#6B7280] focus:ring-2 focus:outline-none ${
                                errors.shiftFee && touched.shiftFee
                                  ? "border-red-500 focus:ring-red-200"
                                  : "border-[#E5E7EB] focus:ring-gray-400"
                              }`}
                            />
                          </div>

                          <ErrorMessage
                            name="shiftFee"
                            component="div"
                            className="text-red-600 text-xs mt-1"
                          />
                        </div>

                        <div className="mb-4 text-start">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Late Fee
                          </label>

                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">
                              $
                            </span>
                            <Field
                              name="lateFee"
                              type="number"
                              min="0"
                              placeholder="Enter fees"
                              className={`w-full text-sm border pl-8 pr-4 py-3 rounded-lg disabled:text-[#6B7280] focus:ring-2 focus:outline-none ${
                                errors.lateFee && touched.lateFee
                                  ? "border-red-500 focus:ring-red-200"
                                  : "border-[#E5E7EB] focus:ring-gray-400"
                              }`}
                            />
                          </div>

                          <ErrorMessage
                            name="lateFee"
                            component="div"
                            className="text-red-600 text-xs mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between md:w-[500px] w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setAddShiftModal(false)}
                        className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={btnLoader}
                        type="submit"
                        className="bg-[#293FE3] text-white font-medium text-sm w-full h-12 rounded-lg"
                      >
                        {btnLoader ? <DotLoader color="#fff" /> : " Save"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={editShiftModal}
        onClose={() => setEditShiftModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-xl text-lg font-semibold text-[#1F1F1F]">
                  Edit Program Information
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setEditShiftModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleEditSubmit}
              >
                {({ errors, touched }) => (
                  <Form className="mt-7">
                    <div className="px-2">
                      <div>
                        <div className="mb-4 text-start">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Program Name
                          </label>
                          <Field
                            name="shiftName"
                            type="text"
                            placeholder="Enter Shift name"
                            className={`w-full border text-sm px-4 py-3 rounded-lg disabled:text-[#6B7280] focus:ring-2 focus:outline-none ${
                              errors.shiftName && touched.shiftName
                                ? "border-red-500 focus:ring-red-200"
                                : "border-[#E5E7EB] focus:ring-gray-400"
                            }`}
                          />
                          <ErrorMessage
                            name="shiftName"
                            component="div"
                            className="text-red-600 text-xs mt-1"
                          />
                        </div>

                        <div className="mb-4 text-start">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Program Fee
                          </label>

                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">
                              $
                            </span>
                            <Field
                              name="shiftFee"
                              type="number"
                              min="0"
                              placeholder="Enter fees"
                              className={`w-full text-sm border pl-8 pr-4 py-3 rounded-lg disabled:text-[#6B7280] focus:ring-2 focus:outline-none ${
                                errors.shiftFee && touched.shiftFee
                                  ? "border-red-500 focus:ring-red-200"
                                  : "border-[#E5E7EB] focus:ring-gray-400"
                              }`}
                            />
                          </div>

                          <ErrorMessage
                            name="shiftFee"
                            component="div"
                            className="text-red-600 text-xs mt-1"
                          />
                        </div>

                        <div className="mb-4 text-start">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Late Fee
                          </label>

                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">
                              $
                            </span>
                            <Field
                              name="lateFee"
                              type="number"
                              min="0"
                              placeholder="Enter fees"
                              className={`w-full text-sm border pl-8 pr-4 py-3 rounded-lg disabled:text-[#6B7280] focus:ring-2 focus:outline-none ${
                                errors.lateFee && touched.lateFee
                                  ? "border-red-500 focus:ring-red-200"
                                  : "border-[#E5E7EB] focus:ring-gray-400"
                              }`}
                            />
                          </div>

                          <ErrorMessage
                            name="lateFee"
                            component="div"
                            className="text-red-600 text-xs mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between md:w-[500px] w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setEditShiftModal(false)}
                        className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={btnLoader}
                        type="submit"
                        className="bg-[#293FE3] text-white font-medium text-sm w-full h-12 rounded-lg"
                      >
                        {btnLoader ? <DotLoader color="#fff" /> : " Save"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
