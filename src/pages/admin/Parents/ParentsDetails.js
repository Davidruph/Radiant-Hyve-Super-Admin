import { Fragment, useEffect, useState } from "react";
import BackIcon from "../../../assets/icons/BackIcon.png";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PlaceholderImg from "../../../assets/images/placeholderImg.png";
import EditIcon from "../../../assets/icons/edit.png";
import DeleteIcon from "../../../assets/icons/trash.png";
import BlockIcon from "../../../assets/icons/block.png";
import Dialog from "../../../base-component/Dialog/Dialog";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Textarea,
  Transition
} from "@headlessui/react";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import { PhoneInput } from "react-international-phone";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import DeleteModalIcon from "../../../assets/icons/DeleteIcon(1).png";
import blockModalIcon from "../../../assets/icons/BlockIcon.png";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import documentIcon from "../../../assets/icons/document-text.png";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { FiUploadCloud } from "react-icons/fi";
import {
  BlockParentApi,
  changePasswordParentApi,
  deleteParentApi,
  editParentsApi,
  getParentsDetailsApi,
  getParentsStudentsApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { DotLoader } from "../../../base-component/Loader/Loader";
import { CgUnblock } from "react-icons/cg";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import noData from "../../../assets/Svg/Data extraction-amico 1.svg";

const genderOptions = [
  { value: "", name: "Select gender" },
  { value: "male", name: "Male" },
  { value: "female", name: "Female" }
];

export default function ParentsDetails() {
  const { id } = useParams();
  const [editInformationModal, setEditInformationModal] = useState(false);
  const [editAccountModal, setEditAccountModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [blockModal, setBlockModal] = useState(false);
  const [img, setImg] = useState("");
  const [image, setImage] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState("");
  const [selectedGender, setSelectedGender] = useState(genderOptions[1]);
  const location = useLocation();
  const [Loader, setLoader] = useState(false);
  const [parentsData, setParentsData] = useState({});
  const [btnLoader, setBtnLoader] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [parentStudentList, setParentStudentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteReasonError, setDeleteReasonError] = useState("");

  const accountDetails = {
    email: parentsData?.email,
    password: "Test@123"
  };

  const handleImageChange = (e) => {
    setImg(e.target.files[0]);
    let profileImage = URL.createObjectURL(e.target.files[0]);
    setImage(profileImage);
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

  const parentsDetails = () => {
    setLoader(true);
    let obj = {
      parent_id: id
    };
    getParentsDetailsApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setParentsData(datas);
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
          if (errs.status === 2) {
            navigate("/school_admin/parents");
          }
        }
        setLoader(false);
      });
  };

  const getParentsStudentsList = () => {
    setLoading(true);
    let obj = {
      parent_id: id,
      page: pageNo
    };
    getParentsStudentsApi(obj)
      .then((res) => {
        const total = res.data.totalPage;

        if (res.data.status === 1) {
          const datas = res?.data?.data;
          setParentStudentList(datas);
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
    getParentsStudentsList();
  }, [id, pageNo]);

  useEffect(() => {
    parentsDetails();
  }, [id]);

  const handleDelete = () => {
    if (!deleteReason.trim()) {
      setDeleteReasonError("Reason is required to delete the account.");
      return;
    }

    setBtnLoader(true);
    deleteParentApi(id, deleteReason)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          navigate("/school_admin/parents");
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
    if (!parentsData?.is_blocked && !blockReason.trim()) {
      setReasonError("Reason is required to block the parent.");
      return;
    }

    setBtnLoader(true);

    let obj = {
      parent_id: id,
      block_reason: blockReason
    };

    BlockParentApi(obj)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          parentsDetails();
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
      .max(20, "Password must be at most 20 characters")
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
      parent_id: id,
      password: values?.newPassword
    };

    changePasswordParentApi(obj)
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

  const handleEditData = () => {
    if (parentsData) {
      const newSelected =
        genderOptions.find(
          (option) => option.value === (parentsData.gender || "")
        ) || genderOptions[0];
      setSelectedGender(newSelected);
      setImage(parentsData.profile_pic || "");
    }
    setEditInformationModal(true);
    setBtnLoader(false);
  };

  const initialValues = {
    fullName: parentsData?.full_name || "",
    email: parentsData?.email || "",
    gender: parentsData?.gender || "",
    phone: parentsData?.mobile_no
      ? `+${parentsData.country_code}${parentsData.mobile_no}`
      : "",
    address: parentsData?.address || ""
  };

  const validationSchema = Yup.object({
    fullName: Yup.string()
      .required("Full name is required")
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be at most 50 characters"),
    phone: Yup.string()
      .required("Phone number is required")
      .test("is-valid-phone", "Enter a valid phone number", (value) => {
        return value && value.replace(/\D/g, "").length > 5;
      }),
    gender: Yup.string().required("Gender is required"),
    address: Yup.string()
      .required("Address is required")
      .min(5, "Address must be at least 5 characters")
      .max(100, "Address must be at most 100 characters")
  });

  const handleSubmit = (values) => {
    setBtnLoader(true);

    if (!image) {
      setBtnLoader(false);
      toast.error("Please upload a profile picture.");
      return;
    }

    const parsedPhone = parsePhoneNumberFromString(values?.phone);
    const formData = new FormData();
    formData.append("parent_id", id);
    formData.append("full_name", values?.fullName);
    formData.append("email", values?.email);
    formData.append("mobile_no", parsedPhone.nationalNumber);
    formData.append("country_code", `+${parsedPhone.countryCallingCode}`);
    formData.append("iso_code", parsedPhone.country || "in");
    formData.append("gender", values?.gender);
    formData.append("address", values?.address);

    if (img) {
      formData.append("profile_pic", img);
    }

    editParentsApi(formData)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          parentsDetails();
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
        <div className="lg:col-span-4 col-span-12 bg-white max-h-[282px] rounded-lg p-5">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center justify-center h-full">
              {Loader ? (
                <Skeleton circle width={138} height={138} />
              ) : (
                <img
                  src={parentsData?.profile_pic || PlaceholderImg}
                  className="object-cover rounded-full w-[138px] h-[138px]"
                  alt="Principal Profile"
                />
              )}

              <h3 className="text-[#0F1113] font-medium w-64 truncate text-center text-sm mt-4">
                {Loader ? (
                  <Skeleton height={24} width={100} />
                ) : (
                  parentsData?.full_name
                )}
              </h3>

              <h3 className="text-[#0F1113] font-medium text-sm mt-2">
                {Loader ? (
                  <Skeleton height={24} width={100} />
                ) : (
                  `Parents Id : ${parentsData?.id}`
                )}
              </h3>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 col-span-12 bg-white rounded-lg p-5">
          <div className="flex xl:flex-row lg:flex-col md:flex-row flex-col gap-5 items-center justify-between">
            <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
              Parents Information
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
              {parentsData?.is_blocked === false ? (
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
              { label: "Full Name", value: parentsData?.full_name },
              {
                label: "Phone Number",
                value: `${parentsData?.country_code} ${parentsData?.mobile_no}`
              },
              { label: "Gender", value: parentsData?.gender },
              { label: "Address", value: parentsData?.address || "-" }
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
              Parents Account Details
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
          Student List
        </h3>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12">
          <div className="bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
            {loading ? (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8FAFB]">
                    <tr>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                        Student Id
                      </th>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                        Student Name
                      </th>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                        Parents Name
                      </th>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                        Home Phone Number
                      </th>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                        Relation
                      </th>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                        Frequency Attendance
                      </th>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                        Student Status
                      </th>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(10)].map((_, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {[80, 120, 120, 120, 120, 120, 120, 40].map(
                          (width, i) => (
                            <td key={i} className="px-4 py-4">
                              <Skeleton width={width} height={20} />
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : parentStudentList.length > 0 ? (
              <>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F8FAFB]">
                      <tr>
                        <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                          Student Id
                        </th>
                        <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                          Student Name
                        </th>
                        <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                          Parents Name
                        </th>
                        <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                          Home Phone Number
                        </th>
                        <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                          Relation
                        </th>
                        <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                          Frequency Attendance
                        </th>
                        <th className="p-4 text-left text-[#3B4045] font-medium text-sm">
                          Student Status
                        </th>
                        <th className="p-4 text-center text-[#3B4045] font-medium text-sm ">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parentStudentList.map((Item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border-b px-4 py-2">{Item?.id}</td>
                          <td className="border-b px-4 py-2">
                            {Item?.full_name}
                          </td>
                          <td className="border-b px-4 py-2">
                            {Item?.parent_name}
                          </td>
                          <td className="border-b px-4 py-2">
                            {Item?.mobile_no}
                          </td>
                          <td className="border-b px-4 py-2">
                            {Item?.relation_to_child}
                          </td>
                          <td className="border-b px-4 py-2">
                            {Item?.shift_name}
                          </td>
                          <td
                            className={`border-b px-4 py-2 ${
                              Item?.request_status === "pending"
                                ? "text-yellow-600"
                                : Item?.request_status === "accepted"
                                  ? "text-green-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {Item?.request_status}
                          </td>

                          <td className="border-b border-[#E5E7EB] px-4 py-2 text-center flex justify-center">
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
                                    onClick={() =>
                                      navigate(
                                        `/school_admin/student_details/${Item?.id}`
                                      )
                                    }
                                    className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 hover:bg-gray-100"
                                  >
                                    <img
                                      src={documentIcon}
                                      className="w-[24px] h-[24px]"
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

                <div className="mt-5 flex w-full justify-center">
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
                <h1 className="md:text-xl text-lg font-semibold text-[#274372]">
                  Parents Information
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
                    <div className="md:px-10 px-4 w-full h-[500px] modalheight scroll overflow-y-auto">
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
                          className="text-sm flex items-center gap-2 text-gray-700 cursor-pointer"
                        >
                          <FiUploadCloud className="text-[#6B7280]" />
                          Upload Profile Picture
                        </label>
                      </div>

                      {/* Inputs */}
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

                      <div className="w-full mt-5">
                        <label className="block text-sm text-[#4B5563] mb-2">
                          Address
                        </label>
                        <Field
                          name="address"
                          type="text"
                          placeholder="Enter address"
                          className="w-full border border-[#E5E7EB] text-sm px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                        <ErrorMessage
                          name="address"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <div className="mt-7 md:px-8 px-4 flex justify-between md:w-[500px] mx-auto w-full mb-3">
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
                          className="bg-[#9810FA] text-white font-medium text-sm w-full h-12 rounded-lg"
                        >
                          {btnLoader ? <DotLoader color="#fff" /> : " Save"}
                        </button>
                      </div>
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
                <h1 className="md:text-lg text-base font-semibold text-[#9810FA]">
                  Update Parent Account Information
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
                      {/* Email - ReadOnly */}
                      <div className="mb-4 text-start">
                        <label className="block text-[#4B5563] font-normal text-sm mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={parentsData?.email}
                          readOnly
                          disabled
                          className="w-full border text-sm border-[#E5E7EB] px-4 py-3 rounded-lg disabled:text-[#6B7280] focus:ring-2 focus:ring-gray-400 focus:outline-none"
                        />
                      </div>

                      {/* New Password */}
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
                        className="bg-[#9810FA] text-white font-medium text-sm w-full h-12 rounded-lg"
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
          <Dialog.Description>
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start md:my-3 my-0">
                <h1 className="md:text-lg text-base mr-2 font-semibold text-[#1F1F1F]">
                  Parent Account Deletion Confirmation
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setDeleteModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>

              <div className="mt-7 px-2">
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
                  {parentsData?.is_blocked
                    ? "Restore Access for Parent"
                    : "Restrict Access for Parent"}
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setBlockModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>

              <div className="mt-7 px-2">
                <div className="w-full flex items-center justify-center">
                  <img
                    src={blockModalIcon}
                    className="w-[104px] h-[104px]"
                    alt=""
                  />
                </div>

                <div className="w-full mt-5 text-center">
                  <h4 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
                    Are you sure you want to{" "}
                    {parentsData?.is_blocked ? "Unblock" : "Block"} this Parent?
                  </h4>
                  <p className="text-[#4B5563] font-normal md:text-base text-sm">
                    {parentsData?.is_blocked
                      ? "This will restore the parent's access. You can block again later if needed."
                      : "This action will restrict the parent's access. You can unblock it later if needed. Please confirm to proceed."}
                  </p>

                  {!parentsData?.is_blocked && (
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
                    className="bg-[#FF7373] text-white font-medium text-sm w-full h-12 rounded-lg"
                    onClick={handleBlock}
                  >
                    {btnLoader ? (
                      <DotLoader color="#fff" />
                    ) : (
                      `Yes, ${parentsData?.is_blocked ? "Unblock" : "Block"}`
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
