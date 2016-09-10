// NOTE: logging here is lost because it only shows on the background page
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request) {
        switch (request.action) {
            case "error":
                console.error("Error occurred: " + request.text);
                sendResponse({"type": "notify", "status": "error", "text": request.text});
                break;
            case "copy":
                var textArea = document.createElement("textarea");
                textArea.value = request.parsedIssue;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                var success = document.execCommand("copy");
                textArea.remove();

                if (success) {
                    sendResponse({"type": "notify", "status": "success", "text": request.text});
                }
                break;
        }
    } else {
        console.error("Request was invalid: failed the `if(request)` check. Was " + request +", type: " + request.type +", text: " + request.text);
    }
});