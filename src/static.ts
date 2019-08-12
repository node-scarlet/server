import { resolve, join } from 'path'
import { promisify } from 'util';
import { readFile } from 'fs';
const asyncReadFile = promisify(readFile);

/**
 * Create a handler that will attempt to serve static files
 * from a given directory path.
 */
export const staticFiles = path => {
  return async req => {
    const filepath = join(resolve(path), req.url);
    return await asyncReadFile(filepath, 'utf8')
      .catch(e => undefined);
  }
}
