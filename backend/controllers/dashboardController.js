const db = require("../db/db");

exports.getDashboardStats = (req, res) => {
  const stats = {};

  db.query(
    "SELECT COUNT(*) AS totalUsers FROM users",
    (err, usersResult) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      stats.totalUsers = usersResult[0].totalUsers;

      db.query(
        "SELECT COUNT(*) AS totalProducts FROM products",
        (err, productsResult) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }

          stats.totalProducts = productsResult[0].totalProducts;

          db.query(
            "SELECT COUNT(*) AS totalOrders FROM orders",
            (err, ordersResult) => {
              if (err) {
                return res.status(500).json({ message: err.message });
              }

              stats.totalOrders = ordersResult[0].totalOrders;

              db.query(
                `SELECT IFNULL(SUM(total_amount), 0) AS totalRevenue
                 FROM orders`,
                (err, revenueResult) => {
                  if (err) {
                    return res.status(500).json({
                      message: err.message,
                    });
                  }

                  stats.totalRevenue =
                    revenueResult[0].totalRevenue;

                  db.query(
                    `SELECT COUNT(*) AS pendingOrders
                     FROM orders
                     WHERE status = 'Pending'`,
                    (err, pendingResult) => {
                      if (err) {
                        return res.status(500).json({
                           message: err.message,
                        });
                      }

                      stats.pendingOrders =
                        pendingResult[0].pendingOrders;

                      res.status(200).json(stats);
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};

// Recent Orders Report
exports.getRecentOrders = (req, res) => {
  db.query(
    `SELECT
        id,
        user_id,
        total_amount,
        status,
        created_at
     FROM orders
     ORDER BY created_at DESC
     LIMIT 5`,
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

// Top Selling Products Report
exports.getTopSellingProducts = (req, res) => {
  db.query(
    `SELECT
        p.id,
        p.name,
        p.sku,
        SUM(oi.quantity) AS total_sold
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     GROUP BY p.id, p.name, p.sku
     ORDER BY total_sold DESC
     LIMIT 5`,
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      res.status(200).json({
        count: results.length,
        products: results,
      });
    }
  );
};