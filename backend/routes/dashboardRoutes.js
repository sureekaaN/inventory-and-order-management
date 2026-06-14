const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Dashboard statistics (Admin only)
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  dashboardController.getDashboardStats
);

router.get(
  "/recent-orders",
  authMiddleware,
  roleMiddleware("admin"),
  dashboardController.getRecentOrders
);

router.get(
  "/top-products",
  authMiddleware,
  roleMiddleware("admin"),
  dashboardController.getTopSellingProducts
);

module.exports = router;