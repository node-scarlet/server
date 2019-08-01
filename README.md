# About
This module provides an intuitive interface for creating http servers with Node.

```JS
const http = require('@node-scarlet/http');
const { GET, POST } = http.methods;
```

Request handler functions use `req` and `meta` to determine how to react to incoming requests. Return a `string`, `object`, or `http.response()` to respond:

```JS
// response shorthand
const saySomething = (req, meta) => 'Hello there!';
const getJson = (req, meta) => { message: 'anybody listening?' };

// full response syntax
const denyAccess = (req, meta) => {
  return http.response({
    status: 403,
    headers: {},
    body: 'Access Denied'
  })
} 
```

Use the `meta` argument to store arbitary data that can be used by other handlers:

If a handler doesn't return a response, the request will continue flowing to downstream handlers.

```JS

const attachMeta = (req, meta) => {
  meta.desire = req.query.emotion || 'love';
})

// Utilize the meta value set by attachMeta()
const emote = (req, meta) => {
  return http.response({
    status: 200,
    headers: {},
    body: 'Wilber didn\'t want food. He wanted ' + meta.desire,
  })
})
```

Route requests to handlers defined above, and start listening for requests:

```JS
const requests = http.server();
requests.route(GET, '/', saySomething);
requests.route(POST, '/secret', denyAccess);
requests.route(GET, '/*', attachMeta);
requests.route(GET, '/*', emote);
requests.listen(5000);
```
