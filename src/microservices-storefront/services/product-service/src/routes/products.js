const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");

const router = express.Router();

// GET /products?category=&search=&page=&limit=
router.get("/", async (req, res) => {
  try {
    const { category, search, page = 1, limit = 24 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err) {
    console.error("list products error:", err.message);
    res.status(500).json({ error: "Failed to list products" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ categories });
  } catch (err) {
    console.error("list categories error:", err.message);
    res.status(500).json({ error: "Failed to list categories" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (err) {
    console.error("get product error:", err.message);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "name and price are required" });
    }
    const product = await Product.create({ name, description, price, category, imageUrl, stock });
    res.status(201).json({ product });
  } catch (err) {
    console.error("create product error:", err.message);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const updates = (({ name, description, price, category, imageUrl, stock }) => ({
      name,
      description,
      price,
      category,
      imageUrl,
      stock,
    }))(req.body);

    Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (err) {
    console.error("update product error:", err.message);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("delete product error:", err.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Used internally by cart-service / order-service to fetch a batch of
// products by id in one round trip (e.g. POST { ids: [...] }).
router.post("/batch", async (req, res) => {
  try {
    const { ids = [] } = req.body;
    const validIds = ids.filter((id) => mongoose.isValidObjectId(id));
    const products = await Product.find({ _id: { $in: validIds } });
    res.json({ products });
  } catch (err) {
    console.error("batch products error:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

module.exports = router;
