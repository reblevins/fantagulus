var app = new Vue({
    el: '#app',
    data: {
        bookmark: {
            bookmark_id: null,
            url: "https://stackoverflow.com/questions/14349263/creating-a-chrome-extension-which-takes-highlighted-text-on-the-page-and-inserts#answer-14351458",
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
        chrome.storage.onChanged.addListener(function(changes, namespace) {
            for (key in changes) {
                var storageChange = changes[key];
                console.log('Storage key "%s" in namespace "%s" changed. ' +
                          'Old value was "%s", new value is "%s".',
                          key,
                          namespace,
                          storageChange.oldValue,
                          storageChange.newValue);
            }
        })
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
            this.tags.push(this.newTag)
            this.newTag = { name: null }
        },
        removeTag(index) {
            this.tags.splice(index, 1)
        },
        pasteSelection() {
            chrome.tabs.query({ active:true, windowId: chrome.windows.WINDOW_ID_CURRENT }, (tab) => {
                console.log(tab)
                chrome.tabs.sendMessage(tab[0].id, { method: "getSelection" }, (response) => {
                    console.log(response)
                    if (response && response.data) {
                        this.clipping = response.data;
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

            chrome.storage.sync.get({ key: value }, function() {
                console.log('Value is set to ' + value);
            })
        }
    }
})