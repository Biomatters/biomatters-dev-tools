// Currently this only works on the issue page itself. Will look into allowing on dashboards and/or kanban boards later. Perhaps a setting for it?
var title = document.getElementById("summary-val");
var anchor = document.createElement("a");
anchor.setAttribute("id", "jira-grabber-button");
anchor.setAttribute("href", "#");
var img = document.createElement("img");
img.setAttribute("src", chrome.extension.getURL("jira-grab/icons/link.png"));
img.setAttribute("alt", "Click to copy issue key and summary");
img.setAttribute("aria-label", "Copy issue key and summary");
img.style.marginTop = "4px";
img.style.marginLeft = "4px";
img.addEventListener("click", function () {
    try {
        var copySupported = document.queryCommandSupported("copy");
        if (copySupported === true) {
            var parsedIssue = parseIssue(); // change me when support for pages outside the issue page are done
            if(parsedIssue !== "") {
                console.log("Parsed as \"" + parsedIssue + "\"");
                // can't copy in a content script, have to dispatch to the background page to do this
                var status = execCopy(parsedIssue);
                console.log(status);
                if (status === true) {
                    displayNotification({"type": "notify", "status": "success", "text": parsedIssue});
                } else {
                    console.error("Failed to copy");
                }
            } else {
                console.error("Failed to parse issue because the key or summary fields were not found. " +
                              "Expected #key-val or #issuekey-val, and #summary-val");
            }
        } else {
            console.error("Copy command not supported.");
        }
    } catch (err) {
        console.error("Unable to copy to clipboard. Here's the error reported: " + err);
    }
});

anchor.appendChild(img);
title.parentNode.appendChild(anchor);

/**
 * Parse the issue key and summary.
 *
 * @return string the parsed issue string or empty string if one of the fields were not found
 */
function parseIssue() {
    var key, summary;
    if (document.getElementById("key-val") !== null) {
        key = document.getElementById("key-val").textContent.trim();
    } else if (document.getElementById("issuekey-val") !== null) {
        key = document.getElementById("key-val").textContent.trim();
    } else {
        return "";
    }
    if(document.getElementById("summary-val") !== null) {
        summary = document.getElementById("summary-val").textContent.trim();
    } else {
        return "";
    }
    return [key, summary].join(" ");
}

function execCopy(text) {
    var copySupported = document.queryCommandSupported("copy");
    if (copySupported === false) {
        console.error("Copy is not supported");
    }
    var textArea = document.createElement("textarea");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.value = text;
    textArea.select();
    var success = document.execCommand("Copy");

    textArea.remove();
    return success;
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
    // At first, let's check if we have permission for notification
    // If not, let's ask for it
    if (window.Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
});