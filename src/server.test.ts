import { strict as assert } from 'assert';
const { URLSearchParams } = require('url');
import * as http  from './http';
const { GET, POST } = http.methods;
import * as fetch from 'node-fetch';

export const tests = [
  portZeroTest,
  defaultHeadersTest,
  handlerMetaTest,
  illegalRouteMethodsTest,
  requestBodyParserURLencodedTest,
  requestBodyParserJsonTest,
  requestUrlTest,
  requestQueryTest,
  requestRedirectTest,
  defaultBodyTest,
  responseShortHandTest,
  partialMatchTest,
  asyncHandlerTest,
  nullBodyTest,
];

async function portZeroTest() {
  const description = `port 0 can be used to
  guarantee an available port`;

  try {
    const requests = http.server();
    await requests.start();
    assert(requests.port());
    await requests.stop();

    return true;

  } catch (e) {
    return e;
  }
}

async function defaultHeadersTest() {
  const description = `Server responses should specify certain
  headers by default`;

  try {
    // Start up an http server
    const requests = http.server();
    requests.route(GET, '/', (req, meta) => {
      return http.response({
        status: 200,
        headers: {},
        body: ''
      })
    })
    await requests.start();
    
    // Make A request to the server defined above
    const res = await fetch(`http://0.0.0.0:${requests.port()}`);
    assert.equal(res.status, 200);

    const { length } = Object.keys(res.headers.raw());
    assert.equal(length, 3);
    assert.ok(res.headers.get('date'));
    assert.ok(res.headers.get('content-length'));
    assert.equal(res.headers.get('connection'), 'close');
    await requests.stop();

  } catch (e) {
    return e;
  }
}

async function handlerMetaTest() {
  const description = `Request handlers should be able 
  to set metafields that are accessible to later handlers`;

  try {
    // Start up an http server
    const requests = http.server();
    requests.route(GET, '/', (req, meta) => {
      meta.desire = 'love';
    })
    requests.route(GET, '/', (req, meta) => {
      return http.response({
        status: 200,
        headers: {},
        body: 'Wilber didn\'t want food. He wanted ' + meta.desire,
      })
    })
    await requests.start();
    
    // Make A request to the server defined above
    const res = await fetch(`http://0.0.0.0:${requests.port()}`);
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'Wilber didn\'t want food. He wanted love');
    await requests.stop();
  }

  catch (e) {
    return e;
  }
}

async function illegalRouteMethodsTest() {
  const description = `Registering Unsupported 
  request methods should throw an error`;

  try {
    const registerIllegalRoute = () => {
      const requests = http.server();
      requests.route('SAVE', '/', (req, meta) => {
        return http.response();
      })
    }

    assert.throws(registerIllegalRoute, {
      message: 'Unsupported verb "SAVE".'
    })
      
  } catch (e) {
    return e;
  }
}

async function requestBodyParserURLencodedTest() {
  const description = `URL encoded body content
  will be parsed into an object`;

  try {
    const requests = http.server();
    requests.route(POST, '/', (req, meta) => {
      assert.equal(
        typeof req.body,
        'object'
      );
      assert.deepEqual(
        { name: 'charlotte' },
        req.body,
      );
    })

    await requests.start();

    const params = new URLSearchParams();
    params.append('name', 'charlotte');
    await fetch(`http://0.0.0.0:${requests.port()}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: params,
    });

    await requests.stop();
  } catch (e) {
    return e;
  }
}

async function requestBodyParserJsonTest() {
  const description = `JSON encoded body content
  will be parsed into an object`;

  try {
    const requests = http.server();
    requests.route(POST, '/', (req, meta) => {

      assert.equal(
        typeof req.body,
        'object'
      );

      assert.deepEqual(
        { name: 'wilbur' },
        req.body,
      );

    })

    await requests.start();

    const res = await fetch(`http://0.0.0.0:${requests.port()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'wilbur' }),
    });

    await requests.stop();

  } catch (e) {
    return e;
  }
}

async function requestUrlTest() {
  const description = `Requests should have
  a url property`;

  try {
    const requests = http.server();
    requests.route(GET, '/', (req, meta) => {
      assert.equal(
        req.url,
        '/?idea=special'
      );
    })
    await requests.start();
    await fetch(`http://0.0.0.0:${requests.port()}/?idea=special`);
    await requests.stop();
  } catch (e) {
    return e;
  }
}

async function requestQueryTest() {
  const description = `Requests should have
  a query property that represents querystring
  parameters`;

  try {
    const requests = http.server();
    requests.route('GET', '/thinking', (req, meta) => {
      // query is a null-prototype object, so deepEqual doesn't work as one might expect
      assert.equal(
        JSON.stringify(req.query),
        JSON.stringify({ splish: 'splash' })
      );
    })
    requests.route('GET', '/everything/was', (req, meta) => {
      assert.equal(
        JSON.stringify(req.query),
        JSON.stringify({ i: 'was', taking: 'a bath'})
      );
    })
    requests.route('GET', '/alright', (req, meta) => {
      assert.equal(
        JSON.stringify(req.query),
        JSON.stringify({ long: 'about', 'a saturday': 'night' })
      );
    })
    await requests.start();
    await fetch(`http://0.0.0.0:${requests.port()}/thinking?splish=splash`);
    await fetch(`http://0.0.0.0:${requests.port()}/everything/was?i=was&taking=a%20bath`);
    await fetch(`http://0.0.0.0:${requests.port()}/alright?long=about&a%20saturday=night`);
    await requests.stop();
  } catch (e) {
    return e;
  }
}

