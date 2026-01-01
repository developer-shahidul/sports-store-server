require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.39yqdr4.mongodb.net/?appName=Cluster0`;

// Create MongoClient
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
    const database = client.db("Equipments");
    const itemsCollection = database.collection("items");
    const usersCollection = database.collection("users");

    console.log("Successfully connected to MongoDB!");

    // Root route
    app.get("/", (req, res) => {
      res.send("Sports Store Server is running successfully!");
    });

    // Get all items
    app.get("/items", async (req, res) => {
      try {
        const cursor = itemsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching items", error });
      }
    });

    // Add new item
    app.post("/items", async (req, res) => {
      try {
        const body = req.body;
        const newItem = {
          ...body,
          quantity: body.quantity || body.quentity || 0, // backward compatibility
          likes: body.likes || 0,
          likedBy: body.likedBy || [],
          createdAt: new Date(),
        };
        const result = await itemsCollection.insertOne(newItem);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error adding item", error });
      }
    });

    // Delete item
    app.delete("/items/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid item ID" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await itemsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error deleting item", error });
      }
    });

    // Get single item
    app.get("/items/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid item ID" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await itemsCollection.findOne(query);
        if (!result) {
          return res.status(404).send({ message: "Item not found" });
        }
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching item", error });
      }
    });

    // Update item
    app.put("/items/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid item ID" });
        }
        const body = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            name: body.name,
            category: body.category,
            price: body.price,
            description: body.description,
            customization: body.customization,
            processingTime: body.processingTime,
            quantity: body.quantity,
            photo: body.photo,
            rating: body.rating,
          },
        };
        const result = await itemsCollection.updateOne(filter, updateDoc, {
          upsert: true,
        });
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error updating item", error });
      }
    });

    // Get items by user email
    app.get("/items/user/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const items = await itemsCollection.find({ email }).toArray();
        res.send(items);
      } catch (error) {
        res.status(500).send({ message: "Error fetching user items", error });
      }
    });

    // Like / Unlike item
    app.patch("/items/like/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid item ID" });
        }

        const { email } = req.body;
        if (!email) {
          return res.status(400).send({ message: "Email is required" });
        }

        const query = { _id: new ObjectId(id) };
        const item = await itemsCollection.findOne(query);

        if (!item) {
          return res.status(404).send({ message: "Item not found" });
        }

        const likedBy = item.likedBy || [];

        if (likedBy.includes(email)) {
          // Unlike
          const result = await itemsCollection.updateOne(query, {
            $pull: { likedBy: email },
            $inc: { likes: -1 },
          });
          res.send({ liked: false, result });
        } else {
          // Like
          const result = await itemsCollection.updateOne(query, {
            $addToSet: { likedBy: email },
            $inc: { likes: 1 },
          });
          res.send({ liked: true, result });
        }
      } catch (error) {
        res.status(500).send({ message: "Error toggling like", error });
      }
    });

    // User routes
    app.get("/users", async (req, res) => {
      try {
        const result = await usersCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching users", error });
      }
    });

    app.post("/users", async (req, res) => {
      try {
        const body = req.body;
        const result = await usersCollection.insertOne(body);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error creating user", error });
      }
    });

    app.patch("/users", async (req, res) => {
      try {
        const { email, lastSignInTime } = req.body;
        const query = { email };
        const updateDoc = {
          $set: { lastSignInTime },
        };
        const result = await usersCollection.updateOne(query, updateDoc, {
          upsert: true,
        });
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error updating user", error });
      }
    });

    // Optional: Ping for connection confirmation
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

run().catch(console.dir);

// Keep app.listen for local development
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// REQUIRED FOR VERCEL: Export the Express app
module.exports = app;
