<script lang="ts" setup>
	import { useTheme } from "vuetify";
	import QrcodeVue, { type Level, type RenderAs } from "qrcode.vue";
	import { useMouse } from "@vueuse/core";
	// import { VueDraggableNext } from 'vue-draggable-next'
	import draggable from "vuedraggable";

	const theme = useTheme();
	function toggleTheme() {
		theme.global.name.value = theme.global.current.value.dark
			? "light"
			: "dark";
	}

	const router = useRouter()

	const goToAboutPage = () => {
		router.push("about")
	}

	const octoStore = useOctoStore(); // Using the store
	const userSettings = useSettingStore();

	const listExpand = ref<boolean>(false);
	const notiExpand = ref<boolean>(false);

	const ENABLE_DEBUG = ref<boolean>(false);
	const SHOW_DEBUG_MENU = ref<boolean>(false);
	const ENABLE_NOTIFICATIONS = ref<boolean>(true);
	const ENABLE_AUTO_REMOVE_STREAM = ref<boolean>(true);
	const ENABLE_REMEMBER_LAST_LAYOUT = ref<boolean>(true);

	const IDLE_DURATION = 3000;
	// const UPDATE_LIST_TIMER = 5000; // 3 seconds in milliseconds
	const UPDATE_LIST_TIMER = 300000; // 5 minutes in milliseconds

	interface Notification {
		streamer_name: string;
		view_count: string;
		timestamp: Date;
	}
	const activeNotifications = ref<Notification[]>([]);

	type ActionType = NonNullable<"toggle">;
	const handleFavsMenu = (action: ActionType) => {
		if (action === "toggle") {
			listExpand.value = !listExpand.value;
			return;
		}
	};

	const isIdle = ref(false);
	let idleTimer: NodeJS.Timeout | null = null;
	let isBtnsBoxHovered = false;
	const handleMouseMove = () => {
		if (isIdle.value && !isBtnsBoxHovered) {
			isIdle.value = false;
			resetIdleTimer();
		}
	};
	const handleMouseEnter = () => {
		isBtnsBoxHovered = true;
	};
	const handleMouseLeave = () => {
		isBtnsBoxHovered = false;
		isIdle.value = true;
	};
	const resetIdleTimer = () => {
		if (idleTimer) {
			clearTimeout(idleTimer);
		}
		idleTimer = setTimeout(() => {
			if (!isBtnsBoxHovered) {
				isIdle.value = true;
			}
		}, IDLE_DURATION); // Idle duration in milliseconds (adjust as needed)
	};
	const handleMainClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		// Check if the click occurred outside the octo-ui element
		if (!target.closest(".octo-ui")) {
			isIdle.value = true;
			listExpand.value = false;
		}

		if (isMobile.value) {
			isIdle.value = !isIdle.value;
		}
	};

	const isMobile = ref(false);
	const updateIsMobile = (event: MediaQueryListEvent) => {
		isMobile.value = event.matches;
	};

	const editMode = ref(false);

	const toggleEditMode = () => {
		editMode.value = !editMode.value;
	};

	const removeShareItem = (item: string, event: MouseEvent) => {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		octoStore.removeMatchingStringFromOctoData(item);
		activeStreamers.value = activeStreamers.value.filter(
			(streamer) => streamer.user_name.toUpperCase() !== item.toUpperCase()
		);
		inactiveStreamers.value = inactiveStreamers.value.filter(
			(streamer) => streamer.user_name.toUpperCase() !== item.toUpperCase()
		);
	};

	const loading = ref(true);
	const shareLoading = ref(false);
	const startSearch = () => {
		console.log("start search");
		loading.value = true;
		setTimeout(() => {
			loading.value = false;
		}, 2000);
	};

	interface StreamerStatus {
		user_name: string;
		viewer_count: number;
		profile_picture: string;
	}

	const embedsListStore = useEmbedsListStore();

	const addEmbed = (streamer: string) => {
		if (embedsListStore.embedsList.includes(streamer)) return;
		embedsListStore.addEmbed(streamer);
	};

	const removeEmbed = (streamer: string) => {
		// console.log(embedsListStore.embedsList);

		if (expandedEmbed.value === streamer) {
			isExpand.value = false;
			expandedEmbed.value = "";
		}

		embedsListStore.removeEmbed(streamer);

		// console.log(embedsListStore.embedsList);
	};

	const errorMsg = ref<string>("");
	const isError = ref<boolean>(false);

	const activeStreamers = ref<StreamerStatus[]>([]);
	const inactiveStreamers = ref<StreamerStatus[]>([]);

	const addAllStreams = () => {
		activeStreamers.value.forEach((streamer) => {
			embedsListStore.addEmbed(streamer.user_name);
		});
	};

	const checkStreamerStatus = async (
		streamer: string[] = octoStore.octoData
	) => {
		if (octoStore.octoData.length === 0) return;
		try {
			loading.value = true;
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
				isError.value = true;
				errorMsg.value = "Something went wrong with the request";
				return;
			}

			// Check if the response is valid data
			if (!("data" in response) || typeof response.data !== "object") {
				console.log("Invalid data format");
				isError.value = true;
				errorMsg.value =
					"Invalid data format. Please contact the developer. (Error code: 81)";
				return;
			}

			// Check if the response is an error
			if ("error" in response) {
				console.log("Invalid data format");
				isError.value = true;
				errorMsg.value =
					"Invalid data format. Please contact the developer. (Error code: 81)";
				return;
			}

			const { offline, online } = response.data

			// console.log(offline)
			// console.log(online)

			let onlineNames = [];
			for (let i = 0; i < online.length; i++) {
				onlineNames.push(online[i].user_name);
			}

			activeStreamers.value = online;
			inactiveStreamers.value = offline;
			loading.value = false;
		} catch (error) {
			// Handle any unexpected errors here
			console.error("An unexpected error occurred:", error);
			errorMsg.value =
				"There was an issue getting streamer status, Please contact the developer. (Error code: 47)";
			isError.value = true;
			loading.value = false;
		}
	};

	const QRvalue = ref("");
	const level = ref<Level>("M");
	const renderAs = ref<RenderAs>("canvas");
	const showShare = ref(false);

	const isSuccess = ref(false);
	const successMsg = ref("");
	const url = ref("");

	const shareList = async () => {
		shareLoading.value = true;

		try {
			const response = await $fetch(`/api/share`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: { shared_data: JSON.stringify(octoStore.octoData) },
			});
			console.log(response);

			if (!response) {
				console.log("No data received");
				isError.value = true;
				shareLoading.value = false;
				errorMsg.value = "Something went wrong with the request";
				return;
			}

			if ("error" in response && response.error) {
				console.log("Invalid data format");
				isError.value = true;
				shareLoading.value = false;
				errorMsg.value =
					"Invalid data format. Please contact the developer. (Error code: 81)";
				return;
			}

			const data = response.data;
			const shared_link = data && data[0] ? data[0].shared_link : null;
			url.value = `${window.location.href}share/${shared_link}`;
			console.log(url);

			QRvalue.value = url.value;

			shareLoading.value = false;
			loading.value = false;
			showShare.value = true;

			navigator.clipboard.writeText(url.value).then(
				function () {
					/* clipboard successfully set */
					isSuccess.value = true;
					successMsg.value = "Link copied to clipboard!";
				},
				function () {
					/* clipboard write failed */
					errorMsg.value = `Failed to copy link to clipboard: ${url.value}`;
					isError.value = true;
				}
			);
		} catch (error) {
			// Handle any unexpected errors here
			console.error("An unexpected error occurred:", error);
			errorMsg.value =
				"There was an issue sharing your list, Please contact the developer. (Error code: 47)";
			isError.value = true;
			shareLoading.value = false;
			loading.value = false;
		}
	};

	const copySharedLink = () => {
		navigator.clipboard.writeText(url.value).then(
			function () {
				/* clipboard successfully set */
				isSuccess.value = true;
				successMsg.value = "Link copied to clipboard!";
			},
			function () {
				/* clipboard write failed */
				errorMsg.value = `Failed to copy link to clipboard: ${url.value}`;
				isError.value = true;
			}
		);
	};

	const searchedStreamer = ref("");

	const addNewStreamer = async () => {
		if (!searchedStreamer.value) {
			return;
		}
		loading.value = true;

		searchedStreamer.value = searchedStreamer.value.trim();

		// check if streamer is in list with any casing
		const streamer = octoStore.octoData.find(
			(streamer) =>
				streamer.toLowerCase() === searchedStreamer.value.toLowerCase()
		);
		if (streamer) {
			isError.value = true;
			errorMsg.value = "Streamer already in list";
			loading.value = false;
			return;
		}

		try {
			const response = await $fetch(`/api/streamer-exist`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: { streamerName: searchedStreamer.value },
			});
			console.log(response);
			// Check if the response is valid
			if (!response) {
				console.log("No data received");
				isError.value = true;
				loading.value = false;
				errorMsg.value = "Something went wrong please try again";
				return;
			}

			const data: string | boolean = response.data;
			console.log(data);

			const streamerExist = data;
			if (!streamerExist || typeof streamerExist !== "string") {
				console.log("Streamer does not exist");
				isError.value = true;
				loading.value = false;
				errorMsg.value = "Streamer does not exist";
				return;
			}

			console.log("Streamer exist, adding to list");
			isSuccess.value = true;
			successMsg.value = "Streamer added to list!";
			octoStore.addStringToOctoData(streamerExist);
			checkStreamerStatus();
			searchedStreamer.value = "";
		} catch (error) {
			// Handle any unexpected errors here
			console.error("An unexpected error occurred:", error);
			errorMsg.value =
				"There was an issue adding the streamer, Please contact the developer. (Error code: 47)";
			isError.value = true;
			loading.value = false;
			return;
		}

		setTimeout(() => {
			loading.value = false;
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
		checkStreamerStatus(octoStore.octoData);

		setTimeout(() => {
			loading.value = false;
		}, 2000);

		const updateTimer = setInterval(() => {
			checkStreamerStatus();
		}, UPDATE_LIST_TIMER); // 5 minutes in milliseconds

		// Apply user saved settings
		ENABLE_NOTIFICATIONS.value = userSettings.Notifications
		ENABLE_AUTO_REMOVE_STREAM.value = userSettings.AutoRemove
		ENABLE_REMEMBER_LAST_LAYOUT.value = userSettings.RememberLastLayout

		// Update saved layout
		watch(embedsListStore, (streamerList, oldStreamerList) => {
			if (ENABLE_REMEMBER_LAST_LAYOUT.value) {
				userSettings.updateRememberedList(isExpand.value, expandedEmbed.value, streamerList.embedsList);
			}
		});

		watch(isExpand, (value) => {
			if (ENABLE_REMEMBER_LAST_LAYOUT.value) {
				userSettings.updateRememberedList(value, expandedEmbed.value, embedsListStore.embedsList);
			}
		});

		if (userSettings.RememberLastLayout) {
			const { expanded, streamerList } = userSettings.LastLayout;
			isExpand.value = expanded.status;
			expandedEmbed.value = expanded.streamer;
			embedsListStore.embedsList = streamerList;
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

	const list = embedsListStore.embedsList.map((name, index) => {
		return { name, order: index + 1 };
	});

	const drag = ref(false);

	const dragOptions = computed(() => ({
		animation: 200,
		group: "description",
		disabled: false,
		ghostClass: "ghost",
	}));

	// SETTINGS CARD (TO BE MOVED TO A SEPARATE COMPONENT)
	watch(ENABLE_NOTIFICATIONS, (value) => {
		userSettings.setNotifications(value);
		if (!value) {
			notiExpand.value = false;
		}
	});

	watch(ENABLE_AUTO_REMOVE_STREAM, (value) => {
		userSettings.setAutoRemove(value);
	});

	// Remove the streamer when they go offline
	watch(activeStreamers, (newvalue, oldvalue) => {
		// check for streamers that have gone offline and remove them
		// console.log("Removing offline streamers");
		// console.log(oldvalue);
		// console.log(newvalue);
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

		if(isSuccess.value && successMsg.value === "Streamer added to list!") return;

		if (newItem && ENABLE_NOTIFICATIONS.value && oldvalue.length > 0) {
			console.log("New item found:", newItem);
			const newNoti = {
				streamer_name: newItem.user_name,
				view_count: newItem.viewer_count.toString(),
				timestamp: new Date(),
			};
			activeNotifications.value = [newNoti, ...activeNotifications.value];
			
			if (notiExpand.value) return;
			notiExpand.value = true;
			setTimeout(() => {
				notiExpand.value = false;
			}, 5000);
		} else {
			// console.log("No new item found.");
		}

		if (!ENABLE_AUTO_REMOVE_STREAM.value) return;

		offlineStreamers.forEach((streamer) => {
			embedsListStore.removeEmbed(streamer.user_name);
			if (streamer.user_name === expandedEmbed.value) {
				isExpand.value = false;
				expandedEmbed.value = "";
			}
			console.log("Removing streamer: " + streamer.user_name);
		});
	});
	
	watch(ENABLE_REMEMBER_LAST_LAYOUT, (value) => {
		userSettings.setRememberLastLayout(value);
	});

	// watch(activeStreamers, (oldvalue, newvalue) => {
	// 	if (!ENABLE_NOTIFICATIONS) return;
	//   // Check for new streamers and show a notification
	//   console.log(oldvalue, newvalue);

	// });


	const isExpand = ref<boolean>(false);
	const expandedEmbed = ref<string>("");
	const expandEmbed = (streamer: string) => {
		// console.log(streamer);

		if (isExpand.value && expandedEmbed.value === streamer) {
			isExpand.value = false;
			expandedEmbed.value = "";
			return;
		}
		isExpand.value = true;
		expandedEmbed.value = streamer;
	};

	const isFullscreen = ref<boolean>(false);
	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen()
			isFullscreen.value = true
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen()
				isFullscreen.value = false
			}
		}
	};

	const isDragging = ref<boolean>(false);
	
	const debugStreamer: string = 'LinusTech'

	const debugRemoveStreamer = () => {
		console.log("Removing streamer");
		activeStreamers.value = activeStreamers.value.filter(
			(streamer) => streamer.user_name !== debugStreamer
		);
	};

	const debugAddStreamer = () => {
		console.log("Adding streamer");

		activeStreamers.value = [
			...activeStreamers.value,
			{
				user_name: debugStreamer,
				viewer_count: 888888,
				profile_picture: "https://octo.party/logo.svg",
			},
		];
	};
