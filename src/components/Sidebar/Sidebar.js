import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo/Frame 1.png';
import dashboardIcon1 from '../../assets/icons/Dashboard.png';
import dashboardIcon2 from '../../assets/icons/Graph.png';
import SchoolIcon1 from '../../assets/icons/school(1).png';
import SchoolIcon2 from '../../assets/icons/school(2).png';
import MedalIcon2 from '../../assets/icons/medalStar(1).png';
import MedalIcon1 from '../../assets/icons/medal-star(2).png';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab }) => {
  const [hoveredTab, setHoveredTab] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  const tabs = [
    {
      name: "Dashboard",
      icon: dashboardIcon1,
      activeIcon: dashboardIcon2,
      path: "/super_admin/dashboard",
    },
    {
      name: "Mange School",
      icon: SchoolIcon1,
      activeIcon: SchoolIcon2,
      path: "/super_admin/manage_school",
    },
    {
      name: "Subscription Service",
      icon: MedalIcon1,
      activeIcon: MedalIcon2,
      path: "/super_admin/subscription_service",
    },
  ];

  useEffect(() => {
    const currentPath = location.pathname;

    const currentTab = tabs.find(tab => {
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
    setSidebarOpen(false)
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
    <div className="flex h-screen">
      <div
        ref={sidebarRef}
        className={`fixed z-10 inset-y-0 left-0 transition duration-300 bg-[#293FE3] transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:relative lg:translate-x-0 min-w-[275px]`}
      >
        <div className="border-b border-[#F0F1F2] px-6 py-5 cursor-pointer" onClick={() => handleTabClick(tabs[0])}>
          <img src={logo} className="w-[200px] h-[40px]" alt="Logo" />
        </div>
        <div className='h-full overflow-y-auto'>
          <nav className="mt-8 mb-32 mx-3 space-y-3">
            {tabs.map((tab) => (
              <div
                key={tab.name}
                className={`flex w-full items-center h-[44px] px-4 cursor-pointer rounded-xl transition duration-200 font-medium text-sm ${activeTab === tab.name
                  ? "bg-[#FFFFFF] text-[#293FE3]"
                  : "hover:bg-[#FFFFFF] hover:text-[#293FE3] text-[#DFE3EA]"
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
