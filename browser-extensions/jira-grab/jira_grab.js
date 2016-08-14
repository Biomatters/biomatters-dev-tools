// receives message from the browser action
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    switch(msg.type) {
        case "inject":
            try {
                var copySupported = document.queryCommandSupported("copy");
                if (copySupported === true) {
                    var onIssuePage = msg.text.indexOf("/browse/") > 0;
                    if (!onIssuePage && msg.text.indexOf("selectedIssue=") == -1) {
                        sendResponse({"type": "error", "text": "Unable to copy to clipboard. Here's the error reported: Can't determine issue when on Kanban board without a selected issue."});
                    }
                    var parsedIssue = parseIssue(onIssuePage);
                    console.log("Parsed as \"" + parsedIssue + "\", sending response");
                    sendResponse({"type": "copy", "text": parsedIssue});

                } else {
                    console.error("Copy command not supported.");
                    sendResponse({"type": "error", "text": "Copy command not supported."});
                }
            } catch (err) {
                console.error("Unable to copy to clipboard. Here's the error reported: " + err);
                sendResponse({"type": "error", "text": "Unable to copy to clipboard. Here's the error reported: " + err});
            }
            break;
        case "notify":
            displayNotification(msg);
            break;
    }
    return true;
});

/**
 * Parse the issue key and summary.
 *
 * @param {boolean} issuePage true if on the issue page, false if on the board and the side panel is open
 * @return string the parsed issue string
 */
function parseIssue(issuePage) {
    var key, summary;
    if(issuePage) {
        key = document.getElementById("key-val").textContent.trim();
        summary = document.getElementById("summary-val").textContent.trim();
    } else {
        var selection = document.getElementsByClassName("ghx-selected");
        var issueFields = selection[0].getElementsByClassName("ghx-issue-fields")[0];
        key = issueFields.getElementsByClassName("ghx-key")[0].innerText;
        summary = issueFields.getElementsByClassName("ghx-summary")[0].innerText;
    }
    return [key, summary].join(" ");
}

function displayNotification(msg) {
    var n;
    if (window.Notification && window.Notification.permission === "granted") {
        if (msg.status === "success") {
            n = new Notification("Copied to clipboard: " + msg.text);
        } else {
            n = new Notification("Failed to copy to clipboard.");
        }
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            if (permission === "granted") {
                if (msg.status === "success") {
                    n = new Notification("Copied to clipboard: " + msg.text);
                } else {
                    n = new Notification("Failed to copy to clipboard.");
                }
            }
        });
    }
    setTimeout(n.close.bind(n), 3000);
}

window.addEventListener('load', function () {
    //todo see MDN for Firefox version
    // At first, let's check if we have permission for notification
    // If not, let's ask for it
    if (window.Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
});