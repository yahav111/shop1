import { createContext, useEffect, useState } from "react";
import axios from "axios";

import { data } from "react-router";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [userCart, setuserCart] = useState([]);

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

  // const generateAccessToken = async () => {
  //   try {
  //     const { data } = await axios.post(
  //       "https://api-m.sandbox.paypal.com/v1/oauth2/token",
  //       "grant_type=client_credentials",
  //       {
  //         auth: {
  //           username: process.env.PAYPAL_CLIENT_ID,
  //           password: process.env.PAYPAL_SECRET,
  //         },
  //       }
  //     );
  //     return data.access_token;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

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
      console.log(response.data, "yahav");

      if (response.data.message) {
        alert("Sign-in successful!");
        window.location.href = "http://localhost:5173/store";
      } else {
        alert("Sign-in failed: Token does not exist.");
      }
    } catch (err) {
      console.error("Sign-in failed", err);
    }
  };

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/products/userId`,
          {
            withCredentials: true,
          }
        );
        const products = data.products;
        console.log(products);

        // Ensure that the data is an array
        if (Array.isArray(products)) {
          setuserCart(products);
        } else {
          console.error("Data is not an array 2:", data.products);
        }
      } catch (error) {
        console.error("Failed to fetch user products", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3000/products`, {
          withCredentials: true,
        });

        // Ensure that the data is an array
        if (Array.isArray(data)) {
          setCart(data);
          console.log(data, "products only fetch");
        } else {
          console.error("Data is not an array:", data);
        }
      } catch (error) {
        console.error("Failed to fetch all products", error);
      }
    };

    // Fetch products from both sources
    fetchUserProducts();
    fetchProducts();
  }, []);

  // useEffect(() => {
  //   console.log(cart);
  // }, [cart]);

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
      console.log(product, "product");

      setCart((prevCart) => {
        const existingProduct = prevCart.find(
          (item) => item.productId === product.productId
        );

        if (existingProduct) {
          const updatedCart = prevCart.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );

          axios.put(
            `http://localhost:3000/products`,
            {
              productId: product.id,
              quantity: existingProduct.quantity + 1,
            },
            { withCredentials: true }
          );

          return updatedCart;
        } else {
          const newProduct = { ...product, quantity: 1 };

          axios.post(
            "http://localhost:3000/products/addToCart",
            {
              title: product.title,
              price: product.price,
              quantity: 1,
              description: product.description,
              category: product.category,
              image: product.image,
              rating: product.rating,
              productId: product.id,
            },
            { withCredentials: true }
          );

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
    const newCart = [...userCart];

    const total = newCart.reduce(
      (sum, product) => sum + product.product.price * product.quantity,
      0
    );
    setTotalPrice(total);
  }, [userCart]);

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
    userCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
