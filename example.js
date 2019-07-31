const http = require('./main');
const { GET } = http.methods;

// Use response shorthand
const saySomething = (req, meta) => 'Hello there!';

// Use full response
const denyAccess = (req, meta) => {
  return http.response({
    status: 403,
    headers: {},
    body: 'Access Denied'
  })
}

const requests = http.server();
requests.route(GET, '/', saySomething);
requests.route(GET, '/secret', denyAccess);
requests.listen(5000);