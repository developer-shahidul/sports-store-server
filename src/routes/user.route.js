const express = require("express");
const {
  getUsers,
  createUser,
  updateUser,
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.patch("/", updateUser);

module.exports = router;
