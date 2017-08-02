const nameWhitelist = new RegExp('^[a-z0-9]+$', 'i');

class Dislocator {
  constructor() {
    this._registry = {};
    this._instances = {};
    this._loading = [];
  }

  register(name, creatorCb) {
    if (!nameWhitelist.test(name)) {
      throw new Error('Invalid name');
    }

    if (this._registry[name]) {
      throw new Error('Name is already registered');
    }

    this._registry[name] = creatorCb;

    Object.defineProperty(this, name, {
      get: function() {
        return this.get(name);
      }.bind(this),
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
    if (!this._registry[name]) {
      throw new Error('No registration named "' + name + '"');
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
    var names = Object.keys(this._registry);

    if (regex) {
      names = names.filter(function(name) {
        return name.match(regex);
      });
    }

    return names;
  }

  get(name) {
    if (this._loading.indexOf(name) !== -1) {
      throw new Error(
        'Circular dependency detected (' +
          name +
          ' <-> ' +
          this._loading[this._loading.length - 1] +
          ')'
      );
    }

    this._loading.push(name);

    if (!this.isRegistered(name)) {
      throw new Error('No registration named "' + name + '"');
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
