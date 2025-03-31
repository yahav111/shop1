import { createContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

export const AuthContext = createContext();

const useAuth = () => {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const response = await axios.get("/auth/me", {
        withCredentials: true,
      });
      return response.data;
    },
    retry: false,
  });
};

const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const { data, error } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await axios.post(
        "/auth/signinDashboard",
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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post("/auth", {}, { withCredentials: true });
    },
    onSuccess: () => {
      setIsAuth(false);
      alert("Logged out successfully!");
      window.location.href = "/"; // Redirect user
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Logout failed");
    },
  });

  useEffect(() => {
    if (data?.tokenExists) {
      console.log("yahav");
      setIsAuth(true);
    } else if (error) {
      setIsAuth(false);
    }
  }, [data, error]);

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        setIsAuth,
        login: mutation.mutate,
        logout: logoutMutation.mutate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
