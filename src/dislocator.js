var nameWhitelist = new RegExp('^[a-z0-9]+$', 'i');

function Dislocator() {
  this._registry = {};
  this._instances = {};
  this._loading = [];
}

Dislocator.prototype.register = function(name, creatorCb) {
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
};

Dislocator.prototype.use = function(providerFn) {
  providerFn(this);
  return this;
};

Dislocator.prototype.unregister = function(name) {
  if (!this._registry[name]) {
    throw new Error('No registration named "' + name + '"');
  }

  delete this._registry[name];
  delete this[name];

  delete this._instances[name];

  return this;
};

Dislocator.prototype.isRegistered = function(name) {
  return !!this._registry[name];
};

Dislocator.prototype.names = function(regex) {
  var names = Object.keys(this._registry);

  if (regex) {
    names = names.filter(function(name) {
      return name.match(regex);
    });
  }

  return names;
};

Dislocator.prototype.get = function(name) {
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
};

export default Dislocator;
