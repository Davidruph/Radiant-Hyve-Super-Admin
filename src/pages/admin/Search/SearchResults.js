import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  getAllStudentListApi,
  getStaffListApi,
  getParentsListApi,
  getPrincipalListApi
} from "../../../services/api_services";
import { DotLoader } from "../../../base-component/Loader/Loader";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupedResults, setGroupedResults] = useState({});

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const grouped = {
        students: [],
        staff: [],
        parents: [],
        principals: []
      };

      // Search students
      try {
        const studentsRes = await getAllStudentListApi();
        if (studentsRes?.data?.data) {
          grouped.students = studentsRes.data.data
            .filter(
              (s) =>
                s?.first_name?.toLowerCase().includes(query.toLowerCase()) ||
                s?.last_name?.toLowerCase().includes(query.toLowerCase()) ||
                s?.email?.toLowerCase().includes(query.toLowerCase()) ||
                s?.roll_number?.toLowerCase().includes(query.toLowerCase())
            )
            .map((s) => ({
              id: s.id,
              name: `${s.first_name} ${s.last_name}`,
              email: s.email,
              type: "Student",
              subInfo: s.roll_number || "Roll: N/A",
              route: `/school_admin/student_details/${s.id}`,
              icon: "👤"
            }));
        }
      } catch (err) {
        console.error("Student search error:", err);
      }

      // Search staff
      try {
        const staffRes = await getStaffListApi();
        if (staffRes?.data?.data) {
          grouped.staff = staffRes.data.data
            .filter(
              (s) =>
                s?.name?.toLowerCase().includes(query.toLowerCase()) ||
                s?.email?.toLowerCase().includes(query.toLowerCase()) ||
                s?.designation?.toLowerCase().includes(query.toLowerCase())
            )
            .map((s) => ({
              id: s.id,
              name: s.name,
              email: s.email,
              type: "Staff",
              subInfo: s.designation || "Staff",
              route: `/school_admin/staff_details/${s.id}`,
              icon: "👨‍💼"
            }));
        }
      } catch (err) {
        console.error("Staff search error:", err);
      }

      // Search parents
      try {
        const parentsRes = await getParentsListApi();
        if (parentsRes?.data?.data) {
          grouped.parents = parentsRes.data.data
            .filter(
              (p) =>
                p?.name?.toLowerCase().includes(query.toLowerCase()) ||
                p?.email?.toLowerCase().includes(query.toLowerCase())
            )
            .map((p) => ({
              id: p.id,
              name: p.name,
              email: p.email,
              type: "Parent",
              subInfo: p.phone || "Parent",
              route: `/school_admin/parents_details/${p.id}`,
              icon: "👨‍👩‍👧"
            }));
        }
      } catch (err) {
        console.error("Parents search error:", err);
      }

      // Search principals
      try {
        const principalsRes = await getPrincipalListApi();
        if (principalsRes?.data?.data) {
          grouped.principals = principalsRes.data.data
            .filter(
              (p) =>
                p?.name?.toLowerCase().includes(query.toLowerCase()) ||
                p?.email?.toLowerCase().includes(query.toLowerCase())
            )
            .map((p) => ({
              id: p.id,
              name: p.name,
              email: p.email,
              type: "Principal",
              subInfo: "Principal",
              route: `/school_admin/principal_details/${p.id}`,
              icon: "👨‍💼"
            }));
        }
      } catch (err) {
        console.error("Principals search error:", err);
      }

      setGroupedResults(grouped);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = Object.values(groupedResults).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  const renderCategory = (categoryName, items) => {
    if (items.length === 0) return null;

    const categoryLabels = {
      students: "Students",
      staff: "Staff",
      parents: "Parents",
      principals: "Principals"
    };

    return (
      <div key={categoryName} className="mb-8">
        <h3 className="text-lg font-semibold text-[#274372] mb-4 flex items-center gap-2">
          {items[0]?.icon} {categoryLabels[categoryName]} ({items.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.route)}
              className="p-4 border border-[#E5E7EB] rounded-lg hover:shadow-lg hover:border-[#293FE3] cursor-pointer transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#0F1113] text-sm">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#6B7280] mt-1">{item.email}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{item.subInfo}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-[#E0E7FF] text-[#293FE3] text-xs rounded">
                    {item.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-[#F3F5F9] min-h-screen">
      <div className="max-w-7xl">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#274372] mb-2">
            Search Results
          </h1>
          <p className="text-[#6B7280]">
            Found{" "}
            <span className="font-semibold text-[#293FE3]">{totalResults}</span>{" "}
            result{totalResults !== 1 ? "s" : ""} for "
            <span className="font-semibold">{query}</span>"
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <DotLoader color="#293FE3" />
          </div>
        )}

        {/* Results */}
        {!loading && totalResults === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-[#274372] mb-2">
              No results found
            </h3>
            <p className="text-[#6B7280] mb-6">
              Try searching with different keywords
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-[#293FE3] text-white rounded-lg hover:bg-[#1e2aa8] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-lg p-6">
              {renderCategory("students", groupedResults.students)}
              {renderCategory("staff", groupedResults.staff)}
              {renderCategory("parents", groupedResults.parents)}
              {renderCategory("principals", groupedResults.principals)}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SearchResults;
