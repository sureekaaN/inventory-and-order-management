"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  fetchDashboard();
}, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats(response.data);
    } catch (error) {
      console.error("Dashboard Error:", error);
    }
  };

  if (!stats) {
    return (
      <div className="p-10 text-center">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <div className="flex justify-between items-center mb-8">

  <h1 className="text-3xl font-bold">
    Inventory Dashboard
  </h1>

  <button
    onClick={() => {
      localStorage.removeItem("token");
      window.location.href = "/";
    }}
    className="bg-red-600 text-white px-4 py-2 rounded"
  >
    Logout
  </button>

</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">
            Total Users
          </h2>

          <p className="text-3xl mt-3">
            {stats.totalUsers}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">
            Total Products
          </h2>

          <p className="text-3xl mt-3">
            {stats.totalProducts}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">
            Total Orders
          </h2>

          <p className="text-3xl mt-3">
            {stats.totalOrders}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">
            Total Revenue
          </h2>

          <p className="text-3xl mt-3">
            ₹{stats.totalRevenue}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">
            Pending Orders
          </h2>

          <p className="text-3xl mt-3">
            {stats.pendingOrders}
          </p>
        </div>

      </div>
    </div>
  );
}