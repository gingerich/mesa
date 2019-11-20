export class ServiceRegistry {
  constructor() {
    this.services = new WeakMap();
    this.schemas = {};
  }

  add(schema, service) {
    this.services.set(schema, service);
    this.schemas[schema.name] = schema;
  }

  remove(schema) {
    this.services.delete(schema);
    delete this.schemas[schema.name];
  }

  get(schema) {
    return this.services.get(schema);
  }

  getByName(name) {
    return this.get(this.schemas[name]);
  }
}
