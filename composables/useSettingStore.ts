export default defineStore({
  id: 'settingStore',
  state: (): SettingStoreState => ({
    Notifications: true,
    AutoRemove: true,
    RememberLastLayout: true,
    LastLayout: {
      expanded: {
        status: false,
        streamer: '',
      },
      streamerList: [],
    },
  }),
  actions: {
    // Action to update octoData with a new array of strings
    setNotifications(newData: boolean) {
      this.Notifications = newData;
    },
    setAutoRemove(newData: boolean) {
      this.AutoRemove = newData;
    },
    setRememberLastLayout(newData: boolean) {
      this.RememberLastLayout = newData;
    },
    updateRememberedList(isExpand: boolean, expandedEmbed: string, streamerList: string[]) {
      this.LastLayout.expanded.status = isExpand;
      this.LastLayout.expanded.streamer = expandedEmbed;
      this.LastLayout.streamerList = streamerList;
    }
    // Other actions related to manipulating octoData can be added here
  },
  persist: {
    storage: persistedState.localStorage,
  },
});