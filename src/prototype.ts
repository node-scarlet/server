import { HttpServer } from './http';

export function httpService(port=0) {
  const requests = new HttpServer({ port });

  function handle(methods, urlpatttern) {
    return {
      with: function(fn) {
        if (Array.isArray(methods)) {
          methods.forEach(m => requests.route(m, urlpatttern, fn));
        } else if (typeof methods == 'string') {
          requests.route(methods, urlpatttern, fn)
        }
      }
    }
  }
  handle.start = async function() {
    await requests.listen();
  }
  handle.stop = async function() {
    await requests.close();
  }
  return handle;
}
