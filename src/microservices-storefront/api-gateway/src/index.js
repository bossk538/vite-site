require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 4000;

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:4001";
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:4002";
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || "http://localhost:4003";
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://localhost:4004";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

app.get("/health", (req, res) => {
  res.json({ service: "api-gateway", status: "ok" });
});

// Every downstream service mounts its routes at "/", so each proxy strips
// its own "/api/<prefix>" segment before forwarding the request.
const routes = [
  { prefix: "/api/auth", target: USER_SERVICE_URL },
  { prefix: "/api/products", target: PRODUCT_SERVICE_URL },
  { prefix: "/api/cart", target: CART_SERVICE_URL },
  { prefix: "/api/orders", target: ORDER_SERVICE_URL },
];

for (const { prefix, target } of routes) {
  app.use(
    prefix,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { [`^${prefix}`]: "" },
      onError(err, req, res) {
        console.error(`[api-gateway] proxy error for ${prefix} -> ${target}:`, err.message);
        res.status(502).json({ error: "Upstream service unavailable" });
      },
      logLevel: "warn",
    })
  );
}

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`[api-gateway] listening on port ${PORT}`);
  routes.forEach(({ prefix, target }) => {
    console.log(`[api-gateway]   ${prefix}/* -> ${target}`);
  });
});
