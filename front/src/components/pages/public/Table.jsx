import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useState } from 'react';

// Sample data
const data = [
  {
    id: 1,
    firstName: 'יוסי',
    lastName: 'כהן',
    age: 32,
    email: 'yossi@example.com',
    status: 'פעיל',
  },
  {
    id: 2,
    firstName: 'מיכל',
    lastName: 'לוי',
    age: 27,
    email: 'michal@example.com',
    status: 'לא פעיל',
  },
  {
    id: 3,
    firstName: 'דני',
    lastName: 'גולדברג',
    age: 45,
    email: 'danny@example.com',
    status: 'פעיל',
  },
  {
    id: 4,
    firstName: 'רונית',
    lastName: 'אברהם',
    age: 33,
    email: 'ronit@example.com',
    status: 'פעיל',
  },
  {
    id: 5,
    firstName: 'אבי',
    lastName: 'שמעוני',
    age: 29,
    email: 'avi@example.com',
    status: 'לא פעיל',
  },
];

// Define columns
const columns = [
  {
    header: 'מזהה',
    accessorKey: 'id',
  },
  {
    header: 'שם פרטי',
    accessorKey: 'firstName',
  },
  {
    header: 'שם משפחה',
    accessorKey: 'lastName',
  },
  {
    header: 'גיל',
    accessorKey: 'age',
  },
  {
    header: 'דוא"ל',
    accessorKey: 'email',
  },
  {
    header: 'סטטוס',
    accessorKey: 'status',
    cell: ({ getValue }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          getValue() === 'פעיל' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {getValue()}
      </span>
    ),
  },
];

const TanStackTableExample = () => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="p-4 max-w-5xl mx-auto" dir="rtl">
      <div className="mb-4">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="חיפוש..."
          className="p-2 border border-gray-300 rounded w-full"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-right text-sm font-medium text-gray-700 border-b"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-between cursor-pointer">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() ? (
                        header.column.getIsSorted() === 'asc' ? (
                          <span>↑</span>
                        ) : (
                          <span>↓</span>
                        )
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 border-b border-gray-200"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2 text-sm text-gray-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-4 text-gray-500"
                >
                  לא נמצאו תוצאות
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 bg-gray-100 rounded border disabled:opacity-50"
          >
            {"<<"}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 bg-gray-100 rounded border disabled:opacity-50"
          >
            {"<"}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 bg-gray-100 rounded border disabled:opacity-50"
          >
            {">"}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 bg-gray-100 rounded border disabled:opacity-50"
          >
            {">>"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            עמוד {table.getState().pagination.pageIndex + 1} מתוך{" "}
            {table.getPageCount()}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="p-1 border border-gray-300 rounded"
          >
            {[5, 10, 20, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                הצג {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TanStackTableExample;