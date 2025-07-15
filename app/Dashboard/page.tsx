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

// Chart components
const PieChart = ({ data, title, colors }: { data: { label: string; value: number }[]; title: string; colors: string[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
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
                  strokeWidth="0.5"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-gray-700">{item.label}</span>
            </div>
            <span className="font-medium text-gray-900">
              {item.value} ({(item.value / total * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ data, title, xLabel, yLabel }: { data: { label: string; value: number }[]; title: string; xLabel: string; yLabel: string }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-24 text-sm text-gray-600 truncate">{item.label}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div
                className="bg-blue-600 h-6 rounded-full transition-all duration-300"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {item.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>{xLabel}</span>
        <span>{yLabel}</span>
      </div>
    </div>
  );
};

const LineChart = ({ data, title }: { data: { label: string; value: number }[]; title: string }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue;
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-48 relative">
        <svg className="w-full h-full" viewBox={`0 0 ${data.length * 60} 200`}>
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            points={data.map((item, index) => 
              `${index * 60 + 30},${200 - ((item.value - minValue) / range) * 180}`
            ).join(' ')}
          />
          {data.map((item, index) => (
            <circle
              key={index}
              cx={index * 60 + 30}
              cy={200 - ((item.value - minValue) / range) * 180}
              r="4"
              fill="#3B82F6"
            />
          ))}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <div className="font-medium">{item.value}</div>
              <div className="truncate w-12">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon }: { title: string; value: string | number; change?: string; icon: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <span>↗</span>
            {change}
          </p>
        )}
      </div>
      <div className="text-blue-600">
        {icon}
      </div>
    </div>
  </div>
);

const AnalyticsDashboard = () => {
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all vehicles for analytics
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/vehicles/stored?page=1&pageSize=999999');
        const data = await response.json();
        if (data.success) {
          setAllVehicles(data.data);
        }
      } catch (error) {
        console.error('Error fetching data for analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate analytics
  const totalVehicles = allVehicles.length;
  const activeVehicles = allVehicles.filter(v => v.InActiveDays === 0).length;
  const inactiveVehicles = totalVehicles - activeVehicles;
  
  // Company distribution
  const companyStats = Object.entries(
    allVehicles.reduce((acc, v) => {
      acc[v.companyName] = (acc[v.companyName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([company, count]) => ({ label: company, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Region distribution
  const regionStats = Object.entries(
    allVehicles.reduce((acc, v) => {
      acc[v.region] = (acc[v.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([region, count]) => ({ label: region, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Project distribution
  const projectStats = Object.entries(
    allVehicles.reduce((acc, v) => {
      acc[v.projectName] = (acc[v.projectName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([project, count]) => ({ label: project, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Inactive days distribution
  const inactiveDaysStats = [
    { label: "0 days", value: allVehicles.filter(v => v.InActiveDays === 0).length },
    { label: "1-7 days", value: allVehicles.filter(v => v.InActiveDays >= 1 && v.InActiveDays <= 7).length },
    { label: "8-30 days", value: allVehicles.filter(v => v.InActiveDays >= 8 && v.InActiveDays <= 30).length },
    { label: "31+ days", value: allVehicles.filter(v => v.InActiveDays > 30).length },
  ];

  // Server distribution
  const serverStats = Object.entries(
    allVehicles.reduce((acc, v) => {
      acc[v.ip] = (acc[v.ip] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([server, count]) => ({ label: server, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Recent activity (last 7 days)
  const recentActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = allVehicles.filter(v => 
      v.fetchedAt && v.fetchedAt.startsWith(dateStr)
    ).length;
    return {
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: count
    };
  }).reverse();

  const pieColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vehicle Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Comprehensive insights into your vehicle fleet</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Vehicle Table
              </a>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{totalVehicles}</div>
                <div className="text-sm text-gray-500">Total Vehicles</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Vehicles"
            value={totalVehicles}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM21 13V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6m18 0v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m18 0h-2M3 13h2m13-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1" />
              </svg>
            }
          />
          <StatCard
            title="Active Vehicles"
            value={activeVehicles}
            change={`${((activeVehicles / totalVehicles) * 100).toFixed(1)}% of total`}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Inactive Vehicles"
            value={inactiveVehicles}
            change={`${((inactiveVehicles / totalVehicles) * 100).toFixed(1)}% of total`}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Unique Companies"
            value={new Set(allVehicles.map(v => v.companyName)).size}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Vehicle Status Distribution */}
          <PieChart
            title="Vehicle Status Distribution"
            data={[
              { label: "Active", value: activeVehicles },
              { label: "Inactive", value: inactiveVehicles }
            ]}
            colors={['#10B981', '#EF4444']}
          />

          {/* Company Distribution */}
          <PieChart
            title="Top 5 Companies"
            data={companyStats}
            colors={pieColors}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Region Distribution */}
          <BarChart
            title="Vehicles by Region"
            data={regionStats}
            xLabel="Region"
            yLabel="Count"
          />

          {/* Project Distribution */}
          <BarChart
            title="Top 5 Projects"
            data={projectStats}
            xLabel="Project"
            yLabel="Count"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Inactive Days Distribution */}
          <PieChart
            title="Inactive Days Distribution"
            data={inactiveDaysStats}
            colors={['#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
          />

          {/* Server Distribution */}
          <BarChart
            title="Top 5 Servers"
            data={serverStats}
            xLabel="Server"
            yLabel="Count"
          />
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <LineChart
            title="Recent Activity (Last 7 Days)"
            data={recentActivity}
          />
        </div>

        {/* Detailed Stats Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Statistics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Vehicles</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{totalVehicles}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">100%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Active Vehicles</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activeVehicles}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{((activeVehicles / totalVehicles) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Inactive Vehicles</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inactiveVehicles}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{((inactiveVehicles / totalVehicles) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Unique Companies</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Set(allVehicles.map(v => v.companyName)).size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Unique Regions</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Set(allVehicles.map(v => v.region)).size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Unique Projects</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Set(allVehicles.map(v => v.projectName)).size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Unique Servers</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Set(allVehicles.map(v => v.ip)).size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;