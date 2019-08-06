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

class Server {
  listen;
  close;
  port;
  constructor() {
    this.listen = listen.bind(this)
    this.close = close.bind(this)
    this.port = port.bind(this)
  }
}

export function server() {
  return new Server();
}
