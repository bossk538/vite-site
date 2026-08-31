const express = require("express");
const axios = require("axios");
const Cart = require("../models/Cart");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:4002";

function withTotal(cart) {
  const items = cart ? cart.items : [];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { userId: cart ? cart.userId : null, items, total: Math.round(total * 100) / 100 };
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.json(withTotal(cart));
  } catch (err) {
    console.error("get cart error:", err.message);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

router.post("/items", requireAuth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    // Fetch authoritative product info (name/price/image) from product-service
    // so the cart always reflects real catalog data rather than trusting the client.
    let product;
    try {
      const response = await axios.get(`${PRODUCT_SERVICE_URL}/${productId}`);
      product = response.data.product;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return res.status(404).json({ error: "Product not found" });
      }
      throw err;
    }

    const cart = await getOrCreateCart(req.user.id);
    const existing = cart.items.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += qty;
      existing.price = product.price;
      existing.name = product.name;
      existing.imageUrl = product.imageUrl;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: qty,
      });
    }

    await cart.save();
    res.status(201).json(withTotal(cart));
  } catch (err) {
    console.error("add to cart error:", err.message);
    res.status(502).json({ error: "Failed to add item to cart" });
  }
});

router.put("/items/:productId", requireAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ error: "quantity must be a positive integer" });
    }

    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.find((i) => i.productId === req.params.productId);
    if (!item) return res.status(404).json({ error: "Item not in cart" });

    item.quantity = qty;
    await cart.save();
    res.json(withTotal(cart));
  } catch (err) {
    console.error("update cart item error:", err.message);
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

router.delete("/items/:productId", requireAuth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = cart.items.filter((i) => i.productId !== req.params.productId);
    await cart.save();
    res.json(withTotal(cart));
  } catch (err) {
    console.error("remove cart item error:", err.message);
    res.status(500).json({ error: "Failed to remove cart item" });
  }
});

router.delete("/", requireAuth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();
    res.json(withTotal(cart));
  } catch (err) {
    console.error("clear cart error:", err.message);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// Internal endpoint used by order-service during checkout. Trusts the
// caller because it still requires the same bearer token as the user routes.
router.get("/internal/for-order", requireAuth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    res.json(withTotal(cart));
  } catch (err) {
    console.error("internal cart lookup error:", err.message);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

module.exports = router;
