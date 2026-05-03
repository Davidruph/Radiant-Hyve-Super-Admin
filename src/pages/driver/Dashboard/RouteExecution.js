import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  FiPlay,
  FiCheck,
  FiAlertCircle,
  FiMapPin,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiX
} from "react-icons/fi";
import toast from "react-hot-toast";
import Dialog from "../../../base-component/Dialog/Dialog";
import { DotLoader } from "../../../base-component/Loader/Loader";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  getRoutesApi,
  getActiveRouteApi,
  startRouteApi,
  updatePickupStatusApi,
  completeDropoffApi,
  endRouteApi,
  updateDriverLocationApi
} from "../../../services/api_services";
import moment from "moment";
import { Socket } from "../../../components/Socket/Socket";

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
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeStudents, setRouteStudents] = useState([]);
  const [checklist, setChecklist] = useState({
    vehicle: false,
    safety: false,
    gps: false,
    students: false
  });
  const locationIntervalRef = useRef(null);
  const watchIdRef = useRef(null);          // watchPosition ID
  const lastPositionRef = useRef(null);     // most recent valid GPS fix
  const [gpsStatus, setGpsStatus] = useState("waiting"); // "tracking" | "waiting" | "denied"

  const handleChecklistChange = (name) => {
    setChecklist((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  useEffect(() => {
    restoreActiveRouteIfAny();
  }, []);

  // Real-time: when admin creates a new route assigned to this driver, add it to the list
  useEffect(() => {
    const handleRouteAssigned = (data) => {
      if (!data?.route) return;
      setRoutes((prev) => {
        if (prev.some((r) => r.id === data.route.id)) return prev;
        return [data.route, ...prev];
      });
    };
    Socket.on("transport:route_assigned", handleRouteAssigned);
    return () => Socket.off("transport:route_assigned", handleRouteAssigned);
  }, []);

  // On mount: check if there is an in-progress route and restore it.
  // This handles the case where a driver refreshes the page mid-route.
  const restoreActiveRouteIfAny = async () => {
    try {
      setLoading(true);
      const activeRes = await getActiveRouteApi();
      if (activeRes.data.status === 1 && activeRes.data.data) {
        const route = activeRes.data.data;
        setActiveRoute(route);
        setRouteStudents(route.students || []);
        return; // don't load scheduled routes if one is already active
      }
    } catch {
      // non-critical — fall through to load scheduled routes
    }
    getAssignedRoutes();
  };

  // GPS tracking — uses watchPosition so the browser keeps the GPS session
  // alive and handles kCLErrorLocationUnknown / temporary failures internally.
  // A separate interval sends the latest fix to the backend every 10 s so we
  // don't flood the server on every GPS update.
  useEffect(() => {
    if (!activeRoute) {
      // Route ended or not started — tear everything down
      if (watchIdRef.current != null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
      lastPositionRef.current = null;
      setGpsStatus("waiting");
      return;
    }

    if (!navigator.geolocation) return;

    // Start watching — browser handles retries on kCLErrorLocationUnknown
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        lastPositionRef.current = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        setGpsStatus("tracking");
      },
      (err) => {
        if (err.code === 1) {
          // PERMISSION_DENIED — stop watching, nothing we can do
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
          setGpsStatus("denied");
        } else {
          // POSITION_UNAVAILABLE (2) / TIMEOUT (3) — temporary, watchPosition
          // retries automatically; kCLErrorLocationUnknown maps to these on iOS
          setGpsStatus("waiting");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,   // accept a fix up to 15 s old
        timeout: 30000       // give iOS time to acquire a signal
      }
    );

    // Send the latest cached fix to the backend every 10 s
    const sendLocation = () => {
      const pos = lastPositionRef.current;
      if (!pos) return;
      updateDriverLocationApi({
        route_id: activeRoute.id,
        latitude: pos.latitude,
        longitude: pos.longitude
      }).catch(() => {});
    };

    sendLocation(); // send immediately if we already have a fix
    locationIntervalRef.current = setInterval(sendLocation, 10000);

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    };
  }, [activeRoute]);

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
      if (!route || !route.id) {
        toast.error("Invalid route selection");
        return;
      }

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

  // For pickup/dropoff actions: return the latest cached fix from watchPosition
  // immediately. Only does a fresh one-shot call if nothing is cached yet
  // (e.g. driver just loaded the page and GPS hasn't fired once yet).
  const getCurrentPosition = () => {
    if (lastPositionRef.current) {
      return Promise.resolve(lastPositionRef.current);
    }
    return new Promise((resolve) => {
      if (!navigator.geolocation)
        return resolve({ latitude: null, longitude: null });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const fix = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
          lastPositionRef.current = fix;
          resolve(fix);
        },
        () => resolve({ latitude: null, longitude: null }),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
      );
    });
  };

  const handlePickupStudent = async (values, { resetForm }) => {
    if (!selectedRoute) return;

    try {
      const { latitude, longitude } = await getCurrentPosition();
      const payload = {
        student_transport_id: selectedRoute.id,
        pickup_status: values.pickup_status,
        skip_reason: values.skip_reason || null,
        latitude,
        longitude
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

        setRouteStudents((prev) => {
          const updated = prev.map((s) =>
            s.id === selectedRoute.id
              ? {
                  ...s,
                  pickup_status: values.pickup_status,
                  current_status:
                    values.pickup_status === "picked_up"
                      ? "in_vehicle"
                      : s.current_status
                }
              : s
          );

          // Reflect stop progress in activeRoute.stops
          const stopId = selectedRoute.route_stop_id;
          if (stopId) {
            const studentsAtStop = updated.filter(
              (s) => s.route_stop_id === stopId
            );
            const pending = studentsAtStop.filter(
              (s) => s.pickup_status === "pending_pickup"
            ).length;
            const newStopStatus =
              pending === studentsAtStop.length
                ? "pending"
                : pending === 0
                  ? "completed"
                  : "in_progress";
            setActiveRoute((r) => ({
              ...r,
              stops: (r.stops || []).map((stop) =>
                stop.id === stopId ? { ...stop, status: newStopStatus } : stop
              )
            }));
          }
          return updated;
        });

        resetForm();
        setShowPickupFlow(false);
        setSelectedRoute(null);
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating pickup:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDropoffStudent = async (values, { resetForm }) => {
    if (!selectedRoute) return;

    try {
      const { latitude, longitude } = await getCurrentPosition();
      const payload = {
        student_transport_id: selectedRoute.id,
        recipient_type: values.recipient_type,
        recipient_name: values.recipient_name,
        latitude,
        longitude
      };

      const response = await completeDropoffApi(payload);

      if (response.data.status === 1) {
        toast.success("Student dropped off successfully");

        setRouteStudents((prev) =>
          prev.map((s) =>
            s.id === selectedRoute.id
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
        setSelectedRoute(null);
      } else {
        toast.error(response.data.message || "Failed to complete dropoff");
      }
    } catch (error) {
      console.error("Error completing dropoff:", error);
      toast.error(
        error.response?.data?.message || "Failed to complete dropoff"
      );
    }
  };

  const handleEndRoute = async (values) => {
    try {
      const payload = {
        route_id: activeRoute.id,
        final_vehicle_check_confirmed: values.vehicle_checked
      };

      const response = await endRouteApi(payload);

      if (response.data.status === 1) {
        toast.success("Route ended successfully. Vehicle check confirmed.");
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

  const getStatusColor = (status) => {
    switch (status) {
      case "picked_up":
        return "text-green-600";
      case "pending_pickup":
        return "text-yellow-600";
      case "absent":
        return "text-red-600";
      case "skipped":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "picked_up":
        return "bg-green-100";
      case "pending_pickup":
        return "bg-yellow-100";
      case "absent":
        return "bg-red-100";
      case "skipped":
        return "bg-orange-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Route Execution</h1>
            <p className="text-sm text-gray-600 mt-1">
              {activeRoute
                ? `Active Route: ${activeRoute.route_name}`
                : "Select a route to start"}
            </p>
          </div>

          {activeRoute && (
            <div className="flex items-center space-x-2">
              {gpsStatus === "tracking" && (
                <span className="flex items-center space-x-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span>GPS Active</span>
                </span>
              )}
              {gpsStatus === "waiting" && (
                <span className="flex items-center space-x-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
                  <FiClock className="text-yellow-500" />
                  <span>Getting GPS…</span>
                </span>
              )}
              {gpsStatus === "denied" && (
                <span className="flex items-center space-x-1.5 text-xs font-medium text-red-700 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                  <FiAlertCircle className="text-red-500" />
                  <span>GPS denied — enable in browser settings</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading && !activeRoute ? (
          <div className="flex justify-center items-center h-full">
            <DotLoader />
          </div>
        ) : activeRoute ? (
          <Fragment>
            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-6 w-full">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Stops Done</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {activeRoute.stops?.filter(
                        (s) => s.status === "completed"
                      ).length || 0}
                      <span className="text-base text-gray-400 font-normal">
                        /{activeRoute.stops?.length || 0}
                      </span>
                    </p>
                  </div>
                  <FiMapPin className="text-blue-500 text-3xl" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Students</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {routeStudents.length}
                    </p>
                  </div>
                  <FiUsers className="text-purple-500 text-3xl" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Picked Up</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {
                        routeStudents.filter(
                          (s) => s.pickup_status === "picked_up"
                        ).length
                      }
                    </p>
                  </div>
                  <FiCheck className="text-green-500 text-3xl" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                      {
                        routeStudents.filter(
                          (s) => s.pickup_status === "pending_pickup"
                        ).length
                      }
                    </p>
                  </div>
                  <FiClock className="text-yellow-500 text-3xl" />
                </div>
              </div>
            </div>

            {/* Students grouped by stop — spec: "cannot move to next stop until ALL students marked" */}
            <div className="space-y-4">
              {(() => {
                const sortedStops = [...(activeRoute.stops || [])].sort(
                  (a, b) => a.stop_sequence - b.stop_sequence
                );

                // First stop that still has any pending_pickup student = the current active stop.
                // All stops after it are locked.
                const currentActiveIdx = sortedStops.findIndex((stop) => {
                  const students = routeStudents.filter(
                    (s) => s.route_stop_id === stop.id
                  );
                  return students.some(
                    (s) => s.pickup_status === "pending_pickup"
                  );
                });

                // If no pending pickups, check for in-vehicle students not yet dropped off
                const currentDropoffIdx =
                  currentActiveIdx === -1
                    ? sortedStops.findIndex((stop) => {
                        const students = routeStudents.filter(
                          (s) => s.route_stop_id === stop.id
                        );
                        return students.some(
                          (s) =>
                            s.pickup_status === "picked_up" &&
                            s.current_status !== "dropped_off"
                        );
                      })
                    : -1;

                const activeIdx =
                  currentActiveIdx !== -1
                    ? currentActiveIdx
                    : currentDropoffIdx;

                return sortedStops.map((stop, stopIdx) => {
                  const stopStudents = routeStudents.filter(
                    (s) => s.route_stop_id === stop.id
                  );
                  const handledCount = stopStudents.filter(
                    (s) => s.pickup_status !== "pending_pickup"
                  ).length;
                  const allHandled =
                    stopStudents.length > 0 &&
                    handledCount === stopStudents.length;
                  const inProgress = handledCount > 0 && !allHandled;

                  // A stop is locked if it comes AFTER the current active stop
                  const isLocked = activeIdx !== -1 && stopIdx > activeIdx;

                  const stopBg = isLocked
                    ? "bg-gray-50 border-gray-200 opacity-60"
                    : allHandled
                      ? "bg-green-50 border-green-200"
                      : inProgress
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200";

                  const stopBadge = isLocked
                    ? "bg-gray-100 text-gray-400"
                    : allHandled
                      ? "bg-green-100 text-green-700"
                      : inProgress
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600";

                  return (
                    <div
                      key={stop.id}
                      className={`rounded-lg border ${stopBg} overflow-hidden transition-all`}
                    >
                      {/* Stop header */}
                      <div className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                              isLocked
                                ? "bg-gray-100 border-2 border-gray-200 text-gray-400"
                                : allHandled
                                  ? "bg-green-100 border-2 border-green-300 text-green-700"
                                  : "bg-white border-2 border-gray-300 text-gray-700"
                            }`}
                          >
                            {isLocked ? (
                              <FiAlertCircle className="text-gray-400 text-sm" />
                            ) : (
                              stop.stop_sequence
                            )}
                          </div>
                          <div>
                            <p
                              className={`font-semibold text-sm ${
                                isLocked ? "text-gray-400" : "text-gray-900"
                              }`}
                            >
                              {stop.stop_name}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {stop.stop_type} · {stopStudents.length} student
                              {stopStudents.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${stopBadge}`}
                        >
                          {isLocked
                            ? "🔒 Locked"
                            : allHandled
                              ? "✓ Done"
                              : inProgress
                                ? `${handledCount}/${stopStudents.length}`
                                : "Current"}
                        </span>
                      </div>

                      {/* Lock notice */}
                      {isLocked && (
                        <div className="px-5 pb-3">
                          <p className="text-xs text-gray-400 italic">
                            Complete stop{" "}
                            {sortedStops[activeIdx]?.stop_sequence} —{" "}
                            {sortedStops[activeIdx]?.stop_name} — before
                            proceeding here.
                          </p>
                        </div>
                      )}

                      {/* Students at this stop */}
                      {!isLocked &&
                        (stopStudents.length === 0 ? (
                          <p className="px-5 pb-3 text-xs text-gray-400 italic">
                            No students assigned to this stop
                          </p>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {stopStudents
                              .sort(
                                (a, b) =>
                                  a.sequence_position - b.sequence_position
                              )
                              .map((student) => (
                                <div
                                  key={student.id}
                                  className="flex items-center justify-between px-5 py-3"
                                >
                                  <div className="flex items-center space-x-3 flex-1">
                                    <p className="font-medium text-gray-800 text-sm">
                                      {student?.student?.full_name}
                                    </p>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBgColor(
                                        student.pickup_status
                                      )} ${getStatusColor(student.pickup_status)}`}
                                    >
                                      {student.pickup_status ===
                                      "pending_pickup"
                                        ? "Pending"
                                        : student.pickup_status === "picked_up"
                                          ? student.current_status ===
                                            "dropped_off"
                                            ? "Dropped Off"
                                            : "In Vehicle"
                                          : student.pickup_status}
                                    </span>
                                  </div>

                                  <div className="flex space-x-2">
                                    {student.pickup_status ===
                                      "pending_pickup" && (
                                      <button
                                        onClick={() => {
                                          setSelectedRoute(student);
                                          setShowPickupFlow(true);
                                        }}
                                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition"
                                      >
                                        Pickup
                                      </button>
                                    )}
                                    {student.pickup_status === "picked_up" &&
                                      student.current_status !==
                                        "dropped_off" && (
                                        <button
                                          onClick={() => {
                                            setSelectedRoute(student);
                                            setShowDropoffFlow(true);
                                          }}
                                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition"
                                        >
                                          Dropoff
                                        </button>
                                      )}
                                    {student.current_status ===
                                      "dropped_off" && (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        ✓ Done
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ))}
                    </div>
                  );
                });
              })()}
            </div>

            {(() => {
              const isPickupOnly = activeRoute?.route_type === "pickup";
              const blockedCount = isPickupOnly
                ? routeStudents.filter((s) => s.pickup_status === "pending_pickup").length
                : routeStudents.filter((s) => s.pickup_status === "picked_up" && s.current_status !== "dropped_off").length;
              const blockMsg = isPickupOnly
                ? `${blockedCount} student(s) not yet processed — mark each as picked up, absent, or skipped first.`
                : `${blockedCount} student(s) still in vehicle — complete all dropoffs before ending the route.`;
              return (
                <>
                  {blockedCount > 0 && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-lg flex items-start space-x-3">
                      <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-800 font-medium">{blockMsg}</p>
                    </div>
                  )}
                  <div className="mt-4">
                    <button
                      onClick={() => setShowEndRoute(true)}
                      disabled={blockedCount > 0}
                      className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                    >
                      <FiCheckCircle className="inline mr-2" />
                      End Route &amp; Confirm Vehicle Check
                    </button>
                  </div>
                </>
              );
            })()}
          </Fragment>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">
                      {route.route_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {route?.vehicle?.vehicle_name || "Unassigned Vehicle"}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                    {route.route_type}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <FiMapPin className="text-gray-500" />
                    <span className="text-sm">
                      {route.stops?.length || 0} Stops
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <FiUsers className="text-gray-500" />
                    <span className="text-sm">
                      {route.students?.length || 0} Students
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <FiClock className="text-gray-500" />
                    <span className="text-sm">
                      {moment(route.scheduled_start_time).format("hh:mm A")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowRouteStart(true);
                    setSelectedRoute(route);
                  }}
                  className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
                >
                  <FiPlay className="inline mr-2" />
                  Start Route
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={showRouteStart}
        // setShow={setShowRouteStart}
        title="Start Route - Safety Checklist"
        onClose={() => setShowRouteStart(false)}
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="space-y-4 p-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FiAlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-900">
                      Pre-Start Checklist
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Verify all safety checks before starting the route
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.vehicle}
                    onChange={() => handleChecklistChange("vehicle")}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 font-medium">
                    Vehicle inspection completed
                  </span>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.safety}
                    onChange={() => handleChecklistChange("safety")}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 font-medium">
                    All safety equipment present
                  </span>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.gps}
                    onChange={() => handleChecklistChange("gps")}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 font-medium">
                    GPS tracking enabled
                  </span>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.students}
                    onChange={() => handleChecklistChange("students")}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 font-medium">
                    All students ready
                  </span>
                </label>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleStartRoute(selectedRoute)}
                  disabled={!allChecked}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                    allChecked
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <FiPlay className="inline mr-2" />
                  Start Route
                </button>
                <button
                  onClick={() => setShowRouteStart(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={showPickupFlow}
        title={`Pickup - ${selectedRoute?.student_name}`}
        onClose={() => {
          setShowPickupFlow(false);
          setSelectedRoute(null);
        }}
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <Formik
              initialValues={{
                pickup_status: "picked_up",
                skip_reason: ""
              }}
              validationSchema={pickupValidationSchema}
              onSubmit={handlePickupStudent}
            >
              {({ values }) => (
                <Form className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Student Status
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <Field
                          type="radio"
                          name="pickup_status"
                          value="picked_up"
                          className="w-4 h-4"
                        />
                        <span className="ml-3 text-gray-700 font-medium">
                          Picked Up
                        </span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <Field
                          type="radio"
                          name="pickup_status"
                          value="absent"
                          className="w-4 h-4"
                        />
                        <span className="ml-3 text-gray-700 font-medium">
                          Absent
                        </span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <Field
                          type="radio"
                          name="pickup_status"
                          value="skipped"
                          className="w-4 h-4"
                        />
                        <span className="ml-3 text-gray-700 font-medium">
                          Skipped
                        </span>
                      </label>
                    </div>
                    <ErrorMessage name="pickup_status">
                      {(msg) => (
                        <p className="text-red-500 text-sm mt-1">{msg}</p>
                      )}
                    </ErrorMessage>
                  </div>

                  {values.pickup_status === "skipped" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Skipping
                      </label>
                      <Field
                        as="textarea"
                        name="skip_reason"
                        placeholder="Enter reason for skipping..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <ErrorMessage name="skip_reason">
                        {(msg) => (
                          <p className="text-red-500 text-sm mt-1">{msg}</p>
                        )}
                      </ErrorMessage>
                    </div>
                  )}

                  <div className="flex space-x-3 mt-6">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                    >
                      <FiCheck className="inline mr-2" />
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPickupFlow(false);
                        setSelectedRoute(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={showDropoffFlow}
        // setShow={setShowDropoffFlow}
        title={`Dropoff - ${selectedRoute?.student_name}`}
        onClose={() => {
          setShowDropoffFlow(false);
          setSelectedRoute(null);
        }}
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <Formik
              initialValues={{
                recipient_type: "parent",
                recipient_name: ""
              }}
              validationSchema={dropoffValidationSchema}
              onSubmit={handleDropoffStudent}
            >
              {({ isSubmitting }) => (
              <Form className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Recipient Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Field
                        type="radio"
                        name="recipient_type"
                        value="parent"
                        className="w-4 h-4"
                      />
                      <span className="ml-3 text-gray-700 font-medium">
                        Parent
                      </span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Field
                        type="radio"
                        name="recipient_type"
                        value="authorized_person"
                        className="w-4 h-4"
                      />
                      <span className="ml-3 text-gray-700 font-medium">
                        Authorized Person
                      </span>
                    </label>
                  </div>
                  <ErrorMessage name="recipient_type">
                    {(msg) => (
                      <p className="text-red-500 text-sm mt-1">{msg}</p>
                    )}
                  </ErrorMessage>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name
                  </label>
                  <Field
                    type="text"
                    name="recipient_name"
                    placeholder="Enter recipient name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage name="recipient_name">
                    {(msg) => (
                      <p className="text-red-500 text-sm mt-1">{msg}</p>
                    )}
                  </ErrorMessage>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                  >
                    <FiCheck className="inline mr-2" />
                    {isSubmitting ? "Processing..." : "Complete Dropoff"}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setShowDropoffFlow(false);
                      setSelectedRoute(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-800 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
              )}
            </Formik>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={showEndRoute}
        // setShow={setShowEndRoute}
        title="End Route - Mandatory Vehicle Check"
        onClose={() => setShowEndRoute(false)}
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <Formik
              initialValues={{
                vehicle_checked: false
              }}
              onSubmit={(values) => handleEndRoute(values)}
            >
              {({ values }) => (
                <Form className="p-4 space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-red-900">
                          Final Vehicle Check Required
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          You must physically verify that the vehicle has been
                          checked and no students remain before closing the
                          route.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="space-y-2">
                      <p className="font-medium text-blue-900">
                        Route Summary:
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1 ml-4">
                        <li>✓ Total Students: {routeStudents.length}</li>
                        <li>
                          ✓ Picked Up:{" "}
                          {
                            routeStudents.filter(
                              (s) => s.pickup_status === "picked_up"
                            ).length
                          }
                        </li>
                        <li>
                          ✓ Dropped Off:{" "}
                          {
                            routeStudents.filter(
                              (s) => s.current_status === "dropped_off"
                            ).length
                          }
                        </li>
                      </ul>
                    </div>
                  </div>

                  <label className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Field
                      type="checkbox"
                      name="vehicle_checked"
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700 font-medium">
                      I confirm the vehicle has been checked and all students
                      are accounted for
                    </span>
                  </label>

                  <div className="flex space-x-3 mt-6">
                    <button
                      type="submit"
                      disabled={!values.vehicle_checked}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                    >
                      <FiCheckCircle className="inline mr-2" />
                      End Route
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEndRoute(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

export default RouteExecution;
