import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AddProductModal from "../../model/AddProductModal";

const axiosInstance = axios.create({ withCredentials: true });

const fetchProducts = async () => {
  const { data } = await axiosInstance.get("http://localhost:3000/products");
  console.log(data);

  return data;
};

const updateProduct = async ({ productId, updatedProduct }) => {
  await axiosInstance.put(
    `http://localhost:3000/products/productId/${productId}`,
    updatedProduct
  );
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

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => queryClient.invalidateQueries(["products"]),
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries(["products"]),
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [orderedProducts, setOrderedProducts] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editedData, setEditedData] = useState({});

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

  const handleEdit = (product) => {
    setEditMode(product.productId);
    setEditedData(product);
  };

  const handleSave = (productId) => {
    updateProductMutation.mutate({ productId, updatedProduct: editedData });
    setEditMode(null);
  };

  const handleChange = (e, field) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: field === "price" ? Number(e.target.value) : e.target.value,
    }));
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
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) =>
        editMode === row.original.productId ? (
          <input
            type="text"
            value={editedData.title}
            onChange={(e) => handleChange(e, "title")}
          />
        ) : (
          row.original.title
        ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) =>
        editMode === row.original.productId ? (
          <input
            type="number"
            value={editedData.price}
            onChange={(e) => handleChange(e, "price")}
          />
        ) : (
          `$${row.original.price}`
        ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) =>
        editMode === row.original.productId ? (
          <input
            type="text"
            value={editedData.category}
            onChange={(e) => handleChange(e, "category")}
          />
        ) : (
          row.original.category
        ),
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) =>
        editMode === row.original.productId ? (
          <input
            type="text"
            value={editedData.image}
            onChange={(e) => handleChange(e, "image")}
          />
        ) : (
          <img src={row.original.image} alt="Product" width="50" />
        ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) =>
        editMode === row.original.productId ? (
          <input
            type="number"
            value={editedData.rating.rate} // Use rating.rate
            onChange={(e) =>
              setEditedData({
                ...editedData,
                rating: { ...editedData.rating, rate: e.target.value },
              })
            }
          />
        ) : (
          `${row.original.rating.rate} ⭐ (${row.original.rating.count} reviews)`
        ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) =>
        editMode === row.original.productId ? (
          <>
            <button onClick={() => handleSave(row.original.productId)}>
              Save
            </button>
            <button onClick={() => setEditMode(null)}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => handleEdit(row.original)}>Edit</button>
            <button onClick={() => handleDelete(row.original.productId)}>
              Delete
            </button>
          </>
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

      <div>
        <button className="addProduct" onClick={() => setIsModalOpen(true)}>
          Add Product
        </button>
        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>

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
