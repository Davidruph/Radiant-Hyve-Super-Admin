import React, { Fragment, useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useDebounce } from "use-debounce";
import toast from "react-hot-toast";
import Dialog from "../../../base-component/Dialog/Dialog";
import { DotLoader } from "../../../base-component/Loader/Loader";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  addVehicleApi,
  getVehiclesApi,
  updateVehicleApi
} from "../../../services/api_services";

const vehicleValidationSchema = Yup.object().shape({
  vehicle_name: Yup.string().required("Vehicle name is required"),
  registration_plate: Yup.string()
    .required("Registration plate is required")
    .matches(/^[A-Z0-9]+$/, "Invalid registration plate format"),
  vehicle_type: Yup.string().required("Vehicle type is required"),
  capacity: Yup.number()
    .required("Capacity is required")
    .min(1, "Capacity must be at least 1"),
  color: Yup.string().optional(),
  year_of_manufacture: Yup.number().optional(),
  insurance_expiry: Yup.string().optional()
});

const Vehicle = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [addVehicleModal, setAddVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const getVehiclesList = async () => {
    try {
      setLoading(true);
      const response = await getVehiclesApi({
        page: pageNo,
        search: debouncedSearch
      });

      if (response.data.status === 1) {
        setVehicles(response.data.data);
        setPageCount(response.data.pagination.pages);
      } else {
        toast.error(response.data.message || "Failed to fetch vehicles");
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVehiclesList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, pageNo]);

  const handleAddVehicle = async (values, { resetForm }) => {
    try {
      const response = await addVehicleApi(values);

      if (response.data.status === 1) {
        toast.success("Vehicle added successfully");
        resetForm();
        setAddVehicleModal(false);
        getVehiclesList();
      } else {
        toast.error(response.data.message || "Failed to add vehicle");
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Failed to add vehicle");
    }
  };

  const handleUpdateVehicle = async (values, { resetForm }) => {
    try {
      const response = await updateVehicleApi(editingVehicle.id, values);

      if (response.data.status === 1) {
        toast.success("Vehicle updated successfully");
        resetForm();
        setEditingVehicle(null);
        setAddVehicleModal(false);
        getVehiclesList();
      } else {
        toast.error(response.data.message || "Failed to update vehicle");
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error("Failed to update vehicle");
    }
  };

  const handleEditClick = (vehicle) => {
    setEditingVehicle(vehicle);
    setAddVehicleModal(true);
  };

  const handleCloseModal = () => {
    setEditingVehicle(null);
    setAddVehicleModal(false);
  };

  return (
    <Fragment>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
            Vehicle Management
          </h2>
          <button
            onClick={() => setAddVehicleModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-4 py-2 rounded-lg transition font-medium"
          >
            <FiPlus className="text-lg" />
            Add Vehicle
          </button>
        </div>

        {/* Search */}
        <input
          type="search"
          placeholder="Search by name or registration plate..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPageNo(1);
          }}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Vehicle List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <DotLoader />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No vehicles found
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Vehicle Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Plate
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">{vehicle.vehicle_name}</td>
                    <td className="px-6 py-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {vehicle.registration_plate}
                      </span>
                    </td>
                    <td className="px-6 py-3 capitalize">
                      {vehicle.vehicle_type}
                    </td>
                    <td className="px-6 py-3">{vehicle.capacity} students</td>
                    <td className="px-6 py-3">
                      {vehicle.driver ? (
                        <span className="text-sm">
                          {vehicle.driver.full_name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          vehicle.status === "active"
                            ? "bg-green-100 text-green-800"
                            : vehicle.status === "maintenance"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 flex gap-2">
                      <button
                        onClick={() => handleEditClick(vehicle)}
                        className="text-blue-500 hover:text-blue-700 p-2"
                      >
                        <FiEdit2 />
                      </button>
                      <button className="text-red-500 hover:text-red-700 p-2">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
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
                className={`px-3 py-1 rounded font-medium transition ${
                  pageNo === page
                    ? "bg-gradient-to-r from-purple-600 via-purple-600 to-purple-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Vehicle Modal */}
      <Dialog open={addVehicleModal} onClose={handleCloseModal}>
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </Dialog.Title>

          <Formik
            initialValues={
              editingVehicle || {
                vehicle_name: "",
                registration_plate: "",
                vehicle_type: "bus",
                capacity: "",
                color: "",
                year_of_manufacture: "",
                insurance_expiry: ""
              }
            }
            validationSchema={vehicleValidationSchema}
            onSubmit={editingVehicle ? handleUpdateVehicle : handleAddVehicle}
          >
            {({ isSubmitting, values }) => (
              <Form className="space-y-4">
                {/* Vehicle Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vehicle Name *
                  </label>
                  <Field
                    name="vehicle_name"
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., School Bus A"
                  />
                  <ErrorMessage
                    name="vehicle_name"
                    component="span"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Registration Plate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Plate *
                  </label>
                  <Field
                    name="registration_plate"
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                    placeholder="e.g., ABC1234"
                  />
                  <ErrorMessage
                    name="registration_plate"
                    component="span"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vehicle Type *
                  </label>
                  <Field
                    name="vehicle_type"
                    as="select"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="bus">Bus</option>
                    <option value="van">Van</option>
                    <option value="car">Car</option>
                  </Field>
                  <ErrorMessage
                    name="vehicle_type"
                    component="span"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Capacity (Students) *
                  </label>
                  <Field
                    name="capacity"
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 50"
                  />
                  <ErrorMessage
                    name="capacity"
                    component="span"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <Field
                    name="color"
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Yellow"
                  />
                </div>

                {/* Year of Manufacture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Year of Manufacture
                  </label>
                  <Field
                    name="year_of_manufacture"
                    type="number"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 2022"
                  />
                </div>

                {/* Insurance Expiry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Insurance Expiry Date
                  </label>
                  <Field
                    name="insurance_expiry"
                    type="date"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 via-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-lg transition disabled:opacity-50 font-medium"
                  >
                    {isSubmitting ? "Saving..." : "Save Vehicle"}
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

export default Vehicle;
