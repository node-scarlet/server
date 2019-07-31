import { strict as assert } from 'assert';
import { server } from './wrapper'
import { methods } from './http';
import * as fetch from 'node-fetch';

const { GET } = methods;

export const tests = [
  serverConstructTest,
  serverStartStopTest,
  serverMiddlewareTest,
  serverRequestableTest,
];

async function serverConstructTest() {
  const description = `The Server class can
  be instantiated`;

  try {
    assert.doesNotThrow(() => server());
  } catch (e) {
    return e;
  }
}

async function serverStartStopTest() {
  const description = `The Server class can use its
  start and stop methods`;

  try {
    const route = server();

    assert.doesNotThrow(async function() {
      await route.start();
      await route.stop();
    })
  } catch (e) {
    return e;
  }
}

async function serverMiddlewareTest() {
  const description = `Middleware can be applied using to()`;

  try {
    const route = server();
    assert.doesNotThrow(function() {
      route(GET)('/').to(function(req, meta) {});
    })
  } catch (e) {
    return e;
  }
}

async function serverRequestableTest() {
  const description = `Middleware should be applied
  as expected`;

  try {
    // Start up an http server
    const route = server();
    route(GET).to(function(req, meta) {
      meta.desire = req.query.emotion || 'love'
    })
    route(GET)('/pig').to(function(req, meta) {
      return 'Wilber didn\'t want food. He wanted ' + meta.desire
    })
    await route.start();
    
    // Make A request to the server defined above
    const res = await fetch(`http://0.0.0.0:${route.port()}/pig?emotion=vengeance`);
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'Wilber didn\'t want food. He wanted vengeance');
    await route.stop();
  }

  catch (e) {
    return e;
  }
}