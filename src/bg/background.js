// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

console.log("Ready!")

//example of using a message handler from the inject scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.message == "open") {
		var title = request.data.description.split(" ").join("_").toLowerCase()
		console.log(request.data)
		chrome.tabs.create({
			url: "https://itty.bitty.site/",
			active: true
		}, (tab) => {
			chrome.runtime.onConnect.addListener((port) => {
				port.onMessage.addListener((msg) => {
					console.log(msg)
					if (msg.message == "ready") {
						port.postMessage({ data: request.data })
					}
					if (msg.message == "done") {
						console.log(msg)
					}
					// if (msg.message == "getSelection") {
					// 	console.log("getSelection")
					// 	port.postMessage(msg)
					// }
					// if (msg.message == "selection") {
					// 	console.log("selection")
					// 	port.postMessage(msg)
					// }
				})
			})
		})
	}
});