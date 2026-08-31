import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const client = axios.create({ baseURL: `${API_URL}/api` });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("storefront_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function unwrapError(err) {
  const message =
    (err.response && err.response.data && err.response.data.error) ||
    err.message ||
    "Something went wrong";
  throw new Error(message);
}

export const authApi = {
  async register({ name, email, password }) {
    try {
      const { data } = await client.post("/auth/register", { name, email, password });
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },
  async login({ email, password }) {
    try {
      const { data } = await client.post("/auth/login", { email, password });
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },
  async me() {
    try {
      const { data } = await client.get("/auth/me");
      return data.user;
    } catch (err) {
      unwrapError(err);
    }
  },
};

export const productApi = {
  async list({ category, search, page = 1 } = {}) {
    try {
      const { data } = await client.get("/products", { params: { category, search, page } });
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },
  async get(id) {
    try {
      const { data } = await client.get(`/products/${id}`);
      return data.product;
    } catch (err) {
      unwrapError(err);
    }
  },
  async categories() {
    try {
      const { data } = await client.get("/products/categories");
      return data.categories;
    } catch (err) {
      unwrapError(err);
    }
  },
};

export const cartApi = {
  async get() {
    try {
      const { data } = await client.get("/cart");
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },
  async addItem(productId, quantity = 1) {
    try {
      const { data } = await client.post("/cart/items", { productId, quantity });
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },
  async updateItem(productId, quantity) {
    try {
      const { data } = await client.put(`/cart/items/${productId}`, { quantity });
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },
  async removeItem(productId) {
    try {
      const { data } = await client.delete(`/cart/items/${productId}`);
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },
};

export const orderApi = {
  async checkout(shippingAddress) {
    try {
      const { data } = await client.post("/orders", { shippingAddress });
      return data.order;
    } catch (err) {
      unwrapError(err);
    }
  },
  async list() {
    try {
      const { data } = await client.get("/orders");
      return data.orders;
    } catch (err) {
      unwrapError(err);
    }
  },
  async get(id) {
    try {
      const { data } = await client.get(`/orders/${id}`);
      return data.order;
    } catch (err) {
      unwrapError(err);
    }
  },
};
