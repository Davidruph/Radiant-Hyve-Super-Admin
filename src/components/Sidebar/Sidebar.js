import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dashboardIcon1 from "../../assets/icons/Dashboard.png";
import dashboardIcon2 from "../../assets/icons/graph.svg";
import SchoolIcon1 from "../../assets/icons/school(1).png";
import SchoolIcon2 from "../../assets/icons/school2.svg";
import MedalIcon2 from "../../assets/icons/medal.svg";
import MedalIcon1 from "../../assets/icons/medal-star(2).png";

//admin imports
import PrincipalIcon1 from "../../assets/icons/owner 1.png";
import PrincipalIcon2 from "../../assets/icons/owner.svg";
import Staff1 from "../../assets/icons/training1.png";
import Staff2 from "../../assets/icons/training2.svg";
import program1 from "../../assets/icons/calendarsearch1.png";
import program2 from "../../assets/icons/calendarsearch2.svg";
import Parents1 from "../../assets/icons/people.png";
import Parents2 from "../../assets/icons/people1.svg";
import Student1 from "../../assets/icons/graduation1.png";
import Student2 from "../../assets/icons/graduation2.svg";
import UpcomingEvents1 from "../../assets/icons/calendar1.png";
import UpcomingEvents2 from "../../assets/icons/calendar2.svg";
import Certification1 from "../../assets/icons/medal_star1.png";
import Certification2 from "../../assets/icons/medal_star2.svg";
import MealTracking1 from "../../assets/icons/Meal_application_tracking1.png";
import MealTracking2 from "../../assets/icons/Meal_application_tracking2.svg";
import SleepLogs1 from "../../assets/icons/sleep1.png";
import SleepLogs2 from "../../assets/icons/sleep2.svg";
import Medication1 from "../../assets/icons/Medication1.png";
import Medication2 from "../../assets/icons/Medication2.svg";
import Payment1 from "../../assets/icons/Payment1.png";
import Payment2 from "../../assets/icons/Payment2.svg";
import Subscription1 from "../../assets/icons/crown1.png";
import Subscription2 from "../../assets/icons/Crown2.svg";
import Transportation1 from "../../assets/icons/transportation1.svg";
import Transportation2 from "../../assets/icons/transportation2.svg";
import { leaveChatRoom } from "../LeaveRoom/LeaveRoom";

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab }) => {
  const [hoveredTab, setHoveredTab] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const { isSuperAdmin, isSchoolAdmin } = useAuth();
  let userId = localStorage.getItem("radient_school_id");

  const handleLeaveRoom = () => {
    leaveChatRoom(userId);
  };

  // SuperAdmin tabs
  const superAdminTabs = [
    {
      name: "Dashboard",
      icon: dashboardIcon1,
      activeIcon: dashboardIcon2,
      path: "/super_admin/dashboard"
    },
    {
      name: "Manage School",
      icon: SchoolIcon1,
      activeIcon: SchoolIcon2,
      path: "/super_admin/manage_school"
    },
    {
      name: "Manage Subscription",
      icon: MedalIcon1,
      activeIcon: MedalIcon2,
      path: "/super_admin/subscription_service"
    }
  ];

  // SchoolAdmin tabs
  const schoolAdminTabs = [
    {
      name: "Dashboard",
      icon: dashboardIcon1,
      activeIcon: dashboardIcon2,
      path: "/school_admin/dashboard"
    },
    {
      name: "Principal",
      icon: PrincipalIcon1,
      activeIcon: PrincipalIcon2,
      path: "/school_admin/principal"
    },
    {
      name: "Staff",
      icon: Staff1,
      activeIcon: Staff2,
      path: "/school_admin/staff"
    },
    {
      name: "Programs",
      icon: program1,
      activeIcon: program2,
      path: "/school_admin/program"
    },
    {
      name: "Student",
      icon: Student1,
      activeIcon: Student2,
      path: "/school_admin/student"
    },
    {
      name: "Parents",
      icon: Parents1,
      activeIcon: Parents2,
      path: "/school_admin/parents"
    },
    {
      name: "Parents Reminder",
      icon: Parents1,
      activeIcon: Parents2,
      path: "/school_admin/parent_reminder"
    },
    {
      name: "Upcoming Events",
      icon: UpcomingEvents1,
      activeIcon: UpcomingEvents2,
      path: "/school_admin/upcoming_events"
    },
    // {
    //   name: "Programs",
    //   icon: UpcomingEvents1,
    //   activeIcon: UpcomingEvents2,
    //   path: "/school_admin/programs",
    // },
    {
      name: "Certification",
      icon: Certification1,
      activeIcon: Certification2,
      path: "/school_admin/certification"
    },
    {
      name: "Meal Tracking",
      icon: MealTracking1,
      activeIcon: MealTracking2,
      path: "/school_admin/meal_tracking"
    },
    {
      name: "Sleep Logs",
      icon: SleepLogs1,
      activeIcon: SleepLogs2,
      path: "/school_admin/sleep_logs"
    },
    {
      name: "Medication",
      icon: Medication1,
      activeIcon: Medication2,
      path: "/school_admin/medication"
    },
    {
      name: "Payment",
      icon: Payment1,
      activeIcon: Payment2,
      path: "/school_admin/payment"
    },
    {
      name: "Subscription",
      icon: Subscription1,
      activeIcon: Subscription2,
      path: "/school_admin/subscription"
    },
    {
      name: "Transportation",
      icon: Transportation1,
      activeIcon: Transportation2,
      path: "/school_admin/transportation"
    }
  ];

  // Select tabs based on role
  const tabs = isSuperAdmin ? superAdminTabs : schoolAdminTabs;

  useEffect(() => {
    const currentPath = location.pathname;

    const currentTab = tabs.find((tab) => {
      return currentPath === tab.path || currentPath.startsWith(`${tab.path}/`);
    });

    if (currentTab) {
      setActiveTab(currentTab.name);
    } else {
      setActiveTab(null);
    }
  }, [location, tabs, setActiveTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
    setSidebarOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <div className="flex h-screen flex-col">
      <div
        ref={sidebarRef}
        className={`h-full fixed z-10 inset-y-0 left-0 lg:top-0 top-[72px] lg:inset-y-0 transition duration-300 sidebar-new-bg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 lg:top-auto lg:left-auto min-w-[255.1999969482422px]`}
      >
        <div className="h-full overflow-y-auto flex flex-col items-center">
          <nav className="mt-8 mb-32 mx-3 space-y-3">
            <p className="sidebar-nav-text text-center w-full">Navigation</p>
            {tabs.map((tab) => (
              <div
                key={tab.name}
                className={`flex w-full max-w-[207.1999969482422px] items-center h-[44px] px-4 cursor-pointer rounded-xl transition duration-200 sidebar-item ${
                  activeTab === tab.name
                    ? "bg-[#FFFFFF] text-[#8200DB] sidebar-shadow"
                    : "hover:bg-[#FFFFFF] hover:text-[#8200DB] text-[#DFE3EA]"
                }`}
                onClick={() => handleTabClick(tab)}
                onMouseEnter={() => setHoveredTab(tab.name)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <img
                  src={
                    activeTab === tab.name || hoveredTab === tab.name
                      ? tab.activeIcon
                      : tab.icon
                  }
                  className="w-[25px] h-[24px] mr-2"
                  alt={`${tab.name} Icon`}
                />
                {tab.name}
              </div>
            ))}
          </nav>
        </div>
        <button
          className="absolute top-1 right-0 mt-4 mr-4 text-white lg:hidden focus:outline-none"
          onClick={() => setSidebarOpen(false)}
        >
          <svg
            className="w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
