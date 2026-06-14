"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      console.log("Response:", response.data);

      localStorage.setItem(
        "token",
        response.data.token
      );

      console.log(
        "Saved Token:",
        localStorage.getItem("token")
      );

      setMessage("Login successful!");

      window.location.href = "/dashboard";

    } catch (error: any) {
      setMessage(
        error.response?.data?.message ||
        "Login failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Inventory Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4 rounded"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Login
        </button>

        {message && (
          <p className="mt-4 text-center">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}