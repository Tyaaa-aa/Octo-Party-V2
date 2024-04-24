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
</script>

<template>
		<DebugMenu />
	<main
		@mousemove="handleMouseMove"
		@mouseleave="handleMouseLeave"
		@mouseup="handleMainClick"
	>
		<div
			class="octo-ui"
			:class="{
				hidden: globalStore.isIdle,
				show: globalStore.listExpand || globalStore.notiExpand || globalStore.embedsList.length === 0
			}"
			@mouseenter="handleMouseEnter"
			@mouseleave="handleMouseLeave"
		>
			<QRCodeCard />
			<SettingsCard />
			<MainMenu />
			<ButtonsOverlay />
			<NotificationsCard />
		</div>
		<EmbedsList />
	</main>
	<ToastMessage />
</template>

<style scoped>
	main {
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px 5px;
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
		transform-origin: bottom right;
		transition: all 0.3s ease-in-out;
	}
	.hidden {
		opacity: 0;
		pointer-events: none;
	}
	.show {
		opacity: 1;
		pointer-events: auto;
	}
	
	@media (max-width: 1280px) {
		.octo-ui {
			right: 10px;
		}
	}
</style>
