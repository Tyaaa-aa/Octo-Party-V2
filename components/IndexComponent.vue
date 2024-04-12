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

	const octoStore = useOctoStore(); // Using the store
	const userSettings = useSettingStore();

	const listExpand = ref<boolean>(false);
	const notiExpand = ref<boolean>(false);

	const ENABLE_DEBUG = ref<boolean>(false);
	const SHOW_DEBUG_MENU = ref<boolean>(ENABLE_DEBUG.value);
	const ENABLE_NOTIFICATIONS = ref<boolean>(userSettings.Notifications);
	const ENABLE_AUTO_REMOVE_STREAM = ref<boolean>(userSettings.AutoRemove);
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
			(streamer) => streamer.user_name !== item
		);
		inactiveStreamers.value = inactiveStreamers.value.filter(
			(streamer) => streamer !== item
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

	interface OnlineData {
		user_name: string;
		viewer_count: number;
	}

	const embedsListStore = useEmbedsListStore();

	const addEmbed = (streamer: string) => {
		if (embedsListStore.embedsList.includes(streamer)) return;
		embedsListStore.addEmbed(streamer);
	};

	const removeEmbed = (streamer: string) => {
		console.log(embedsListStore.embedsList);

		// console.log(streamer)

		embedsListStore.removeEmbed(streamer);

		console.log(embedsListStore.embedsList);
	};

	const errorMsg = ref<string>("");
	const isError = ref<boolean>(false);

	const activeStreamers = ref<OnlineData[]>([]);
	const inactiveStreamers = ref<string[]>(octoStore.octoData);

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
			const response = await $fetch(`/api/twitch-streamer-status`, {
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

			const { offline, online } = response.data as {
				offline: string[];
				online: OnlineData[];
			};

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

	// If the user has disabled notifications, close the notifications panel
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
		console.log(oldvalue);
		console.log(newvalue);
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

		if (newItem && ENABLE_NOTIFICATIONS.value && oldvalue.length > 0) {
			console.log("New item found:", newItem);
			const newNoti = {
				streamer_name: newItem.user_name,
				view_count: newItem.viewer_count.toString(),
				timestamp: new Date(),
			};
			activeNotifications.value = [newNoti, ...activeNotifications.value];
		} else {
			console.log("No new item found.");
		}

		if (!ENABLE_AUTO_REMOVE_STREAM.value) return;

		offlineStreamers.forEach((streamer) => {
			embedsListStore.removeEmbed(streamer.user_name);
			console.log("Removing streamer: " + streamer.user_name);
		});
	});

	// watch(activeStreamers, (oldvalue, newvalue) => {
	// 	if (!ENABLE_NOTIFICATIONS) return;
	//   // Check for new streamers and show a notification
	//   console.log(oldvalue, newvalue);

	// });

	const debugRemoveStreamer = () => {
		console.log("Removing streamer");
		activeStreamers.value = activeStreamers.value.filter(
			(streamer) => streamer.user_name !== "LinusTech"
		);
	};

	const debugAddStreamer = () => {
		console.log("Adding streamer");

		activeStreamers.value = [
			...activeStreamers.value,
			{
				user_name: "LinusTech",
				viewer_count: 1000000,
			},
		];
	};
</script>

<template>
	<v-expand-transition>
		<div
			id="debug"
			style="
				position: fixed;
				bottom: 90px;
				right: 460px;
				width: 300px;
				z-index: 99999;
			"
			v-if="SHOW_DEBUG_MENU"
		>
			<v-card>
				<v-row class="d-flex justify-space-between align-center ma-0">
					<v-col cols="12" class="pa-5 pb-2 pt-2">
						<v-list-item class="pa-0">
							<h5 style="color: orange">Debug Menu</h5>
						</v-list-item>
						<v-list-item class="pa-4" @click="debugAddStreamer">
							Add Streamer
						</v-list-item>
						<v-list-item class="pa-4" @click="debugRemoveStreamer">
							Remove Streamer
						</v-list-item>
						<v-list-item class="pa-4" @click="checkStreamerStatus()">
							Refresh List
						</v-list-item>
					</v-col>
				</v-row>
			</v-card>
		</div>
	</v-expand-transition>
	<main
		@mousemove="handleMouseMove"
		@mouseleave="handleMouseLeave"
		@mouseup="handleMainClick"
	>
		<div
			class="octo-ui"
			:class="{
				hidden: isIdle,
				show: listExpand || notiExpand,
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
						<!-- <div class="copy-url">
            <a :href=url>{{ url !== "" ? url : 'Shared URL' }}</a>
            <v-btn icon="mdi-content-copy" variant="flat" color="grey-darken-3" @click="copySharedLink"></v-btn>
          </div> -->
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
								>
									<v-btn
										class="deletebtn"
										:class="{ 'deletebtn-hide': !editMode }"
										variant="plain"
										icon="mdi-delete"
										color="red-accent-2"
										@click="(event: MouseEvent) => removeShareItem(nonActStreamer, event)"
										v-auto-animate
									>
									</v-btn>
									{{ nonActStreamer }}
								</v-list-item>
								<div
									v-if="octoStore.octoData.length === 0"
									class="mt-3"
									style="display: block"
								>
									<h2>Your list is empty :(</h2>
									<br />
									<span>You can add streamers by searching for them</span>
								</div>
							</v-list>
						</v-col>
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
			class="embeds-container"
			drag-class="drag"
			ghost-class="ghost"
		>
			<template #item="{ element }">
				<keep-alive>
					<div class="embed-twitch-item">
						<EmbedTwitch :creator="element" :key="element" />
						<v-btn
							icon="mdi-close"
							@click="removeEmbed(element)"
							class="close-btn"
							color="deep-purple-darken-1"
						></v-btn>
						<span class="stream-title">{{ element }}</span>
					</div>
				</keep-alive>
			</template>
		</draggable>
	</main>

	<v-snackbar
		:timeout="3000"
		color="yellow-darken-3"
		variant="tonal"
		v-model="isError"
		rounded="pill"
	>
		<span class="pr-md-5">{{ errorMsg }}</span>
		<v-btn color="yellow-lighten-3" variant="text" @click="isError = false">
			Close
		</v-btn>
	</v-snackbar>

	<v-snackbar
		:timeout="3000"
		color="green-darken-2"
		variant="tonal"
		v-model="isSuccess"
		rounded="pill"
	>
		<span class="pr-md-5">{{ successMsg }}</span>
		<v-btn color="green-accent-4" variant="text" @click="isSuccess = false">
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
		right: 40px;
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
		padding-top: 0;
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
		/* border: 2px solid orange; */
	}

	.close-btn {
		position: absolute;
		top: 5px;
		right: 40px;
		opacity: 0;
		transform: translate(100%, -100%) scale(0.5);
	}

	.embed-twitch-item:hover .close-btn {
		opacity: 1;
		transform: translate(0, 0) scale(0.7);
		transition: all 0.2s ease-in-out;
	}

	.close-btn:hover {
		filter: hue-rotate(80deg);
	}

	.stream-title {
		position: absolute;
		top: 10px;
		right: 100px;
		border-radius: 50px;
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		padding: 5px 20px;
		font-size: 1.2rem;
		font-weight: bold;
		text-align: center;
		text-shadow: 1px 1px 2px black;
		backdrop-filter: blur(5px);
		opacity: 0;
		user-select: none;
		cursor: grab;
		transition: all 0.2s ease-in-out;
		/* border: 2px solid red; */
	}

	.embed-twitch-item:hover .stream-title {
		opacity: 1;
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

	/* Responsive adjustments */
	@media (max-width: 1280px) {
		.embeds-container {
			grid-template-columns: 1fr;
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
