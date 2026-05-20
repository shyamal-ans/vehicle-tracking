import { NextRequest, NextResponse } from 'next/server';

type StatsItem = {
  label: string;
  value: number;
  color?: string;
};

type DashboardSummary = {
  success: boolean;
  totalVehicles: number;
  activeVehicles: number;
  inactiveVehicles: number;
  uniqueCompanies: number;
  uniqueResellers: number;
  uniqueProjects: number;
  uniqueServers: number;
  uniqueRegions: number;
  resellerOptions: string[];
  companyStats: StatsItem[];
  resellerStats: StatsItem[];
  projectStats: StatsItem[];
  serverStats: StatsItem[];
  statusData: StatsItem[];
  timestamp: string;
  lastUpdated: string;
};

const statusCategories = [
  { label: 'Active (Under 24 hours)', range: [0, 0], color: '#10B981' },
  { label: 'Recently Inactive (1-7 days)', range: [1, 7], color: '#F59E0B' },
  { label: 'Inactive (8-30 days)', range: [8, 30], color: '#EF4444' },
  { label: 'Long Inactive (30-60 days)', range: [30, 60], color: '#8B5CF6' },
  { label: 'Very Long Inactive (60-90 days)', range: [60, 90], color: '#EC4899' },
  { label: 'Extremely Long Inactive (90+ days)', range: [90, Infinity], color: '#6B7280' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const selectedReseller = searchParams.get('reseller') || '';

    const endpointUrl = new URL('/api/vehicles/stored', request.nextUrl.origin);
    endpointUrl.searchParams.set('page', '1');
    endpointUrl.searchParams.set('pageSize', '999999');

    const storedResponse = await fetch(endpointUrl.toString(), {
      cache: 'no-store',
    });
    const storedData = await storedResponse.json();

    if (!storedResponse.ok || !storedData.success || !Array.isArray(storedData.data)) {
      return NextResponse.json({
        success: true,
        totalVehicles: 0,
        activeVehicles: 0,
        inactiveVehicles: 0,
        uniqueCompanies: 0,
        uniqueResellers: 0,
        uniqueProjects: 0,
        uniqueServers: 0,
        uniqueRegions: 0,
        resellerOptions: [],
        companyStats: [],
        resellerStats: [],
        projectStats: [],
        serverStats: [],
        statusData: [],
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      } as DashboardSummary, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      });
    }

    const allVehicles = storedData.data as any[];
    const vehicles = selectedReseller
      ? allVehicles.filter((vehicle: any) => vehicle.resellerName === selectedReseller)
      : allVehicles;

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v: any) => v.InActiveDays === 0).length;
    const inactiveVehicles = totalVehicles - activeVehicles;

    const resellerOptions = Array.from(new Set(allVehicles.map((v: any) => v.resellerName)))
      .filter((resellerName: any) => Boolean(resellerName))
      .sort();

    const companyStats = Object.entries(
      vehicles.reduce((acc: Record<string, number>, v: any) => {
        const key = v.companyName || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const resellerStats = Object.entries(
      vehicles.reduce((acc: Record<string, number>, v: any) => {
        const key = v.resellerName || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const projectStats = Object.entries(
      vehicles.reduce((acc: Record<string, number>, v: any) => {
        const key = v.projectName || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const serverStats = Object.entries(
      vehicles.reduce((acc: Record<string, number>, v: any) => {
        const key = v.ip || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    const statusData = statusCategories
      .map(category => ({
        label: category.label,
        value: vehicles.filter((v: any) => v.InActiveDays >= category.range[0] && v.InActiveDays <= category.range[1]).length,
        color: category.color,
      }))
      .filter(item => item.value > 0);

    const uniqueCompanies = new Set(vehicles.map((v: any) => v.companyName)).size;
    const uniqueResellers = new Set(vehicles.map((v: any) => v.resellerName)).size;
    const uniqueProjects = new Set(vehicles.map((v: any) => v.projectName)).size;
    const uniqueServers = new Set(vehicles.map((v: any) => v.ip)).size;
    const uniqueRegions = new Set(vehicles.map((v: any) => v.region)).size;

    return NextResponse.json({
      success: true,
      totalVehicles,
      activeVehicles,
      inactiveVehicles,
      uniqueCompanies,
      uniqueResellers,
      uniqueProjects,
      uniqueServers,
      uniqueRegions,
      resellerOptions,
      companyStats,
      resellerStats,
      projectStats,
      serverStats,
      statusData,
      timestamp: new Date().toISOString(),
      lastUpdated: storedData.metadata?.lastUpdated || new Date().toISOString(),
    } as DashboardSummary, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating dashboard summary:', error);
    return NextResponse.json({
      success: false,
      totalVehicles: 0,
      activeVehicles: 0,
      inactiveVehicles: 0,
      uniqueCompanies: 0,
      uniqueResellers: 0,
      uniqueProjects: 0,
      uniqueServers: 0,
      uniqueRegions: 0,
      resellerOptions: [],
      companyStats: [],
      resellerStats: [],
      projectStats: [],
      serverStats: [],
      statusData: [],
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    } as DashboardSummary, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    });
  }
}
