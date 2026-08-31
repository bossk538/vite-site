import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const client = axios.create({ baseURL: `${API_URL}/api` });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("bankdemo_token");
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

export const cardApi = {
  async apply(details) {
    try {
      const { data } = await client.post("/cards/apply", details);
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },
  async list() {
    try {
      const { data } = await client.get("/cards");
      return data.cards;
    } catch (err) {
      unwrapError(err);
    }
  },
  async get(id) {
    try {
      const { data } = await client.get(`/cards/${id}`);
      return data.card;
    } catch (err) {
      unwrapError(err);
    }
  },
  async freeze(id) {
    try {
      const { data } = await client.post(`/cards/${id}/freeze`);
      return data.card;
    } catch (err) {
      unwrapError(err);
    }
  },
  async close(id) {
    try {
      const { data } = await client.post(`/cards/${id}/close`);
      return data.card;
    } catch (err) {
      unwrapError(err);
    }
  },
  async pay(id, amount) {
    try {
      const { data } = await client.post(`/cards/${id}/payment`, { amount });
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },
};

export const transactionApi = {
  async simulate({ cardId, merchant, category, amount }) {
    try {
      const { data } = await client.post("/transactions", { cardId, merchant, category, amount });
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },
  async list(params = {}) {
    try {
      const { data } = await client.get("/transactions", { params });
      return data.transactions;
    } catch (err) {
      unwrapError(err);
    }
  },
};

export const statementApi = {
  async generate(cardId) {
    try {
      const { data } = await client.post("/statements/generate", { cardId });
      return data.statement;
    } catch (err) {
      unwrapError(err);
    }
  },
  async list(cardId) {
    try {
      const { data } = await client.get("/statements", { params: { cardId } });
      return data.statements;
    } catch (err) {
      unwrapError(err);
    }
  },
  async get(id) {
    try {
      const { data } = await client.get(`/statements/${id}`);
      return data.statement;
    } catch (err) {
      unwrapError(err);
    }
  },
};

export const dashboardApi = {
  async summary() {
    try {
      const { data } = await client.get("/dashboard/summary");
      return data;
    } catch (err) {
      unwrapError(err);
    }
  },
};
