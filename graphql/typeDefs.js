const { gql } = require("apollo-server-express");

module.exports = gql`
  type Contact {
    name: String!
    phone: String!
  }

  type User {
    name: String!
    token: String
  }

  type Query {
    contacts: [Contact!]!
    me: User
  }

  type Mutation {
    register(name: String!, password: String!): User!
    login(name: String!, password: String!): User!
    addContact(name: String!, phone: String!): Contact!
    deleteContact(name: String!): Boolean!
  }
`;
