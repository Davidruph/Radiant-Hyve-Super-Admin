import React, { Fragment, useEffect, useState } from "react";
import InvoiceIcon from "../../../assets/icons/bill.png";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import receiptIcon from "../../../assets/icons/receipt-text.png";
import { Listbox, Transition } from "@headlessui/react";
import {
  blockStudentPaymentApi,
  getRemainingFeesApi,
  getStudentFeesListApi,
  getStudentPaymentReceiptApi,
  makePaymentApi,
  studentFeesListHistoryApi
} from "../../../services/api_services";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CgEye, CgUnblock } from "react-icons/cg";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { DotLoader } from "../../../base-component/Loader/Loader";
import BlockIcon from "../../../assets/icons/block.png";
import blockModalIcon from "../../../assets/icons/BlockIcon.png";
import moment from "moment";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { CiExport } from "react-icons/ci";
import radianthvye_logo from "../../../assets/logo/Frame 1.png";
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";

const months = [
  { value: "", name: "Select Month" },
  { value: 1, name: "January" },
  { value: 2, name: "February" },
  { value: 3, name: "March" },
  { value: 4, name: "April" },
  { value: 5, name: "May" },
  { value: 6, name: "June" },
  { value: 7, name: "July" },
  { value: 8, name: "August" },
  { value: 9, name: "September" },
  { value: 10, name: "October" },
  { value: 11, name: "November" },
  { value: 12, name: "December" }
];

const paymentStatus = [
  { value: "", name: "Pay.. Status" },
  { value: "paid", name: "Paid" },
  { value: "unpaid", name: "UnPaid" }
];

const years = [
  { value: "", name: "Select Year" },
  { value: 2025, name: "2025" },
  { value: 2024, name: "2024" },
  { value: 2023, name: "2023" },
  { value: 2022, name: "2022" },
  { value: 2021, name: "2021" },
  { value: 2020, name: "2020" },
  { value: 2019, name: "2019" },
  { value: 2018, name: "2018" },
  { value: 2017, name: "2017" },
  { value: 2016, name: "2016" },
  { value: 2015, name: "2015" }
];

