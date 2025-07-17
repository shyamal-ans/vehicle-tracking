"use client";

import React, { useEffect, useState } from "react";
import { formatDateTime } from "@/Utils/Utils";

type Vehicle = {
  vehicleName: string;
  resellerName: string;
  ip: string;
  companyName: string;
  branchName: string;
  InActiveDays: number;
  adminName: string;
  vehicleNo: string;
  createdDate: string;
  imeiNo: number;
  projectName: string;
  region: string;
  projectId: string;
  simNo: string;
  username: string;
  status?: string;
  type?: string;
  fetchedAt?: string;
  startDate?: string;
  endDate?: string;
};

// Enhanced PieChart with better styling
const PieChart = ({ data, title, colors }: { data: { label: string; value: number }[]; title: string; colors: string[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-500">
      <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        {title}
      </h3>
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const previousPercentages = data
                .slice(0, index)
                .reduce((sum, d) => sum + (d.value / total) * 100, 0);
              const startAngle = (previousPercentages / 100) * 360;
              const endAngle = ((previousPercentages + percentage) / 100) * 360;
              
              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = percentage > 50 ? 1 : 0;
              
              return (
                <path
                  key={index}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-all duration-300 cursor-pointer"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-black text-gray-900">{total.toLocaleString()}</div>
              <div className="text-sm text-gray-600 font-semibold">Total</div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300 border border-gray-200">
            <div className="flex items-center gap-4">
              <div 
                className="w-5 h-5 rounded-full shadow-lg" 
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="font-semibold text-gray-800 text-lg">{item.label}</span>
            </div>
            <div className="text-right">
              <div className="font-black text-gray-900 text-xl">{item.value.toLocaleString()}</div>
              <div className="text-xs text-gray-600 font-medium">{(item.value / total * 100).toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced BarChart with better styling
const BarChart = ({ data, title, xLabel, yLabel }: { data: { label: string; value: number }[]; title: string; xLabel: string; yLabel: string }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-500">
      <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        {title}
      </h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-800 text-lg">{item.label}</div>
              <div className="text-lg font-black text-gray-900">{item.value.toLocaleString()}</div>
            </div>
            <div className="bg-gray-100 rounded-full h-8 relative overflow-hidden border border-gray-200">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-8 rounded-full transition-all duration-500 ease-out group-hover:from-green-600 group-hover:to-emerald-700 shadow-lg"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between text-sm text-gray-600 font-semibold">
        <span>{xLabel}</span>
        <span>{yLabel}</span>
      </div>
    </div>
  );
};

// Enhanced StatCard with better styling
const StatCard = ({ title, value, change, icon, color = "blue" }: { title: string; value: string | number; change?: string; icon: React.ReactNode; color?: string }) => {
  const colorClasses = {
    blue: "from-cyan-500 to-blue-600",
    green: "from-emerald-500 to-green-600", 
    red: "from-red-500 to-pink-600",
    purple: "from-purple-500 to-indigo-600",
    orange: "from-orange-500 to-red-500"
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-black text-gray-900 mb-3">{value}</p>
          {change && (
            <p className="text-sm text-green-600 flex items-center gap-2 font-semibold bg-green-100 px-3 py-1 rounded-full w-fit">
              <span className="text-lg">↗</span>
              {change}
            </p>
          )}
        </div>
        <div className={`p-6 rounded-2xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Server/Project Display Component
const ServerProjectDisplay = ({ title, data, type }: { title: string; data: { label: string; value: number }[]; type: 'server' | 'project' }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-500">
      <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
        {title}
      </h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-3 h-3 rounded-full shadow-lg flex-shrink-0 ${type === 'server' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                <span className="font-medium text-gray-800 text-sm break-words">{item.label}</span>
              </div>
              <span className="text-lg font-black text-gray-900 flex-shrink-0 ml-3">{item.value.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 border border-gray-300">
              <div 
                className={`h-2 rounded-full shadow-lg ${type === 'server' ? 'bg-blue-500' : 'bg-green-500'}`}
                style={{ width: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Status Distribution Component with proper status handling
const StatusDistribution = ({ vehicles }: { vehicles: Vehicle[] }) => {
  // Define status categories based on InActiveDays
  const statusCategories = [
    { label: "Active (Under 24 hours)", range: [0, 0], color: "#10B981" },
    { label: "Recently Inactive (1-7 days)", range: [1, 7], color: "#F59E0B" },
    { label: "Inactive (8-30 days)", range: [8, 30], color: "#EF4444" },
    { label: "Long Inactive (30-60 days)", range: [30, 60], color: "#8B5CF6" },
    { label: "Very Long Inactive (60-90 days)", range: [60, 90], color: "#EC4899" },
    { label: "Extremely Long Inactive (90+ days)", range: [90, Infinity], color: "#6B7280" }
  ];

  const statusData = statusCategories.map(category => ({
    label: category.label,
    value: vehicles.filter(v => v.InActiveDays >= category.range[0] && v.InActiveDays <= category.range[1]).length,
    color: category.color
  })).filter(item => item.value > 0);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-500">
      <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        Vehicle Status Distribution
      </h3>
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {statusData.map((item, index) => {
              const total = statusData.reduce((sum, d) => sum + d.value, 0);
              const percentage = (item.value / total) * 100;
              const previousPercentages = statusData
                .slice(0, index)
                .reduce((sum, d) => sum + (d.value / total) * 100, 0);
              const startAngle = (previousPercentages / 100) * 360;
              const endAngle = ((previousPercentages + percentage) / 100) * 360;
              
              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = percentage > 50 ? 1 : 0;
              
              return (
                <path
                  key={index}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-all duration-300 cursor-pointer"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-black text-gray-900">{vehicles.length.toLocaleString()}</div>
              <div className="text-sm text-gray-600 font-semibold">Total</div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {statusData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300 border border-gray-200">
            <div className="flex items-center gap-4">
              <div 
                className="w-5 h-5 rounded-full shadow-lg" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="font-semibold text-gray-800 text-lg">{item.label}</span>
            </div>
            <div className="text-right">
              <div className="font-black text-gray-900 text-xl">{item.value.toLocaleString()}</div>
              <div className="text-xs text-gray-600 font-medium">{((item.value / vehicles.length) * 100).toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReseller, setSelectedReseller] = useState<string>('');
  const [resellerOptions, setResellerOptions] = useState<string[]>([]);

  // Fetch all vehicles for analytics
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/vehicles/stored?page=1&pageSize=999999');
        const data = await response.json();
        if (data.success) {
          setAllVehicles(data.data);
          
          // Extract unique resellers for dropdown
          const uniqueResellers = Array.from(
            new Set(data.data.map((vehicle: Vehicle) => vehicle.resellerName))
          )
            .filter((resellerName): resellerName is string => Boolean(resellerName))
            .sort();
          
          setResellerOptions(uniqueResellers);
        }
    } catch (error) {
        console.error('Error fetching data for analytics:', error);
    } finally {
        setIsLoading(false);
      }
    };

    // Initialize cron job on app startup
    const initializeCronJob = async () => {
      try {
        const response = await fetch('/api/cron/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Cron job initialized:', result);
        } else {
          console.log('Cron job already running or failed to initialize');
        }
    } catch (error) {
        console.log('Error initializing cron job:', error);
      }
    };

    fetchAllData();
    initializeCronJob();
  }, []);

  if (isLoading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-lg font-medium text-gray-600">Loading amazing analytics...</p>
          </div>
        </div>
            </div>
      </div>
    );
  }

  // Filter vehicles by selected reseller
  const filteredVehicles = selectedReseller 
    ? allVehicles.filter(v => v.resellerName === selectedReseller)
    : allVehicles;

  // Calculate analytics
  const totalVehicles = filteredVehicles.length;
  const activeVehicles = filteredVehicles.filter(v => v.InActiveDays === 0).length;
  const inactiveVehicles = totalVehicles - activeVehicles;
  
  // Company distribution
  const companyStats = Object.entries(
    filteredVehicles.reduce((acc, v) => {
      acc[v.companyName] = (acc[v.companyName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([company, count]) => ({ label: company, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Reseller distribution
  const resellerStats = Object.entries(
    filteredVehicles.reduce((acc, v) => {
      acc[v.resellerName] = (acc[v.resellerName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([reseller, count]) => ({ label: reseller, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Show top 8 resellers

  // Project distribution
  const projectStats = Object.entries(
    filteredVehicles.reduce((acc, v) => {
      acc[v.projectName] = (acc[v.projectName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([project, count]) => ({ label: project, value: count }))
    .sort((a, b) => b.value - a.value);

  // Server distribution
  const serverStats = Object.entries(
    filteredVehicles.reduce((acc, v) => {
      acc[v.ip] = (acc[v.ip] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([server, count]) => ({ label: server, value: count }))
    .sort((a, b) => b.value - a.value);

  const pieColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  return (
    <div className="bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl shadow-xl p-8 mb-8 border border-blue-200">
          {/* Main Header Row */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Vehicle Analytics Dashboard
              </h1>
              <p className="text-gray-600 text-xl font-medium">Comprehensive insights into your vehicle fleet with real-time data</p>
            </div>
            
            <div className="flex items-center gap-4 ml-8">
              {/* Reseller Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Reseller:</span>
                <select
                  value={selectedReseller}
                  onChange={(e) => setSelectedReseller(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm min-w-[200px] text-sm font-medium"
                >
                  <option value="">All Resellers</option>
                  {resellerOptions.map((resellerName: string) => (
                    <option key={resellerName} value={resellerName}>{resellerName}</option>
                  ))}
                </select>
              </div>
              
              {/* View Vehicle Tables Button */}
              <a 
                href="/vehicle-table" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM21 13V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6m18 0v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m18 0h-2M3 13h2m13-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1" />
                </svg>
                View Tables
              </a>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                Last updated: {formatDateTime(new Date().toISOString())}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                {allVehicles.length.toLocaleString()} Total Records
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                {totalVehicles.toLocaleString()}
              </div>
              <div className="text-xl text-gray-600 font-semibold">Total Vehicles</div>
              <div className="text-sm text-green-600 font-medium mt-2 bg-green-100 px-3 py-1 rounded-full">
                {activeVehicles.toLocaleString()} Active • {inactiveVehicles.toLocaleString()} Inactive
              </div>
            </div>
          </div>
        </div>



        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard
            title="Total Vehicles"
            value={totalVehicles.toLocaleString()}
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM21 13V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6m18 0v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m18 0h-2M3 13h2m13-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1" />
                        </svg>
            }
            color="blue"
          />
          <StatCard
            title="Active Vehicles"
            value={activeVehicles.toLocaleString()}
            change={`${((activeVehicles / totalVehicles) * 100).toFixed(1)}% of total`}
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />
          <StatCard
            title="Inactive Vehicles"
            value={inactiveVehicles.toLocaleString()}
            change={`${((inactiveVehicles / totalVehicles) * 100).toFixed(1)}% of total`}
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="red"
          />
          <StatCard
            title="Unique Companies"
            value={new Set(filteredVehicles.map(v => v.companyName)).size.toLocaleString()}
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            color="purple"
          />
          </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Status Distribution */}
          <StatusDistribution vehicles={filteredVehicles} />

          {/* Reseller Distribution */}
          <PieChart
            title="Vehicles by Reseller"
            data={resellerStats}
            colors={pieColors}
          />
              </div>
              
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Company Distribution */}
          <PieChart
            title="Top Companies"
            data={companyStats}
            colors={pieColors}
          />

          {/* Project Distribution */}
          <BarChart
            title="Top Projects"
            data={projectStats.slice(0, 10)}
            xLabel="Project"
            yLabel="Count"
          />
        </div>

        {/* Server and Project Displays */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <ServerProjectDisplay
            title="All Servers"
            data={serverStats}
            type="server"
          />
          <ServerProjectDisplay
            title="All Projects"
            data={projectStats}
            type="project"
          />
                </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-500">
            <h3 className="text-xl font-black text-blue-600 mb-4">Unique Regions</h3>
            <div className="text-5xl font-black text-gray-900 mb-3">{new Set(filteredVehicles.map(v => v.region)).size.toLocaleString()}</div>
            <p className="text-gray-600 text-lg font-medium">Geographic coverage</p>
              </div>
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-500">
            <h3 className="text-xl font-black text-green-600 mb-4">Unique Projects</h3>
            <div className="text-5xl font-black text-gray-900 mb-3">{new Set(filteredVehicles.map(v => v.projectName)).size.toLocaleString()}</div>
            <p className="text-gray-600 text-lg font-medium">Active projects</p>
            </div>
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-500">
            <h3 className="text-xl font-black text-purple-600 mb-4">Unique Servers</h3>
            <div className="text-5xl font-black text-gray-900 mb-3">{new Set(allVehicles.map(v => v.ip)).size.toLocaleString()}</div>
            <p className="text-gray-600 text-lg font-medium">Server infrastructure</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;