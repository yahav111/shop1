import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function OneProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  const getProductDetails = async () => {
    try {
      const { data } = await axios.get(
        `https://fakestoreapi.com/products/${id}`
      );
      setProduct(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getProductDetails();
  }, [id]);

  return (
    <div className="w-[40%] mx-auto p-5 h-[40%] mx-auto p-5">
      {product ? (
        <div className="max-w-2xl bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <img
            className="rounded-t-lg w-full"
            src={product.image}
            alt={product.title}
          />
          <div className="p-5">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {product.title}
            </h5>
            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
              {product.description}
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              ${product.price}
            </p>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default OneProduct;
