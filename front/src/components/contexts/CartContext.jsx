import { createContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

import { data } from "react-router";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [UserID, setUserID] = useState("");

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/auth/signup", {
        name: user.name,
        email: user.email,
        password: user.password,
      });
      alert("Sign-up successful!");
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/auth/signin",
        {
          email: user.email,
          password: user.password,
        },
        { withCredentials: true }
      );

      const token = response.data.token;
      localStorage.setItem("token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      // const userId = payload.userId;

      // localStorage.setItem("userId", userId);
      // setUserID(userId);
      // console.log(userId);

      alert("Sign-in successful!");
    } catch (err) {
      console.error("Sign-in failed", err);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3000/products`, {
          withCredentials: true,
        });
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
      const userId = localStorage.getItem("userId");

      console.log(product.productId, "Product ID");
      console.log(userId, "User ID");

      await axios.delete("http://localhost:3000/products", {
        headers: { "Content-Type": "application/json" },
        data: { userId, productId: product.productId },
      });

      const updatedCart = cart.filter(
        (item) => item.productId !== product.productId
      );
      setCart(updatedCart);

      console.log("Product deleted successfully");
    } catch (error) {
      console.error("Failed to delete product", error);
    }
  };

  const addToCart = async (product) => {
    try {
      const userId = getUserIdFromToken();

      setCart((prevCart) => {
        const existingProduct = prevCart.find(
          (item) => item.productId === product.id
        );

        if (existingProduct) {
          const updatedCart = prevCart.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );

          axios.put(`http://localhost:3000/products/${product.id}`, {
            userId,
            productId: product.id,
            quantity: existingProduct.quantity + 1,
          });

          return updatedCart;
        } else {
          const newProduct = { ...product, quantity: 1 };

          axios.post("http://localhost:3000/products", {
            title: product.title,
            price: product.price,
            quantity: 1,
            description: product.description,
            category: product.category,
            image: product.image,
            rating: product.rating,
            userId,
            productId: product.id,
          });

          return [...prevCart, newProduct];
        }
      });
    } catch (error) {
      console.error(
        "Failed to add product to cart",
        error.response?.data || error.message
      );
    }
  };

  const clickPlus = async (product) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Please sign in first!");
        return;
      }

      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );

        const updatedProduct = updatedCart.find(
          (item) => item.id === product.id
        );
        console.log(product.productId, "ydydsu");

        axios.put(`http://localhost:3000/products/${product.productId}`, {
          userId: userId,
          productId: product.productId,
          quantity: updatedProduct.quantity, // Updated quantity
        });

        return updatedCart;
      });
    } catch (error) {
      console.error("Failed to update product quantity", error);
    }
  };

  const clickMinus = async (product) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Please sign in first!");
        return;
      }

      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) =>
          item.id === product.id && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );

        const updatedProduct = updatedCart.find(
          (item) => item.id === product.id
        );

        axios.put(`http://localhost:3000/products/${product.productId}`, {
          userId: userId,
          productId: product.productId,
          quantity: updatedProduct?.quantity || 1, // Ensure it doesn't go below 1
        });

        return updatedCart;
      });
    } catch (error) {
      console.error("Failed to update product quantity", error);
    }
  };

  const ClearCart = async () => {
    await axios.delete("http://localhost:3000/products");
    setCart([]);
  };

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
    handleSignIn,
    handleSignUp,
    handleChange,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
