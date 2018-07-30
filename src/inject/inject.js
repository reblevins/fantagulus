chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);

			var port = chrome.runtime.connect({ name: "ready" });
			port.postMessage({ message: "ready" })
			port.onMessage.addListener((msg) => {
				console.log(msg)
				if (document.location.host == "itty.bitty.site" && msg.data) {
					console.log("found")
					var container = document.getElementById("content")
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
						</style>\n
						<h1>${msg.data.description}</h1>\n
						<a href="` + msg.data.url + `" id="url">` + msg.data.url + `</a>\n`
					if (msg.data.tags.length > 0) {
						html += `<div id="tags">`
						for (var i = 0; i < msg.data.tags.length; i++) {
							html += `<span class="tag">${msg.data.tags[i].name}</span>`
						}
						html += `</div>\n`
					}
					if (msg.data.clipping) {
						html += `<blockquote>${msg.data.clipping}</blockquote>`
					}
					console.log(html)
					container.innerHTML = html

					var title = document.getElementById("doc-title")
					title.innerHTML = msg.data.description

					container.dispatchEvent(new KeyboardEvent('keyup',{'which': 16}))
					container.dispatchEvent(new Event('change'))
					title.focus()
					title.dispatchEvent(new KeyboardEvent('keyup',{'which': 16}))
					title.dispatchEvent(new Event('change'))

					setTimeout(() => {
						port.postMessage({ message: "done", url: document.location })
					}, 1000)
				}
				if (msg.message && msg.message == "getSelection") {
					port.postMessage({ message: "selection", data: window.getSelection().toString() });
				}
			})
			chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
			  	if (request.message == "getSelection") {
			  		console.log("getSelection", window.getSelection().toString())
			    	sendResponse({ data: window.getSelection().toString() });
			  	} else {
			    	sendResponse({}); // snub them.
			  	}
			});
		}
	}, 10);
});