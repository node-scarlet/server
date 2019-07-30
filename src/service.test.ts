import { strict as assert } from 'assert';
import { service, GET } from './service'
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
    assert.doesNotThrow(() => service());
  } catch (e) {
    return e;
  }
}

async function serverStartStopTest() {
  const description = `The Server class can use its
  start and stop methods`;

  try {
    const handle = service();

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
    const handle = service();
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
    const handle = service();
    handle(GET).with(function(req, meta) {
      meta.desire = req.query.emotion || 'love'
    })
    handle(GET)('/pig').with(function(req, meta) {
      return {
        status: 200,
        headers: {},
        body: 'Wilber didn\'t want food. He wanted ' + meta.desire,
      }
    })
    await handle.start();
    
    // Make A request to the server defined above
    const res = await fetch(`http://0.0.0.0:${handle.port()}/pig?emotion=vengeance`);
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'Wilber didn\'t want food. He wanted vengeance');
    await handle.stop();
  }

  catch (e) {
    return e;
  }
}