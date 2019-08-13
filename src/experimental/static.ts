import * as http from '../http';
import { resolve, join } from 'path'
import { promisify } from 'util';
import { createReadStream, exists } from 'fs';
const asyncExists = promisify(exists);

/**
 * Create a handler that will attempt to serve static files
 * from a given directory path.
 */
export const staticFiles = path => {
  return async req => {
    const filepath = join(resolve(path), req.url);
    if (await asyncExists(filepath))
    return createReadStream(filepath);
  }
}
