import { createContext, useEffect, useState } from "react";
import axios from "axios";

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
      const response = await axios.post("http://localhost:3000/auth/signup", {
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
      const response = await axios.post("http://localhost:3000/auth/signin", {
        email: user.email,
        password: user.password,
      });

      const token = response.data.token;
      localStorage.setItem("token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.userId;

      localStorage.setItem("userId", userId);
      setUserID(userId);

      alert("Sign-in successful!");
    } catch (err) {
      console.error("Sign-in failed", err);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/auth/forgot-password",
        { email }
      );
      setMessage(res.data.message);
      alert("Check your email for password reset instructions.");
    } catch (error) {
      setMessage(error.response?.data?.error || "Something went wrong!");
    }
  };

  const resetPassword = async (email, token, newPassword) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/auth/reset-password",
        {
          email,
          token,
          newPassword,
        }
      );
      setMessage(res.data.message);
      alert("Password reset successful!");
    } catch (error) {
      setMessage(error.response?.data?.error || "Something went wrong!");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const userId = localStorage.getItem("userId"); // קבלת ה-userId מה-localStorage
        if (!userId) return;

        const { data } = await axios.get(
          `http://localhost:3000/products?userId=${userId}`
        );
        setCart(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    fetchProducts();
  }, [UserID]);

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
      const userId = localStorage.getItem("userId"); // Get userId from localStorage
      if (!userId) {
        alert("Please sign in first!");
        return;
      }

      const index = cart.findIndex((item) => item.id === product.id);
      if (index !== -1) {
        const newCart = [...cart];
        newCart[index].quantity += 1;
        setCart(newCart);

        await axios.put(`http://localhost:3000/products/${product.id}`, {
          quantity: newCart[index].quantity,
          userId,
        });
      } else {
        setCart([...cart, { quantity: 1, ...product }]);

        await axios.post("http://localhost:3000/products", {
          quantity: 1,
          ...product,
          userId,
        });
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
        await axios.put(`http://localhost:3000/products/${product.id}`, {
          quantity: updatedCart[index].quantity,
        });
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
        await axios.put(`http://localhost:3000/products/${product.id}`, {
          quantity: updatedCart[index].quantity,
        });
      }
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
