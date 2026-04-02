import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import documentIcon from "../../../assets/icons/document-text.png";
import documentIcon2 from "../../../assets/icons/Downloaddocument.png";
import { SubscriptionTable } from "../../../data/Data";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import Pagination from "../../../base-component/Pagination/Pagination";
import { GrNext, GrPrevious } from "react-icons/gr";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoMdClose } from "react-icons/io";
import { Field, Select } from "@headlessui/react";
import { FaCaretUp, FaChevronDown, FaSort, FaSortDown } from "react-icons/fa";
import clsx from "clsx";
import { TbHttpDelete } from "react-icons/tb";
import {
  createSubscriptionApi,
  getSubscriptionApi,
  updateSubscriptionApi
} from "../../../services/api_services";
import toast from "react-hot-toast";
import { DotLoader, OvalLoader } from "../../../base-component/Loader/Loader";
import { useNavigate } from "react-router-dom";

export default function SubscriptionService() {
  const [detailsModal, setDetailsModal] = useState(false);
  const [addSubscriptionModal, setAddSubscriptionModal] = useState(false);
  const [editSubscriptionModal, setEditSubscriptionModal] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const rowsPerPage = 5;
  const totalRows = SubscriptionTable.length;
  const [formData, setFormData] = useState({
    packageName: "",
    serviceType: "",
    serviceFee: "",
    description: "",
    features: [""]
  });
  const [btnLoader, setBtnLoader] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [pageNo, setPageNo] = useState(1);
  const [nodata, setNodata] = useState(false);

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setFormData({
      packageName: item.package_name,
      serviceType: item.service_type,
      serviceFee: item.service_fee,
      description: item.description,
      features: item.Features?.map((f) => f.feature_name) || [""]
    });
    setEditSubscriptionModal(true);
  };

  const handleCloseEditModal = () => {
    setEditSubscriptionModal(false);
    setSelectedItem(null);
    setIsEditMode(false);
  };

  const handleGetSubscriptionList = () => {
    setNodata(true);

    let param = {
      page: pageNo
    };

    getSubscriptionApi(param)
      .then((res) => {
        const data = res?.data;
        const total_page = res.data.totalPage;
        if (res.status === 200) {
          console.log(data);
          setSubscriptionData(data);
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
    handleGetSubscriptionList();
  }, [pageNo]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.packageName.trim()) {
      newErrors.packageName = "Package name is required";
    }

    if (!formData.serviceType.trim()) {
      newErrors.serviceType = "Service type is required";
    }

    if (!formData.serviceFee || formData.serviceFee <= 0) {
      newErrors.serviceFee = "Service fee must be greater than 0";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.features.length === 0) {
      newErrors.features = "At least one feature is required";
    } else if (formData.features.some((f) => !f.trim())) {
      newErrors.features = "All feature fields must be filled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ""]
    });
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoader(true);

    if (!validateForm()) {
      setBtnLoader(false);
      return;
    }

    try {
      if (isEditMode) {
        // Edit mode - prepare data for update
        const currentFeatures = selectedItem?.Features || [];
        const newFeatures = formData.features.filter((f) => f.trim());

        // Separate features into add, modify, and remove
        const addFeatures = newFeatures.filter(
          (f) => !currentFeatures.some((cf) => cf.feature_name === f)
        );

        const modifyFeatures = [];
        for (const cf of currentFeatures) {
          const updatedFeature = newFeatures.find((f) => f === cf.feature_name);
          if (!updatedFeature) {
            // This feature was removed (will be handled by removeFeatureIds)
          } else {
            modifyFeatures.push({
              id: cf.id,
              feature_name: cf.feature_name
            });
          }
        }

        const removeFeatureIds = currentFeatures
          .filter((cf) => !newFeatures.includes(cf.feature_name))
          .map((f) => f.id);

        const updateData = {
          plan_id: selectedItem.id,
          package_name: formData.packageName,
          service_type: formData.serviceType,
          service_fee: formData.serviceFee,
          description: formData.description,
          addFeatures: addFeatures.length > 0 ? addFeatures : undefined,
          modifyFeatures:
            modifyFeatures.length > 0 ? modifyFeatures : undefined,
          removeFeatureIds:
            removeFeatureIds.length > 0 ? removeFeatureIds : undefined
        };

        console.log("Update data:", updateData);

        updateSubscriptionApi(updateData)
          .then((res) => {
            const message = res.data.message;
            if (res.data.status === 1) {
              toast.success(message);
              handleCloseEditModal();
              handleGetSubscriptionList();
            }
            setBtnLoader(false);
          })
          .catch((err) => {
            const errs = err?.response?.data;
            toast.error(errs?.message || "Error updating subscription");
            setBtnLoader(false);
          });
      } else {
        // Create mode
        const cleanedData = {
          ...formData,
          features: formData.features.filter((f) => f.trim())
        };

        console.log("Form submitted:", cleanedData);
        createSubscriptionApi(cleanedData)
          .then((res) => {
            const message = res.data.message;
            if (res.data.status === 1) {
              const datas = res?.data?.data;
              console.log(datas);

              toast.success(message);
            }
            setBtnLoader(false);
            // Reset form
            setFormData({
              packageName: "",
              serviceType: "",
              serviceFee: "",
              description: "",
              features: [""]
            });
            setErrors({});
            setAddSubscriptionModal(false);
            handleGetSubscriptionList();
          })
          .catch((err) => {
            const errs = err?.response?.data;
            toast.error(errs?.message);
            setBtnLoader(false);
          });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setBtnLoader(false);
    }
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
              : "text-gray-600 border border-[#F0F1F2] px-3 rounded-full py-1.5 mr-2"
          }
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedData = [...SubscriptionTable].sort((a, b) => {
    if (!sortColumn) return 0;

    const valueA = a[sortColumn];
    const valueB = b[sortColumn];

    if (valueA == null) return sortOrder === "asc" ? -1 : 1;
    if (valueB == null) return sortOrder === "asc" ? 1 : -1;

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    } else {
      return sortOrder === "asc"
        ? (valueA || "").toString().localeCompare((valueB || "").toString())
        : (valueB || "").toString().localeCompare((valueA || "").toString());
    }
  });

  const paginatedData = sortedData.slice(
    (pageNo - 1) * rowsPerPage,
    pageNo * rowsPerPage
  );

  return (
    <div>
      <div className="flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-2 sy justify-between">
        <h2 className="text-[#1F1F1F] font-semibold md:text-xl text-lg">
          Subscription Service
        </h2>
        <button
          className="flex items-center self-end justify-center space-x-1 py-3 px-5 bg-[#9810FA] rounded-xl"
          onClick={() => setAddSubscriptionModal(true)}
        >
          <FiPlus className="text-white text-2xl" />
          <span className="text-white md:text-base text-sm font-medium">
            Add Subscription
          </span>
        </button>
      </div>
      {nodata ? (
        <OvalLoader />
      ) : (
        <div className="grid grid-cols-12 mt-5 gap-5">
          {subscriptionData?.data?.map((item, index) => (
            <div
              key={index}
              className="xl:col-span-6 md:col-span-9 col-span-12 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow md:px-6 px-4 py-6 xl:mt-0 mt-5 border border-[#E5E7EB]"
            >
              {/* Header with Status Badge */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E5E7EB]">
                <h3 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
                  {item.package_name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Service Type */}
              <div className="mb-4">
                <h4 className="text-[#4B5563] font-semibold md:text-sm text-xs uppercase tracking-wide mb-1">
                  Service Type
                </h4>
                <span className="text-[#9810FA] font-semibold md:text-base text-sm bg-[#9810FA]/10 px-3 py-1 rounded-lg inline-block">
                  {item.service_type}
                </span>
              </div>

              {/* Service Fee */}
              <div className="mb-5">
                <h4 className="text-[#4B5563] font-semibold md:text-sm text-xs uppercase tracking-wide mb-1">
                  Service Fee
                </h4>
                <span className="text-green-600 font-bold md:text-2xl text-xl">
                  ${item.service_fee}
                </span>
                <span className="text-[#6B757D] text-xs ml-2">/month</span>
              </div>

              {/* Description */}
              <div className="mb-5 pb-4 border-b border-[#E5E7EB]">
                <h4 className="text-[#4B5563] font-semibold md:text-sm text-xs uppercase tracking-wide mb-2">
                  Description
                </h4>
                <p className="text-[#3B4045] font-medium md:text-sm text-xs leading-relaxed text-justify line-clamp-3">
                  {item.description}
                </p>
              </div>

              {/* Features */}
              <div className="mb-5">
                <h4 className="text-[#4B5563] font-semibold md:text-sm text-xs uppercase tracking-wide mb-3">
                  Features
                </h4>
                <div className="flex flex-wrap gap-2">
                  {item?.Features?.map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-[#9810FA]/5 border border-[#9810FA] text-[#9810FA] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#9810FA]/10 transition-colors"
                    >
                      ✓ {feature?.feature_name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex gap-2 pt-4 border-t border-[#E5E7EB]">
                <button
                  onClick={() => handleEditClick(item)}
                  className="flex-1 bg-[#9810FA] hover:bg-[#1e2fa8] text-white font-medium md:text-sm text-xs py-2 rounded-lg transition-colors"
                >
                  Edit Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* <div className="flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-2 sy justify-between mt-5">
        <h2 className="text-[#1F1F1F] font-semibold md:text-xl text-lg">
          Subscribed Member List
        </h2>
        <button className="flex items-center self-end justify-center space-x-1 py-3 px-5 bg-[#9810FA] rounded-xl">
          <img src={documentIcon2} alt="" className="w-[24px] h-[24px]" />
          <span className="text-white md:text-base text-sm font-medium">
            Download
          </span>
        </button>
      </div>
      <div className="bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg col-span-12 mt-5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#F8FAFB]">
              <tr>
                {[
                  "SubscriptionId",
                  "Name",
                  "Email",
                  "Amount",
                  "Plan(Day)",
                  "StartDate",
                  "EndDate"
                ].map((col) => (
                  <th
                    key={col}
                    className="p-5 text-left text-[#3B4045] select-none font-medium cursor-pointer md:text-base text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group"
                    onClick={() => handleSort(col)}
                  >
                    {col.replace(/([A-Z])/g, " $1").trim()}
                    <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {sortColumn === col ? (
                        sortOrder === "asc" ? (
                          <FaSortDown className="inline-block" />
                        ) : (
                          <FaCaretUp className="inline-block" />
                        )
                      ) : (
                        <FaSort className="inline-block text-gray-400" />
                      )}
                    </span>
                  </th>
                ))}
                <th className="p-5 text-center text-[#3B4045] font-medium md:text-base text-sm whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">
                    {item.subscriptionId}
                  </td>
                  <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">
                    {item.email}
                  </td>
                  <td className="border-b border-[#E5E7EB] text-green-500 px-4 py-2 md:text-base text-sm font-semibold whitespace-nowrap">
                    {item.amount}
                  </td>
                  <td className="border-b border-[#E5E7EB] text-[#9810FA] px-4 py-2 md:text-base text-sm font-semibold whitespace-nowrap">
                    {item.plan}
                  </td>
                  <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">
                    {item.startDate}
                  </td>
                  <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">
                    {item.endDate}
                  </td>
                  <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap text-end flex justify-center">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild className="outline-none">
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
                            onClick={() => setDetailsModal(true)}
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
          <div className="flex items-center">{renderPaginationButtons()}</div>
          <Pagination.Link
            onClick={() => handlePageChange(pageNo + 1)}
            disabled={pageNo === pageCount}
          >
            <GrNext className="text-[#1F1F1F]" />
          </Pagination.Link>
        </Pagination>
      </div> */}

      <Dialog
        open={detailsModal}
        onClose={() => setDetailsModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl pb-5">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-2xl text-lg font-semibold text-[#1F1F1F]">
                  Subscription Details
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setDetailsModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <div className="mt-7">
                <div className="px-2 space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#4B5563] font-normal md:text-base text-sm">
                      Subscribed Name
                    </h4>
                    <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                      Marvin Cooper
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#4B5563] font-normal md:text-base text-sm">
                      Email
                    </h4>
                    <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                      seano@icloud.com
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#4B5563] font-normal md:text-base text-sm">
                      Subscription Amount
                    </h4>
                    <p className="text-green-500 font-semibold md:text-base text-sm">
                      $129.00
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#4B5563] font-normal md:text-base text-sm">
                      Subscription Plan
                    </h4>
                    <span className="text-[#9810FA] font-semibold md:text-base text-sm">
                      Monthly
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#4B5563] font-normal md:text-base text-sm">
                      Subscription Id
                    </h4>
                    <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                      396350
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#4B5563] font-normal md:text-base text-sm">
                      Start Date
                    </h4>
                    <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                      24 Oct, 2024
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#4B5563] font-normal md:text-base text-sm">
                      End Date
                    </h4>
                    <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                      24 Nov, 2024
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={addSubscriptionModal}
        onClose={() => setAddSubscriptionModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl flex flex-col max-h-[80vh]">
          <Dialog.Description className="overflow-y-auto flex-1">
            <div className="md:px-8 md:py-4 p-4">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-2xl text-lg font-semibold text-[#274372]">
                  Add Subscription Package
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setAddSubscriptionModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <form className="mt-7">
                <div className="px-2">
                  <div className="mb-6">
                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Package Name
                      </label>
                      <input
                        value={formData.packageName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            packageName: e.target.value
                          })
                        }
                        placeholder="Enter"
                        type="text"
                        className={`w-full border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none`}
                      />
                      {errors.packageName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.packageName}
                        </p>
                      )}
                    </div>

                    <Field className="mb-4">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Service type
                      </label>
                      <div className="relative">
                        <Select
                          value={formData.serviceType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              serviceType: e.target.value
                            })
                          }
                          className={clsx(
                            "block w-full border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none` appearance-none text-start font-medium text-sm/6 text-[#6B757D]",
                            "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
                            "*:text-black"
                          )}
                        >
                          <option value="">Select package</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                        </Select>
                        <FaChevronDown
                          className="group pointer-events-none absolute top-4 right-3 size-4 text-[#899197]"
                          aria-hidden="true"
                        />
                      </div>
                      {errors.serviceType && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.serviceType}
                        </p>
                      )}
                    </Field>

                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Service Fee ($)
                      </label>
                      <input
                        value={formData.serviceFee}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            serviceFee: e.target.value
                          })
                        }
                        placeholder="Enter"
                        type="number"
                        className={`w-full border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none`}
                      />
                      {errors.serviceFee && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.serviceFee}
                        </p>
                      )}
                    </div>
                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value
                          })
                        }
                        placeholder="Enter"
                        className={`w-full md:h-[130px] h-[100px] border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none`}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Features
                      </label>

                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex gap-2 mb-3">
                          <input
                            type="text"
                            placeholder="Enter feature"
                            value={feature}
                            onChange={(e) =>
                              updateFeature(index, e.target.value)
                            }
                            className="flex-1 border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600"
                          >
                            <TbHttpDelete />
                          </button>
                        </div>
                      ))}

                      {errors.features && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.features}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={addFeature}
                        className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                      >
                        + Add Feature
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-10 flex justify-between w-full mb-3">
                  <button
                    type="button"
                    onClick={() => setAddSubscriptionModal(false)}
                    className="bg-[#DFE3EA] w-full md:py-3 py-2 font-medium md:text-base text-sm text-[#6B7280] rounded-lg mr-5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="bg-[#9810FA] text-white font-medium md:text-base text-sm w-full md:py-3 py-2 rounded-lg"
                  >
                    {btnLoader ? <DotLoader color="#fff" /> : " Save"}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={editSubscriptionModal}
        onClose={handleCloseEditModal}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl flex flex-col max-h-[80vh]">
          <Dialog.Description className="overflow-y-auto flex-1">
            <div className="md:px-8 md:py-4 p-4">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-2xl text-lg font-semibold text-[#274372]">
                  Edit Subscription Package
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={handleCloseEditModal}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <form className="mt-7">
                <div className="px-2">
                  <div className="mb-6">
                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Package Name
                      </label>
                      <input
                        value={formData.packageName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            packageName: e.target.value
                          })
                        }
                        placeholder="Enter"
                        type="text"
                        className={`w-full border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none`}
                      />
                      {errors.packageName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.packageName}
                        </p>
                      )}
                    </div>

                    <Field className="mb-4">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Service type
                      </label>
                      <div className="relative">
                        <Select
                          value={formData.serviceType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              serviceType: e.target.value
                            })
                          }
                          className={clsx(
                            "block w-full border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none` appearance-none text-start font-medium text-sm/6 text-[#6B757D]",
                            "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
                            "*:text-black"
                          )}
                        >
                          <option value="">Select package</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                        </Select>
                        <FaChevronDown
                          className="group pointer-events-none absolute top-4 right-3 size-4 text-[#899197]"
                          aria-hidden="true"
                        />
                      </div>
                      {errors.serviceType && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.serviceType}
                        </p>
                      )}
                    </Field>

                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Service Fee ($)
                      </label>
                      <input
                        value={formData.serviceFee}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            serviceFee: e.target.value
                          })
                        }
                        placeholder="Enter"
                        type="number"
                        className={`w-full border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none`}
                      />
                      {errors.serviceFee && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.serviceFee}
                        </p>
                      )}
                    </div>
                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value
                          })
                        }
                        placeholder="Enter"
                        className={`w-full md:h-[130px] h-[100px] border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none`}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Features
                      </label>

                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex gap-2 mb-3">
                          <input
                            type="text"
                            placeholder="Enter feature"
                            value={feature}
                            onChange={(e) =>
                              updateFeature(index, e.target.value)
                            }
                            className="flex-1 border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600"
                          >
                            <TbHttpDelete />
                          </button>
                        </div>
                      ))}

                      {errors.features && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.features}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={addFeature}
                        className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                      >
                        + Add Feature
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-10 flex justify-between w-full mb-3">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="bg-[#DFE3EA] w-full md:py-3 py-2 font-medium md:text-base text-sm text-[#6B7280] rounded-lg mr-5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="bg-[#9810FA] text-white font-medium md:text-base text-sm w-full md:py-3 py-2 rounded-lg"
                  >
                    {btnLoader ? <DotLoader color="#fff" /> : " Update"}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
