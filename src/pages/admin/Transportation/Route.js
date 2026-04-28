import React, { Fragment, useEffect, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiUsers,
  FiClock,
  FiX,
  FiTruck
} from "react-icons/fi";
import { useDebounce } from "use-debounce";
import toast from "react-hot-toast";
import Dialog from "../../../base-component/Dialog/Dialog";
import { DotLoader } from "../../../base-component/Loader/Loader";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import {
  createRouteApi,
  getRoutesApi,
  getVehiclesApi,
  getAllStudentListApi
} from "../../../services/api_services";
import moment from "moment";

const routeValidationSchema = Yup.object().shape({
  route_name: Yup.string().required("Route name is required"),
  vehicle_id: Yup.string().required("Vehicle is required"),
  driver_id: Yup.string().required("Driver is required"),
  route_type: Yup.string().required("Route type is required"),
  scheduled_start_time: Yup.string().required("Start time is required"),
  scheduled_end_time: Yup.string().optional(),
  stops: Yup.array().of(
    Yup.object().shape({
      stop_name: Yup.string().required("Stop name is required"),
      stop_type: Yup.string().required("Stop type is required"),
      latitude: Yup.number().optional(),
      longitude: Yup.number().optional(),
      address: Yup.string().optional(),
      scheduled_arrival_time: Yup.string().optional()
    })
  ),
  student_assignments: Yup.array().of(
    Yup.object().shape({
      student_id: Yup.string().required("Student is required"),
      route_stop_id: Yup.string().required("Stop is required"),
      sequence_position: Yup.number().required("Position is required")
    })
  )
});

