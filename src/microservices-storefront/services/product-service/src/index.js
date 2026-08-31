require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const productRoutes = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 4002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/productdb";

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "product-service",
    status: "ok",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/", productRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[product-service] connected to MongoDB at ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`[product-service] listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("[product-service] failed to start:", err.message);
    process.exit(1);
  }
}

start();
