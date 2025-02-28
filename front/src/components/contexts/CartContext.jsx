import { createContext, useEffect, useState } from "react";
import axios from "axios"

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);




  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const {data} = await axios.get("http://localhost:3000/products");
        console.log(data); 
        setCart(data); 
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    fetchProducts();
  }, []);



  useEffect(() => {
    console.log(cart);
  }, [cart]);



   const DeleteCart = async (product) => {
    try {
      await axios.delete(`http://localhost:3000/products/${product.id}`); 
      const updatedCart = cart.filter((item) => item.id !== product.id);
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to delete product", error);
    }
  };



  
  const addToCart = async (product) => {
    try {
      const index = cart.findIndex((item) => item.id === product.id);
      if (index !== -1) {
        const newCart = [...cart];
        newCart[index].quantity += 1;
        setCart(newCart);
    
        await axios.put(`http://localhost:3000/products/${product.id}`, { quantity: newCart[index].quantity });
      } else {
        setCart([...cart, { quantity: 1, ...product }]);

        await axios.post("http://localhost:3000/products", { quantity: 1, ...product });
      }
    } catch (error) {
      console.error("Failed to add product to cart", error);
    }
  };

  

  

  const clickPlus = async (product) => {
    try {
      const updatedCart = [...cart];
      const index = updatedCart.findIndex((item) => item.id === product.id);
      if (index !== -1) {
        updatedCart[index].quantity += 1;
        setCart(updatedCart);
        await axios.put(`http://localhost:3000/products/${product.id}`, { quantity: updatedCart[index].quantity });
      }
    } catch (error) {
      console.error("Failed to update product quantity", error);
    }
  };
  const clickMinus = async (product) => {
    try {
      const updatedCart = [...cart];
      const index = updatedCart.findIndex((item) => item.id === product.id);
      if (index !== -1 && updatedCart[index].quantity > 1) {
        updatedCart[index].quantity -= 1;
        setCart(updatedCart);
        await axios.put(`http://localhost:3000/products/${product.id}`, { quantity: updatedCart[index].quantity });
      }
    } catch (error) {
      console.error("Failed to update product quantity", error);
    }
  };


  const ClearCart = async () => {
      await axios.delete("http://localhost:3000/products"); 
      setCart([]);}


  useEffect(() => {
    const newCart = [...cart];
    const total = newCart.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );

    setTotalPrice(total);
  }, [cart]);

  const value = {
    showCart,
    setShowCart,
    cart,
    addToCart,
    DeleteCart,
    clickPlus,
    clickMinus,
    ClearCart,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
