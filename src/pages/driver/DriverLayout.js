import React from "react";
import { FiLogOut, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const DriverLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiHome className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Driver Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Radiant Hyve Transportation
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default DriverLayout;
