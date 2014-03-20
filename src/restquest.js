var url = require('./url');

module.exports = exports = function() {
    return restquest.extend.apply(restquest, arguments);
};

var restquest = {
    method: 'GET',
    query: {},
    headers: {},
    url: 'http://localhost',
    type: 'json',
    data: null,
    send: function(callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if (typeof callback == 'function') {
                    if (request.status === 200) {
                        callback(null, request.response);
                    } else {
                        var error = new Error(request.status + ': ' + request.statusText);
                        error.status = request.status;
                        error.statusText = request.statusText;
                        callback(error);
                    }
                }
            }
        };
        request.open(this.method, String(url(this.url).addQuery(this.query)));
        var headers = this.headers;
        Object.keys(headers).forEach(function(key) {
            request.setRequestHeader(key, headers[key]);
        });
        request.responseType = this.type;
        request.send(this.data);
    }
};
