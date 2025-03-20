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
