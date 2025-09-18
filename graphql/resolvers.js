const contactService = require("../service/contactService");
const userService = require("../service/userService");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "segredo";

module.exports = {
  Query: {
    contacts: (parent, args, context) => {
      if (!context.user) throw new Error("Não autenticado");
      return contactService.getContacts();
    },
    me: (parent, args, context) => {
      if (!context.user) return null;
      return { name: context.user.name };
    },
  },
  Mutation: {
    register: (parent, { name, password }) => {
      const user = userService.createUser(name, password);
      const token = jwt.sign({ name: user.name }, JWT_SECRET);
      return { name: user.name, token };
    },
    login: (parent, { name, password }) => {
      if (!userService.validateUser(name, password)) {
        throw new Error("Credenciais inválidas");
      }
      const token = jwt.sign({ name }, JWT_SECRET);
      return { name, token };
    },
    addContact: (parent, { name, phone }, context) => {
      if (!context.user) throw new Error("Não autenticado");
      return contactService.addContact(name, phone);
    },
    deleteContact: (parent, { name }, context) => {
      if (!context.user) throw new Error("Não autenticado");
      contactService.deleteContact(name);
      return true;
    },
  },
};
