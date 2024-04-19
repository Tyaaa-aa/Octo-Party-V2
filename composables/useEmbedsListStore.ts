export default defineStore({
    id: 'embedsList',
    state: (): embedsListState => ({
        embedsList: []
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
    },
});