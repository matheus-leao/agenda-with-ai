const { users } = require("../model/userModel");
const bcrypt = require("bcryptjs");

function createUser(name, password) {
  if (users.some((u) => u.name === name)) {
    throw new Error("Usuário já cadastrado.");
  }
  const hashed = bcrypt.hashSync(password, 8);
  const user = { name, password: hashed };
  users.push(user);
  return { name: user.name };
}

function findUserByName(name) {
  return users.find((u) => u.name === name);
}

function validateUser(name, password) {
  const user = findUserByName(name);
  if (!user) return false;
  return bcrypt.compareSync(password, user.password);
}

module.exports = {
  createUser,
  findUserByName,
  validateUser,
};
