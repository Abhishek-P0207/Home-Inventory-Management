import InventoryDAO from "../dao/inventoryDAO.js";
import InvoiceDAO from "../dao/invoiceDAO.js";
import { uploadFileToS3, getFileFromS3 } from "../utils/s3.js";


export default class InventoryController {
    static async apiGetInventories(req, res, next) {
        try {
            const roomName = req.params.roomName || {};
            console.log(roomName);
            const userId = req.user.userId; // Get user ID from auth middleware

            let inventoryResponse = await InventoryDAO.getInventories(roomName, userId);
            console.log(inventoryResponse);
            if (!inventoryResponse) {
                res.status(400).json({ error: "Not Found" });
                return;
            }
            res.json(inventoryResponse);
        } catch (e) {
            next(e);
        }
    }

    static async apiGetAllInventories(req, res, next) {
        try {
            const userId = req.user.userId; // Get user ID from auth middleware
            console.log("apiGetAllInventories called for userId:", userId);

            let inventoryResponse = await InventoryDAO.getAllInventories(userId);

            // Check if there's an error in the response
            if (inventoryResponse && inventoryResponse.error) {
                console.error("DAO error:", inventoryResponse.error);
                return res.status(500).json({ error: inventoryResponse.error });
            }

            // inventoryResponse should be an array, even if empty
            console.log("Returning inventory response:", inventoryResponse);
            res.json(inventoryResponse || []);
        } catch (e) {
            next(e);
        }
    }

    static async apiPostInventory(req, res, next) {
        try {
            const quantity = req.body.quantity;
            const name = req.body.name;
            const roomName = req.body.roomName;
            const description = req.body.description;
            const userId = req.user.userId; // Get user ID from auth middleware

            const inventoryResponse = await InventoryDAO.addInventory(
                quantity,
                name,
                roomName,
                description,
                userId
            );


            if (inventoryResponse.error) {
                console.error("DAO error:", inventoryResponse.error);
                return res.status(400).json({ error: inventoryResponse.error });
            }

            res.json({ stat: "success", id: inventoryResponse.insertedId });
        } catch (e) {
            next(e);
        }
    }

    static async apiGetInventory(req, res, next) {
        try {
            let name = req.params.name || {};
            const userId = req.user.userId; // Get user ID from auth middleware

            let inventoryResponse = await InventoryDAO.getInventory(name, userId);
            if (!inventoryResponse) {
                res.status(404).json({ error: "Not Found" });
                return;
            }
            res.json(inventoryResponse);
        } catch (e) {
            next(e);
        }
    }

    static async apiUpdateInventory(req, res, next) {
        try {
            const prevrn = req.params.roomName;
            const prevn = req.params.name;
            const quantity = req.body.quantity;
            const name = req.body.name;
            const roomName = req.body.roomName;
            const description = req.body.description;
            const userId = req.user.userId; // Get user ID from auth middleware

            const inventoryResponse = await InventoryDAO.updateInventory(
                prevrn,
                prevn,
                quantity,
                name,
                roomName,
                description,
                userId
            );

            var { error } = inventoryResponse;
            if (error) {
                return res.status(400).json({ error });
            }

            if (inventoryResponse.modifiedCount === 0) {
                return res.status(404).json({ error: "Item not found or no changes made" });
            }

            res.json({ stat: "success" });
        } catch (e) {
            next(e);
        }
    }

    static async apiDeleteInventory(req, res, next) {
        try {
            const name = req.params.name;
            const roomName = req.params.roomName;
            const userId = req.user.userId; // Get user ID from auth middleware

            const inventoryResponse = await InventoryDAO.deleteInventory(name, roomName, userId);
            if (!inventoryResponse || inventoryResponse.deletedCount === 0) {
                res.status(404).json({ error: "Item not found" });
                return;
            }
            res.json({ stat: "success" });
        } catch (e) {
            next(e);
        }
    }

    // Upload invoice document/image to S3 and record metadata in DB
    static async invoiceUpload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: "No file uploaded or invalid file format"
                });
            }

            const userId = req.user.userId;
            const uploadResult = await uploadFileToS3(req.file);

            // Save in DB with status "pending"
            const dbResult = await InvoiceDAO.addInvoice({
                userId,
                s3Bucket: uploadResult.bucket,
                s3Key: uploadResult.key,
                originalName: uploadResult.originalName,
                mimeType: uploadResult.mimeType,
                size: uploadResult.size,
                status: "pending"
            });

            if (dbResult.error) {
                return res.status(500).json({ error: dbResult.error });
            }

            return res.status(200).json({
                message: "Document uploaded successfully to S3 and recorded in DB.",
                status: "pending",
                invoice: dbResult.invoice
            });
        } catch (error) {
            console.error("S3 Upload Error:", error);
            return res.status(500).json({ error: error.message || "Failed to upload document to S3" });
        }
    }

    // Get all uploaded invoices for the authenticated user
    static async apiGetInvoices(req, res, next) {
        try {
            const userId = req.user.userId;
            const invoices = await InvoiceDAO.getUserInvoices(userId);
            if (invoices.error) {
                return res.status(500).json({ error: invoices.error });
            }
            res.json(invoices || []);
        } catch (e) {
            next(e);
        }
    }

    // Stream invoice file directly from private S3 bucket
    static async apiGetInvoiceFile(req, res, next) {
        try {
            const invoiceId = req.params.id;
            const userId = req.user.userId;

            // Get the file(if available) metadata from the DB
            const invoice = await InvoiceDAO.getInvoiceById(invoiceId, userId);
            if (!invoice) {
                return res.status(404).json({ error: "Invoice document not found or access denied" });
            }

            const s3Object = await getFileFromS3(invoice.s3Key);
            
            res.setHeader("Content-Type", invoice.mimeType || "application/octet-stream");
            res.setHeader("Content-Disposition", `inline; filename="${invoice.originalName}"`);

            // Sending the S3 Readable stream as chunks itself to the frontend in the res
            s3Object.Body.pipe(res);
        } catch (e) {
            console.error("Error streaming invoice file from S3:", e);
            next(e);
        }
    }

    // Webhook endpoint to receive processing notifications from AWS
    static async awsWebhook(req, res) {
        try {
            const webhookSecret = process.env.AWS_WEBHOOK_SECRET;
            if (webhookSecret && req.headers["x-aws-webhook-secret"] !== webhookSecret) {
                return res.status(401).json({ error: "Unauthorized webhook request" });
            }

            const payload = req.body;
            console.log("Received AWS Webhook processing result:", payload);

            // Webhook processing logic can be handled here (e.g., updating database record)

            return res.status(200).json({
                status: "success",
                message: "Webhook payload received successfully",
                data: payload
            });
        } catch (error) {
            console.error("AWS Webhook Error:", error);
            return res.status(500).json({ error: error.message || "Internal server error in webhook handler" });
        }
    }
}