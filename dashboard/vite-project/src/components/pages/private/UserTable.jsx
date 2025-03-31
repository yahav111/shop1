import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

// Axios instance with cookies enabled
const axiosInstance = axios.create({
  withCredentials: true, // Ensures cookies (e.g., auth tokens) are included
});

// Fetch users from API
const fetchUsers = async () => {
  const { data } = await axiosInstance.get("http://localhost:3000/auth");
  return data || []; // Ensure we always get an array
};

// Delete user from API
const deleteUser = async (userId) => {
  await axiosInstance.delete(`http://localhost:3000/auth/${userId}`);
};

const UserTable = () => {
  const queryClient = useQueryClient();

  // Fetch users using React Query
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });

  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    return (
      users?.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase())
      ) || []
    );
  }, [users, search]);

  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Table columns definition
  const columns = [
    { accessorKey: "id", header: "User ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "orders",
      header: "Orders",
      // You can add custom rendering for orders count, for example:
      //   cell: ({ getValue }) => getValue().length,
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
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Loading and error handling
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading users: {error.message}</p>;

  return (
    <div>
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search users..."
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

export default UserTable;
