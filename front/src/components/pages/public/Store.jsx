import React, { useEffect, useState } from "react";
import axios from "axios";
import Products from "../../ui/Product";

function Store() {
  const url = "http://localhost:3000/products";
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Fetch products data from the server
  async function getProduct() {
    try {
      const { data } = await axios.get(url);
      setProducts(data);
      setFilteredProducts(data); // Initial set of all products
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getProduct();
  }, []);

  // Handle filtering by price
  const handleFilterByPrice = () => {
    const filtered = products.filter(
      (product) =>
        product.price >= Number(minPrice) && product.price <= Number(maxPrice)
    );
    setFilteredProducts(filtered);
    setShowModal(false); // Close modal after filtering
  };

  return (
    <div className="w-[90%] mx-auto">
      {/* Button to Open Modal */}
      <div className="flex justify-end my-4">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Filter by Price
        </button>
      </div>

      {/* Popup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500/75 transition-opacity flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[300px]">
            <h2 className="text-xl font-bold mb-4 text-center">
              Set Price Range
            </h2>
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-3"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleFilterByPrice}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="flex justify-start items-start flex-wrap gap-[40px]">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <Products key={index} product={product} />
          ))
        ) : (
          <p>No products found within the selected price range.</p>
        )}
      </div>
    </div>
  );
}

export default Store;
