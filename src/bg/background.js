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
				console.log(port)
				if (port.name == "ready") {
					port.postMessage({ data: request.data })
				}
			})
		})
	}
  });