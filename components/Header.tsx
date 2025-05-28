"use client";
import { FiBell, FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { HamburgerCloseIcon, HamburgerHoverIcon, HamburgerOpenIcon } from "./Icons/icons";
import CustomDropdown from "./CustomDropdown";

const Header = ({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) => {
  const userOptions = [
    {
      id: 1,
      name: "James Adams",
      img: "https://tinypng.com/images/social/website.jpg",
    },
    {
      id: 2,
      name: "Bob",
      img: "https://wallsdesk.com/wp-content/uploads/2017/01/Dog-Photos.jpg",
    },
    {
      id: 3,
      name: "Charlie",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMx1YSl88oADEMRGXIdsCXi0MeJqcUFwAIAQ&s",
    },
  ];
  return (
    <header className="flex items-center justify-between bg-gray-50 border-b border-b-gray-100 px-5 py-2 sticky ">
      {/* Sidebar toggle button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="group p-2 border border-gray-p-80 rounded-full hover:bg-gray-200 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <span className="group-hover:hidden">
            {sidebarOpen ? <HamburgerOpenIcon /> : <HamburgerCloseIcon />}
          </span>

          <span className="hidden group-hover:inline text-red-600">
            <HamburgerHoverIcon />
          </span>
        </button>
        <button
          className="bg-gradient-to-r from-indigo-400 to-indigo-600 p-2 rounded-full"
          aria-label="Toggle sidebar"
        >
          <FiPlus color="white" size={24} />
        </button>
        <div className="flex search w-full md:w-72 relative border border-gray-p-80 rounded-full p-2">
          <div>
            <FiSearch color="#A4A8BC" className="mt-1" />
          </div>
          {/* {searchValue?.length > 0 && ( */}
          {/* <Close
              // onClick={() => {
              //   setSearchValue("");
              //   if (inputRef.current) {
              //     inputRef.current.value = "";
              //   }
              // }}
              className="w-2 cursor-pointer absolute top-3 right-2 flex gap-1 group"
            /> */}
          {/* )} */}
          <input
            className="border-none shadow-none focus:outline-none search-input focus:shadow-none ring-0 focus:ring-0 font-normal pr-3 flex-1"
            type="text"
            placeholder=" Search here"
          // ref={inputRef}
          // onChange={handleChange}
          />
        </div>
      </div>

      {/* Notification bell */}
      <div className="flex gap-4 items-center">
        {/* Settings button */}
        <button className="p-2 border border-gray-p-80 rounded-full">
          <FiSettings size={24} />
        </button>

        {/* Notification button with red dot */}
        <button className="relative p-2 border border-gray-p-80 rounded-full">
          <FiBell size={24} />
          <span className="absolute top-1 right-2 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <CustomDropdown
            options={userOptions}
            onChange={(selected) => {
              console.log(selected);
            }}
            value={userOptions[0]}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
