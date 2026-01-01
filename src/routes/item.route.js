const express = require("express");
const {
  getItems,
  createItem,
  deleteItem,
  getItemById,
  updateItem,
  getUserItems,
  likeItem,
} = require("../controllers/item.controller");

const router = express.Router();

router.get("/", getItems);
router.post("/", createItem);
router.delete("/:id", deleteItem);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.get("/user/:email", getUserItems);
router.patch("/like/:id", likeItem);

module.exports = router;
