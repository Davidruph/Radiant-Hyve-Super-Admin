import React, { useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import Dialog from '../../base-Component/Dialog/Dialog';
import { IoMdClose } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

export default function Class() {
  const [addClassModal, setAddClassModal] = useState(false);
  const navigate = useNavigate();

  const classData = [
    {
      id: 1,
      className: "Class 1",
      totalStudents: 120
    },
    {
      id: 2,
      className: "Class 2",
      totalStudents: 120
    },
    {
      id: 3,
      className: "Class 3",
      totalStudents: 120
    }
  ];

  const customStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      borderColor: '#E5E7EB',
      padding: '0.25rem',
      boxShadow: 'none',
      cursor: 'default',
      '&:hover': {
        borderColor: '#E5E7EB',
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
      maxHeight: '160px', 
      overflowY: 'auto', 
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '160px', 
      overflowY: 'auto',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#E2E8F0' : 'white',
      color: state.data.value === "" ? "#9CA3AF" : "#1F1F1F",
    }),
  };
  
  const staffs = [
    { value: '', label: 'Select Staff' },
    { value: 'James_Thornton', label: 'James Thornton' },
    { value: 'Olivia_Bennett', label: 'Olivia Bennett' },
    { value: 'Marvin_McKinney', label: 'Marvin McKinney' },
    { value: 'Theresa_Webb', label: 'Theresa Webb' },
    { value: 'Wade_Warren', label: 'Wade Warren' },
    { value: 'Bessie_Cooper', label: 'Bessie Cooper' }
  ];

  return (
    <div>
      <div className='flex sm:flex-row flex-col sm:items-center items-start sm:space-y-0 space-y-4 sy justify-between mb-5'>
        <h2 className='text-[#1F1F1F] font-semibold md:text-xl text-lg'>Class List</h2>
        <div className='flex sm:flex-row flex-col items-start md:gap-2 gap-3'>
          <button className='flex items-center justify-center space-x-1 py-2 px-5 bg-[#293FE3] rounded-lg' onClick={() => setAddClassModal(true)}>
            <FiPlus className='text-white text-2xl' />
            <span className='text-white md:text-base text-sm font-normal'>Add Classroom</span>
          </button>
        </div>
      </div>
      <div className='grid grid-cols-12 2xl:gap-x-6 xl:w-[90%] w-full lg:gap-x-5 gap-4'>
        {classData && classData.map((item, index) => (
          <div className='xl:col-span-3 lg:col-span-4 sm:col-span-4 col-span-12' key={index}>
            <div className='bg-[#FFF0E6] py-[25px] hover:shadow-lg duration-300 cursor-pointer px-[24px] rounded-lg flex items-center 2xl:gap-x-6 lg:gap-x-4 md:gap-4 gap-3 '
              onClick={() => navigate(`/school_admin/class/classroom_details/${item.id}`)}>
              <div>
                <p className='text-[#1F1F1F] md:text-xl text-lg font-medium'>{item?.className}</p>
                <p className='text-[#4B5563] md:text-base mt-3 text-sm font-medium'>
                  Total Student {" "}
                  <span>
                    {item?.totalStudents}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={addClassModal}
        onClose={() => setAddClassModal(false)}
        size="lg"
      >
        <Dialog.Panel className="rounded-2xl">
          <Dialog.Description className="">
            <div className='md:px-8 px-3 py-5'>
              <div className='w-full relative sm:text-center text-start my-3'>
                <h1 className='md:text-xl text-lg font-semibold text-[#1F1F1F]'>Classroom Information</h1>
                <button className='absolute top-0 right-0' onClick={() => setAddClassModal(false)}>
                  <IoMdClose className='text-2xl text-black' />
                </button>
              </div>
              <form className='mt-7'>
                <div className='px-2'>
                  <div className=''>
                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Class Name
                      </label>
                      <input
                        type="email"
                        placeholder="Enter class name"
                        className={`w-full border border-[#E5E7EB] px-4 py-3 rounded-lg disabled:text-[#6B7280] focus:ring-2 focus:ring-gray-400 focus:outline-none`}
                      />
                    </div>
                    <div className="mb-4 text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Total Student Capacity
                      </label>
                      <input
                        type="email"
                        placeholder="Enter capacity"
                        className={`w-full border border-[#E5E7EB] px-4 py-3 rounded-lg disabled:text-[#6B7280] focus:ring-2 focus:ring-gray-400 focus:outline-none`}
                      />
                    </div>
                    <div className="w-full text-start">
                      <label className="block text-[#4B5563] font-normal md:text-base text-sm mb-2">
                        Assigned Staff
                      </label>
                      <div className="relative">
                        <Select
                          options={staffs}
                          placeholder="Select"
                          styles={customStyles}
                          className={`md:text-sm text-xs font-medium`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className='mt-10 flex justify-between md:w-[400px] w-full mx-auto mb-3 '>
                  <button type='button' onClick={() => setAddClassModal(false)} className='bg-[#DFE3EA] w-full md:py-3 py-2 font-medium md:text-base text-sm text-[#6B7280] rounded-lg mr-5'>Cancel</button>
                  <button type='submit' className='bg-[#293FE3] text-white font-medium md:text-base text-sm w-full md:py-3 py-2 rounded-lg'
                    onClick={(e) => {
                      e.preventDefault();
                      setAddClassModal(false);
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
