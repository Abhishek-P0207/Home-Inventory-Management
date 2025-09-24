import InventoryDAO from "../dao/inventoryDAO.js"

export default class InventoryController{
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
            res.status(500).json({ error: e.message });
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
            console.error("apiGetAllInventories error:", e);
            res.status(500).json({ error: e.message });
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
            console.error("apiPostInventory error:", e);
            res.status(500).json({ error: e.message });
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
            res.status(500).json({ error: e.message });
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
            res.status(500).json({ error: e.message });
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
            res.status(500).json({ error: e.message });
        }
    }

}