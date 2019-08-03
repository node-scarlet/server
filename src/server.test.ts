import { strict as assert } from 'assert';
const { URLSearchParams } = require('url');
import { Server, Response, response } from './server'
import * as fetch from 'node-fetch';
import { Http2SecureServer } from 'http2';

export const tests = [
  portZeroTest,
  defaultHeadersTest,
  handlerMetaTest,
  illegalRouteMethodsTest,
  responseConstructorTest,
  requestBodyParserURLencodedTest,
  requestBodyParserJsonTest,
  requestUrlTest,
  requestQueryTest,
  requestRedirectTest,
];

async function portZeroTest() {
  const description = `port 0 can be used to
  guarantee an available port`;

  try {
    const requests = new Server();
    await requests.listen();
    assert(requests.port());
    await requests.close();

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
    const requests = new Server();
    requests.route('GET', '/', (req, meta) => {
      return new Response({
        status: 200,
        headers: {},
        body: ''
      })
    })
    await requests.listen();
    
    // Make A request to the server defined above
    let body = ''
    const res = await fetch(`http://0.0.0.0:${requests.port()}`);
    console.log(await res.text());
    assert.equal(res.status, 200);
    const { length } = Object.keys(res.headers.raw());
    assert.equal(length, 5);
    assert.ok(res.headers.get('date'));
    assert.equal(res.headers.get('vary'), 'Origin');
    assert.equal(res.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert.equal(res.headers.get('connection'), 'close');
    await requests.close();

  } catch (e) {
    return e;
  }
}

async function handlerMetaTest() {
  const description = `Request handlers should be able 
  to set metafields that are accessible to later handlers`;

  try {
    // Start up an http server
    const requests = new Server();
    requests.route('GET', '/', (req, meta) => {
      meta.desire = 'love';
    })
    requests.route('GET', '/', (req, meta) => {
      return new Response({
        status: 200,
        headers: {},
        body: 'Wilber didn\'t want food. He wanted ' + meta.desire,
      })
    })
    await requests.listen();
    
    // Make A request to the server defined above
    const res = await fetch(`http://0.0.0.0:${requests.port()}`);
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'Wilber didn\'t want food. He wanted love');
    await requests.close();
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
      const requests = new Server();
      requests.route('SAVE', '/', (req, meta) => {
        return new Response();
      })
    }

    assert.throws(registerIllegalRoute, {
      message: 'Unsupported verb "SAVE".'
    })
      
  } catch (e) {
    return e;
  }
}

async function responseConstructorTest() {
  const description = `The Response constructor
  can be used to validate return material, and allows
  passing only some of the required properties`;

  try {
    // Start up an http server
    const requests = new Server();
    requests.route('GET', '/', (req, meta) => {
      return new Response();
    })

    await requests.listen();
    await requests.close();

  } catch (e) {
    return e;
  }
}

async function requestBodyParserURLencodedTest() {
  const description = `URL encoded body content
  will be parsed into an object`;

  try {
    const requests = new Server();
    requests.route('POST', '/', (req, meta) => {

      assert.equal(
        typeof req.body,
        'object'
      );

      assert.deepEqual(
        { name: 'charlotte' },
        req.body,
      );

    })

    await requests.listen();

    const params = new URLSearchParams();
    params.append('name', 'charlotte');
    await fetch(`http://0.0.0.0:${requests.port()}`, {
      method: 'POST',
      body: params,
    });

    await requests.close();

  } catch (e) {
    return e;
  }
}

