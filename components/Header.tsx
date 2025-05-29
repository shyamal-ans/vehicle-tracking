"use client";
import { FiBell, FiSettings } from "react-icons/fi";
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
    <header className="flex items-center justify-between bg-gray-50 border-b border-b-gray-100 px-5 py-2 sticky">
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
