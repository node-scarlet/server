import { performance } from 'perf_hooks';

// Console Colors
const red = '\x1b[31m';
const green = '\x1b[32m'
const reset = '\x1b[0m';

// Return errors instead of throwing
async function withoutThrowing(fn) {
  return new Promise((resolve) => {
    resolve(fn())
  }).catch(error => error)
}

async function runWithTimer(fn) {
  const startTime = performance.now()
  const result = await withoutThrowing(fn);
  const endTime = performance.now();
  const runTime = (endTime - startTime).toFixed(2);
  if (result instanceof Error) {
    console.error(`${fn.name}: ${runTime} ms ${red}fail${reset}`, '\n', result, '\n')
    process.exit(1)
  }
  else {
    console.log(`${fn.name}: ${runTime} ms ${green}ok${reset}`); 
  }
}

export function testSuite(...modules) {
  return modules.reduce((included, m) => {
    return [...included, ...m.tests]
  }, [])
}

export async function run(tests) {
  runWithTimer(async function testSuite() {
    for (const test of tests) {
      await runWithTimer(test)
    }
  })
}
