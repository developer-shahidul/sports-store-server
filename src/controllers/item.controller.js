const itemService = require("../services/item.service");

const getItems = async (req, res) => {
  try {
    const result = await itemService.getItems();
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to fetch items.");
  }
};

const createItem = async (req, res) => {
  try {
    const body = req.body;
    const result = await itemService.createItem(body);
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to create item.");
  }
};

const deleteItem = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await itemService.deleteItem(id);
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to delete item.");
  }
};

const getItemById = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await itemService.getItemById(id);
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to fetch item.");
  }
};

const updateItem = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const result = await itemService.updateItem(id, body);
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to update item.");
  }
};

const getUserItems = async (req, res) => {
  try {
    const email = req.params.email;
    const result = await itemService.getUserItems(email);
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to fetch user items.");
  }
};

const likeItem = async (req, res) => {
  try {
    const id = req.params.id;
    const { email } = req.body;
    const result = await itemService.likeItem(id, email);
    res.send(result);
  } catch (error) {
    if (error.message === "Item not found") {
      return res.status(404).send({ message: "Item not found" });
    }
    res.status(500).send("Failed to update like status.");
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
