import React, { useEffect, useState } from "react";
import axios from "axios";
import Products from "../../ui/Product";

function Store() {
  const url = "http://localhost:3000/products";
  const [products, setProducts] = useState({ product: [] });

  async function getProduct() {
    try {
      const { data } = await axios.get(url);
      setProducts({ product: data });
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getProduct();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap w-[90%] mx-auto">
        {products.product.map((product, index) => (
          <Products key={index} product={product} />
        ))}
      </div>
    </div>
  );
}

export default Store;
