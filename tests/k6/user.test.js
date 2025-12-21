// import necessary modules
import { check, group, sleep } from "k6";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import UserHelper from "./helpers/userHelper.js";
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js'

// define configuration
export const options = {
  // define thresholds
  thresholds: {
    http_req_failed: ["rate<0.01"], // http errors should be less than 1%
    http_req_duration: ["p(99)<1000"], // 99% of requests should be below 1s
  },

  vus: 10,
  duration: "10s",
};

export default function () {
  group(`Register users`, () => {
    let userBody = JSON.stringify({
      name: `test ${randomString(8)}`,
      password: `1234`,
    });

    const createUserResponse = new UserHelper().createUser(userBody);

    check(createUserResponse, {
      "status is 201": (resp) => resp.status === 201,
    });

    sleep(1);
  });
}

export function handleSummary(data) {
  return {
    './report/k6-result.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  }
}