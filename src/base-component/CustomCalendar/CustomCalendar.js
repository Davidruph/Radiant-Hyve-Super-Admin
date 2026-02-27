import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    setMonth,
    setYear,
    isSameMonth,
    isSameDay,
} from 'date-fns';

const CustomCalendar = ({ onDateSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('date');
    const [yearPageStart, setYearPageStart] = useState(new Date().getFullYear() - 6);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const handleDateClick = (day) => {
        setSelectedDate(day);
        onDateSelect?.(day);
    };

    const handleNavClick = (direction) => {
        if (viewMode === 'date') {
            setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
        } else if (viewMode === 'year') {
            setYearPageStart(yearPageStart + (direction === 'prev' ? -12 : 12));
        }
    };

    const renderHeader = () => (
        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
            <button
                onClick={() => handleNavClick('prev')}
                className="text-gray-500 hover:text-black"
            >
                &lt;
            </button>

            <span className="font-medium cursor-pointer space-x-1">
                <span onClick={() => setViewMode('month')}>{format(currentMonth, 'MMMM')}</span>{" "}
                <span onClick={() => setViewMode('year')}>{format(currentMonth, 'yyyy')}</span>
            </span>

            <button
                onClick={() => handleNavClick('next')}
                className="text-gray-500 hover:text-black"
            >
                &gt;
            </button>
        </div>
    );

    const renderDays = () => {
        const days = [];
        const startDate = startOfWeek(currentMonth);
        for (let i = 0; i < 7; i++) {
            days.push(
                <div
                    key={i}
                    className="text-center text-sm py-4 font-medium text-gray-600"
                >
                    {format(addDays(startDate, i), 'EEE')}
                </div>
            );
        }
        return <div className="grid grid-cols-7">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                days.push(
                    <div
                        key={cloneDay.toString()}
                        className={`w-10 ms-2 h-10 flex justify-center items-center text-center text-sm cursor-pointer rounded-full transition-all
                        ${!isSameMonth(cloneDay, monthStart) ? 'text-gray-400' : ''}
                        ${isSameDay(cloneDay, selectedDate) ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'}
                        `}
                        onClick={() => handleDateClick(cloneDay)}
                    >
                        {format(cloneDay, 'd')}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 my-1" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div>{rows}</div>;
    };

    const renderMonthSelection = () => (
        <div className="grid grid-cols-3 gap-2 p-4">
            {months.map((month, idx) => (
                <div
                    key={month}
                    className="text-center w-full h-12 flex justify-center items-center text-sm rounded-md hover:bg-blue-100 cursor-pointer"
                    onClick={() => {
                        setCurrentMonth(setMonth(currentMonth, idx));
                        setViewMode('date');
                    }}
                >
                    {month}
                </div>
            ))}
        </div>
    );

    const renderYearSelection = () => {
        const yearItems = [];
        for (let i = 0; i < 12; i++) {
            const year = yearPageStart + i;
            yearItems.push(
                <div
                    key={year}
                    className="text-center w-full h-12 flex justify-center items-center text-sm rounded-md hover:bg-blue-100 cursor-pointer"
                    onClick={() => {
                        setCurrentMonth(setYear(currentMonth, year));
                        setViewMode('date');
                    }}
                >
                    {year}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-3 gap-2 p-4">
                {yearItems}
            </div>
        );
    };

    return (
        <div className="md:w-[450px] p-2 mx-auto border bg-white border-gray-300 rounded-md">
            {renderHeader()}
            {viewMode === 'date' && renderDays()}
            {viewMode === 'date' && renderCells()}
            {viewMode === 'month' && renderMonthSelection()}
            {viewMode === 'year' && renderYearSelection()}
        </div>
    );
};

export default CustomCalendar;