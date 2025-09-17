const userService = require("../service/userService");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

function register(req, res) {
  const { name, password } = req.body;
  if (!name || !password)
    return res.status(400).json({ error: "Nome e senha são obrigatórios." });
  try {
    const user = userService.createUser(name, password);
    res.status(201).json(user);
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
}

function login(req, res) {
  const { name, password } = req.body;
  if (!name || !password)
    return res.status(400).json({ error: "Nome e senha são obrigatórios." });
  const valid = userService.validateUser(name, password);
  if (!valid)
    return res.status(401).json({ error: "Nome ou senha inválidos." });
  const token = jwt.sign({ name }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
}

module.exports = {
  register,
  login,
};
