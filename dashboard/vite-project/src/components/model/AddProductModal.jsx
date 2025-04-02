import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import axios from "axios";

const axiosInstance = axios.create({ withCredentials: true });

const addProduct = async (formData) => {
  try {
    const response = await axiosInstance.post(
      "http://localhost:3000/products",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error adding product:", error.response?.data || error);
  }
};

const AddProductModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();
  const [image, setImage] = useState(null);

  const addProductMutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      reset();
      setImage(null);
      onClose();
    },
  });

  const onSubmit = (data) => {
    if (!data.title || !data.price || !image) {
      alert("Please fill in all required fields!");
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "rating") {
        formData.append("rating", JSON.stringify({ average: value, count: 0 }));
      } else {
        formData.append(key, value);
      }
    });
    if (image) formData.append("image", image);

    addProductMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add New Product</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            type="text"
            placeholder="Product ID"
            {...register("productId")}
          />
          <input
            type="text"
            placeholder="Title"
            {...register("title", { required: true })}
          />
          <input
            type="number"
            placeholder="Price"
            {...register("price", { required: true })}
          />
          <input
            type="text"
            placeholder="Description"
            {...register("description")}
          />
          <input type="text" placeholder="Category" {...register("category")} />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <input type="number" placeholder="Rating" {...register("rating")} />
          <button type="submit">Add Product</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
