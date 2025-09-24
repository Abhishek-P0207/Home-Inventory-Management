import IdGenerator from "../utils/idGenerator.js";

let inventory;

export default class InventoryDAO {
    static async injectDB(conn) {
        if (inventory) {
            return;
        }
        try {
            inventory = await conn.db("inventory").collection("inventory");
        }
        catch (e) {
            console.error(`Unable to establish connection handle : ${e}`);
        }
    }

    static async addInventory(quantity, name, roomName, description, userId) {
        try {
            console.log("addInventory called with:", { quantity, name, roomName, description, userId });
            
            const customId = IdGenerator.generateId();
            const itemDoc = {
                _id: customId,
                customId: customId, // Store custom ID for easy access
                quantity: parseInt(quantity),
                name: name,
                roomName: roomName,
                description: description || '',
                userId: userId.toString(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            console.log("Inserting item document:", itemDoc);
            
            const result = await inventory.insertOne(itemDoc);
            console.log("Insert result:", result);
            
            return { ...result, insertedId: customId };
        } catch (e) {
            console.error(`Unable to post item: ${e}`);
            return { error: e.message };
        }
    }

    static async getInventory(name, userId) {
        try {
            const item = await inventory.findOne({ 
                "name": name, 
                "userId": userId.toString() 
            });
            return item;
        } catch (e) {
            console.error(`Unable to get item: ${e}`);
            return { error: e.message };
        }
    }

    static async updateInventory(prevrn, prevn, quantity, name, roomName, description, userId) {
        try {
            const updateDoc = {
                quantity: parseInt(quantity),
                name: name,
                roomName: roomName,
                description: description || '',
                updatedAt: new Date()
            };

            const updateItem = await inventory.updateOne(
                { 
                    "name": prevn, 
                    "roomName": prevrn, 
                    "userId": userId.toString() 
                },
                { $set: updateDoc }
            );
            return updateItem;
        } catch (e) {
            console.error(`Unable to update item: ${e}`);
            return { error: e.message };
        }
    }

    static async deleteInventory(name, roomName, userId) {
        try {
            return await inventory.deleteOne({ 
                "roomName": roomName, 
                "name": name, 
                "userId": userId.toString() 
            });
        } catch (e) {
            console.error(`Unable to delete item: ${e}`);
            return { error: e.message };
        }
    }

    static async getInventories(roomName, userId) {
        try {
            const userID = userId;
            console.log(userID);
            const query = { userId: userID.toString() };
            if (roomName) {
                query.roomName = roomName;
            }
            
            const inventoryResponse = await inventory.find(query);
            // console.log("In the DAO: ",inventoryResponse);
            return inventoryResponse.toArray();
        } catch (e) {
            console.error(`Unable to get items: ${e}`);
            return { error: e.message };
        }
    }

    static async getAllInventories(userId) {
        try {
            // Check if inventory collection is available
            if (!inventory) {
                console.error("Inventory collection not initialized");
                return { error: "Database not initialized" };
            }
            
            const query = { userId: userId.toString() };
            
            // Check items for this specific user
            const userCount = await inventory.countDocuments(query);
            console.log("Items for this user:", userCount);
            
            const inventoryResponse = await inventory.find(query);
            const items = await inventoryResponse.toArray();
            
            if (items.length > 0) {
                console.log("Sample returned items:", items.slice(0, 2));
            }
            
            return items;
        } catch (e) {
            console.error(`Unable to get items: ${e}`);
            return { error: e.message };
        }
    }
}