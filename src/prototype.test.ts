import { strict as assert } from 'assert';
const { URLSearchParams } = require('url');
import { Server } from './prototype'
import * as fetch from 'node-fetch';

export const tests = [
  serverConstructTest,
];

async function serverConstructTest() {
  const description = `The Server class can
  be instantiated`;

  try {
    assert.doesNotThrow(() => new Server());
  } catch (e) {
    return e;
  }
}