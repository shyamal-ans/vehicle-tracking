"use client";
import { FiBell, FiSettings } from "react-icons/fi";
import CustomDropdown from "./CustomDropdown";
import { useState, useEffect } from "react";

const Header = ({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) => {
  const [resellerOptions, setResellerOptions] = useState<any[]>([]);
  const [selectedReseller, setSelectedReseller] = useState<any>(null);
  const [isLoadingResellers, setIsLoadingResellers] = useState(false);

  // Fetch reseller options from the vehicle data
  useEffect(() => {
    const fetchResellers = async () => {
      try {
        setIsLoadingResellers(true);
        const response = await fetch('/api/vehicles/stored');
        const data = await response.json();
        
        if (data.success && data.data) {
          // Extract unique resellers from vehicle data
          const uniqueResellers = Array.from(
            new Set(data.data.map((vehicle: any) => vehicle.resellerName))
          )
            .filter((resellerName): resellerName is string => Boolean(resellerName)) // Remove empty/null values and type guard
            .sort()
            .map((resellerName: string, index: number) => ({
              id: index + 1,
              name: resellerName,
              img: `https://ui-avatars.com/api/?name=${encodeURIComponent(resellerName)}&background=random&color=fff&size=32`
            }));
          
          // Add "All Resellers" option
          const allResellersOption = {
            id: 0,
            name: "All Resellers",
            img: "https://ui-avatars.com/api/?name=All&background=6b7280&color=fff&size=32"
          };
          
          setResellerOptions([allResellersOption, ...uniqueResellers]);
          
          // Set "All Resellers" as default
          setSelectedReseller(allResellersOption);
        }
      } catch (error) {
        console.error('Error fetching resellers:', error);
      } finally {
        setIsLoadingResellers(false);
      }
    };

    fetchResellers();
  }, []);

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

  const handleResellerChange = (selected: any) => {
    setSelectedReseller(selected);
    
    // Store the selected reseller in localStorage for cross-page persistence
    if (selected) {
      localStorage.setItem('selectedReseller', JSON.stringify(selected));
    } else {
      localStorage.removeItem('selectedReseller');
    }
    
    console.log('Selected reseller:', selected);
    
    // Trigger a custom event that other components can listen to
    const event = new CustomEvent('resellerChanged', { 
      detail: { reseller: selected } 
    });
    window.dispatchEvent(event);
  };
  
  return (
    <header className="flex items-center justify-between bg-gray-50 border-b border-b-gray-100 px-5 py-2 sticky">
      {/* Left side - View Vehicles button and Reseller dropdown */}
      <div className="flex items-center gap-4">
        <a
          href="/vehicle-table"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM21 13V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6m18 0v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m18 0h-2M3 13h2m13-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1" />
          </svg>
          View Vehicles
        </a>

        {/* Reseller Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Reseller:</span>
          <div className="w-48">
            <CustomDropdown
              options={resellerOptions}
              onChange={handleResellerChange}
              value={selectedReseller}
              placeholder="Select Reseller"
              loader={isLoadingResellers}
            />
          </div>
        </div>
      </div>

      {/* Right side - Notifications and Profile */}
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
