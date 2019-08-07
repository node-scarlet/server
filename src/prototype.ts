/**
 * Prototype: Rewrite module with the http module from the Node standard lib
 */
import * as http from 'http';
import * as qs from 'querystring';
import * as UrlPattern from 'url-pattern';

// Convert a `response` shaped object to a `res` shaped one
function adaptResponse(response, res) {
  const { status, headers, body } = response;
  res.writeHead(status, {
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  })
  res.end(body);
}

function listen(port=0) {
  this.s = http.createServer((req, res) => {
    // Separate data
    const { url, method, headers } = req;
    const [path, querystring] = url.split('?');

    // Parse Querystring
    const query = Object.assign({}, qs.decode(querystring));

    // Adapt response
    const request:any = {
      url,
      method,
      headers,
      query,
    }

    // console.log('middle:', this.middlewares);
    for (const m of this.middlewares[method]) {
      const match = m.match(path);
      if (match) {
        request.params = match;
        const response = m.handler(request);
        if (response) {
          return adaptResponse(response, res);
        }
      }
    }
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

export function response(options) {
  return Object.freeze({
    status: options.status || 200,
    headers: options.headers || {},
    body: options.body || '',
  })
}