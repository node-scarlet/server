# About
This module provides an intuitive interface for creating http servers with Node.

```JS
const http = require('./main');
const { GET } = http.methods;

/**
 * Define request handlers
 */

// response shorthand
const saySomething = (req, meta) => 'Hello there!';

// full response syntax
const denyAccess = (req, meta) => {
  return http.response({
    status: 403,
    headers: {},
    body: 'Access Denied'
  })
} 

// Attach properties to meta for later use
const attachMeta = (req, meta) => {
  meta.desire = req.query.emotion || 'love';
})

const emote = (req, meta) => {
  return http.response({
    status: 200,
    headers: {},
    body: 'Wilber didn\'t want food. He wanted ' + meta.desire,
  })
})

/**
 * Define server behavior with handlers
 */
const requests = http.server();
requests.route(GET, '/', saySomething);
requests.route(GET, '/secret', denyAccess);
requests.route(GET, '/*', attachMeta);
requests.route(GET, '/*', emote);
requests.listen(5000);
```

