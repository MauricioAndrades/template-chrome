/*
 * Injects listener for extension keyboard shortcuts in to page context as well
 * as creating a listener for providing the background page with information
 * on the current selection.
 */
(function () {
    var isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1;
    // Only adds listeners if previous injection isn't detected
    if (document.body.hasAttribute('template_content_injected')) {
        return;
    }
    document.body.setAttribute('template_content_injected', true);
    window.addEventListener('keyup', function (e) {
        if ((!isMac && e.ctrlKey && e.altKey) ||
                (isMac && e.shiftKey && e.altKey)) {
            chrome.extension.sendRequest({
                data: {
                    key: String.fromCharCode(e.keyCode).toUpperCase()
                },
                type: 'shortcut'
            });
        }
    });
    chrome.extension.onRequest.addListener(function (request, sender,
            sendResponse) {
        var anchors,
            data = {
                text: '',
                urls: []
            },
            contents,
            selection = window.getSelection();
        data.text = selection.toString();
        if (selection.rangeCount > 0) {
            contents = selection.getRangeAt(0).cloneContents();
            if (contents) {
                anchors = contents.querySelectorAll('a[href]');
                for (var i = 0; i < anchors.length; i++) {
                    data.urls.push(anchors[i].href);
                }
            }
        }
        sendResponse(data);
    });
})();