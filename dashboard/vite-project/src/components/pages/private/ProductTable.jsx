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
import ProductEditModal from "../../model/ProductEditModal ";

const axiosInstance = axios.create({ withCredentials: true });

// Fetch products from the server
const fetchProducts = async () => {
  const { data } = await axiosInstance.get("http://localhost:3000/products");
  console.log(data);
  return data;
};

// Update product using FormData
const updateProduct = async ({ productId, updatedProduct }) => {
  console.log(productId, "productId");
  console.log(updatedProduct, "updatedProduct");

  // Create a new FormData object
  const formData = new FormData();

  // Append each field from updatedProduct to the FormData
  for (const key in updatedProduct) {
    if (updatedProduct[key] !== undefined && updatedProduct[key] !== null) {
      formData.append(key, updatedProduct[key]);
    }
  }
  console.log(formData, "formData");

  // Send the FormData with PUT request
  await axiosInstance.put(
    `http://localhost:3000/products/productId/${productId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// Delete product
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

  // Mutations for updating and deleting products
  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => queryClient.invalidateQueries(["products"]),
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries(["products"]),
  });

  // State for modal visibility and search
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // for the Edit Modal
  const [search, setSearch] = useState("");
  const [orderedProducts, setOrderedProducts] = useState([]);
  const [editedData, setEditedData] = useState({});

  // UseMemo for managing ordered products
  useMemo(() => {
    if (products) setOrderedProducts(products);
  }, [products]);

  // Filter products based on search input
  const filteredProducts = useMemo(() => {
    return (
      orderedProducts?.filter((product) =>
        product.title.toLowerCase().includes(search.toLowerCase())
      ) || []
    );
  }, [orderedProducts, search]);

  // Handle deleting a product
  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  // Handle opening the edit modal and setting the product data for editing
  const handleEdit = (product) => {
    setEditedData(product);
    setIsEditModalOpen(true); // Open the Edit Modal
  };

  // Handle saving the edited product (sending FormData)
  const handleSave = () => {
    updateProductMutation.mutate({
      productId: editedData.productId,
      updatedProduct: editedData,
    });
    setIsEditModalOpen(false); // Close the modal after saving
  };

  // Handle form input changes
  const handleChange = (e, field) => {
    let value = e.target.value;

    // המרה למספר אם מדובר בשדה "price"
    if (field === "price") {
      value = parseFloat(value);
      if (isNaN(value)) value = ""; // מניעת שגיאות במקרה של קלט ריק
    } else if (field === "image") {
      value = e.target.files[0];
    }

    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle drag-and-drop reordering of products
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newItems = [...orderedProducts];
    const [movedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, movedItem);
    setOrderedProducts(newItems);
  };

  // Define the table columns
  const columns = [
    { accessorKey: "productId", header: "Product ID" },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => row.original.title,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => Number(row.original.price).toFixed(2),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category?.name,
    },
    ,
    ,
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <img src={row.original.image} alt="Product" width="50" />
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) =>
        `${row.original.rating.rate} ⭐ (${row.original.rating.count} reviews)`,
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
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
      {/* Search input */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div>
        {/* Add Product Button */}
        <button className="addProduct" onClick={() => setIsModalOpen(true)}>
          Add Product
        </button>
        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>

      {/* Drag-and-Drop Table */}
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

      {/* The Edit Product Modal */}
      <ProductEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={editedData}
        onChange={handleChange}
        onSave={handleSave}
      />
    </div>
  );
};

export default ProductTable;
