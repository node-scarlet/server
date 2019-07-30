/**
 * Run all tests
 */

import { performance } from 'perf_hooks';

// Console Colors
const red = '\x1b[31m';
const green = '\x1b[32m';
const reset = '\x1b[0m';

async function runWithTimer(fn) {
  const startTime = performance.now()
  const result = await fn();
  const endTime = performance.now();
  const runTime = (endTime - startTime).toFixed(2);
  if (result instanceof Error) {
    console.error(`${fn.name}: ${runTime} ms ${red}fail${reset}`, '\n', result, '\n')
    return new Error('Test Failure');
  }
  else {
    console.log(`${fn.name}: ${runTime} ms ${green}ok${reset}`); 
  }
}

async function testSuite() {
  const allTests = [
    ...require('./http.test').tests,
    ...require('./prototype.test').tests,
  ];
  for (const test of allTests) {
    const result = await runWithTimer(test);
    if (result instanceof Error) process.exit(1);
  }
}

runWithTimer(testSuite);
