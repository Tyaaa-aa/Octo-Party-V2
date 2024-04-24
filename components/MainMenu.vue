<script setup lang="ts">
	const globalStore = useGlobalStateStore();

	const addNewStreamer = async () => {
		if (!globalStore.searchedStreamer) {
			return;
		}
		globalStore.loading = true;

		globalStore.searchedStreamer = globalStore.searchedStreamer.trim();

		// check if streamer is in list with any casing
		const streamer = globalStore.octoData.find(
			(streamer) =>
				streamer.toLowerCase() === globalStore.searchedStreamer.toLowerCase()
		);
		if (streamer) {
			globalStore.showErrorMessage("Streamer already in list");
			globalStore.loading = false;
			return;
		}

		try {
			const response = await $fetch(`/api/streamer-exist`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: { streamerName: globalStore.searchedStreamer },
			});
			console.log(response);
			// Check if the response is valid
			if (!response) {
				console.log("No data received");
				globalStore.loading = false;
				globalStore.showErrorMessage("Something went wrong with the request");
				return;
			}

			const data: string | boolean = response.data;
			console.log(data);

			const streamerExist = data;
			if (!streamerExist || typeof streamerExist !== "string") {
				console.log("Streamer does not exist");
				globalStore.loading = false;
				globalStore.showErrorMessage("Streamer does not exist");
				return;
			}

			console.log("Streamer exist, adding to list");
			globalStore.showSuccessMessage("Streamer added to list!");
			globalStore.addStringToOctoData(streamerExist);
			globalStore.checkStreamerStatus(globalStore.octoData);
			globalStore.searchedStreamer = "";
		} catch (error) {
			// Handle any unexpected errors here
			console.error("An unexpected error occurred:", error);
			globalStore.loading = false;
			globalStore.showErrorMessage(
				"There was an issue adding the streamer, Please contact the developer. (Error code: 47)"
			);
			return;
		}

		setTimeout(() => {
			globalStore.loading = false;
		}, 2000);
	};

	const shareList = async () => {
		globalStore.shareLoading = true;

		try {
			const response = await $fetch(`/api/share`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: { shared_data: JSON.stringify(globalStore.octoData) },
			});
			console.log(response);

			if (!response) {
				console.log("No data received");
				globalStore.shareLoading = false;
				globalStore.showErrorMessage("Something went wrong with the request");
				return;
			}

			if ("error" in response && response.error) {
				console.log("Invalid data format");
				globalStore.shareLoading = false;
				globalStore.showErrorMessage(
					"Invalid data format. Please contact the developer. (Error code: 81)"
				);
				return;
			}

			const data = response.data;
			const shared_link = data && data[0] ? data[0].shared_link : null;
			globalStore.url = `${window.location.href}share/${shared_link}`;

			globalStore.QRvalue = globalStore.url;

			globalStore.shareLoading = false;
			globalStore.loading = false;
			globalStore.showShare = true;

			navigator.clipboard.writeText(globalStore.url).then(
				function () {
					/* clipboard successfully set */
					globalStore.showSuccessMessage("Link copied to clipboard!");
				},
				function () {
					/* clipboard write failed */
					globalStore.showErrorMessage(
						`Failed to copy link to clipboard: ${globalStore.url}`
					);
				}
			);
		} catch (error) {
			// Handle any unexpected errors here
			console.error("An unexpected error occurred:", error);
			globalStore.showErrorMessage(
				"There was an issue sharing your list, Please contact the developer. (Error code: 47)"
			);
			globalStore.shareLoading = false;
			globalStore.loading = false;
		}
	};

	const addAllStreams = () => {
		globalStore.activeStreamers.forEach((streamer) => {
			globalStore.addEmbed(streamer.user_name);
		});
	};
</script>

