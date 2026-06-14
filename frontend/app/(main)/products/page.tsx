"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [lowStockLimit, setLowStockLimit] = useState("");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  fetchProducts();
}, []);

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

      setProducts(response.data.products || response.data);
    } catch (error) {
      console.error("Products Error:", error);
    }
  };

  const handleAddProduct = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:5000/api/products",
      {
        name,
        sku,
        category,
        price,
        stock,
        low_stock_limit: lowStockLimit,
        status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Product added successfully!");

    setName("");
    setSku("");
    setCategory("");
    setPrice("");
    setStock("");
    setLowStockLimit("");
    setStatus("Active");

    fetchProducts();
  } catch (error: any) {
    alert(
      error.response?.data?.message ||
      "Failed to add product"
    );
  }
};

const handleEditProduct = async (product: any) => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5000/api/products/${product.id}`,
      {
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        stock: product.stock,
        low_stock_limit: product.low_stock_limit,
        status: product.status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Product updated successfully!");

    setEditingId(null);
    fetchProducts();

  } catch (error: any) {
    alert(
      error.response?.data?.message ||
      "Failed to update product"
    );
  }
};

const handleDeleteProduct = async (id: number) => {
  try {
    const token = localStorage.getItem("token");

    await axios.delete(
      `http://localhost:5000/api/products/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Product deleted successfully!");

    fetchProducts();

  } catch (error: any) {
    alert(
      error.response?.data?.message ||
      "Failed to delete product"
    );
  }
};

const handleAddStock = async (
  productId: number,
  quantity: number
) => {
  try {
    const token = localStorage.getItem("token");

    await axios.patch(
      `http://localhost:5000/api/products/${productId}/add-stock`,
      { quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Stock added successfully!");

    fetchProducts();

  } catch (error: any) {
    alert(
      error.response?.data?.message ||
      "Failed to add stock"
    );
  }
};

const handleReduceStock = async (
  productId: number,
  quantity: number
) => {
  try {
    const token = localStorage.getItem("token");

    await axios.patch(
      `http://localhost:5000/api/products/${productId}/reduce-stock`,
      { quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Stock reduced successfully!");

    fetchProducts();

  } catch (error: any) {
    alert(
      error.response?.data?.message ||
      "Failed to reduce stock"
    );
  }
};

const filteredProducts = products
  .filter((product) =>
    product.name
      .toLowerCase()
      .includes(search.toLowerCase())
  )
  .filter((product) =>
    categoryFilter === ""
      ? true
      : product.category === categoryFilter
  )
  .filter((product) =>
    statusFilter === ""
      ? true
      : product.status === statusFilter
  );

const indexOfLastProduct =
  currentPage * itemsPerPage;

const indexOfFirstProduct =
  indexOfLastProduct - itemsPerPage;

const currentProducts =
  filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-3xl font-bold mb-8">
        Products
      </h1>

      <input
  type="text"
  placeholder="Search products..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="border p-2 rounded mb-4 w-full"
/>

<div className="flex gap-4 mb-4">

  <select
    value={categoryFilter}
    onChange={(e) => setCategoryFilter(e.target.value)}
    className="border p-2 rounded"
  >
    <option value="">All Categories</option>
    <option value="Electronics">Electronics</option>
    <option value="Accessories">Accessories</option>
    <option value="Office">Office</option>
  </select>

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border p-2 rounded"
  >
    <option value="">All Status</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>

</div>

      <div className="bg-white p-6 rounded shadow mb-6">

  <h2 className="text-xl font-bold mb-4">
    Add Product
  </h2>

  <div className="grid grid-cols-2 gap-4">

    <input
      placeholder="Product Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="border p-2 rounded"
    />

    <input
      placeholder="SKU"
      value={sku}
      onChange={(e) => setSku(e.target.value)}
      className="border p-2 rounded"
    />

    <input
      placeholder="Category"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      className="border p-2 rounded"
    />

    <input
      type="number"
      placeholder="Price"
      value={price}
      onChange={(e) => setPrice(e.target.value)}
      className="border p-2 rounded"
    />

    <input
      type="number"
      placeholder="Stock"
      value={stock}
      onChange={(e) => setStock(e.target.value)}
      className="border p-2 rounded"
    />

    <input
      type="number"
      placeholder="Low Stock Limit"
      value={lowStockLimit}
      onChange={(e) => setLowStockLimit(e.target.value)}
      className="border p-2 rounded"
    />

  </div>

  <button
    onClick={handleAddProduct}
    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
  >
    Add Product
  </button>

</div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow rounded">

          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentProducts.map((product) => (
              <tr
                key={product.id}
                className="text-center border-b"
              >
                <td className="p-3">
                  {product.name}
                </td>

                <td className="p-3">
                  {product.sku}
                </td>

                <td className="p-3">
                  {product.category}
                </td>

                <td className="p-3">
                  ₹{product.price}
                </td>

                <td className="p-3">
                  {product.stock}

                  {product.stock <= product.low_stock_limit && (
                    <span className="ml-2 text-red-600 font-bold">
                      Low Stock
                    </span>
                  )}
                </td>

                <td className="p-3">
                  {product.status}
                </td>

                <td className="p-3">
  <button
    onClick={() => {
      const newPrice = prompt(
        "Enter new price:",
        product.price
      );

      if (newPrice !== null) {
        handleEditProduct({
          ...product,
          price: newPrice,
        });
      }
    }}
    className="bg-yellow-500 text-white px-3 py-1 rounded"
  >
    Edit
    </button>

    <button
  onClick={() => {
    if (
      confirm(
        "Are you sure you want to delete this product?"
      )
    ) {
      handleDeleteProduct(product.id);
    }
  }}
  className="bg-red-600 text-white px-3 py-1 rounded ml-2"
>
  Delete
  </button>

  <button
  onClick={() => {
    const qty = prompt(
      "Enter quantity to add:"
    );

    if (qty) {
      handleAddStock(
        product.id,
        Number(qty)
      );
    }
  }}
  className="bg-green-600 text-white px-3 py-1 rounded ml-2"
>
  Add Stock
  </button>
  <button
  onClick={() => {
    const qty = prompt(
      "Enter quantity to reduce:"
    );

    if (qty) {
      handleReduceStock(
        product.id,
        Number(qty)
      );
    }
  }}
  className="bg-blue-600 text-white px-3 py-1 rounded ml-2"
>
  Reduce Stock
</button>
</td>
              </tr>
            ))}
          </tbody>

        </table>
        <div className="flex justify-center gap-4 mt-6">

  <button
    onClick={() =>
      setCurrentPage((prev) =>
        Math.max(prev - 1, 1)
      )
    }
    disabled={currentPage === 1}
    className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
  >
    Previous
  </button>

  <span className="flex items-center">
    Page {currentPage}
  </span>

  <button
    onClick={() =>
      setCurrentPage((prev) =>
        prev <
        Math.ceil(
          filteredProducts.length /
            itemsPerPage
        )
          ? prev + 1
          : prev
      )
    }
    disabled={
      currentPage >=
      Math.ceil(
        filteredProducts.length /
          itemsPerPage
      )
    }
    className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
  >
    Next
  </button>

</div>
      </div>

    </div>
  );
}