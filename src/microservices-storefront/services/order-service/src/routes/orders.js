const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || "http://localhost:4003";
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:4002";

// POST /orders - checkout: pulls the caller's cart, re-validates prices
// against product-service, creates the order, then clears the cart.
router.post("/", requireAuth, async (req, res) => {
  try {
    const authHeader = { Authorization: `Bearer ${req.token}` };

    const cartResponse = await axios.get(`${CART_SERVICE_URL}/internal/for-order`, {
      headers: authHeader,
    });
    const cart = cartResponse.data;

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Re-fetch current product data so the order reflects live prices/stock,
    // rather than trusting whatever was cached in the cart.
    const productIds = cart.items.map((item) => item.productId);
    const batchResponse = await axios.post(`${PRODUCT_SERVICE_URL}/batch`, { ids: productIds });
    const products = batchResponse.data.products || [];
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = [];
    for (const item of cart.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(409).json({ error: `Product ${item.name} is no longer available` });
      }
      orderItems.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const total = Math.round(
      orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
    ) / 100;

    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      total,
      status: "confirmed",
      shippingAddress: req.body.shippingAddress,
    });

    // Best-effort cart clear; the order itself is already committed.
    try {
      await axios.delete(`${CART_SERVICE_URL}/`, { headers: authHeader });
    } catch (err) {
      console.warn("[order-service] failed to clear cart after checkout:", err.message);
    }

    res.status(201).json({ order });
  } catch (err) {
    console.error("checkout error:", err.message);
    res.status(502).json({ error: "Failed to complete checkout" });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error("list orders error:", err.message);
    res.status(500).json({ error: "Failed to list orders" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ order });
  } catch (err) {
    console.error("get order error:", err.message);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

module.exports = router;
