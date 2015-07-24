(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['EventEmitter'], factory);


    } else if (typeof exports === 'object') {
        module.exports = factory(require('events').EventEmitter);

    } else {
        root.Dislocator = factory(root.EventEmitter);
    }
}(this, function (EventEmitter) {
    var nameWhitelist = new RegExp('^[a-z0-9]+$', 'i');

    function Dislocator() {
        EventEmitter.call(this);
        this.registry = {};
        this.instances = {};
        this.loading = [];
    }
    Dislocator.prototype = Object.create(EventEmitter.prototype);
    Dislocator.prototype.constructor = Dislocator;

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
    };

    Dislocator.prototype.unregister = function (name) {
        if (!this.registry[name]) {
            throw new Error('No registration named "' + name + '"');
        }

        delete this.registry[name];
        this.emit('unregister', name, this.instances[name]);
        delete this.instances[name];

        return this;
    };

    Dislocator.prototype.isRegistered = function (name) {
        return !!this.registry[name];
    };

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
            throw new Error('Circular dependency detected (' + name + ' <-> ' + this.loading[this.loading.length - 1] + ')');
        }

        this.loading.push(name);

        if (!this.isRegistered(name)) {
            throw new Error('No registration named "' + name + '"');
        }

        if (!(name in this.instances)) {
            this.instances[name] = this.registry[name](this);
            this.emit('creation', name, this.instances[name]);
        }

        this.loading.pop();

        return this.instances[name];
    };

    return Dislocator;
}));