async function requestRedirectTest() {
  const description = `Redirects should be possible
  using a response constructor`;

  try {
    const first = http.server();
    const second = http.server();

    first.route('GET', '/', (req, meta) => {
      const location = `http://0.0.0.0:${second.port()}`;
      return http.response({
        status: 307,
        headers: { location },
        body: '',
      })
    })

    second.route('GET', '/', (req, meta) => 'Success!')

    await first.start();
    await second.start();

    const response = await fetch(`http://0.0.0.0:${first.port()}`);
    assert.equal(
      await response.text(),
      'Success!'
    );

    await first.stop();
    await second.stop();
  } catch (e) {
    return e;
  }
}

async function defaultBodyTest() {
  const description = `If a response has a status but no
  body, the status code message should be the body`;

  try {
    const requests = http.server();
    requests.route('GET', '/200', (req, meta) => 200);
    requests.route('GET', '/201', (req, meta) => 201);
    requests.route('GET', '/400', (req, meta) => 400);
    requests.route('GET', '/401', (req, meta) => 401);
    requests.route('GET', '/403', (req, meta) => 403);
    requests.route('GET', '/404', (req, meta) => 404);
    requests.route('GET', '/409', (req, meta) => 409);
    requests.route('GET', '/500', (req, meta) => 500);

    await requests.start();
    assert.equal('OK', await (await fetch(`http://0.0.0.0:${requests.port()}/200`)).text());
    assert.equal('Created', await (await fetch(`http://0.0.0.0:${requests.port()}/201`)).text());
    assert.equal('Bad Request', await (await fetch(`http://0.0.0.0:${requests.port()}/400`)).text());
    assert.equal('Unauthorized', await (await fetch(`http://0.0.0.0:${requests.port()}/401`)).text());
    assert.equal('Forbidden', await (await fetch(`http://0.0.0.0:${requests.port()}/403`)).text());
    assert.equal('Not Found', await (await fetch(`http://0.0.0.0:${requests.port()}/404`)).text());
    assert.equal('Conflict', await (await fetch(`http://0.0.0.0:${requests.port()}/409`)).text());
    assert.equal('Internal Server Error', await (await fetch(`http://0.0.0.0:${requests.port()}/500`)).text());
    await requests.stop();
  } catch (e) {
    return e;
  }
}

async function responseShortHandTest() {
  const description = `Handlers can return status codes, strings,
  and objects as a shortcut`;

  try {
    const requests = http.server();
    requests.route('GET', '/num', (req, meta) => 200);
    requests.route('GET', '/bad', (req, meta) => 400);
    requests.route('GET', '/str', (req, meta) => 'hello');
    requests.route('GET', '/obj', (req, meta) => ({ data: 'success' }));

    await requests.start();
    assert.equal('OK', await (await fetch(`http://0.0.0.0:${requests.port()}/num`)).text());
    assert.equal('Bad Request', await (await fetch(`http://0.0.0.0:${requests.port()}/bad`)).text());
    assert.equal('hello', await (await fetch(`http://0.0.0.0:${requests.port()}/str`)).text());
    assert.deepEqual({ data: 'success' }, await (await fetch(`http://0.0.0.0:${requests.port()}/obj`)).json());
    await requests.stop();
  } catch (e) {
    return e;
  }
}

async function partialMatchTest() {
  const description = `Errors thrown by url matching
  are caught, and the middleware that caused it is ignored`;

  try {
    const requests = http.server();
    // Notice the orphaned paren in the pattern
    requests.route('GET', '/cache/set/:key)', (req, meta) => 200);
    await requests.start();

    const triggerMalformedRoute = async () => {
      const response = await fetch(`http://0.0.0.0:${requests.port()}/cache/set/hello`);
      await requests.stop();
    }

    await assert.doesNotThrow(triggerMalformedRoute);

  } catch (e) {
    return e;
  }
}

async function asyncHandlerTest() {
  const description = `Promises returned by Handlers should be
  valid material for http responses`;

  try {
    const requests = http.server();
    requests.route('GET', '/*', async (req, meta) => 'Hello!');
    await requests.start();

    const response = await fetch(`http://0.0.0.0:${requests.port()}`);
    assert.equal(await response.text(), 'Hello!');
    await requests.stop();
  } catch (e) {
    return e;
  }
}

async function nullBodyTest() {
  const description = `Null body values
  are valid response material`;

  try {
    const requests = http.server();
    requests.route('GET', '/*', async (req, meta) => {
      return http.response({
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(null),
      });
    });
    await requests.start();

    const response = await fetch(`http://0.0.0.0:${requests.port()}`);
    assert.deepEqual(await response.json(), null);
    await requests.stop();
  } catch (e) {
    return e;
  }
}

