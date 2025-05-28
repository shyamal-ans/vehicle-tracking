import { apiSlice } from "../apiSlice";

type VehicleAPIResponse = {
  pageNo: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: Vehicle[];
};

type Vehicle = {
  ip:string;
  vehicleNo: string;
  imeiNo: number;
  companyName: string;
  status: string;
  type:string;
  branchName: string;
  projectName: string;
  createdDate: string;
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
