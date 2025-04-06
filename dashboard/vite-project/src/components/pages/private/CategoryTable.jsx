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

const fetchCategories = async () => {
  const { data } = await axiosInstance.get("http://localhost:3000/categories");
  return data || [];
};

const deleteCategory = async (categoryId) => {
  await axiosInstance.delete(`http://localhost:3000/categories/${categoryId}`);
};

const createCategory = async (newCategory) => {
  await axiosInstance.post("http://localhost:3000/categories", newCategory);
};

const CategoryTable = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [orderedCategories, setOrderedCategories] = useState([]);

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries(["categories"]),
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      setNewCategory("");
    },
  });

  useMemo(() => {
    if (categories) setOrderedCategories(categories);
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return (
      orderedCategories?.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase())
      ) || []
    );
  }, [orderedCategories, search]);

  const handleDelete = (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newItems = [...orderedCategories];
    const [movedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, movedItem);
    setOrderedCategories(newItems);
  };

  const columns = [
    { accessorKey: "id", header: "Category ID" },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "productCount",
      header: "Product Count",
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
    data: filteredCategories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading categories</p>;

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={() => {
            if (newCategory.trim()) {
              createCategoryMutation.mutate({ name: newCategory });
            }
          }}
        >
          Add Category
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "1rem" }}
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
          <Droppable droppableId="categories">
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

export default CategoryTable;
