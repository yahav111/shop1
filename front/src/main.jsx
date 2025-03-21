import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import CartProvider from "./components/contexts/CartContext.jsx";
import AuthProvider from "./components/contexts/AuthContext.jsx";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import axios from "axios";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <CartProvider>
      <PayPalScriptProvider>
        <App />
      </PayPalScriptProvider>
    </CartProvider>
  </AuthProvider>
);

axios.defaults.baseURL = "http://localhost:3000";
