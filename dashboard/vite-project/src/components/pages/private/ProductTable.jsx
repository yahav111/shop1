import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

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

  // חישוב הנתונים המסוננים עם useMemo כדי למנוע חישובים מיותרים
  const filteredProducts = useMemo(() => {
    return (
      products?.filter((product) =>
        product.title.toLowerCase().includes(search.toLowerCase())
      ) || []
    );
  }, [products, search]);

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
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
    data: filteredProducts, // מעביר את הנתונים המסוננים לטבלה
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

export default ProductTable;
