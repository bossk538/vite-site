// Populates product-service's database with sample data.
// Run inside the container with:  docker compose exec product-service npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/productdb";

const sampleProducts = [
  {
    name: "Aria Wireless Headphones",
    description: "Over-ear headphones with active noise cancellation and 30-hour battery life.",
    price: 129.99,
    category: "electronics",
    imageUrl: "https://picsum.photos/seed/headphones/600/600",
    stock: 42,
  },
  {
    name: "Pulse Fitness Watch",
    description: "Track heart rate, sleep, and workouts with a week-long battery.",
    price: 89.5,
    category: "electronics",
    imageUrl: "https://picsum.photos/seed/watch/600/600",
    stock: 30,
  },
  {
    name: "Nimbus Mechanical Keyboard",
    description: "Hot-swappable switches, per-key RGB, and a solid aluminum frame.",
    price: 149.0,
    category: "electronics",
    imageUrl: "https://picsum.photos/seed/keyboard/600/600",
    stock: 18,
  },
  {
    name: "Drift Canvas Backpack",
    description: "Water-resistant 22L backpack with a padded 15-inch laptop sleeve.",
    price: 64.0,
    category: "accessories",
    imageUrl: "https://picsum.photos/seed/backpack/600/600",
    stock: 55,
  },
  {
    name: "Horizon Leather Wallet",
    description: "Slim bifold wallet in full-grain leather with RFID blocking.",
    price: 39.99,
    category: "accessories",
    imageUrl: "https://picsum.photos/seed/wallet/600/600",
    stock: 70,
  },
  {
    name: "Cascade Insulated Bottle",
    description: "Keeps drinks cold for 24 hours or hot for 12, 750ml stainless steel.",
    price: 24.5,
    category: "home",
    imageUrl: "https://picsum.photos/seed/bottle/600/600",
    stock: 100,
  },
  {
    name: "Ember Ceramic Mug Set",
    description: "Set of four hand-glazed ceramic mugs, dishwasher and microwave safe.",
    price: 34.0,
    category: "home",
    imageUrl: "https://picsum.photos/seed/mugs/600/600",
    stock: 40,
  },
  {
    name: "Solstice Linen Shirt",
    description: "Breathable relaxed-fit linen shirt, available in three earth tones.",
    price: 54.0,
    category: "apparel",
    imageUrl: "https://picsum.photos/seed/shirt/600/600",
    stock: 60,
  },
  {
    name: "Trail Runner Sneakers",
    description: "Lightweight trail sneakers with responsive foam cushioning.",
    price: 98.0,
    category: "apparel",
    imageUrl: "https://picsum.photos/seed/sneakers/600/600",
    stock: 25,
  },
  {
    name: "Basecamp Wool Beanie",
    description: "Merino wool beanie, soft and warm without the itch.",
    price: 19.99,
    category: "apparel",
    imageUrl: "https://picsum.photos/seed/beanie/600/600",
    stock: 80,
  },
  {
    name: "Lumen Desk Lamp",
    description: "Dimmable LED desk lamp with adjustable color temperature and USB-C port.",
    price: 45.0,
    category: "home",
    imageUrl: "https://picsum.photos/seed/lamp/600/600",
    stock: 33,
  },
  {
    name: "Anchor Notebook Trio",
    description: "Set of three dot-grid notebooks with a durable stitched binding.",
    price: 22.0,
    category: "office",
    imageUrl: "https://picsum.photos/seed/notebook/600/600",
    stock: 90,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[seed] connected to MongoDB at ${MONGO_URI}`);

    await Product.deleteMany({});
    const created = await Product.insertMany(sampleProducts);
    console.log(`[seed] inserted ${created.length} products`);
  } catch (err) {
    console.error("[seed] failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
