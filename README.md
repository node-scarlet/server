# About
This module provides an intuitive interface for creating http servers with Node.

```JS
// Dependencies
const { HttpServer, HttpResponse } = require('./main');

const requests = new HttpServer({ port: 5000 });

// Attach properties to meta for later use
requests.route('GET', '/', (req, meta) => {
  meta.desire = req.query.emotion || 'love';
})

// Send a response
requests.route('GET', '/', (req, meta) => {
  return new HttpResponse({
    status: 200,
    headers: {},
    body: 'Wilber didn\'t want food. He wanted ' + meta.desire,
  })
})

requests.listen();
```
