const express = require("express");
const itemRoutes = require("./item.route");
const userRoutes = require("./user.route");

const router = express.Router();

router.use("/items", itemRoutes);
router.use("/users", userRoutes);

router.get("/", (req, res) => {
  res.send("server site successfully run");
});

module.exports = router;
