// Libs
const request = require("supertest");
const sinon = require("sinon");
const { expect } = require("chai");
const { faker } = require("@faker-js/faker");

// App
const app = require("../../../app");
const contactController = require("../../../controller/contactController");
const contactService = require("../../../service/contactService");

const testUser = { name: faker.person.firstName(), password: "pass123" };

describe("Contact Tests with Sinon", () => {
  before(async () => {
    //create user
    const createUserResponse = await request(app)
      .post("/register")
      .send(testUser);
    expect(createUserResponse.statusCode).to.equal(201);

    //Login with user and store token
    const loginRes = await request(app).post("/login").send(testUser);
    authToken = loginRes.body.token;
  });

  afterEach(() => {
    sinon.restore();
  });

  it("Using sinon: Mock contactService to check size of phone", async () => {
    sinon
      .stub(contactController, "createContact")
      .throws(new Error("Telefone deve ter ao menos 9 dígitos."));

    const response = await request(app)
      .post("/contacts")
      .auth(authToken, { type: "bearer" })
      .send({ name: "John", phone: "12345678" });
    expect(response.statusCode).to.equal(400);
    expect(response.body).to.have.property(
      "error",
      "Telefone deve ter ao menos 9 dígitos.",
    );
  });

  it("List for all contacts", async () => {
    sinon
      .stub(contactService, "getContacts")
      .returns({ name: "Matheus", phone: "123456789" });

    const response = await request(app)
      .get("/contacts")
      .auth(authToken, { type: "bearer" });
    expect(response.statusCode).to.equal(200);
    expect(response.body).to.deep.equal({
      name: "Matheus",
      phone: "123456789",
    });
  });
});
