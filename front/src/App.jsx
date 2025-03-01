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
        <Routes>
          <Route path="/" element={<Root />}>
            <Route index element={<Login />} />
            <Route path="about" element={<About />} />
            <Route path="store" element={<Store />} />
            <Route path="product/:id" element={<OneProduct />} />
            <Route path="payment" element={<Payment />} />
            <Route path="home" element={<Home />} />
            <Route path="signin" element={<Signin />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
