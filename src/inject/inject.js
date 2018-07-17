chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		if (document.location.host == "itty.bitty.site") {
			console.log("found")
			var container = document.getElementById("content")
			// console.log()
			
			var port = chrome.runtime.connect({ name: "ready" });
			port.onMessage.addListener((msg) => {
				console.log(msg)
				if (msg.data) {
					let html = `
						<style>
						.tag {
						    display: inline-block;
						    color: white;
						    background: #21e09e;
						    padding: 3px 5px;
						    margin: 2px 2px;
						    top: 6px;
						    border-radius: 4px; }
						</style>
						<h1>${msg.data.description}</h1>
						<a href="${msg.data.url}" id="url">${msg.data.url}<a>
					`
					if (msg.data.tags.length > 0) {
						html += `<div id="tags">`
						for (var i = 0; i < msg.data.tags.length; i++) {
							html += `<span class="tag">${msg.data.tags[i].name}</span>`
						}
						html += `</div>`
					}
					if (msg.data.clipping) {
						html += `<blockquote>${msg.data.clipping}</blockquote>`
					}
					container.innerHTML = html
					// container.dispatchEvent(new Event('change'))
					var customEvent;
					var type = 'keydown';
					var bubbles = true;
					var cancelable = true;
					var view = window;
					var ctrlKey = false;
					var altKey = false;
					var shiftKey = false;
					var metaKey = false;
					var keyCode = 40;
					var charCode = 40;

					container.createEvent("KeyEvents")
					customEvent.initKeyEvent(type, bubbles, cancelable, view, ctrlKey,
						        altKey, shiftKey, metaKey, keyCode, charCode);

					var title = document.getElementById("doc-title")
					title.innerHTML = msg.data.description

				}
			})

			// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			// 	console.log(request)
			//     if (request.data) {
			//     	container.innerHTML = request.data
			//     }
			//   });
		}		

	}
	}, 10);
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(request, sender)
  	if (request.method == "getSelection")
    	sendResponse({ data: window.getSelection().toString() });
  	else
    	sendResponse({}); // snub them.
});