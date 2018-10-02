// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });
const db = new Dexie('Fantagulus');

db.version(1).stores({
    bookmarks: `++bookmarkId, *tags, title, &url, dateCreated`
})

db.version(2).stores({
    bookmarks: `++bookmarkId, *tags, title, &url, dateCreated`
}).upgrade(transaction => {
	return transaction.bookmarks.toCollection().modify(bookmark => {
		bookmark.clippings = []
		bookmark.clippings.push(bookmark.clipping)
		delete bookmark.clipping
	})
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
		if (obj.msg == 'get_bookmark') {
			let bookmark = db.bookmarks.get({ url: obj.url }).then(bookmark => {
				if (bookmark)
					port.postMessage({ bookmark: bookmark })
			})
		}
		if (obj.msg == 'put') {
			let bookmark = obj.bookmark
			// if (bookmark.bookmarkId) {
				// console.log("bookmarkId present")
				db.bookmarks.put(bookmark).then(() => {
					if (obj.origin) {
						db.bookmarks.toArray().then(bookmarks => {
                            // port.postMessage({ bookmarks: bookmarks })
							port.postMessage({ msg: 'bookmark_saved' })
						})
					}
				})
			// } else {
			// 	db.bookmarks.put(bookmark).then(() => {
			// 		db.bookmarks.toArray().then(bookmarks => {
			// 			port.postMessage({ bookmarks: bookmarks })
			// 		})
			// 	})
			// }
		}
		// if (obj.message == 'ready' && obj.url) {
		// 	console.log(obj)
		// 	let bookmark = db.bookmarks.get({ url: obj.url }).then(bookmark => {
		// 		console.log(bookmark)
		// 		if (bookmark)
		// 			port.postMessage({ bookmark: bookmark })
		// 	})
		// }
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
        bookmark: null,
        bookmarkCopy: {},
        bookmarkOriginal: {},
        confirmCancel: false,
        editingMessage: null,
        bookmarks: [],
        newTag: {
            name: null
        },
        newClipping: null,
        editingNewClipping: false,
        message: null,
        port: null,
        confirmDelete: null,
        editing: false,
        confirmDeleteClipping: null,
        editingClipping: null,
        clippingOriginal: null
    },
    created() {
    	this.fetchData()
    },
    watch: {
    	editingMessage(newVal) {
    		if (newVal) {
    			setTimeout(() => {
    				this.editingMessage = null
    			}, 3000)
    		}
    	}
    },
    computed: {
    	bookmarkChanged() {
    		return changed(this.bookmarkOriginal, this.bookmarkCopy)
    	}
    },
    methods: {
    	fetchData() {
    		db.bookmarks.toArray().then(bookmarks => {
    			// console.log(bookmarks)
				this.bookmarks = bookmarks

				if (this.bookmark != null) {
					console.log(this.bookmark, this.bookmarks[this.bookmark])
					this.bookmarkOriginal = copy(this.bookmarks[this.bookmark])
	            	this.bookmarkCopy = copy(this.bookmarks[this.bookmark])
				}
			})
    	},
    	openBookmark(bookmark) {
    		// this.bookmark = bookmark
    	},
    	editBookmark(index) {
    		this.editing = true
    		this.bookmark = index
    		console.log(this.bookmark)
    		this.bookmarkCopy = copy(this.bookmarks[index])
    		this.bookmarkOriginal = copy(this.bookmarks[index])
    	},
    	cancelEditBookmark() {
    		if (changed(this.bookmark, this.bookmarkCopy)) {
    			this.confirmCancel = true
    		}
    	},
    	deleteBookmark(bookmark) {
    		console.log("deleteBookmark")
    		console.log(bookmark)
            db.transaction("rw", db.bookmarks, () => {
                db.bookmarks.delete(bookmark.bookmarkId).then(() => {
                    this.confirmDelete = null
                    this.fetchData()
                })
            })
    	},
    	addTag: function() {
            this.bookmarkCopy.tags.push(this.newTag)
            this.newTag = { name: null }
        },
        removeTag(index) {
            this.bookmarkCopy.tags.splice(index, 1)
        },
    	saveNewClipping() {
    		this.bookmarkCopy.clippings.push(copy(this.newClipping))
    		console.log(this.bookmarkCopy.clippings)
    		this.newClipping = null
    		this.editingNewClipping = false
    		this.saveBookmark()
    	},
    	editClipping(index) {
    		this.editingClipping = index
    		this.clippingOriginal = this.bookmarkCopy[index]
    	},
    	cancelEditClipping(index) {
    		this.bookmarkCopy = this.clippingOriginal
    		this.editingClipping = null
    	},
    	saveClipping(index, clipping) {
    		this.editingClipping = null
    		this.bookmarkCopy.clippings[index] = clipping
    		this.saveBookmark()
    	},
    	deleteClipping(index) {
    		this.bookmarkCopy.clippings.splice(index, 1)
    		this.confirmDeleteClipping = null
    		this.saveBookmark()
    	},
    	discardBookmarkChanges() {
    		// this.bookmark = copy(this.bookmarkCopy)
    		this.resetBookmark()
    	},
		saveBookmark() {
            if (!this.bookmarkCopy.url) {
                this.editingMessage = "URL is a required field."
                return
            }

            let url = this.bookmarkCopy.url.split("#")
            this.bookmarkCopy.url = url[0]

            console.log(this.bookmarkCopy)

            db.bookmarks.put(this.bookmarkCopy).then(() => {
            	// this.resetBookmark()
	            this.fetchData()
	            this.editingMessage = "Bookmark saved!"
            })
        },
        resetBookmark() {
        	this.editing = false
    		this.confirmCancel = false
    		this.confirmDeleteClipping = null
    		this.bookmark = null
	        this.bookmarkCopy = this.bookmarkOriginal = {
	            url: null,
	            tags: [],
	            title: null,
	            clippings: []
	        }
        }
    }
})