async function requestBodyParserJsonTest() {
  const description = `JSON encoded body content
  will be parsed into an object`;

  try {
    const requests = new Server();
    requests.route('POST', '/', (req, meta) => {

      assert.equal(
        typeof req.body,
        'object'
      );

      assert.deepEqual(
        { name: 'wilbur' },
        req.body,
      );

    })

    await requests.listen();

    await fetch(`http://0.0.0.0:${requests.port()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'wilbur' }),
    });

    await requests.close();

  } catch (e) {
    return e;
  }
}

async function requestUrlTest() {
  const description = `Requests should have
  a url property`;

  try {
    const requests = new Server();
    requests.route('GET', '/', (req, meta) => {
      assert.equal(
        req.url,
        '/?idea=special'
      );
    })
    await requests.listen();
    const response = await fetch(`http://0.0.0.0:${requests.port()}/?idea=special`);
    await requests.close();
  } catch (e) {
    return e;
  }
}

async function requestQueryTest() {
  const description = `Requests should have
  a query property that represents querystring
  parameters`;

  try {
    const requests = new Server();
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
    await requests.listen();
    await fetch(`http://0.0.0.0:${requests.port()}/thinking?splish=splash`);
    await fetch(`http://0.0.0.0:${requests.port()}/everything/was?i=was&taking=a%20bath`);
    await fetch(`http://0.0.0.0:${requests.port()}/alright?long=about&a%20saturday=night`);
    await requests.close();
  } catch (e) {
    return e;
  }
}

async function requestRedirectTest() {
  const description = `Redirects should be possible
  using a response constructor`;

  try {
    const first = new Server();
    const second = new Server();

    first.route('GET', '/', (req, meta) => {
      const location = `http://0.0.0.0:${second.port()}`;
      return new Response({
        status: 307,
        headers: { location }
      })
    })

    second.route('GET', '/', (req, meta) => 'Success!')

    await first.listen();
    await second.listen();

    const response = await fetch(`http://0.0.0.0:${first.port()}`);
    assert.equal(
      await response.text(),
      'Success!'
    );

    await first.close();
    await second.close();
  } catch (e) {
    return e;
  }
}

async function defaultBodyTest() {
  const description = `If a response has a status but no
  body, the status code message should be the body`;

  try {
    const requests = new Server();
    // 1xx - Informational
    requests.route('GET', '/100', () => response({ status: 100 }));
    requests.route('GET', '/101', () => response({ status: 101 }));
    requests.route('GET', '/102', () => response({ status: 102}));
    // 2xx - Success
    requests.route('GET', '/200', () => response({ status: 200}));
    requests.route('GET', '/201', () => response({ status: 201}));
    requests.route('GET', '/202', () => response({ status: 202}));
    requests.route('GET', '/203', () => response({ status: 203}));
    requests.route('GET', '/203', () => response({ status: 204}));
    requests.route('GET', '/204', () => response({ status: 205}));
    requests.route('GET', '/205', () => response({ status: 206}));
    requests.route('GET', '/207', () => response({ status: 207}));
    requests.route('GET', '/208', () => response({ status: 208}));
    requests.route('GET', '/226', () => response({ status: 226}));
    // 3xx - Redirection
    requests.route('GET', '/300', () => response({ status: 300}));
    requests.route('GET', '/301', () => response({ status: 301}));
    requests.route('GET', '/302', () => response({ status: 302}));
    requests.route('GET', '/303', () => response({ status: 303}));
    requests.route('GET', '/304', () => response({ status: 304}));
    requests.route('GET', '/305', () => response({ status: 305}));
    requests.route('GET', '/306', () => response({ status: 306}));
    requests.route('GET', '/307', () => response({ status: 307}));
    requests.route('GET', '/308', () => response({ status: 308}));
    // 4xx - Client Error
    requests.route('GET', '/400', () => response({ status: 400 }));
    requests.route('GET', '/401', () => response({ status: 401 }));
    requests.route('GET', '/402', () => response({ status: 402 }));
    requests.route('GET', '/403', () => response({ status: 403 }));
    requests.route('GET', '/404', () => response({ status: 404 }));
    requests.route('GET', '/405', () => response({ status: 405 }));
    requests.route('GET', '/406', () => response({ status: 406 }));
    requests.route('GET', '/407', () => response({ status: 407 }));
    requests.route('GET', '/408', () => response({ status: 408 }));
    requests.route('GET', '/409', () => response({ status: 409 }));
    requests.route('GET', '/410', () => response({ status: 410 }));
    requests.route('GET', '/411', () => response({ status: 411 }));
    requests.route('GET', '/412', () => response({ status: 412 }));
    requests.route('GET', '/413', () => response({ status: 413 }));
    requests.route('GET', '/414', () => response({ status: 414 }));
    requests.route('GET', '/415', () => response({ status: 415 }));
    requests.route('GET', '/416', () => response({ status: 416 }));
    requests.route('GET', '/417', () => response({ status: 417 }));
    requests.route('GET', '/418', () => response({ status: 418 }));
    requests.route('GET', '/420', () => response({ status: 420 }));
    requests.route('GET', '/422', () => response({ status: 422 }));
    requests.route('GET', '/423', () => response({ status: 423 }));
    requests.route('GET', '/424', () => response({ status: 424 }));
    requests.route('GET', '/425', () => response({ status: 425 }));
    requests.route('GET', '/426', () => response({ status: 426 }));
    requests.route('GET', '/428', () => response({ status: 428 }));
    requests.route('GET', '/429', () => response({ status: 429 }));
    requests.route('GET', '/431', () => response({ status: 431 }));
    requests.route('GET', '/444', () => response({ status: 444 }));
    requests.route('GET', '/449', () => response({ status: 449 }));
    requests.route('GET', '/450', () => response({ status: 450 }));
    requests.route('GET', '/451', () => response({ status: 451 }));
    requests.route('GET', '/499', () => response({ status: 499 }));

    await requests.listen();
    await fetch(`http://0.0.0.0:${requests.port()}/100`);
    await requests.close();
  } catch (e) {
    return e;
  }
}