import { strict as assert } from 'assert';
const { URLSearchParams } = require('url');
import { httpService, GET } from './prototype'
import * as fetch from 'node-fetch';

export const tests = [
  serverConstructTest,
  serverStartStopTest,
  serverMiddlewareTest,
  serviceRequestableTest,
];

async function serverConstructTest() {
  const description = `The Server class can
  be instantiated`;

  try {
    assert.doesNotThrow(() => httpService());
  } catch (e) {
    return e;
  }
}

async function serverStartStopTest() {
  const description = `The Server class can use its
  start and stop methods`;

  try {
    const handle = httpService();

    assert.doesNotThrow(async function() {
      await handle.start();
      await handle.stop();
    })
  } catch (e) {
    return e;
  }
}

async function serverMiddlewareTest() {
  const description = `Middleware can be applied using with()`;

  try {
    const handle = httpService();
    assert.doesNotThrow(function() {
      handle(GET)('/').with(function(req, meta) {});
    })
  } catch (e) {
    return e;
  }
}

async function serviceRequestableTest() {
  const description = `Middleware should be applied
  as expected`;

  try {
    // Start up an http server
    const handle = httpService(6000);
    handle(GET)('/').with(function(req, meta) {
      meta.desire = req.query.emotion || 'love'
    })
    handle(GET)('/').with(function(req, meta) {
      return {
        status: 200,
        headers: {},
        body: 'Wilber didn\'t want food. He wanted ' + meta.desire,
      }
    })
    await handle.start();
    
    // Make A request to the server defined above
    const res = await fetch(`http://0.0.0.0:${6000}?emotion=vengeance`);
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'Wilber didn\'t want food. He wanted vengeance');
    await handle.stop();
  }

  catch (e) {
    return e;
  }
}