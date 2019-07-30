import { createServer } from 'http';

// const handle = new Server();
// handle(['GET', 'PUT'], '/').with(function(req, meta) {
//   meta.desire = req.query.emotion || 'love';
// })

// handle('GET', '/').with(function(req, meta) {
//   return 'Wilber didn\'t want food. He wanted ' + meta.desire;
// })

export class Server {
  middleware: [];

  constructor() {
    this.middleware = [];
  }

  applyMiddleware(req, res) {
    console.log('new middleware');
  }

  listen(port) {
    createServer(function(req, res) {
      for (const fn of this.middleware) {
        this.applyMiddleware(req, res, fn);
      }
    }).listen(port);
  }
}