<template>
	<v-expand-transition>
		<v-card
			v-if="globalStore.listExpand"
			variant="elevated"
			class="favs-menu mx-auto"
			:loading="globalStore.loading"
		>
			<v-row no-gutters class="align-center">
				<v-col cols="12" class="pa-5">
					<v-text-field
						label="Search"
						variant="solo-filled"
						append-inner-icon="mdi-magnify"
						@click:append-inner="addNewStreamer"
						@keydown.enter="addNewStreamer"
						v-model="globalStore.searchedStreamer"
						hide-details
					></v-text-field>
				</v-col>
			</v-row>
			<v-row no-gutters class="pl-5 pr-5 pb-5">
				<v-col
					cols="12"
					v-if="globalStore.octoData.length !== 0"
					style="display: flex; justify-content: space-between"
				>
					<v-btn
						:prepend-icon="globalStore.editMode ? 'mdi-close' : 'mdi-pencil'"
						variant="flat"
						:color="globalStore.editMode ? 'grey-darken-1' : 'grey-darken-3'"
						@click="globalStore.editMode = !globalStore.editMode"
						:class="
							globalStore.editMode ? 'edit-btn edit-btn-editmode' : 'edit-btn'
						"
					>
						edit
					</v-btn>

					<v-tooltip v-model="globalStore.showShare" location="bottom">
						<template v-slot:activator="{ props }">
							<v-btn
								prepend-icon="mdi-share"
								variant="flat"
								color="grey-darken-3"
								@click="shareList"
								:loading="globalStore.shareLoading"
								v-if="globalStore.octoData.length !== 0"
								v-bind="props"
							>
								share
							</v-btn>
						</template>
						<span>Share</span>
					</v-tooltip>

					<v-btn
						prepend-icon="mdi-plus"
						variant="flat"
						color="grey-darken-3"
						@click="addAllStreams"
					>
						Add all
					</v-btn>
				</v-col>
			</v-row>
			<v-row no-gutters class="pl-5 pr-5 favs-list-container">
				<v-col cols="12">
					<!-- <SkeletonStreamerList
							v-if="
							octoStore.octoData.length > 0
							&&
							(globalStore.activeStreamers.length === 0
							||
							globalStore.inactiveStreamers.length === 0)
							"/> -->
					<OnlineStreamersList />
					<OfflineStreamersList />
					<h3
						v-if="
							globalStore.filteredActiveStreamers.length === 0 &&
							globalStore.filteredInactiveStreamers.length === 0 &&
							globalStore.octoData.length > 0 &&
							!globalStore.loading
						"
						style="text-align: center"
					>
						No Results Found
					</h3>
				</v-col>
				<CreditsSection />
			</v-row>
		</v-card>
	</v-expand-transition>
</template>
<style scoped>
.favs-menu {
		width: 400px;
		height: 400px;
		/* height: clamp(200px, 40vh, 400px); */
	}

	/* .streaming_row .v-list-item__content {
  display: flex !important;
  flex-wrap: wrap !important;
  justify-content: space-between !important;
} */

	.active_streamer,
	.streamer_views {
		flex-basis: 50%;
	}

	.profile_picture {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		margin-right: 13px;
	}

	.streamer_views {
		text-align: right;
		padding-right: 23px;
	}

	.streamer_views::before {
		content: "";
		display: block;
		width: 8px;
		height: 8px;
		background-color: #eb0400;
		border-radius: 50%;
		position: absolute;
		top: 50%;
		right: 0px;
		transform: translate(-50%, -60%);
	}

	.deletebtn {
		height: 25px !important;
		width: 25px !important;
		margin-right: 10px !important;
		transition: all 0.2s ease-in-out;
	}

	.deletebtn-hide {
		opacity: 0;
		width: 0px !important;
		margin-right: 0px !important;
		pointer-events: none;
		/* outline: 2px solid red; */
	}

	.favs-list-container {
		height: 61%;
		overflow-y: auto;
		/* outline: 2px solid red; */
	}
    </style>