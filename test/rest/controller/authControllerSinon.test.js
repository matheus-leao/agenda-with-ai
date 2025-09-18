const request = require("supertest");
const { expect } = require("chai");
const app = require("../../../app");

const sinon = require("sinon");
const authController = require("../../../controller/authController");

const user = { name: "authuser", password: "mypassword" };

describe("Auth Tests with Sinon", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("Using sinon: Mock userService to check Nome ou senha inválidos", async () => {
    sinon
      .stub(authController, "login")
      .throws(new Error("Nome ou senha inválidos."));
    const response = await request(app)
      .post("/login")
      .send({ name: user.name, password: "wrong" });
    expect(response.statusCode).to.equal(401);
    expect(response.body).to.have.property("error", "Nome ou senha inválidos.");
  });

  it("Using sinon: Mock userService to check Nome e senha são obrigatórios.", async () => {
    sinon
      .stub(authController, "login")
      .throws(new Error("Nome e senha são obrigatórios."));
    const response = await request(app).post("/login").send({});
    expect(response.statusCode).to.equal(400);
    expect(response.body).to.have.property(
      "error",
      "Nome e senha são obrigatórios.",
    );
  });
});
