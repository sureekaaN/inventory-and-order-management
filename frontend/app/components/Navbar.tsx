"use client";

import Link from "next/link";

export default function Navbar() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <nav className="bg-blue-600 text-white p-4 mb-6 rounded">

      <div className="flex justify-between items-center">

        <h1 className="text-xl font-bold">
          Inventory System
        </h1>

        <div className="flex gap-6">

          <Link href="/dashboard">
            Dashboard
          </Link>

          <Link href="/products">
            Products
          </Link>

          <Link href="/orders">
            Orders
          </Link>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>

      </div>

    </nav>
  );
}