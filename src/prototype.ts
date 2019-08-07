/**
 * Prototype: Rewrite module with the http module from the Node standard lib
 */
import * as http from 'http';
import * as qs from 'querystring';
import * as UrlPattern from 'url-pattern';
import { promisify } from 'util';

// Convert a `response` shaped object to a `res` shaped one
function adaptResponse(response, res) {
  const { status, headers, body } = response;
  res.writeHead(status, {
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  })
  res.end(body);
}

const asyncBody = promisify(function(req, callback) {
  let body = '';
  req.on('data', chunk => {
      body += chunk.toString();
  });
  req.on('end', () => {
      callback(null, body);
  });
});

function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function listen(port=0) {
  this.s = http.createServer(async (req, res) => {
    try {
      // Separate data
      const { url, method, headers } = req;
      const [path, querystring] = url.split('?');
      let body:any = await asyncBody(req);

      // Parse Querystring
      const query = Object.assign({}, qs.decode(querystring));

      // Parse JSON Body
      if (headers['content-type'] == 'application/json') {
        try { body = JSON.parse(body) }
        catch (e) {}
      }
      // Parse URL-Encoded Body
      else if (headers['content-type'] == 'application/x-www-form-urlencoded') {
        body = Object.assign({}, qs.decode(body));
      }

      // Adapt response
      const meta = {};
      const request:any = {
        url,
        method,
        query,
        headers,
        body,
      }
        
      // See if any middleware matches the incoming request
      for (const m of this.middlewares[method]) {
        const match = m.match(path);
        if (match) {
          request.params = match;
          const response = m.handler(request, meta);
          if (response) {
            return adaptResponse(response, res);
          }
        }
      }

      // Not Found
      adaptResponse(response({ status: 404 }), res);
    } catch (e) { throw e }
  });
  this.s.listen(port);
}

function close() {
  this.s.close();
}

function port() {
  return this.s.address().port;
}

class Server {
  listen;
  close;
  port;
  middlewares;
  route;
  constructor() {
    this.listen = listen.bind(this)
    this.close = close.bind(this)
    this.port = port.bind(this)
    this.middlewares = methodStacks();
    this.route = route.bind(this);
  }
}

export function server() {
  return new Server();
}

function middleware(method, urlpattern, handler) {
  return {
    method,
    urlpattern,
    handler,
    match: (url) => new UrlPattern(urlpattern).match(url),
  }
}

function requestMatchesHandler(req, middleware) {
  // ...
}

function route(method, urlpattern, handler) {
  method = method.toUpperCase();
  if (!methods[method]) throw new Error(`Unsupported verb "${method}".`);
  this.middlewares[method].push(middleware(method, urlpattern, handler));
}

function methodStacks() {
  return {
    GET: [],
    PUT: [],
    POST: [],
    PATCH: [],
    DELETE: [],
  }
}

export function response(options:any={}) {
  return Object.freeze({
    status: options.status || 200,
    headers: options.headers || {},
    body: options.body || '',
  })
}

export const methods = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE'
}

const statusCodes = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  304: 'Not Modified',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
}