// === Smoke - Load Testing ===
// https://k6.io/docs/test-types/introduction/

//? Definition: verify that your system can handle minimal load, without any problems.
//? Why is it important?
// * Verify that your test script doesn't have errors.
// * Verify that your system doesn't throw any errors when under minimal load.

//API for testing: https://test-api.k6.io/auth/token/login/

import http from 'k6/http';
import { check, sleep} from 'k6';

export const options = {
  vus: 1, // 1 user looping 
  duration: '1m', //for 1 minute

  //Threshold documentation: https://k6.io/docs/using-k6/thresholds/
  // * Thresholds are the pass/fail criteria that you define for your test metrics. 
  // * If the performance of the system under test (SUT) does not meet the conditions of your threshold, the test will finish with a failed status.
  // * If your smoke test produces any errors, you should either correct the script or fix your environment before you continue.
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },

  //k6 login cloud -t 4060058a77338bd7d88e6c112d01482dde030632befb2750f48b8ee121fe1f06
  //k6 run -o cloud smoke.js if I want to send this to k6 cloud
  ext: {
    loadimpact: {
      projectID: 3629234,
      // Test runs with the same name groups test runs together
      name: "Smoke demo"
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