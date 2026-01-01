require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.39yqdr4.mongodb.net/?appName=Cluster0`;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client (Vercel-এ এটা রিপিটেডলি কল হতে পারে, কিন্তু safe)
    await client.connect();

    const UsersEquipment = client.db("Equipments").collection("items");
    const userConnection = client.db("Equipments").collection("users");

    // Root route
    app.get("/", (req, res) => {
      res.send("server site successfully run");
    });

    // Get all items
    app.get("/items", async (req, res) => {
      const cursor = UsersEquipment.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Add new item
    app.post("/items", async (req, res) => {
      const body = req.body;
      const result = await UsersEquipment.insertOne(body);
      res.send(result);
    });

    // Delete item
    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await UsersEquipment.deleteOne(query);
      res.send(result);
    });

    // Get single item
    app.get("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await UsersEquipment.findOne(query);
      res.send(result);
    });

    // Update item
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

    // Get items by user email
    app.get("/items/user/:email", async (req, res) => {
      const email = req.params.email;
      const items = await UsersEquipment.find({ email }).toArray();
      res.send(items);
    });

    // Like / Unlike
    app.patch("/items/like/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const { email } = req.body;

      const item = await UsersEquipment.findOne(query);

      if (!item) {
        return res.status(404).send({ message: "items not found" });
      }

      if (item?.likedBy?.includes(email)) {
        // Unlike
        const updateDoc = {
          $pull: { likedBy: email },
          $inc: { likes: -1 },
        };
        const result = await UsersEquipment.updateOne(query, updateDoc);
        res.send({ liked: false, result });
      } else {
        // Like
        const updateDoc2 = {
          $addToSet: { likedBy: email },
          $inc: { likes: 1 },
        };
        const result = await UsersEquipment.updateOne(query, updateDoc2);
        res.send({ liked: true, result });
      }
    });

    // Users routes
    app.get("/users", async (req, res) => {
      const query = userConnection.find();
      const result = await query.toArray();
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
      const userDoc = {
        $set: { lastSignInTime: req.body?.lastSignInTime },
      };
      const result = await userConnection.updateOne(query, userDoc);
      res.send(result);
    });

    // Ping for confirmation
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("MongoDB connection or setup error:", error);
  }
  // Don't close client in serverless (Vercel)
}

run().catch(console.dir);

// Local development-এ শুধু listen করুন
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
}

// Vercel-এর জন্য অবশ্যই export করতে হবে
module.exports = app;
