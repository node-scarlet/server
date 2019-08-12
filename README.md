# Build APIs Instantly 🏋️‍♂️
Serve [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages) in seconds with URL routing out of the box.

## Down to business
The *almost* 👏 simplest possible example:
Run the program, and visit `localhost:5000` in your browser to see things in action!

```JS
const http = require('@node-scarlet/http');
const { GET, POST } = http.methods;

const requests = http.server();
requests.route(GET, '/*', (req, meta) => 'Hello, World!');
requests.route(POST, '/json', (req, meta) => { success: true });
requests.listen(5000);
```


## Routing
`requests.route()` always takes the same 3 parameters:
* **method**: The type of [HTTP Method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) the route will apply to. You can use strings like `"GET"`, or you can reference them from `http.methods` as shown above.
* **urlpattern**: A string that represents which URL paths the route will apply to. The syntax is based on the [url-pattern](https://www.npmjs.com/package/url-pattern) format.
* **handler**: A function that determines how the route should respond to requests that it applies to.

## Handler Functions
Request handler functions use `req` and `meta` to determine how to react to incoming requests. If they return a truthy value, that value will be used to respond.
* For simple responses, you can use a `string` or `object` as a return type
* Use `http.response()` to have richer control over the [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status), [headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers), and [body](https://en.wikipedia.org/wiki/HTTP_message_body).

```JS
// handlers.js

// string/object shorthand
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
### Handler Arguments
#### `req`
The `req` argument is short for **"request"**, and has the following properties:
* `method`: The http verb (GET, POST, etc..)that the request was made with.
* `headers`: An object containing header names, and their corresponding values.
* `url`: The full url pathname starting after the domain, E.G: `"/products/hats?id=45&limit=1"`.
* `params`: An object representation of dynamic url segments. A request matching the url. pattern `"/products/:type"`, might have a `params` value of `{ type: "hats" }`, or `{ type: "watches" }`.
* `body`: A string representation of the request body.
* `query`: An object representation of querystring values, E.G: `{ id: "45", limit: 1 }`.
#### `meta`
`meta` starts off as an empty object, but is intended to be populated with arbitary data that can be used by other handlers. Some handler won't return a response, but instead set properties of `meta` to be used by downstream handlers. One such example might be a handler that authenticates a requester's identity, and stores their account data on `meta`.

```JS
// handlers.js
const attachMeta = (req, meta) => {
  meta.desire = req.query.emotion || 'love';
}

// Utilize the meta value set by attachMeta()
const emote = (req, meta) => {
  return http.response({
    status: 200,
    headers: {},
    body: 'Wilber didn\'t want food. He wanted ' + meta.desire,
  })
}
```

## Tying things together
For organization, you'll typically want to define your request handlers in their own module instead of inline.

```JS
const http = require('@node-scarlet/http');
const { GET, POST } = http.methods;
const handlers = require('./handlers');

const requests = http.server();
requests.route(GET, '/*', handlers.attachMeta);
requests.route(GET, '/greeting', handlers.saySomething);
requests.route(POST, '/secrets', handlers.denyAccess);
requests.route(GET, '/sad/story', handlers.emote);
requests.listen(5000);
```

## Stopping Service
Stop listening for requests with `requests.close()`.

### Ports
Specify which networking port to listen over with `requests.listen()`. If no `port` argument is provided, a random available port will be chosen.

Once listening, `requests.port()` will return the active port.

### Static Files
"Static" refers to any files that you may want to serve to requesters outright, like `.html`, `.css`, or `.js` files to be consumed by the browser.

In a production environment, Node should rely on a reverse-proxy like Nginx to serve static files, but for small projects or development environments, you can use something like the following.

Assuming the static file directory is called "public":
```JS
import { resolve, join } from 'path'
import { promisify } from 'util';
import { readFile } from 'fs';
const asyncReadFile = promisify(readFile);

/**
 * Create a handler that will attempt to serve static files
 * from a given directory path.
 * 
 * USAGE:
 * requests.route(GET, '/*', staticFiles(__dirname + "public"));
 */
export const staticFiles = path => {
  return async (req, meta) => {
    const filepath = join(resolve(path), req.url);
    return await asyncReadFile(filepath, 'utf8')
      .catch(e => undefined);
  }
}
```