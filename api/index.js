require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    const itemsCollection = client.db("Equipments").collection("items");
    const usersCollection = client.db("Equipments").collection("users");

    // সব রুট
    app.get("/", (req, res) => {
      res.send("server site successfully run");
    });

    app.get("/items", async (req, res) => {
      const result = await itemsCollection.find().toArray();
      res.send(result);
    });

    app.post("/items", async (req, res) => {
      const body = req.body;
      const result = await itemsCollection.insertOne(body);
      res.send(result);
    });

    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemsCollection.findOne(query);
      res.send(result);
    });

    app.put("/items/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
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
      const result = await itemsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.get("/items/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await itemsCollection.find({ email }).toArray();
      res.send(result);
    });

    app.patch("/items/like/:id", async (req, res) => {
      const id = req.params.id;
      const { email } = req.body;
      const query = { _id: new ObjectId(id) };
      const item = await itemsCollection.findOne(query);

      if (!item) return res.status(404).send({ message: "Item not found" });

      if (item.likedBy?.includes(email)) {
        await itemsCollection.updateOne(query, {
          $pull: { likedBy: email },
          $inc: { likes: -1 },
        });
        res.send({ liked: false });
      } else {
        await itemsCollection.updateOne(query, {
          $addToSet: { likedBy: email },
          $inc: { likes: 1 },
        });
        res.send({ liked: true });
      }
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const body = req.body;
      const result = await usersCollection.insertOne(body);
      res.send(result);
    });

    app.patch("/users", async (req, res) => {
      const { email, lastSignInTime } = req.body;
      const query = { email };
      const result = await usersCollection.updateOne(query, {
        $set: { lastSignInTime },
      });
      res.send(result);
    });

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run().catch(console.dir);

// Vercel-এর জন্য export (অবশ্যই থাকতে হবে)
module.exports = app;

// লোকালে চালালে listen করবে (Vercel-এ এটা ignore হবে)
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Local server running on http://localhost:${port}`);
  });
}
