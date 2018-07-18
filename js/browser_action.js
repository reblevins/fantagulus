var app = new Vue({
    el: '#app',
    data: {
        bookmark: {
            bookmark_id: null,
            url: document.location.url,
            tags: [
                { name: 'tag' }
            ],
            description: null,
            clipping: null
        },
        newTag: {
            name: null
        },
        message: null
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
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
            this.bookmark.url = tabs[0].url;
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
            
            chrome.tabs.query({ active:true, windowId: chrome.windows.WINDOW_ID_CURRENT }, (tab) => {
                chrome.tabs.sendMessage(tab[0].id, { message: "getSelection" }, (response) => {
                    if (response && response.data) {
                        this.bookmark.clipping = response.data;
                    } else {
                        this.message = "Please make a selection first."
                    }
                })
            })
        },
        saveBookmark() {
            if (!this.bookmark.url) {
                this.message = "URL is a required field."
                return
            }

            let url = this.bookmark.url.split("#")
            this.bookmark.bookmark_id = md5(url[0])
            this.bookmark.url = url[0]

            console.log(this.bookmark)

            // chrome.storage.sync.get({ key: value }, function() {
            //     console.log('Value is set to ' + value);
            // })
            chrome.runtime.sendMessage({ message: 'open', data: this.bookmark }, (response) => {
                if (!response.success)
                    handleError(url);
            });
        }
    }
})