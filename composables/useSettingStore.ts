interface SettingStoreState {
  Notifications: boolean,
  AutoRemove: boolean,
}

export default defineStore({
  id: 'settingStore',
  state: (): SettingStoreState => ({
    Notifications: true,
    AutoRemove: true,
  }),
  actions: {
    // Action to update octoData with a new array of strings
    setNotifications(newData: boolean) {
      this.Notifications = newData;
    },
    setAutoRemove(newData: boolean) {
      this.AutoRemove = newData;
    },
    // Other actions related to manipulating octoData can be added here
  },
  persist: {
    storage: persistedState.localStorage,
  },
});