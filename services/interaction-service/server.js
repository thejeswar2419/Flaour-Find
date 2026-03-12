require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/interactionDB";
const PORT = process.env.PORT || 5003;

mongoose.connect(MONGO_URI)
    .then(() => console.log("Interaction DB Connected"))
    .catch(err => console.error("DB Error:", err.message));

/* ===========================
   SCHEMA
=========================== */
const interactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, default: "Anonymous" },  // stored for display in reviews
    restaurantId: { type: String, required: true },
    type: { type: String, enum: ["like", "save", "rate", "review"], required: true },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
}, { timestamps: true });

const Interaction = mongoose.model("Interaction", interactionSchema);

/* ===========================
   POST /interactions
=========================== */
app.post("/interactions", async (req, res) => {
    try {
        const { userId, userName, restaurantId, type, rating, review } = req.body;
        if (!userId || !restaurantId || !type) {
            return res.status(400).json({ message: "userId, restaurantId and type are required" });
        }

        // Ratings and reviews upsert
        if (type === "rate" || type === "review") {
            const updated = await Interaction.findOneAndUpdate(
                { userId, restaurantId, type },
                { userId, userName: userName || "Anonymous", restaurantId, type, rating, review },
                { upsert: true, new: true }
            );
            return res.json(updated);
        }

        // Like/save toggle
        const existing = await Interaction.findOne({ userId, restaurantId, type });
        if (existing) {
            await existing.deleteOne();
            return res.json({ message: `${type} removed`, toggled: false });
        }
        const created = await Interaction.create({ userId, userName: userName || "Anonymous", restaurantId, type });
        res.status(201).json({ ...created.toObject(), toggled: true });

    } catch (err) {
        console.error("POST /interactions:", err.message);
        res.status(500).json({ message: err.message });
    }
});

/* ===========================
   GET /interactions/user/:userId
=========================== */
app.get("/interactions/user/:userId", async (req, res) => {
    try {
        const interactions = await Interaction.find({ userId: req.params.userId });
        res.json(interactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ===========================
   GET /interactions/restaurant/:restaurantId
=========================== */
app.get("/interactions/restaurant/:restaurantId", async (req, res) => {
    try {
        const interactions = await Interaction.find({ restaurantId: req.params.restaurantId });
        const ratings = interactions.filter(i => i.type === "rate" && i.rating);
        const avgRating = ratings.length
            ? ratings.reduce((sum, i) => sum + i.rating, 0) / ratings.length
            : null;
        res.json({
            interactions,
            stats: {
                likes: interactions.filter(i => i.type === "like").length,
                saves: interactions.filter(i => i.type === "save").length,
                ratings: ratings.length,
                avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
                reviews: interactions.filter(i => i.type === "review").length,
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ===========================
   GET /interactions/restaurant/:restaurantId/reviews
=========================== */
app.get("/interactions/restaurant/:restaurantId/reviews", async (req, res) => {
    try {
        const reviews = await Interaction.find({
            restaurantId: req.params.restaurantId,
            type: "review"
        }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ===========================
   GET /interactions/summary/:userId
   Used by recommendation engine
=========================== */
app.get("/interactions/summary/:userId", async (req, res) => {
    try {
        const interactions = await Interaction.find({ userId: req.params.userId });
        res.json({
            liked: interactions.filter(i => i.type === "like").map(i => i.restaurantId),
            saved: interactions.filter(i => i.type === "save").map(i => i.restaurantId),
            rated: interactions.filter(i => i.type === "rate").map(i => ({
                restaurantId: i.restaurantId,
                rating: i.rating
            })),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/", (req, res) => res.json({ message: "Interaction Service running" }));
app.listen(PORT, () => console.log(`Interaction Service running on ${PORT}`));