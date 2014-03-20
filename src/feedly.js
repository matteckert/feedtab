require('./extend');
var restquest = require('./restquest');
var optcheck = require('optcheck');
var url = require('./url');

module.exports = exports = function() {
    return feedly.spawn.apply(feedly, arguments);
};

var feedly = {
    url: 'https://sandbox.feedly.com',
    client_id: 'sandbox',
    client_secret: 'W60IW73DYSUIISZX4OUP',
    
    authurl: function() {
        return String(url(this.url + '/v3/auth/auth').addQuery({
            response_type: 'code',
            client_id: this.client_id,
            redirect_uri: 'http://localhost',
            scope: 'https://cloud.feedly.com/subscriptions'
        }));
    },
    
    token: function(details, callback) {
        optcheck(details).requires(['code']);
        restquest({
            url: this.url + '/v3/auth/token',
            method: 'POST',
            query: {
                code: details.code,
                client_id: this.client_id,
                client_secret: this.client_secret,
                redirect_uri: 'http://localhost',
                grant_type: 'authorization_code'
            }
        }).send(callback);
    },
    
    refresh: function(details, callback) {
        optcheck(details).requires(['refresh_token']);
        restquest({
            url: this.url + '/v3/auth/token',
            method: 'POST',
            query: {
                refresh_token: details.refresh_token,
                client_id: this.client_id,
                client_secret: this.client_secret,
                grant_type: 'refresh_token'
            }
        }).send(callback);
    },
    
    logout: function(details, callback) {
        optcheck(details).requires(['refresh_token']);
        restquest({
            url: this.url + '/v3/auth/token',
            method: 'POST',
            query: {
                refresh_token: details.refresh_token,
                client_id: this.client_id,
                client_secret: this.client_secret,
                grant_type: 'revoke_token'
            }
        }).send(callback);
    },
    
    items: function(details, callback) {
        optcheck(details).requires(['access_token', 'user_id', 'count', 'ranked']);
        restquest({
            url: this.url + '/v3/streams/contents',
            method: 'GET',
            headers: {
                'Authorization': 'OAuth ' + details.access_token
            },
            query: {
                streamId: 'user/' + details.user_id + '/category/global.all',
                count: details.count,
                ranked: details.ranked,
                unreadOnly: true
            }
        }).send(callback);
    },
    
    count: function(details, callback) {
        optcheck(details).requires(['access_token', 'user_id']);
        restquest({
            url: this.url + '/v3/markers/counts',
            method: 'GET',
            headers: {
                'Authorization': 'OAuth ' + details.access_token
            },
            query: {
                autorefresh: true,
                streamId: 'user/' + details.user_id + '/category/global.all'
            }
        }).send(callback);
    },
    
    read: function(details, callback) {
        optcheck(details).requires(['ids', 'access_token']);
        restquest({
            url: this.url + '/v3/markers',
            method: 'POST',
            headers: {
                'Authorization': 'OAuth ' + details.access_token
            },
            data: JSON.stringify({
                type: 'entries',
                action: 'markAsRead',
                entryIds: details.ids
            })
        }).send(callback);
    }
};
