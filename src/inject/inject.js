// chrome.extension.sendMessage({}, function(response) {
// 	var readyStateCheckInterval = setInterval(function() {
// 	if (document.readyState === "complete") {
// 		clearInterval(readyStateCheckInterval);

// 		// ----------------------------------------------------------
// 		// This part of the script triggers when page is done loading
// 		console.log("Hello. This message was sent from scripts/inject.js");
// 		// ----------------------------------------------------------

// 	}
// 	}, 10);
// });

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(request, sender)
  	if (request.method == "getSelection")
    	sendResponse({ data: window.getSelection().toString() });
  	else
    	sendResponse({}); // snub them.
});