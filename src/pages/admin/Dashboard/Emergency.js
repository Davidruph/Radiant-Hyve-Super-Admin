import React, { useState } from "react";
import BackIcon from "../../../assets/icons/BackIcon.png";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import {
  addEmergencyApi,
  getEmergencyListApi,
  getEmergencyTableApi
} from "../../../services/api_services";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Dialog from "../../../base-component/Dialog/Dialog";
import { FiPlus } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { Listbox } from "@headlessui/react";
import { Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { ErrorMessage, Form, Formik } from "formik";
import * as Yup from "yup";
import { DotLoader } from "../../../base-component/Loader/Loader";
import moment from "moment/moment";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Emergency() {
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const navigate = useNavigate();
  const [emergencyData, setEmergencyData] = useState([]);
  const [emergencyTableData, setEmergencyTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addEmergencyModal, setAddEmergencyModal] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);

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

  const getEmergencyList = () => {
    setLoading(true);

    let obj = {
      page: pageNo
    };
    getEmergencyListApi(obj)
      .then((res) => {
        const message = res.data.total_page;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setEmergencyData(datas);
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

  const getEmergencyTable = () => {
    getEmergencyTableApi()
      .then((res) => {
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setEmergencyTableData(datas);
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

  const validationSchema = Yup.object({
    sos: Yup.object().required("Please select an SOS")
  });

  const handleSubmit = (values) => {
    let params = {
      sos_type_id: values.sos.id
    };

    addEmergencyApi(params)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          getEmergencyList();
          setAddEmergencyModal(false);
        }
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
    setAddEmergencyModal(false);
  };

  useEffect(() => {
    getEmergencyList();
  }, [pageNo]);

  useEffect(() => {
    getEmergencyTable();
  }, []);

  return (
    <div>
      <div className="mb-5 flex justify-between items-center sm:flex-row flex-col sm:space-y-0 space-y-4">
        <button
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <img src={BackIcon} className="w-[38px] h-[38px]" alt="" />
          <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
            Back
          </span>
        </button>
        <button
          className="flex items-center justify-center space-x-1 py-2 px-5 bg-red-500 rounded-lg"
          onClick={() => setAddEmergencyModal(true)}
        >
          <FiPlus className="text-white text-2xl" />
          <span className="text-white text-sm whitespace-nowrap font-normal">
            Add SOS
          </span>
        </button>
      </div>

      {loading ? (
        <div className="mt-5">
          <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8FAFB]">
                <tr>
                  {["Id", "Date", "Emergency Situation"].map((col) => (
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
          {emergencyData.length > 0 ? (
            <div className="mt-5">
              <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F8FAFB]">
                    <tr>
                      {["Id", "Date", "Emergency Situation"].map((col) => (
                        <th
                          key={col}
                          className="p-4 text-left text-[#3B4045] select-none font-medium cursor-pointer text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group"
                        >
                          {col.replace(/([A-Z])/g, " $1").trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {emergencyData.map((Item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-4 text-sm font-normal whitespace-nowrap">
                          {Item.id}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-4 text-sm font-normal whitespace-nowrap">
                          {moment(Item.created_at).format("DD-MM-YYYY")}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-4 text-sm font-normal whitespace-nowrap">
                          {Item.sos_name}
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
        open={addEmergencyModal}
        onClose={() => setAddEmergencyModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="py-4">
              <div className="w-full relative sm:text-center text-start my-3 md:px-8 px-4">
                <h1 className="md:text-xl text-lg font-semibold text-[#274372]">
                  Add Emergency
                </h1>
                <button
                  className="absolute top-0 right-5"
                  onClick={() => setAddEmergencyModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <Formik
                initialValues={{
                  sos: null
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, setFieldValue }) => (
                  <Form className="md:px-10 px-4 w-full scroll overflow-y-auto py-4">
                    <label
                      htmlFor="sos"
                      className="text-sm font-medium text-[#1F1F1F]"
                    >
                      Select SOS
                    </label>
                    <Listbox
                      value={values.sos}
                      onChange={(val) => setFieldValue("sos", val)}
                    >
                      <div className="relative w-full pt-1">
                        <Listbox.Button className="relative w-full border border-[#D1D5DB] rounded-lg bg-white py-2 pl-3 pr-10 text-left cursor-pointer focus:outline-none">
                          <span className="block truncate text-sm">
                            {values.sos?.sos_name || "Select Emergency"}
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
                            {emergencyTableData?.length > 0 ? (
                              emergencyTableData.map((Item, index) => (
                                <Listbox.Option
                                  key={index}
                                  className={({ focus }) =>
                                    `relative cursor-pointer select-none py-3 px-5${
                                      focus ? " bg-gray-100" : ""
                                    }${
                                      index === 0
                                        ? ""
                                        : " border-t border-[#E9E9E9]"
                                    }`
                                  }
                                  value={Item}
                                >
                                  {({ selected }) => (
                                    <span
                                      className={`block text-[#1F1F1F] md:text-sm text-xs truncate ${
                                        selected ? "font-medium" : "font-normal"
                                      }`}
                                    >
                                      {Item.sos_name}
                                    </span>
                                  )}
                                </Listbox.Option>
                              ))
                            ) : (
                              <div className="text-sm px-5 py-3 text-gray-500 text-center">
                                No Item Available
                              </div>
                            )}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                    <ErrorMessage
                      name="sos"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />

                    <div className="flex items-center justify-end mt-5">
                      <button
                        type="submit"
                        className="flex items-center justify-end space-x-1 h-11 px-5 bg-[#293FE3] rounded-lg"
                        disabled={btnLoader}
                      >
                        <span className="text-white text-sm whitespace-nowrap font-normal">
                          {btnLoader ? <DotLoader color="#fff" /> : "Add SOS"}
                        </span>
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
