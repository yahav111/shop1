import React, { useContext, useState } from "react";
import { Link } from "react-router-dom"; // Update from "react-router" to "react-router-dom"
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Fetch function for categories
const fetchCategories = async () => {
  const response = await axios.get("/categories"); // Replace with your actual API endpoint
  return response.data;
};

const CategoryDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Using React Query to fetch categories
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error loading categories</div>;

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50"
          id="menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          Category
          <svg
            className="-mr-1 size-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`} // Assuming you have a route for category details
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  {category.name} ({category.productCount} products)
                </Link>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-700">
                No categories available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
