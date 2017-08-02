const nameWhitelist = new RegExp('^[a-z0-9]+$', 'i');

class Dislocator {
  constructor() {
    this._registry = {};
    this._instances = {};
    this._loading = [];
  }

  register(name, creatorCb) {
    if (!nameWhitelist.test(name)) {
      throw new Error(`Invalid service name: "${name}"`);
    }

    if (this.isRegistered(name)) {
      throw new Error(`A service called "${name}" is already registered.`);
    }

    this._registry[name] = creatorCb;

    Object.defineProperty(this, name, {
      get: () => this.get(name),
      configurable: true,
      enumerable: true
    });

    return this;
  }

  use(providerFn) {
    providerFn(this);
    return this;
  }

  unregister(name) {
    if (!this.isRegistered(name)) {
      throw new Error(`No registration named "${name}"`);
    }

    delete this._registry[name];
    delete this[name];

    delete this._instances[name];

    return this;
  }

  isRegistered(name) {
    return !!this._registry[name];
  }

  names(regex) {
    let names = Object.keys(this._registry);

    if (regex) {
      names = names.filter(name => name.match(regex));
    }

    return names;
  }

  get(name) {
    if (this._loading.indexOf(name) !== -1) {
      const chain = this._loading.reduce((str, name) => `${str} -> ${name}`);
      throw new Error(`Circular dependency detected (${chain} -> ${name})`);
    }

    this._loading.push(name);

    if (!this.isRegistered(name)) {
      throw new Error(`No registration named "${name}"`);
    }

    if (!(name in this._instances)) {
      if (typeof this._registry[name] === 'function') {
        this._instances[name] = this._registry[name](this);
      } else {
        this._instances[name] = this._registry[name];
      }
    }

    this._loading.pop();

    return this._instances[name];
  }
}

module.exports = Dislocator;
