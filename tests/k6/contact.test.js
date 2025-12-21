// import necessary modules
import { check, group, sleep } from "k6";
import http from "k6/http";
import faker from "k6/x/faker";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import getBaseUrl from "./helpers/urlHelper.js";
import UserHelper from "./helpers/userHelper.js";
import { Trend } from "k6/metrics";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";

const defaultContact = JSON.parse(open("./fixture/emergenciaPolicial.json"));

// define configuration
export const options = {
  // define thresholds
  thresholds: {
    http_req_failed: ["rate<0.01"], // http errors should be less than 1%
    http_req_duration: ["p(99)<3000"], // 99% of requests should be below 3s
    http_req_duration: ["p(95)<2000"], // 95% of requests should be below 2s
  },

  stages: [
    { duration: "3s", target: 10 }, // Ramp up
    { duration: "15s", target: 10 }, // Average
    { duration: "2s", target: 100 }, // Spike
    { duration: "3s", target: 100 }, // Spike
    { duration: "5s", target: 10 }, // Average
    { duration: "5s", target: 0 }, // Ramp down
  ],

  ext: {
    loadimpact: {
      projectID: 6176272,
    },
  },
};

let completeFlowDuration = new Trend("completeFlowDuration");

export default function () {
  let userBody = JSON.stringify({
    name: `test ${randomString(8)}`,
    password: `1234`,
  });
  let userToken;

  // Capture the duration of the entire flow on completeFlowDuration Trend
  const start = Date.now();

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
      "Verify login with status 200": (loginUserResponse) =>
        loginUserResponse.status === 200,
      "Verify token is an string": (loginUserResponse) =>
        typeof loginUserResponse.json().token == "string",
    });
  });

  group(`Create contact`, () => {
    let contactBody = JSON.stringify({
      name: faker.person.name(),
      phone: faker.person.phone(),
    });

    const createContactResponse = createContact(userToken, contactBody);

    const flowDuration = Date.now() - start;
    completeFlowDuration.add(flowDuration);

    check(createContactResponse, {
      "Verify contact created with status 201": (createContactResponse) =>
        createContactResponse.status === 201,
    });

    sleep(1);
  });
}

export function handleSummary(data) {
  return {
    "./report/k6-result.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

const createContact = (userToken, contactBody) => {
  return http.post(`${getBaseUrl()}/contacts`, contactBody, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
  });
};
