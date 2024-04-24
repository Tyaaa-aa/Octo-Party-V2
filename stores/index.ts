export const useGlobalStateStore = defineStore('GlobalState', {
    state: () => ({
        octoData: [] as string[],
        embedsList: [] as string[],
        listExpand: false,
        isIdle: false,
        notiExpand: false,
        SHOW_DEBUG_MENU: false,
        ENABLE_NOTIFICATIONS: true,
        ENABLE_AUTO_REMOVE_STREAM: true,
        ENABLE_REMEMBER_LAST_LAYOUT: true,
        activeNotifications: [] as Notification[],
        activeStreamers: [] as StreamerStatus[],
        inactiveStreamers: [] as StreamerStatus[],
        errorMsg: '',
        isError: false,
        isSuccess: false,
        successMsg: '',
        loading: true,
        shareLoading: false,
        url: '',
        QRvalue: '',
        showShare: false,
        searchedStreamer: '',
        isExpand: false,
        expandedEmbed: '',
        isFullscreen: false,
        isDragging: false,
        editMode: false,
    }),
    actions: {
        addEmbed(newString: string) {
            if (this.embedsList.includes(newString)) {
                return;
            }
            this.embedsList.push(newString);
        },
        removeEmbed(string: string) {
            this.embedsList = this.embedsList.filter((item) => item.toUpperCase() !== string.toUpperCase());
        },
        setOctoData(newData: string[]) {
            this.octoData = newData;
        },
        addStringToOctoData(streamer: string) {
            this.octoData.push(streamer)
            this.saveOctoDataToLocalStorage()
        },
        removeStringFromOctoData(index: number) {
            if (index >= 0 && index < this.octoData.length) {
                this.octoData.splice(index, 1);
            }
        },
        removeMatchingStringFromOctoData(streamer: string) {
            this.octoData = this.octoData.filter(item => item.toUpperCase() !== streamer.toUpperCase())
            this.saveOctoDataToLocalStorage()
        },
        saveOctoDataToLocalStorage() {
            const storedOctoData = { octoData: this.octoData }
            localStorage.setItem('octoStore', JSON.stringify(storedOctoData))
        },
        loadOctoDataFromLocalStorage() {
            const { octoData } = JSON.parse(localStorage.getItem('octoStore') || '{}')
            if (octoData) this.octoData = octoData
        },
        clearAllNotifications() {
            this.activeNotifications = []
            this.notiExpand = false
        },
        removeNotification(streamerName: string) {
            this.activeNotifications = this.activeNotifications.filter(notification => notification.streamer_name !== streamerName)
        },
        toggleNoti() {
            this.notiExpand = !this.notiExpand
        },
        handleMainMenu() {
            if (this.listExpand) this.editMode = false
            this.listExpand = !this.listExpand
        },
        showErrorMessage(msg: string) {
            this.errorMsg = msg
            this.isError = true
        },
        showSuccessMessage(msg: string) {
            this.successMsg = msg
            this.isSuccess = true
        },
    },
    getters: {
        // ...getters if needed
    }
})

// You can also define other stores for different state management concerns