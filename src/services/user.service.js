const { connectToDB } = require("../utils/db");

const getUsers = async () => {
  const db = await connectToDB();
  const usersCollection = db.collection("users");
  return await usersCollection.find().toArray();
};

const createUser = async (user) => {
  const db = await connectToDB();
  const usersCollection = db.collection("users");
  return await usersCollection.insertOne(user);
};

const updateUser = async (email, lastSignInTime) => {
  const db = await connectToDB();
  const usersCollection = db.collection("users");
  const query = { email };
  return await usersCollection.updateOne(query, {
    $set: { lastSignInTime },
  });
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
};
