var app = new Vue({
    el: '#app',
    data: {
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
        // chrome.storage.onChanged.addListener(function(changes, namespace) {
        //     for (key in changes) {
        //         var storageChange = changes[key];
        //         console.log('Storage key "%s" in namespace "%s" changed. ' +
        //                   'Old value was "%s", new value is "%s".',
        //                   key,
        //                   namespace,
        //                   storageChange.oldValue,
        //                   storageChange.newValue);
        //     }
        // })
        this.port = chrome.runtime.connect({ name: "popup" })
        console.log(this.port)
        this.port.onMessage.addListener((obj) => {
            console.log(obj)
            if (obj.bookmarks) {
                console.log(obj.bookmarks)
                // obj.bookmarks.forEach((bookmark) => {
                //     this.bookmarks.push(bookmark)
                // })
                this.bookmarks = obj.bookmarks
                console.log(this.bookmarks)
            }
            if (obj.msg == 'bookmark_saved') {

            }
            if (obj.bookmark) {
                this.bookmark = obj.bookmark
            }
        });
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
            console.log(tabs[0])
            this.bookmark.url = this.sanitizeUrl(tabs[0].url)
            this.bookmark.title = tabs[0].title

            this.port.postMessage({ msg: "get_bookmark", bookmark: this.bookmark })
        });
    },
    watch: {
        message(newVal) {
            if (newVal) {
                setTimeout(() => {
                    this.message = null
                }, 3000)
            }
        }
    },
    methods: {
        addTag: function() {
            this.bookmark.tags.push(this.newTag)
            this.newTag = { name: null }
        },
        removeTag(index) {
            this.bookmark.tags.splice(index, 1)
        },
        pasteSelection() {
            console.log("getting selection")
            
            chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, (tab) => {
                console.log(tab)
                chrome.tabs.sendMessage(tab[0].id, { message: "getSelection" }, (response) => {
                    console.log(response)
                    if (response && response.data) {
                        this.bookmark.clipping = response.data;
                    } else {
                        this.message = "Please make a selection first."
                    }
                })
            })
        },
        openBookmarks() {
            chrome.tabs.create({url: chrome.extension.getURL('src/bg/background.html')});
        },
        sanitizeUrl(url) {
            return url.split("#")[0]
            // return url[0]
        },
        saveBookmark() {
            if (!this.bookmark.url) {
                this.message = "URL is a required field."
                return
            }

            // let url = this.bookmark.url.split("#")
            // this.bookmark.bookmark_id = md5(url[0])
            // this.bookmark.url = url[0]

            console.log(this.bookmark)

            this.port.postMessage({ msg: 'put', bookmark: this.bookmark })

            // chrome.storage.sync.get({ key: value }, function() {
            //     console.log('Value is set to ' + value);
            // })
            // chrome.runtime.sendMessage({ message: 'open', data: this.bookmark }, (response) => {
            //     if (!response.success)
            //         handleError(url);
            // });
        }
    }
})