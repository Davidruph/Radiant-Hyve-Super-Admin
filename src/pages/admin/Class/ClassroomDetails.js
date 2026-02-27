import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React, { useState } from 'react'
import Pagination from '../../base-Component/Pagination/Pagination'
import { GrNext, GrPrevious } from 'react-icons/gr'
import { useNavigate } from 'react-router-dom'
import documentIcon from '../../assets/icons/document-text.png'
import { PiDotsThreeOutlineVerticalFill } from 'react-icons/pi'
import { students } from '../../data/Data'
import { FaCaretUp, FaSort, FaSortDown } from "react-icons/fa";
import BackIcon from '../../assets/icons/BackIcon.png';

export default function ClassroomDetails() {
    const [pageNo, setPageNo] = useState(1);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc");
    const rowsPerPage = 15;
    const totalRows = students.length;
    const pageCount = Math.ceil(totalRows / rowsPerPage);
    const navigate = useNavigate();

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
                            : "text-gray-600 border border-[#F0F1F2] px-4 rounded-lg font-medium md:text-base text-sm py-1.5 mr-2"
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

    const sortedData = [...students].sort((a, b) => {
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
            <div className='mb-5'>
                <button className='flex items-center gap-2' onClick={() => navigate(-1)}>
                    <img src={BackIcon} className='w-[38px] h-[38px]' alt='' />
                    <span className='text-[#1F1F1F] font-normal md:text-base text-sm'>Back</span>
                </button>
            </div>
            <div className='grid grid-cols-12'>
                <div className="2xl:col-span-5 lg:col-span-7 md:col-span-10 col-span-12">
                    <h2 className='text-[#1F1F1F] font-semibold md:text-xl text-lg'>Class List</h2>
                    <div className="bg-white rounded-lg p-5 space-y-3 mt-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[#4B5563] font-normal md:text-sm text-xs">Class Name</p>
                            <p className="text-[#1F1F1F] font-normal md:text-base text-sm">Class 1</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-[#4B5563] font-normal md:text-sm text-xs">Total Student Capacity</p>
                            <p className="text-[#1F1F1F] font-normal md:text-base text-sm">120 Students</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-[#4B5563] font-normal md:text-sm text-xs">Assigned Staff</p>
                            <p className="text-[#1F1F1F] font-normal md:text-base text-sm">Ronald Richards</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-5">
                <h2 className='text-[#1F1F1F] font-semibold md:text-xl text-lg'>Student List</h2>
                <div className="overflow-x-auto bg-[#FFFFFF] py-4 md:px-4 px-3 rounded-lg">
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#F8FAFB]">
                            <tr>
                                {["Student Id", "Student Name", "Parent Name", "Email", "Class"].map((col) => (
                                    <th
                                        key={col}
                                        className="p-4 text-left text-[#3B4045] select-none font-medium cursor-pointer md:text-base text-sm first:rounded-l-md last:rounded-r-md whitespace-nowrap group"
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
                                <th className="p-4 text-center text-[#3B4045] font-medium md:text-base text-sm whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((Item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">{Item.studentId}</td>
                                    <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">{Item.studentName}</td>
                                    <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">{Item.parentName}</td>
                                    <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">{Item.email}</td>
                                    <td className="border-b border-[#E5E7EB] text-[#1F1F1F] px-4 py-2 md:text-base text-sm font-normal whitespace-nowrap">{Item.class}</td>
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
                                                        className="cursor-pointer flex items-center gap-3 text-start outline-none px-4 py-2 hover:bg-gray-100"
                                                        onClick={() => navigate(`/school_admin/student_details/${Item.studentId}`)}
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
                <div className='mt-5 flex w-full col-span-12 justify-center'>
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
            </div>
        </div>
    )
}
