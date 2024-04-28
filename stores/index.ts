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
        onlineFilterSearch: false,
        offlineFilterSearch: false,
        volume: 1,
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
            if (this.embedsList.length === 0 || this.expandedEmbed.includes(string)) {
                this.isExpand = false;
                this.expandedEmbed = '';
            }
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
        toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen()
                this.isFullscreen = true
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen()
                    this.isFullscreen = false
                }
            }
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
        clearAllStreams() {
            this.embedsList = []
            this.isExpand = false
            this.expandedEmbed = ''
        },
        async checkStreamerStatus(streamer: string[] = []) {
            if (this.octoData.length === 0) {
                this.loading = false;
                return;
            }
            try {
                this.loading = true;
                // throw new Error("Test error")
                const response = await $fetch(`/api/twitch-streamer-status-v2`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: { streamer_list: JSON.stringify(streamer) },
                });
                // Check if the response is valid
                if (!response) {
                    console.log("No data received");
                    this.showErrorMessage("Something went wrong with the request");
                    return;
                }

                // Check if the response is valid data
                if (!("data" in response) || typeof response.data !== "object") {
                    console.log("Invalid data format");
                    this.showErrorMessage(
                        "Invalid data format. Please contact the developer. (Error code: 81)"
                    );
                    return;
                }

                // Check if the response is an error
                if ("error" in response) {
                    console.log("Invalid data format");
                    this.showErrorMessage(
                        "Invalid data format. Please contact the developer. (Error code: 81)"
                    );
                    return;
                }

                const { offline, online } = response.data;

                let onlineNames = [];
                for (let i = 0; i < online.length; i++) {
                    onlineNames.push(online[i].user_name);
                }

                this.activeStreamers = online;
                this.inactiveStreamers = offline;
                this.loading = false;
            } catch (error) {
                // Handle any unexpected errors here
                console.error("An unexpected error occurred:", error);
                this.showErrorMessage(
                    "There was an issue getting streamer status, Please contact the developer. (Error code: 47)"
                );
                this.loading = false;
            }
        }
    },
    getters: {
        filterSearch(state): boolean {
            return state.onlineFilterSearch && state.offlineFilterSearch
        },
        filteredInactiveStreamers(state) {
            const searchTerm = state.searchedStreamer.trim().toLowerCase()
            return state.inactiveStreamers.filter(streamer => streamer.user_login.toLowerCase().includes(searchTerm))
        },
        filteredActiveStreamers(state) {
            const searchTerm = state.searchedStreamer.trim().toLowerCase()
            return state.activeStreamers.filter(streamer => streamer.user_login.toLowerCase().includes(searchTerm))
        },
    }
})

// You can also define other stores for different state management concerns