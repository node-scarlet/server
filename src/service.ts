import { HttpServer } from './http';

export const GET = 'GET';
export const PUT = 'PUT';
export const POST = 'POST';
export const DELETE = 'DELETE';

export function service() {
  const requests = new HttpServer();

  function handle(...methods) {
    function methodsOnly(urlpattern) {
      return  {
        with: fn => methods.forEach(m => requests.route(m, urlpattern, fn))
      }
    }
    methodsOnly.with = fn => methods.forEach(m => requests.route(m, '/*', fn));
    return methodsOnly;
  }
  handle.start = async (port?:number) => await requests.listen(port);
  handle.stop = async () => await requests.close();
  handle.port = () => requests.port();
  return handle;
}
