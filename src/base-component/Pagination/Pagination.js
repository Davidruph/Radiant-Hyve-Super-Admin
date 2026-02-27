import React from "react";
import { twMerge } from "tailwind-merge";

const Pagination = ({ className, children }) => {
  return (
    <nav className={className}>
      <ul className="flex w-full mr-0 sm:w-auto sm:mr-auto text-blue-400 items-center">
        {children}
      </ul>
    </nav>
  );
};

const PaginationLink = ({ className, active, children, onClick, disabled }) => {
  return (
    <li className="flex-initial 2xl:px-0 md:px-0 px-2">
      <button
        onClick={onClick}
        disabled={disabled}
        className={twMerge([
          "min-w-0 sm:min-w-[40px] shadow-none font-normal flex items-center justify-center border-transparent text-slate-800 sm:mr-2 dark:text-slate-300 px-1 sm:px-3",
          active && "!box f dark:bg-darkmode-400",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        ])}
      >
        {children}
      </button>
    </li>
  );
};

Pagination.Link = PaginationLink;

export default Pagination;
