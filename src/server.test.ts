import { strict as assert } from 'assert';
const { URLSearchParams } = require('url');
import { Server, Response } from './server'
import * as fetch from 'node-fetch';

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
    assert.equal(res.headers.get('content-length'), '0');
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
    const requests = new Server();
    const other = new Server();

    requests.route('GET', '/', (req, meta) => {
      const location = `http://0.0.0.0:${other.port()}`;
      return new Response({
        status: 307,
        headers: { location }
      })
    })

    other.route('GET', '/', (req, meta) => 'Success!')

    await requests.listen();
    await other.listen();

    const response = await fetch(`http://0.0.0.0:${requests.port()}`);
    assert.equal(
      await response.text(),
      'Success!'
    );

    await requests.close();
    await other.close();
  } catch (e) {
    return e;
  }
}