</script>

<template>
		<DebugMenu
		:SHOW_DEBUG_MENU="SHOW_DEBUG_MENU"
		@debugAddStreamer="debugAddStreamer"
		@debugRemoveStreamer="debugRemoveStreamer"
		/>
	<main
		@mousemove="handleMouseMove"
		@mouseleave="handleMouseLeave"
		@mouseup="handleMainClick"
	>
		<div
			class="octo-ui"
			:class="{
				hidden: isIdle,
				show: listExpand || notiExpand || embedsListStore.embedsList.length === 0,
				'edit-mode': editMode,
			}"
			@mouseenter="handleMouseEnter"
			@mouseleave="handleMouseLeave"
		>
			<!-- QR Code Card -->
			<v-expand-transition>
				<v-card v-if="listExpand && url" variant="elevated" class="share-card">
					<v-row class="d-flex justify-space-between align-center ma-0">
						<v-col cols="5" class="pa-5">
							<qrcode-vue
								class="qrcode"
								:value="QRvalue"
								:level="level"
								:render-as="renderAs"
							/>
						</v-col>
						<v-col cols="7" class="pa-5 pl-0">
							<v-text-field
								:value="url"
								variant="solo-filled"
								append-inner-icon="mdi-content-copy"
								@click:append-inner="copySharedLink"
								@keydown.enter="copySharedLink"
								hide-details
								class="copy-url"
							></v-text-field>
						</v-col>
					</v-row>
				</v-card>
			</v-expand-transition>
			<!-- Settings Card -->
			<v-expand-transition>
				<v-card v-if="listExpand" variant="elevated" class="share-card">
					<v-row class="d-flex justify-space-between align-center ma-0">
						<v-col cols="12" class="pa-5 pb-2 pt-2">
							<v-list-item class="pa-0" v-if="ENABLE_DEBUG">
								<v-switch
									label="Enable Debug Mode"
									v-model="SHOW_DEBUG_MENU"
									inset
									color="deep-purple-darken-1"
								></v-switch>
							</v-list-item>
							<v-list-item class="pa-0">
								<v-switch
									label="Show Notifications"
									v-model="ENABLE_NOTIFICATIONS"
									inset
									color="deep-purple-darken-1"
								></v-switch>
							</v-list-item>
							<v-list-item class="pa-0">
								<v-switch
									label="Auto Remove Offline Streams"
									v-model="ENABLE_AUTO_REMOVE_STREAM"
									inset
									color="deep-purple-darken-1"
								></v-switch>
							</v-list-item>
							<v-list-item class="pa-0">
								<v-switch
									label="Remember Last Layout"
									v-model="ENABLE_REMEMBER_LAST_LAYOUT"
									inset
									color="deep-purple-darken-1"
								></v-switch>
							</v-list-item>
						</v-col>
					</v-row>
				</v-card>
			</v-expand-transition>
			<!-- Main Menu Card -->
			<v-expand-transition>
				<v-card
					v-if="listExpand"
					variant="elevated"
					class="favs-menu mx-auto"
					:loading="loading"
				>
					<v-row no-gutters class="align-center">
						<v-col cols="12" class="pa-5">
							<v-text-field
								label="Search"
								variant="solo-filled"
								append-inner-icon="mdi-magnify"
								@click:append-inner="addNewStreamer"
								@keydown.enter="addNewStreamer"
								v-model="searchedStreamer"
								hide-details
							></v-text-field>
						</v-col>
					</v-row>
					<v-row no-gutters class="pl-5 pr-5 pb-5">
						<v-col
							cols="12"
							v-if="octoStore.octoData.length !== 0"
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

							<v-tooltip v-model="showShare" location="bottom">
								<template v-slot:activator="{ props }">
									<v-btn
										prepend-icon="mdi-share"
										variant="flat"
										color="grey-darken-3"
										@click="shareList"
										:loading="shareLoading"
										v-if="octoStore.octoData.length !== 0"
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
							<v-list>
								<h4 v-if="activeStreamers.length >= 1">
									Streaming ({{ activeStreamers.length }})
								</h4>
								<v-list-item
									v-for="(actStreamer, index) in activeStreamers"
									:key="index"
									@click="addEmbed(actStreamer.user_name)"
									class="streaming_row"
								>
									<v-btn
										class="deletebtn"
										:class="{ 'deletebtn-hide': !editMode }"
										variant="plain"
										icon="mdi-delete"
										color="red-accent-2"
										@click="(event: MouseEvent) => removeShareItem(actStreamer.user_name, event)"
										v-auto-animate
									>
									</v-btn>
									<img :src="actStreamer.profile_picture" alt="Profile picture" class="profile_picture">
									<span class="active_streamer">{{
										actStreamer.user_name
									}}</span>
									<span class="streamer_views">{{
										actStreamer.viewer_count
									}}</span>
								</v-list-item>
								<v-divider
									class="ma-5"
									v-if="activeStreamers.length >= 1"
								></v-divider>
								<h4 v-if="inactiveStreamers.length >= 1">
									Not Streaming ({{ inactiveStreamers.length }})
								</h4>
								<v-list-item
									v-for="(nonActStreamer, index) in inactiveStreamers"
									:key="index"
									class="non-streaming_row"
								>
									<v-btn
										class="deletebtn"
										:class="{ 'deletebtn-hide': !editMode }"
										variant="plain"
										icon="mdi-delete"
										color="red-accent-2"
										@click="(event: MouseEvent) => removeShareItem(nonActStreamer.user_name, event)"
										v-auto-animate
									>
									</v-btn>
									<img :src="nonActStreamer.profile_picture" alt="Profile picture" class="profile_picture">
									{{ nonActStreamer.user_name }}
								</v-list-item>
								<div
									v-if="octoStore.octoData.length === 0"
									class="mt-3 text-center"
									style="display: block"
								>
									<h2>Your list is empty :(</h2>
									<br />
									<!-- <span>You can add streamers by searching for them</span> -->
								</div>
							</v-list>
						</v-col>
						<v-row cols="6" class="d-flex align-center ma-0 mt-5" style="flex-direction: column">
							<div>
								<v-btn prepend-icon="mdi-github" stacked variant="plain" color="grey-darken-1" href="https://github.com/Tyaaa-aa/Octo-Party-V2/" target="_blank">
									Github
								</v-btn>
								
								<v-btn prepend-icon="mdi-information-outline" stacked variant="plain" color="grey-darken-1" @click="goToAboutPage">
									About
								</v-btn>
							</div>
							<span class="pa-2 text-center">
								Concept by <a href="https://surya.place/" target="_blank">Surya</a> |
								Developed by <a href="https://tya.design/" target="_blank">Tya</a>
							</span>
						</v-row>
					</v-row>
				</v-card>
			</v-expand-transition>
			<!-- Menu Button -->
			<div class="btns-box">
				<v-btn
					:icon="!listExpand ? 'mdi-menu' : 'mdi-close'"
					:class="!listExpand ? 'main-btn' : 'main-btn main-btn-close'"
					variant="elevated"
					color="deep-purple-darken-1"
					@click="handleFavsMenu('toggle')"
				>
				</v-btn>
				<v-btn
					:icon="!isFullscreen ? 'mdi-fullscreen' : 'mdi-fullscreen-exit'"
					:class="ENABLE_NOTIFICATIONS ? 'fullscreen-btn' : 'fullscreen-btn fullscreen-btn-right'"
					variant="plain"
					color="grey-lighten-5"
					@click="toggleFullscreen"
				>
				</v-btn>
				<div>
					<v-expand-transition>
						<v-btn
							:icon="!notiExpand ? 'mdi-bell-outline' : 'mdi-close'"
							:variant="!notiExpand ? 'plain' : 'elevated'"
							:color="!notiExpand ? 'grey-lighten-5' : 'deep-purple-darken-1'"
							@click="notiExpand = !notiExpand"
							:class="
								!notiExpand
									? 'toggleNotiBtn main-btn'
									: 'toggleNotiBtn main-btn main-btn-close'
							"
							v-if="ENABLE_NOTIFICATIONS"
						>
						</v-btn>
					</v-expand-transition>
					<v-slide-y-transition>
						<span
							class="notiCount"
							v-if="
								ENABLE_NOTIFICATIONS &&
								!notiExpand &&
								activeNotifications.length > 0
							"
							>{{ activeNotifications.length }}
						</span>
					</v-slide-y-transition>
				</div>
			</div>
			<!-- Notifications Card -->
			<v-expand-transition>
				<v-card
					v-if="notiExpand && ENABLE_NOTIFICATIONS"
					variant="elevated"
					:class="
						activeNotifications.length === 0
							? 'notifications no-notifications'
							: 'notifications'
					"
				>
					<v-row class="d-flex justify-space-between align-center ma-0">
						<v-col cols="12" class="pa-5 pb-2 pt-0">
							<v-list-item class="pa-0 pt-2">
								<h5>
									<span v-if="activeNotifications.length === 0">
										No notifications yet
									</span>
									<span v-else>
										Notifications ({{ activeNotifications.length }})
									</span>
								</h5>
								<v-btn
									variant="text"
									text="Clear All"
									color="deep-purple-darken-1"
									@click="
										activeNotifications = [];
										notiExpand = false;
									"
									v-if="activeNotifications.length > 0"
								></v-btn>
							</v-list-item>
						</v-col>
						<v-col
							cols="12"
							class="pa-3 pt-2 pb-1 notifications-list"
							style="max-height: 200px; overflow: auto"
							v-if="activeNotifications.length > 0"
						>
							<v-list-item
								class="pa-2 pt-1"
								v-for="notificationItem in activeNotifications"
								:key="notificationItem.streamer_name"
							>
								<p class="notification-item">
									<span
										class="notification-time"
										:title="
											notificationItem.timestamp.toLocaleTimeString() +
											' - ' +
											notificationItem.timestamp.toDateString()
										"
										>{{
											notificationItem.timestamp.toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
												hour12: true,
											})
										}}</span
									>{{ notificationItem.streamer_name }} is live!
								</p>
								<div>
									<v-btn
										text="Add"
										color="deep-purple-darken-1"
										class="ma-1"
										@click="
											addEmbed(notificationItem.streamer_name);
											activeNotifications = activeNotifications.filter(
												(notification) =>
													notification.streamer_name !==
													notificationItem.streamer_name
											);
										"
									></v-btn>
									<v-btn
										variant="plain"
										icon="mdi-close"
										color="grey-lighten-1"
										@click="
											activeNotifications = activeNotifications.filter(
												(notification) =>
													notification.streamer_name !==
													notificationItem.streamer_name
											)
										"
									></v-btn>
								</div>
							</v-list-item>
						</v-col>
					</v-row>
				</v-card>
			</v-expand-transition>
		</div>
		<!-- Embedded Streams -->
		<draggable
			v-model="embedsListStore.embedsList"
			item-key="id"
			:class="
				!isExpand
					? 'embeds-container'
					: 'embeds-container embeds-container-expand'
			"
			drag-class="drag"
			ghost-class="ghost"
			@start="isDragging = true"
			@end="isDragging = false"
			handle=".drag-btn"
		>
			<template #item="{ element }">
				<div
					class="embed-twitch-item"
					:class="{
						'embed-twitch-item expanded-embed': element === expandedEmbed,
						'embed-twitch-item': !(element === expandedEmbed),
						'expand-solo': embedsListStore.embedsList.length === 1 && isExpand,
						'embed-dragging': isDragging,
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
							element === expandedEmbed
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
						(!isExpand && embedsListStore.embedsList.length > 1)
						||
						// Show the drag button if there is more than 2 embeds an embed is expanded
						(isExpand && embedsListStore.embedsList.length > 2)"
					></v-btn>
					<span class="embed-drag-box">{{ element }}</span>
				</div>
			</template>
		</draggable>
	</main>

	<v-snackbar
		:timeout="3000"
		color="red-darken-1"
		v-model="isError"
		rounded="pill"
	>
		<span class="pr-md-5">{{ errorMsg }}</span>
		<v-btn color="red-lighten-1" variant="flat" @click="isError = false">
			Close
		</v-btn>
	</v-snackbar>

	<v-snackbar
		:timeout="3000"
		color="deep-purple-accent-4"
		v-model="isSuccess"
		rounded="pill"
	>
		<span class="pr-md-5">{{ successMsg }}</span>
		<v-btn color="deep-purple-accent-2" variant="flat" @click="isSuccess = false">
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

	.btns-box {
		display: flex;
		gap: 10px;
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

	.share-card {
		width: 400px;
	}

	.qrcode {
		width: 100% !important;
		height: 100% !important;
		aspect-ratio: 1 / 1 !important;
		/* border: 2px solid red; */
	}

	.copy-url {
		/* border: 2px solid blue; */
		width: 100%;
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

	.notifications {
		position: fixed;
		top: 70px;
		right: 40px;
		width: 450px;
		max-height: 250px;
		overflow-y: auto;
		transition: all 0.3s ease-in-out;
	}
	.no-notifications {
		width: 170px;
	}
	.no-notifications * {
		text-align: center !important;
		width: 100%;
	}

	.toggleNotiBtn {
		position: fixed;
		top: 10px;
		right: 20px;
	}
	.fullscreen-btn {
		position: fixed;
		top: 10px;
		right: 70px;
		transition: right 0.3s ease-in-out;
	}
	.fullscreen-btn-right {
		right: 20px;
	}

	.notiCount {
		position: fixed;
		top: 15px;
		right: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		width: 18px;
		height: 18px;
		font-size: 0.8em;
		padding: 2px;
		pointer-events: none;
		z-index: 999;
		background-color: #ef5350;
	}

	.notifications p {
		font-size: 0.95em;
		max-width: 65%;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.notification-time {
		font-size: 0.8em;
		margin-right: 10px;
		/* font-style: italic; */
		color: #8a8a8a;
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

	@media (max-width: 600px) {
		.notifications {
			right: 50%;
			max-width: 90vw;
			transform: translateX(50%);
		}
		.notification-item {
			display: flex;
			align-items: center;
			max-width: 70%;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			margin-right: 5px;
		}
	}
</style>
