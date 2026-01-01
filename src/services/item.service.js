const { ObjectId } = require("mongodb");
const { connectToDB } = require("../utils/db");

const getItems = async () => {
  const db = await connectToDB();
  const itemsCollection = db.collection("items");
  return await itemsCollection.find().toArray();
};

const createItem = async (item) => {
  const db = await connectToDB();
  const itemsCollection = db.collection("items");
  return await itemsCollection.insertOne(item);
};

const deleteItem = async (id) => {
  const db = await connectToDB();
  const itemsCollection = db.collection("items");
  const query = { _id: new ObjectId(id) };
  return await itemsCollection.deleteOne(query);
};

const getItemById = async (id) => {
  const db = await connectToDB();
  const itemsCollection = db.collection("items");
  const query = { _id: new ObjectId(id) };
  return await itemsCollection.findOne(query);
};

const updateItem = async (id, item) => {
  const db = await connectToDB();
  const itemsCollection = db.collection("items");
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      customization: item.customization,
      processingTime: item.processingTime,
      quentity: item.quentity,
      photo: item.photo,
      rating: item.rating,
    },
  };
  return await itemsCollection.updateOne(filter, updateDoc, options);
};

const getUserItems = async (email) => {
  const db = await connectToDB();
  const itemsCollection = db.collection("items");
  return await itemsCollection.find({ email }).toArray();
};

const likeItem = async (id, email) => {
  const db = await connectToDB();
  const itemsCollection = db.collection("items");
  const query = { _id: new ObjectId(id) };
  const item = await itemsCollection.findOne(query);

  if (!item) {
    throw new Error("Item not found");
  }

  if (item.likedBy?.includes(email)) {
    await itemsCollection.updateOne(query, {
      $pull: { likedBy: email },
      $inc: { likes: -1 },
    });
    return { liked: false };
  } else {
    await itemsCollection.updateOne(query, {
      $addToSet: { likedBy: email },
      $inc: { likes: 1 },
    });
    return { liked: true };
  }
};

module.exports = {
  getItems,
  createItem,
  deleteItem,
  getItemById,
  updateItem,
  getUserItems,
  likeItem,
};

