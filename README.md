# Dislocator
[![Build Status](https://travis-ci.org/One-com/dislocator.svg?branch=master)](https://travis-ci.org/One-com/dislocator)
[![Coverage Status](https://coveralls.io/repos/github/One-com/dislocator/badge.svg?branch=master)](https://coveralls.io/github/One-com/dislocator?branch=master)

A Service Locator implementation for JavaScript.

# Installation

```
$ npm install dislocator
```

# Usage

A ServiceLocator is a registry for services. It can be passed around in your
application and help you make more decoupled applications, as well as making
swapping services out when testing code.

```js
// Creating a service locator instance
import ServiceLocator from 'dislocator';

const serviceLocator = new ServiceLocator();

serviceLocator.register('config', { name: "World" });

serviceLocator.register('greeter', (serviceLocator) => {
  const config = serviceLocator.get('config');

  return () => {
    return `Hello ${config.name}!`;
  }
})

// Using the service locator

function sayHi(serviceLocator) {
  const greeter = serviceLocator.greeter;
  console.log(greeter());
}

sayHi(); // logs: Hello World!
```

# class Dislocator

Default export from the CJS and ESM builds as well as in the UMD build when used
in CJS or AMD contexts. Accessible on `window.Dislocator` if loaded in the
browser without a module loader.

## constructor()

The constructor accepts no options.

```js
const serviceLocator = new Dislocator();
```

## register(name: string, serviceCreator:any) => this

Method for registering a service.

The `name` must be a string that contains only letters (both upper- and
lowercase) and numbers.

The `serviceCreator` argument can be a literal value (e.g. an object) or a
function. Functions passed as `serviceCreator`s will not be invoked until the
service is requested; meaning that `serviceCreator` functions must return the
service instance synchroniuosly.

```js
serviceLocator.register('config', { value: "my config value" });
serviceLocator.register('myService', () => {
  return new MyService();
});
```

`serviceCreator` functions get passed a reference to the Dislocator instance as
the only argument.

```js
serviceLocator.register('myService', (services) => {
  const config = services.get('config');
  return new MyService(config);
});
```

The `register` methods can be chained as the dislocator instance is returned.

```js
serviceLocator
  .register('someService', () => {})
  .register('anotherService', () => {});
```

## get(name: string) => any

Returns an instance of the requested service.

```js
serviceLocator.get('myService');
```

Services can also be retrieved through getters on the Dislocator instance.

```js
serviceLocator.get('myService') === serviceLocator.myService; // => true
```

If you attempt to retrieve a service that is not registered both methods will
result in an Error being thrown.

```js
try {
  serviceLocator.get('noSuchService');
} catch (e) {
  // e: `Error: No registration named "noSuchService"`
}
```

Dislocator does circular dependency detection when instantiating services.

```js
const serviceLocator = new Dislocator();

serviceLocator
  .register('serviceA', () => {
    const b = serviceLocator.get('serviceB');
    return new ServiceA(b);
  })
  .register('serviceB', () => {
    const a = serviceLocator.get('serviceA');
    return new ServiceB(a);
  });

try {
  serviceLocator.get('serviceA');
} catch (e) {
  // e: `Error: Circular dependency detected (serviceA -> serviceB -> serviceA)`
}
```

## unregister(name: string) => this

Remove a registered service and any instantiated versions of it. Can be chained.

```js
serviceLocator
  .unregister('someService')
  .unregister('anotherService');
```

## isRegistered(name: string) => boolean

Checks if a service is registered.

```js
serviceLocator.isRegistered('someService'); // => false

serviceLocator.register('someService', () => {});

serviceLocator.isRegistered('someService'); // => true

serviceLocator.unregister('someService');

serviceLocator.isRegistered('someService'); // => false
```

## names() => array<string*>

Returns a list of names of the registered services.

```js
serviceLocator
  .register('someService', () => {})
  .register('anotherService', () => {});

serviceLocator.names(); // => ['someService', 'anotherService']
```


## use(serviceProvider: function) => this

Allows you to modularize functions that register services.

```js
const serviceLocator = new Dislocator();

serviceLocator.register('config', myConfigObject);

serviceLocator.use(require('./services/myService'));

// File: services/myService.js

const MyService = require('../MyService');

module.exports = function myServiceProvider(serviceLocator) {
  serviceLocator.register('myService', () => {
    return new MyService();
  });
};
```

# License

MIT
