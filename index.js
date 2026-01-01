require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.39yqdr4.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const UsersEquipment = client.db("Equipments").collection("items");
    const userConnection = client.db("Equipments").collection("users");

    app.get("/items", async (req, res) => {
      const cursor = UsersEquipment.find();
      const result = await cursor.toArray();
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

    // update
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

    // email maching gulue daw
    // get items only for a specific email
    app.get("/items/user/:email", async (req, res) => {
      const email = req.params.email;
      const items = await UsersEquipment.find({ email }).toArray();
      res.send(items);
    });

    // like aer jonno
    app.patch("/items/like/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const { email } = req.body;
      const item = await UsersEquipment.findOne(query);

      if (!item) {
        return res.status(404).send({ message: "items not found" });
      }

      if (item?.likedBy?.includes(email)) {
        const updateDoc = {
          $pull: { likedBy: email },
          $inc: { likes: -1 },
        };
        const result = await UsersEquipment.updateOne(query, updateDoc);
        res.send({ liked: false, result });
      } else {
        const updateDoc2 = {
          $addToSet: { likedBy: email },
          $inc: { likes: 1 },
        };
        const result = await UsersEquipment.updateOne(query, updateDoc2);
        res.send({ liked: true, result });
      }
    });

    // user aer jonno

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

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server site successfully run");
});

app.listen(port, () => {
  console.log(`server site is running on port : ${port}`);
});
module.exports = app;
