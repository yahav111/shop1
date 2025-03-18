import { createContext, useContext, useState, useEffect } from "react";

import axios from "axios";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [message, setMessage] = useState("");

  const forgotPassword = async (email) => {
    try {
      const res = await axios.post("http://localhost:3000/Password/forgot", {
        email,
      });

      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.error || "Something went wrong!");
    }
  };

  const resetPassword = async (newPassword, email, token) => {
    try {
      const res = await axios.post("http://localhost:3000/Password/reset", {
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

export default AuthProvider;
