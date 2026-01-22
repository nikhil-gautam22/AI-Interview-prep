import React, { useState, useContext } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPath";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/userContext";

const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError("");

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      // BACKEND RESPONSE STRUCTURE
      const {
        token,
        _id,
        name,
        email: userEmail,
        profileImageUrl,
      } = response.data;

      if (!token) {
        setError("Invalid login response");
        return;
      }

      // STORE TOKEN
      localStorage.setItem("token", token);

      // STORE USER ONLY (NO TOKEN)
      updateUser({
        _id,
        name,
        email: userEmail,
        profileImageUrl,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="w-[90vw] md:w-[33vw] p-7 bg-white rounded-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black">Welcome Back</h3>
        <p className="text-xs text-slate-700 mt-1">
          Please enter your details to log in
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="text-sm text-gray-800">Email Address</label>
          <input
            type="email"
            value={email}
            placeholder="email@gmail.com"
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-800">Password</label>
          <div className="mt-1 flex items-center border border-gray-200 rounded-md px-3 py-2">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm outline-none"
            />
            {showPassword ? (
              <FaRegEye onClick={() => setShowPassword(false)} />
            ) : (
              <FaRegEyeSlash onClick={() => setShowPassword(true)} />
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button type="submit" className="btn-primary w-full">
          Login
        </button>
      </form>

      <p className="text-sm text-center text-gray-600 mt-5">
        Don’t have an account?{" "}
        <button
          type="button"
          className="font-medium text-primary underline"
          onClick={() => setCurrentPage("signup")}
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

export default Login;
