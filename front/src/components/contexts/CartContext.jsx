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
  const DeleteCart = async (productId) => {
    try {
      const productIdString = String(productId); // Ensure it's a string
      console.log(productIdString, "yahavvvv");

      setuserCart((prevCart) =>
        prevCart.filter((item) => String(item.productId) !== productIdString)
      );

      await axios.delete("http://localhost:3000/products", {
        data: { productId: productIdString }, // Ensure it's a string
        withCredentials: true,
      });
    } catch (error) {
      console.error(
        "Failed to remove product from cart",
        error.response?.data || error.message
      );
    }
  };

  const addToCart = async (product) => {
    try {
      console.log(product, "product");

      setuserCart((prevCart) => {
        const existingProduct = prevCart.find(
          (item) => item.productId === product.productId
        );

        const updatedCart = existingProduct
          ? prevCart.map((item) =>
              item.productId === product.productId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...prevCart, { ...product, quantity: 1 }];

        // Make the POST request for adding the product to the cart
        axios.post(
          "http://localhost:3000/products/addToCart",
          {
            title: product.title,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.image,
            rating: product.rating,
            productId: product.productId,
          },
          { withCredentials: true }
        );

        return updatedCart;
      });
    } catch (error) {
      console.error(
        "Failed to add product to cart",
        error.response?.data || error.message
      );
    }
  };

  // clickPlus function to increase the quantity
  const clickPlus = (productId) => {
    setuserCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );

      axios.put(
        "http://localhost:3000/products",
        {
          productId,
          quantity: updatedCart.find((item) => item.productId === productId)
            .quantity,
        },
        { withCredentials: true }
      );

      return updatedCart;
    });
  };

  const clickMinus = (productId) => {
    setuserCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.productId === productId && item.quantity > 1 // Make sure quantity doesn't go below 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );

      axios.put(
        "http://localhost:3000/products",
        {
          productId,
          quantity: updatedCart.find((item) => item.productId === productId)
            .quantity,
        },
        { withCredentials: true }
      );

      return updatedCart;
    });
  };

  const ClearCart = async () => {
    await axios.delete("http://localhost:3000/products/clear");
    setuserCart([]);
  };

  useEffect(() => {
    const newCart = [...userCart];

    const total = newCart.reduce(
      (sum, product) =>
        sum + (product.product?.price || product.price) * product.quantity,
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
