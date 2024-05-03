<script setup lang="ts">
	const globalStore = useGlobalStateStore();
	const userSettings = useSettingStore();
	const ENABLE_DEBUG = ref<boolean>(true);

	watch(
		() => globalStore.ENABLE_NOTIFICATIONS,
		(newVal) => {
			userSettings.Notifications = newVal;
			if (!newVal) {
				globalStore.notiExpand = false;
			}
		}
	);

	watch(
		() => globalStore.ENABLE_AUTO_REMOVE_STREAM,
		(newVal) => {
			userSettings.AutoRemove = newVal;
		}
	);

	watch(
		() => globalStore.ENABLE_REMEMBER_LAST_LAYOUT,
		(newVal) => {
			userSettings.RememberLastLayout = newVal;
		}
	);

	const btnToggle = ref<string[]>([]);

	onMounted(() => {
		globalStore.ENABLE_NOTIFICATIONS = userSettings.Notifications;
		globalStore.ENABLE_AUTO_REMOVE_STREAM = userSettings.AutoRemove;
		globalStore.ENABLE_REMEMBER_LAST_LAYOUT = userSettings.RememberLastLayout;

		if (ENABLE_DEBUG.value) globalStore.SHOW_DEBUG_MENU = true;

		if (userSettings.Notifications) {
			btnToggle.value.push("notification");
		}
		if (userSettings.TheatreAudio) {
			btnToggle.value.push("theater");
		}
	});

	const dialog = ref(false);

	const clearAllStreams = () =>{
		globalStore.clearAllStreams()
		btnToggle.value = btnToggle.value.filter(item => item !== "clear");
	}
	const handleClearStream = () => {
		if (!dialog.value) {
			dialog.value = true;
		} else {
			clearAllStreams();
			dialog.value = false;
		}
	};

	watch(()=>globalStore.listExpand, (newVal) => {
		if (!newVal) {
			dialog.value = false;
			btnToggle.value = btnToggle.value.filter(item => item !== "clear");
		}
	});


	// watch(btnToggle, (newVal) => {
	// 	console.log(newVal);
	// });
</script>

<template>
	<v-expand-transition>
		<v-card
			v-if="globalStore.listExpand"
			variant="elevated"
			class="settings-toggles"
		>
			<v-btn-toggle
				v-model="btnToggle"
				borderless
				rounded="0"
				multiple
				class="settings-toggles"
			>
				<v-btn
				value="notification"
				@click="globalStore.ENABLE_NOTIFICATIONS = !globalStore.ENABLE_NOTIFICATIONS"
				:color="globalStore.ENABLE_NOTIFICATIONS ? 'deep-purple-darken-1' : 'grey-darken-5'"
				title="Get Notified When A Streamer Goes Live"
				>
					<v-icon
						start
						class="ma-1"
						size="large"
						v-if="userSettings.Notifications"
					>
						mdi-bell-outline
					</v-icon>
					<v-icon start class="ma-1" size="large" v-else> mdi-bell-off </v-icon>
				</v-btn>

				<v-btn
				value="theater"
				@click="userSettings.TheatreAudio = !userSettings.TheatreAudio"
				:color="userSettings.TheatreAudio ? 'deep-purple-darken-1' : 'grey-darken-5'"
				title="Theatre Mode Audio Enables Audio Only For Expanded Stream"
				>
					<v-icon start class="ma-1" size="large"> mdi-theater </v-icon>
				</v-btn>

				<v-btn
				value="clear"
				@click="handleClearStream"
				class="clearStreamsBtn"
				:disabled="!(globalStore.embedsList.length > 0)"
				:color="!dialog ? 'grey-darken-5' : 'red-darken-1'"
				title="Clear All Active Streams. This Does Not Affect Your List."
				>
					<span class="hidden-sm-and-down" v-if="!dialog">Clear All</span>
					<span class="hidden-sm-and-down" v-else>Confirm</span>
				</v-btn>
			</v-btn-toggle>
		</v-card>
	</v-expand-transition>
	<v-expand-transition>
		<v-card
			v-if="globalStore.listExpand"
			variant="elevated"
			class="settings-card"
		>
			<v-row class="d-flex justify-space-between align-center ma-0">
				<v-col cols="12" class="pa-5 pb-2 pt-2">
					<v-list-item class="pa-0" v-if="ENABLE_DEBUG">
						<v-switch
							label="Debug Menu"
							v-model="globalStore.SHOW_DEBUG_MENU"
							inset
							color="deep-purple-darken-1"
						></v-switch>
					</v-list-item>
					<v-list-item class="pa-0">
						<v-switch
							label="Auto Remove Offline Streams"
							v-model="globalStore.ENABLE_AUTO_REMOVE_STREAM"
							inset
							color="deep-purple-darken-1"
						></v-switch>
					</v-list-item>
					<v-list-item class="pa-0">
						<v-switch
							label="Remember Last Layout"
							v-model="globalStore.ENABLE_REMEMBER_LAST_LAYOUT"
							inset
							color="deep-purple-darken-1"
						></v-switch>
					</v-list-item>
				</v-col>
			</v-row>
		</v-card>
	</v-expand-transition>
</template>
<style scoped>
	.settings-toggles,
	.settings-card {
		width: 400px;
	}

	.settings-toggles {
		height: 50px;
		display: flex;
		justify-content: space-around;
	}
	.settings-toggles > .v-btn {
		width: 33%;
	}
</style>
