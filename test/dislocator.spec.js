describe('Dislocator', function () {
	var locator;

	beforeEach(function () {
		locator = new Dislocator();
	});

	it('should have no registrations when new', function () {
		unexpected(locator.names(), 'to be empty');
	});

	[ 'my-foo', 'my_bar', 'my:baz' ].forEach(function (invalidName) {
		it('should reject invalid names like "' + invalidName + '"', function () {
			unexpected(function () {
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

		unexpected(locator.get('myFoo'), 'to equal', 'bar');
		unexpected(spy, 'was called times', 1);
		unexpected(spy, 'was called with', 'myFoo');

		locator.register('myBar', function () {});
		unexpected(spy, 'was called times', 2);
		unexpected(spy, 'was called with', 'myBar');

		locator.register('myBaz', function () {});
		unexpected(spy, 'was called times', 3);
		unexpected(spy, 'was called with', 'myBaz');

	});

	it('should throw an error on name collision', function () {
		locator.register('myFoo', function () {});

		unexpected(function () {
			locator.register('myFoo', function () {});
		}, 'to throw', 'Name is already registered');
	});

	it('should throw an error when unregistering unknown services', function () {
		unexpected(function () {
			locator.unregister('myFoo', function () {});
		}, 'to throw', 'No registration named "myFoo"');
	});

	it('should forget unregistered service and emit events', function () {
		var spy = sinon.spy();
		locator.on('unregister', spy);

		unexpected(locator.isRegistered('myFoo'), 'to be false');

		locator.register('myFoo', function () {});
		unexpected(locator.isRegistered('myFoo'), 'to be true');

		var service = locator.get('myFoo');
		unexpected(spy, 'was not called');
		locator.unregister('myFoo');
		unexpected(locator.isRegistered('myFoo'), 'to be false');
		unexpected(spy, 'was called times', 1);
		unexpected(spy, 'was called with', 'myFoo', service);
	});

	it('should be able to list and search all service names', function () {
		unexpected(locator.names(), 'to equal', []);

		locator.register('myFoo', function () {});
		locator.register('myBar', function () {});
		locator.register('myBaz', function () {});
		unexpected(locator.names(), 'to equal', ['myFoo', 'myBar', 'myBaz']);

		unexpected(locator.names(/^my.*/), 'to equal', ['myFoo', 'myBar', 'myBaz']);
		unexpected(locator.names(/Foo$/), 'to equal', ['myFoo']);
		unexpected(locator.names(/Ba/), 'to equal', ['myBar', 'myBaz']);
	});

	it('should be able to tell if a service name is registered', function () {
		unexpected(locator.isRegistered('myFoo'), 'to be false');

		locator.register('myFoo', function () {});
		unexpected(locator.isRegistered('myFoo'), 'to be true');

		locator.unregister('myFoo');
		unexpected(locator.isRegistered('myFoo'), 'to be false');
	});

	it('should call the createrCb function once on first get and emit events', function () {
		var createrSpy = sinon.spy();
		var eventSpy = sinon.spy();
		locator.on('creation', eventSpy);
		locator.register('myFoo', createrSpy);

		unexpected(createrSpy, 'was not called');
		unexpected(eventSpy, 'was not called');

		locator.get('myFoo');
		unexpected(createrSpy, 'was called times', 1);
		unexpected(createrSpy, 'was called with', locator);
		unexpected(eventSpy, 'was called times', 1);
		unexpected(eventSpy, 'was called with', 'myFoo', locator.get('myFoo'));

		unexpected(createrSpy, 'was called times', 1);
		unexpected(eventSpy, 'was called times', 1);
	});

	it('should throw an error when service doesn\'t exist', function () {
		unexpected(function () {
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

		unexpected(function () {
			locator.get('a');
		}, 'to throw', 'Circular dependency detected (a <-> b)');
	});
});
