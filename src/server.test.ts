import { strict as assert } from 'assert';
const { URLSearchParams } = require('url');
import { HttpServer, HttpResponse } from './server'
import * as fetch from 'node-fetch';

export const tests = [
  portZeroTest,
  defaultHeadersTest,
  handlerMetaTest,
  illegalRouteMethodsTest,
  responseConstructorTest,
  requestBodyParserURLencodedTest,
  requestBodyParserJSON,
];

async function portZeroTest() {
  const description = `port 0 can be used to
  guarantee an available port`;

  try {
    const requests = new HttpServer({ port: 0 });
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
    const requests = new HttpServer({ port: 0 });
    requests.route('GET', '/', (req, meta) => {
      return {
        status: 200,
        headers: {},
        body: ''
      }
    })
    await requests.listen();
    
    // Make A request to the server defined above
    const res = await fetch(`http://0.0.0.0:${requests.port()}`);
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
    const requests = new HttpServer({ port: 0 });
    requests.route('GET', '/', (req, meta) => {
      meta.desire = 'love';
    })
    requests.route('GET', '/', (req, meta) => {
      return {
        status: 200,
        headers: {},
        body: 'Wilber didn\'t want food. He wanted ' + meta.desire,
      }
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
      const requests = new HttpServer({ port: 0 });
      requests.route('SAVE', '/', (req, meta) => {
        return new HttpResponse();
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
  const description = `The HttpResponse constructor
  can be used to validate return material, and allows
  passing only some of the required properties`;

  try {
    // Start up an http server
    const requests = new HttpServer({ port: 0 });
    requests.route('GET', '/', (req, meta) => {
      return new HttpResponse();
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
    const requests = new HttpServer({ port: 0 });
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

async function requestBodyParserJSON() {
  const description = `JSON encoded body content
  will be parsed into an object`;

  try {
    const requests = new HttpServer({ port: 0 });
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
