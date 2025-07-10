import { apiSlice } from "../apiSlice";

type VehicleAPIResponse = {
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: Vehicle[];
};

type Vehicle = {
  vehicleName: string;
  resellerName: string;
  ip: string;
  companyName: string;
  status?: string;
  type?: string;
  branchName: string;
  projectName: string;
  createdDate: string;
  InActiveDays: number;
  adminName: string;
  vehicleNo: string;
  imeiNo: number;
  region: string;
  projectId: string;
  simNo: string;
  username: string;
  fetchedAt?: string; // Added for stored data
  startDate?: string; // Date range start for this fetch
  endDate?: string; // Date range end for this fetch
};

type VehiclePostParams = {
  adminCode: string;
  projectId: string;
  startDate: string;
  endDate: string;
  pageNo: number;
  pageSize: number;
};

type StoredVehicleResponse = {
  success: boolean;
  data: Vehicle[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  metadata?: {
    lastUpdated: string;
    totalRecords: number;
    metadata: {
      adminCode: string;
      projectId: string;
      startDate: string;
      endDate: string;
    };
  };
  timestamp: string;
};

export const SmartVehicles = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    PostSmartVehicles: builder.mutation<VehicleAPIResponse, VehiclePostParams>({
      query(data) {
        return {
          url: "/api/vehicle-details", // Updated this to point to Next.js API
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["vehicle_details"],
    }),
    
    // New endpoint for stored vehicle data
    GetStoredVehicles: builder.query<StoredVehicleResponse, {
      search?: string;
      page?: number;
      pageSize?: number;
      startDate?: string;
      endDate?: string;
    }>({
      query(params) {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.append('search', params.search);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        
        return {
          url: `/api/vehicles/stored?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["stored_vehicle_details"],
    }),
    
    // Manual trigger for cron job
    TriggerVehicleFetch: builder.mutation<{
      message: string;
      newVehicles: number;
      totalVehicles: number;
      lastUpdated: string;
      timestamp: string;
    }, void>({
      query() {
        return {
          url: "/api/cron/fetch-vehicles",
          method: "POST",
        };
      },
      invalidatesTags: ["stored_vehicle_details"],
    }),
  }),
});

export const { 
  usePostSmartVehiclesMutation,
  useGetStoredVehiclesQuery,
  useTriggerVehicleFetchMutation
} = SmartVehicles;
