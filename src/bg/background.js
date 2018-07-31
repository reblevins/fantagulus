// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });
const db = new Dexie('Fantagulus');

db.version(1).stores({
    bookmarks: `++bookmarkId, *tags, title, &url, dateCreated`
})

chrome.runtime.onInstalled.addListener(() => {
	console.log("Ready!")

	// db.bookmarks.put({
	// 	title: 'Web development',
	// 	tags: ['web', 'development', 'dexie'],
	// 	url: 'http://dexie.org/docs/Tutorial/Getting-started',
	// 	clippings: ['Dexie.js can be consumed as a module. But let’s skip that for now and just show the simplest possible setup. You will just need a text editor and a web browser.'],
	// 	dateCreated: moment().format('YYYY-MM-DD HH:MM:SS')
	// })
})

chrome.runtime.onConnect.addListener(port => {
	port.onMessage.addListener(obj => {
		console.log(obj)
		if (obj.msg == 'get_all') {
			db.bookmarks.toArray().then(bookmarks => {
				port.postMessage({ bookmarks: bookmarks })
			})
		}
		if (obj.msg == 'put') {
			let bookmark = obj.bookmark
			if (bookmark.bookmarkId) {
				console.log("bookmarkId present")
				db.bookmarks.put(bookmark, bookmark.bookmarkId).then(() => {
					db.bookmarks.toArray().then(bookmarks => {
						port.postMessage({ bookmarks: bookmarks })
					})
				})
			} else {
				db.bookmarks.put(bookmark).then(() => {
					db.bookmarks.toArray().then(bookmarks => {
						port.postMessage({ bookmarks: bookmarks })
					})
				})
			}
		}
	})
})

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

var app = new Vue({
	el: '#app',
    data: {
    	db: db,
        bookmark: {
            // bookmarkId: null,
            url: document.location.url,
            tags: [
                { name: 'tag' }
            ],
            title: null,
            clipping: null
        },
        bookmarks: [],
        newTag: {
            name: null
        },
        message: null,
        port: null
    },
    created() {
    	db.bookmarks.toArray().then(bookmarks => {
			this.bookmarks = bookmarks
		})
    }
})
