import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import CartProvider from "./components/contexts/CartContext.jsx";
import AuthProvider from "./components/contexts/AuthContext.jsx";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
import axios from "axios";

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <PayPalScriptProvider>
          <App />
        </PayPalScriptProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

axios.defaults.baseURL = "http://localhost:3000";
