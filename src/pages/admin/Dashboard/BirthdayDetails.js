import React from "react";
import BackIcon from "../../../assets/icons/BackIcon.png";
import { useNavigate } from "react-router-dom";
import profilePicture from "../../../assets/images/Ellipse1.png";

export default function BirthdayDetails() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="mb-5">
        <button
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <img src={BackIcon} className="w-[38px] h-[38px]" alt="" />
          <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
            Back
          </span>
        </button>
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="lg:col-span-4 col-span-12 bg-white max-h-[282px] rounded-lg p-5">
          <div className="flex flex-col items-center justify-center">
            <img
              src={profilePicture}
              className="object-cover w-[138px] h-[138px]"
              alt=""
            />
            <h3 className="text-[#0F1113] font-medium md:text-base text-sm mt-4">
              James Thornton
            </h3>
          </div>
        </div>
        <div className="lg:col-span-8 col-span-12 bg-white rounded-lg p-5">
          <h2 className="text-[#1F1F1F] font-semibold md:text-xl text-lg">
            Principal Information
          </h2>
          <div className="mt-7 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-[#4B5563] text-sm font-normal">Full Name</h4>
              <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                James Thornton
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-[#4B5563] text-sm font-normal">
                Phone Number
              </h4>
              <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                + 1 98765 54321
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-[#4B5563] text-sm font-normal">Gender</h4>
              <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                Male
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-[#4B5563] text-sm font-normal">
                Date of Birth
              </h4>
              <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                22/10/2024
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-[#4B5563] text-sm font-normal">
                Qualification
              </h4>
              <span className="text-[#1F1F1F] text-end font-normal md:text-base text-sm">
                M.Ed., Leadership Training
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-[#4B5563] text-sm font-normal">
                Designation
              </h4>
              <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                Principal
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-[#4B5563] text-sm font-normal">Experience</h4>
              <span className="text-[#1F1F1F] font-normal md:text-base text-sm">
                2 Year
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