const reminderValidationSchema = Yup.object().shape({
  reminderTitle: Yup.string()
    .required("Reminder title is required")
    .min(3, "Reminder title must be at least 3 characters")
    .max(100, "Reminder title must not exceed 100 characters"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters")
});

const validationSchema = Yup.object().shape({
  paymentType: Yup.string().required("Please select a payment type"),
  description: Yup.string()
    .max(200, "Description must be 200 characters or less")
    .notRequired()
});

const Payment = () => {
  const navigate = useNavigate();
  const [openReceipt, setOpenReceipt] = useState(false);
  const [openParentsIfo, setOpenParentsIfo] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [studentPaymentData, setStudentPaymentData] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const currentDate = new Date();
  const [btnLoader, setBtnLoader] = useState({});
  const [blockBtnLoader, setBlockBtnLoader] = useState(false);
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const currentMonthObj =
    months.find((month) => month.value === currentMonth) || months[0];
  const currentYearObj =
    years.find((year) => year.value === currentYear) || years[0];
  const [selectedMonths, setSelectedMonths] = useState(currentMonthObj);
  const [selectedStatus, setSelectedStatus] = useState(paymentStatus[0]);
  const [selectedYear, setSelectedYear] = useState(currentYearObj);
  const [blockModal, setBlockModal] = useState(false);
  const [blockStudentInfo, setBlockStudentInfo] = useState({});
  const [invoiceData, setInvoiceData] = useState(null);
  const [parentsInfo, setParentsInfo] = useState(null);
  const [markAsCompleteModal, setMarkAsCompleteModal] = useState(false);
  const [markAsCompleteBtnLoader, setMarkAsCompleteBtnLoader] = useState(false);
  const [markAsCompleteInfo, setMarkAsCompleteInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [commentModal, setCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pageCount) {
      setPageNo(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReminderSubmit = (values, { setSubmitting, resetForm }) => {
    console.log("Form values:", values);

    let obj = {
      student_id: parentsInfo.id,
      title: values.reminderTitle,
      body: values.description,
      year: selectedYear.value,
      month: selectedMonths.value
    };

    getRemainingFeesApi(obj)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          getStudentPaymentList();
          setOpenParentsIfo(false);
          resetForm();
          setSubmitting(false);
        }
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
        setSubmitting(false);
      });
  };

  const handleMarkAsComplete = (values) => {
    setMarkAsCompleteBtnLoader(true);

    let obj = {
      student_id: markAsCompleteInfo.id,
      year: selectedYear.value,
      month: selectedMonths.value,
      payment_type: values.paymentType,
      comment: values.description
    };

    makePaymentApi(obj)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          getStudentPaymentList();
          setMarkAsCompleteInfo(null);
          setMarkAsCompleteBtnLoader(false);
          setMarkAsCompleteModal(false);
        }
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
        setMarkAsCompleteBtnLoader(false);
      });
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

  const handlePaymentReceipt = (invoiceId, index) => {
    setBtnLoader((prev) => ({ ...prev, [index]: true }));
    let obj = {
      invoice_id: invoiceId
    };

    getStudentPaymentReceiptApi(obj)
      .then((res) => {
        setBtnLoader((prev) => ({ ...prev, [index]: false }));
        console.log("pricipal____res>>>", res);
        setOpenReceipt(true);
        setInvoiceData(res?.data?.data);
      })
      .catch((err) => {
        setBtnLoader((prev) => ({ ...prev, [index]: false }));
        console.log("pricipal____err>>>", err);
        toast.error("Error fetching data:", err);
      });
  };

  const handleParentsInfo = (item) => {
    setOpenParentsIfo(true);
    setParentsInfo(item);
  };

  const getStudentPaymentList = () => {
    setLoading(true);

    let obj = {
      page: pageNo,
      month: selectedMonths.value,
      year: selectedYear.value
    };

    if (selectedStatus.value) {
      obj.type = selectedStatus.value === "paid" ? 1 : 0;
    }

    if (debouncedSearch && debouncedSearch.trim() !== "") {
      obj.search = debouncedSearch.trim();
    }
    getStudentFeesListApi(obj)
      .then((res) => {
        const message = res.data.total_page;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setStudentPaymentData(datas);
          setPageCount(message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("pricipal____err>>>", err);

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
    getStudentPaymentList();
  }, [pageNo, debouncedSearch, selectedMonths, selectedYear, selectedStatus]);

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

  const viewPDF = () => {
    const element = document.getElementById("invoicepdf");
    const opt = {
      margin: 8,
      filename: "invoice.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };
    html2pdf().set(opt).from(element).save();
  };

  const exportToExcel = () => {
    setIsLoading(true);

    if (studentPaymentData?.length === 0) {
      setIsLoading(false);
      return;
    }

    let obj = {
      month: selectedMonths.value,
      year: selectedYear.value
    };

    if (selectedStatus.value) {
      obj.type = selectedStatus.value === "paid" ? 1 : 0;
    }

    studentFeesListHistoryApi(obj)
      .then((res) => {
        let list = res?.data?.data;

        const captionRow = [
          [
            `Title : Payment List   |   Month : ${selectedMonths.value ?? "-"}   |   Year : ${selectedYear.value ?? "-"}`
          ]
        ];

        const headers = [
          "Student Id",
          "Student Name",
          "Parents Name",
          "Amount",
          "Late Fee",
          "Student Fees",
          "Payment Type",
          "Student Status",
          "Invoice Id",
          "Comment"
        ];

        const rows = [];

        list?.forEach((item) => {
          rows.push([
            item?.id ?? "-",
            item?.full_name ?? "-",
            item?.parent_name ?? "-",
            item?.shift_fee !== undefined ? `$${item.shift_fee}` : "-",
            item?.is_penalty == 1 ? `$${item.penalty}` : "0",
            item?.is_pay !== undefined
              ? item.is_pay == 0
                ? "Unpaid"
                : "Paid"
              : "-",
            item?.payment_type ?? "-",
            item?.request_status
              ? item.request_status === "feesPending"
                ? "Blocked"
                : "Unblocked"
              : "-",
            item?.invoice_id ? `#${item.invoice_id}` : "-",
            item?.comment ?? "-"
          ]);
        });

        const ws = XLSX.utils.aoa_to_sheet([
          ...captionRow,
          [],
          headers,
          ...rows
        ]);

        ws["!merges"] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
        ];

        const wscols = [
          { wch: 15 },
          { wch: 25 },
          { wch: 25 },
          { wch: 15 },
          { wch: 20 },
          { wch: 15 },
          { wch: 15 },
          { wch: 20 },
          { wch: 20 }
        ];
        ws["!cols"] = wscols;

        const totalRows = captionRow.length + rows.length + 2;
        ws["!rows"] = Array.from({ length: totalRows }, () => ({
          hpt: 30,
          bold: true,
          sz: 22,
          color: { rgb: "FFFFFF" },
          fill: { fgColor: { rgb: "4F81BD" } },
          customHeight: true
        }));

        const range = XLSX.utils.decode_range(ws["!ref"]);

        for (let row = range.s.r; row <= range.e.r; row++) {
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            if (!ws[cellAddress]) continue;

            if (!ws[cellAddress].s) ws[cellAddress].s = {};

            ws[cellAddress].s.alignment = {
              horizontal: "center",
              vertical: "center",
              wrapText: true
            };

            if (row === 0) {
              ws[cellAddress].s = {
                font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4F81BD" } },
                alignment: { horizontal: "center", vertical: "center" }
              };
            }

            if (row === 2) {
              ws[cellAddress].s.font = { bold: true, color: { rgb: "FFFFFF" } };
              ws[cellAddress].s.fill = { fgColor: { rgb: "FF0000" } };
            }

            ws[cellAddress].s.border = {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            };
          }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Payment Data");

        XLSX.writeFile(wb, "Payment_Data.xlsx");
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  const handleViewComment = (item) => {
    setCommentModal(true);
    setCommentText(item?.comment);
  };

  return (
    <>
      <div className="xl:flex items-center justify-between">
        <h2 className="text-lg font-semibold">Payment List</h2>
        <div className="md:flex items-centert gap-3 xl:mt-0 mt-4">
          <div className="flex items-center border bg-[#F3F4F6] border-[#E5E7EB] xl:w-[300px] sm:w-[200px] w-full rounded-lg px-3 py-2">
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
              placeholder="Search for student name"
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
              className="input text-sm flex-1 outline-none border-none bg-transparent text-gray-800 px-2"
            />
          </div>

          <div className="flex items-centert gap-3 md:mt-0 mt-4">
            <div>
              <Listbox value={selectedStatus} onChange={setSelectedStatus}>
                <div className="relative text-sm">
                  <Listbox.Button className="relative w-[140px] border border-[#D1D5DB] rounded-lg bg-white py-2 pl-3 pr-10 text-left cursor-pointer focus:outline-none">
                    <span
                      className={`block truncate ${selectedStatus.value === "" && "text-[#9CA3AF]"}`}
                    >
                      {selectedStatus.name || "Select Payment Status"}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <IoIosArrowDown
                        className="text-xl text-gray-400"
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
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {paymentStatus.map((item, index) => (
                        <Listbox.Option
                          key={index}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 px-5 border-b border-[#E9E9E9] last:border-none ${active ? "bg-gray-100" : ""}`
                          }
                          value={item}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block text-[#1F1F1F] font-normal md:text-sm text-xs truncate ${item.value === "" && "text-[#9CA3AF]"} ${selected ? "font-medium" : "font-normal"}`}
                              >
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

            <div>
              <Listbox value={selectedMonths} onChange={setSelectedMonths}>
                <div className="relative text-sm">
                  <Listbox.Button className="relative w-[140px] border border-[#D1D5DB] rounded-lg bg-white py-2 pl-3 pr-10 text-left cursor-pointer focus:outline-none">
                    <span
                      className={`block truncate ${selectedMonths.value === "" && "text-[#9CA3AF]"}`}
                    >
                      {selectedMonths.name || "Select Select Month"}
                    </span>
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
                    <Listbox.Options className="absolute z-10 mt-1 w-full h-[200px] overflow-y-auto scrollBar bg-white rounded-lg shadow-lg max-h-60 py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {months.map((item, index) => (
                        <Listbox.Option
                          key={index}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 px-5 border-b border-[#E9E9E9] last:border-none ${active ? "bg-gray-100" : ""}`
                          }
                          value={item}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block text-[#1F1F1F] font-normal md:text-sm text-xs truncate ${item.value === "" && "text-[#9CA3AF]"} ${selected ? "font-medium" : "font-normal"}`}
                              >
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

            <div>
              <Listbox value={selectedYear} onChange={setSelectedYear}>
                <div className="relative text-sm">
                  <Listbox.Button className="relative w-[130px] border border-[#D1D5DB] rounded-lg bg-white py-2 pl-3 pr-10 text-left cursor-pointer focus:outline-none">
                    <span
                      className={`block truncate ${selectedYear.value === "" && "text-[#9CA3AF]"}`}
                    >
                      {selectedYear.name || "Select Select Year"}
                    </span>
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
                    <Listbox.Options className="absolute z-10 mt-1 w-full h-[200px] overflow-y-auto scrollBar bg-white rounded-lg shadow-lg max-h-60 py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {years.map((item, index) => (
                        <Listbox.Option
                          key={index}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 px-5 border-b border-[#E9E9E9] last:border-none ${active ? "bg-gray-100" : ""}`
                          }
                          value={item}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block text-[#1F1F1F] font-normal md:text-sm text-xs truncate ${item.value === "" && "text-[#9CA3AF]"} ${selected ? "font-medium" : "font-normal"}`}
                              >
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
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button
          disabled={studentPaymentData.length === 0 || isLoading}
          onClick={exportToExcel}
          className="bg-gray-200 flex items-center justify-center gap-2 font-medium text-sm w-40 h-10 rounded-lg"
        >
          {isLoading ? (
            <DotLoader className="text-black" />
          ) : (
            <>
              {" "}
              <CiExport className="text-xl" /> Export{" "}
            </>
          )}
        </button>
      </div>

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
                    "Amount",
                    "Student Fees",
                    "Invoice",
                    "Student status"
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
      ) : (
        <div>
          {studentPaymentData.length > 0 ? (
            <div className="bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg mt-5">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm ">
                  <thead className="bg-[#F8FAFB]">
                    <tr>
                      {[
                        { name: "Student Id", class: "text-start" },
                        { name: "Student Name", class: "text-start" },
                        { name: "Parents Name", class: "text-start" },
                        { name: "Amount", class: "text-center" },
                        { name: "Late Fee", class: "text-center" },
                        { name: "Fees Status", class: "text-center" },
                        { name: "Payment Type", class: "text-center" },
                        { name: "Invoice Id", class: "text-center" },
                        { name: "Invoice", class: "text-center" },
                        { name: "Student Status", class: "text-start" },
                        { name: "Payment Status", class: "text-center" },
                        { name: "Action", class: "text-center" }
                      ].map((col) => (
                        <th
                          key={col.name}
                          className={`p-4 ${col.class ? col.class : "text-center"} text-[#3B4045] select-none font-medium cursor-pointer text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group`}
                        >
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(studentPaymentData) &&
                      studentPaymentData?.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 text-center"
                        >
                          <td className="border-b border-[#E5E7EB] text-start text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                            {item.id}
                          </td>
                          <td className="border-b border-[#E5E7EB] text-start text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                            {item.full_name}
                          </td>
                          <td className="border-b border-[#E5E7EB] text-start text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                            {item.parent_name}
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                            ${item.shift_fee}
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                            ${item?.is_penalty == 1 ? item.penalty : 0}
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                            <span
                              className={` font-normal text-sm rounded-full px-5 py-1 ${item?.is_pay == 0 ? "bg-[#FFDED8] text-[#FF7373]" : "bg-[#E8F6EC] text-[#1BA345]"}`}
                            >
                              {item.is_pay == 0 ? "Unpaid" : "Paid"}
                            </span>
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                            {item.payment_type ? item.payment_type : "-"}
                          </td>

                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                            {item.invoice_id ? `#${item.invoice_id}` : "-"}
                          </td>

                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 text-sm font-normal whitespace-nowrap cursor-pointer">
                            {item?.invoice_id !== null ? (
                              <button
                                onClick={() =>
                                  handlePaymentReceipt(item?.invoice_id, index)
                                }
                                disabled={btnLoader[index]}
                                className={`font-normal text-sm rounded-full h-10 w-36 bg-[#FF6700] text-[#FFFFFF] disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {btnLoader[index] ? (
                                  <DotLoader color="#fff" />
                                ) : (
                                  <>
                                    <img
                                      src={InvoiceIcon}
                                      alt="..."
                                      className="w-4 h-4 mr-2 inline"
                                    />
                                    View Invoice
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleParentsInfo(item)}
                                className={` font-normal text-sm rounded-full h-10 px-5 bg-[#F3F4F6] text-[#4B5563]`}
                              >
                                Reminder to Parents
                              </button>
                            )}
                          </td>

                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                            {item.request_status == "feesPending" ? (
                              <button
                                onClick={() => {
                                  setBlockModal(true);
                                  setBlockStudentInfo(item);
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
                                  setBlockStudentInfo(item);
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

                          <td className="border-b border-[#E5E7EB] text-[#4B5563]  px-4 py-3 text-sm font-normal whitespace-nowrap">
                            {item.is_pay == 0 ? (
                              <button
                                onClick={() => {
                                  setMarkAsCompleteModal(true);
                                  setMarkAsCompleteInfo(item);
                                }}
                                className={`cursor-pointer bg-[#293FE3] text-[#FFFFFF] py-2 text-sm text-center px-5 gap-1 rounded-full`}
                              >
                                <span className="font-normal text-sm">
                                  Mark as Complete
                                </span>
                              </button>
                            ) : (
                              <span className="font-normal text-sm bg-[#E8F6EC] text-[#1BA345] px-5 py-2 rounded-full">
                                Completed
                              </span>
                            )}
                          </td>

                          <td className="border-b border-[#E5E7EB] text-[#4B5563] m-auto text-sm font-normal whitespace-nowrap">
                            {item.comment ? (
                              <button
                                onClick={() => handleViewComment(item)}
                                className="font-normal m-auto text-sm rounded-full w-10 h-10 flex items-center justify-center bg-[#F3F4F6] text-[#4B5563]"
                              >
                                <CgEye />
                              </button>
                            ) : (
                              "-"
                            )}
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

      <Dialog
        open={openReceipt}
        onClose={() => setOpenReceipt(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:h-[600px] h-[500px] overflow-auto">
              <div id="invoicepdf" className="w-full">
                <div className="flex justify-center bg-[#293FE3] rounded-t-2xl py-3 w-full items-center">
                  <img
                    src={radianthvye_logo}
                    className="h-12 py-2 object-cover"
                    alt="Logo"
                  />
                </div>

                <div className="md:px-8 border rounded-xl border-[#F3F4F6] p-3">
                  <div className="w-full relative sm:text-center text-start my-3">
                    <h1 className="md:text-lg text-base font-semibold text-[#1F1F1F]">
                      Payment Receipt
                    </h1>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm text-[#4B5563]">Invoice Id</h5>
                      <p className="text-sm text-[#1F1F1F]">
                        #{invoiceData?.id}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-[12px]">
                      <h5 className="text-sm text-[#4B5563]">Student Id</h5>
                      <p className="text-sm text-[#1F1F1F]">
                        #{invoiceData?.student_id}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-[12px]">
                      <h5 className="text-sm text-[#4B5563]">Student Name</h5>
                      <p className="text-sm text-[#1F1F1F]">
                        {invoiceData?.student_name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="border-b mb-2 border-[#F3F4F6] py-2">
                      <h4 className="text-[#1F1F1F] text-base font-medium">
                        Fess Details
                      </h4>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <h5 className="text-sm text-[#4B5563]">Fees Type </h5>
                      <p className="text-sm text-[#1F1F1F]">
                        {invoiceData?.payment_type == "online"
                          ? "Online"
                          : "Cash"}
                      </p>
                    </div>
                    <div className="flex py-2 items-center justify-between">
                      <h5 className="text-sm text-[#4B5563]">Shift Fee </h5>
                      <p className="text-sm text-[#1F1F1F]">
                        ${invoiceData?.shift_fee}
                      </p>
                    </div>
                    <div className="flex py-2 items-center justify-between">
                      <h5 className="text-sm text-[#4B5563]">Late Fee </h5>
                      <p className="text-sm text-[#1F1F1F]">
                        ${invoiceData?.penalty_fees || 0}
                      </p>
                    </div>

                    <div className="border-b border-[#F3F4F6] py-3">
                      <h4 className="text-[#1F1F1F] text-base font-medium">
                        Payment Details
                      </h4>
                    </div>
                    <div className="flex items-center justify-between mt-[12px]">
                      <h5 className="text-sm text-[#4B5563]">Date</h5>
                      <p className="text-sm text-[#1F1F1F]">
                        {moment(invoiceData?.createdAt).format("DD MMM, YYYY")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-[12px]">
                      <h5 className="text-sm text-[#4B5563]">Total Fee </h5>
                      <p className="text-sm text-[#1BA345]">
                        ${invoiceData?.total_fees}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex justify-center gap-3">
                  <button
                    className="bg-gray-400 w-52 h-11 rounded-lg flex items-center justify-center gap-2"
                    onClick={() => setOpenReceipt(false)}
                  >
                    <IoMdClose className="w-5 text-white" />
                    <span className="text-white text-sm">Close</span>
                  </button>
                  <button
                    type="button"
                    className="bg-[#293FE3] text-white font-medium text-sm w-52 h-11 rounded-lg flex items-center justify-center gap-2"
                    onClick={() => viewPDF()}
                  >
                    <img src={receiptIcon} alt="..." className="w-4" />
                    Download Receipt
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={openParentsIfo}
        onClose={() => setOpenParentsIfo(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="h-full overflow-auto md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3 sm:pr-0 pr-6">
                <h1 className="text-lg font-semibold text-[#1F1F1F]">
                  Reminder to Parents Information
                </h1>
                <button className="absolute top-0 right-0 ">
                  <IoMdClose
                    className="text-2xl text-[#6B7280]"
                    onClick={() => setOpenParentsIfo(false)}
                  />
                </button>
              </div>
              <Formik
                initialValues={{
                  reminderTitle: "",
                  description: ""
                }}
                validationSchema={reminderValidationSchema}
                onSubmit={handleReminderSubmit}
              >
                {({
                  isSubmitting,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  values
                }) => (
                  <Form className="mt-7">
                    <div className="px-2 text-sm">
                      <div>
                        <div className="mb-4 text-start">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Student Name
                          </label>
                          <input
                            type="text"
                            value={parentsInfo?.full_name || ""}
                            disabled
                            className="w-full border border-[#E5E7EB]  px-4 py-3 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none bg-gray-50"
                          />
                        </div>
                        <div className="mb-4 text-start">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Reminder Title{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field
                            name="reminderTitle"
                            type="text"
                            placeholder="Enter reminder title"
                            className={`w-full border px-4 py-3 rounded-lg focus:ring-1 focus:outline-none ${
                              errors.reminderTitle && touched.reminderTitle
                                ? "border-red-500 focus:ring-red-400"
                                : "border-[#E5E7EB] focus:ring-gray-400"
                            }`}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.reminderTitle}
                          />
                          <ErrorMessage
                            name="reminderTitle"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                        <div className="mb-4 text-start">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <Field
                            name="description"
                            as="textarea"
                            rows={4}
                            placeholder="Enter description"
                            className={`w-full border px-4 py-3 rounded-lg focus:ring-1 focus:outline-none resize-none ${
                              errors.description && touched.description
                                ? "border-red-500 focus:ring-red-400"
                                : "border-[#E5E7EB] focus:ring-gray-400"
                            }`}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.description}
                          />
                          <ErrorMessage
                            name="description"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between w-full mb-3">
                      <button
                        type="button"
                        className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                        onClick={() => setOpenParentsIfo(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#293FE3] text-white font-medium text-sm w-full h-12 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? <DotLoader color="#fff" /> : "Submit"}
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
        open={commentModal}
        onClose={() => setCommentModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description>
            <div className="md:px-8 px-3 py-5 relative">
              <div className="pb-3 border-b">
                <h1 className="text-lg font-semibold text-[#1F1F1F]">
                  Comment
                </h1>
                <button
                  className="absolute top-5 right-5"
                  onClick={() => setCommentModal(false)}
                >
                  <IoMdClose className="text-2xl text-[#6B7280]" />
                </button>
              </div>

              <div className="text-sm mt-5">
                <p className="text-[#4B5563] font-normal text-sm">
                  {commentText}
                </p>
              </div>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={markAsCompleteModal}
        onClose={() => setMarkAsCompleteModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description>
            <Formik
              initialValues={{ paymentType: "" }}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                handleMarkAsComplete(values);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="md:px-8 px-3 py-5">
                  <div className="w-full relative sm:text-center text-start md:my-3 my-0">
                    <h1 className="text-lg font-semibold text-[#1F1F1F]">
                      Mark as Complete
                    </h1>
                  </div>

                  <div className="mt-4 text-sm">
                    <label className="block text-[#4B5563] font-normal text-sm mb-2">
                      Payment Type
                    </label>
                    <Field
                      as="select"
                      name="paymentType"
                      className="w-full border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none bg-gray-50"
                    >
                      <option value="">Select Payment Type</option>
                      <option value="cash">Cash</option>
                      <option value="online">Online</option>
                    </Field>
                    <ErrorMessage
                      name="paymentType"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div className="mt-4 text-sm">
                    <label className="block text-[#4B5563] font-normal text-sm mb-2">
                      Comment
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      rows={4}
                      placeholder="Enter Comment"
                      className="w-full border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none bg-gray-50"
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div className="mt-6 flex justify-between w-full mb-3">
                    <button
                      type="button"
                      onClick={() => setMarkAsCompleteModal(false)}
                      className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#293FE3] text-white font-medium text-sm w-full h-12 rounded-lg"
                    >
                      {markAsCompleteBtnLoader ? (
                        <DotLoader color="#fff" />
                      ) : (
                        "Yes, Mark as Complete"
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      {/* <Dialog
        open={markAsCompleteModal}
        onClose={() => setMarkAsCompleteModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description>
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start md:my-3 my-0">
                <h1 className='text-lg font-semibold text-[#1F1F1F]'>Mark as Complete</h1>

                <button className="absolute top-0 right-0" onClick={() => setMarkAsCompleteModal(false)}>
                  <IoMdClose className="text-2xl text-[#6B7280]" />
                </button>
              </div>

              <div className="mt-4 px-3">
                <div className="w-full flex items-center justify-center">
                  <img src={pendingModalIcon} alt='...' className="w-[100px] h-[100px]" />
                </div>
                <div className="w-full mt-4 text-center">
                  <h4 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
                    Are you sure you want to mark this payment as complete?
                  </h4>
                  <p className="text-[#4B5563] font-normal md:text-base text-sm">
                    This action will mark this payment as complete. You can mark it as complete again later if needed. Please confirm to proceed.
                  </p>
                </div>

                <div className="mt-5 flex justify-between w-full mb-3">
                  <button
                    type="button"
                    onClick={() => setMarkAsCompleteModal(false)}
                    className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={markAsCompleteBtnLoader}
                    type="submit"
                    onClick={() => handleMarkAsComplete()}
                    className="bg-[#FFB30B] text-white font-medium text-sm w-full h-12 rounded-lg"
                  >
                    {markAsCompleteBtnLoader ? <DotLoader color="#fff" /> : `Yes, Mark as Complete`}
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog> */}
    </>
  );
};

export default Payment;
