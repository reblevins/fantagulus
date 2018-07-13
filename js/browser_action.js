var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        url: "https://stackoverflow.com/questions/14349263/creating-a-chrome-extension-which-takes-highlighted-text-on-the-page-and-inserts#answer-14351458",
        tags: [
            { name: 'tag' }
        ],
        description: null,
        newTag: {
            name: null
        },
        clipping: null,
        message: null
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
        }
    }
})