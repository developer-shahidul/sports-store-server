const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.39yqdr4.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let itemsCollection;
let usersCollection;

async function connectToDB() {
    if (itemsCollection && usersCollection) {
        return { itemsCollection, usersCollection };
    }
    try {
        await client.connect();
        const db = client.db("Equipments");
        itemsCollection = db.collection("items");
        usersCollection = db.collection("users");
        console.log("MongoDB connected successfully!");
        return { itemsCollection, usersCollection };
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}

module.exports = { connectToDB };
