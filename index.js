import app from "./server.js";
import mongodb from 'mongodb';
import dotenv from "dotenv";
import InventoryDAO from "./dao/inventoryDAO.js"


dotenv.config();
const MongoClient = mongodb.MongoClient;
const mongo_username = process.env['MONGODB_USERNAME'];
const mongo_password = process.env['MONGODB_PASSWORD'];
const uri = `mongodb+srv://${mongo_username}:${mongo_password}@cluster0.dqmrx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const port = 8000;

MongoClient.connect(
    uri,
    {
        maxPoolSize : 50,
        writeConcern : {
            wtimeout : 2500
        },
    }
).catch((err) => {
    console.error(err.stack);
    process.exit(1);
}).then(async client => {
    await InventoryDAO.injectDB(client);
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    })
})

