// import necessary modules
import { check, sleep } from 'k6';
import http from 'k6/http';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const baseUrl = "http://localhost:3000";

// define configuration
export const options = {
    vus: 10,
    duration: '10s',

  // define thresholds
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(99)<500'], // 99% of requests should be below 1s
  },

  //  stages: [
  //       { duration: '3s', target: 10 },     // Ramp up
  //       { duration: '15s', target: 10 },    // Average
  //       { duration: '2s', target: 100 },    // Spike
  //       { duration: '3s', target: 100 },    // Spike
  //       { duration: '5s', target: 10 },     // Average
  //       { duration: '5s', target: 0 },      // Ramp up
  //   ]
};

export default function () {
    let userBody = JSON.stringify({ name: `lion test ${randomString(8)}`, password: `1234` })
    let url = `${baseUrl}/register`;

    // create new user
    const createUserResponse = http.post(url, userBody, {
        headers: { 'Content-Type': 'application/json' },
    });
    check(createUserResponse, {
        "status is 201": (resp) => resp.status === 201,
    })
    sleep(1);
}