// === Stress - Load Testing ===
// https://k6.io/docs/test-types/stress-testing/

//? Definition: the purpose of stress testing is to assess the availability and stability of the system under heavy load. 
//? ------ >    It is a type of load testing used to determine the limits of the system. The purpose of this test is to verify the stability and reliability of the system under extreme conditions.
//? Why is it important? To determine
// * How your system behaves under extreme conditions.
// * What the maximum capacity of your system is in terms of users or throughput.
// * What is the breaking point of your system and its failure mode.
// * Whether your system will recover without manual intervention after the stress test is over.

//! Note that a stress test doesn't overwhelm the system immediately—that's a spike test, which is covered in the next section.
// Classic examples of a need for stress testing are Black Friday or Cyber Monday, two days each year that generate multiple times the normal traffic for many websites.

//! NO PROD, We recommend running a stress test in a UAT or staging environment.

//API for testing: https://test-api.k6.io/auth/token/login/

import http from "k6/http";
import { sleep } from "k6";

export const options = {
 //https://k6.io/docs/using-k6/scenarios/
 //Scenarios configure how VUs and iteration schedules in granular detail.
 // With scenarios, you can model diverse workloads, or traffic patterns in load tests.
  scenarios: {
    stress: {
      //https://k6.io/docs/using-k6/scenarios/executors/
      // -> Each one schedules VUs and iterations differently, 
      //    and you'll choose one depending on the type of traffic you want to model to test your services.
      // -> ramping-arrival-rate: 	A variable number of iterations are executed in a specified period of time.
      // More info about this executor: https://k6.io/docs/using-k6/scenarios/executors/ramping-arrival-rate/
      executor: "ramping-arrival-rate",
      //Number of VUs to pre-allocate before test start to preserve runtime resources.
      preAllocatedVUs: 500,
      timeUnit: "1s",
      // Period of time to apply the startRate to the stages' target value.
      // Its value is constant for the whole duration of the scenario, it is not possible to change it for a specific stage.
      stages: [
        { duration: "2m", target: 10 }, // below normal load
        { duration: "5m", target: 10 },
        { duration: "2m", target: 20 }, // normal load
        { duration: "5m", target: 20 },
        { duration: "2m", target: 30 }, // around the breaking point
        { duration: "5m", target: 30 },
        { duration: "2m", target: 40 }, // beyond the breaking point
        { duration: "5m", target: 40 },
        { duration: "10m", target: 0 }, // scale down. Recovery stage.
      ],
    },
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

export default function () {
  const BASE_URL = "https://test-api.k6.io"; // make sure this is not production
  // -> https://k6.io/docs/javascript-api/k6-http/batch/
  // Batch multiple HTTP requests together to issue them in parallel over multiple TCP connections. 
  const responses = http.batch([
    ["GET", `${BASE_URL}/public/crocodiles/1/`],
    ["GET", `${BASE_URL}/public/crocodiles/2/`],
    ["GET", `${BASE_URL}/public/crocodiles/3/`],
    ["GET", `${BASE_URL}/public/crocodiles/4/`],
  ]);
}