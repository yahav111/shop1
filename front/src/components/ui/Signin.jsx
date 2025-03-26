import React, { useContext } from "react";
import { CartContext } from "../contexts/CartContext";
import { Link } from "react-router";
const Signin = () => {
  const { handleChange, handleSignUp } = useContext(CartContext);

  return (
    <div className="bg-grey-lighter min-h-screen flex flex-col">
      <div className="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2">
        <div className="bg-white px-6 py-8 rounded shadow-md text-black w-full">
          <h1 className="mb-8 text-3xl text-center">Sign up</h1>
          <input
            onChange={handleChange}
            type="text"
            className="block border border-grey-light w-full p-3 rounded mb-4"
            name="name"
            placeholder="Full Name"
          />
          <input
            onChange={handleChange}
            type="text"
            className="block border border-grey-light w-full p-3 rounded mb-4"
            name="email"
            placeholder="Email"
          />
          <input
            onChange={handleChange}
            type="password"
            className="block border border-grey-light w-full p-3 rounded mb-4"
            name="password"
            placeholder="Password"
          />
          <Link to="/">
            <button
              onClick={handleSignUp}
              type="submit"
              className="w-full text-center py-3 rounded bg-green  hover:bg-green-dark focus:outline-none my-1"
            >
              Create Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Signin;
