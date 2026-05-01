import { useState } from "react";
import Tab from "../../../base-component/Tabs/Tabs";
import Dashboard from "./Dashboard";
import Vehicle from "./Vehicle";
import Driver from "./Driver";
import Route from "./Route";
import Logs from "./Logs";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = Number(searchParams.get("tab")) || 0;
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  const handleTabChange = (index) => {
    setActiveTab(index);
    setSearchParams({ tab: index });
  };

  const tabLabels = [
    "Dashboard",
    "Vehicle Management",
    "Driver Management",
    "Route Management",
    "Audit Logs"
  ];

  return (
    <div>
      <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
        {tabLabels[activeTab]}
      </h2>

      <div>
        <div className="sm:space-y-0 space-y-4">
          <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
            <div className="flex sm:flex-row flex-col justify-between xl:gap-0 gap-4">
              <Tab.List variant="link-tabs" className="w-auto">
                <Tab>
                  <Tab.Button
                    className="py-2 px-4 whitespace-nowrap"
                    as="button"
                  >
                    Dashboard
                  </Tab.Button>
                </Tab>

                <Tab>
                  <Tab.Button
                    className="py-2 px-4 whitespace-nowrap"
                    as="button"
                  >
                    Vehicles
                  </Tab.Button>
                </Tab>

                <Tab>
                  <Tab.Button
                    className="py-2 px-4 whitespace-nowrap"
                    as="button"
                  >
                    Drivers
                  </Tab.Button>
                </Tab>

                <Tab>
                  <Tab.Button
                    className="py-2 px-4 whitespace-nowrap"
                    as="button"
                  >
                    Routes
                  </Tab.Button>
                </Tab>

                <Tab>
                  <Tab.Button
                    className="py-2 px-4 whitespace-nowrap"
                    as="button"
                  >
                    Audit Logs
                  </Tab.Button>
                </Tab>
              </Tab.List>
            </div>

            <Tab.Panels className="mt-5">
              <Tab.Panel className="leading-relaxed">
                <Dashboard />
              </Tab.Panel>

              <Tab.Panel className="leading-relaxed">
                <Vehicle />
              </Tab.Panel>

              <Tab.Panel className="leading-relaxed">
                <Driver />
              </Tab.Panel>

              <Tab.Panel className="leading-relaxed">
                <Route />
              </Tab.Panel>

              <Tab.Panel className="leading-relaxed">
                <Logs />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

export default Index;
