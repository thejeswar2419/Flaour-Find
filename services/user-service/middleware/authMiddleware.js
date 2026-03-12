const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_change_this_in_production";

module.exports = function (req, res, next) {
    // Support both Authorization header (from gateway) and x-user-id header
    const authHeader = req.headers.authorization;
    const xUserId = req.headers["x-user-id"];

    // If gateway already verified token and passed x-user-id, trust it
    if (xUserId) {
        req.user = { id: xUserId };
        return next();
    }

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};