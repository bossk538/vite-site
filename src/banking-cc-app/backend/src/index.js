require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const cardRoutes = require("./routes/cards");
const transactionRoutes = require("./routes/transactions");
const statementRoutes = require("./routes/statements");
const dashboardRoutes = require("./routes/dashboard");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/bankdemo";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "bankdemo-backend",
    status: "ok",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/statements", statementRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[bankdemo-backend] connected to MongoDB at ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`[bankdemo-backend] listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("[bankdemo-backend] failed to start:", err.message);
    process.exit(1);
  }
}

start();
