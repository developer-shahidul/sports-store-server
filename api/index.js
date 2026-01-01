require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { ObjectId } = require("mongodb");
const { connectToDB } = require("./db");

app.use(cors());
app.use(express.json());

// সব রুট
app.get("/", (req, res) => {
  res.send("server site successfully run");
});

app.get("/items", async (req, res) => {
  try {
    const { itemsCollection } = await connectToDB();
    const result = await itemsCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to fetch items.");
  }
});

app.post("/items", async (req, res) => {
  try {
    const { itemsCollection } = await connectToDB();
    const body = req.body;
    const result = await itemsCollection.insertOne(body);
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to create item.");
  }
});

app.delete("/items/:id", async (req, res) => {
  try {
    const { itemsCollection } = await connectToDB();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await itemsCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to delete item.");
  }
});

app.get("/items/:id", async (req, res) => {
  try {
    const { itemsCollection } = await connectToDB();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await itemsCollection.findOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to fetch item.");
  }
});

app.put("/items/:id", async (req, res) => {
  try {
    const { itemsCollection } = await connectToDB();
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
  } catch (error) {
    res.status(500).send("Failed to update item.");
  }
});

app.get("/items/user/:email", async (req, res) => {
  try {
    const { itemsCollection } = await connectToDB();
    const email = req.params.email;
    const result = await itemsCollection.find({ email }).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to fetch user items.");
  }
});

app.patch("/items/like/:id", async (req, res) => {
  try {
    const { itemsCollection } = await connectToDB();
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
  } catch (error) {
    res.status(500).send("Failed to update like status.");
  }
});

app.get("/users", async (req, res) => {
  try {
    const { usersCollection } = await connectToDB();
    const result = await usersCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to fetch users.");
  }
});

app.post("/users", async (req, res) => {
  try {
    const { usersCollection } = await connectToDB();
    const body = req.body;
    const result = await usersCollection.insertOne(body);
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to create user.");
  }
});

app.patch("/users", async (req, res) => {
  try {
    const { usersCollection } = await connectToDB();
    const { email, lastSignInTime } = req.body;
    const query = { email };
    const result = await usersCollection.updateOne(query, {
      $set: { lastSignInTime },
    });
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to update user.");
  }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}