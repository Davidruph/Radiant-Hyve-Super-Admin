import React, { useState } from "react";
import payementCardIcon from "../../../assets/icons/payment_card.png";
import stripe from "../../../assets/icons/stripe.png";
import PricingRightIcon from "../../../assets/icons/pricing_right.png";
import { FaCheck } from "react-icons/fa";

const CustomRadio = ({ name, value, selected, onChange }) => {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected === value}
        onChange={() => onChange(value)}
        className="hidden"
      />
      <div
        className={`w-6 h-6 flex items-center justify-center rounded-full ${
          selected === value
            ? "bg-blue-600"
            : "bg-white border border-[#E6E6E6]"
        } transition-all`}
      >
        {selected === value && <FaCheck className="text-white text-sm" />}
      </div>
    </label>
  );
};

const Subscription = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [selected, setSelected] = useState("1");

  const subscriptionTab = [
    { name: "Overview" },
    { name: "Plans" },
    { name: "Payment Details" }
  ];

  return (
    <>
      <div className="">
        <div className="flex items-center sm:gap-14 gap-10">
          {subscriptionTab &&
            subscriptionTab?.map((item, index) => (
              <h4
                key={index}
                className={`sm:text-base text-sm cursor-pointer  ${activeTab === item?.name ? "border-b-2 border-[#293FE3] text-[#293FE3]" : "text-[#9CA3AF]"}`}
                onClick={() => setActiveTab(item?.name)}
              >
                {item?.name}
              </h4>
            ))}
        </div>
      </div>

      {activeTab === "Overview" && (
        <div>
          <div className="mt-6">
            <div className="border-2 border-[#FFB30B] rounded-lg bg-[#FFF4DA] sm:w-[504px] w-full sm:p-[30px] p-4 text-center">
              <h3 className="text-xl font-semibold text-[#293FE3]">
                Premium Plan Activated
              </h3>
              <div className="mt-5">
                <h4 className="text-3xl font-semibold text-[#293FE3]">
                  <sup className="text-sm text-[#1F1F1F] font-normal ">$</sup>
                  129
                  <sub className="text-sm text-[#1F1F1F] font-normal">
                    /Month
                  </sub>
                </h4>
                <p className="text-base mt-[30px]">
                  12 students out of 30 have been accepted.
                </p>
                <div className="border-2 border-[#293FE3] rounded-full mt-5"></div>
              </div>
              <button className="bg-[#293FE3] text-white font-medium text-base sm:w-[200px] w-44 md:py-3 py-2 rounded-lg mt-10">
                Upgrade Plan
              </button>
            </div>
          </div>
          <div className=" mt-[34px]">
            <h3 className="text-xl font-semibold">Invoices</h3>
            <div className="bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg mt-5">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm ">
                  <thead className="bg-[#F8FAFB]">
                    <tr className="">
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap">
                        Subscription Id
                      </th>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap">
                        Amount
                      </th>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap">
                        Plan
                      </th>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap">
                        Method
                      </th>
                      <th className="p-4 text-left text-[#3B4045] font-medium text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array(5)
                      .fill()
                      .map((_, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                            01234567890123
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                            $129.00
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                            Monthly Plan
                          </td>
                          <td className="border-b border-[#E5E7EB] text-[#4B5563] px-4 py-3 text-sm font-normal whitespace-nowrap">
                            MASTERCARD404010
                          </td>
                          <td
                            className={`border-b border-[#E5E7EB]  px-4 py-3 text-sm font-normal whitespace-nowrap ${index === 0 ? "text-[#293FE3]" : "text-[#4B5563]"}`}
                          >
                            Paid On 28/11/2024
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Plans" && (
        <div className="mt-6">
          <div>
            <h3 className="text-[#293FE3] md:text-xl text-lg font-semibold">
              Pricing Plans
            </h3>
            <p className="lg:text-base sm:text-sm text-sm mt-3">
              Add principals, teachers, students, and more to build your team’s
              success from the start.
            </p>
          </div>
          <div>
            <div className="sm:flex items-center gap-6">
              <div
                className="2xl:w-[504px] xl:w-[450px] lg:w-[400px] md:w-96 w-full sm:max-w-full max-w-80 rounded-xl 2xl:p-[30px] xl:p-7 lg:p-6 p-5 mt-6 "
                style={{
                  background: "linear-gradient(to bottom, #9EAAFF, #FFE3A5)"
                }}
              >
                <h3 className="md:text-2xl text-lg font-semibold text-[#293FE3] !leading-none">
                  Free
                </h3>
                <p className="md:mt-[30px] sm:mt-6 mt-4 text-sm">
                  Lorem ipsum dolor sit amet
                </p>
                <button className="bg-[#293FE3] text-white font-medium md:text-base text-sm w-full md:py-3 py-2 rounded-lg md:my-[30px] my-6">
                  Subscribe
                </button>
                {Array(5)
                  .fill()
                  .map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-5 md:mb-5 mb-3"
                    >
                      <img
                        src={PricingRightIcon}
                        alt="..."
                        className="w-4 h-4"
                      />
                      <p className="text-sm">Lorem ipsum dolor sit amet</p>
                    </div>
                  ))}
              </div>
              <div
                className="2xl:w-[504px] xl:w-[450px] lg:w-[400px] md:w-96 w-full sm:max-w-full max-w-80 rounded-xl 2xl:p-[30px] xl:p-7 lg:p-6 p-5 mt-6"
                style={{
                  background: "linear-gradient(to bottom, #9EAAFF, #FFE3A5)"
                }}
              >
                <h3 className="md:text-2xl text-lg font-semibold text-[#293FE3] !leading-none">
                  $199.00<sub className="text-sm">/monthly</sub>
                </h3>
                <p className="mt-[30px] text-sm">Lorem ipsum dolor sit amet</p>
                <button className="bg-[#293FE3] text-white font-medium md:text-base text-sm w-full md:py-3 py-2 rounded-lg my-[30px]">
                  Subscribe
                </button>
                {Array(5)
                  .fill()
                  .map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-5 md:mb-5 mb-3"
                    >
                      <img
                        src={PricingRightIcon}
                        alt="..."
                        className="w-4 h-4"
                      />
                      <p className="text-sm">Lorem ipsum dolor sit amet</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Payment Details" && (
        <div className="mt-6">
          <div>
            <h4 className="sm:text-[18px] text-base font-medium">
              Card Payment
            </h4>
            <div className="bg-[#FFFFFF] xl:w-[636px] lg:w-[550px] md:w-[450px] sm:w-[400px] w-full flex items-center justify-between rounded-lg mt-5 px-5 py-2 h-[62px]">
              <div className="flex items-center gap-3">
                <img src={payementCardIcon} alt="..." className="w-12 h-7" />
                <div className="">
                  <p className="sm:text-base text-sm font-medium">
                    Marvin McKenney
                  </p>
                  <p className="sm:text-base mt-1 text-sm font-medium">
                    **** **** **** 2508
                  </p>
                </div>
              </div>
              <CustomRadio
                name="option"
                value="1"
                selected={selected}
                onChange={setSelected}
              />
            </div>
            <button className="bg-[#DFE3EA] text-[#6B7280] font-medium text-sm sm:w-[200px] w-44 md:py-3 py-2 rounded-lg mt-[30px] ">
              Add New Card
            </button>
          </div>
          <div className="mt-[30px]">
            <h4 className="sm:text-[18px] text-base font-medium">
              Other Payment Method
            </h4>
            <div className="bg-[#FFFFFF] xl:w-[636px] lg:w-[550px] md:w-[450px] sm:w-[400px] w-full flex items-center justify-between rounded-lg mt-5 px-5 py-2 h-[62px]">
              <div className="flex items-center gap-3">
                <img src={stripe} alt="..." className="w-12 h-7" />
                <p className="sm:text-base text-sm font-medium">
                  Marvin McKenney
                </p>
              </div>
              <CustomRadio
                name="option"
                value="2"
                selected={selected}
                onChange={setSelected}
              />
            </div>
          </div>
          <button
            type="button"
            name="payNow"
            className="bg-[#293FE3] text-white font-medium text-base xl:w-[504px] lg:w-[400px] md:w-80 sm:w-64 w-52 md:py-3 py-2 rounded-lg mt-10"
          >
            Pay Now
          </button>
        </div>
      )}
    </>
  );
};

export default Subscription;
