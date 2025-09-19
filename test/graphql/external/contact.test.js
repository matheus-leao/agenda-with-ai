const { expect } = require("chai");
const request = require("supertest");
const { faker } = require("@faker-js/faker");

const baseUrl = "http://localhost:4000/graphql";
let authToken;

describe("External - Contact Tests", () => {
  before(async () => {
    const registerUser = require("../../fixture/requests/graphql/external/user/registerUser.json");
    const resgisterUserResponse = await request(baseUrl)
      .post("")
      .send(registerUser);
    expect(resgisterUserResponse.statusCode).to.equal(200);

    const loginUser = require("../../fixture/requests/graphql/external/user/loginUser.json");
    const loginUserResponse = await request(baseUrl).post("").send(loginUser);
    expect(loginUserResponse.statusCode).to.equal(200);

    authToken = loginUserResponse.body.data.login.token;
  });

  it("Add a new contact graphql", async () => {
    const addContact = require("../../fixture/requests/graphql/external/contact/addContact.json");
    const addContactResponse = await request(baseUrl)
      .post("")
      .auth(authToken, { type: "bearer" })
      .send(addContact);
    expect(addContactResponse.statusCode).to.equal(200);
    expect(addContactResponse.body.data.addContact.name).to.be.equal(
      addContact.variables.name,
    );
    expect(addContactResponse.body.data.addContact.phone).to.be.equal(
      addContact.variables.phone,
    );
  });
});
