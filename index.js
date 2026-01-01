require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.39yqdr4.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const UsersEquipment = client.db("Equipments").collection("items");
    const userConnection = client.db("Equipments").collection("users");

    // Routes
    app.get("/", (req, res) => {
      res.send("server site successfully run");
    });

    app.get("/items", async (req, res) => {
      const result = await UsersEquipment.find().toArray();
      res.send(result);
    });

    app.post("/items", async (req, res) => {
      const body = req.body;
      const result = await UsersEquipment.insertOne(body);
      res.send(result);
    });

    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await UsersEquipment.deleteOne(query);
      res.send(result);
    });

    app.get("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await UsersEquipment.findOne(query);
      res.send(result);
    });

    app.put("/items/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          name: body.name,
          category: body.category,
          price: body.price,
          description: body.description,
          customization: body.customization,
          processingTime: body.processingTime,
          quentity: body.quentity,
          photo: body.photo,
          rating: body.rating,
        },
      };
      const result = await UsersEquipment.updateOne(filter, updateDoc, option);
      res.send(result);
    });

    app.get("/items/user/:email", async (req, res) => {
      const email = req.params.email;
      const items = await UsersEquipment.find({ email }).toArray();
      res.send(items);
    });

    app.patch("/items/like/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const { email } = req.body;
      const item = await UsersEquipment.findOne(query);

      if (!item) return res.status(404).send({ message: "item not found" });

      if (item?.likedBy?.includes(email)) {
        const result = await UsersEquipment.updateOne(query, {
          $pull: { likedBy: email },
          $inc: { likes: -1 },
        });
        res.send({ liked: false, result });
      } else {
        const result = await UsersEquipment.updateOne(query, {
          $addToSet: { likedBy: email },
          $inc: { likes: 1 },
        });
        res.send({ liked: true, result });
      }
    });

    // Users
    app.get("/users", async (req, res) => {
      const result = await userConnection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const body = req.body;
      const result = await userConnection.insertOne(body);
      res.send(result);
    });

    app.patch("/users", async (req, res) => {
      const email = req.body.email;
      const query = { email };
      const result = await userConnection.updateOne(query, {
        $set: { lastSignInTime: req.body?.lastSignInTime },
      });
      res.send(result);
    });

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("Error in setup:", error);
  }
}

run();

// Vercel-এর জন্য এটাই যথেষ্ট
module.exports = app;
