import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";

const MainLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Dashboard");

    useEffect(() => {
        const handleResize = () => {
            const isLargeScreen = window.matchMedia("(min-width: 1024px)").matches;
            if (isLargeScreen && sidebarOpen) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [sidebarOpen]);

    return (
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
            <div className="flex h-screen overflow-hidden">
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab} />
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        activeTab={activeTab} />
                    <main className={`bg-[#F3F5F9] py-5 md:px-5 px-3 h-full ${sidebarOpen ? "overflow-hidden" : "overflow-auto"} `}>
                        <div className="mx-auto max-w-full mt-2">
                            <Outlet />
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
