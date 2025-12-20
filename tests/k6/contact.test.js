// import necessary modules
import { check, group, sleep } from "k6";
import http from "k6/http";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import getBaseUrl from "./helpers/getBaseUrl.js"

// define configuration
export const options = {
  vus: 1,
  duration: "10s",

  // define thresholds
  thresholds: {
    http_req_failed: ["rate<0.01"], // http errors should be less than 1%
    http_req_duration: ["p(99)<500"], // 99% of requests should be below 1s
  },
};

export default function () {
  group(`Register users`, () => {
    let userBody = JSON.stringify({
      name: `test ${randomString(8)}`,
      password: `1234`,
    });
    // create new user
    const createUserResponse = http.post(`${getBaseUrl()}/register`, userBody, {
      headers: { "Content-Type": "application/json" },
    });

    const loginUserResponse = http.post(`${getBaseUrl()}/login`, userBody, {
      headers: { "Content-Type": "application/json" },
    });

    const userToken = loginUserResponse.json('token')

    let contactBody = JSON.stringify({
        name: randomString(8),
        phone: "000000000"
    })

    const createContactResponse = http.post(`${getBaseUrl()}/contacts`, contactBody, {
      headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${userToken}` },
    });

    check(createUserResponse, {
      "Verify user created with status 201": (createUserResponse) => createUserResponse.status === 201,
    });

    check(loginUserResponse, {
      'Verify login with status 201': (loginUserResponse) => loginUserResponse.status === 200,
      'Verify token is an string': (loginUserResponse) => typeof(loginUserResponse.json().token) == 'string'
    })

    check(createContactResponse, {
        "Verify contact created with status 201": (createContactResponse) => createContactResponse.status === 201,
    })
    
    sleep(1);
  });
}
