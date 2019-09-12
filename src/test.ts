import { includeTests, run } from './runner'
import {strict as assert } from 'assert'

function exampleTest() {
  assert.equal(true, false)
}

const testSuite = includeTests(
  require('./http.test'),
  require('./experimental/experimental.test'),
)

run(testSuite)
