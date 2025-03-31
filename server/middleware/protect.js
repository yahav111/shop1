import pkg from "jsonwebtoken";
const { verify } = pkg;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const Protect = (req, res, next) => {
  try {
    const token = req.cookies.authToken;
    console.log(token, "tokenProtect");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied!" });
    }

    const decoded = verify(token, JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Token is not valid!" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT Verification Error:", error.message);
    return res.status(401).json({ message: "Token verification failed!" });
  }
};

export default Protect;
