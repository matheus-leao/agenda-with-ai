const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

function authenticate(req, res, next) {
  // Always enforce auth

  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader)
    return res.status(401).json({ error: "Token não fornecido." });
  const parts = authHeader.split(" ");
  if (parts.length !== 2)
    return res.status(401).json({ error: "Token inválido." });
  const scheme = parts[0];
  const token = parts[1];
  if (!/^Bearer$/i.test(scheme))
    return res.status(401).json({ error: "Token mal formatado." });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Token inválido." });
    req.user = decoded;
    next();
  });
}

module.exports = authenticate;
