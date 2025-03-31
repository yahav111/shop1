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

const fetchProducts = async () => {
  const { data } = await axiosInstance.get("http://localhost:3000/products");
  return data;
};

const deleteProduct = async (productId) => {
  await axiosInstance.delete(`http://localhost:3000/products/${productId}`);
};

const ProductTable = () => {
  const queryClient = useQueryClient();
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
    },
  });

  const [search, setSearch] = useState("");
  const [orderedProducts, setOrderedProducts] = useState([]);

  useMemo(() => {
    if (products) setOrderedProducts(products);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return (
      orderedProducts?.filter((product) =>
        product.title.toLowerCase().includes(search.toLowerCase())
      ) || []
    );
  }, [orderedProducts, search]);

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newItems = [...orderedProducts];
    const [movedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, movedItem);
    setOrderedProducts(newItems);
  };

  const columns = [
    { accessorKey: "productId", header: "Product ID" },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "price", header: "Price" },
    { accessorKey: "category", header: "Category" },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ getValue }) => <img src={getValue()} alt="Product" width="50" />,
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ getValue }) => JSON.stringify(getValue()),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button onClick={() => handleDelete(row.original.productId)}>
          Delete
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading products</p>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search products..."
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
          <Droppable droppableId="products">
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

export default ProductTable;
