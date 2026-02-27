import React, { Fragment, use, useEffect, useRef, useState } from "react";
import BackIcon from "../../../assets/icons/BackIcon.png";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import EditIcon from "../../../assets/icons/edit.png";
import DeleteIcon from "../../../assets/icons/trash.png";
import BlockIcon from "../../../assets/icons/block.png";
import PrincipalYearlyGraph from "../../../components/PrincipalYearlyGraph/PrincipalYearlyGraph";
import Dialog from "../../../base-component/Dialog/Dialog";
import PlaceholderImg from "../../../assets/images/placeholderImg.png";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition,
  Textarea
} from "@headlessui/react";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import { PhoneInput } from "react-international-phone";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import DeleteModalIcon from "../../../assets/icons/DeleteIcon(1).png";
import blockModalIcon from "../../../assets/icons/BlockIcon.png";
import datePickerIcon from "../../../assets/icons/datePicker.png";
import DatePicker from "react-multi-date-picker";
import {
  BlockPrincipalApi,
  changePasswordPrincipalApi,
  deletePrincipalApi,
  editPrincipalApi,
  getAttendanceCountApi,
  getAttendanceListApi,
  getPrincipalProfileApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { FiUploadCloud } from "react-icons/fi";
import { DotLoader } from "../../../base-component/Loader/Loader";
import moment from "moment/moment";
import { CgUnblock } from "react-icons/cg";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";

const genderOptions = [
  { value: "", name: "Select gender" },
  { value: "male", name: "Male" },
  { value: "female", name: "Female" }
];

export default function PrincipalDetails() {
  const location = useLocation();
  const { id } = useParams();
  const pickerRef = useRef(null);
  const pickerInstanceRef = useRef(null);
  const navigate = useNavigate();
  const [editInformationModal, setEditInformationModal] = useState(false);
  const [editAccountModal, setEditAccountModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [blockModal, setBlockModal] = useState(false);
  const [showPassword, setShowPassword] = useState("");
  const [selectedGender, setSelectedGender] = useState(genderOptions[1]);
  const [principalData, setPrincipalData] = useState({});
  const [Loader, setLoader] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState("");
  const [img, setImg] = useState("");
  const [image, setImage] = useState("");
  const [btnLoader, setBtnLoader] = useState(false);
  const [dob, setDob] = useState(null);
  const [isImgLoading, setImgLoading] = useState(true);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthlyCounts, setMonthlyCounts] = useState([]);
  const currentYear = new Date().getFullYear();
  const [selected, setSelected] = useState({ name: currentYear.toString() });
  const [blockReason, setBlockReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteReasonError, setDeleteReasonError] = useState("");

  const handleImageChange = (e) => {
    setImg(e.target.files[0]);
    let profileImage = URL.createObjectURL(e.target.files[0]);
    setImage(profileImage);
  };

  const accountDetails = {
    email: principalData?.email,
    password: "Test@123"
  };

  useEffect(() => {
    if (location.state?.deleteModal) {
      setDeleteModal(true);
    }
    if (location.state?.blockModal) {
      setBlockModal(true);
    }

    if (location.state) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const principalDetails = () => {
    setLoader(true);
    let obj = {
      principal_id: id
    };
    getPrincipalProfileApi(obj)
      .then((res) => {
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setPrincipalData(datas);
        }
        setLoader(false);
      })
      .catch((err) => {
        console.log(err);
        if (err?.response?.status === 401) {
          navigate("/school_admin/login");
          localStorage.removeItem("radient_school_token");
          localStorage.removeItem("refresh_school_token");
          localStorage.removeItem("deviceIdSchool");
        } else {
          const errs = err?.response?.data;
          toast.error(errs?.message);
          if (errs.status === 2) {
            navigate("/school_admin/principal");
          }
        }
        setLoader(false);
      });
  };

  const principalYearlyGraphDetails = () => {
    setLoader(true);
    let obj = {
      user_id: id,
      year: selected?.name
    };
    getAttendanceCountApi(obj)
      .then((res) => {
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          const orderedMonths = [
            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sep",
            "oct",
            "nov",
            "dec"
          ];
          const monthValues = orderedMonths.map((month) => datas[month] || 0);
          setMonthlyCounts(monthValues);
        }
        setLoader(false);
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
        setLoader(false);
      });
  };

  const getAttendanceList = () => {
    setLoading(true);
    let obj = {
      user_id: id,
      page: pageNo
    };
    getAttendanceListApi(obj)
      .then((res) => {
        const total = res.data.totalPage;

        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setTimeEntries(datas);
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
    principalYearlyGraphDetails();
  }, [id, selected]);

  useEffect(() => {
    getAttendanceList();
  }, [id, pageNo]);

  useEffect(() => {
    principalDetails();
    getAttendanceList();
    setImgLoading(false);
  }, [id]);

  const handleEditData = () => {
    if (principalData) {
      const newSelected =
        genderOptions.find(
          (option) => option.value === (principalData.gender || "")
        ) || genderOptions[0];
      setSelectedGender(newSelected);
      setImage(principalData.profile_pic || "");
      setDob(
        principalData?.dob
          ? moment(principalData.dob, "YYYY-MM-DD").toDate()
          : null
      );
    }
    setEditInformationModal(true);
    setBtnLoader(false);
  };

  const initialValues = {
    gender: principalData?.gender || "",
    fullName: principalData?.full_name || "",
    email: principalData?.email || "",
    phone: principalData?.mobile_no
      ? `+${principalData.country_code}${principalData.mobile_no}`
      : "",
    dob: principalData?.dob || null,
    qualification: principalData?.qualification || "",
    designation: principalData?.designation || "",
    experience: principalData?.experience || ""
  };

  const validationSchema = Yup.object({
    fullName: Yup.string()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be at most 50 characters")
      .required("Full name is required"),
    phone: Yup.string()
      .min(6, "Phone number must be at least 6 digits")
      .required("Phone number is required")
      .test("is-valid-phone", "Enter a valid phone number", (value) => {
        return value && value.replace(/\D/g, "").length > 5;
      }),
    gender: Yup.string().required("Gender is required"),
    dob: Yup.string().required("Date of birth is required"),
    qualification: Yup.string()
      .min(2, "Qualification must be at least 2 characters")
      .max(100, "Qualification must be at most 100 characters")
      .required("Qualification is required"),
    designation: Yup.string()
      .min(2, "Designation must be at least 2 characters")
      .max(100, "Designation must be at most 100 characters")
      .required("Designation is required"),
    experience: Yup.string()
      .min(1, "Experience must be at least 1 character")
      .max(50, "Experience must be at most 50 characters")
      .required("Experience is required")
  });

  const handleSubmit = (values) => {
    setBtnLoader(true);

    if (!image) {
      setBtnLoader(false);
      toast.error("Please upload a profile picture.");
      return;
    }

    const parsedPhone = parsePhoneNumberFromString(values?.phone);
    const formattedDob = moment(values.dob, "YYYY-MM-DD").format("YYYY-MM-DD");

    const formData = new FormData();
    formData.append("principal_id", id);
    formData.append("full_name", values?.fullName);
    formData.append("email", values?.email);
    formData.append("mobile_no", parsedPhone.nationalNumber);
    formData.append("country_code", `+${parsedPhone.countryCallingCode}`);
    formData.append("iso_code", parsedPhone.country || "in");
    formData.append("gender", values?.gender);
    formData.append("dob", formattedDob);
    formData.append("qualification", values?.qualification);
    formData.append("designation", values?.designation);
    formData.append("experience", values?.experience);

    if (img) {
      formData.append("profile_pic", img);
    }

    editPrincipalApi(formData)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          principalDetails();
          toast.success(message);
          setEditInformationModal(false);
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

  const handleDelete = () => {
    if (!deleteReason.trim()) {
      setDeleteReasonError("Reason is required to delete the account.");
      return;
    }

    setBtnLoader(true);
    deletePrincipalApi(id, deleteReason)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          navigate("/school_admin/principal");
        }
        setDeleteModal(false);
        setBtnLoader(false);
        setDeleteReason("");
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

  const handleBlock = () => {
    if (!principalData?.is_blocked && !blockReason.trim()) {
      setReasonError("Reason is required.");
      return;
    }

    setReasonError("");
    setBtnLoader(true);

    let obj = {
      principal_id: id,
      block_reason: blockReason
    };

    BlockPrincipalApi(obj)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          principalDetails();
        }
        setBlockModal(false);
        setBtnLoader(false);
        setBlockReason("");
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

  const initial = {
    newPassword: "",
    confirmPassword: ""
  };

  const validation = Yup.object({
    newPassword: Yup.string()
      .required("Please enter new password")
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password must be at most 32 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
        "Password must have uppercase, lowercase, number, and special character"
      ),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("newPassword"), null], "Passwords do not match")
  });

  const handleSubmitAccount = (values) => {
    setBtnLoader(true);
    let obj = {
      principal_id: id,
      password: values?.newPassword
    };

    changePasswordPrincipalApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setEditAccountModal(false);
          toast.success(message);
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

  const generateYearList = (activeYear) => {
    const start = activeYear - 5;
    const list = [];

    for (let year = start; year <= activeYear; year++) {
      list.push({ name: year.toString() });
    }

    return list;
  };

  const years = generateYearList(currentYear);

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
        <div className="lg:col-span-4 col-span-12 bg-white max-h-[282px] rounded-</div>lg p-5">
          <div className="flex flex-col items-center justify-center h-full">
            {Loader || isImgLoading ? (
              <Skeleton circle width={138} height={138} />
            ) : (
              <img
                src={principalData?.profile_pic || PlaceholderImg}
                onLoad={() => setImgLoading(false)}
                onError={() => setImgLoading(false)}
                className="object-cover rounded-full w-[138px] h-[138px]"
                alt="Principal Profile"
              />
            )}

            <h3 className="text-[#0F1113] font-medium text-sm w-64 truncate text-center mt-4">
              {Loader ? (
                <Skeleton height={24} width={100} />
              ) : (
                principalData?.full_name
              )}
            </h3>
          </div>
        </div>

        <div className="lg:col-span-8 col-span-12 bg-white rounded-lg p-5">
          <div className="flex xl:flex-row lg:flex-col md:flex-row flex-col gap-5 items-center justify-between">
            <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
              Principal Information
            </h2>
            <div className="flex sm:flex-row flex-col items-start gap-3">
              <button
                className="bg-[#FFF7E7] px-3 py-2 flex items-center sm:w-fit w-[132px] gap-1 rounded-xl"
                onClick={handleEditData}
              >
                <img src={EditIcon} className="w-[20px] h-[20px]" alt="Edit" />
                <span className="text-[#4B5563] font-normal text-sm">
                  Edit Profile
                </span>
              </button>
              <button
                className="bg-[#FFDED8] px-3 py-2 flex items-center sm:w-fit w-[132px] gap-1 rounded-xl"
                onClick={() => setDeleteModal(true)}
              >
                <img
                  src={DeleteIcon}
                  className="w-[20px] h-[20px]"
                  alt="Delete"
                />
                <span className="text-[#4B5563] font-normal text-sm">
                  Delete
                </span>
              </button>
              {principalData?.is_blocked === false ? (
                <button
                  className="bg-[#E9ECF1] px-3 py-2 flex items-center sm:w-fit w-[132px] gap-1 rounded-xl"
                  onClick={() => setBlockModal(true)}
                >
                  <img
                    src={BlockIcon}
                    className="w-[20px] h-[20px]"
                    alt="Block"
                  />
                  <span className="text-[#4B5563] font-normal text-sm">
                    Block
                  </span>
                </button>
              ) : (
                <button
                  className="bg-[#E9ECF1] px-3 py-2 flex items-center sm:w-fit w-[132px] gap-1 rounded-xl"
                  onClick={() => setBlockModal(true)}
                >
                  <CgUnblock className="text-[#4B5563] text-[20px]" />
                  <span className="text-[#4B5563] font-normal text-sm">
                    UnBlock
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {[
              { label: "Full Name", value: principalData?.full_name },
              {
                label: "Phone Number",
                value: `${principalData?.country_code} ${principalData?.mobile_no}`
              },
              { label: "Gender", value: principalData?.gender },
              { label: "Date of Birth", value: principalData?.dob },
              { label: "Qualification", value: principalData?.qualification },
              { label: "Designation", value: principalData?.designation },
              { label: "Experience", value: principalData?.experience }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <h4 className="text-[#4B5563] text-sm font-normal">
                  {item.label}
                </h4>
                <span className="text-[#1F1F1F] font-normal text-sm sm:w-auto w-40 truncate">
                  {Loader ? <Skeleton height={20} width={150} /> : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 mt-5">
        <div className="lg:col-span-4 col-span-12"></div>

        <div className="lg:col-span-8 col-span-12 bg-white rounded-lg p-5">
          <div className="flex sm:flex-row flex-col items-center gap-3 justify-between">
            <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
              Principal Account Details
            </h2>
            <div>
              <button
                className="bg-[#FFF7E7] px-3 py-2 flex items-center gap-1 rounded-xl"
                onClick={() => setEditAccountModal(true)}
              >
                <img src={EditIcon} className="w-[24px] h-[24px]" alt="Edit" />
                <span className="text-[#4B5563] font-normal text-sm">
                  Edit Details
                </span>
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            <div className="flex sm:flex-row flex-col items-start gap-2 justify-between">
              <h4 className="text-[#4B5563] text-sm font-normal">Email</h4>
              <span className="text-[#1F1F1F] font-normal text-sm">
                {Loader ? (
                  <Skeleton height={20} width={200} />
                ) : (
                  accountDetails?.email
                )}
              </span>
            </div>

            <div className="flex sm:flex-row flex-col items-start gap-2 justify-between">
              <h4 className="text-[#4B5563] text-sm font-normal">Password</h4>
              <span className="text-[#1F1F1F] font-normal text-sm">
                {Loader ? (
                  <Skeleton height={20} width={100} />
                ) : (
                  "*".repeat(accountDetails?.password?.length || 8)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:mt-0 mt-4 mb-4">
        <h3 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
          Attendance
        </h3>
      </div>

      <div className="grid grid-cols-12 gap-5 ">
        <div className="lg:col-span-5 col-span-12">
          <div className="bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
            {loading ? (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8FAFB]">
                    <tr>
                      <th className="p-4 text-center text-[#3B4045] font-medium text-sm">
                        Date
                      </th>
                      <th className="p-4 text-center text-[#3B4045] font-medium text-sm">
                        Clock In
                      </th>
                      <th className="p-4 text-center text-[#3B4045] font-medium text-sm">
                        Clock Out
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(10)].map((_, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {[120, 120, 120].map((width, i) => (
                          <td key={i} className="px-4 py-4">
                            <Skeleton width={width} height={20} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : timeEntries.length > 0 ? (
              <>
                <div className="max-h-[42vh] overflow-y-auto scroll">
                  <table className="min-w-full text-sm table-fixed">
                    <thead className="bg-[#F8FAFB] block sticky top-0 z-10">
                      <tr className="table w-full table-fixed">
                        <th className="p-4 text-center text-[#3B4045] font-medium text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap">
                          Date
                        </th>
                        <th className="p-4 text-center text-[#3B4045] font-medium text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap">
                          Clock In
                        </th>
                        <th className="p-4 text-center text-[#3B4045] font-medium text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap">
                          Clock Out
                        </th>
                      </tr>
                    </thead>
                    <tbody className="block">
                      {timeEntries.map((Item, index) => (
                        <tr
                          key={index}
                          className="table w-full table-fixed hover:bg-gray-50"
                        >
                          <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 text-center m-auto py-4 text-sm font-normal whitespace-nowrap">
                            {Item.date}
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 text-center m-auto py-4 text-sm font-normal whitespace-nowrap">
                            {Item.clock_in_time
                              ? moment(Item.clock_in_time).format("hh:mm A")
                              : "-"}
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 text-center m-auto py-4 text-sm font-normal whitespace-nowrap">
                            {Item.clock_out_time
                              ? moment(Item.clock_out_time).format("hh:mm A")
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 flex w-full col-span-12 justify-end">
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

        <div className="lg:col-span-7 col-span-12 bg-[#FFFFFF] h-fit py-4 md:px-4 px-3 rounded-lg">
          <div className="flex md:flex-row flex-col md:items-center gap-3 items-start justify-between mb-5">
            <h3 className="text-[#243465] font-medium md:text-lg text-base">
              Yearly Graph
            </h3>
            <div className="flex items-center justify-center">
              <Listbox value={selected} onChange={(val) => setSelected(val)}>
                <div className="relative">
                  <Listbox.Button className="relative border border-[#FFB30B] w-[115px] rounded-lg bg-[#FFF7E7] py-1 pl-3 pr-10 text-left cursor-pointer focus:outline-none">
                    <span className="block text-[#1F1F1F] text-[12px] font-normal truncate">
                      {selected.name || "Select Year"}
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
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white overflow-y-auto scroll rounded-lg shadow-lg max-h-40 py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {years.map((item, index) => (
                        <Listbox.Option
                          key={index}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-1 px-5 border-b border-[#E9E9E9] last:border-none ${
                              active ? "bg-gray-100" : ""
                            }`
                          }
                          value={item}
                        >
                          {({ selected }) => (
                            <span
                              className={`block text-[#1F1F1F] font-normal text-[12px] truncate ${
                                selected ? "font-medium" : ""
                              }`}
                            >
                              {item.name}
                            </span>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>
          <PrincipalYearlyGraph height={400} data={monthlyCounts} />
        </div>
      </div>

      <Dialog
        open={editInformationModal}
        onClose={() => setEditInformationModal(false)}
        size="xl"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="py-4">
              <div className="w-full relative sm:text-center text-start my-3 md:px-8 px-4">
                <h1 className="md:text-lg text-base font-semibold text-[#274372]">
                  Update Principal Information
                </h1>
                <button
                  className="absolute top-0 right-5"
                  onClick={() => setEditInformationModal(false)}
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
                  <Form className="mt-7 w-full">
                    <div className="md:px-10 px-4 w-full h-[520px] modalheight scroll overflow-y-auto">
                      <div className="flex flex-col items-center gap-3">
                        <label htmlFor="fileInput" className="cursor-pointer">
                          <div className="w-24 h-24 rounded-full border flex items-center justify-center overflow-hidden">
                            {image ? (
                              <img
                                src={image}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={PlaceholderImg}
                                className="w-[100px] h-[100px] object-cover"
                                alt=""
                              />
                            )}
                          </div>
                        </label>

                        <input
                          type="file"
                          id="fileInput"
                          className="hidden"
                          accept=".jpg, .jpeg, .png"
                          onChange={handleImageChange}
                        />
                        <label
                          htmlFor="fileInput"
                          className="flex items-center gap-2 text-gray-700 cursor-pointer"
                        >
                          <FiUploadCloud className="text-[#6B7280] text-base" />
                          Upload Profile Picture
                        </label>
                      </div>

                      <div className="w-full flex md:flex-row flex-col justify-between gap-3 mt-5">
                        <div className="text-start w-full">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Full Name
                          </label>
                          <Field
                            type="text"
                            name="fullName"
                            placeholder="Enter full name"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <ErrorMessage
                            name="fullName"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                        <div className="text-start w-full">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Email
                          </label>
                          <Field
                            type="email"
                            name="email"
                            readOnly
                            disabled
                            placeholder="Enter email"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>

                      <div className="w-full flex md:flex-row flex-col justify-between gap-3 mt-5">
                        <div className="text-start w-full text-sm">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Phone Number
                          </label>
                          <PhoneInput
                            country={"in"}
                            value={values.phone}
                            onChange={(value) => setFieldValue("phone", value)}
                            inputClass="w-full border  border-[#E5E7EB] px-4 py-3 rounded-lg"
                            inputStyle={{ width: "100%" }}
                            isValid={(value) => {
                              const digits = value.replace(/\D/g, "");
                              return digits.length > 5;
                            }}
                          />
                          <ErrorMessage
                            name="phone"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        <div className="w-full">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Gender
                          </label>
                          <Listbox
                            value={selectedGender}
                            onChange={(value) => {
                              setSelectedGender(value);
                              setFieldValue("gender", value.value);
                            }}
                          >
                            <div className="relative">
                              <ListboxButton className="relative w-full border border-[#D1D5DB] text-sm rounded-lg bg-white py-3 pl-3 pr-10 text-left cursor-pointer focus:outline-none">
                                <span
                                  className={`block truncate ${selectedGender.value === "" && "text-[#9CA3AF]"}`}
                                >
                                  {selectedGender.name}
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  <IoIosArrowDown
                                    className="text-xl text-[#1F1F1F]"
                                    aria-hidden="true"
                                  />
                                </span>
                              </ListboxButton>
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <ListboxOptions className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 py-1 text-sm ring-1 ring-black ring-opacity-5 focus:outline-none">
                                  {genderOptions.map((item, index) => (
                                    <ListboxOption
                                      key={index}
                                      value={item}
                                      className="cursor-pointer py-2 px-5 border-b last:border-none border-[#E9E9E9]"
                                    >
                                      <span className="block text-[#1F1F1F] font-normal md:text-sm text-xs truncate">
                                        {item.name}
                                      </span>
                                    </ListboxOption>
                                  ))}
                                </ListboxOptions>
                              </Transition>
                            </div>
                          </Listbox>
                          <ErrorMessage
                            name="gender"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>

                      <div className="w-full flex md:flex-row flex-col justify-between gap-3 mt-5">
                        <div className="text-start w-full">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Date of Birth
                          </label>
                          <div className="div" ref={pickerRef}>
                            <div className="relative w-full">
                              <DatePicker
                                ref={pickerInstanceRef}
                                value={dob}
                                onChange={(val) => {
                                  setDob(val);
                                  setFieldValue(
                                    "dob",
                                    val?.format("YYYY-MM-DD")
                                  );
                                }}
                                format="YYYY-MM-DD"
                                editable={false}
                                placeholder="Select Date"
                                className="w-full  border text-sm border-[#E5E7EB] p-2 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                                inputClass="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                                hideOnScroll={true}
                                maxDate={new Date()}
                                containerStyle={{
                                  position: "relative"
                                }}
                                style={{
                                  zIndex: 100
                                }}
                                calendarPosition="top-center"
                              />

                              <div
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                onClick={() =>
                                  pickerInstanceRef.current.openCalendar()
                                }
                              >
                                <img
                                  src={datePickerIcon}
                                  className="w-5 h-5"
                                  alt="Calendar Icon"
                                />
                              </div>
                            </div>
                            <ErrorMessage
                              name="dob"
                              component="div"
                              className="text-red-500 text-xs mt-1"
                            />
                          </div>
                        </div>
                        <div className="text-start w-full">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Qualification
                          </label>
                          <Field
                            type="text"
                            name="qualification"
                            placeholder="Enter qualification"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <ErrorMessage
                            name="qualification"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>

                      <div className="w-full flex md:flex-row flex-col justify-between gap-3 mt-5">
                        <div className="text-start w-full">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Designation
                          </label>
                          <Field
                            type="text"
                            name="designation"
                            placeholder="Enter designation"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <ErrorMessage
                            name="designation"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                        <div className="text-start w-full">
                          <label className="block text-[#4B5563] font-normal text-sm mb-2">
                            Experience
                          </label>
                          <Field
                            type="text"
                            name="experience"
                            placeholder="Enter experience"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <ErrorMessage
                            name="experience"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 md:px-8 px-4 flex justify-between md:w-[500px] mx-auto w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setEditInformationModal(false)}
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
        open={editAccountModal}
        onClose={() => setEditAccountModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-lg text-base font-semibold text-[#293FE3]">
                  Update Principal Account Information
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setEditAccountModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <Formik
                initialValues={initial}
                validationSchema={validation}
                onSubmit={handleSubmitAccount}
              >
                {() => (
                  <Form className="mt-7">
                    <div className="px-2">
                      <div className="mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={principalData?.email}
                          readOnly
                          disabled
                          className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg disabled:text-[#6B7280] focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                      </div>

                      <div className="mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Field
                            name="newPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <AiOutlineEye className="text-xl" />
                            ) : (
                              <AiOutlineEyeInvisible className="text-xl" />
                            )}
                          </button>
                        </div>
                        <ErrorMessage
                          name="newPassword"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      {/* Confirm Password */}
                      <div className="mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Field
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Enter confirm password"
                            className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <AiOutlineEye className="text-xl" />
                            ) : (
                              <AiOutlineEyeInvisible className="text-xl" />
                            )}
                          </button>
                        </div>
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex justify-between w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setEditAccountModal(false)}
                        className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={btnLoader}
                        type="submit"
                        className="bg-[#293FE3] text-white font-medium text-sm w-full h-12 rounded-lg"
                      >
                        {btnLoader ? <DotLoader color="#fff" /> : "Update"}
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
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start md:my-3 my-0">
                <h1 className="md:text-lg text-base mr-2 font-semibold text-[#1F1F1F]">
                  Principal Account Deletion Confirmation
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setDeleteModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <div className="mt-5">
                <div className="w-full flex items-center justify-center">
                  <img
                    src={DeleteModalIcon}
                    className="w-[104px] h-[104px]"
                    alt=""
                  />
                </div>
                <div className="w-full mt-5 text-center">
                  <h4 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
                    Are you sure you want to delete this account?
                  </h4>
                  <p className="text-[#4B5563] font-normal md:text-base text-sm">
                    This decision is final and cannot be undone. Please provide
                    a reason and confirm to continue.
                  </p>
                </div>

                <Textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-xl p-3 mt-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#c4c4c4]"
                  placeholder="Enter reason"
                  value={deleteReason}
                  onChange={(e) => {
                    setDeleteReason(e.target.value);
                    setDeleteReasonError("");
                  }}
                />
                {deleteReasonError && (
                  <p className="text-red-500 text-start text-xs">
                    {deleteReasonError}
                  </p>
                )}
              </div>
              <div className="mt-5 flex justify-between w-full mb-3">
                <button
                  type="button"
                  onClick={() => setDeleteModal(false)}
                  className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                >
                  Cancel
                </button>
                <button
                  disabled={btnLoader}
                  type="submit"
                  className="bg-[#FF7373] text-white font-medium text-sm w-full h-12 rounded-lg"
                  onClick={handleDelete}
                >
                  {btnLoader ? (
                    <DotLoader color="#fff" />
                  ) : (
                    "Yes, Delete Account"
                  )}
                </button>
              </div>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog open={blockModal} onClose={() => setBlockModal(false)} size="lg">
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description>
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start md:my-3 my-0">
                <h1 className="md:text-lg text-base mr-2 font-semibold text-[#1F1F1F]">
                  {principalData?.is_blocked
                    ? "Restore Access for Principal"
                    : "Restrict Access for Principal"}
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setBlockModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
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
                    {principalData?.is_blocked ? "Unblock" : "Block"} this
                    Principal?
                  </h4>
                  <p className="text-[#4B5563] font-normal md:text-base text-sm">
                    This action will{" "}
                    {principalData?.is_blocked
                      ? "restore the Principal's access."
                      : "restrict the Principal's access."}{" "}
                    You can {principalData?.is_blocked ? "block" : "unblock"}{" "}
                    again later if needed. Please confirm to proceed.
                  </p>

                  {!principalData?.is_blocked && (
                    <>
                      <Textarea
                        rows={4}
                        className="w-full border border-gray-300 rounded-xl p-3 mt-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#c4c4c4]"
                        placeholder="Enter reason"
                        value={blockReason}
                        onChange={(e) => {
                          setBlockReason(e.target.value);
                          setReasonError("");
                        }}
                      />
                      {reasonError && (
                        <p className="text-red-500 text-start text-xs">
                          {reasonError}
                        </p>
                      )}
                    </>
                  )}
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
                    disabled={btnLoader}
                    type="submit"
                    onClick={handleBlock}
                    className="bg-[#FF7373] text-white font-medium text-sm w-full h-12 rounded-lg"
                  >
                    {btnLoader ? (
                      <DotLoader color="#fff" />
                    ) : (
                      `Yes, ${principalData?.is_blocked ? "Unblock" : "Block"}`
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
