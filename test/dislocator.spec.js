const Dislocator = require("../lib/dislocator");
const expect = require("unexpected")
  .clone()
  .use(require("unexpected-sinon"));
const sinon = require("sinon");

let locator;

beforeEach(() => {
  locator = new Dislocator();
});

it("should have no registrations when new", () => {
  expect(locator.names(), "to be empty");
});

["my-foo", "my_bar", "my:baz"].forEach(invalidName => {
  it(`should reject invalid names like "${invalidName}"`, () => {
    expect(
      () => locator.register(invalidName, () => {}),
      "to throw",
      `Invalid service name: "${invalidName}"`
    );
  });
});

it("should be able to register a service", () => {
  locator.register("myFoo", () => "bar");

  expect(locator.get("myFoo"), "to equal", "bar");
});

it("should be able to register a simple value", () => {
  locator.register("foo", { foo: "bar" });

  expect(locator.get("foo"), "to equal", { foo: "bar" });
});

it("should throw an error on name collision", () => {
  locator.register("myFoo", () => {});

  expect(
    () => locator.register("myFoo", () => {}),
    "to throw",
    'A service called "myFoo" is already registered.'
  );
});

it("should throw an error when unregistering unknown services", () => {
  expect(
    () => locator.unregister("myFoo", () => {}),
    "to throw",
    'No registration named "myFoo"'
  );
});

it("should forget unregistered service", () => {
  expect(locator.isRegistered("myFoo"), "to be false");

  locator.register("myFoo", () => {});
  expect(locator.isRegistered("myFoo"), "to be true");

  locator.unregister("myFoo");
  expect(locator.isRegistered("myFoo"), "to be false");
});

it("should be able to list and search all service names", () => {
  expect(locator.names(), "to equal", []);

  locator.register("myFoo", () => {});
  locator.register("myBar", () => {});
  locator.register("myBaz", () => {});
  expect(locator.names(), "to equal", ["myFoo", "myBar", "myBaz"]);

  expect(locator.names(/^my.*/), "to equal", ["myFoo", "myBar", "myBaz"]);
  expect(locator.names(/Foo$/), "to equal", ["myFoo"]);
  expect(locator.names(/Ba/), "to equal", ["myBar", "myBaz"]);
});

it("should be able to tell if a service name is registered", () => {
  expect(locator.isRegistered("myFoo"), "to be false");

  locator.register("myFoo", () => {});
  expect(locator.isRegistered("myFoo"), "to be true");

  locator.unregister("myFoo");
  expect(locator.isRegistered("myFoo"), "to be false");
});

it("should call the createrCb function once on first get", () => {
  var serviceProviderSpy = sinon.spy(() => "myServiceValue");

  locator.register("myFoo", serviceProviderSpy);

  expect(serviceProviderSpy, "was not called");

  locator.get("myFoo");
  expect(serviceProviderSpy, "was called once");

  locator.get("myFoo");
  locator.get("myFoo");
  locator.get("myFoo");

  expect(serviceProviderSpy, "was called once");
});

it("should throw an error when service doesn't exist", () => {
  expect(
    () => locator.get("non-existing-service"),
    "to throw",
    'No registration named "non-existing-service"'
  );
});

it("should detect circular dependency", () => {
  locator.register("a", locator => locator.get("b"));
  locator.register("b", locator => locator.get("a"));

  expect(
    () => locator.get("a"),
    "to throw",
    "Circular dependency detected (a -> b -> a)"
  );
});

it("should detect circular dependency with more than 2 services", () => {
  locator.register("a", locator => locator.get("b"));
  locator.register("b", locator => locator.get("c"));
  locator.register("c", locator => locator.get("a"));

  expect(
    () => locator.get("a"),
    "to throw",
    "Circular dependency detected (a -> b -> c -> a)"
  );
});

it("should get services as members on the object", () => {
  const value = "a";
  const initFn = () => value;

  expect(locator.a, "to be", undefined);

  locator.register("a", initFn);
  expect(locator.a, "to be", value);

  locator.unregister("a");
  expect(locator.a, "to be", undefined);
});

describe("#use", () => {
  it("should allow registering a service in a .use method", () => {
    locator.use(locator => {
      locator.register("foo", () => "bar");
    });

    expect(locator.isRegistered("foo"), "to be true");
  });

  it("should allow registering services in more .use method", () => {
    locator
      .use(locator => {
        locator.register("foo", () => "bar");
      })
      .use(locator => {
        locator.register("bar", () => "baz");
      });

    expect(locator.isRegistered("foo"), "to be true");
    expect(locator.isRegistered("bar"), "to be true");
  });

  it("should allow registering services in a .use method", () => {
    locator.use(locator => {
      locator.register("foo", () => "bar").register("bar", () => "baz");
    });

    expect(locator.isRegistered("foo"), "to be true");
    expect(locator.isRegistered("bar"), "to be true");
  });
});
