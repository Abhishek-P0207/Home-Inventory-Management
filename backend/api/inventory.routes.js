import express from "express";
import InventoryCtrl from "./inventory.controller.js";

const router = express.Router();

router.route("/room/:roomName").get(InventoryCtrl.apiGetInventories);
router.route("/room/all").get(InventoryCtrl.apiGetAllInventories);
router.route("/new").post(InventoryCtrl.apiPostInventory);
router.route("/room/:roomName/item/:name")
            .put(InventoryCtrl.apiUpdateInventory)
            .delete(InventoryCtrl.apiDeleteInventory);
router.route("/item/:name").get(InventoryCtrl.apiGetInventory);

export default router;