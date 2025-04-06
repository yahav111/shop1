import React from "react";
import "../../ProductEditModal.css";

const ProductEditModal = ({ isOpen, onClose, product, onChange, onSave }) => {
  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(e, "image", file);
    }
  };

  const handleSave = () => {
    // Create a FormData object to send the product data and image to the server
    const formData = new FormData();
    formData.append("title", product.title);

    formData.append("price", parseFloat(product.price)); // Ensure it's a Float

    formData.append("categoryId", product.category.id);

    formData.append("rating", JSON.stringify(product.rating));

    // If a new image is provided, append it to FormData
    if (product.image) {
      formData.append("image", product.image);
    }

    // Call the onSave function and pass the FormData
    onSave(formData);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Product</h2>
        <label>Title</label>
        <input
          type="text"
          value={product.title}
          onChange={(e) => onChange(e, "title")}
        />
        <label>Price</label>
        <input
          type="number"
          value={product.price}
          onChange={(e) => onChange(e, "price")}
        />
        <label>Category</label>
        <input
          type="text"
          value={product.category?.name || ""}
          onChange={(e) =>
            onChange(e, "category", {
              ...product.category,
              name: e.target.value,
            })
          }
        />

        <label>Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <label>Rating</label>
        <input
          type="number"
          value={product.rating?.rate}
          onChange={(e) =>
            onChange(e, "rating", { ...product.rating, rate: e.target.value })
          }
        />
        <div className="modal-footer">
          <button className="handleSubmit" onClick={handleSave}>
            Save
          </button>
          <button className="onClose" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal;
