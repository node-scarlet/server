import { HttpServer } from './http';

export const GET = 'GET';
export const PUT = 'PUT';
export const POST = 'POST';
export const DELETE = 'DELETE';

export function httpService(port=0) {
  const requests = new HttpServer({ port });

  function handle(...methods) {
    return function(urlpatttern) {
      return {
        with: fn => methods.forEach(m => requests.route(m, urlpatttern, fn))
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
