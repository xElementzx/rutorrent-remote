browser.contextMenus.create({
    id: "upload-to-rutorrent",
    title: "Upload to ruTorrent",
    contexts: ["link"],
});

function notify(message) {
    browser.notifications.create('', { type: "basic", title: "ruTorrent Remote", message: message});
}

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "upload-to-rutorrent") {
        browser.storage.local.get(function (options) {
            if (options.url == null) {
                notify("Goto Add-ons -> ruTorrent Remote -> Options and set the options.");
                return;
            }

            var request = new XMLHttpRequest();
            request.responseType = 'blob';
            request.open('GET', info.linkUrl, true);

            request.onreadystatechange = function () {
                if (request.readyState !== XMLHttpRequest.DONE) 
                    return;    
                if (!/\.torrent/.test(request.getAllResponseHeaders())) {
                    notify("Unable to determine whether file is a torrent");
                    return;
                }

                notify("Uploading Torrent");
                var formData = new FormData();
                formData.append('torrent_file', request.response, (Math.random() * request.response.size).toString() + ".torrent");

                var r = new XMLHttpRequest();
                r.timeout = 5000;
                
                var url = 'https://';
                var htmlAuth = options.username + ':' + options.password + '@';
                if (options.username.length > 0)
                    url += htmlAuth;
                url += options.url;
                
                r.open('POST', url + '/php/addtorrent.php', true);
                r.onload = function() {
                    notify("Successfully uploaded");
                }
                r.ontimeout = function(e) {
                    notify("Timed out trying to upload")
                }
                r.send(formData);
            };

            request.send(null);
        });
    }
});
