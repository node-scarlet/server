import { testSuite, run } from './runner'

run(testSuite(
  require('./http.test'),
  require('./experimental/experimental.test'),
))
