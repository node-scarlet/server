import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as KoaRouter from 'koa-router';
import * as cors from '@koa/cors';
import { AddressInfo } from 'net'; 

import {
  HttpServerInterface,
  HttpServerOptionsInterface,
  HttpRequestInterface,
  HttpHeadersInterface,
  HttpResponseInterface,
  HttpResponseMaterial,
  RequestHandlerType,
} from './http.types';
import { Server as StandardServer } from 'https';

export function server(...args) {
  return new Server(...args);
}

export function response(...args) {
  return new Response(...args);
}

export class Server implements HttpServerInterface {
  options: HttpServerOptionsInterface;
  private router: any;
  private service: StandardServer;

  constructor(options?: HttpServerOptionsInterface) {
    this.options = options;
    this.router = new KoaRouter();
  }

  port() {
    return (<AddressInfo>this.service.address()).port || undefined;
  }

  route(method:string, path:string, handler:RequestHandlerType) {
    const verb = method.toLowerCase();
    if ('function' !== typeof this.router[verb]) {
      throw new Error(`Unsupported verb "${method}".`);
    }
    this.router[verb](path, async (ctx, next) => {
        const req = adaptRequest(ctx);
        const meta = ctx._meta || {};

        const response: HttpResponseInterface | void = await handler(req, meta);
        if (response) {
          adaptResponse(response, ctx);
        } else {
          ctx._meta = meta;
          await next();
        }
    })
  }

  async listen(port=0) {
    const app = new Koa();

    // Required Middleware
    app.use(bodyParser());
    app.use(cors());

    app.use(this.router.routes());

    this.service = await app.listen(port);
  }

  close() {
    if (this.service) {
      this.service.close();
    }
  }
}

export class Response implements HttpResponseInterface {
  status: number;
  headers: HttpHeadersInterface;
  body: string;

  constructor(options?: HttpResponseMaterial) {
    this.status = options.status || 200;
    this.headers = options.headers || {};
    this.body = options.body || '';
  }
}

function adaptRequest(ctx): HttpRequestInterface {
  const {
    method,
    headers, 
    url,
    params,
  } = ctx;

  const { body, query }  = ctx.request;

  return Object.freeze({
    method,
    headers,
    url,
    params,
    body,
    query,
  });
}

function adaptResponse(response, ctx) {
  if (typeof response == 'string') {
    response = new Response({
      status: 200,
      headers: { 'content-type': 'text/html' },
      body: response
    })
  }
  else if (response instanceof Response == false && typeof response == 'object') {
    response = new Response({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(response)
    })
  }

  // Status Code
  ctx.response.status = response.status;
  // Headers
  for (const [name, value] of Object.entries(response.headers)) {
    ctx.set(name, value);
  }
  // Body
  if (response.body) ctx.response.body = response.body;
}
