import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const axiosInstance = axios.create({ withCredentials: true });

const fetchOrders = async () => {
  const { data } = await axiosInstance.get(
    "http://localhost:3000/order/allOrders"
  );
  return data.orders || [];
};

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
  const [orderedItems, setOrderedItems] = useState([]);

  useMemo(() => {
    if (orders) setOrderedItems(orders);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return (
      orderedItems?.filter((order) =>
        order.id.toLowerCase().includes(search.toLowerCase())
      ) || []
    );
  }, [orderedItems, search]);

  const handleDelete = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newItems = [...orderedItems];
    const [movedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, movedItem);
    setOrderedItems(newItems);
  };

  const columns = [
    { accessorKey: "id", header: "Order ID" },
    { accessorKey: "userId", header: "User ID" },
    { accessorKey: "createdAt", header: "Created At" },
    {
      accessorKey: "orderItems",
      header: "Order Items",
      cell: ({ getValue }) => getValue().length,
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
    data: filteredOrders,
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

      <DragDropContext onDragEnd={handleDragEnd}>
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
          <Droppable droppableId="orders">
            {(provided) => (
              <tbody ref={provided.innerRef} {...provided.droppableProps}>
                {table.getRowModel().rows.map((row, index) => (
                  <Draggable
                    key={row.id}
                    draggableId={row.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </table>
      </DragDropContext>
    </div>
  );
};

export default OrderTable;
