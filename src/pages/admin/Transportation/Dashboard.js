import React, { useEffect, useState } from "react";
import {
  FiMapPin,
  FiUsers,
  FiTruck,
  //   FiAlert,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useDebounce } from "use-debounce";
import { DotLoader } from "../../../base-component/Loader/Loader";
import {
  getRoutesApi,
  getTransportExceptionsApi
} from "../../../services/api_services";
import moment from "moment";

const Dashboard = () => {
  const [routes, setRoutes] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Active Routes
                </h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
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
                        selectedRoute?.id === route.id ? null : route
                      )
                    }
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {route.route_name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Driver: {route.driver_name || "Not assigned"}
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
                          {route.vehicle_name || "N/A"}
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
                        <h4 className="font-bold text-gray-800 mb-3">
                          Route Details
                        </h4>

                        <div className="space-y-3">
                          {route.students?.map((student, idx) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {student.student_name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {student.student_id}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  student.pickup_status === "picked_up"
                                    ? "bg-green-100 text-green-800"
                                    : student.pickup_status === "pending_pickup"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : student.pickup_status === "absent"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {student.pickup_status === "pending_pickup"
                                  ? "Pending"
                                  : student.pickup_status === "picked_up"
                                    ? "Picked Up"
                                    : student.pickup_status}
                              </span>
                            </div>
                          ))}
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
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">
                  Exceptions & Issues
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {exceptions.map((exception) => (
                  <div
                    key={exception.id}
                    className="p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {exception.exception_type?.replace(/_/g, " ")}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Route: {exception.route_name}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getExceptionSeverityColor(
                            exception.severity
                          )}`}
                        >
                          {exception.severity}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
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

                    <p className="text-xs text-gray-500">
                      {moment(exception.created_at).format(
                        "MMM DD, YYYY hh:mm A"
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
