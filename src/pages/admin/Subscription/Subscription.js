import React, { useEffect, useState } from "react";
import payementCardIcon from "../../../assets/icons/payment_card.png";
import stripe from "../../../assets/icons/stripe.png";
import PricingRightIcon from "../../../assets/icons/pricing_right.png";
import { FaCheck } from "react-icons/fa";
import { getSubscriptionApi } from "../../../services/api_services";
import toast from "react-hot-toast";
import { OvalLoader } from "../../../base-component/Loader/Loader";
import { useNavigate } from "react-router-dom";

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
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [nodata, setNodata] = useState(false);
  const navigate = useNavigate();

  const subscriptionTab = [
    { name: "Overview" },
    { name: "Plans" },
    { name: "Payment Details" }
  ];

  useEffect(() => {
    handleGetSubscriptionList();
  }, []);

  const handleGetSubscriptionList = () => {
    setNodata(true);

    getSubscriptionApi()
      .then((res) => {
        const data = res?.data;
        if (res.status === 200) {
          console.log(data);
          setSubscriptionData(data);
        }
        setNodata(false);
      })
      .catch((err) => {
        const errs = err?.response?.data;
        setNodata(false);

        if (err.response.status === 401) {
          if (errs?.errors) {
            toast.error(errs?.errors[0].msg);
          } else {
            toast.error(errs?.message);
          }
          localStorage.removeItem("device_Id");
          localStorage.removeItem("radient-admin-token");
          localStorage.removeItem("refresh_token");
          navigate("/admin/login");
        } else {
          if (errs?.errors) {
            toast.error(errs?.errors[0].msg);
          } else {
            toast.error(errs?.message);
          }
        }
      });
  };

  return (
    <>
      <div className="">
        <div className="flex items-center sm:gap-14 gap-10">
          {subscriptionTab &&
            subscriptionTab?.map((item, index) => (
              <h4
                key={index}
                className={`sm:text-base text-sm cursor-pointer  ${activeTab === item?.name ? "border-b-2 border-[#9810FA] text-[#9810FA]" : "text-[#9CA3AF]"}`}
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
              <h3 className="text-xl font-semibold text-[#9810FA]">
                Premium Plan Activated
              </h3>
              <div className="mt-5">
                <h4 className="text-3xl font-semibold text-[#9810FA]">
                  <sup className="text-sm text-[#1F1F1F] font-normal ">$</sup>
                  129
                  <sub className="text-sm text-[#1F1F1F] font-normal">
                    /Month
                  </sub>
                </h4>
                <p className="text-base mt-[30px]">
                  12 students out of 30 have been accepted.
                </p>
                <div className="border-2 border-[#9810FA] rounded-full mt-5"></div>
              </div>
              <button className="bg-[#9810FA] text-white font-medium text-base sm:w-[200px] w-44 md:py-3 py-2 rounded-lg mt-10">
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
                            className={`border-b border-[#E5E7EB]  px-4 py-3 text-sm font-normal whitespace-nowrap ${index === 0 ? "text-[#9810FA]" : "text-[#4B5563]"}`}
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
            <h3 className="text-[#9810FA] md:text-xl text-lg font-semibold">
              Pricing Plans
            </h3>
            <p className="lg:text-base sm:text-sm text-sm mt-3">
              Choose a plan that best suits your needs and scale your school's
              operations.
            </p>
          </div>
          {nodata ? (
            <OvalLoader />
          ) : (
            <div className="grid grid-cols-12 gap-5 mt-6">
              {subscriptionData?.data?.map((item, index) => (
                <div
                  key={index}
                  className="xl:col-span-6 md:col-span-9 col-span-12 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow md:px-6 px-4 py-6 border border-[#E5E7EB]"
                >
                  {/* Header with Status Badge */}
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E5E7EB]">
                    <h3 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
                      {item.package_name}
                    </h3>
                    {/* <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </span> */}
                  </div>

                  {/* Service Type */}
                  <div className="mb-4">
                    <h4 className="text-[#4B5563] font-semibold md:text-sm text-xs uppercase tracking-wide mb-1">
                      Service Type
                    </h4>
                    <span className="text-[#9810FA] font-semibold md:text-base text-sm bg-[#9810FA]/10 px-3 py-1 rounded-lg inline-block">
                      {item.service_type}
                    </span>
                  </div>

                  {/* Service Fee */}
                  <div className="mb-5">
                    <h4 className="text-[#4B5563] font-semibold md:text-sm text-xs uppercase tracking-wide mb-1">
                      Service Fee
                    </h4>
                    <span className="text-green-600 font-bold md:text-2xl text-xl">
                      ${item.service_fee}
                    </span>
                    <span className="text-[#6B757D] text-xs ml-2">
                      /{item.service_type === "Monthly" ? "month" : "year"}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="mb-5 pb-4 border-b border-[#E5E7EB]">
                    <h4 className="text-[#4B5563] font-semibold md:text-sm text-xs uppercase tracking-wide mb-2">
                      Description
                    </h4>
                    <p className="text-[#3B4045] font-medium md:text-sm text-xs leading-relaxed text-justify line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-5">
                    <h4 className="text-[#4B5563] font-semibold md:text-sm text-xs uppercase tracking-wide mb-3">
                      Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {item?.Features?.map((feature, idx) => (
                        <span
                          key={idx}
                          className="bg-[#9810FA]/5 border border-[#9810FA] text-[#9810FA] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#9810FA]/10 transition-colors"
                        >
                          ✓ {feature?.feature_name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2 pt-4 border-t border-[#E5E7EB]">
                    <button className="flex-1 bg-[#9810FA] hover:bg-[#1e2fa8] text-white font-medium md:text-sm text-xs py-2 rounded-lg transition-colors">
                      Subscribe Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            className="bg-[#9810FA] text-white font-medium text-base xl:w-[504px] lg:w-[400px] md:w-80 sm:w-64 w-52 md:py-3 py-2 rounded-lg mt-10"
          >
            Pay Now
          </button>
        </div>
      )}
    </>
  );
};

export default Subscription;
