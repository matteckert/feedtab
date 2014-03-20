Object.defineProperty(Object.prototype, 'spawn', {
    value: function() {
        return Object.create(this, descriptors.apply(this, arguments));
    }
});

Object.defineProperty(Object.prototype, 'extend', {
    value: function() {
        return Object.defineProperties(this, descriptors.apply(this, arguments));
    }
});

var descriptors = function() {
    var d = {};
    [].slice.call(arguments).forEach(function(o) {
        if (o instanceof Object) {
            Object.keys(o).forEach(function(k) {
                d[k] = {
                    configurable: true,
                    enumerable: true,
                    value: o[k],
                    writeable: true
                };
            });
        }
    });
    return d;
};
