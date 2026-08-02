import IdGenerator from "../utils/idGenerator.js";

let drafts;

export default class DraftDAO {
    static async injectDB(conn) {
        if (drafts) {
            return;
        }
        try {
            drafts = await conn.db("HIMA").collection("drafts");
        } catch (e) {
            console.error(`Unable to establish connection handle in DraftDAO: ${e}`);
        }
    }

    static async createDraft({ invoiceId, userId, items = [], vendor = "", totalAmount = 0, date = null }) {
        try {
            if (!drafts) {
                return { error: "Database not initialized" };
            }
            const customId = IdGenerator.generateId();
            const draftDoc = {
                _id: customId,
                customId: customId,
                invoiceId: invoiceId.toString(),
                userId: userId.toString(),
                items: items.map(item => ({
                    name: item.name || "Unnamed Item",
                    category: item.category || item.roomName || "General",
                    quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1,
                    description: item.description || "",
                    price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0
                })),
                vendor: vendor || "Unknown Vendor",
                totalAmount: typeof totalAmount === 'number' ? totalAmount : parseFloat(totalAmount) || 0,
                date: date || new Date().toISOString(),
                status: "PENDING_REVIEW",
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await drafts.insertOne(draftDoc);
            return { ...result, insertedId: customId, draft: draftDoc };
        } catch (e) {
            console.error(`Unable to create draft record: ${e}`);
            return { error: e.message };
        }
    }

    static async getDraftByInvoiceId(invoiceId, userId) {
        try {
            if (!drafts) return null;
            return await drafts.findOne({
                invoiceId: invoiceId.toString(),
                userId: userId.toString()
            });
        } catch (e) {
            console.error(`Unable to get draft by invoiceId: ${e}`);
            return null;
        }
    }

    static async getDraftById(draftId, userId) {
        try {
            if (!drafts) return null;
            return await drafts.findOne({
                _id: draftId.toString(),
                userId: userId.toString()
            });
        } catch (e) {
            console.error(`Unable to get draft by id: ${e}`);
            return null;
        }
    }

    static async getPendingDraftsForUser(userId) {
        try {
            if (!drafts) return [];
            const cursor = await drafts.find({
                userId: userId.toString(),
                status: "PENDING_REVIEW"
            }).sort({ createdAt: -1 });
            return await cursor.toArray();
        } catch (e) {
            console.error(`Unable to get pending drafts for user: ${e}`);
            return [];
        }
    }

    static async updateDraft(draftId, userId, items, vendor, totalAmount) {
        try {
            if (!drafts) return { error: "Database not initialized" };
            const updateFields = {
                updatedAt: new Date()
            };
            if (items) {
                updateFields.items = items.map(item => ({
                    name: item.name || "Unnamed Item",
                    category: item.category || item.roomName || "General",
                    quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1,
                    description: item.description || "",
                    price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0
                }));
            }
            if (vendor !== undefined) updateFields.vendor = vendor;
            if (totalAmount !== undefined) updateFields.totalAmount = parseFloat(totalAmount) || 0;

            const result = await drafts.updateOne(
                { _id: draftId.toString(), userId: userId.toString() },
                { $set: updateFields }
            );
            return result;
        } catch (e) {
            console.error(`Unable to update draft: ${e}`);
            return { error: e.message };
        }
    }

    static async markDraftStatus(draftId, userId, status) {
        try {
            if (!drafts) return { error: "Database not initialized" };
            const result = await drafts.updateOne(
                { _id: draftId.toString(), userId: userId.toString() },
                { $set: { status: status, updatedAt: new Date() } }
            );
            return result;
        } catch (e) {
            console.error(`Unable to mark draft status: ${e}`);
            return { error: e.message };
        }
    }
}
