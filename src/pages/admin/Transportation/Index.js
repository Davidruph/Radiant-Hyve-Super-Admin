import { useState } from "react";
import Tab from "../../../base-component/Tabs/Tabs";

const Index = () => {
  const [activeTab, setActiveTab] = useState(0);
  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  return (
    <div>
      <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
        {activeTab === 0 ? "Vehicle" : "Driver"}
      </h2>

      <div>
        <div className="sm:space-y-0 space-y-4">
          <Tab.Group selectedIndex={activeTab} onChange={handleTabChange}>
            <div
              className={`flex ${activeTab === 0 ? "xl:flex-row flex-col" : "sm:flex-row flex-col"} justify-between xl:gap-0 gap-4`}
            >
              <Tab.List variant="link-tabs" className="w-[20%]">
                <Tab>
                  <Tab.Button
                    className="w-full py-2 whitespace-nowrap"
                    as="button"
                  >
                    Vehicle
                  </Tab.Button>
                </Tab>

                <Tab>
                  <Tab.Button
                    className="w-full py-2 whitespace-nowrap"
                    as="button"
                  >
                    Driver
                  </Tab.Button>
                </Tab>
              </Tab.List>
            </div>

            <Tab.Panels className="mt-5">
              <Tab.Panel className="leading-relaxed">
                {activeTab === 0 && <h2>Vehicle Content</h2>}
              </Tab.Panel>

              <Tab.Panel className="leading-relaxed">
                {activeTab === 1 && <h2>Driver Content</h2>}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

export default Index;
