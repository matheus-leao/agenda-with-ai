const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());

// Middleware para autenticação JWT
app.use((req, res, next) => {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(
        auth.replace("Bearer ", ""),
        process.env.JWT_SECRET || "segredo",
      );
    } catch (e) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ user: req.user }),
});

async function startApollo() {
  await server.start();
  server.applyMiddleware({ app });
}

startApollo();

module.exports = app;
