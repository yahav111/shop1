import React, { useEffect, useState } from "react";
import axios from "axios";
import Products from "../../ui/Product";

function Store() {
  const url = "https://fakestoreapi.com/products";
  const [products, setProducts] = useState([]);

  async function getProduct() {
    try {
      const { data } = await axios.get(url);
      setProducts(data);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }

  //  Mounting
  useEffect(() => {
    getProduct();
  }, []);

  // const HandleAdd = (item) => {
  //   setSideproducts((prev) => {
  //     return [...prev, item];
  //   });
  //   console.log(Sideproducts);
  //   console.log(item);
  // };

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap w-[90%] mx-auto">
        {products.map((product, index) => (
          <Products key={index} product={product} />
        ))}
      </div>

      <div>
        {/* {Sideproducts.map((sideproduct, index) => (
          <ShoppingCarts key={index} sideproduct={sideproduct} />
        ))} */}
      </div>
    </div>
  );
}

export default Store;
