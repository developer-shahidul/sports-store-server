const userService = require("../services/user.service");

const getUsers = async (req, res) => {
  try {
    const result = await userService.getUsers();
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to fetch users.");
  }
};

const createUser = async (req, res) => {
  try {
    const body = req.body;
    const result = await userService.createUser(body);
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to create user.");
  }
};

const updateUser = async (req, res) => {
  try {
    const { email, lastSignInTime } = req.body;
    const result = await userService.updateUser(email, lastSignInTime);
    res.send(result);
  } catch (error) {
    res.status(500).send("Failed to update user.");
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
};
