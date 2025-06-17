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
};

type VehiclePostParams = {
  adminCode: string;
  projectId: string;
  startDate: string;
  endDate: string;
  pageNo: number;
  pageSize: number;
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
  }),
});

export const { usePostSmartVehiclesMutation } = SmartVehicles;
