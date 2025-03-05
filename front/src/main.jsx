import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import CartProvider from "./components/contexts/CartContext.jsx";
import AuthProvider from "./components/contexts/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <CartProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </CartProvider>
);
