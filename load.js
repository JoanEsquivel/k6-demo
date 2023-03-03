// === Load Testing ===
// https://k6.io/docs/test-types/load-testing/

//? Definition: used to determine a system's behavior under both normal and peak conditions.
//? Why is it important?
// * Assess the current performance of your system under typical and peak load.
// * Make sure you continue to meet the performance standards as you make changes to your system (code and infrastructure).

//API for testing: https://test-api.k6.io/auth/token/login/

import http from 'k6/http';
import { check, sleep} from 'k6';

export const options = {
  // Let's simulating a normal day
  // to resemble your normal and peak conditions more closely.
  // In that case you could configure the load test to stay at 60(will use 6 for the demo) users 
  // for most of the day, and ramp-up to 100 users during the peak hours of operation,
  // then ramp-down back to normal load

  stages: [
    { duration: '1m', target: 6 },
    { duration: '1m', target: 6}, 
    { duration: '1m', target: 10}, 
    { duration: '1m', target: 10}, 
    { duration: '1m', target: 6}, 
    { duration: '1m', target: 6}, 
    { duration: '1m', target: 0 }, 
  ],

  //Why rump-up stages are important?
  /*  It lets your system warm up or auto scale to handle the traffic.
      It lets you compare the response time between the low-load and nominal-load stages.
      *If you run a load test using our SaaS cloud service, it allows the automated performance alerts to better understand the normal behaviour of your system.
   * 
   */

  //Threshold documentation: https://k6.io/docs/using-k6/thresholds/
  // * Thresholds are the pass/fail criteria that you define for your test metrics. 
  // * If the performance of the system under test (SUT) does not meet the conditions of your threshold, the test will finish with a failed status.
  // * If your smoke test produces any errors, you should either correct the script or fix your environment before you continue.
  thresholds: {
    'http_req_duration': ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },

  //k6 login cloud -t 4060058a77338bd7d88e6c112d01482dde030632befb2750f48b8ee121fe1f06
  //k6 run -o cloud smoke.js if I want to send this to k6 cloud
  ext: {
    loadimpact: {
      projectID: 3629234,
      // Test runs with the same name groups test runs together
      name: "Load demo"
    }
  }
};

const BASE_URL = 'https://test-api.k6.io';
const USERNAME = 'TestUser';
const PASSWORD = 'SuperCroc2020';
//Test with this API: https://github.com/JoanEsquivel/cypress-course/blob/master/cypress/e2e/39-api-testing-demo.cy.ts

export default () => {
  // JS function expression to return a refresh an object with a couple of key/values: refresh & access
  // https://test-api.k6.io/auth/token/login/
  // @returns — Resulting response.
  const loginRes = http.post(`${BASE_URL}/auth/token/login/`, {
    username: USERNAME,
    password: PASSWORD,
  });

  // Check documentation: https://k6.io/docs/javascript-api/k6/check/
  // ? loginRes:any = value to test
  // ? sets:object = tests (checks) to run on the value
  // @returns: boolean = true if all checks have succeeded, false otherwise.
  check(loginRes, {
    'logged in successfully': (resp) => resp.json('access') !== '',
  });

  // Creating an object with the authentication headers to be send in the next GET request.
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${loginRes.json('access')}`,
    },
  };

  //Endpoint: https://test-api.k6.io/my/crocodiles/
  const myObjects = http.get(`${BASE_URL}/my/crocodiles/`, authHeaders).json();
  //This check is going to validate that there is more than one crocodile return
  check(myObjects, { 'retrieved crocodiles': (obj) => obj.length > 0 });

  sleep(1);
};