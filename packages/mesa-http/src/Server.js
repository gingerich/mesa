import Koa from 'koa';
import body from 'koa-bodyparser';
import compress from 'koa-compress';
import helmet from 'koa-helmet';
import morgan from 'koa-morgan';
import mount from 'koa-mount';
import responseTime from 'koa-response-time';
import { compose } from '@mesa/component';
// import { Stack } from '@mesa/core'
import Mesa from '@mesa/core';

export class Server {
  static listen(component, ...args) {
    return new Server().use(component).listen(...args);
  }

  constructor(options = {}) {
    this.options = options;

    const upstream = [];

    if (options.msgFromRequest) {
      const transform = (ctx, next) => next(options.msgFromRequest(ctx));
      upstream.push(Mesa.use(transform));
    }

    this.service = Mesa.createService({ upstream });

    // this.middleware = []
  }

  use(...middleware) {
    this.service.use(...middleware);
    // this.middleware.push(...middleware)
    return this;
  }

  action(pattern, handler) {
    this.service.action(pattern, handler);
    return this;
  }

  // rawMode () {
  //   this.options.msgFromRequest = ExtractMsg.rawRequest()
  //   return this
  // }

  listen(...args) {
    const server = new Koa()

      // Set X-Response-Time header
      .use(responseTime())

      // HTTP request logging
      .use(morgan('combined', this.options.morgan))

      // Request body parser
      .use(body(this.options.bodyParser))

      // Allow compression
      .use(compress(this.options.compress))

      // Simple security configuration
      .use(helmet(this.options.helmet));

    // const { msgFromRequest = ExtractMsg.fromBody() } = this.options

    // const middleware = compose(Stack.spec().use(this.middleware))

    const serviceMiddleware = async (ctx, next) => {
      const response = await this.service.call(ctx, msg => next().then(() => msg));
      // const response = await this.service.call(msgFromRequest(ctx), function (msg) {
      //   return next().then(() => msg)
      // })

      // if (response) {
      ctx.body = response || null;
      // }
    };

    const serviceMount = this.options.prefix
      ? mount(this.options.prefix, serviceMiddleware)
      : serviceMiddleware;

    server.use(serviceMount);

    return server.listen(...args);
  }
}

export const ExtractMsg = {
  rawRequest: () => ctx => next(ctx),
  fromBody: () => ctx => ctx.request.body
};
