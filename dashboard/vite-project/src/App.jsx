import React from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router";
import PoductTable from "./components/pages/private/ProductTable";
import OrdersTable from "./components/pages/private/OrdersTable";
import UserTable from "./components/pages/private/UserTable";
import Nav from "./components/section/Nav";
import { useContext } from "react";
import { AuthContext } from "./components/contexts/AuthContext";
import SignIn from "./components/pages/private/SignIn";
import CategoryTable from "./components/pages/private/CategoryTable";
function Root() {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  );
}

const App = () => {
  const { isAuth } = useContext(AuthContext);
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Root />}>
            <Route element={isAuth ? <Outlet /> : <Navigate to={"/"} />}>
              <Route path="/ProductTable" element={<PoductTable />} />
              <Route path="/OrderTable" element={<OrdersTable />} />
              <Route path="/UserTable" element={<UserTable />} />
              <Route path="/CategoryTable" element={<CategoryTable />} />
            </Route>

            <Route
              element={!isAuth ? <Outlet /> : <Navigate to={"/ProductTable"} />}
            >
              <Route index element={<SignIn />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
