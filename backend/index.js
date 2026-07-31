import app from "./server.js";
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from "dotenv";
import InventoryDAO from "./dao/inventoryDAO.js";
import UserDAO from "./dao/userDAO.js";
import InvoiceDAO from "./dao/invoiceDAO.js";

dotenv.config();

const uri = process.env.DATABASE_URL;
const port = process.env.PORT || 8000;

if (!uri) {
  console.error("DATABASE_URL environment variable is missing.");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 50,
  writeConcern: {
    wtimeout: 2500,
  },
  serverSelectionTimeoutMS: 5000,
});

async function main() {
  try {
    await client.connect();
    await client.db("HIMA").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Initialize DAOs
    await InventoryDAO.injectDB(client);
    await UserDAO.injectDB(client);
    await InvoiceDAO.injectDB(client);

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
      console.log(`Authentication endpoints available at http://localhost:${port}/api/auth`);
      console.log(`Inventory endpoints available at http://localhost:${port}/api`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB or start server:", err.message);
    if (err.name === 'MongoServerSelectionError') {
      console.error("\n💡 TIP: MongoServerSelectionError usually occurs when your current IP address is not whitelisted in MongoDB Atlas Network Access rules (or if the cluster is paused/offline). Make sure to add your IP or 0.0.0.0/0 in MongoDB Atlas.");
    }
    process.exit(1);
  }
}

main();


