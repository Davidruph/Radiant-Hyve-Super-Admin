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
  getAllStudentListApi,
  getShiftApi,
  getDropoffRecipientsApi,
  addDropoffRecipientApi,
  removeDropoffRecipientApi,
  cancelRouteApi,
  updateRouteApi
} from "../../../services/api_services";
import moment from "moment";
import { useNavigate } from "react-router-dom";

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
  const [recipients, setRecipients] = useState({}); // { student_id: [...] }
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState(null); // route object
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [editModal, setEditModal] = useState(null); // route object
  const [editForm, setEditForm] = useState({ route_name: "", scheduled_start_time: "", scheduled_end_time: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [addRecipientFor, setAddRecipientFor] = useState(null); // student_id
  const [newRecipient, setNewRecipient] = useState({
    recipient_type: "parent",
    recipient_name: "",
    recipient_phone: "",
    relationship_to_student: "",
    is_primary: false
  });

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
      const response = await getAllStudentListApi({
        page: 1,
        search: "",
        shift_id: 0
      });

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

      // console.log("Creating route with data:", routeData);
      // return;

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

  const handleViewDetails = async (route) => {
    setSelectedRoute(route);
    setRouteDetailsModal(true);
    if (route.students?.length > 0) {
      setRecipientsLoading(true);
      try {
        const res = await getDropoffRecipientsApi();
        if (res.data.status === 1) {
          const map = {};
          res.data.data.forEach((r) => {
            if (!map[r.student_id]) map[r.student_id] = [];
            map[r.student_id].push(r);
          });
          setRecipients(map);
        }
      } catch {
        // non-critical
      } finally {
        setRecipientsLoading(false);
      }
    }
  };

  const handleAddRecipient = async (studentId) => {
    if (!newRecipient.recipient_name.trim()) {
      toast.error("Recipient name is required");
      return;
    }
    try {
      const res = await addDropoffRecipientApi({
        student_id: studentId,
        ...newRecipient
      });
      if (res.data.status === 1) {
        toast.success("Recipient added");
        setRecipients((prev) => ({
          ...prev,
          [studentId]: [...(prev[studentId] || []), res.data.data]
        }));
        setAddRecipientFor(null);
        setNewRecipient({
          recipient_type: "parent",
          recipient_name: "",
          recipient_phone: "",
          relationship_to_student: "",
          is_primary: false
        });
      } else {
        toast.error(res.data.message || "Failed to add recipient");
      }
    } catch {
      toast.error("Failed to add recipient");
    }
  };

  const openEditModal = (route) => {
    setEditModal(route);
    setEditForm({
      route_name: route.route_name || "",
      scheduled_start_time: route.scheduled_start_time
        ? new Date(route.scheduled_start_time).toISOString().slice(0, 16)
        : "",
      scheduled_end_time: route.scheduled_end_time
        ? new Date(route.scheduled_end_time).toISOString().slice(0, 16)
        : "",
      notes: route.notes || ""
    });
  };

  const handleEditRoute = async () => {
    if (!editModal) return;
    setSaving(true);
    try {
      const res = await updateRouteApi(editModal.id, {
        route_name: editForm.route_name || undefined,
        scheduled_start_time: editForm.scheduled_start_time || undefined,
        scheduled_end_time: editForm.scheduled_end_time || undefined,
        notes: editForm.notes || undefined
      });
      if (res.data.status === 1) {
        toast.success("Route updated");
        setRoutes((prev) =>
          prev.map((r) => (r.id === editModal.id ? { ...r, ...res.data.data } : r))
        );
        setEditModal(null);
      } else {
        toast.error(res.data.message || "Failed to update route");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update route");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelRoute = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      const res = await cancelRouteApi(cancelModal.id, { reason: cancelReason || null });
      if (res.data.status === 1) {
        toast.success("Route cancelled");
        setRoutes((prev) =>
          prev.map((r) =>
            r.id === cancelModal.id ? { ...r, status: "cancelled" } : r
          )
        );
        setCancelModal(null);
        setCancelReason("");
      } else {
        toast.error(res.data.message || "Failed to cancel route");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel route");
    } finally {
      setCancelling(false);
    }
  };

  const handleRemoveRecipient = async (recipientId, studentId) => {
    try {
      const res = await removeDropoffRecipientApi(recipientId);
      if (res.data.status === 1) {
        toast.success("Recipient removed");
        setRecipients((prev) => ({
          ...prev,
          [studentId]: (prev[studentId] || []).filter((r) => r.id !== recipientId)
        }));
      }
    } catch {
      toast.error("Failed to remove recipient");
    }
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
    const student = students.find((s) => s.id == studentId);
    // console.log("Finding student name for ID:", studentId, "Found:", student);

    return student ? `${student.full_name}` : "Unknown";
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
                  {route.status === "scheduled" && (
                    <button
                      onClick={() => openEditModal(route)}
                      className="flex-1 text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 py-1 rounded transition font-medium"
                    >
                      Edit
                    </button>
                  )}
                  {route.status === "scheduled" && (
                    <button
                      onClick={() => setCancelModal(route)}
                      className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded transition font-medium"
                    >
                      Cancel
                    </button>
                  )}
                  {route.status === "cancelled" && (
                    <span className="flex-1 text-center text-xs text-gray-400 py-1">
                      Cancelled
                    </span>
                  )}
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
                      <Field name="scheduled_start_time">
                        {({ field }) => (
                          <>
                            <input
                              {...field}
                              type="datetime-local"
                              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                            {field.value && new Date(field.value) < new Date() && (
                              <p className="text-red-500 text-xs mt-1">
                                Start time must be in the future
                              </p>
                            )}
                          </>
                        )}
                      </Field>
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

                  {/* Capacity warning */}
                  {values.vehicle_id && (() => {
                    const v = vehicles.find((v) => v.id === values.vehicle_id);
                    const over = v && values.student_assignments.length > v.capacity;
                    const near = v && !over && values.student_assignments.length === v.capacity;
                    if (over) return (
                      <div className="mb-3 p-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
                        ⚠ Over capacity — {values.student_assignments.length} students assigned but {v.vehicle_name} holds {v.capacity}. Remove {values.student_assignments.length - v.capacity} student(s).
                      </div>
                    );
                    if (near) return (
                      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-700">
                        Vehicle at full capacity ({v.capacity}/{v.capacity}).
                      </div>
                    );
                    return null;
                  })()}

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
                                    {s.full_name}
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

              {/* Students + Authorized Recipients */}
              {selectedRoute.students && selectedRoute.students.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Students &amp; Authorized Recipients ({selectedRoute.students.length})
                  </h4>
                  {recipientsLoading && (
                    <p className="text-xs text-gray-500 mb-2">Loading recipients...</p>
                  )}
                  <div className="space-y-3">
                    {selectedRoute.students.map((student) => {
                      const studentName = getStudentName(student.student_id);
                      const studentRecipients = recipients[student.student_id] || [];
                      const isAddingHere = addRecipientFor === student.student_id;

                      return (
                        <div
                          key={student.id}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                        >
                          {/* Student header */}
                          <div className="flex items-center justify-between p-3 border-b border-gray-100">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {studentName}
                              </p>
                              <p className="text-xs text-gray-500">
                                Position #{student.sequence_position} ·{" "}
                                <span className="capitalize">{student.pickup_status?.replace(/_/g, " ")}</span>
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                setAddRecipientFor(
                                  isAddingHere ? null : student.student_id
                                )
                              }
                              className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition"
                            >
                              {isAddingHere ? "Cancel" : "+ Add Recipient"}
                            </button>
                          </div>

                          {/* Recipients list */}
                          {studentRecipients.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                              {studentRecipients.map((r) => (
                                <div
                                  key={r.id}
                                  className="flex items-center justify-between px-3 py-2"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">
                                      {r.recipient_name}
                                      {r.is_primary && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                          Primary
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {r.recipient_type?.replace(/_/g, " ")}
                                      {r.relationship_to_student && ` · ${r.relationship_to_student}`}
                                      {r.recipient_phone && ` · ${r.recipient_phone}`}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleRemoveRecipient(r.id, student.student_id)
                                    }
                                    className="text-red-400 hover:text-red-600 ml-2"
                                  >
                                    <FiX size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="px-3 py-2 text-xs text-gray-400 italic">
                              No authorized recipients yet
                            </p>
                          )}

                          {/* Inline add form */}
                          {isAddingHere && (
                            <div className="p-3 bg-blue-50 border-t border-blue-100 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={newRecipient.recipient_type}
                                  onChange={(e) =>
                                    setNewRecipient((p) => ({
                                      ...p,
                                      recipient_type: e.target.value
                                    }))
                                  }
                                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none"
                                >
                                  <option value="parent">Parent</option>
                                  <option value="authorized_person">Authorized Person</option>
                                </select>
                                <input
                                  type="text"
                                  placeholder="Recipient name *"
                                  value={newRecipient.recipient_name}
                                  onChange={(e) =>
                                    setNewRecipient((p) => ({
                                      ...p,
                                      recipient_name: e.target.value
                                    }))
                                  }
                                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Phone (optional)"
                                  value={newRecipient.recipient_phone}
                                  onChange={(e) =>
                                    setNewRecipient((p) => ({
                                      ...p,
                                      recipient_phone: e.target.value
                                    }))
                                  }
                                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Relationship (e.g. Mother)"
                                  value={newRecipient.relationship_to_student}
                                  onChange={(e) =>
                                    setNewRecipient((p) => ({
                                      ...p,
                                      relationship_to_student: e.target.value
                                    }))
                                  }
                                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none"
                                />
                              </div>
                              <label className="flex items-center space-x-2 text-xs text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={newRecipient.is_primary}
                                  onChange={(e) =>
                                    setNewRecipient((p) => ({
                                      ...p,
                                      is_primary: e.target.checked
                                    }))
                                  }
                                />
                                <span>Set as primary recipient</span>
                              </label>
                              <button
                                onClick={() => handleAddRecipient(student.student_id)}
                                className="w-full text-xs py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                              >
                                Save Recipient
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
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

      {/* Route edit modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-lg">Edit Route</h3>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600">
                <FiX />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route Name</label>
                <input
                  type="text"
                  value={editForm.route_name}
                  onChange={(e) => setEditForm((p) => ({ ...p, route_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={editForm.scheduled_start_time}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  onChange={(e) => setEditForm((p) => ({ ...p, scheduled_start_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time (optional)</label>
                <input
                  type="datetime-local"
                  value={editForm.scheduled_end_time}
                  onChange={(e) => setEditForm((p) => ({ ...p, scheduled_end_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleEditRoute}
                  disabled={saving || !editForm.route_name.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-medium text-sm transition"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route cancellation confirmation modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-lg">Cancel Route</h3>
              <p className="text-sm text-gray-600 mt-1">
                Are you sure you want to cancel{" "}
                <span className="font-medium">{cancelModal.route_name}</span>?
                This cannot be undone.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Driver unavailable, vehicle breakdown..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelRoute}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg font-medium text-sm transition"
                >
                  {cancelling ? "Cancelling..." : "Yes, Cancel Route"}
                </button>
                <button
                  onClick={() => { setCancelModal(null); setCancelReason(""); }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition"
                >
                  Keep Route
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Route;
