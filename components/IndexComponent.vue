<script lang="ts" setup>
	import draggable from "vuedraggable";

	const globalStore = useGlobalStateStore(); // Using the store
	const userSettings = useSettingStore();

	const IDLE_DURATION = 3000;
	const UPDATE_LIST_TIMER = 300000; // 5 minutes in milliseconds

	let idleTimer: NodeJS.Timeout | null = null;
	let isBtnsBoxHovered = false;
	const handleMouseMove = () => {
		if (globalStore.isIdle && !isBtnsBoxHovered) {
			globalStore.isIdle = false;
			resetIdleTimer();
		}
	};
	const handleMouseEnter = () => {
		isBtnsBoxHovered = true;
	};
	const handleMouseLeave = () => {
		isBtnsBoxHovered = false;
		globalStore.isIdle = true;
	};
	const resetIdleTimer = () => {
		if (idleTimer) {
			clearTimeout(idleTimer);
		}
		idleTimer = setTimeout(() => {
			if (!isBtnsBoxHovered) {
				globalStore.isIdle = true;
			}
		}, IDLE_DURATION); // Idle duration in milliseconds (adjust as needed)
	};
	const handleMainClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		// Check if the click occurred outside the octo-ui element
		if (!target.closest(".octo-ui")) {
			globalStore.isIdle = true;
			globalStore.listExpand = false;
			globalStore.editMode = false;
		}

		if (isMobile.value) {
			globalStore.isIdle = !globalStore.isIdle;
		}
	};

	const isMobile = ref(false);
	const updateIsMobile = (event: MediaQueryListEvent) => {
		isMobile.value = event.matches;
	};

	const toggleEditMode = () => {
		globalStore.editMode = !globalStore.editMode;
	};

	const removeEmbed = (streamer: string) => {
		if (globalStore.expandedEmbed === streamer) {
			globalStore.isExpand = false;
			globalStore.expandedEmbed = "";
		}

		globalStore.removeEmbed(streamer);
	};

	const addAllStreams = () => {
		globalStore.activeStreamers.forEach((streamer) => {
			globalStore.addEmbed(streamer.user_name);
		});
	};

	const checkStreamerStatus = async (
		streamer: string[] = globalStore.octoData
	) => {
		if (globalStore.octoData.length === 0) return;
		try {
			globalStore.loading = true;
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
				globalStore.showErrorMessage("Something went wrong with the request");
				return;
			}

			// Check if the response is valid data
			if (!("data" in response) || typeof response.data !== "object") {
				console.log("Invalid data format");
				globalStore.showErrorMessage("Invalid data format. Please contact the developer. (Error code: 81)");
				return;
			}

			// Check if the response is an error
			if ("error" in response) {
				console.log("Invalid data format");
				globalStore.showErrorMessage("Invalid data format. Please contact the developer. (Error code: 81)");
				return;
			}

			const { offline, online } = response.data

			let onlineNames = [];
			for (let i = 0; i < online.length; i++) {
				onlineNames.push(online[i].user_name);
			}

			globalStore.activeStreamers = online;
			globalStore.inactiveStreamers = offline;
			globalStore.loading = false;
		} catch (error) {
			// Handle any unexpected errors here
			console.error("An unexpected error occurred:", error);
			globalStore.showErrorMessage("There was an issue getting streamer status, Please contact the developer. (Error code: 47)");
			globalStore.loading = false;
		}
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
				globalStore.showErrorMessage("Invalid data format. Please contact the developer. (Error code: 81)");
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
					globalStore.showErrorMessage(`Failed to copy link to clipboard: ${globalStore.url}`);
				}
			);
		} catch (error) {
			// Handle any unexpected errors here
			console.error("An unexpected error occurred:", error);
			globalStore.showErrorMessage("There was an issue sharing your list, Please contact the developer. (Error code: 47)");
			globalStore.shareLoading = false;
			globalStore.loading = false;
		}
	};

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
			checkStreamerStatus();
			globalStore.searchedStreamer = "";
		} catch (error) {
			// Handle any unexpected errors here
			console.error("An unexpected error occurred:", error);
			globalStore.loading = false;
			globalStore.showErrorMessage("There was an issue adding the streamer, Please contact the developer. (Error code: 47)");
			return;
		}

		setTimeout(() => {
			globalStore.loading = false;
		}, 2000);
	};

	onMounted(() => {
		resetIdleTimer();
		const mediaQuery = window.matchMedia("(pointer: coarse)");

		// Check if the media query matches (common for touch-based devices)
		isMobile.value = mediaQuery.matches;

		// Additionally, you can listen for changes in the media query (if supported by the browser)
		if (mediaQuery.addEventListener) {
			mediaQuery.addEventListener("change", updateIsMobile);
		}
		globalStore.loadOctoDataFromLocalStorage()
		checkStreamerStatus(globalStore.octoData);

		const updateTimer = setInterval(() => {
			checkStreamerStatus();
		}, UPDATE_LIST_TIMER); // 5 minutes in milliseconds

		// Watch for changes to embeds and their state and update remember list
		watch(() => globalStore.embedsList, () => {
			if (globalStore.ENABLE_REMEMBER_LAST_LAYOUT) {
				userSettings.updateRememberedList(globalStore.isExpand, globalStore.expandedEmbed, globalStore.embedsList);
			}
		});

		watch(() => globalStore.isExpand, (value) => {
			if (globalStore.ENABLE_REMEMBER_LAST_LAYOUT) {
				userSettings.updateRememberedList(value, globalStore.expandedEmbed, globalStore.embedsList);
			}
		});

		watch(() => globalStore.expandedEmbed, (value) => {
			if (globalStore.ENABLE_REMEMBER_LAST_LAYOUT) {
				userSettings.updateRememberedList(globalStore.isExpand, value, globalStore.embedsList);
			}
		});

		if (userSettings.RememberLastLayout) {
			const { expanded, streamerList } = userSettings.LastLayout;
			globalStore.isExpand = expanded.status;
			globalStore.expandedEmbed = expanded.streamer;
			globalStore.embedsList = streamerList;
		} else {
			userSettings.updateRememberedList(false, "", []);
		}

	});

	onUnmounted(() => {
		if (idleTimer) {
			clearTimeout(idleTimer);
		}

		const mediaQuery = window.matchMedia("(pointer: coarse)");
		if (mediaQuery.removeEventListener) {
			mediaQuery.removeEventListener("change", updateIsMobile);
		}
	});

	// Remove the streamer when they go offline
	watch(() => globalStore.activeStreamers, (newvalue, oldvalue) => {
		// check for streamers that have gone offline and remove them
		const offlineStreamers = oldvalue.filter(
			(streamer) =>
				!newvalue.some(
					(oldStreamer) => oldStreamer.user_name === streamer.user_name
				)
		);

		const newItem = newvalue.find((newItem) => {
			return !oldvalue.some((oldItem) => {
				return oldItem.user_name === newItem.user_name;
			});
		});

		if(globalStore.isSuccess && globalStore.successMsg === "Streamer added to list!") return;

		if (newItem && globalStore.ENABLE_NOTIFICATIONS && oldvalue.length > 0) {
			console.log("New item found:", newItem);
			const newNoti = {
				streamer_name: newItem.user_name,
				view_count: newItem.viewer_count.toString(),
				timestamp: new Date(),
			} as Notification;
			globalStore.activeNotifications = [newNoti, ...globalStore.activeNotifications];
			
			if (globalStore.notiExpand) return;
			globalStore.notiExpand = true;
			setTimeout(() => {
				globalStore.notiExpand = false;
			}, 5000);
		} else {
			// console.log("No new item found.");
		}

		if (!globalStore.ENABLE_AUTO_REMOVE_STREAM) return;

		offlineStreamers.forEach((streamer) => {
			globalStore.removeEmbed(streamer.user_name);
			if (streamer.user_name === globalStore.expandedEmbed) {
				globalStore.isExpand = false;
				globalStore.expandedEmbed = "";
			}
			console.log("Removing streamer: " + streamer.user_name);
		});
	});

	const expandEmbed = (streamer: string) => {
		// console.log(streamer);
		if (globalStore.isExpand && globalStore.expandedEmbed === streamer) {
			globalStore.isExpand = false;
			globalStore.expandedEmbed = "";
			return;
		}
		globalStore.isExpand = true;
		globalStore.expandedEmbed = streamer;
	};
