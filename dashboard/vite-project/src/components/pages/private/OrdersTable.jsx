import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

const axiosInstance = axios.create({ withCredentials: true });

// Fetch orders from API
const fetchOrders = async () => {
  const { data } = await axiosInstance.get(
    "http://localhost:3000/order/allOrders"
  );
  console.log("Fetched Orders:", data.orders); // Debugging

  return data.orders || []; // Ensure an array is returned
};

// Delete order from API
const deleteOrder = async (orderId) => {
  await axiosInstance.delete(
    `http://localhost:3000/order/allOrders/${orderId}`
  );
};

const OrderTable = () => {
  const queryClient = useQueryClient();
  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
    },
  });

  const [search, setSearch] = useState("");

  // Filter orders based on userId
  const filteredOrders = useMemo(() => {
    return (
      orders?.filter((order) =>
        order.id.toLowerCase().includes(search.toLowerCase())
      ) || []
    );
  }, [orders, search]);

  const handleDelete = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const columns = [
    { accessorKey: "id", header: "Order ID" },
    { accessorKey: "userId", header: "User ID" },
    { accessorKey: "createdAt", header: "Created At" },
    {
      accessorKey: "orderItems",
      header: "Order Items",
      cell: ({ getValue }) => getValue().length, // Display number of items
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button onClick={() => handleDelete(row.original.id)}>Delete</button>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredOrders, // Use filtered data for search
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading orders</p>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search by order ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table border="1">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
