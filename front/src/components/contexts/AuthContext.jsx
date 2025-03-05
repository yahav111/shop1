import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [message, setMessage] = useState("");

  // Forgot Password
  const forgotPassword = async (email) => {
    try {
      const res = await axios.post("http://localhost:5000/forgot-password", {
        email,
      });
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.error || "Something went wrong!");
    }
  };

  // Reset Password
  const resetPassword = async (email, token, newPassword) => {
    try {
      const res = await axios.post("http://localhost:5000/reset-password", {
        email,
        token,
        newPassword,
      });
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.error || "Something went wrong!");
    }
  };

  return (
    <AuthContext.Provider value={{ forgotPassword, resetPassword, message }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
