import express from "express";
import InventoryController from "./inventory_controller.js";
import { authenticateToken } from "../middleware/auth.js";
import { handleFileUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All inventory routes require authentication
router.route("/room/:roomName").get(authenticateToken, InventoryController.apiGetInventories);
router.route("/all").get(authenticateToken, InventoryController.apiGetAllInventories);
router.route("/new").post(authenticateToken, InventoryController.apiPostInventory);
router.route("/room/:roomName/item/:name")
    .put(authenticateToken, InventoryController.apiUpdateInventory)
    .delete(authenticateToken, InventoryController.apiDeleteInventory);
router.route("/item/:name").get(authenticateToken, InventoryController.apiGetInventory);

// Invoice upload & retrieval endpoints (require authentication)
router.route("/upload").post(authenticateToken, handleFileUpload, InventoryController.invoiceUpload);
router.route("/invoices").get(authenticateToken, InventoryController.apiGetInvoices);
router.route("/invoices/:id/file").get(authenticateToken, InventoryController.apiGetInvoiceFile);

// Draft endpoints for extracted invoice review
router.route("/drafts/pending").get(authenticateToken, InventoryController.apiGetPendingDrafts);
router.route("/drafts/invoice/:invoiceId").get(authenticateToken, InventoryController.apiGetDraftByInvoiceId);
router.route("/drafts/:draftId/approve").post(authenticateToken, InventoryController.apiApproveDraft);
router.route("/drafts/:draftId/cancel").post(authenticateToken, InventoryController.apiCancelDraft);

// AWS Webhook endpoint for receiving processing completion notifications
router.route("/webhook/aws").post(InventoryController.awsWebhook);

export default router;