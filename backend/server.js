import express from "express";
import cors from "cors";
import inventoryRoutes from "./api/inventory.routes.js";
import authRoutes from "./api/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", inventoryRoutes);

app.use("*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
});

export default app;