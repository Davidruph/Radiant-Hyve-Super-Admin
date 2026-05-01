import React, { useEffect, useRef, useState } from "react";
import {
  FiMapPin,
  FiUsers,
  FiTruck,
  FiNavigation,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle,
  FiClock,
  FiX
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useDebounce } from "use-debounce";
import { DotLoader } from "../../../base-component/Loader/Loader";
import {
  getRoutesApi,
  getTransportExceptionsApi,
  getLiveLocationsApi,
  resolveExceptionApi
} from "../../../services/api_services";
import { Socket } from "../../../components/Socket/Socket";
import moment from "moment";

const GOOGLE_MAPS_KEY = "AIzaSyBBLcXrmcY2pdzrI4uiyhFdOefMDZhxVc4";

const Dashboard = () => {
  const [routes, setRoutes] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [liveLocations, setLiveLocations] = useState({});
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [resolveModal, setResolveModal] = useState(null); // { exception, action }
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolving, setResolving] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user-data") || "{}");
  const socketReadyRef = useRef(false);

  useEffect(() => {
    fetchDashboardData();
    fetchLiveLocations();
  }, []);

  // Subscribe to live location updates via socket
  useEffect(() => {
    const handleLocationUpdate = (data) => {
      setLiveLocations((prev) => ({
        ...prev,
        [data.route_id]: data
      }));
    };

    if (!Socket.connected) {
      Socket.connect();
      Socket.once("connect", () => {
        if (!socketReadyRef.current) {
          socketReadyRef.current = true;
          Socket.emit("socket_register", {
            user_id: userData?.id,
            token_id: localStorage.getItem("token-id")
          });
        }
      });
    }

    const handleStudentUpdate = (data) => {
      setRoutes((prev) =>
        prev.map((route) => {
          if (route.id !== data.route_id) return route;
          return {
            ...route,
            students: (route.students || []).map((s) => {
              if (s.id !== data.student_transport_id) return s;
              return {
                ...s,
                pickup_status: data.pickup_status ?? s.pickup_status,
                current_status: data.current_status ?? s.current_status,
                dropoff_status: data.dropoff_status ?? s.dropoff_status
              };
            })
          };
        })
      );
    };

    const handleException = (data) => {
      setLiveAlerts((prev) => {
        // Avoid duplicates for the same exception_id
        if (prev.some((a) => a.exception_id === data.exception_id)) return prev;
        return [data, ...prev].slice(0, 10);
      });
      // Also refresh exceptions list so it reflects in the panel below
      getTransportExceptionsApi({ page: 1 })
        .then((res) => {
          if (res.data.status === 1) setExceptions(res.data.data);
        })
        .catch(() => {});
    };

    Socket.on("transport:location_update", handleLocationUpdate);
    Socket.on("transport:exception", handleException);
    Socket.on("transport:student_update", handleStudentUpdate);

    return () => {
      Socket.off("transport:location_update", handleLocationUpdate);
      Socket.off("transport:exception", handleException);
      Socket.off("transport:student_update", handleStudentUpdate);
    };
  }, [userData?.id]);

  const fetchLiveLocations = async () => {
    try {
      const res = await getLiveLocationsApi();
      if (res.data.status === 1) {
        const map = {};
        res.data.data.forEach((loc) => {
          map[loc.route_id] = loc;
        });
        setLiveLocations(map);
      }
    } catch {
      // Non-critical — socket will fill the data
    }
  };

  const handleResolveException = async () => {
    if (!resolveModal) return;
    setResolving(true);
    try {
      const res = await resolveExceptionApi(resolveModal.exception.id, {
        action: resolveModal.action,
        resolution_notes: resolutionNotes || null
      });
      if (res.data.status === 1) {
        toast.success(
          resolveModal.action === "acknowledged"
            ? "Exception acknowledged"
            : "Exception resolved"
        );
        setExceptions((prev) =>
          prev.map((e) =>
            e.id === resolveModal.exception.id
              ? { ...e, status: resolveModal.action }
              : e
          )
        );
        setLiveAlerts((prev) =>
          prev.filter(
            (a) => a.exception_id !== resolveModal.exception.id
          )
        );
        setResolveModal(null);
        setResolutionNotes("");
      } else {
        toast.error(res.data.message || "Failed to update exception");
      }
    } catch {
      toast.error("Failed to update exception");
    } finally {
      setResolving(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [routesRes, exceptionsRes] = await Promise.all([
        getRoutesApi({ page: 1 }),
        getTransportExceptionsApi({ page: 1 })
      ]);

      if (routesRes.data.status === 1) {
        setRoutes(routesRes.data.data);
      }

      if (exceptionsRes.data.status === 1) {
        setExceptions(exceptionsRes.data.data);
      }

      await fetchLiveLocations();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRoutes = () => {
    let filtered = routes;

    if (activeFilter !== "all") {
      filtered = filtered.filter((route) => route.status === activeFilter);
    }

    if (debouncedSearch) {
      filtered = filtered.filter(
        (route) =>
          route.route_name
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase()) ||
          route.vehicle_name
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase()) ||
          route.driver_name
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase())
      );
    }

    return filtered;
  };

  const getRouteStats = () => {
    return {
      totalRoutes: routes.length,
      activeRoutes: routes.filter((r) => r.status === "active").length,
      completedRoutes: routes.filter((r) => r.status === "completed").length,
      totalStudents: routes.reduce(
        (sum, r) => sum + (r.students?.length || 0),
        0
      ),
      totalExceptions: exceptions.length,
      openExceptions: exceptions.filter((e) => e.status === "open").length
    };
  };

  const stats = getRouteStats();
  const filteredRoutes = getFilteredRoutes();

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-gray-100 text-gray-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getExceptionSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading && routes.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <DotLoader />
      </div>
    );
  }


  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Transport Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Live tracking and management of all routes
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium transition"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">

          {/* Real-time exception alerts */}
          {liveAlerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {liveAlerts.map((alert, idx) => (
                <div
                  key={alert.exception_id || idx}
                  className={`flex items-start justify-between p-4 rounded-lg border ${
                    alert.severity === "critical"
                      ? "bg-red-50 border-red-400"
                      : alert.severity === "high"
                        ? "bg-orange-50 border-orange-400"
                        : "bg-yellow-50 border-yellow-400"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <FiAlertCircle
                      className={`mt-0.5 flex-shrink-0 ${
                        alert.severity === "critical"
                          ? "text-red-600"
                          : alert.severity === "high"
                            ? "text-orange-600"
                            : "text-yellow-600"
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {alert.severity?.toUpperCase()} —{" "}
                        {alert.exception_type?.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5">
                        {alert.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Route: {alert.route_name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setLiveAlerts((prev) =>
                        prev.filter((a) => a.exception_id !== alert.exception_id)
                      )
                    }
                    className="ml-4 text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <FiAlertTriangle className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Routes</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stats.totalRoutes}
                  </p>
                </div>
                <FiTruck className="text-blue-500 text-3xl" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Routes</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {stats.activeRoutes}
                  </p>
                </div>
                <FiCheckCircle className="text-green-500 text-3xl" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Completed Routes</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {stats.completedRoutes}
                  </p>
                </div>
                <FiCheckCircle className="text-blue-500 text-3xl" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Students</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {stats.totalStudents}
                  </p>
                </div>
                <FiUsers className="text-purple-500 text-3xl" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Exceptions</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {stats.totalExceptions}
                  </p>
                </div>
                <FiAlertCircle className="text-red-500 text-3xl" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Open Issues</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {stats.openExceptions}
                  </p>
                </div>
                <FiAlertTriangle className="text-orange-500 text-3xl" />
              </div>
            </div>
          </div>

          {/* Live Tracking Panel — only shown when routes are active */}
          {Object.keys(liveLocations).length > 0 && (
            <div className="mb-8 bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <h2 className="text-lg font-bold text-gray-800">
                    Live Tracking
                  </h2>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {Object.keys(liveLocations).length} active
                  </span>
                </div>
                <p className="text-xs text-gray-500">Updates every 10 seconds</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {Object.values(liveLocations).map((loc) => {
                  const lat = parseFloat(loc.latitude);
                  const lng = parseFloat(loc.longitude);
                  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${lat},${lng}&zoom=15`;
                  const matchedRoute = routes.find(
                    (r) => r.id === loc.route_id
                  );

                  return (
                    <div
                      key={loc.route_id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {loc.route_name ||
                                matchedRoute?.route_name ||
                                "Active Route"}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              Driver:{" "}
                              {matchedRoute?.driver?.full_name || "—"} •{" "}
                              {matchedRoute?.vehicle?.vehicle_name || "—"}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-green-600 text-xs font-medium">
                              <FiNavigation className="text-xs" />
                              <span>Live</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-400 text-xs mt-1">
                              <FiClock className="text-xs" />
                              <span>
                                {moment(loc.last_updated).fromNow()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <iframe
                        key={`${lat},${lng}`}
                        title={`map-${loc.route_id}`}
                        src={mapSrc}
                        width="100%"
                        height="260"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />

                      <div className="p-3 bg-gray-50 flex items-center space-x-4 text-xs text-gray-500">
                        <FiMapPin className="text-gray-400" />
                        <span>
                          {lat.toFixed(6)}, {lng.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Active Routes
                </h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="search"
                    placeholder="Search routes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FiSearch className="text-gray-400 -ml-8" />
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeFilter === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter("active")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeFilter === "active"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveFilter("completed")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeFilter === "completed"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setActiveFilter("scheduled")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeFilter === "scheduled"
                      ? "bg-gray-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Scheduled
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="p-6 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() =>
                      setSelectedRoute(
                        selectedRoute?.id == route.id ? null : route
                      )
                    }
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {route.route_name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Driver: {route?.driver?.full_name || "Not assigned"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          route.status
                        )}`}
                      >
                        {route.status?.charAt(0).toUpperCase() +
                          route.status?.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Vehicle</p>
                        <p className="font-medium text-gray-800">
                          {route?.vehicle?.vehicle_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Stops</p>
                        <p className="font-medium text-gray-800">
                          {route.stops?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Students</p>
                        <p className="font-medium text-gray-800">
                          {route.students?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Start Time</p>
                        <p className="font-medium text-gray-800">
                          {moment(route.scheduled_start_time).format("hh:mm A")}
                        </p>
                      </div>
                    </div>

                    {route.status === "active" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-700 font-medium">
                          ✓ Route is currently active • Live tracking enabled
                        </p>
                      </div>
                    )}

                    {selectedRoute?.id === route.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-gray-800">
                            Live Student Status
                          </h4>
                          {route.status === "active" && (
                            <span className="flex items-center space-x-1.5 text-xs text-green-600 font-medium">
                              <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                              </span>
                              <span>Live updates on</span>
                            </span>
                          )}
                        </div>

                        {/* Progress bar */}
                        {route.students?.length > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>
                                {route.students.filter((s) => s.pickup_status !== "pending_pickup").length}
                                /{route.students.length} students handled
                              </span>
                              <span>
                                {route.students.filter((s) => s.current_status === "dropped_off").length} dropped off
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.round(
                                    (route.students.filter((s) => s.pickup_status !== "pending_pickup").length /
                                      route.students.length) * 100
                                  )}%`
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {route.students?.map((student) => {
                            const status =
                              student.current_status === "dropped_off"
                                ? { label: "Dropped Off", cls: "bg-blue-100 text-blue-800" }
                                : student.pickup_status === "picked_up"
                                  ? { label: "In Vehicle", cls: "bg-green-100 text-green-800" }
                                  : student.pickup_status === "absent"
                                    ? { label: "Absent", cls: "bg-red-100 text-red-800" }
                                    : student.pickup_status === "skipped"
                                      ? { label: "Skipped", cls: "bg-orange-100 text-orange-800" }
                                      : { label: "Pending", cls: "bg-yellow-100 text-yellow-800" };

                            return (
                              <div
                                key={student.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <p className="font-medium text-gray-800 text-sm">
                                  {student?.student?.full_name}
                                </p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>
                                  {status.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <FiMapPin className="mx-auto text-gray-400 text-4xl mb-3" />
                  <p className="text-gray-600 font-medium">No routes found</p>
                </div>
              )}
            </div>
          </div>

          {exceptions.length > 0 && (
            <div className="mt-8 bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">
                  Exceptions & Issues
                </h2>
                <span className="text-sm text-gray-500">
                  {exceptions.filter((e) => e.status === "open").length} open
                </span>
              </div>

              <div className="divide-y divide-gray-200">
                {exceptions.map((exception) => (
                  <div
                    key={exception.id}
                    className="p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-gray-800 capitalize">
                            {exception.exception_type?.replace(/_/g, " ")}
                          </h3>
                          {exception.student?.full_name && (
                            <span className="text-xs text-gray-500">
                              — {exception.student.full_name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Route: {exception.route?.route_name || "—"}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getExceptionSeverityColor(
                            exception.severity
                          )}`}
                        >
                          {exception.severity}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            exception.status === "open"
                              ? "bg-red-100 text-red-800"
                              : exception.status === "acknowledged"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {exception.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-3">
                      {exception.description}
                    </p>

                    {exception.resolution_notes && (
                      <p className="text-xs text-gray-500 bg-gray-50 rounded p-2 mb-3">
                        Resolution: {exception.resolution_notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        {moment(exception.created_at).format(
                          "MMM DD, YYYY hh:mm A"
                        )}
                        {exception.resolvedBy && (
                          <span>
                            {" "}
                            · Resolved by {exception.resolvedBy.full_name}
                          </span>
                        )}
                      </p>

                      {exception.status !== "resolved" && (
                        <div className="flex space-x-2">
                          {exception.status === "open" && (
                            <button
                              onClick={() =>
                                setResolveModal({
                                  exception,
                                  action: "acknowledged"
                                })
                              }
                              className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded-lg transition"
                            >
                              Acknowledge
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setResolveModal({
                                exception,
                                action: "resolved"
                              })
                            }
                            className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 rounded-lg transition"
                          >
                            Resolve
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exception resolution modal */}
          {resolveModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 text-lg capitalize">
                    {resolveModal.action} Exception
                  </h3>
                  <button
                    onClick={() => {
                      setResolveModal(null);
                      setResolutionNotes("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-800 capitalize">
                      {resolveModal.exception.exception_type?.replace(
                        /_/g,
                        " "
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {resolveModal.exception.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resolution Notes{" "}
                      {resolveModal.action === "resolved" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Describe how this was resolved or what action was taken..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 p-6 pt-0">
                  <button
                    onClick={handleResolveException}
                    disabled={
                      resolving ||
                      (resolveModal.action === "resolved" &&
                        !resolutionNotes.trim())
                    }
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium text-sm transition"
                  >
                    {resolving
                      ? "Saving..."
                      : resolveModal.action === "acknowledged"
                        ? "Acknowledge"
                        : "Mark Resolved"}
                  </button>
                  <button
                    onClick={() => {
                      setResolveModal(null);
                      setResolutionNotes("");
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
