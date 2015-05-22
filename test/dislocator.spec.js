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

	it('should be able to register', function () {
		locator.register('myFoo', function (locator) {
			return 'bar';
		});

		unexpected(locator.get('myFoo'), 'to equal', 'bar');
	});

	it('should throw an error on name collision', function () {
		locator.register('myFoo', function () {});

		unexpected(function () {
			locator.register('myFoo', function () {});
		}, 'to throw', 'Name is already registered');
	});

	it('should emit events');

});
