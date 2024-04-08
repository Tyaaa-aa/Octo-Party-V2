<script lang="ts" setup>
	// import { useOctoStore } from './yourPathToOctoStore';
	const route = useRoute();
	const shared_data = ref([]);
	const isError = ref<boolean>(false);
	const errorMsg = ref<string>("");

	async function getSharedLinkData() {
		try {
			const response = await $fetch(
				`/api/shared_link?share=${route.params.id.toString()}`
			);
			// Check if the response is valid
			if (!response) {
				console.log("No data received");
				isError.value = true;
				errorMsg.value = "Something went wrong with the request";
				return;
			}
			// Check if the response is an error
			if ("error" in response) {
				console.log("Invalid link");
				isError.value = true;
				errorMsg.value = "Invalid link. Please check the link and try again.";
				return;
			}
			// Check if the response is valid data
			if (!("data" in response) || typeof response.data !== "string") {
				console.log("Invalid data format");
				isError.value = true;
				errorMsg.value =
					"Invalid data format. Please contact the developer. (Error code: 81)";
				return;
			}
			// If we get here, we have valid data
			console.log("Valid link and data");
			shared_data.value = JSON.parse(response.data);
			// console.log(shared_data.value)
			isError.value = false;
			// console.log(response)
			errorMsg.value = "";
		} catch (error) {
			// Handle any unexpected errors here
			console.error("An unexpected error occurred:", error);
			errorMsg.value =
				"An unexpected error occurred. Please contact the developer. (Error code: 84)";
		}
	}

	const dialog = ref<boolean>(false);
	const dialog2 = ref<boolean>(false);
	const snackbar = ref<boolean>(false);
	const octoStore = useOctoStore(); // Using the store

	// octoStore.setOctoData([
	//   "mamicairo",
	//   "sukasblood",
	//   "xclvsssyx",
	// ]); // Setting the store
	console.log(octoStore.octoData); // 0

	onMounted(async () => {
		if (route.params.id) {
			await getSharedLinkData();
			// console.log(shared_data.value)
			if (octoStore.octoData.length > 0) {
				dialog.value = true;
			} else {
				dialog.value = false;
				handleAdd();
				// octoStore.setOctoData([])
			}
		}
	});

	const handleCancel = () => {
		dialog.value = false;
		dialog2.value = false;
		endOfSharing();
	};

	const handleReplace = () => {
		dialog.value = false;
		dialog2.value = false;
		octoStore.setOctoData(shared_data.value);
		endOfSharing();
	};

	const handleAdd = () => {
		dialog.value = false;
		dialog2.value = false;
		// Only add new items
		shared_data.value.forEach((value) => {
			if (!octoStore.octoData.includes(value)) {
				octoStore.addStringToOctoData(value);
			}
		});
		snackbar.value = true;
		endOfSharing();
	};

	const removeShareItem = (itemIndex: number, event: MouseEvent) => {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		if (itemIndex > -1) {
			shared_data.value.splice(itemIndex, 1);
		}
	};

	async function endOfSharing() {
		console.log("End of sharing, redirecting to index");

		// return
		await navigateTo("/");
	}

	function doLog() {
		console.log(octoStore.octoData);
	}
</script>

<template>
	<v-dialog v-model="dialog" persistent width="auto">
		<v-card class="h-50">
			<v-card-title class="text-h5"> You have an existing list </v-card-title>

			<v-divider></v-divider>
			<v-card-text style="overflow-y: auto">
				<p>
					Duplicate streamers will be automatically removed <br />
					You can also choose to remove streamers from here as well
				</p>
				<br />
				<h3>Shared list:</h3>
				<ul v-auto-animate>
					<!-- <v-skeleton-loader type="list-item"></v-skeleton-loader> -->
					<v-list-item
						v-for="(shared_item, index) in shared_data"
						:key="index"
						:href="'https://twitch.tv/' + shared_item"
						target="_blank"
						ref="dialog_shared_list"
					>
						<v-btn
							variant="plain"
							icon="mdi-delete"
							color="red-accent-2"
							@click="(event: MouseEvent) => removeShareItem(index, event)"
						></v-btn>
						{{ shared_item }}
					</v-list-item>
				</ul>
				<br />
				<v-divider></v-divider>
				<br />
				<h3>Your existing list:</h3>
				<ul>
					<v-list-item
						v-for="(octo_item, index) in octoStore.octoData"
						:key="index"
						:href="'https://twitch.tv/' + octo_item"
						target="_blank"
					>
						{{ octo_item }}
					</v-list-item>
				</ul>
			</v-card-text>
			<v-divider></v-divider>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn
					color="deep-purple-darken-1"
					variant="flat"
					@click="handleCancel"
				>
					Cancel
				</v-btn>
				<v-tooltip location="top">
					<template v-slot:activator="{ props }">
						<v-btn
							color="deep-purple-lighten-2"
							variant="text"
							@click="dialog2 = !dialog2"
							v-bind="props"
						>
							Replace
						</v-btn>
					</template>
					<span>WARNING! This will delete your existing list!</span>
				</v-tooltip>
				<v-btn color="deep-purple-lighten-2" variant="text" @click="handleAdd">
					Add
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<v-dialog v-model="dialog2" width="auto" max-width="400px">
		<v-card>
			<v-card-title> Are you sure you want to replace? </v-card-title>
			<v-card-text>
				<p>
					This will delete your existing list and replace it with the shared
					list
				</p>
				<br />
				<h4>This action cannot be undone!</h4>
				<br />
				<v-btn
					color="deep-purple-lighten-2"
					variant="text"
					@click="handleReplace"
				>
					I'm Sure
				</v-btn>
			</v-card-text>
			<v-divider></v-divider>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn
					color="deep-purple-darken-1"
					variant="flat"
					@click="dialog2 = false"
				>
					Close
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<v-snackbar
		:timeout="2000"
		color="green-darken-2"
		variant="tonal"
		v-model="snackbar"
		rounded="pill"
	>
		<span class="pr-md-5">Added to your list!</span>
		<v-btn color="green-accent-4" variant="text" @click="snackbar = false">
			Close
		</v-btn>
	</v-snackbar>
	<IndexComponent />
</template>

<style scoped>
	.shared-list-item {
		padding: 5px;
		display: block;
		/* outline: 2px solid red; */
	}

	ul {
		list-style-type: disc;
		padding: 0;
		margin: 0;
	}
</style>
