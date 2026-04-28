import React, { Fragment, useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTruck, FiUploadCloud } from "react-icons/fi";
import { useDebounce } from "use-debounce";
import toast from "react-hot-toast";
import Dialog from "../../../base-component/Dialog/Dialog";
import { DotLoader } from "../../../base-component/Loader/Loader";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import PlaceholderImg from "../../../assets/images/placeholderImg.png";
import parsePhoneNumberFromString from "libphonenumber-js";
import {
  addStaffApi,
  getStaffListApi,
  assignDriverToVehicleApi,
  getVehiclesApi
} from "../../../services/api_services";

const driverValidationSchema = Yup.object().shape({
  full_name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  mobile_no: Yup.string().required("Mobile number is required"),
  about_staff: Yup.string().required("Bio/description is required"),
  joining_date: Yup.string().required("Joining date is required"),
  dob: Yup.string().optional(),
  experience: Yup.number().min(0, "Experience must be positive").optional(),
  gender: Yup.string().optional(),
  profile_pic: Yup.string().optional(),
  iso_code: Yup.string().optional(),
  country_code: Yup.string().optional()
});

const assignVehicleSchema = Yup.object().shape({
  vehicle_id: Yup.string().required("Vehicle is required")
});

const Driver = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [addDriverModal, setAddDriverModal] = useState(false);
  const [assignVehicleModal, setAssignVehicleModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const profileImage = URL.createObjectURL(file);
      setProfilePicPreview(profileImage);
    }
  };

  const getDriversList = async () => {
    try {
      setLoading(true);
      const response = await getStaffListApi({
        page: pageNo,
        search: debouncedSearch,
        role: "driver"
      });

      console.log("response:", response);

      if (response.data.status === 1) {
        setDrivers(response.data.data);
        setPageCount(response.data.totalPage);
      } else {
        toast.error(response.data.message || "Failed to fetch drivers");
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  const getVehiclesList = async () => {
    try {
      const response = await getVehiclesApi({
        page: 1,
        search: ""
      });

      if (response.data.status === 1) {
        setVehicles(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  useEffect(() => {
    getDriversList();
    getVehiclesList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, pageNo]);

  const handleAddDriver = async (values, { resetForm }) => {
    try {
      // Parse the phone number to extract components
      const parsedPhone = parsePhoneNumberFromString(values.mobile_no);

      if (!parsedPhone || !parsedPhone.isValid()) {
        toast.error("Please enter a valid phone number");
        return;
      }

      const formData = new FormData();
      formData.append("full_name", values.full_name);
      formData.append("email", values.email);
      formData.append("mobile_no", parsedPhone.nationalNumber);
      formData.append("country_code", `+${parsedPhone.countryCallingCode}`);
      formData.append("iso_code", parsedPhone.country || "US");
      formData.append("about_staff", values.about_staff);
      formData.append("joining_date", values.joining_date);
      formData.append("role", "driver");
      formData.append("gender", values.gender || "other");
      formData.append("dob", values.dob || null);
      formData.append("experience", values.experience || 0);

      // Handle profile picture file upload
      if (profilePicFile) {
        formData.append("profile_pic", profilePicFile);
      }

      const response = await addStaffApi(formData);

      if (response.data.status === 1) {
        toast.success("Driver added successfully");
        resetForm();
        setAddDriverModal(false);
        setProfilePicPreview(null);
        setProfilePicFile(null);
        getDriversList();
      } else {
        toast.error(response.data.message || "Failed to add driver");
      }
    } catch (error) {
      console.error("Error adding driver:", error);
      toast.error("Failed to add driver");
    }
  };

  const handleAssignVehicle = async (values, { resetForm }) => {
    try {
      const response = await assignDriverToVehicleApi({
        vehicle_id: values.vehicle_id,
        driver_id: selectedDriver.id
      });

      if (response.data.status === 1) {
        toast.success("Vehicle assigned successfully");
        resetForm();
        setAssignVehicleModal(false);
        setSelectedDriver(null);
        getDriversList();
        getVehiclesList();
      } else {
        toast.error(response.data.message || "Failed to assign vehicle");
      }
    } catch (error) {
      console.error("Error assigning vehicle:", error);
      toast.error("Failed to assign vehicle");
    }
  };

  const handleAssignClick = (driver) => {
    setSelectedDriver(driver);
    setAssignVehicleModal(true);
  };

  const getAssignedVehicle = (driver) => {
    // Check if vehicle info is directly on the driver object from the API
    if (driver.vehicle_id) {
      return {
        id: driver.vehicle_id,
        vehicle_name: driver.vehicle_name,
        registration_plate: driver.registration_plate
      };
    }
    // Fallback to searching in vehicles array
    return vehicles.find((v) => v.driver_id === driver.id);
  };

  return (
    <Fragment>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
            Driver Management
          </h2>
          <button
            onClick={() => setAddDriverModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-4 py-2 rounded-lg transition"
          >
            <FiPlus className="text-lg" />
            Add Driver
          </button>
        </div>

        {/* Search */}
        <input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPageNo(1);
          }}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Driver List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <DotLoader />
          </div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No drivers found</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Picture
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Assigned Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => {
                  const assignedVehicle = getAssignedVehicle(driver);
                  return (
                    <tr key={driver.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <img
                          src={
                            driver.profile_pic ||
                            "https://via.placeholder.com/40?text=Avatar"
                          }
                          alt={driver.full_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-6 py-3 font-medium">
                        {driver.full_name}
                      </td>
                      <td className="px-6 py-3 text-sm">{driver.email}</td>
                      <td className="px-6 py-3 text-sm">
                        {driver.country_code} {driver.mobile_no}
                      </td>
                      <td className="px-6 py-3">
                        {driver.experience || "N/A"} years
                      </td>
                      <td className="px-6 py-3">
                        {assignedVehicle ? (
                          <div className="flex items-center gap-2">
                            <FiTruck className="text-blue-500" />
                            <span className="text-sm font-medium">
                              {assignedVehicle.vehicle_name} (
                              {assignedVehicle.registration_plate})
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 flex gap-2">
                        <button
                          onClick={() => handleAssignClick(driver)}
                          className="text-green-500 hover:text-green-700 p-2 hover:bg-green-50 rounded"
                          title="Assign Vehicle"
                        >
                          <FiTruck />
                        </button>
                        <button className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded">
                          <FiEdit2 />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPageNo(page)}
                className={`px-3 py-1 rounded ${
                  pageNo === page
                    ? "bg-gradient-to-r from-purple-600 via-purple-600 to-purple-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Driver Modal */}
      <Dialog open={addDriverModal} onClose={() => setAddDriverModal(false)}>
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Add New Driver
          </Dialog.Title>

          <Formik
            initialValues={{
              full_name: "",
              email: "",
              mobile_no: "",
              iso_code: "+1",
              country_code: "US",
              about_staff: "",
              joining_date: "",
              experience: "",
              dob: "",
              gender: "",
              profile_pic: ""
            }}
            validationSchema={driverValidationSchema}
            onSubmit={handleAddDriver}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="space-y-4">
                {/* Profile Picture */}
                <div className="flex flex-col items-center gap-3">
                  <label htmlFor="fileInput" className="cursor-pointer">
                    <div className="w-24 h-24 rounded-full border flex items-center justify-center overflow-hidden">
                      {profilePicPreview ? (
                        <img
                          src={profilePicPreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={PlaceholderImg}
                          className="w-24 h-24 object-cover"
                          alt="Profile Placeholder"
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
                    className="flex text-sm items-center gap-2 text-gray-700 cursor-pointer"
                  >
                    <FiUploadCloud className="text-gray-400 text-base" />
                    Upload Profile Picture
                  </label>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <Field
                    name="full_name"
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Driver name"
                  />
                  <ErrorMessage
                    name="full_name"
                    component="span"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <Field
                    name="email"
                    type="email"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="driver@school.com"
                  />
                  <ErrorMessage
                    name="email"
                    component="span"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <PhoneInput
                    country={"us"}
                    value={values.mobile_no}
                    onChange={(value) => setFieldValue("mobile_no", value)}
                    inputClass="w-full border text-sm border-gray-300 px-3 py-2 rounded-lg"
                    inputStyle={{ width: "100%" }}
                    isValid={(value) => {
                      const digits = value.replace(/\D/g, "");
                      return digits.length > 5;
                    }}
                  />
                  <ErrorMessage
                    name="mobile_no"
                    component="span"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* About Staff */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio/Description *
                  </label>
                  <Field
                    name="about_staff"
                    as="textarea"
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Brief bio or description of the driver"
                  />
                  <ErrorMessage
                    name="about_staff"
                    component="span"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Joining Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Joining Date *
                  </label>
                  <Field
                    name="joining_date"
                    type="date"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <ErrorMessage
                    name="joining_date"
                    component="span"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <Field
                    name="experience"
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="5"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <Field
                    name="dob"
                    type="date"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setAddDriverModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 via-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Adding..." : "Add Driver"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Dialog.Panel>
      </Dialog>

      {/* Assign Vehicle Modal */}
      <Dialog
        open={assignVehicleModal}
        onClose={() => setAssignVehicleModal(false)}
      >
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Assign Vehicle to {selectedDriver?.full_name}
          </Dialog.Title>

          <Formik
            initialValues={{
              vehicle_id: ""
            }}
            validationSchema={assignVehicleSchema}
            onSubmit={handleAssignVehicle}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {/* Vehicle Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Vehicle *
                  </label>
                  <Field
                    name="vehicle_id"
                    as="select"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Choose a vehicle --</option>
                    {vehicles
                      .filter((v) => !v.driver_id)
                      .map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicle_name} ({vehicle.registration_plate})
                          -{vehicle.capacity} seats
                        </option>
                      ))}
                  </Field>
                  <ErrorMessage
                    name="vehicle_id"
                    component="span"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  ℹ️ Only unassigned vehicles are shown. This will assign the
                  vehicle exclusively to this driver.
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setAssignVehicleModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Assigning..." : "Assign"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Dialog.Panel>
      </Dialog>
    </Fragment>
  );
};

export default Driver;
