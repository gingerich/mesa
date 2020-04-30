export default class MeshIngress {
  constructor(service) {
    this.service = service;
  }

  getService() {
    return this.service;
  }

  getHandler() {
    return (ctx, next) => {
      console.log('MESH INGRESS', ctx.packet.payload);
      next(ctx);
      return this.service.proxy(ctx);
    };
  }
}
