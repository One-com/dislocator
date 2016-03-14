var Dislocator = require('../lib/dislocator');
var expect = require('unexpected')
    .use(require('unexpected-sinon'));
var sinon = require('sinon');


describe('Dislocator', function () {
    var locator;

    beforeEach(function () {
        locator = new Dislocator();
    });

    it('should have no registrations when new', function () {
        expect(locator.names(), 'to be empty');
    });

    [ 'my-foo', 'my_bar', 'my:baz' ].forEach(function (invalidName) {
        it('should reject invalid names like "' + invalidName + '"', function () {
            expect(function () {
                locator.register(invalidName, function () {});
            }, 'to throw', 'Invalid name');
        });
    });


    it('should be able to register and emit events', function () {
        var spy = sinon.spy();
        locator.on('register', spy);

        locator.register('myFoo', function () {
            return 'bar';
        });

        expect(locator.get('myFoo'), 'to equal', 'bar');
        expect(spy, 'was called times', 1);
        expect(spy, 'was called with', 'myFoo');

        locator.register('myBar', function () {});
        expect(spy, 'was called times', 2);
        expect(spy, 'was called with', 'myBar');

        locator.register('myBaz', function () {});
        expect(spy, 'was called times', 3);
        expect(spy, 'was called with', 'myBaz');

    });

    it('should throw an error on name collision', function () {
        locator.register('myFoo', function () {});

        expect(function () {
            locator.register('myFoo', function () {});
        }, 'to throw', 'Name is already registered');
    });

    it('should throw an error when unregistering unknown services', function () {
        expect(function () {
            locator.unregister('myFoo', function () {});
        }, 'to throw', 'No registration named "myFoo"');
    });

    it('should forget unregistered service and emit events', function () {
        var spy = sinon.spy();
        locator.on('unregister', spy);

        expect(locator.isRegistered('myFoo'), 'to be false');

        locator.register('myFoo', function () {});
        expect(locator.isRegistered('myFoo'), 'to be true');

        var service = locator.get('myFoo');
        expect(spy, 'was not called');
        locator.unregister('myFoo');
        expect(locator.isRegistered('myFoo'), 'to be false');
        expect(spy, 'was called times', 1);
        expect(spy, 'was called with', 'myFoo', service);
    });

    it('should be able to list and search all service names', function () {
        expect(locator.names(), 'to equal', []);

        locator.register('myFoo', function () {});
        locator.register('myBar', function () {});
        locator.register('myBaz', function () {});
        expect(locator.names(), 'to equal', ['myFoo', 'myBar', 'myBaz']);

        expect(locator.names(/^my.*/), 'to equal', ['myFoo', 'myBar', 'myBaz']);
        expect(locator.names(/Foo$/), 'to equal', ['myFoo']);
        expect(locator.names(/Ba/), 'to equal', ['myBar', 'myBaz']);
    });

    it('should be able to tell if a service name is registered', function () {
        expect(locator.isRegistered('myFoo'), 'to be false');

        locator.register('myFoo', function () {});
        expect(locator.isRegistered('myFoo'), 'to be true');

        locator.unregister('myFoo');
        expect(locator.isRegistered('myFoo'), 'to be false');
    });

    it('should call the createrCb function once on first get and emit events', function () {
        var createrSpy = sinon.spy();
        var eventSpy = sinon.spy();
        locator.on('creation', eventSpy);
        locator.register('myFoo', createrSpy);

        expect(createrSpy, 'was not called');
        expect(eventSpy, 'was not called');

        locator.get('myFoo');
        expect(createrSpy, 'was called times', 1);
        expect(createrSpy, 'was called with', locator);
        expect(eventSpy, 'was called times', 1);
        expect(eventSpy, 'was called with', 'myFoo', locator.get('myFoo'));

        expect(createrSpy, 'was called times', 1);
        expect(eventSpy, 'was called times', 1);
    });

    it('should throw an error when service doesn\'t exist', function () {
        expect(function () {
            locator.get('non-existing-service');
        }, 'to throw', 'No registration named "non-existing-service"');
    });

    it('should detect circular dependency', function () {
        locator.register('a', function (locator) {
            locator.get('b');
        });

        locator.register('b', function (locator) {
            locator.get('a');
        });

        expect(function () {
            locator.get('a');
        }, 'to throw', 'Circular dependency detected (a <-> b)');
    });

    it('should get services as members on the object', function () {
        expect(locator.a, 'to be', undefined);

        var value = 'a';
        var initFn = function () { return value; };
        locator.register('a', initFn);
        expect(locator.a, 'to be', value);

        locator.unregister('a');
        expect(locator.a, 'to be', undefined);
    });
});
