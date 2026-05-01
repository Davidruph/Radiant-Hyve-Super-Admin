import React, { useEffect, useState } from "react";
import {
  FiActivity,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin
} from "react-icons/fi";
import { DotLoader } from "../../../base-component/Loader/Loader";
import { getTransportLogsApi } from "../../../services/api_services";
import moment from "moment";

const EVENT_META = {
  route_started:    { label: "Route Started",    color: "bg-blue-100 text-blue-800" },
  pickup_completed: { label: "Picked Up",        color: "bg-green-100 text-green-800" },
  pickup_absent:    { label: "Absent",           color: "bg-red-100 text-red-800" },
  pickup_skipped:   { label: "Skipped",          color: "bg-orange-100 text-orange-800" },
  dropoff_completed:{ label: "Dropped Off",      color: "bg-teal-100 text-teal-800" },
  dropoff_exception:{ label: "Dropoff Exception",color: "bg-red-100 text-red-800" },
  final_check:      { label: "Vehicle Check",    color: "bg-purple-100 text-purple-800" },
  route_ended:      { label: "Route Ended",      color: "bg-gray-100 text-gray-700" },
  location_update:  { label: "Location Update",  color: "bg-gray-50 text-gray-500" }
};

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [eventFilter, setEventFilter] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [page, eventFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page };
      const res = await getTransportLogsApi(params);
      if (res.data.status === 1) {
        const rows = res.data.data;
        // Client-side event filter (logs API doesn't support event_type filter yet)
        setLogs(eventFilter ? rows.filter((l) => l.event_type === eventFilter) : rows);
        setTotalPages(res.data.pagination?.pages || 1);
      }
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = search
    ? logs.filter(
        (l) =>
          l.driver?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          l.student?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          l.route?.route_name?.toLowerCase().includes(search.toLowerCase()) ||
          l.event_description?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Transport Logs</h1>
            <p className="text-sm text-gray-600 mt-1">
              Complete audit trail of all transport events
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search driver, student, route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={eventFilter}
            onChange={(e) => { setEventFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Events</option>
            {Object.entries(EVENT_META).map(([key, meta]) => (
              <option key={key} value={key}>{meta.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <DotLoader />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FiActivity className="mx-auto text-gray-400 text-4xl mb-3" />
            <p className="text-gray-600 font-medium">No logs found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {filteredLogs.map((log) => {
              const meta = EVENT_META[log.event_type] || {
                label: log.event_type,
                color: "bg-gray-100 text-gray-700"
              };
              const hasGps =
                log.latitude && log.longitude &&
                Number(log.latitude) !== 0 &&
                Number(log.longitude) !== 0;

              return (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {/* Event badge */}
                      <span
                        className={`flex-shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}
                      >
                        {meta.label}
                      </span>

                      <div className="min-w-0">
                        <p className="text-sm text-gray-800 font-medium truncate">
                          {log.event_description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
                          {log.route?.route_name && (
                            <span>Route: {log.route.route_name}</span>
                          )}
                          {log.driver?.full_name && (
                            <span>Driver: {log.driver.full_name}</span>
                          )}
                          {log.student?.full_name && (
                            <span>Student: {log.student.full_name}</span>
                          )}
                          {hasGps && (
                            <span className="flex items-center space-x-1">
                              <FiMapPin size={10} />
                              <span>
                                {Number(log.latitude).toFixed(4)},{" "}
                                {Number(log.longitude).toFixed(4)}
                              </span>
                            </span>
                          )}
                        </div>

                        {log.additional_data &&
                          Object.keys(log.additional_data).length > 0 && (
                            <details className="mt-1">
                              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                                Details
                              </summary>
                              <pre className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.additional_data, null, 2)}
                              </pre>
                            </details>
                          )}
                      </div>
                    </div>

                    <p className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap">
                      {moment(log.created_at).format("MMM D, HH:mm:ss")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition"
            >
              <FiChevronLeft />
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition"
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
