// import necessary modules
import { check, group, sleep } from "k6";
import http from "k6/http";
import faker from "k6/x/faker";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import getBaseUrl from "./helpers/urlHelper.js";
import UserHelper from "./helpers/userHelper.js";

// define configuration
export const options = {
  vus: 1,
  duration: "10s",

  // define thresholds
  thresholds: {
    http_req_failed: ["rate<0.01"], // http errors should be less than 1%
    http_req_duration: ["p(99)<1000"], // 99% of requests should be below 1s
  },
};

export default function () {
  let userBody = JSON.stringify({
    name: `test ${randomString(8)}`,
    password: `1234`,
  });
  let userToken;

  group(`Register user`, () => {
    const createUserResponse = new UserHelper().createUser(userBody);
    check(createUserResponse, {
      "Verify user created with status 201": (createUserResponse) =>
        createUserResponse.status === 201,
    });
  });

  group(`Login with user`, () => {
    const loginUserResponse = new UserHelper().loginUser(userBody);
    userToken = loginUserResponse.json("token");
    check(loginUserResponse, {
      "Verify login with status 201": (loginUserResponse) =>
        loginUserResponse.status === 200,
      "Verify token is an string": (loginUserResponse) =>
        typeof loginUserResponse.json().token == "string",
    });
  });

  group(`Create contact`, () => {
    let contactBody = JSON.stringify({
      name: faker.person.firstName(),
      phone: faker.person.phone(),
    });

    const createContactResponse = http.post(
      `${getBaseUrl()}/contacts`,
      contactBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      },
    );

    check(createContactResponse, {
      "Verify contact created with status 201": (createContactResponse) =>
        createContactResponse.status === 201,
    });
    sleep(1);
  });
}
