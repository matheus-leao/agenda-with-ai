const request = require("supertest");
const { expect } = require("chai");
const app = require("../../../app");

describe("Auth Tests", () => {
  const user = { name: "authuser", password: "mypassword" };

  it("Register a new user", async () => {
    const response = await request(app).post("/register").send(user);
    expect(response.statusCode).to.equal(201);
    expect(response.body).to.have.property("name", user.name);
    expect(response.body).to.not.have.property("password");
  });

  it("Login with valid credentials", async () => {
    const response = await request(app).post("/login").send(user);
    expect(response.statusCode).to.equal(200);
    expect(response.body).to.have.property("token");
  });

  it("Login with invalid credentials", async () => {
    const response = await request(app)
      .post("/login")
      .send({ name: user.name, password: "wrong" });
    expect(response.statusCode).to.equal(401);
    expect(response.body).to.have.property("error");
  });
});

