import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import documentIcon from '../../assets/icons/document-text.png';
import documentIcon2 from '../../assets/icons/Downloaddocument.png';
import { SubscriptionTable } from '../../data/Data';
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { PiDotsThreeOutlineVerticalFill } from 'react-icons/pi';
import Pagination from '../../base-component/Pagination/Pagination';
import { GrNext, GrPrevious } from 'react-icons/gr';
import Dialog from '../../base-component/Dialog/Dialog';
import { IoMdClose } from 'react-icons/io';
import { Field, Select } from '@headlessui/react';
import { FaCaretUp, FaChevronDown, FaSort, FaSortDown } from 'react-icons/fa';
import clsx from 'clsx';

export default function SubscriptionService() {
  const [detailsModal, setDetailsModal] = useState(false)
  const [addSubscriptionModal, setAddSubscriptionModal] = useState(false)
  const [pageNo, setPageNo] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const rowsPerPage = 5;
  const totalRows = SubscriptionTable.length;
  const pageCount = Math.ceil(totalRows / rowsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pageCount) {
      setPageNo(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPaginationButtons = () => {
    const maxPagesToShow = 3;
    const buttons = [];
    const startPage = Math.max(1, pageNo - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(pageCount, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={
            i === pageNo
              ? "bg-[#293FE3] text-white rounded-lg px-4 py-1.5 mr-2 font-medium text-base border"
              : "text-gray-600 border border-[#F0F1F2] px-3 rounded-full py-1.5 mr-2"
          }
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };


  const sortedData = [...SubscriptionTable].sort((a, b) => {
    if (!sortColumn) return 0;

    const valueA = a[sortColumn];
    const valueB = b[sortColumn];

    if (valueA == null) return sortOrder === "asc" ? -1 : 1;
    if (valueB == null) return sortOrder === "asc" ? 1 : -1;

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    } else {
      return sortOrder === "asc"
        ? (valueA || "").toString().localeCompare((valueB || "").toString())
        : (valueB || "").toString().localeCompare((valueA || "").toString());
    }
  });

  const paginatedData = sortedData.slice((pageNo - 1) * rowsPerPage, pageNo * rowsPerPage);


  return (
    <div>
      <div className='flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-2 sy justify-between'>
        <h2 className='text-[#1F1F1F] font-semibold md:text-xl text-lg'>Subscription Service</h2>
        <button className='flex items-center self-end justify-center space-x-1 py-3 px-5 bg-[#293FE3] rounded-xl' onClick={() => setAddSubscriptionModal(true)}>
          <FiPlus className='text-white text-2xl' />
          <span className='text-white md:text-base text-sm font-medium'>Add Subscription</span>
        </button>
      </div>
      <div className='grid grid-cols-12'>
        <div className='xl:col-span-6 md:col-span-9 col-span-12 bg-white rounded-xl shadow-sm md:px-5 px-3 py-5 xl:mt-0 mt-5'>
          <div className='flex items-start gap-1'>
            <h4 className='text-[#4B5563] font-semibold md:text-base text-sm whitespace-nowrap'>Service type :</h4>
            <span className='text-[#293FE3] font-medium md:text-base text-sm '>Monthly Subscription</span>
          </div>
          <div className='flex items-center gap-1 my-3'>
            <h4 className='text-[#4B5563] font-semibold md:text-base text-sm'>Service fee :</h4>
            <span className='text-green-500 font-semibold md:text-base text-sm'>$129.00</span>
          </div>
          <p style={{ textAlign: "justify" }} className='text-[#3B4045] font-medium md:text-base text-sm'>
            <span className='text-[#4B5563] font-semibold md:text-base text-sm'>Description :</span>{" "}
            Experience the ultimate convenience and exclusive benefits with our subscription plans. By subscribing, you gain access to priority services, special discounts, and features designed to enhance your experience. Enjoy peace of mind with our transparent pricing and the ability to cancel at any time. Join now and discover the difference a subscription can make to simplify your everyday life!
          </p>
        </div>
      </div>
      <div className='flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-2 sy justify-between mt-5'>
        <h2 className='text-[#1F1F1F] font-semibold md:text-xl text-lg'>Subscribed Member List</h2>
        <button className='flex items-center self-end justify-center space-x-1 py-3 px-5 bg-[#293FE3] rounded-xl'>
          <img src={documentIcon2} alt='' className='w-[24px] h-[24px]' />
          <span className='text-white md:text-base text-sm font-medium'>Download</span>
        </button>
      </div>
      <div className='bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg col-span-12 mt-5'>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#F8FAFB]">
              <tr>
                {["SubscriptionId", "Name", "Email", "Amount", "Plan(Day)", "StartDate", "EndDate"].map((col) => (
                  <th
                    key={col}
                    className="p-5 text-left text-[#3B4045] select-none font-medium cursor-pointer md:text-base text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group"
                    onClick={() => handleSort(col)}
                  >
                    {col.replace(/([A-Z])/g, " $1").trim()}
                    <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {sortColumn === col ? (
                        sortOrder === "asc" ? <FaSortDown className="inline-block" /> : <FaCaretUp className="inline-block" />
                      ) : (
                        <FaSort className="inline-block text-gray-400" />
                      )}
                    </span>
                  </th>
                ))}
                <th className="p-5 text-center text-[#3B4045] font-medium md:text-base text-sm whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">{item.subscriptionId}</td>
                  <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">{item.name}</td>
                  <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">{item.email}</td>
                  <td className="border-b border-[#E5E7EB] text-green-500 px-4 py-2 md:text-base text-sm font-semibold whitespace-nowrap">{item.amount}</td>
                  <td className="border-b border-[#E5E7EB] text-[#293FE3] px-4 py-2 md:text-base text-sm font-semibold whitespace-nowrap">{item.plan}</td>
                  <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">{item.startDate}</td>
                  <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">{item.endDate}</td>
                  <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap text-end flex justify-center">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild className="outline-none">
                        <button className="p-2">
                          <PiDotsThreeOutlineVerticalFill className="text-[#1F1F1F] text-xl" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="bg-white absolute -right-5 w-[240px] shadow-lg rounded p-2 text-start animate-dropdown"
                          sideOffset={5}
                        >
                          <DropdownMenu.Item
                            className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-2 hover:bg-gray-100" onClick={() => setDetailsModal(true)}
                          >
                            <img src={documentIcon} className='w-[24px] h-[24px]' alt='' />
                            <span className='text-[#1F1F1F] font-normal md:text-base text-sm'>View Details</span>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className='mt-5 flex w-full justify-center'>
        <Pagination>
          <Pagination.Link
            onClick={() => handlePageChange(pageNo - 1)}
            disabled={pageNo === 1}
          >
            <GrPrevious className="text-[#1F1F1F]" />
          </Pagination.Link>
          <div className="flex items-center">{renderPaginationButtons()}</div>
          <Pagination.Link
            onClick={() => handlePageChange(pageNo + 1)}
            disabled={pageNo === pageCount}
          >
            <GrNext className="text-[#1F1F1F]" />
          </Pagination.Link>
        </Pagination>
      </div>

      <Dialog
        open={detailsModal}
        onClose={() => setDetailsModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl pb-5">
          <Dialog.Description className="">
            <div className='md:px-8 px-3 py-5'>
              <div className='w-full relative sm:text-center text-start my-3'>
                <h1 className='md:text-2xl text-lg font-semibold text-[#1F1F1F]'>Subscription Details</h1>
                <button className='absolute top-0 right-0' onClick={() => setDetailsModal(false)}>
                  <IoMdClose className='text-2xl text-black' />
                </button>
              </div>
              <div className='mt-7'>
                <div className='px-2 space-y-5'>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-[#4B5563] font-normal md:text-base text-sm'>Subscribed Name</h4>
                    <span className='text-[#1F1F1F] font-normal md:text-base text-sm'>Marvin Cooper</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-[#4B5563] font-normal md:text-base text-sm'>Email</h4>
                    <span className='text-[#1F1F1F] font-normal md:text-base text-sm'>seano@icloud.com</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-[#4B5563] font-normal md:text-base text-sm'>Subscription Amount</h4>
                    <p className='text-green-500 font-semibold md:text-base text-sm'>$129.00</p>
                  </div>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-[#4B5563] font-normal md:text-base text-sm'>Subscription Plan</h4>
                    <span className='text-[#293FE3] font-semibold md:text-base text-sm'>Monthly</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-[#4B5563] font-normal md:text-base text-sm'>Subscription Id</h4>
                    <span className='text-[#1F1F1F] font-normal md:text-base text-sm'>396350</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-[#4B5563] font-normal md:text-base text-sm'>Start Date</h4>
                    <span className='text-[#1F1F1F] font-normal md:text-base text-sm'>24 Oct, 2024</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-[#4B5563] font-normal md:text-base text-sm'>End Date</h4>
                    <span className='text-[#1F1F1F] font-normal md:text-base text-sm'>24 Nov, 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>

      <Dialog
        open={addSubscriptionModal}
        onClose={() => setAddSubscriptionModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className='md:px-8 md:py-4 p-4'>
              <div className='w-full relative sm:text-center text-start my-3'>
                <h1 className='md:text-2xl text-lg font-semibold text-[#274372]'>Add Subscription Package</h1>
                <button className='absolute top-0 right-0' onClick={() => setAddSubscriptionModal(false)}>
                  <IoMdClose className='text-2xl text-black' />
                </button>
              </div>
              <form className='mt-7'>
                <div className='px-2'>
                  <div className='mb-6'>
                    <Field className="mb-4">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Service type
                      </label>
                      <div className="relative">
                        <Select
                          className={clsx(
                            'block w-full border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none` appearance-none text-start font-medium text-sm/6 text-[#6B757D]',
                            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25',
                            '*:text-black'
                          )}
                        >
                          <option value="">Select package</option>
                          <option value="">Monthly</option>
                          <option value="">Yearly</option>
                        </Select>
                        <FaChevronDown
                          className="group pointer-events-none absolute top-4 right-3 size-4 text-[#899197]"
                          aria-hidden="true"
                        />
                      </div>
                    </Field>
                    <Field className="mb-4">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Service Fee
                      </label>
                      <div className="relative">
                        <Select
                          className={clsx(
                            'block w-full border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none` appearance-none text-start font-medium text-sm/6 text-[#6B757D]',
                            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25',
                            '*:text-black'
                          )}
                        >
                          <option value="">Select service fee</option>
                          <option value="">$129.00</option>
                          <option value="">$229.00</option>
                        </Select>
                        <FaChevronDown
                          className="group pointer-events-none absolute top-4 right-3 size-4 text-[#899197]"
                          aria-hidden="true"
                        />
                      </div>
                    </Field>
                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Enter"
                        className={`w-full md:h-[130px] h-[100px] border border-[#E5E7EB] px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-400 focus:outline-none`}
                      />
                    </div>
                  </div>
                </div>
                <div className='mt-10 flex justify-between w-full mb-3'>
                  <button type='button' onClick={() => setAddSubscriptionModal(false)} className='bg-[#DFE3EA] w-full md:py-3 py-2 font-medium md:text-base text-sm text-[#6B7280] rounded-lg mr-5'>Cancel</button>
                  <button type='submit' className='bg-[#293FE3] text-white font-medium md:text-base text-sm w-full md:py-3 py-2 rounded-lg'
                    onClick={(e) => {
                      e.preventDefault();
                      setAddSubscriptionModal(false);
                    }}>
                    Save
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Description>
        </Dialog.Panel>
      </Dialog>
    </div>
  )
}
