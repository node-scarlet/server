import { strict as assert } from 'assert';
import * as http  from '../http';
const { GET } = http.methods;
import * as fetch from 'node-fetch';
import { protect } from './protect';
import { staticFiles } from './static';
import { createReadStream } from 'fs';

export const tests = [
  handlerOnErrorTest,
  staticFileTest,
  streamResponseTest,
];

async function handlerOnErrorTest() {
  const description = `Handlers can be wrapped
  with uniform error handling`;

  try {
    const asyncHandler = async (req, meta) => {
      if (req.query.fail) throw new Error('unexpected behavior!');
      return 'Success!';
    }

    const protectedAsyncHandler = await protect(asyncHandler);

    const requests = http.server();
    requests.route(GET, '/*', protectedAsyncHandler)
    await requests.listen();

    const first = await fetch(`http://0.0.0.0:${requests.port()}?fail=true`);
    const second = await fetch(`http://0.0.0.0:${requests.port()}`);
    assert.deepEqual(await first.text(), 'Not Found');
    assert.deepEqual(await second.text(), 'Success!');
    await requests.close();
  } catch (e) {
    return e;
  }
}

async function staticFileTest() {
  const description = `Static files can be served
  from a given directory`;

  try {
    const requests = http.server();
    requests.route(GET, '/*', staticFiles(__dirname + '/static'));
    requests.route(GET, '/*', () => 404);
    await requests.listen();

    const first = await fetch(`http://0.0.0.0:${requests.port()}/index.html`);
    const second = await fetch(`http://0.0.0.0:${requests.port()}/fake.html`);
    assert.deepEqual(await first.text(), '<h1>Hello World!</h1>');
    assert.deepEqual(await second.text(), 'Not Found');
    await requests.close();
  } catch (e) {
    return e;
  }
}

async function streamResponseTest() {
  const description = `Stream objects should be
  acceptable response body material`;

  try {

    const streamFile = (req, meta) => {
      return http.response({
        status: 200,
        headers: {},
        body: createReadStream(__dirname + '/static/index.html'),
      })
    }

    const requests = http.server();
    requests.route(GET, '/*', streamFile);
    await requests.listen();

    const first = await fetch(`http://0.0.0.0:${requests.port()}`);
    assert.deepEqual(await first.text(), '<h1>Hello World!</h1>');
    await requests.close();
  } catch (e) {
    return e;
  }
}
