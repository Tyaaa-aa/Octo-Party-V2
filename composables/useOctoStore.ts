// export default defineStore({
//   id: 'octoStore',
//   state: (): OctoStoreState => ({
//     octoData: [] // Initializing octoData as an empty array
//   }),
//   actions: {
//     // Action to update octoData with a new array of strings
//     setOctoData(newData: string[]) {
//       this.octoData = newData;
//     },
//     // Action to add a single string to octoData
//     addStringToOctoData(newString: string) {
//       this.octoData.push(newString);
//     },
//     // Action to remove a string from octoData by index
//     removeStringFromOctoData(index: number) {
//       if (index >= 0 && index < this.octoData.length) {
//         this.octoData.splice(index, 1);
//       }
//     },
//     removeMatchingStringFromOctoData(matchingString: string) {
//       this.octoData = this.octoData.filter((item) => item.toUpperCase() !== matchingString.toUpperCase());
//     },
//     // Other actions related to manipulating octoData can be added here
//   },
//   persist: {
//     storage: persistedState.localStorage,
//   },
// });