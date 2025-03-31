import { createContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await axios.post(
        "http://localhost:3000/auth/signinDashboard",
        { email, password },
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: (data) => {
      setIsAuth(true);
      alert("Login successful!");
      console.log("User:", data.user);
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Login failed");
    },
  });

  return (
    <AuthContext.Provider value={{ isAuth, setIsAuth, login: mutation.mutate }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
