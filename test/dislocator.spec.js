/* global describe:false, beforeEach:false, it:false */
var Dislocator = require('../lib/dislocator');
var expect = require('unexpected').use(require('unexpected-sinon'));
var sinon = require('sinon');

describe('Dislocator', function() {
  var locator;

  beforeEach(function() {
    locator = new Dislocator();
  });

  it('should have no registrations when new', function() {
    expect(locator.names(), 'to be empty');
  });
  ['my-foo', 'my_bar', 'my:baz'].forEach(function(invalidName) {
    it('should reject invalid names like "' + invalidName + '"', function() {
      expect(
        function() {
          locator.register(invalidName, function() {});
        },
        'to throw',
        'Invalid name'
      );
    });
  });

  it('should be able to register a service', function() {
    locator.register('myFoo', function() {
      return 'bar';
    });

    expect(locator.get('myFoo'), 'to equal', 'bar');
  });

  it('should be able to register a simple value', function() {
    locator.register('foo', { foo: 'bar' });
    expect(locator.get('foo'), 'to equal', { foo: 'bar' });
  });

  it('should throw an error on name collision', function() {
    locator.register('myFoo', function() {});

    expect(
      function() {
        locator.register('myFoo', function() {});
      },
      'to throw',
      'Name is already registered'
    );
  });

  it('should throw an error when unregistering unknown services', function() {
    expect(
      function() {
        locator.unregister('myFoo', function() {});
      },
      'to throw',
      'No registration named "myFoo"'
    );
  });

  it('should forget unregistered service', function() {
    expect(locator.isRegistered('myFoo'), 'to be false');

    locator.register('myFoo', function() {});
    expect(locator.isRegistered('myFoo'), 'to be true');

    locator.unregister('myFoo');
    expect(locator.isRegistered('myFoo'), 'to be false');
  });

  it('should be able to list and search all service names', function() {
    expect(locator.names(), 'to equal', []);

    locator.register('myFoo', function() {});
    locator.register('myBar', function() {});
    locator.register('myBaz', function() {});
    expect(locator.names(), 'to equal', ['myFoo', 'myBar', 'myBaz']);

    expect(locator.names(/^my.*/), 'to equal', ['myFoo', 'myBar', 'myBaz']);
    expect(locator.names(/Foo$/), 'to equal', ['myFoo']);
    expect(locator.names(/Ba/), 'to equal', ['myBar', 'myBaz']);
  });

  it('should be able to tell if a service name is registered', function() {
    expect(locator.isRegistered('myFoo'), 'to be false');

    locator.register('myFoo', function() {});
    expect(locator.isRegistered('myFoo'), 'to be true');

    locator.unregister('myFoo');
    expect(locator.isRegistered('myFoo'), 'to be false');
  });

  it('should call the createrCb function once on first get', function() {
    var serviceProviderSpy = sinon.spy(function () {
      return 'myServiceValue';
    });

    locator.register('myFoo', serviceProviderSpy);

    expect(serviceProviderSpy, 'was not called');

    locator.get('myFoo');
    expect(serviceProviderSpy, 'was called once');

    locator.get('myFoo');
    locator.get('myFoo');
    locator.get('myFoo');

    expect(serviceProviderSpy, 'was called once');
  });

  it("should throw an error when service doesn't exist", function() {
    expect(
      function() {
        locator.get('non-existing-service');
      },
      'to throw',
      'No registration named "non-existing-service"'
    );
  });

  it('should detect circular dependency', function() {
    locator.register('a', function(locator) {
      locator.get('b');
    });

    locator.register('b', function(locator) {
      locator.get('a');
    });

    expect(
      function() {
        locator.get('a');
      },
      'to throw',
      'Circular dependency detected (a <-> b)'
    );
  });

  it('should get services as members on the object', function() {
    expect(locator.a, 'to be', undefined);

    var value = 'a';
    var initFn = function() {
      return value;
    };
    locator.register('a', initFn);
    expect(locator.a, 'to be', value);

    locator.unregister('a');
    expect(locator.a, 'to be', undefined);
  });

  describe('#use', function() {
    it('should allow registering a service in a .use method', function() {
      locator.use(function(locator) {
        locator.register('foo', function() {
          return 'bar';
        });
      });

      return expect(locator.isRegistered('foo'), 'to be true');
    });

    it('should allow registering services in more .use method', function() {
      locator
        .use(function(locator) {
          locator.register('foo', function() {
            return 'bar';
          });
        })
        .use(function(locator) {
          locator.register('bar', function() {
            return 'baz';
          });
        });

      return expect(locator.isRegistered('foo'), 'to be true').then(function() {
        return expect(locator.isRegistered('bar'), 'to be true');
      });
    });

    it('should allow registering services in a .use method', function() {
      locator.use(function(locator) {
        locator
          .register('foo', function() {
            return 'bar';
          })
          .register('bar', function() {
            return 'baz';
          });
      });

      return expect(locator.isRegistered('foo'), 'to be true').then(function() {
        return expect(locator.isRegistered('bar'), 'to be true');
      });
    });
  });
});
