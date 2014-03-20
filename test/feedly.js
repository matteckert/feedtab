require('should');
var proxyquire = require('proxyquire');
var feedly = proxyquire('../src/feedly', {
    './restquest': function() {
        var args = arguments[0];
        return {
            send: function(callback) {
                callback(null, args, true);
            }
        };
    }
})();

describe('feedly', function() {
    describe('authurl', function() {
        it('should exist', function() {
            feedly.authurl().should.be.type('string');
        });
    });

    describe('token', function() {
        var details = { code: 'someCode' };

        it('should require code', function() {
            feedly.token.should.throw(/code/);
        });
        
        it('should use POST', function(done) {
            feedly.token(details, function(err, data) {
                data.should.have.property('method', 'POST');
                done();
            });
        });
        
        it('should use the right URL', function(done) {
            feedly.token(details, function(err, data) {
                data.should.have.property('url');
                data.url.should.endWith('/v3/auth/token');
                done();
            });
        });
        
        it('should pass client information', function(done) {
            feedly.token(details, function(err, data) {
                data.should.have.property('query');
                data.query.should.have.property('client_id');
                data.query.should.have.property('client_secret');
                done();
            });
        });
        
        it('should redirect to localhost', function(done) {
            feedly.token(details, function(err, data) {
                data.should.have.property('query');
                data.query.should.have.property('redirect_uri', 'http://localhost');
                done();
            });
        });
        
        it('should have the right grant_type', function(done) {
            feedly.token(details, function(err, data) {
                data.should.have.property('query');
                data.query.should.have.property('grant_type', 'authorization_code');
                done();
            });
        });
    });
    
    describe('refresh', function() {
        var details = { refresh_token: 'someRefreshToken' };
        
        it('should require a refresh_token', function() {
            feedly.refresh.bind(null, {}).should.throw(/refresh_token/);
        });
        
        it('should use the right URL', function(done) {
            feedly.refresh(details, function(err, data) {
                data.should.have.property('url');
                data.url.should.endWith('/v3/auth/token');
                done();
            });
        });
        
        it('should pass client information', function(done) {
            feedly.refresh(details, function(err, data) {
                data.should.have.property('query');
                data.query.should.have.property('client_id');
                data.query.should.have.property('client_secret');
                done();
            });
        });
        
        it('should have the right grant_type', function(done) {
            feedly.refresh(details, function(err, data) {
                data.should.have.property('query');
                data.query.should.have.property('grant_type', 'refresh_token');
                done();
            });
        });
    });
    
    describe('logout', function() {
        var details = { refresh_token: 'someRefreshToken' };
        
        it('should require a refresh_token', function() {
            feedly.logout.bind(null, {}).should.throw(/refresh_token/);
        });
        
        it('should use the right URL', function(done) {
            feedly.logout(details, function(err, data) {
                data.should.have.property('url');
                data.url.should.endWith('/v3/auth/token');
                done();
            });
        });
        
        it('should pass client information', function(done) {
            feedly.logout(details, function(err, data) {
                data.should.have.property('query');
                data.query.should.have.property('client_id');
                data.query.should.have.property('client_secret');
                done();
            });
        });
        
        it('should have the right grant_type', function(done) {
            feedly.logout(details, function(err, data) {
                data.should.have.property('query');
                data.query.should.have.property('grant_type', 'revoke_token');
                done();
            });
        });
    });
    
    describe('count', function() {
        var details = {
            access_token: 'someToken',
            user_id: 'someUserId'
        };
        
        it('should require access_token', function() {
            feedly.count.bind(null, {userid: ''}).should.throw(/access_token/);
        });

        it('should require user_id', function() {
            feedly.count.bind(null, {access_token: ''}).should.throw(/user_id/);
        });
        
        it('should use the right URL', function(done) {
            feedly.count(details, function(err, data) {
                data.should.have.property('url');
                data.url.should.endWith('/v3/markers/counts');
                done();
            });
        });
        
        it('should call send() of restquest', function(done) {
            feedly.count(details, function(err, data, sendCalled) {
                sendCalled.should.equal(true);
                done();
            });
        });
        
        it('should autorefresh', function(done) {
            feedly.count(details, function(err, data) {
                data.should.have.property('query');
                data.query.should.have.property('autorefresh', true);
                done();
            });
        });
        
        it('should use the global streamId', function(done) {
            feedly.count(details, function(err, data) {
                data.should.have.property('query');
                data.query.should.have.property(
                    'streamId', 'user/' + details.user_id + '/category/global.all'
                );
                done();
            });
        });
        
        it('should authorize', function(done) {
            feedly.count(details, function(err, data) {
                data.should.have.property('headers');
                data.headers.should.have.property(
                    'Authorization', 'OAuth ' + details.access_token
                );
                done();
            });
        });
        
        it('should have a GET method', function(done) {
            feedly.count(details, function(err, data) {
                data.should.have.property('method', 'GET');
                done();
            });
        });
    });
    
    describe('items', function() {
        var details = {
            access_token: 'someToken',
            user_id: 'someUserId',
            count: 10,
            ranked: 'oldest'
        };
        
        it('should require access_token', function() {
            feedly.items.bind(null, {user_id: '', count: 0, ranked: ''}).should.throw(/access_token/);
        });

        it('should require user_id', function() {
            feedly.items.bind(null, {access_token: '', count: 0, ranked: ''}).should.throw(/user_id/);
        });
        
        it('should require count', function() {
            feedly.items.bind(null, {user_id: '', access_token: '', ranked: ''}).should.throw(/count/);
        });

        it('should require ranked', function() {
            feedly.items.bind(null, {access_token: '', user_id: '', count: 0}).should.throw(/ranked/);
        });
        
        it('should use the right URL', function(done) {
            feedly.items(details, function(err, data) {
                data.should.have.property('url');
                data.url.should.endWith('/v3/streams/contents');
                done();
            });
        });
        
        it('should call send() of restquest', function(done) {
            feedly.items(details, function(err, data, sendCalled) {
                sendCalled.should.equal(true);
                done();
            });
        });
        
        it('should get unread items only', function(done) {
            feedly.items(details, function(err, data) {
                data.should.have.property('query');
                data.query.should.have.property('unreadOnly', true);
                done();
            });
        });
        
        it('should use the global streamId', function(done) {
            feedly.items(details, function(err, data) {
                data.should.have.property('query');
                data.query.should.have.property(
                    'streamId', 'user/' + details.user_id + '/category/global.all'
                );
                done();
            });
        });
        
        it('should authorize', function(done) {
            feedly.items(details, function(err, data) {
                data.should.have.property('headers');
                data.headers.should.have.property(
                    'Authorization', 'OAuth ' + details.access_token
                );
                done();
            });
        });
        
        it('should have a GET method', function(done) {
            feedly.items(details, function(err, data) {
                data.should.have.property('method', 'GET');
                done();
            });
        });
    });
    
    describe('read', function() {
        var details = {
            access_token: 'someToken',
            ids: []
        };
        
        it('should require access_token', function() {
            feedly.read.bind(null, {ids: ''}).should.throw(/access_token/);
        });
        
        it('should require ids array', function() {
            feedly.read.bind(null, {access_token: ''}).should.throw(/ids/);
        });
        
        it('should use the right URL', function(done) {
            feedly.read(details, function(err, data) {
                data.should.have.property('url');
                data.url.should.endWith('/v3/markers');
                done();
            });
        });
        
        it('should call send() of restquest', function(done) {
            feedly.read(details, function(err, data, sendCalled) {
                sendCalled.should.equal(true);
                done();
            });
        });

        it('should send data', function(done) {
            feedly.read(details, function(err, data) {
                data.should.have.property('data');
                done();
            });
        });
        
        it('should authorize', function(done) {
            feedly.read(details, function(err, data) {
                data.should.have.property('headers');
                data.headers.should.have.property(
                    'Authorization', 'OAuth ' + details.access_token
                );
                done();
            });
        });
        
        it('should be a POST method', function(done) {
            feedly.read(details, function(err, data) {
                data.should.have.property('method', 'POST');
                done();
            });
        });
    });
});
