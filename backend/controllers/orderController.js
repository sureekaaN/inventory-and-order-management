const db = require("../db/db");
const { saveAuditLog } = require("./auditHelper");

exports.placeOrder = (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    // Check product
    db.query(
      "SELECT * FROM products WHERE id = ?",
      [product_id],
      (err, products) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({
              message: err.message,
            });
          });
        }

        if (products.length === 0) {
          return db.rollback(() => {
            res.status(404).json({
              message: "Product not found",
            });
          });
        }

        const product = products[0];

        // Check stock
        if (product.stock < quantity) {
          return db.rollback(() => {
            res.status(400).json({
              message: "Insufficient stock",
            });
          });
        }

        const totalAmount = product.price * quantity;

        // Create order
        db.query(
          "INSERT INTO orders (user_id, total_amount) VALUES (?, ?)",
          [userId, totalAmount],
          (err, orderResult) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({
                  message: err.message,
                });
              });
            }

            const orderId = orderResult.insertId;

            // Save order item
            db.query(
              `INSERT INTO order_items
               (order_id, product_id, quantity, price)
               VALUES (?, ?, ?, ?)`,
              [
                orderId,
                product_id,
                quantity,
                product.price,
              ],
              (err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({
                      message: err.message,
                    });
                  });
                }

                // Reduce stock
                db.query(
                  "UPDATE products SET stock = stock - ? WHERE id = ?",
                  [quantity, product_id],
                  (err) => {
                    if (err) {
                      return db.rollback(() => {
                        res.status(500).json({
                          message: err.message,
                        });
                      });
                    }

                    // Commit transaction
                    db.commit((err) => {
                      if (err) {
                        return db.rollback(() => {
                          res.status(500).json({
                            message: err.message,
                          });
                        });
                      }

                      res.status(201).json({
                        message: "Order placed successfully",
                        order_id: orderId,
                      });

                      saveAuditLog(
                        userId,
                        `Created order ID: ${orderId}`
                      );
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};

// Get All Orders
exports.getOrders = (req, res) => {
  db.query(
    `SELECT
        o.id,
        o.user_id,
        o.total_amount,
        o.status,
        o.created_at
     FROM orders o
     ORDER BY o.created_at DESC`,
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      res.status(200).json({
        count: results.length,
        orders: results,
      });
    }
  );
};

// Get Order Details
exports.getOrderById = (req, res) => {
  console.log("GET ORDER BY ID CALLED");
  console.log(req.params.id);
  const orderId = req.params.id;

  db.query(
    `SELECT
        o.id AS order_id,
        o.user_id,
        o.total_amount,
        o.status,
        o.created_at,
        oi.product_id,
        p.name AS product_name,
        oi.quantity,
        oi.price
     FROM orders o
     JOIN order_items oi ON o.id = oi.order_id
     JOIN products p ON oi.product_id = p.id
     WHERE o.id = ?`,
    [orderId],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      res.status(200).json({
        order: results,
      });
    }
  );
};

exports.updateOrderStatus = (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  const allowedTransitions = {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["Processing", "Cancelled"],
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Delivered"],
    Delivered: [],
    Cancelled: [],
  };

  db.query(
    "SELECT status FROM orders WHERE id = ?",
    [orderId],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      const currentStatus = results[0].status;

      if (!allowedTransitions[currentStatus].includes(status)) {
        return res.status(400).json({
          message: `Cannot change order status from ${currentStatus} to ${status}`,
        });
      }

      db.query(
        "UPDATE orders SET status = ? WHERE id = ?",
        [status, orderId],
        (err) => {
          if (err) {
            return res.status(500).json({
              message: err.message,
            });
          }

          saveAuditLog(
            req.user.id,
            `Updated order ${orderId} status to ${status}`
          );

          res.status(200).json({
            message: `Order status updated to ${status}`,
          });
        }
      );
    }
  );
};

exports.cancelOrder = (req, res) => {
  const orderId = req.params.id;

  // Check order status
  db.query(
    "SELECT status FROM orders WHERE id = ?",
    [orderId],
    (err, orderResults) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      if (orderResults.length === 0) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      const currentStatus = orderResults[0].status;

      // Prevent double cancellation
      if (currentStatus === "Cancelled") {
        return res.status(400).json({
          message: "Order is already cancelled",
        });
      }

      // Delivered orders cannot be cancelled
      if (currentStatus === "Delivered") {
        return res.status(400).json({
          message: "Delivered orders cannot be cancelled",
        });
      }

      // Get ordered products
      db.query(
        "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
        [orderId],
        (err, items) => {
          if (err) {
            return res.status(500).json({
              message: err.message,
            });
          }

          // Restore stock
          let completed = 0;

          items.forEach((item) => {
            db.query(
              "UPDATE products SET stock = stock + ? WHERE id = ?",
              [item.quantity, item.product_id],
              (err) => {
                if (err) {
                  return res.status(500).json({
                    message: err.message,
                  });
                }

                completed++;

                if (completed === items.length) {
                  db.query(
                    "UPDATE orders SET status = 'Cancelled' WHERE id = ?",
                    [orderId],
                    (err) => {
                      if (err) {
                        return res.status(500).json({
                          message: err.message,
                        });
                      }

                      saveAuditLog(
                        req.user.id,
                        `Cancelled order ID: ${orderId}`
                      );

                      res.status(200).json({
                        message:
                          "Order cancelled and stock restored successfully",
                      });
                    }
                  );
                }
              }
            );
          });
        }
      );
    }
  );
};