</script>

<template>
		<DebugMenu
		@refreshList="checkStreamerStatus"
		/>
	<main
		@mousemove="handleMouseMove"
		@mouseleave="handleMouseLeave"
		@mouseup="handleMainClick"
	>
		<div
			class="octo-ui"
			:class="{
				hidden: globalStore.isIdle,
				show: globalStore.listExpand || globalStore.notiExpand || globalStore.embedsList.length === 0,
				'edit-mode': globalStore.editMode,
			}"
			@mouseenter="handleMouseEnter"
			@mouseleave="handleMouseLeave"
		>
			<!-- QR Code Card -->
			<QRCodeCard />
			<!-- Settings Card -->
			<SettingsCard />
			<!-- Main Menu Card -->
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
								prepend-icon="mdi-pencil"
								variant="flat"
								color="grey-darken-3"
								@click="toggleEditMode"
								class="edit-btn"
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
						</v-col>
						<CreditsSection />
					</v-row>
				</v-card>
			</v-expand-transition>
			
			<ButtonsOverlay />
			
			<NotificationsCard />
			
		</div>
		<!-- Embedded Streams -->
		<draggable
			v-model="globalStore.embedsList"
			item-key="id"
			:class="
				!globalStore.isExpand
					? 'embeds-container'
					: 'embeds-container embeds-container-expand'
			"
			drag-class="drag"
			ghost-class="ghost"
			@start="globalStore.isDragging = true"
			@end="globalStore.isDragging = false"
			handle=".drag-btn"
		>
			<template #item="{ element }">
				<div
					class="embed-twitch-item"
					:class="{
						'embed-twitch-item expanded-embed': element === globalStore.expandedEmbed,
						'embed-twitch-item': !(element === globalStore.expandedEmbed),
						'expand-solo': globalStore.embedsList.length === 1 && globalStore.isExpand,
						'embed-dragging': globalStore.isDragging,
					}"
				>
					<EmbedTwitch :creator="element" :key="element" />
					<v-btn
						icon="mdi-close"
						@click="removeEmbed(element)"
						class="close-btn"
						color="deep-purple-darken-1"
					></v-btn>
					<v-btn
						:icon="
							element === globalStore.expandedEmbed
								? 'mdi-arrow-collapse'
								: 'mdi-arrow-expand'
						"
						@click="expandEmbed(element)"
						class="expand-btn"
						color="deep-purple-darken-1"
					></v-btn>
					<v-btn
						icon="mdi-drag"
						class="drag-btn"
						color="grey-lighten-2"
						variant="text"
						v-if="
						// Show the drag button if there is more than 1 embed an embed is not expanded
						(!globalStore.isExpand && globalStore.embedsList.length > 1)
						||
						// Show the drag button if there is more than 2 embeds an embed is expanded
						(globalStore.isExpand && globalStore.embedsList.length > 2)"
					></v-btn>
					<span class="embed-drag-box">{{ element }}</span>
				</div>
			</template>
		</draggable>
	</main>

	<v-snackbar
		:timeout="3000"
		color="red-darken-1"
		v-model="globalStore.isError"
		rounded="pill"
	>
		<span class="pr-md-5">{{ globalStore.errorMsg }}</span>
		<v-btn color="red-lighten-1" variant="flat" @click="globalStore.isError = false">
			Close
		</v-btn>
	</v-snackbar>

	<v-snackbar
		:timeout="3000"
		color="deep-purple-accent-4"
		v-model="globalStore.isSuccess"
		rounded="pill"
	>
		<span class="pr-md-5">{{ globalStore.successMsg }}</span>
		<v-btn color="deep-purple-accent-2" variant="flat" @click="globalStore.isSuccess = false">
			Close
		</v-btn>
	</v-snackbar>
