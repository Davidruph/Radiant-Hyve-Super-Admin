import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BackIcon from "../../../assets/icons/BackIcon.png";
import editIcon from "../../../assets/icons/edit.png";
import deleteIcon from "../../../assets/icons/trash.png";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoMdClose } from "react-icons/io";
import Select from "react-select";
import DeleteModalIcon from "../../../assets/icons/DeleteIcon(1).png";
import {
  deleteCertificationApi,
  editCertification,
  getCertificationDetailsApi,
  getTeacherListApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { DotLoader } from "../../../base-component/Loader/Loader";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";

const CertificationDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [editCertificationModal, setEditCertificationModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [certificateDet, setCertificateDet] = useState(null);
  const { id } = useParams();
  const [Loader, setLoader] = useState(false);
  const [btnLoader, setBtnLoader] = useState(false);
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    if (location.state?.editCertificationModal) {
      setEditCertificationModal(true);
    }
    if (location.state?.deleteModal) {
      setDeleteModal(true);
    }

    if (location.state) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

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

  const certificationDetail = () => {
    setLoader(true);
    let obj = {
      certificate_id: id
    };
    getCertificationDetailsApi(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const data = res?.data?.data;
          console.log("data>", data);
          setCertificateDet({
            staffName: {
              label: data.staff_name,
              value: data.staff_id,
              profile_pic: data.profile_pic
            },
            institutionName: data.institution_name,
            checklist: {
              label: data.hire_checklist,
              value: data.hire_checklist
            }
          });
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
            navigate("/school_admin/certification");
          }
        }
        setLoader(false);
      });
  };

  useEffect(() => {
    certificationDetail();
  }, [id]);

  const certificationDetails = [
    {
      title: "Staff Name",
      staffData: certificateDet?.staffName?.label
    },
    {
      title: "Institution Name",
      staffData: certificateDet?.institutionName
    },
    {
      title: "Hire Checklist",
      staffData: certificateDet?.checklist?.value
    }
  ];

  const handleDelete = () => {
    setBtnLoader(true);
    deleteCertificationApi(id)
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data.message;
          toast.success(data);
          navigate("/school_admin/certification");
        }
        setDeleteModal(false);
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

  const options = shifts.map((item) => ({
    label: item.full_name,
    value: item.id,
    profile_pic: item.profile_pic
  }));

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

  const validationSchema = Yup.object().shape({
    staffName: Yup.object()
      .shape({
        label: Yup.string().required("Label is required"),
        value: Yup.string().required("Value is required")
      })
      .nullable()
      .required("Staff name is required"),

    institutionName: Yup.string().required("Institution name is required"),

    checklist: Yup.object()
      .shape({
        label: Yup.string().required("Label is required"),
        value: Yup.string().required("Value is required")
      })
      .nullable()
      .required("Checklist is required")
  });

  const initialValues = {
    staffName: certificateDet?.staffName || null,
    institutionName: certificateDet?.institutionName || "",
    checklist: certificateDet?.checklist || null
  };

  const handleSubmit = (values) => {
    setBtnLoader(true);

    let obj = {
      certificate_id: id,
      staff_id: values?.staffName?.value,
      institution_name: values?.institutionName,
      hire_checklist: values?.checklist?.value
    };

    editCertification(obj)
      .then((res) => {
        const message = res.data.message;
        if (res.data.status === 1) {
          const datas = res?.data?.data;
          certificationDetail();
          toast.success(message);
          setEditCertificationModal(false);
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
    <>
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
        <div className="bg-[#FFFFFF] 2xl:w-[768px] xl:w-[700px] md:w-[650px] w-full sm:p-5 p-4 rounded-lg">
          <div className="sm:flex items-center justify-between ">
            <h3 className="text-xl font-semibold ">Certification Details</h3>
            <div className="flex items-center gap-5 sm:mt-0 mt-4">
              <button
                className="bg-[#FFF7E7] flex items-center justify-center gap-2 py-1.5 sm:w-[132px] w-28 h-9 rounded-lg"
                onClick={() => setEditCertificationModal(true)}
              >
                <img src={editIcon} alt="..." className="w-[22px]" />
                <p className="text-[#4B5563] text-sm">Edit</p>
              </button>
              <button
                className="bg-[#FFDED8] flex items-center justify-center gap-2 py-1.5 sm:w-[132px] w-28 h-9 rounded-lg"
                onClick={() => setDeleteModal(true)}
              >
                <img src={deleteIcon} alt="..." className="w-[22px]" />
                <p className="text-[#4B5563] text-sm">Delete</p>
              </button>
            </div>
          </div>
          <div className="mt-4 mb-6 border-b border-[#F3F4F6]"></div>
          {certificationDetails &&
            certificationDetails?.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between ${index < 4 ? "mb-5" : ""}`}
              >
                <h4 className="text-sm text-[#4B5563]">{item?.title}</h4>
                <p className="sm:text-base text-sm text-[#1F1F1F] sm:w-auto w-40 truncate">
                  {item?.staffData}
                </p>
              </div>
            ))}
        </div>
      </div>

      <Dialog
        open={editCertificationModal}
        onClose={() => setEditCertificationModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-xl text-lg font-semibold text-[#1F1F1F]">
                  Edit Certification
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setEditCertificationModal(false)}
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

                    <div className="mt-10 flex justify-between md:w-[500px] w-full mb-3">
                      <button
                        type="button"
                        onClick={() => setEditCertificationModal(false)}
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
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start md:my-3 my-0">
                <h1 className="md:text-xl text-lg mr-2 font-semibold text-[#1F1F1F]">
                  Delete Certification
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setDeleteModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <div className="mt-7">
                <div className="px-2">
                  <div className="w-full flex items-center justify-center">
                    <img
                      src={DeleteModalIcon}
                      className="w-[104px] h-[104px]"
                      alt=""
                    />
                  </div>
                  <div className="w-full mt-5 text-center">
                    <h4 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
                      Are you sure you want to delete these certifications?
                    </h4>
                  </div>
                </div>
                <div className="mt-10 flex justify-between w-full mb-3">
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
    </>
  );
};

export default CertificationDetails;
