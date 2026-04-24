import React, { Fragment, useEffect, useState } from "react";
import {
  FiPlay,
  FiCheck,
  FiAlertCircle,
  FiMapPin,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiX,
  FiPhoneCall,
  FiRefreshCw
} from "react-icons/fi";
import toast from "react-hot-toast";
import Dialog from "../../../base-component/Dialog/Dialog";
import { DotLoader } from "../../../base-component/Loader/Loader";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  getRoutesApi,
  startRouteApi,
  updatePickupStatusApi,
  completeDropoffApi,
  endRouteApi
} from "../../../services/api_services";
import moment from "moment";

const pickupValidationSchema = Yup.object().shape({
  pickup_status: Yup.string()
    .oneOf(["picked_up", "absent", "skipped"])
    .required("Status is required"),
  skip_reason: Yup.string().when("pickup_status", {
    is: "skipped",
    then: (schema) => schema.required("Reason is required when skipping"),
    otherwise: (schema) => schema.optional()
  })
});

const dropoffValidationSchema = Yup.object().shape({
  recipient_type: Yup.string()
    .oneOf(["parent", "authorized_person"])
    .required("Recipient type is required"),
  recipient_name: Yup.string().required("Recipient name is required")
});

const RouteExecution = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const [showRouteStart, setShowRouteStart] = useState(false);
  const [showPickupFlow, setShowPickupFlow] = useState(false);
  const [showDropoffFlow, setShowDropoffFlow] = useState(false);
  const [showEndRoute, setShowEndRoute] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [routeStudents, setRouteStudents] = useState([]);

  useEffect(() => {
    getAssignedRoutes();
  }, []);

  const getAssignedRoutes = async () => {
    try {
      setLoading(true);
      const response = await getRoutesApi({
        page: 1,
        status: "scheduled"
      });

      if (response.data.status === 1) {
        setRoutes(response.data.data);
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

  const handleStartRoute = async (route) => {
    try {
      const response = await startRouteApi({ route_id: route.id });

      if (response.data.status === 1) {
        toast.success("Route started successfully! Live tracking activated.");
        setActiveRoute(response.data.data);
        setRouteStudents(response.data.data.students || []);
        setShowRouteStart(false);
      } else {
        toast.error(response.data.message || "Failed to start route");
      }
    } catch (error) {
      console.error("Error starting route:", error);
      toast.error(error.response?.data?.message || "Failed to start route");
    }
  };

  const handlePickupStudent = async (values, { resetForm }) => {
    if (!selectedStudent) return;

    try {
      const payload = {
        student_transport_id: selectedStudent.id,
        pickup_status: values.pickup_status,
        skip_reason: values.skip_reason || null,
        latitude: 0, // In real app, get from geolocation
        longitude: 0
      };

      const response = await updatePickupStatusApi(payload);

      if (response.data.status === 1) {
        const statusText =
          values.pickup_status === "picked_up"
            ? "picked up"
            : values.pickup_status === "absent"
              ? "marked as absent"
              : "skipped";

        toast.success(`Student ${statusText} successfully`);

        // Update local student status
        setRouteStudents((prev) =>
          prev.map((s) =>
            s.id === selectedStudent.id
              ? { ...s, pickup_status: values.pickup_status }
              : s
          )
        );

        resetForm();
        setShowPickupFlow(false);
        setSelectedStudent(null);
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating pickup:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDropoffStudent = async (values, { resetForm }) => {
    if (!selectedStudent) return;

    try {
      const payload = {
        student_transport_id: selectedStudent.id,
        recipient_type: values.recipient_type,
        recipient_name: values.recipient_name,
        latitude: 0,
        longitude: 0
      };

      const response = await completeDropoffApi(payload);

      if (response.data.status === 1) {
        toast.success("Student dropped off successfully");

        // Update local student status
        setRouteStudents((prev) =>
          prev.map((s) =>
            s.id === selectedStudent.id
              ? {
                  ...s,
                  current_status: "dropped_off",
                  dropoff_status: "completed"
                }
              : s
          )
        );

        resetForm();
        setShowDropoffFlow(false);
        setSelectedStudent(null);
      } else {
        if (response.data.requiresException) {
          toast.error(response.data.message);
        } else {
          toast.error(response.data.message || "Failed to complete dropoff");
        }
      }
    } catch (error) {
      console.error("Error completing dropoff:", error);
      toast.error(
        error.response?.data?.message || "Failed to complete dropoff"
      );
    }
  };

  const handleEndRoute = async () => {
    if (!activeRoute) return;

    try {
      const response = await endRouteApi({
        route_id: activeRoute.id,
        vehicle_check_confirmed: true
      });

      if (response.data.status === 1) {
        toast.success("Route ended successfully with safety check confirmed");
        setActiveRoute(null);
        setRouteStudents([]);
        setShowEndRoute(false);
        getAssignedRoutes();
      } else {
        toast.error(response.data.message || "Failed to end route");
      }
    } catch (error) {
      console.error("Error ending route:", error);
      toast.error(error.response?.data?.message || "Failed to end route");
    }
  };

  const getPickupStatusColor = (status) => {
    switch (status) {
      case "picked_up":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "skipped":
        return "bg-yellow-100 text-yellow-800";
      case "pending_pickup":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStudentName = (student) => {
    return student.student?.first_name && student.student?.last_name
      ? `${student.student.first_name} ${student.student.last_name}`
      : "Unknown";
  };

  const getStopName = (student) => {
    return student.stop?.stop_name || "Unknown Stop";
  };

  if (!activeRoute) {
    return (
      <Fragment>
        <div className="space-y-4">
          <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
            Route Execution
          </h2>

          <p className="text-gray-600 text-sm">
            Select a scheduled route to begin the transport workflow
          </p>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <DotLoader />
            </div>
          ) : routes.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <FiAlertCircle className="mx-auto text-blue-500 text-3xl mb-3" />
              <p className="text-blue-900 font-medium">
                No scheduled routes assigned to you
              </p>
              <p className="text-blue-700 text-sm mt-1">
                Check back later when a route is assigned
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {route.route_name}
                  </h3>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FiMapPin className="text-red-500" />
                      <span>{route.stops?.length || 0} stops</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <FiUsers className="text-green-500" />
                      <span>{route.students?.length || 0} students</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                      <FiClock className="text-orange-500" />
                      <span>
                        {moment(route.scheduled_start_time).format("HH:mm")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveRoute(route);
                      setRouteStudents(route.students || []);
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <FiPlay className="text-sm" />
                    Start Route
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Start Route Confirmation Modal */}
        <Dialog open={showRouteStart} onClose={() => setShowRouteStart(false)}>
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Start Route: {activeRoute?.route_name}
            </Dialog.Title>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-900">
              <p className="font-medium mb-2">Before starting, ensure:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Vehicle is in good condition</li>
                <li>All assigned students are listed</li>
                <li>Live location tracking is enabled</li>
                <li>You have the correct route data</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRouteStart(false);
                  setActiveRoute(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeRoute) handleStartRoute(activeRoute);
                }}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                <FiPlay className="text-sm" />
                Start Route
              </button>
            </div>
          </Dialog.Panel>
        </Dialog>
      </Fragment>
    );
  }

  // ACTIVE ROUTE INTERFACE
  return (
    <Fragment>
      <div className="space-y-4">
        {/* Route Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-2xl font-bold">{activeRoute.route_name}</h2>
              <p className="text-blue-100 text-sm">
                {moment(activeRoute.scheduled_start_time).format(
                  "MMMM Do YYYY, HH:mm"
                )}
              </p>
            </div>
            <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-medium">
              🟢 ACTIVE
            </span>
          </div>
        </div>

        {/* Route Stats */}
        <div className="grid md:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">STOPS</p>
            <p className="text-2xl font-bold text-gray-900">
              {activeRoute.stops?.length || 0}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">
              TOTAL STUDENTS
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {routeStudents.length}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">PICKED UP</p>
            <p className="text-2xl font-bold text-green-600">
              {
                routeStudents.filter((s) => s.pickup_status === "picked_up")
                  .length
              }
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">PENDING</p>
            <p className="text-2xl font-bold text-orange-600">
              {
                routeStudents.filter(
                  (s) => s.pickup_status === "pending_pickup"
                ).length
              }
            </p>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b">
            <h3 className="font-semibold text-gray-900">Pickup Sequence</h3>
          </div>

          <div className="divide-y">
            {routeStudents.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No students assigned to this route
              </div>
            ) : (
              routeStudents
                .sort((a, b) => a.sequence_position - b.sequence_position)
                .map((student) => (
                  <div
                    key={student.id}
                    className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                          #{student.sequence_position}
                        </span>
                        <h4 className="font-semibold text-gray-900">
                          {getStudentName(student)}
                        </h4>
                      </div>

                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <FiMapPin className="text-xs" />
                        {getStopName(student)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${getPickupStatusColor(
                          student.pickup_status
                        )}`}
                      >
                        {student.pickup_status === "pending_pickup"
                          ? "Pending"
                          : student.pickup_status === "picked_up"
                            ? "Picked Up"
                            : student.pickup_status === "absent"
                              ? "Absent"
                              : "Skipped"}
                      </span>

                      {student.pickup_status === "pending_pickup" && (
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowPickupFlow(true);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition"
                        >
                          Update
                        </button>
                      )}

                      {student.pickup_status === "picked_up" &&
                        student.current_status === "in_vehicle" && (
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowDropoffFlow(true);
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition"
                          >
                            Dropoff
                          </button>
                        )}

                      {student.current_status === "dropped_off" && (
                        <FiCheckCircle className="text-green-500 text-lg" />
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* End Route Button */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowEndRoute(true)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition flex items-center justify-center gap-2 font-semibold"
          >
            <FiCheckCircle />
            End Route & Confirm Safety Check
          </button>
        </div>
      </div>

      {/* Pickup Flow Modal */}
      <Dialog open={showPickupFlow} onClose={() => setShowPickupFlow(false)}>
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Update Pickup:{" "}
            {selectedStudent ? getStudentName(selectedStudent) : ""}
          </Dialog.Title>

          <Formik
            initialValues={{
              pickup_status: "",
              skip_reason: ""
            }}
            validationSchema={pickupValidationSchema}
            onSubmit={handlePickupStudent}
          >
            {({ isSubmitting, values }) => (
              <Form className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                  Stop:{" "}
                  <span className="font-medium">
                    {selectedStudent ? getStopName(selectedStudent) : ""}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Status *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <Field
                        type="radio"
                        name="pickup_status"
                        value="picked_up"
                        className="mr-2"
                      />
                      <span className="text-sm">✅ Picked Up</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="radio"
                        name="pickup_status"
                        value="absent"
                        className="mr-2"
                      />
                      <span className="text-sm">❌ Absent</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="radio"
                        name="pickup_status"
                        value="skipped"
                        className="mr-2"
                      />
                      <span className="text-sm">⏭️ Skipped</span>
                    </label>
                  </div>
                  <ErrorMessage
                    name="pickup_status"
                    component="span"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {values.pickup_status === "skipped" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Skip *
                    </label>
                    <Field
                      name="skip_reason"
                      as="textarea"
                      rows="3"
                      placeholder="Explain why student was skipped..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <ErrorMessage
                      name="skip_reason"
                      component="span"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowPickupFlow(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Updating..." : "Confirm"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Dialog.Panel>
      </Dialog>

      {/* Dropoff Flow Modal */}
      <Dialog open={showDropoffFlow} onClose={() => setShowDropoffFlow(false)}>
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Complete Dropoff:{" "}
            {selectedStudent ? getStudentName(selectedStudent) : ""}
          </Dialog.Title>

          <Formik
            initialValues={{
              recipient_type: "parent",
              recipient_name: ""
            }}
            validationSchema={dropoffValidationSchema}
            onSubmit={handleDropoffStudent}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-900">
                  <p className="font-medium mb-1">⚠️ SAFETY CRITICAL</p>
                  <p className="text-xs">
                    Ensure you are handing off to an authorized recipient only
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Type *
                  </label>
                  <Field
                    name="recipient_type"
                    as="select"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="parent">Parent</option>
                    <option value="authorized_person">Authorized Person</option>
                  </Field>
                  <ErrorMessage
                    name="recipient_type"
                    component="span"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Name *
                  </label>
                  <Field
                    name="recipient_name"
                    type="text"
                    placeholder="Full name of recipient"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="recipient_name"
                    component="span"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowDropoffFlow(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Dropoff"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Dialog.Panel>
      </Dialog>

      {/* End Route Modal */}
      <Dialog open={showEndRoute} onClose={() => setShowEndRoute(false)}>
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
          <Dialog.Title className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiCheckCircle className="text-red-500" />
            Mandatory Safety Check
          </Dialog.Title>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-sm text-red-900 space-y-2">
            <p className="font-semibold">⚠️ CRITICAL - Before ending route:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>
                Physically inspect the vehicle - confirm NO students remain
              </li>
              <li>Check all seats, under seats, and storage areas</li>
              <li>
                Verify all students have been dropped off or marked absent
              </li>
              <li>This action cannot be undone</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
            <p className="text-gray-700">
              <strong>Students Status:</strong>
            </p>
            <ul className="mt-2 space-y-1 text-xs text-gray-600">
              <li>
                ✅ Dropped Off:{" "}
                <span className="font-semibold">
                  {
                    routeStudents.filter(
                      (s) => s.current_status === "dropped_off"
                    ).length
                  }
                </span>
              </li>
              <li>
                ❌ Absent:{" "}
                <span className="font-semibold">
                  {
                    routeStudents.filter((s) => s.pickup_status === "absent")
                      .length
                  }
                </span>
              </li>
              <li>
                ⏭️ Skipped:{" "}
                <span className="font-semibold">
                  {
                    routeStudents.filter((s) => s.pickup_status === "skipped")
                      .length
                  }
                </span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowEndRoute(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Continue Route
            </button>
            <button
              onClick={handleEndRoute}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
            >
              End Route
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </Fragment>
  );
};

export default RouteExecution;
