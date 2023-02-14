import http from 'k6/http';
import { check, sleep } from 'k6';

/*Objetives
-> Run a test(locally. Using K6 cloud we can outsource k6 servers).
-> Add virtual users.
-> Increase the test duration.
-> Ramp the number of requests up and down as the test runs.
*/

/* NOTE(OOS): Metrics explanation is not yet included*/

//? How to install it?(https://k6.io/docs/get-started/installation/)
//Just run the command: brew install k6

//? How to run this script?(https://k6.io/docs/get-started/running-k6/)
//Just execute the command: k6 run script.js
//OR execute the command: k6 run --duration 30s script.js
//IF there is duration, it is going to expect to iterate over, and over again during that time.
//ELSE IF there is a sleep in the script, there is going to be a "pause" during the sleep time.
//!By default it is going to work with 1 simple VU(Virtual User).

//?What is a VU?
//k6 works with the concept of virtual users (VUs), which run your test scripts. 
//VUs are essentially parallel while(true) loops. Scripts are written in JavaScript, as ES6 modules, 
//so you can break larger tests into smaller pieces or make reusable pieces as you like.

//? How to run this script with more than 1 VU?
//k6 run --vus 2 --duration 30s script.js

export default function () {
  //Sending a GET request to this endpoint(https://k6.io/docs/javascript-api/k6-http/get/)
  http.get('https://test.k6.io');
  //Suspend VU execution for the specified duration. https://k6.io/docs/javascript-api/k6/sleep/
  sleep(10);
}

//? Can I configure the VUs, and duration somewhere else?
// Yes, you can. Let me show you how:
// export const options = {
//   vus: 10,
//   duration: '30s',
// };
// export default function () {
//   http.get('http://test.k6.io');
//   sleep(10);
// }

//? How to ramp the number of VUs up and down during the test?
//** Every request is going to happen every 10 seconds.
//** In the first stage, during the 40s the amount of VUs is going to increase(max users 4)
//** In the second stage, during 1m20s, the amount of VUs is going to increase as well(max users 10)
//** In the last 20 seconds, during 20s, the amount of VUs is going to decrease(Min users 0)
// export const options = {
//   stages: [
//     { duration: '40s', target: 4 },
//     { duration: '1m20s', target: 10 },
//     { duration: '20s', target: 0 },
//   ],
// };
// export default function () {
//   const res = http.get('https://httpbin.test.k6.io/');
//   //This check is going to verify that every single request returns the status 200. If not, the report will tell you.
//   check(res, { 'status was 200': (r) => r.status == 200 });
//   sleep(10);
// }

//? How to understand what are the results printed in the console?
// Please check the following link, you'll find ALL the details of every single result: https://k6.io/docs/using-k6/metrics/

//? How to interpret results?
// K6 has an amazing blog post to review how it works.
//1. https://k6.io/docs/get-started/results-output/ 
//2. https://k6.io/blog/how-to-interpret-your-load-test-results/