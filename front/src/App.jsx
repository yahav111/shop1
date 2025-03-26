import { BrowserRouter, Routes, Route, Outlet } from "react-router";
import Home from "./components/pages/public/Home";
import Store from "./components/pages/public/Store";
import About from "./components/pages/public/About";
import Nav from "./components/section/Nav";
import OneProduct from "./components/ui/oneProduct";
import ShoppingCarts from "./components/ui/ShoppingCarts";
import Payment from "./components/ui/payment";
import Login from "./components/ui/Login";
import Signin from "./components/ui/Signin";
import ForgotPassword from "./components/ui/ForgotPassword";
import ResetPassword from "./components/ui/ResetPassword";
import AuthProvider from "./components/contexts/AuthContext";
import Success from "./components/pages/public/Success";
import Cancel from "./components/pages/public/Cancel";
import UpdateUser from "./components/pages/public/UpdateUser";
import Orders from "./components/pages/public/Orders";

// Hoisting

// Layout
function Root() {
  return (
    <>
      <Nav />

      <ShoppingCarts />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Root />}>
              <Route index element={<Login />} />
              <Route path="about" element={<About />} />
              <Route path="store" element={<Store />} />
              <Route path="product/:productId" element={<OneProduct />} />
              <Route path="payment" element={<Payment />} />
              <Route path="home" element={<Home />} />
              <Route path="signin" element={<Signin />} />
              <Route path="Password/forgot" element={<ForgotPassword />} />
              <Route path="Password/reset" element={<ResetPassword />} />
              <Route path="success" element={<Success />} />
              <Route path="cancel" element={<Cancel />} />
              <Route path="UpdateUser" element={<UpdateUser />} />
              <Route path="Orders" element={<Orders />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
