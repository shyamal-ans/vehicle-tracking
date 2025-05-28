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
    <div className="mx-auto">
      <h1 className="text-2xl font-bold mb-4">Users List</h1>
      <CustomTable
        data={poiData?.pOIQuery?.poi?.poi || []}
        columns={columns}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default POI;
