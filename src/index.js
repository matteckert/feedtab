var feedly = require('./feedly.js')();

chrome.alarms.create('badge', {
    when: Date.now(),
    periodInMinutes: 1
});

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'badge') updateBadge();
});

function updateBadge() {
    chrome.storage.sync.get(null, function(data) {
        if (!data.user_id) return;
        feedly.count({
            user_id: data.user_id, 
            access_token: data.access_token
        }, function(err, response) {
            if (err) return; // TODO
            var num = response.unreadcounts.length;
            var count = response.unreadcounts[num-1].count;
            if (count === 0) count = '';
            chrome.browserAction.setBadgeText({
                text: String(count) 
            });
        });
    });
}

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.storage.sync.get(null, function(data) {
        if (!data.user_id) {
            chrome.windows.create({
                url: feedly.authurl(),
                type: 'popup',
                width: 600,
                height: 650
            }, function(window) {
                chrome.tabs.onUpdated.addListener(function(id, tabdata, tab) {
                    if (id === window.tabs[0].id && tabdata.url) {
                        var match = tabdata.url.match(/code=([^&]*)/);
                        if (!match) return;
                        feedly.token({
                            code: match[1]
                        }, function(err, response) {
                            if (err) return; // TODO
                            chrome.storage.sync.set({
                                user_id: response.id,
                                access_token: response.access_token,
                                refresh_token: response.refresh_token
                            }, function() {
                                chrome.windows.remove(window.id);
                            });
                        });
                    }
                });
            });
        } else {
            feedly.items({
                user_id: data.user_id,
                access_token: data.access_token,
                count: 5,
                ranked: 'oldest'
            }, function(err, response) {
                if (err) return; // TODO
                var itemUrls = [];
                var itemIds = [];
                response.items.forEach(function(item) {
                    if (item.alternate && item.alternate[0] && item.alternate[0].href) {
                        itemUrls.push(item.alternate[0].href);
                        itemIds.push(item.id);
                    }
                });
                feedly.read({
                    ids: itemIds,
                    access_token: data.access_token
                }, function(err, response) {
                    if (err) return; // TODO
                    itemUrls.forEach(function(itemUrl) {
                        chrome.tabs.create({ url: itemUrl, active: false });
                    });
                    updateBadge();
                });
            });
        }
    });
});

