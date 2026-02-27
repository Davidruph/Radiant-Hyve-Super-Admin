import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import documentIcon from "../../../assets/icons/document-text.png";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoMdClose } from "react-icons/io";
import EditIcon from "../../../assets/icons/edit.png";
import DeleteIcon from "../../../assets/icons/trash.png";
import Select from "react-select";
import Skeleton from "react-loading-skeleton";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";
import {
  addCertificationApi,
  getCertificationListApi,
  getTeacherListApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { DotLoader } from "../../../base-component/Loader/Loader";

export default function Certification() {
  const [addCertificationModal, setAddCertificationModal] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [certificationData, setCertificationData] = useState([]);
  const [btnLoader, setBtnLoader] = useState(false);
  const [shifts, setShifts] = useState([]);

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

  const ChecklistOptions = [
    { value: "", label: "Select" },
    {
      value: "Certified by an institution",
      label: "Certified by an institution"
    },
    { value: "Accredited certificate", label: "Accredited certificate" },
    { value: "Official certificate", label: "Official certificate" },
    {
      value: "School-endorsed certificate",
      label: "School-endorsed certificate"
    },
    {
      value: "Recognized by an educational authority",
      label: "Recognized by an educational authority"
    },
    {
      value: "Proof of official qualification",
      label: "Proof of official qualification"
    }
  ];

  const options = shifts.map((item) => ({
    label: item.full_name,
    value: item.id,
    profile_pic: item.profile_pic
  }));

  const customStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "0.5rem",
      borderColor: "#E5E7EB",
      padding: "0.25rem",
      boxShadow: "none",
      cursor: "default",
      "&:hover": {
        borderColor: "#E5E7EB"
      }
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
      maxHeight: "160px",
      overflowY: "auto"
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "160px",
      overflowY: "auto"
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#E2E8F0" : "white",
      color: state.data.value === "" ? "#9CA3AF" : "#1F1F1F"
    })
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

  const getCertificationList = () => {
    setLoading(true);

    let obj = {
      page: pageNo
    };

    getCertificationListApi(obj)
      .then((res) => {
        const message = res.data.totalPage;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setCertificationData(datas);
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
    getCertificationList();
  }, [pageNo]);

  const validationSchema = Yup.object().shape({
    staffName: Yup.object()
      .shape({
        label: Yup.string().required("Label is required"),
        value: Yup.string().required("Value is required")
      })
      .nullable()
      .required("Staff name is required"),

    institutionName: Yup.string()
      .required("Institution name is required")
      .min(3, "Institution name must be at least 3 characters")
      .max(50, "Institution name must be at most 50 characters"),

    checklist: Yup.object()
      .shape({
        label: Yup.string().required("Label is required"),
        value: Yup.string().required("Value is required")
      })
      .nullable()
      .required("Checklist is required")
  });

  const initialValues = {
    staffName: null,
    institutionName: "",
    checklist: null
  };

  const handleSubmit = (values) => {
    setBtnLoader(true);

    let obj = {
      staff_id: values?.staffName?.value,
      institution_name: values?.institutionName,
      hire_checklist: values?.checklist?.value
    };

    addCertificationApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          getCertificationList();
          toast.success(message);
          setAddCertificationModal(false);
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
  };

  const customSingleValue = ({ data }) => (
    <div className="flex items-center gap-2">
      <img
        src={data.profile_pic}
        alt={data.label}
        className="w-6 h-6 rounded-full object-cover"
      />
      <span>{data.label}</span>
    </div>
  );

  const customOption = (props) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
      >
        <img
          src={data.profile_pic}
          alt={data.label}
          className="w-6 h-6 rounded-full object-cover mr-2"
        />
        <span>{data.label}</span>
      </div>
    );
  };

  return (
    <div>
      <div className="flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-4 sy justify-between">
        <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
          Certification List
        </h2>
        <div className="flex sm:flex-row flex-col items-start md:gap-2 gap-3">
          <button
            className="flex items-center justify-center space-x-1 py-2 px-5 bg-[#293FE3] rounded-lg"
            onClick={() => setAddCertificationModal(true)}
          >
            <FiPlus className="text-white text-2xl" />
            <span className="text-white text-sm font-normal">
              Add Certificate
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-5">
          <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8FAFB]">
                <tr>
                  {["Staff Name", "Institution Name", "Hire List"].map(
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
          {certificationData?.length > 0 ? (
            <div className="mt-5">
              <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F8FAFB]">
                    <tr>
                      {["Staff Name", "Institution Name", "Hire List"].map(
                        (col) => (
                          <th
                            key={col}
                            className="p-4 text-left text-[#3B4045] select-none font-medium cursor-pointer text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group"
                          >
                            {col.replace(/([A-Z])/g, " $1").trim()}
                          </th>
                        )
                      )}
                      <th className="p-4 text-center text-[#3B4045] font-medium text-sm whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificationData?.map((Item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          {Item.staff_name}
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          <div className="w-64 truncate">
                            {Item.institution_name}
                          </div>
                        </td>
                        <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 text-sm font-normal whitespace-nowrap">
                          {Item.hire_checklist}
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
                                className="bg-white absolute text-sm -right-5 w-[240px] shadow-lg rounded p-2 text-start animate-dropdown"
                                sideOffset={5}
                              >
                                <DropdownMenu.Item
                                  className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 border-b border-[#E9E9E9] hover:bg-gray-100"
                                  onClick={() =>
                                    navigate(
                                      `/school_admin/certification/certification_details/${Item.id}`
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
                                <DropdownMenu.Item
                                  className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 hover:bg-gray-100"
                                  onClick={() =>
                                    navigate(
                                      `/school_admin/certification/certification_details/${Item.id}`,
                                      { state: { deleteModal: true } }
                                    )
                                  }
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
        open={addCertificationModal}
        onClose={() => setAddCertificationModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-xl text-lg font-semibold text-[#1F1F1F]">
                  Certification
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setAddCertificationModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ setFieldValue, values }) => (
                  <Form className="mt-7">
                    <div className="px-2">
                      <div className="w-full text-start mb-4">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Staff Name
                        </label>
                        <Select
                          options={options}
                          placeholder="Select"
                          styles={customStyles}
                          isSearchable={false}
                          className="text-sm font-medium"
                          value={values.staffName}
                          onChange={(option) =>
                            setFieldValue("staffName", option)
                          }
                          components={{
                            Option: customOption,
                            SingleValue: customSingleValue
                          }}
                        />
                        <ErrorMessage
                          name="staffName"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <div className="mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Institution Name
                        </label>
                        <Field
                          type="text"
                          name="institutionName"
                          placeholder="Enter institution name"
                          className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                        <ErrorMessage
                          name="institutionName"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <div className="w-full text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Hire Checklist
                        </label>
                        <Select
                          options={ChecklistOptions}
                          placeholder="Select"
                          styles={customStyles}
                          className="text-sm font-medium"
                          value={values.checklist}
                          onChange={(option) =>
                            setFieldValue("checklist", option)
                          }
                        />
                        <ErrorMessage
                          name="checklist"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>
                    </div>

                    <div className="mt-10 flex justify-between md:w-[500px] w-full mx-auto mb-3">
                      <button
                        type="button"
                        onClick={() => setAddCertificationModal(false)}
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
