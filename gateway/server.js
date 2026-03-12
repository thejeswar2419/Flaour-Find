require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_change_this_in_production";
const USER_SERVICE = process.env.USER_SERVICE_URL || "http://user-service:5001";
const RESTAURANT_SERVICE = process.env.RESTAURANT_SERVICE_URL || "http://restaurant-service:5002";
const INTERACTION_SERVICE = process.env.INTERACTION_SERVICE_URL || "http://interaction-service:5003";
const RECOMMENDATION_SERVICE = process.env.RECOMMENDATION_SERVICE_URL || "http://recommendation-service:8000";

app.use(cors({ origin: "*" }));
app.use(express.json());

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token provided" });
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

function authOrAdmin(req, res, next) {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey === "admin-panel-key") return next();
  return auth(req, res, next);
}

/* ================================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => res.json({ message: "API Gateway running" }));

/* ================================
   AUTH ROUTES
================================ */
app.post("/register", async (req, res) => {
  try {
    const r = await axios.post(`${USER_SERVICE}/register`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const r = await axios.post(`${USER_SERVICE}/login`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: err.message });
  }
});

/* ================================
   USER ROUTES
================================ */
app.get("/users/me", auth, async (req, res) => {
  try {
    const r = await axios.get(`${USER_SERVICE}/users/me`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: err.message });
  }
});

app.post("/users/like/:restaurantId", auth, async (req, res) => {
  try {
    const r = await axios.post(
      `${USER_SERVICE}/users/like/${req.params.restaurantId}`,
      {},
      { headers: { "x-user-id": req.user.id } }
    );
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message });
  }
});

app.delete("/users/like/:restaurantId", auth, async (req, res) => {
  try {
    const r = await axios.delete(
      `${USER_SERVICE}/users/like/${req.params.restaurantId}`,
      { headers: { "x-user-id": req.user.id } }
    );
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message });
  }
});

app.post("/users/save/:restaurantId", auth, async (req, res) => {
  try {
    const r = await axios.post(
      `${USER_SERVICE}/users/save/${req.params.restaurantId}`,
      {},
      { headers: { "x-user-id": req.user.id } }
    );
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message });
  }
});

app.delete("/users/save/:restaurantId", auth, async (req, res) => {
  try {
    const r = await axios.delete(
      `${USER_SERVICE}/users/save/${req.params.restaurantId}`,
      { headers: { "x-user-id": req.user.id } }
    );
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message });
  }
});

/* ================================
   RESTAURANT ROUTES
================================ */
app.get("/restaurants", async (req, res) => {
  try {
    const r = await axios.get(`${RESTAURANT_SERVICE}/restaurants`);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.get("/restaurants/:id", async (req, res) => {
  try {
    const r = await axios.get(`${RESTAURANT_SERVICE}/restaurants/${req.params.id}`);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.post("/restaurants/filter", async (req, res) => {
  try {
    const r = await axios.post(`${RESTAURANT_SERVICE}/restaurants/filter`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.post("/restaurants/nearby", async (req, res) => {
  try {
    const r = await axios.post(`${RESTAURANT_SERVICE}/restaurants/nearby`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.post("/restaurants", authOrAdmin, async (req, res) => {
  try {
    const r = await axios.post(`${RESTAURANT_SERVICE}/restaurants`, req.body);
    res.status(201).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.put("/restaurants/:id", authOrAdmin, async (req, res) => {
  try {
    const r = await axios.put(`${RESTAURANT_SERVICE}/restaurants/${req.params.id}`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.delete("/restaurants/:id", authOrAdmin, async (req, res) => {
  try {
    const r = await axios.delete(`${RESTAURANT_SERVICE}/restaurants/${req.params.id}`);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

/* ================================
   INTERACTION ROUTES
   userName fetched from user service so reviews show real names
================================ */
app.post("/interactions", auth, async (req, res) => {
  try {
    // Fetch user name to store with interaction
    let userName = "Anonymous";
    try {
      const userRes = await axios.get(`${USER_SERVICE}/users/me`, {
        headers: { Authorization: req.headers.authorization }
      });
      userName = userRes.data.name || "Anonymous";
    } catch { /* non-critical */ }

    const r = await axios.post(`${INTERACTION_SERVICE}/interactions`, {
      ...req.body,
      userId: req.user.id,
      userName,
    });
    res.status(201).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message });
  }
});

app.get("/interactions/me", auth, async (req, res) => {
  try {
    const r = await axios.get(`${INTERACTION_SERVICE}/interactions/user/${req.user.id}`);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message });
  }
});

app.get("/interactions/restaurant/:restaurantId", async (req, res) => {
  try {
    const r = await axios.get(`${INTERACTION_SERVICE}/interactions/restaurant/${req.params.restaurantId}`);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message });
  }
});

app.get("/interactions/restaurant/:restaurantId/reviews", async (req, res) => {
  try {
    const r = await axios.get(`${INTERACTION_SERVICE}/interactions/restaurant/${req.params.restaurantId}/reviews`);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.message });
  }
});

/* ================================
   RECOMMENDATION ROUTES
================================ */
app.post("/recommend", auth, async (req, res) => {
  try {
    const [restaurantsRes, userRes] = await Promise.all([
      axios.get(`${RESTAURANT_SERVICE}/restaurants`),
      axios.get(`${USER_SERVICE}/users/me`, { headers: { Authorization: req.headers.authorization } })
    ]);
    const r = await axios.post(`${RECOMMENDATION_SERVICE}/recommend`, {
      userId: req.user.id,
      user: userRes.data,
      restaurants: restaurantsRes.data,
      interactions: req.body.interactions || {}
    });
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.post("/recommend/train", authOrAdmin, async (req, res) => {
  try {
    const r = await axios.post(`${RECOMMENDATION_SERVICE}/train`);
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));