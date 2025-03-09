import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useSearchParams } from "react-router";
const ResetPassword = () => {
  const { resetPassword } = useContext(AuthContext);
  const [NewPassword, SetNewPassword] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchParamsToken, SetsearchParamsToken] = useSearchParams();

  const email = searchParams.get("email");
  console.log(email);

  const token = searchParamsToken.get("token");
  console.log(token);

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        ></a>
        <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
          <h1 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            New Password
          </h1>
          <p className="font-light text-gray-500 dark:text-gray-400">
            write your new password
          </p>
          <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" action="#">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Your new password
              </label>
              <input
                onChange={(e) => {
                  SetNewPassword(e.target.value);
                }}
                type="password"
                name="password"
                id="pasword"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="password"
                required=""
              />
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5"></div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="terms"
                  className="font-light text-gray-500 dark:text-gray-300"
                >
                  I accept the{" "}
                  <a
                    className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                    href="#"
                  >
                    Terms and Conditions
                  </a>
                </label>
              </div>
            </div>
            <button
              onClick={() => resetPassword(NewPassword, email, token)}
              type="button"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Reset password
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
