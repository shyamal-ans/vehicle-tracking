import React from "react";
import ReactPaginate from "react-paginate";
import classNames from "classnames";

// Helper to get nested value from object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getValueByAccessor = (obj: any, accessor: string): any => {
  return accessor
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

export type Column<T> = {
  header: string;
  accessor: string; // now supports nested keys like "user.name"
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cell?: (value: any, row: T) => React.ReactNode; // optional custom render
};

export type CustomTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
  currentPage: number;
  onPageChange: (selected: number) => void;
};

export function CustomTable<T extends { id: string | number }>({
  data,
  columns,
  itemsPerPage = 10,
  currentPage,
  onPageChange,
}: CustomTableProps<T>) {
  const pageCount = Math.ceil(data.length / itemsPerPage);
  const currentItems = data.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  console.log(data,"data")
  return (
    <div className="flex flex-col">
      <div className="overflow-auto max-h-[500px] rounded-2xl shadow-md border border-gray-200">
        <table className="divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={classNames(
                    "px-6 py-4 text-left text-sm font-semibold text-gray-600 ",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.map((item, idx) => (
              <tr
                key={`row-${item.id}-${idx}`}
                className={
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                }
              >
                {columns.map((col, colIdx) => {
                  const value = getValueByAccessor(item, col.accessor);
                  return (
                    <td
                      key={`cell-${item.id}-${col.accessor}-${colIdx}`}
                      className={classNames(
                        "px-6 py-4 text-sm text-gray-700 min-w-[150px] truncate",
                        col.className
                      )}
                    >
                      {col.cell ? col.cell(value, item) : String(value ?? "")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        <ReactPaginate
          previousLabel={"←"}
          nextLabel={"→"}
          breakLabel={"..."}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={(selectedItem) => onPageChange(selectedItem.selected)}
          containerClassName="flex items-center space-x-2 text-sm"
          pageClassName="border border-gray-300 rounded-lg cursor-pointer"
          pageLinkClassName="block px-3 py-1 text-gray-700"
          activeClassName="bg-blue-500 text-white border-blue-500"
          previousClassName="border border-gray-300 rounded-lg cursor-pointer"
          previousLinkClassName="block px-3 py-1 text-gray-700"
          nextClassName="border border-gray-300 rounded-lg cursor-pointer"
          nextLinkClassName="block px-3 py-1 text-gray-700"
          breakClassName="border border-gray-300 rounded-lg"
          breakLinkClassName="block px-3 py-1 text-gray-700"
          disabledClassName="opacity-50 cursor-not-allowed"
        />
      </div>
    </div>
  );
}
