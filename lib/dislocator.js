var EventEmitter = require('events').EventEmitter;
var util = require('util');
var nameWhitelist = new RegExp('^[a-z0-9]+$', 'i');

function Dislocator() {
	EventEmitter.call(this);
	this.registry = {};
	this.instances = {};
	this.loading = [];
}
util.inherits(Dislocator, EventEmitter);

Dislocator.prototype.register = function (name, creatorCb) {
	if (!nameWhitelist.test(name)) {
		throw new Error('Invalid name');
	}

	if (this.registry[name]) {
		throw new Error('Name is already registered');
	}

	this.registry[name] = creatorCb;
	this.emit('register', name);

	return this;
}

Dislocator.prototype.unregister = function (name) {
	if (!this.registry[name]) {
		throw new Error('No registration named "' + name + '"');
	}

	delete this.registry[name];
	this.emit('unregister', name, this.instances[name]);
	delete this.instances[name];

	return this;
}

Dislocator.prototype.isRegistered = function (name) {
	return !!this.registry[name];
}

Dislocator.prototype.names = function(regex) {
	var names = Object.keys(this.registry);

	if (regex) {
		names = names.filter(function (name) {
			return name.match(regex);
		});
	}

	return names;
};

Dislocator.prototype.get = function (name) {
	if (this.loading.indexOf(name) !== -1) {
		throw new Error('Circular dependency detected (' + name + ' <-> ' + this.loading[this.loading.length] + ')');
	}

	this.loading.push(name);

	if (!this.isRegistered(name)) {
		throw new Error('No registration named "' + name + '"');
	}

	if (!this.instances[name]) {
		this.instances[name] = this.registry[name](this);
		this.emit('creation', name, this.instances[name]);
	}
	
	this.loading.pop();

	return this.instances[name];
};

exports = module.exports = Dislocator;
