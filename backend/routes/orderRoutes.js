const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
console.log(orderController);
const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/",
  authMiddleware,
  orderController.getOrders
);

router.get(
  "/:id",
  authMiddleware,
  orderController.getOrderById
);
// Place Order
router.post(
  "/",
  authMiddleware,
  orderController.placeOrder
);

router.patch(
  "/:id/status",
  authMiddleware,
  orderController.updateOrderStatus
);

router.patch(
  "/:id/cancel",
  authMiddleware,
  orderController.cancelOrder
);

module.exports = router;