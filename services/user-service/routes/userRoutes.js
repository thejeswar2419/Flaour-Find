const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// GET ALL USERS
router.get("/", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// REGISTER
router.post("/register", async (req, res) => {
    const user = new User(req.body);
    await user.save();
    res.json(user);
});

// LOGIN
router.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    const jwt = require("jsonwebtoken");

    const token = jwt.sign(
        { id: user._id, email: user.email },
        "secretkey",
        { expiresIn: "1d" }
    );

    res.json({ token });
});

// GET CURRENT LOGGED IN USER
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("likedRestaurants")
            .populate("savedRestaurants");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;