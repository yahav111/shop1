import axios from "axios";
export const generateAccessToken = async () => {
  try {
    const { data } = await axios.post(
      `${process.env.PAYPAL_BASEURL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: process.env.PAYPAL_CLIENT_ID,
          password: process.env.PAYPAL_SECRET,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return data.access_token;
  } catch (error) {
    console.error("PayPal Token Error:", error.response?.data || error.message);
    throw new Error("Failed to generate PayPal token");
  }
};
export const createOrder = async (req, res) => {
  try {
    const { totalPrice } = req.body;

    if (!totalPrice || isNaN(totalPrice)) {
      return res.status(400).json({ message: "Invalid price" });
    }

    console.log("Received Price:", totalPrice);

    const accessToken = await generateAccessToken();

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: totalPrice.toString(),
          },
        },
      ],
    };

    const { data } = await axios.post(
      `${process.env.PAYPAL_BASEURL}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("Order Created:", data);

    res.json({ orderId: data.id, order: data });
  } catch (error) {
    console.error("PayPal Order Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to create PayPal order" });
  }
};

export const capturePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const accessToken = await generateAccessToken();

    const captureResponse = await axios.post(
      `${process.env.PAYPAL_BASEURL}/v2/checkout/orders/${orderId}/capture`,
      {}, // Empty body
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json({ success: true, data: captureResponse.data });
  } catch (error) {
    console.error("Error capturing order:", error);
    res
      .status(500)
      .json({ message: "Failed to capture order", error: error.message });
  }
};
