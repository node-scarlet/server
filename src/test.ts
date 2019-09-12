import { includeTests, run } from './runner'

const testSuite = includeTests(
  require('./http.test'),
  require('./experimental/experimental.test'),
)

run(testSuite)
