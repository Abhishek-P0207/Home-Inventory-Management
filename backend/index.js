import app from "./server.js";
import mongodb from 'mongodb';
import dotenv from "dotenv";
import InventoryDAO from "./dao/inventoryDAO.js";
import UserDAO from "./dao/userDAO.js";

dotenv.config();
const MongoClient = mongodb.MongoClient;
const mongo_username = process.env['MONGODB_USERNAME'];
const mongo_password = process.env['MONGODB_PASSWORD'];
const uri = `mongodb+srv://${mongo_username}:${mongo_password}@cluster0.brw20ne.mongodb.net/inventory?retryWrites=true&w=majority&appName=Cluster0`;

const port = process.env.PORT || 8000;

MongoClient.connect(
    uri,
    {
        maxPoolSize: 50,
        writeConcern: {
            wtimeout: 2500
        },
    }
).catch((err) => {
    console.error(err.stack);
    process.exit(1);
}).then(async client => {
    // Initialize DAOs
    await InventoryDAO.injectDB(client);
    await UserDAO.injectDB(client);
    
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
        console.log(`Authentication endpoints available at http://localhost:${port}/api/auth`);
        console.log(`Inventory endpoints available at http://localhost:${port}/api`);
    });
});

