import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import Dialog from "../../../base-component/Dialog/Dialog";
import { IoMdClose } from "react-icons/io";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import DeleteModalIcon from "../../../assets/icons/DeleteIcon(1).png";
import EditIcon from "../../../assets/icons/edit.png";
import DeleteIcon from "../../../assets/icons/trash.png";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";

export default function Programs() {
  const [addProgramModal, setAddProgramModal] = useState(false);
  const [editProgramModal, setEditProgramModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [programName, setProgramName] = useState("Program 1");

  const programData = [
    {
      id: 1,
      className: "Program 1"
    },
    {
      id: 2,
      className: "Program 2"
    },
    {
      id: 3,
      className: "Program 3"
    }
  ];

  return (
    <div>
      <div className="flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-4 sy justify-between mb-5">
        <h2 className="text-[#1F1F1F] font-semibold md:text-lg text-base">
          Programs List
        </h2>
        <div className="flex sm:flex-row flex-col items-start md:gap-2 gap-3">
          <button
            className="flex items-center justify-center space-x-1 py-2 px-5 bg-[#293FE3] rounded-lg"
            onClick={() => setAddProgramModal(true)}
          >
            <FiPlus className="text-white text-2xl" />
            <span className="text-white text-sm font-normal">Add Program</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-12 2xl:gap-x-6 xl:w-[90%] w-full lg:gap-x-5 gap-4">
        {programData &&
          programData.map((item, index) => (
            <div
              className="2xl:col-span-3 xl:col-span-4 sm:col-span-4 col-span-12"
              key={index}
            >
              <div className="bg-[#FFF0E6] py-[25px] hover:shadow-lg duration-300 cursor-pointer px-[24px] rounded-lg flex items-center 2xl:gap-x-6 lg:gap-x-4 md:gap-4 gap-3 ">
                <div className="flex items-center justify-between w-full">
                  <p className="text-[#1F1F1F] md:text-lg text-base font-medium">
                    {item?.className}
                  </p>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild className="outline-none">
                      <button className="p-2">
                        <PiDotsThreeOutlineVerticalFill className="text-[#1F1F1F] text-xl" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="bg-white absolute -right-5 w-[200px] shadow-lg rounded-lg p-2 text-start animate-dropdown"
                        sideOffset={5}
                      >
                        <DropdownMenu.Item
                          className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-2 border-b border-[#E9E9E9] hover:bg-gray-100"
                          onClick={() => setEditProgramModal(true)}
                        >
                          <img
                            src={EditIcon}
                            className="w-[24px] h-[24px]"
                            alt=""
                          />
                          <span className="text-[#1F1F1F] font-normal text-sm">
                            Edit
                          </span>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-2 hover:bg-gray-100"
                          onClick={() => setDeleteModal(true)}
                        >
                          <img
                            src={DeleteIcon}
                            className="w-[24px] h-[24px]"
                            alt=""
                          />
                          <span className="text-[#1F1F1F] font-normal text-sm">
                            Delete
                          </span>
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>
            </div>
          ))}
      </div>

      <Dialog
        open={addProgramModal}
        onClose={() => setAddProgramModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-xl text-lg font-semibold text-[#1F1F1F]">
                  Add Program
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setAddProgramModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <form className="mt-7">
                <div className="px-2">
                  <div className="">
                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Program Name
                      </label>
                      <input
                        type="email"
                        placeholder="Enter Program name"
                        className={`w-full border border-[#E5E7EB] px-4 py-3 rounded-lg disabled:text-[#6B7280] focus:ring-2 focus:ring-gray-400 focus:outline-none`}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-10 flex justify-between md:w-[400px] w-full mx-auto mb-3 ">
                  <button
                    type="button"
                    onClick={() => setAddProgramModal(false)}
                    className="bg-[#DFE3EA] w-full md:py-3 py-2 font-medium md:text-base text-sm text-[#6B7280] rounded-lg mr-5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#293FE3] text-white font-medium md:text-base text-sm w-full md:py-3 py-2 rounded-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      setAddProgramModal(false);
                    }}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={editProgramModal}
        onClose={() => setEditProgramModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start my-3">
                <h1 className="md:text-xl text-lg font-semibold text-[#1F1F1F]">
                  Add Program
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setEditProgramModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <form className="mt-7">
                <div className="px-2">
                  <div className="">
                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Program Name
                      </label>
                      <input
                        type="email"
                        placeholder="Enter Program name"
                        value={programName}
                        onChange={(e) => setProgramName(e.target.value)}
                        className={`w-full border border-[#E5E7EB] px-4 py-3 rounded-lg disabled:text-[#6B7280] focus:ring-2 focus:ring-gray-400 focus:outline-none`}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-10 flex justify-between md:w-[400px] w-full mx-auto mb-3 ">
                  <button
                    type="button"
                    onClick={() => setEditProgramModal(false)}
                    className="bg-[#DFE3EA] w-full md:py-3 py-2 font-medium md:text-base text-sm text-[#6B7280] rounded-lg mr-5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#293FE3] text-white font-medium md:text-base text-sm w-full md:py-3 py-2 rounded-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditProgramModal(false);
                    }}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className="md:px-8 px-3 py-5">
              <div className="w-full relative sm:text-center text-start md:my-3 my-0">
                <h1 className="md:text-xl text-lg mr-2 font-semibold text-[#1F1F1F]">
                  Delete Program
                </h1>
                <button
                  className="absolute top-0 right-0"
                  onClick={() => setDeleteModal(false)}
                >
                  <IoMdClose className="text-2xl text-black" />
                </button>
              </div>
              <div className="mt-7">
                <div className="px-2">
                  <div className="w-full flex items-center justify-center">
                    <img
                      src={DeleteModalIcon}
                      className="w-[104px] h-[104px]"
                      alt=""
                    />
                  </div>
                  <div className="w-full mt-5 text-center">
                    <h4 className="text-[#1F1F1F] font-semibold md:text-lg text-base mb-4">
                      Are you sure you want to delete this Program?
                    </h4>
                  </div>
                </div>
                <div className="mt-10 flex justify-between w-full mb-3">
                  <button
                    type="button"
                    onClick={() => setDeleteModal(false)}
                    className="bg-[#DFE3EA] w-full py-3 font-medium md:text-base text-sm text-[#6B7280] rounded-lg mr-5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#FF7373] text-white font-medium md:text-base text-sm w-full py-3 rounded-lg"
                    onClick={() => {
                      setDeleteModal(false);
                    }}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
