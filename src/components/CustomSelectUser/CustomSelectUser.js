import { ChevronDownIcon } from '@radix-ui/react-icons';
import React, { useState, useRef, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';

const MultipleSelect = ({
    options = [],
    value = [],
    onChange,
    placeholder = "Select options",
    error = false,
    touched = false,
    className = "",
    innerClassName = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const filteredOptions = options.filter(option =>
        option?.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOptionToggle = (option) => {
        const isSelected = value.includes(option.value);
        let newValue;

        if (isSelected) {
            newValue = value.filter(id => id !== option.value);
        } else {
            newValue = [...value, option.value];
        }

        onChange(newValue);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleRemoveOption = (option) => {
        const newValue = value.filter(id => id !== option.value);
        onChange(newValue);
    };

    const selectedOptions = options.filter(option => value.includes(option.value));

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                className={`${innerClassName} ${error && touched ? 'border-red-500' : 'border-gray-300'} 
                    cursor-pointer flex items-center justify-between bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex-1 w-full overflow-x-auto  hidden-scrollbar">
                    {selectedOptions.length === 0 ? (
                        <span className="text-gray-500">{placeholder}</span>
                    ) : (
                        <div className="flex gap-1 min-w-max">
                            {selectedOptions.map((option) => (
                                <div key={option.value} className='flex items-center bg-[#FFF0E6] px-2 py-1 text-red-600 rounded-md whitespace-nowrap gap-2'>
                                    <div>
                                        <img src={option.image} className='w-6 h-6 rounded-full object-cover' alt="" />
                                    </div>
                                    <span
                                        className="flex items-center text-xs font-medium whitespace-nowrap "
                                    >
                                        {option.label}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveOption(option);
                                        }}
                                        type='button'>
                                        <IoMdClose className='w-4 h-4 text-red-600' />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <ChevronDownIcon
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-hidden">
                    <div className="h-48 custom-scrollbar pb-5 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-gray-500 text-sm">
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = value.includes(option.value);
                                return (
                                    <div
                                        key={option.value}
                                        className={`px-4 py-3 border-b border-[#E9E9E9] cursor-pointer flex items-center justify-start gap-2`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOptionToggle(option);
                                        }}
                                    >
                                        <input type="checkbox" name="" id="" className='w-4 h-4 accent-[#293FE3]' checked={isSelected} />
                                        <img src={option.image} className='w-8 h-8 rounded-full object-cover' alt="" />
                                        <span className={`text-sm ${isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                            {option.label}
                                        </span>

                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultipleSelect;
