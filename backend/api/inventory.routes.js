import express from "express";
import InventoryController from "./inventory_controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All inventory routes require authentication
router.route("/room/:roomName").get(authenticateToken, InventoryController.apiGetInventories);
router.route("/all").get(authenticateToken, InventoryController.apiGetAllInventories);
router.route("/new").post(authenticateToken, InventoryController.apiPostInventory);
router.route("/room/:roomName/item/:name")
    .put(authenticateToken, InventoryController.apiUpdateInventory)
    .delete(authenticateToken, InventoryController.apiDeleteInventory);
router.route("/item/:name").get(authenticateToken, InventoryController.apiGetInventory);

export default router;