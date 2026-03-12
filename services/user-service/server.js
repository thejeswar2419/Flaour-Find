require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const User = require("./models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_change_this_in_production";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/userDB";
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || "http://localhost:5002";
const PORT = process.env.PORT || 5001;

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URI)
  .then(() => console.log("User DB Connected:", MONGO_URI))
  .catch(err => console.log("DB Connection Error:", err.message));

function authMiddleware(req, res, next) {
  const xUserId = req.headers["x-user-id"];
  if (xUserId) { req.user = { id: xUserId }; return next(); }
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });
  const token = authHeader.split(" ")[1];
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ message: "Invalid token" }); }
}

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, preferredCuisine, budget, vegOnly } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ name, email, password: hashedPassword, preferredCuisine, budget, vegOnly }).save();
    res.json({ message: "User registered successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /users/me — populates liked/saved with full restaurant details
app.get("/users/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const userObj = user.toObject();

    const fetchDetails = async (ids) => {
      if (!ids || ids.length === 0) return [];
      const results = await Promise.allSettled(
        ids.map(id => axios.get(`${RESTAURANT_SERVICE_URL}/restaurants/${id}`).then(r => r.data).catch(() => null))
      );
      return results.map(r => r.status === "fulfilled" ? r.value : null).filter(Boolean);
    };

    userObj.likedRestaurants = await fetchDetails(user.likedRestaurants);
    userObj.savedRestaurants = await fetchDetails(user.savedRestaurants);
    res.json(userObj);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/users/like/:restaurantId", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { likedRestaurants: req.params.restaurantId } });
    res.json({ message: "Restaurant liked" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete("/users/like/:restaurantId", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { likedRestaurants: req.params.restaurantId } });
    res.json({ message: "Restaurant unliked" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/users/save/:restaurantId", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { savedRestaurants: req.params.restaurantId } });
    res.json({ message: "Restaurant saved" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete("/users/save/:restaurantId", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { savedRestaurants: req.params.restaurantId } });
    res.json({ message: "Restaurant unsaved" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.listen(PORT, () => console.log(`User Service running on ${PORT}`));