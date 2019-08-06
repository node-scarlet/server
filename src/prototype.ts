/**
 * Prototype: Rewrite module with the http module from the Node standard lib
 */
import * as http from 'http';
import * as qs from 'querystring';
import * as UrlPattern from 'url-pattern';



function listen(port=0) {
  this.s = http.createServer(function(req, res) {
    // Separate data
    const { url, method, headers } = req;
    const [path, querystring] = url.split('?');
    
    // Parse Querystring
    const query = Object.assign({}, qs.decode(querystring));
    
    res.write('done');
    res.end();
    
  });
  this.s.listen(port);
}

function close() {
  this.s.close();
}

function port() {
  return this.s.address().port;
}

function route(method, urlpattern, handler) {
  this.middleware.push(middleware(method, urlpattern, handler));
}

class Server {
  listen;
  close;
  port;
  middlewares;
  constructor() {
    this.listen = listen.bind(this)
    this.close = close.bind(this)
    this.port = port.bind(this)
    this.middlewares = [];
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