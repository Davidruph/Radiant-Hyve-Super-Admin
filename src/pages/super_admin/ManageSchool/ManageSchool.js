import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import documentIcon from "../../../assets/icons/note.png";
import DeleteIcon from "../../../assets/icons/trash.png";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import {
  addSchoolApi,
  deleteSchoolApi,
  getSchoolListApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { DotLoader, OvalLoader } from "../../../base-component/Loader/Loader";
import * as Yup from "yup";
import { useFormik } from "formik";
import DeleteModalIcon from "../../../assets/icons/DeleteIcon(1).png";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { Textarea } from "@headlessui/react";

export default function ManageSchoolPage() {
  const [isModalOpens, setIsModalOpens] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [nodata, setNodata] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const [schoolData, setSchoolData] = useState([]);
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState(false);
  const [id, setId] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteReasonError, setDeleteReasonError] = useState("");

  const validationSchema = Yup.object({
    schoolName: Yup.string().required("School name is required"),
    address: Yup.string().required("School address is required"),
    adminEmail: Yup.string()
      .email("Invalid email")
      .required("Email is required"),
    latitude: Yup.number()
      .typeError("Latitude must be a number")
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .required("Latitude is required"),
    longitude: Yup.number()
      .typeError("Longitude must be a number")
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .required("Longitude is required")
  });

  const handlePageChange = (page) => {
    setPageNo(page);
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
              : "text-gray-600 border border-[#F0F1F2] px-3 rounded-full py-1.5 mr-2"
          }
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const handleGetSchoolList = () => {
    setNodata(true);

    let param = {
      page: pageNo
    };

    getSchoolListApi(param)
      .then((res) => {
        const data = res?.data?.data;
        const total_page = res.data.totalPage;
        if (res.status == 200) {
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

  const formik = useFormik({
    initialValues: {
      schoolName: "",
      address: "",
      adminEmail: "",
      longitude: "",
      latitude: ""
    },
    validationSchema,
    onSubmit: (values) => {
      setBtnLoader(true);

      const param = {
        name: values?.schoolName,
        email: values?.adminEmail,
        longitude: values?.longitude,
        latitude: values?.latitude,
        address: values?.address
      };

      console.log(param);

      // addSchoolApi(param)
      //   .then((res) => {
      //     if (res.status === 201) {
      //       setIsModalOpens(false);
      //       handleGetSchoolList()
      //     }
      //     setBtnLoader(false);
      //   })
      //   .catch((err) => {
      //     const errs = err?.response?.data;
      //     setBtnLoader(false);

      //     if (err.response.status === 401) {
      //       toast.error(errs?.errors?.[0]?.msg || errs?.message);
      //       localStorage.removeItem("device_Id")
      //       localStorage.removeItem("radient-admin-token")
      //       localStorage.removeItem("refresh_token")
      //       navigate("/super_admin/login");
      //     } else {
      //       toast.error(errs?.errors?.[0]?.msg || errs?.message);
      //     }
      //   });
    }
  });

  const handleDelete = () => {
    if (!deleteReason.trim()) {
      setDeleteReasonError("Reason is required to delete the account.");
      return;
    }

    setBtnLoader(true);
    deleteSchoolApi(id, deleteReason)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          navigate("/super_admin/manage_school");
        }
        setDeleteModal(false);
        handleGetSchoolList();
        setBtnLoader(false);
        setDeleteReason("");
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem("device_Id");
          localStorage.removeItem("radient-admin-token");
          localStorage.removeItem("refresh_token");
          navigate("/super_admin");
        } else {
          toast.error("Error fetching data:", err);
        }
        setBtnLoader(false);
      });
  };

  const customGoogleplaceStyles = (hasError) => ({
    control: (provided) => ({
      ...provided,
      border: `1px solid ${hasError ? "#EF4444" : "#E5E7EB"}`,
      borderRadius: "10px",
      padding: "4px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "none"
      },
      minHeight: "52px",
      width: "100%",
      textAlign: "start",
      fontSize: "14px"
    }),
    input: (provided) => ({
      ...provided,
      color: "#333",
      width: "100%",
      fontSize: "14px",
      textAlign: "start"
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#888",
      textAlign: "start",
      fontSize: "14px"
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "4px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#f1f1f1" : "white",
      color: "#333",
      padding: "10px 15px",
      cursor: "pointer",
      textAlign: "start",
      fontSize: "14px"
    })
  });

  const handleLatLog = (value) => {
    if (value) {
      formik.setFieldValue("address", value.label || "");

      const placeId = value.value.place_id;
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );

      service.getDetails({ placeId }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          formik.setFieldValue("longitude", lng);
          formik.setFieldValue("latitude", lat);
        } else {
          console.error("Error fetching place details:", status);
        }
      });
    } else {
      formik.setFieldValue("address", "");
      formik.setFieldValue("longitude", "");
      formik.setFieldValue("latitude", "");
    }
  };

  return (
    <div>
      <div className="flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-2 sy justify-between">
        <h2 className="text-[#1F1F1F] font-semibold md:text-xl text-lg">
          School list
        </h2>
        <button
          className="flex items-center self-end justify-center space-x-1 py-3 px-5 bg-[#293FE3] rounded-xl"
          onClick={() => {
            formik.resetForm();
            setIsModalOpens(true);
          }}
        >
          <FiPlus className="text-white text-2xl" />
          <span className="text-white text-sm font-medium">Add School</span>
        </button>
      </div>

      {nodata ? (
        <OvalLoader />
      ) : (
        <>
          <div className="bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg col-span-12 mt-5">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F8FAFB] border-b">
                  <tr>
                    {["schoolId", "schoolName", "schoolAddress"].map((col) => (
                      <th
                        key={col}
                        className="p-3 text-left text-[#3B4045] select-none font-medium cursor-pointer text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group"
                      >
                        {col.replace(/([A-Z])/g, " $1").trim()}
                      </th>
                    ))}
                    <th className="p-3 text-center text-[#3B4045] font-medium text-sm whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schoolData?.map((school, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="min-w-[80px] px-4 py-2 border-b text-[#1F1F1F]">
                        {school?.id}
                      </td>

                      <td className="min-w-[200px] max-w-[300px] px-4 py-2 border-b text-[#1F1F1F]">
                        <div className="truncate">{school?.school_name}</div>
                      </td>

                      <td className="min-w-[200px] max-w-[300px] px-4 py-2 border-b text-[#1F1F1F]">
                        <div className="truncate">{school?.address}</div>
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
                                className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 border-b border-[#E9E9E9] hover:bg-gray-100"
                                onClick={() =>
                                  navigate(
                                    `/super_admin/manage_school/school_details/${school.id}`
                                  )
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
                              <DropdownMenu.Item
                                onClick={() => {
                                  setId(school.id);
                                  setDeleteModal(true);
                                }}
                                className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-3 border-b border-[#E9E9E9] hover:bg-gray-100"
                              >
                                <img
                                  src={DeleteIcon}
                                  className="w-[24px] h-[24px]"
                                  alt=""
                                />
                                <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
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
      )}

      <Dialog
        open={isModalOpens}
        onClose={() => setIsModalOpens(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 md:py-4 p-4">
              <div className="w-full relative text-center my-3">
                <h1 className="md:text-lg text-base font-semibold text-[#274372]">
                  School Information
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setIsModalOpens(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <form onSubmit={formik.handleSubmit} className="mt-7">
                <div className="md:h-full h-[400px] popupheight overflow-y-auto px-2">
                  <div className="mb-6">
                    <h3 className="text-[#1F1F1F] font-medium text-base mb-4">
                      School Details
                    </h3>

                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        School Name
                      </label>
                      <input
                        type="text"
                        name="schoolName"
                        placeholder="Enter school name"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.schoolName}
                        className={`w-full border text-sm px-4 py-3 rounded-lg focus:ring-2 focus:outline-none ${
                          formik.touched.schoolName && formik.errors.schoolName
                            ? "border-red-500 focus:ring-red-300"
                            : "border-[#E5E7EB] focus:ring-gray-400"
                        }`}
                      />
                      {formik.touched.schoolName &&
                        formik.errors.schoolName && (
                          <p className="text-red-500 text-xs mt-1">
                            {formik.errors.schoolName}
                          </p>
                        )}
                    </div>

                    {/* <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        School Address
                      </label>
                      <textarea
                        name="schoolAddress"
                        placeholder="Enter address"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.schoolAddress}
                        className={`w-full border text-sm px-4 py-3 md:h-[130px] h-[100px] rounded-lg focus:ring-2 focus:outline-none ${formik.touched.schoolAddress && formik.errors.schoolAddress
                          ? "border-red-500 focus:ring-red-300"
                          : "border-[#E5E7EB] focus:ring-gray-400"
                          }`}
                      />
                      {formik.touched.schoolAddress && formik.errors.schoolAddress && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.schoolAddress}</p>
                      )}
                    </div> */}

                    <div className="mb-5 text-start">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        School Address
                      </label>
                      <GooglePlacesAutocomplete
                        apiKey="AIzaSyBBLcXrmcY2pdzrI4uiyhFdOefMDZhxVc4"
                        selectProps={{
                          placeholder: "Search location",
                          isClearable: true,
                          styles: customGoogleplaceStyles(
                            formik.touched.address && formik.errors.address
                          ),
                          name: "address",
                          value: formik.values.address
                            ? {
                                label: formik.values.address,
                                value: formik.values.address
                              }
                            : null,
                          onChange: handleLatLog
                        }}
                        className="w-full text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:outline-none"
                      />
                      {formik.touched.address && formik.errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[#1F1F1F] font-medium md:text-lg text-base mb-4">
                      Admin Details
                    </h3>

                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        Admin Email
                      </label>
                      <input
                        type="email"
                        name="adminEmail"
                        placeholder="Enter admin email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.adminEmail}
                        className={`w-full border text-sm px-4 py-3 rounded-lg focus:ring-2 focus:outline-none ${
                          formik.touched.adminEmail && formik.errors.adminEmail
                            ? "border-red-500 focus:ring-red-300"
                            : "border-[#E5E7EB] focus:ring-gray-400"
                        }`}
                      />
                      {formik.touched.adminEmail &&
                        formik.errors.adminEmail && (
                          <p className="text-red-500 text-xs mt-1">
                            {formik.errors.adminEmail}
                          </p>
                        )}
                    </div>

                    {/* <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal text-sm mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter password"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.password}
                          className={`w-full border text-sm px-4 py-3 rounded-lg focus:ring-2 focus:outline-none ${formik.touched.password && formik.errors.password
                            ? "border-red-500 focus:ring-red-300"
                            : "border-[#E5E7EB] focus:ring-gray-400"
                            }`}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-3 -bottom-0 flex items-center text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <AiOutlineEye className="text-gray-500 text-xl" />
                          ) : (
                            <AiOutlineEyeInvisible className="text-gray-500 text-xl" />
                          )}
                        </button>
                      </div>
                      {formik.touched.password && formik.errors.password && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
                      )}
                    </div> */}
                  </div>
                </div>

                <div className="mt-6 flex justify-between w-full">
                  <button
                    type="button"
                    onClick={() => setIsModalOpens(false)}
                    className="bg-[#DFE3EA] w-full h-12 font-medium text-sm text-[#6B7280] rounded-lg mr-5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={btnLoader}
                    className="bg-[#293FE3] text-white font-medium text-sm w-full h-12 rounded-lg flex items-center justify-center"
                  >
                    {btnLoader ? <DotLoader color="#fff" /> : "Save"}
                  </button>
                </div>
              </form>
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
                <h1 className="md:text-xl text-lg mr-2 font-semibold text-[#274372]">
                  Delete School Account Permanently
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setDeleteModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <div className="mt-7">
                <div className="w-full flex items-center justify-center">
                  <img
                    src={DeleteModalIcon}
                    className="w-[104px] h-[104px]"
                    alt=""
                  />
                </div>
                <div className="w-full mt-5 text-center">
                  <h4 className="text-[#1F1F1F] font-semibold text-lg mb-4">
                    Are you sure you want to delete an account?
                  </h4>
                  <p className="text-[#4B5563] font-normal text-base">
                    This decision is final and cannot be undone. Please confirm
                    to continue.
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
                    onClick={() => handleDelete()}
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
    </div>
  );
}
