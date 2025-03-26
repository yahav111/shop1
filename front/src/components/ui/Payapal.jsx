import React, { useState, useContext } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import axios from "axios";

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
      // Capture the order from PayPal
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/paypal/${orderId}`,
        { orderId },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Order Captured:", response.data);

      // Send a POST request to /order with credentials
      const orderResponse = await axios.post(
        "http://localhost:3000/order",
        {},
        {
          withCredentials: true,
        }
      );

      console.log("Order Response:", orderResponse.data);

      navigate("/success"); // Redirect to success page after saving the order
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
