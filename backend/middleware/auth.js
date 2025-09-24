import jwt from "jsonwebtoken";
import UserDAO from "../dao/userDAO.js";

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        console.log(token)
        if (!token) {
            return res.status(401).json({ error: "Access token required" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        // Check if user still exists
        const user = await UserDAO.getUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        console.log(decoded.userId);
        // Add user info to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired" });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            console.error('Auth middleware error:', error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
};