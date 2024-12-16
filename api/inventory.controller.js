import InventoryDAO from "../dao/inventoryDAO.js"

export default class InventoryController{
    static async apiPostInventory(req,res,next){
        try{
            // const roomId = req.body.roomId;
            // const itemId = req.body.itemId;
            const quantity = req.body.quantity;
            const name = req.body.name;
            const roomName = req.body.roomName;

            const inventoryResponse = await InventoryDAO.addInventory(
                // roomId,
                // itemId,
                quantity,
                name,
                roomName
            )
            res.json({"stat":"success"});
        }
        catch(e){
            res.status(500).json({error : e.message});
        }
    }

    static async apiGetInventory(req,res,next){
        try{
            let name = req.params.name || {};
            let inventoryResponse = await InventoryDAO.getInventory(name);
            if(!inventoryResponse){
                res.status(404).json({error: "Not Found"});
                return
            }
            res.json(inventoryResponse);
        }
        catch(e){
            res.status(500).json({error : e.message});
        }
    }

    static async apiUpdateInventory(req,res,next){
        try{
            const prevrn = req.params.roomName;
            const prevn = req.params.name;

            const quantity = req.body.quantity;
            const name = req.body.name;
            const roomName = req.body.roomName;

            const inventoryResponse = await InventoryDAO.updateInventory(
                prevrn,
                prevn,
                quantity,
                name,
                roomName
            )

            var {error} = inventoryResponse;
            if(error){
                res.status(400).json({error});
            }

            if(inventoryResponse.modifiedCount === 0){
                throw new Error("Unable to update inventory");
            }

            res.json({"stat" : "success"});
        }
        catch(e){
            res.status(500).json({error : e.message});
        }
    }

    static async apiDeleteInventory(req,res,next){
        const name = req.params.name;
        const roomName = req.params.roomName;
        const inventoryResponse = await InventoryDAO.deleteInventory(name,roomName);
        if(!inventoryResponse){
            res.status(404).json({error : "Not Found"});
            return;
        }
        res.json({"stat" : "success"});
    }
    catch(e){
        res.status(500).json({error : e.message});
    }

    static async apiGetInventories(req,res,next){
        try{
            const roomName = req.params.roomName || {};
            let inventoryResponse = await InventoryDAO.getInvetories(roomName);
            if(!inventoryResponse){
                res.status(400).json({error : "Not Found"});
                return;
            }
            res.json(inventoryResponse);
        }
        catch(e){
            res.status(500).json({error : e.messsage});
        }
    }

    static async apiGetAllInventories(req,res,next){
        try{
            let inventoryResponse = await InventoryDAO.getInvetories();
            if(!inventoryResponse){
                res.status(400).json({error : "Not Found"});
                return;
            }
            res.json(inventoryResponse);
        }
        catch(e){
            res.status(500).json({error : e.messsage});
        }
    }
}