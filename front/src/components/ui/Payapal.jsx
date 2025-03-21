import React, { useState, useContext } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";

const Paypal = () => {
  const { totalPrice } = useContext(CartContext);
  const [orderId, setOrderId] = useState(null); // State to store orderId
  const navigate = useNavigate();

  const createOrder = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/paypal`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ totalPrice }),
        }
      );

      if (!response.ok) throw new Error("Failed to create order");

      const data = await response.json();
      setOrderId(data.orderId); // Set the orderId to state
      return data.orderId;
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      return null;
    }
  };

  const captureOrder = async (orderId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/paypal/${orderId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        }
      );

      if (!response.ok) throw new Error("Failed to capture order");

      const data = await response.json();
      console.log("Order Captured:", data);
      navigate("/success"); // Redirect to success page after capture
    } catch (error) {
      console.error("Error capturing order:", error);
    }
  };

  return (
    <PayPalScriptProvider
      options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "20px",
        }}
      >
        {/* Show Order ID */}
        {orderId && <p>Your Order ID: {orderId}</p>}

        <PayPalButtons
          style={{
            layout: "horizontal",
            color: "blue",
            shape: "pill",
            label: "checkout",
            height: 45,
          }}
          createOrder={createOrder}
          onApprove={(data, actions) =>
            actions.order.capture().then(() => {
              captureOrder(orderId);
            })
          }
          onCancel={() => navigate("/cancel")}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default Paypal;
