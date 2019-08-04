# About
This module provides an intuitive interface for creating http servers with Node.

## Getting Started
The (almost) simplest possible example:

```JS
const http = require('@node-scarlet/http');
const { GET } = http.methods;

const requests = http.server();
requests.route(GET, '/*', (req, meta) => 'Hello, World!');
requests.listen(process.env.PORT);

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
    headers: { 'content-type', 'text/html' },
    body: '<h1>Access Denied</h1>'
  })
} 
```

The `req` object is made up of the following properties:
* `method`: The http verb (GET, POST, etc..)that the request was made with
* `headers`: An object containing header names, and their corresponding values
* `url`: The full url pathname starting after the domain, E.G: `"/products/hats?id=45&limit=1"`
* `params`: An object representation of dynamic url segments. A request matching the url pattern `"/products/:type"`, might have a `params` value of `{ type: "hats" }`, or `{ type: "watches" }`.
* `body`: A string representation of the request body.
* `query`: An object representation of querystring values, E.G: `{ id: "45", limit: 1 }`

The `meta` argument is used to store arbitary data that can be used by other handlers. If a handler doesn't return a response, the request will continue flowing to downstream handlers.

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
