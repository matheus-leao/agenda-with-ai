// Libs
const request = require("supertest");
const sinon = require("sinon");
const { expect } = require("chai");
const { faker } = require('@faker-js/faker');

// App
const app = require("../../../app");

// Mock
const contactService = require("../../../service/contactService");
const fakeContact = {
  name: "matheus",
  phone: "3200000000",
};

// Test user credentials
const testUser = { name: faker.person.firstName(), password: "pass123" };
let authToken;

describe("Contact Tests", () => {
  // Register and login once to obtain token
  before(async () => {
    //create user
    const createUserResponse = await request(app).post("/register").send(testUser);
    expect(createUserResponse.statusCode).to.equal(201);

    //Login with user and store token
    const loginRes = await request(app).post("/login").send(testUser);
    authToken = loginRes.body.token;
  });

  describe("POST /contact", () => {
    it("Try to create a empty contact", async () => {
      const response = await request(app)
        .post("/contacts")
        .auth(authToken, { type: 'bearer' })
        .send({});
      expect(response.statusCode).to.equal(400);
      expect(response.body).to.have.property(
        "error",
        "Nome e telefone são obrigatórios.",
      );
    });
    it("Try to create a contact without phone", async () => {
      const response = await request(app)
        .post("/contacts")
        .auth(authToken, { type: 'bearer' })
        .send({ name: fakeContact.name });
      expect(response.statusCode).to.equal(400);
      expect(response.body).to.have.property(
        "error",
        "Nome e telefone são obrigatórios.",
      );
    });
    it("Create a new note", async () => {
      const response = await request(app)
        .post("/contacts")
        .auth(authToken, { type: 'bearer' })
        .send(fakeContact);
      expect(response.statusCode).to.equal(201);
      expect(response.body).to.have.property("name", fakeContact.name);
      expect(response.body).to.have.property("phone", fakeContact.phone);
    });
  });


  describe("Auth negative tests", () => {
    it("Rejects request without token", async () => {
      const res = await request(app).get("/contacts");
      expect(res.statusCode).to.equal(401);
    });
    it("Rejects request with invalid token", async () => {
      const res = await request(app)
        .get("/contacts")
        .auth('invalid.token', { type: 'bearer' })
      expect(res.statusCode).to.equal(401);
    });
  });


  describe("GET /contacts", () => {
    it("List for all contacts", async () => {
      const response = await request(app)
        .get("/contacts")
        .auth(authToken, { type: 'bearer' })
      expect(response.statusCode).to.equal(200);
    });
  });


  describe("DELETE /contacts", () => {
    it("Delete an contact", async () => {
      const response = await request(app)
        .delete("/contacts")
        .auth(authToken, { type: 'bearer' })
        .send({ name: fakeContact.name });
      expect(response.statusCode).to.equal(204);
    });
  });
});
