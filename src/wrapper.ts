import { Server } from './server';

export function server() {
  const requests = new Server();

  function route(...methods) {
    function methodsOnly(urlpattern) {
      return  {
        to: fn => methods.forEach(m => requests.route(m, urlpattern, fn))
      }
    }
    methodsOnly.to = fn => methods.forEach(m => requests.route(m, '/*', fn));
    return methodsOnly;
  }
  route.start = async (port?:number) => await requests.listen(port);
  route.stop = async () => await requests.close();
  route.port = () => requests.port();
  return route;
}
