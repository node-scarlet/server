import * as http from 'http';
import * as qs from 'querystring';
import * as UrlPattern from 'url-pattern';
import { promisify } from 'util';
import { Readable } from 'stream';

export const server = () => new HttpServer();
export const response = (options:any={}) => new HttpResponse(options);

class HttpServer {
  private _server:http.Server;
  listen;
  close;
  port;
  middlewares;
  route;
  constructor() {
    this.listen = listen.bind(this)
    this.close = close.bind(this)
    this.port = port.bind(this)
    this.route = route.bind(this);
    this.middlewares = {
      GET: [],
      PUT: [],
      POST: [],
      PATCH: [],
      DELETE: [],
    }
  }
}
/**
 * Create an Http Server and start listening for requests
 * Bound as a method to `HttpServer`
 */
function listen(port:number=0) {
  this._server = http.createServer(async (req:http.IncomingMessage, res:http.ServerResponse) => {
    try {
      // Separate data
      const { url, method, headers } = req;
      const [path, querystring] = url.split('?');
      let body:any = await asyncBody(req);

      // Parse Querystring
      const query = Object.assign({}, qs.decode(querystring));

      // Try to parse JSON data
      if (headers['content-type'] == 'application/json') {
        try { body = JSON.parse(body) }
        catch (e) {}
      }
      // Try to parse URL-Encoded data
      else if (headers['content-type'] == 'application/x-www-form-urlencoded') {
        body = Object.assign({}, qs.decode(body));
      }

      // Adapt request
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
        let match;
        try {
          // Some urlpatterns will throw errors
          match = m.match(path);
        } catch (e) { continue }

        if (match) {
          request.params = match;
          const response = await m.handler(request, meta);
          if (response) {
            const adaptable = responseShorthand(response);
            return adaptResponse(adaptable, res);
          }
        }
      }

      // Not Found
      const notFoundResponse = response({ status: 404 })
      adaptResponse(notFoundResponse, res);
    } catch (e) { throw e }
  });
  this._server.listen(port);
}
/**
 * Stop listening for http requests
 * Bound as a method to  `HttpServer`
 */
function close() {
  this._server.close();
}
/**
 * Determine the port that's being listened over
 * Bound as a method to  `HttpServer`
 */
function port() {
  return this._server.address().port;
}
/**
 * Adapts `HttpResponse` it to its lower level counterpart`http.ServerResponse`.
 * A helper function of `HttpServer.listen()`
 */
function adaptResponse(
  input:HttpResponse,
  output:http.ServerResponse
) {
  let { status, headers, body } = input;

  if (body instanceof Readable) {
    output.writeHead(status, { ...headers })
    body.pipe(output);
    return;
  }

  if (typeof body == 'object') {
    body = JSON.stringify(body);
  }

  headers['Content-Length'] = Buffer.byteLength(body);
  output.writeHead(status, { ...headers })
  output.end(body);
}
/**
 * Get stringified request body asyncronously
 * @param {http.IncomingMessage} req
 * @returns {Promise<string>}
 */
const asyncBody = promisify(function(req:http.IncomingMessage, callback) {
  let body = '';
  req.on('data', chunk => {
      body += chunk.toString();
  });
  req.on('end', () => {
      callback(null, body);
  });
  req.on('error', (e) => {
    callback(e);
  })
});
/**
 * Convert primitive response types into intances of `HttpResponse`
 * A helper function of `HttpServer.start()`
 * A helper function of `HttpServer.listen()`
 */
function responseShorthand(response:any):HttpResponse {
  if (typeof response == 'string') {
    return {
      status: 200,
      headers: { 'content-type': 'text/html' },
      body: response 
    }
  }
  else if (typeof response == 'number' && statusMessages[response]) {
    return {
      status: response,
      headers: { 'content-type': 'text/plain' },
      body: statusMessages[response]
    }
  }
  else if (response instanceof Readable) {
    return { status: 200, body: response }
  }
  else if (typeof response == 'object' && !(response instanceof HttpResponse)) {
    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(response),
    }
  }
  else return response;
}
class Middleware {
  method: 'string';
  urlpattern: 'string';
  handler: (req, meta) => any;
  match: (url) => { [key:string]: string };
  constructor(method, urlpattern, handler) {
    this.method = method;
    this.urlpattern = urlpattern;
    this.handler = handler;
    this.match = url => new UrlPattern(urlpattern).match(url);
  }
}
function route(method, urlpattern, handler) {
  method = method.toUpperCase();
  if (!methods[method] && method !== 'ALL') {
    throw new Error(`Unsupported verb "${method}".`);
  }
  // "ALL" is just sugar for applying the same middleware to every route
  if (method == 'ALL') {
    for (const verb of Object.keys(methods)) {
      const newMiddleware = new Middleware(verb, urlpattern, handler);
      this.middlewares[verb].push(newMiddleware);
    }
  }
  // Put the middleware on its corresponding method stack
  else {
    const newMiddleware = new Middleware(method, urlpattern, handler);
    this.middlewares[method].push(newMiddleware);
  }
}
class HttpResponse {
  status?: number;
  headers?: object;
  body?: string | Readable;
  constructor(options) {
    const { status, headers, body } = options;
    this.status = status ? status : 200;
    this.headers = headers ? headers: {};
    this.body = body != undefined ? body: '';
  }
}
const statusMessages = {
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
}
export const methods = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE'
}