"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  fetchOrders();
  fetchProducts();
}, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Orders Error:", error);
    }
  };

  const fetchProducts = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      "http://localhost:5000/api/products",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setProducts(
      response.data.products || response.data
    );

  } catch (error) {
    console.error(error);
  }
};

  const handlePlaceOrder = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:5000/api/orders",
      {
        product_id: Number(productId),
        quantity: Number(quantity),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Order placed successfully!");

    setProductId("");
    setQuantity("");

    fetchOrders();

  } catch (error: any) {
    alert(
      error.response?.data?.message ||
      "Failed to place order"
    );
  }
};

const handleCancelOrder = async (orderId: number) => {
  try {
    const token = localStorage.getItem("token");

    await axios.patch(
      `http://localhost:5000/api/orders/${orderId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Order cancelled successfully!");

    fetchOrders();

  } catch (error: any) {
    alert(
      error.response?.data?.message ||
      "Failed to cancel order"
    );
  }
};

const handleUpdateStatus = async (
  orderId: number,
  status: string
) => {
  try {
    const token = localStorage.getItem("token");

    await axios.patch(
      `http://localhost:5000/api/orders/${orderId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert(`Order status updated to ${status}`);

    fetchOrders();

  } catch (error: any) {
    alert(
      error.response?.data?.message ||
      "Failed to update status"
    );
  }
};

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-3xl font-bold mb-8">
        Orders
      </h1>

      <input
  type="text"
  placeholder="Search Order ID..."
  value={orderSearch}
  onChange={(e) => setOrderSearch(e.target.value)}
  className="border p-2 rounded mb-4 w-full"
/>

      <div className="bg-white p-6 rounded shadow mb-6">

  <h2 className="text-xl font-bold mb-4">
    Place Order
  </h2>

  <div className="grid grid-cols-2 gap-4">

    <select
  value={productId}
  onChange={(e) => setProductId(e.target.value)}
  className="border p-2 rounded"
>
  <option value="">
    Select Product
  </option>

  {products.map((product) => (
    <option
      key={product.id}
      value={product.id}
    >
      {product.name}
    </option>
  ))}
</select>

    <input
      type="number"
      placeholder="Quantity"
      value={quantity}
      onChange={(e) => setQuantity(e.target.value)}
      className="border p-2 rounded"
    />

  </div>

  <button
    onClick={handlePlaceOrder}
    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
  >
    Place Order
  </button>

</div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow rounded">

          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Order ID</th>
              <th className="p-3">User ID</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
              <th className="p-3">Created At</th>
            </tr>
          </thead>

          <tbody>
            {orders
  .filter((order) =>
    order.id
      ?.toString()
      .includes(orderSearch)
  )
  .map((order, index) => (
              <tr
                key={`${order.id}-${index}`}
                className="text-center border-b"
              >
                <td className="p-3">
                  {order.id}
                </td>

                <td className="p-3">
                  {order.user_id}
                </td>

                <td className="p-3">
                  ₹{order.total_amount}
                </td>

                <td className="p-3">
                  {order.status}
                </td>

                <td className="p-3">

  <div className="flex gap-2 justify-center flex-wrap">

  {order.status === "Pending" && (
    <button
      onClick={() =>
        handleUpdateStatus(order.id, "Confirmed")
      }
      className="bg-blue-600 text-white px-3 py-1 rounded"
    >
      Confirm
    </button>
  )}

  {order.status === "Confirmed" && (
    <button
      onClick={() =>
        handleUpdateStatus(order.id, "Processing")
      }
      className="bg-yellow-600 text-white px-3 py-1 rounded"
    >
      Process
    </button>
  )}

  {order.status === "Processing" && (
    <button
      onClick={() =>
        handleUpdateStatus(order.id, "Shipped")
      }
      className="bg-purple-600 text-white px-3 py-1 rounded"
    >
      Ship
    </button>
  )}

  {order.status === "Shipped" && (
    <button
      onClick={() =>
        handleUpdateStatus(order.id, "Delivered")
      }
      className="bg-green-600 text-white px-3 py-1 rounded"
    >
      Deliver
    </button>
  )}

  {order.status !== "Cancelled" &&
    order.status !== "Delivered" && (
      <button
        onClick={() => {
          if (
            confirm(
              "Are you sure you want to cancel this order?"
            )
          ) {
            handleCancelOrder(order.id);
          }
        }}
        className="bg-red-600 text-white px-3 py-1 rounded"
      >
        Cancel
      </button>
    )}

</div>

</td>

                <td className="p-3">
                  {new Date(
                    order.created_at
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}