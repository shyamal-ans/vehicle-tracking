"use client";
import { Column, CustomTable } from "@/components/CustomTable";
import { POI_QUERY } from "@/graphql/queries/poi";
import { formatDateTime } from "@/Utils/Utils";
import { useQuery } from "@apollo/client";
import React, { useState } from "react";
import Link from "next/link";

type POIItem = {
  id?: string | number;
  pOIId?: string;
  pOIName?: string;
  pOILat?: string;
  pOILong?: string;
  ownerName?: string;
  numberOfPropertiesList?: number;
  numberOfProperties?: number;
  ownerContactNumber?: string;
  isAccessDenied?: boolean;
  createdOn?: string | undefined;
  modifiedOn?: string;
  remark?: string;
  address?: {
    city?: string;
    zip?: string;
  };
};

function POI() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };
  const columns: Column<POIItem>[] = [
    { 
      header: "POI Name", 
      accessor: "pOIName",
      cell: (value, row) => (
        <Link 
          href={`/poi/${row.pOIId}`}
          className="text-blue-500 hover:text-blue-700"
        >
          {value}
        </Link>
      )
    },
    {
      header: "Coordinate",
      accessor: "pOILat",
      cell: (value, row) => {
        return (
          <div className="flex items-center justify-between">
            <span>
              {row.pOILat}, {row.pOILong}
            </span>
          </div>
        );
      },
    },
    { header: "Address", accessor: "pOIAddress", },
    { header: "Zone", accessor: "zoneType.zoneName" },
    { header: "Ward", accessor: "wardType.wardName" },
    { header: "Category", accessor: "category.categoryName" },
    { header: "Sub Category", accessor: "subCategory.subCategoryName" },
    { header: "Tag Type", accessor: "binType.binTypeName" },
    {
      header: "Description",
      accessor: "remark",
      cell: (_, row) => {
        return (
          <div className="flex items-center justify-between">
            <span>{row?.remark?.length ? row?.remark : "-"}</span>
          </div>
        );
      },
    },
    {
      header: "Owner Name",
      accessor: "ownerName",
      cell: (_, row) => {
        return (
          <div className="flex items-center justify-between">
            <span>{row?.ownerName?.length ? row?.ownerName : "-"}</span>
          </div>
        );
      },
    },
    {
      header: "Contact No",
      accessor: "ownerContactNumber",
      cell: (_, row) => {
        return (
          <div className="flex items-center justify-between">
            <span>
              {row?.ownerContactNumber?.length ? row?.ownerContactNumber : "-"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Properties",
      accessor: "binType.numberOfPropertiesList",
      cell: (_, row) => {
        return (
          <div className="flex items-center justify-between">
            <span>
              {row.numberOfPropertiesList}\{row.numberOfProperties}
            </span>
          </div>
        );
      },
    },
    {
      header: "Is Access Denies",
      accessor: "binType.isAccessDenied",
      cell: (_, row) => {
        return (
          <div className="flex items-center justify-between">
            <span>{row.isAccessDenied ? "Yes" : "No"}</span>
          </div>
        );
      },
    },
    {
        header: "Created On",
        accessor: "createdOn",
        cell: (_, row) => {
          return (
            <div className="flex items-center justify-between">
              <span>{row?.createdOn ? formatDateTime(row?.createdOn):"-"}</span>
            </div>
          );
        },
      },
      {
        header: "Modify On",
        accessor: "modifiedOn",
        cell: (_, row) => {
          return (
            <div className="flex items-center justify-between">
              <span>{row?.modifiedOn ? formatDateTime(row?.modifiedOn):"-"}</span>
            </div>
          );
        },
      },
      {
        header: "Modiy By",
        accessor: "modifiedByName.userName",
      },
  ];

  const {
    data: poiData,
    loading,
    error,
  } = useQuery(POI_QUERY, {
    variables: {
      page: currentPage + 1,
      pageSize: 10,
      wardId: [],
      zoneId: [],
      binTypeId: [],
      subCategoryId: [],
      categoryId: [],
      sortBy: "createdOn",
      sortDirection: "DESC",
      searchText: "",
    },
    fetchPolicy: "cache-first", // 👈 uses cache if data exists
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">POI Management</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM21 13V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6m18 0v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m18 0h-2M3 13h2m13-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1" />
                </svg>
                Vehicle Dashboard
              </a>
              <a
                href="/Dashboard"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* POI Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">POI List</h2>
          <CustomTable
            data={poiData?.pOIQuery?.poi?.poi || []}
            columns={columns}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

export default POI;
