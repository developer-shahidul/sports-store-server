require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
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

    app.get("/items", async (req, res) => {
      const result = await UsersEquipment.find().toArray();
      res.send(result);
    });

    app.post("/items", async (req, res) => {
      const result = await UsersEquipment.insertOne(req.body);
      res.send(result);
    });

    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;
      const result = await UsersEquipment.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.get("/items/:id", async (req, res) => {
      const id = req.params.id;
      const result = await UsersEquipment.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.put("/items/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const result = await UsersEquipment.updateOne(
        { _id: new ObjectId(id) },
        { $set: body },
        { upsert: true }
      );
      res.send(result);
    });

    app.get("/items/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await UsersEquipment.find({ email }).toArray();
      res.send(result);
    });

    app.patch("/items/like/:id", async (req, res) => {
      const id = req.params.id;
      const { email } = req.body;

      const item = await UsersEquipment.findOne({
        _id: new ObjectId(id),
      });

      if (!item) {
        return res.status(404).send({ message: "Item not found" });
      }

      if (item?.likedBy?.includes(email)) {
        await UsersEquipment.updateOne(
          { _id: new ObjectId(id) },
          { $pull: { likedBy: email }, $inc: { likes: -1 } }
        );
        res.send({ liked: false });
      } else {
        await UsersEquipment.updateOne(
          { _id: new ObjectId(id) },
          { $addToSet: { likedBy: email }, $inc: { likes: 1 } }
        );
        res.send({ liked: true });
      }
    });

    app.get("/users", async (req, res) => {
      const result = await userConnection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const result = await userConnection.insertOne(req.body);
      res.send(result);
    });

    app.patch("/users", async (req, res) => {
      const email = req.body.email;
      const result = await userConnection.updateOne(
        { email },
        { $set: { lastSignInTime: req.body.lastSignInTime } }
      );
      res.send(result);
    });
  } catch (error) {
    console.error(error);
  }
}

run();

app.get("/", (req, res) => {
  res.send("server site successfully run");
});

// ✅ VERY IMPORTANT FOR VERCEL
module.exports = app;