</template>

<style scoped>
	main {
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
		align-items: center;
		/* justify-content: center; */
		padding: 20px 5px;
		/* position: relative; */
		/* height: 100vh; */
	}

	.octo-ui {
		position: fixed;
		bottom: 20px;
		right: 20px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		gap: 20px;
		z-index: 1000;
		/* outline: 2px solid red; */
		transform-origin: bottom right;
		transition: all 0.3s ease-in-out;
	}

	.hidden {
		opacity: 0;
		/* Hide the UI by setting opacity to 0 */
		pointer-events: none;
		/* Disable pointer events on hidden UI */
	}

	.show {
		opacity: 1;
		pointer-events: auto;
	}

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

	.embeds-container {
		width: 100%;
		display: grid;
		padding: 20px;
		padding-top: 40px;
		grid-template-columns: repeat(auto-fill, minmax(33vw, 1fr));
		gap: 10px;
	}

	.embed-twitch-item {
		margin: 0 auto;
		width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: 7px;
		overflow: hidden;
		position: relative;
		transition: all 0.2s ease-in-out;
		max-height: 46.5vh;
		/* border: 2px solid orange; */
	}

	.close-btn {
		position: absolute;
		top: 5px;
		right: 20px;
		opacity: 0;
		transform: translate(0, 0) scale(0.5);
	}

	.expand-btn {
		position: absolute;
		top: 5px;
		right: 70px;
		opacity: 0;
		transform: translate(0, 0) scale(0.5);
	}

	.drag-btn {
		position: absolute;
		top: 5px;
		right: 110px;
		opacity: 0;
		cursor: grab;
		transform: translate(0, 0) scale(0.5);
	}
	.drag-btn:active{
		cursor: grabbing;
	}
	.expanded-embed .drag-btn {
		display: none;
	}

	.embed-twitch-item:hover .close-btn,
	.embed-twitch-item:hover .expand-btn,
	.embed-twitch-item:hover .drag-btn {
		opacity: 1;
		transform: translate(0, 0) scale(0.7);
		transition: all 0.2s ease-in-out;
	}

	.close-btn:hover {
		filter: hue-rotate(80deg);
	}

	.embed-drag-box {
		opacity: 0;
		pointer-events: none;
		position: absolute;
		top: 0;
		left: 50%;
		width: 100%;
		height: 100%;
		padding: 5px 10px;
		background-image: linear-gradient(
			rgba(0, 0, 0, 0.8),
			rgba(0, 0, 0, 0)
		);
		border-radius: 7px;
		transform: translateX(-50%);
		user-select: none;
		cursor: grab;
		transition: all 0.2s ease-in-out;
	}
	.embed-dragging .embed-drag-box{
		opacity: 1;
		pointer-events: auto;
	}

	.drag div {
		/* transform: rotate(5deg); */
		/* border: 5px solid rgb(55, 0, 255); */
		/* box-shadow: 0 0 10px 5px rgb(55, 0, 255); */
		border-radius: 20px;
		background-color: darkgray;
	}

	.ghost {
		opacity: 0.5;
		border: 5px solid orange;
	}

	.embeds-container-expand {
		display: flex;
		position: absolute;
		top: 67.5%;
		flex-wrap: wrap;
		justify-content: center;
		overflow: auto;
		padding-top: 0px;
		/* outline: 2px solid red; */
		max-height: 32.5%;
	}
	.embeds-container-expand .embed-twitch-item {
		min-width: 300px;
		max-width: 500px;
		/* max-height: 30vh; */
		margin: 0;
		/* border: 2px solid red; */
	}

	.expanded-embed {
		width: unset;
		max-width: calc(100% - 45px) !important;
		max-height: 65% !important;
		height: 100% !important;
		position: fixed;
		top: 10px;
		left: 50%;
		transform: translateX(-50%);
		border-radius: 7px;
		z-index: 1;
		/* border: 2px solid red; */
	}
	.expand-solo {
		height: unset !important;
		max-height: 100vh !important;
		width: 98%;
		top: 50%;
		transform: translate(-50%, -50%);
		max-width: unset !important;
	}

	@media (max-width: 1574px) {
		.expanded-embed {
			max-height: 50% !important;
			height: auto !important;
			width: 100%;
		}

		.embeds-container-expand {
			top: 52.5%;
			height: 45%;
			min-height: 46%;
			padding-bottom: 0;
		}

		.embeds-container-expand {
			top: 52.5%;
		}
		
		.expand-solo {
			height: unset !important;
			max-height: 100vh !important;
			width: 98%;
			top: 50%;
			transform: translate(-50%, -50%);
			max-width: unset !important;
		}

		/* .embeds-container-expand .embed-twitch-item:not(.expanded-embed) {
			width: 50%;
		} */
	}
	/* Responsive adjustments */
	@media (max-width: 1280px) {
		.embeds-container {
			grid-template-columns: 1fr;
			padding-left: 5px;
			padding-right: 5px;
		}
		.octo-ui {
			right: 10px;
		}
	}

	
</style>
