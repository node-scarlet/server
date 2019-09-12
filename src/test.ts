import { includeTests, run } from './runner'
import {strict as assert } from 'assert'

function exampleTest() {
  assert.equal(true, true)
}

const testSuite = includeTests(
  { tests: [exampleTest]},
  require('./http.test'),
  require('./experimental/experimental.test'),
)

run(testSuite)
