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

    static async addInvoice({ userId, s3Bucket, s3Key, originalName, mimeType, size, status = "pending" }) {
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
                status,
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
                _id: invoiceId,
                userId: userId.toString()
            });
        } catch (e) {
            console.error(`Unable to get invoice by id: ${e}`);
            return null;
        }
    }
}
