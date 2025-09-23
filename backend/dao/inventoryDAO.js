import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

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

    static async addInventory(quantity, name, roomName) {
        try {
            const itemDoc = {
                // roomId : roomId,
                // itemId : itemId,
                quantity: quantity,
                name: name,
                roomName: roomName
            }
            return await inventory.insertOne(itemDoc);
        }
        catch (e) {
            console.log(`Unable to post item : ${e}`);
            return { error: e };
        }
    }

    static async getInventory(name) {
        try {
            const item = await inventory.findOne({ "name": name });
            return item;
        }
        catch (e) {
            console.error(`Unable to get item : ${e}`);
            return { error: e };
        }
    }

    static async updateInventory(prevrn, prevn, quantity, name, roomName) {
        try {
            var item = await inventory.findOne({ "name": prevn, "roomName": prevrn });
            var Id = item._id;
            const updateItem = await inventory.updateOne(
                { "_id": Id },
                { $set: { "quantity": quantity, "name": name, "roomName": roomName } }
            );
            return updateItem;
        }
        catch (e) {
            console.error(`Unable to update item : ${e}`);
            return { error: e };
        }
    }

    static async deleteInventory(name, roomName) {
        try {
            return await inventory.deleteOne({ "roomName": roomName, "name": name });
        }
        catch (e) {
            console.error(`Unable to delete item : ${e}`);
            return { error: e };
        }
    }

    static async getInvetories(roomName) {
        try {
            const inventoryResponse = await inventory.find({ "roomName": roomName });
            return inventoryResponse.toArray();

        }
        catch (e) {
            console.error(`Unable to get items : ${e}`);
            return { error: e };
        }
    }

    static async getInvetories() {
        try {
            const inventoryResponse = await inventory.find();
            return inventoryResponse.toArray();

        }
        catch (e) {
            console.error(`Unable to get items : ${e}`);
            return { error: e };
        }
    }
}