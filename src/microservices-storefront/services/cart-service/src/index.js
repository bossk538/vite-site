require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cartRoutes = require("./routes/cart");

const app = express();
const PORT = process.env.PORT || 4003;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cartdb";

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "cart-service",
    status: "ok",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/", cartRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[cart-service] connected to MongoDB at ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`[cart-service] listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("[cart-service] failed to start:", err.message);
    process.exit(1);
  }
}

start();
