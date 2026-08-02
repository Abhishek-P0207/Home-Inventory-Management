import IdGenerator from "../utils/idGenerator.js";

let invoices;

export default class InvoiceDAO {
    static async injectDB(conn) {
        if (invoices) {
            return;
        }
        try {
            invoices = await conn.db("HIMA").collection("invoices");
        } catch (e) {
            console.error(`Unable to establish connection handle in InvoiceDAO: ${e}`);
        }
    }

    static async addInvoice({ userId, s3Bucket, s3Key, originalName, mimeType, size, status = "PENDING" }) {
        try {
            const customId = IdGenerator.generateId();
            const invoiceDoc = {
                _id: customId,
                customId: customId,
                userId: userId.toString(),
                s3Bucket,
                s3Key,
                originalName,
                mimeType,
                size,
                status: status.toUpperCase(),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await invoices.insertOne(invoiceDoc);
            return { ...result, insertedId: customId, invoice: invoiceDoc };
        } catch (e) {
            console.error(`Unable to add invoice record: ${e}`);
            return { error: e.message };
        }
    }

    static async getUserInvoices(userId) {
        try {
            if (!invoices) {
                return { error: "Database not initialized" };
            }
            const cursor = await invoices.find({ userId: userId.toString() }).sort({ createdAt: -1 });
            return await cursor.toArray();
        } catch (e) {
            console.error(`Unable to get user invoices: ${e}`);
            return { error: e.message };
        }
    }

    static async getInvoiceById(invoiceId, userId) {
        try {
            if (!invoices) {
                return null;
            }
            return await invoices.findOne({
                _id: invoiceId.toString(),
                userId: userId.toString()
            });
        } catch (e) {
            console.error(`Unable to get invoice by id: ${e}`);
            return null;
        }
    }

    /**
     * Atomically picks up one invoice with status PENDING (or lower-case pending) and updates status to PROCESSING
     * @returns {Promise<Object|null>} The claimed invoice document
     */
    static async claimNextPendingInvoice() {
        try {
            if (!invoices) return null;
            const result = await invoices.findOneAndUpdate(
                { status: { $in: ["PENDING", "pending"] } },
                {
                    $set: {
                        status: "PROCESSING",
                        updatedAt: new Date()
                    }
                },
                {
                    sort: { createdAt: 1 },
                    returnDocument: "after"
                }
            );
            return result;
        } catch (e) {
            console.error(`Error claiming pending invoice: ${e}`);
            return null;
        }
    }

    /**
     * Updates an invoice document's status
     * @param {string} invoiceId 
     * @param {string} status PENDING | PROCESSING | REVIEW | COMPLETED | FAILED
     * @param {string} [errorMessage] Optional error message when status is FAILED
     */
    static async updateInvoiceStatus(invoiceId, status, errorMessage = null) {
        try {
            if (!invoices) return { error: "Database not initialized" };
            const updateDoc = {
                status: status.toUpperCase(),
                updatedAt: new Date()
            };
            if (errorMessage) {
                updateDoc.errorMessage = errorMessage;
            }
            return await invoices.updateOne(
                { _id: invoiceId.toString() },
                { $set: updateDoc }
            );
        } catch (e) {
            console.error(`Error updating invoice status: ${e}`);
            return { error: e.message };
        }
    }
}