const Route = () => {
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [pageNo, setPageNo] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [createRouteModal, setCreateRouteModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeDetailsModal, setRouteDetailsModal] = useState(false);

  useEffect(() => {
    getRoutesList();
    getVehiclesList();
    getStudentsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, pageNo]);

  const getRoutesList = async () => {
    try {
      setLoading(true);
      const response = await getRoutesApi({
        page: pageNo,
        search: debouncedSearch
      });

      if (response.data.status === 1) {
        setRoutes(response.data.data);
        setPageCount(response.data.pagination.pages);
      } else {
        toast.error(response.data.message || "Failed to fetch routes");
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast.error("Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  };

  const getVehiclesList = async () => {
    try {
      const response = await getVehiclesApi({ page: 1, search: "" });

      if (response.data.status === 1) {
        setVehicles(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const getStudentsList = async () => {
    try {
      const response = await getAllStudentListApi({ page: 1, search: "" });

      if (response.data.status === 1) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleCreateRoute = async (values, { resetForm }) => {
    try {
      // Transform stops to include route_stop_id in student assignments
      const stopsWithIds = values.stops.map((stop, idx) => ({
        ...stop,
        tempId: `stop_${idx}`
      }));

      // Update student assignments with proper stop IDs
      const studentAssignments = values.student_assignments.map(
        (assignment) => ({
          ...assignment,
          route_stop_id: assignment.route_stop_id
        })
      );

      const routeData = {
        ...values,
        stops: stopsWithIds.map((s) => ({
          stop_name: s.stop_name,
          stop_type: s.stop_type,
          latitude: s.latitude,
          longitude: s.longitude,
          address: s.address,
          scheduled_arrival_time: s.scheduled_arrival_time
        })),
        student_assignments: studentAssignments
      };

      const response = await createRouteApi(routeData);

      if (response.data.status === 1) {
        toast.success("Route created successfully");
        resetForm();
        setCreateRouteModal(false);
        getRoutesList();
      } else {
        toast.error(response.data.message || "Failed to create route");
      }
    } catch (error) {
      console.error("Error creating route:", error);
      toast.error("Failed to create route");
    }
  };

  const handleViewDetails = (route) => {
    setSelectedRoute(route);
    setRouteDetailsModal(true);
  };

  const getDriverName = (driverId) => {
    const vehicle = vehicles.find((v) => v.driver_id === driverId);
    return vehicle?.driver?.full_name || "Unknown";
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle?.vehicle_name || "Unknown";
  };

  const getStudentName = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : "Unknown";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Fragment>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
            Route Management
          </h2>
          <button
            onClick={() => setCreateRouteModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-4 py-2 rounded-lg transition font-medium"
          >
            <FiPlus className="text-lg" />
            Create Route
          </button>
        </div>

        {/* Search */}
        <input
          type="search"
          placeholder="Search by route name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPageNo(1);
          }}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Routes List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <DotLoader />
          </div>
        ) : routes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No routes found</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-lg transition"
              >
                {/* Route Header */}
                <div className="mb-3 pb-3 border-b">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {route.route_name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                        route.status
                      )}`}
                    >
                      {route.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 capitalize">
                    {route.route_type}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <FiTruck className="text-blue-500" />
                    <span className="text-xs">
                      {getVehicleName(route.vehicle_id)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <FiUsers className="text-purple-500" />
                    <span className="text-xs">
                      Driver: {getDriverName(route.driver_id)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <FiMapPin className="text-red-500" />
                    <span className="text-xs">
                      {route.stops?.length || 0} stops
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <FiUsers className="text-green-500" />
                    <span className="text-xs">
                      {route.students?.length || 0} students
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <FiClock className="text-orange-500" />
                    <span className="text-xs">
                      {moment(route.scheduled_start_time).format("HH:mm")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleViewDetails(route)}
                    className="flex-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 py-1 rounded transition font-medium"
                  >
                    View Details
                  </button>
                  <button className="flex-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 py-1 rounded transition font-medium">
                    Delete
                  </button>
                </div>
              </div>
            ))}
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

      {/* Create Route Modal */}
      <Dialog
        open={createRouteModal}
        onClose={() => setCreateRouteModal(false)}
      >
        <Dialog.Panel className="border w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Create New Route
          </Dialog.Title>

          <Formik
            initialValues={{
              route_name: "",
              vehicle_id: "",
              driver_id: "",
              route_type: "round_trip",
              scheduled_start_time: "",
              scheduled_end_time: "",
              stops: [
                {
                  stop_name: "",
                  stop_type: "pickup",
                  latitude: "",
                  longitude: "",
                  address: "",
                  scheduled_arrival_time: ""
                }
              ],
              student_assignments: [
                {
                  student_id: "",
                  route_stop_id: "stop_0",
                  sequence_position: 1
                }
              ]
            }}
            validationSchema={routeValidationSchema}
            onSubmit={handleCreateRoute}
          >
            {({ isSubmitting, values, errors, touched }) => (
              <Form className="space-y-5">
                {/* Basic Info */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    Basic Information
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Route Name *
                      </label>
                      <Field
                        name="route_name"
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="e.g., Morning Pickup Route"
                      />
                      <ErrorMessage
                        name="route_name"
                        component="span"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Route Type *
                      </label>
                      <Field
                        name="route_type"
                        as="select"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      >
                        <option value="pickup">Pickup Only</option>
                        <option value="dropoff">Dropoff Only</option>
                        <option value="round_trip">Round Trip</option>
                      </Field>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle *
                      </label>
                      <Field
                        name="vehicle_id"
                        as="select"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      >
                        <option value="">-- Select Vehicle --</option>
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.vehicle_name} ({v.registration_plate})
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="vehicle_id"
                        component="span"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Driver *
                      </label>
                      <Field
                        name="driver_id"
                        as="select"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      >
                        <option value="">-- Select Driver --</option>
                        {vehicles
                          .filter((v) => v.driver_id)
                          .map((v) => (
                            <option key={v.driver_id} value={v.driver_id}>
                              {v.driver?.full_name || "Unknown"}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage
                        name="driver_id"
                        component="span"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <Field
                        name="scheduled_start_time"
                        type="datetime-local"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                      <ErrorMessage
                        name="scheduled_start_time"
                        component="span"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time (Optional)
                      </label>
                      <Field
                        name="scheduled_end_time"
                        type="datetime-local"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Route Stops */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-900">Route Stops</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {values.stops.length} stops
                    </span>
                  </div>

                  <FieldArray name="stops">
                    {({ push, remove }) => (
                      <div className="space-y-3">
                        {values.stops.map((stop, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-gray-200 p-3 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Stop #{idx + 1}
                              </span>
                              {values.stops.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(idx)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FiX />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <Field
                                name={`stops.${idx}.stop_name`}
                                type="text"
                                placeholder="Stop name"
                                className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              <Field
                                name={`stops.${idx}.stop_type`}
                                as="select"
                                className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="pickup">Pickup</option>
                                <option value="dropoff">Dropoff</option>
                              </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Field
                                name={`stops.${idx}.latitude`}
                                type="number"
                                placeholder="Latitude"
                                step="any"
                                className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              <Field
                                name={`stops.${idx}.longitude`}
                                type="number"
                                placeholder="Longitude"
                                step="any"
                                className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            push({
                              stop_name: "",
                              stop_type: "pickup",
                              latitude: "",
                              longitude: "",
                              address: "",
                              scheduled_arrival_time: ""
                            })
                          }
                          className="w-full text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded transition font-medium"
                        >
                          + Add Stop
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Student Assignments */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-900">
                      Student Assignments
                    </h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {values.student_assignments.length} students
                    </span>
                  </div>

                  <FieldArray name="student_assignments">
                    {({ push, remove }) => (
                      <div className="space-y-3">
                        {values.student_assignments.map((assignment, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-gray-200 p-3 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Student #{idx + 1}
                              </span>
                              {values.student_assignments.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(idx)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FiX />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <Field
                                name={`student_assignments.${idx}.student_id`}
                                as="select"
                                className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="">-- Student --</option>
                                {students.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.first_name} {s.last_name}
                                  </option>
                                ))}
                              </Field>

                              <Field
                                name={`student_assignments.${idx}.route_stop_id`}
                                as="select"
                                className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="">-- Stop --</option>
                                {values.stops.map((stop, stopIdx) => (
                                  <option
                                    key={stopIdx}
                                    value={`stop_${stopIdx}`}
                                  >
                                    {stop.stop_name || `Stop ${stopIdx + 1}`}
                                  </option>
                                ))}
                              </Field>

                              <Field
                                name={`student_assignments.${idx}.sequence_position`}
                                type="number"
                                min="1"
                                placeholder="Position"
                                className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            push({
                              student_id: "",
                              route_stop_id: "stop_0",
                              sequence_position:
                                values.student_assignments.length + 1
                            })
                          }
                          className="w-full text-sm bg-green-50 text-green-600 hover:bg-green-100 py-2 rounded transition font-medium"
                        >
                          + Add Student
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setCreateRouteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 via-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-lg transition disabled:opacity-50 font-medium"
                  >
                    {isSubmitting ? "Creating..." : "Create Route"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Dialog.Panel>
      </Dialog>

      {/* Route Details Modal */}
      <Dialog
        open={routeDetailsModal}
        onClose={() => {
          setRouteDetailsModal(false);
          setSelectedRoute(null);
        }}
      >
        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Route Details: {selectedRoute?.route_name}
          </Dialog.Title>

          {selectedRoute && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-medium capitalize">
                      {selectedRoute.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Route Type</p>
                    <p className="font-medium capitalize">
                      {selectedRoute.route_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Vehicle</p>
                    <p className="font-medium">
                      {getVehicleName(selectedRoute.vehicle_id)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Driver</p>
                    <p className="font-medium">
                      {getDriverName(selectedRoute.driver_id)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stops */}
              {selectedRoute.stops && selectedRoute.stops.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Route Stops ({selectedRoute.stops.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedRoute.stops.map((stop, idx) => (
                      <div
                        key={stop.id}
                        className="bg-white p-3 rounded border border-gray-200 text-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              Stop #{stop.stop_sequence}: {stop.stop_name}
                            </p>
                            <p className="text-gray-600 text-xs capitalize">
                              {stop.stop_type}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              Status: {stop.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Students */}
              {selectedRoute.students && selectedRoute.students.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Assigned Students ({selectedRoute.students.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedRoute.students.map((student, idx) => (
                      <div
                        key={student.id}
                        className="bg-white p-3 rounded border border-gray-200 text-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {getStudentName(student.student_id)}
                            </p>
                            <p className="text-gray-600 text-xs">
                              Position: #{student.sequence_position}
                            </p>
                            <p className="text-gray-500 text-xs mt-1 capitalize">
                              Status: {student.pickup_status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setRouteDetailsModal(false);
                    setSelectedRoute(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </Dialog>
    </Fragment>
  );
};

export default Route;
