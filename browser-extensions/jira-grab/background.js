var urlRegex = /^https:\/\/biomatters.atlassian.net\/(secure|browse)\/(RapidBoard.jspa)?.*/;

// NOTE:
// logging here is lost because it only shows on the background page
chrome.browserAction.onClicked.addListener(function(tab) {
    var msg;
    if(urlRegex.test(tab.url)) {
        chrome.tabs.sendMessage(tab.id, {
            "type": "inject",
            "text": tab.url
        }, function(response) {
            msg = response;
            if(msg) {
                switch (msg.type) {
                    case "error":
                        console.error("Error occurred: " + msg.text);
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                            chrome.tabs.sendMessage(tabs[0].id, {"type": "notify", "status": "error", "text": msg.text}, function(msg) {});
                        });
                        break;
                    case "copy":
                        var textArea = document.createElement("textarea");
                        textArea.value = msg.text;
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        var success = document.execCommand("copy");
                        textArea.remove();

                        if (success) {
                            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
                                chrome.tabs.sendMessage(tabs[0].id, {"type": "notify", "status": "success", "text": msg.text}, function(msg) {});
                            });
                        }
                        break;
                }
            } else {
                console.error("Response was invalid, was " + msg +", type: " + msg.type +", text: " + msg.text);
            }
        });
    }
    return true;
});