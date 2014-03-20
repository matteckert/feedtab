module.exports = exports = function(url) {
    url = String(url);
    return {
        toString: function() { return url; },
        addQuery: function(query) {
            var self = this;
            Object.keys(query).forEach(function(key, index) {
                url += (index === 0 && !hasQuery(url)) ? '?' : '&';
                url += encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
            });
            return this;
        }
    };
};

function hasQuery(url) { return String(url).indexOf('?') !== -1; }
