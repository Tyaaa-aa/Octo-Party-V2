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


	const removeEmbed = (streamer: string) => {
		if (globalStore.expandedEmbed === streamer) {
			globalStore.isExpand = false;
			globalStore.expandedEmbed = "";
		}

		globalStore.removeEmbed(streamer);
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
		globalStore.checkStreamerStatus(globalStore.octoData);

		const updateTimer = setInterval(() => {
			globalStore.checkStreamerStatus(globalStore.octoData);
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
				streamer_login: newItem.user_login,
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
			<MainMenu />
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
