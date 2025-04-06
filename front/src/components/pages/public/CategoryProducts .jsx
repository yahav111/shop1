import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CategoryProducts = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`/categories/${id}/products`);
        setProducts(response.data);
      } catch (err) {
        setError("Failed to fetch products.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Products in Category {id}
      </h1>

      {products.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <li
              key={product.id}
              className="bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  {product.title}
                </h2>
                <p className="text-gray-600 text-sm mb-2">
                  {product.description}
                </p>
                <p className="text-green-600 font-bold text-lg">
                  ${product.price}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          No products found in this category.
        </div>
      )}
    </div>
  );
};

export default CategoryProducts;
