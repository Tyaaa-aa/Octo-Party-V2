<script setup lang="ts">
	const globalStore = useGlobalStateStore();
	const userSettings = useSettingStore();
	const ENABLE_DEBUG = ref<boolean>(false);
	
	watch(() => globalStore.ENABLE_NOTIFICATIONS, (newVal) => {
		userSettings.Notifications = newVal;
		if (!newVal) {
			globalStore.notiExpand = false;
		}
	});

	watch(() => globalStore.ENABLE_AUTO_REMOVE_STREAM, (newVal) => {
		userSettings.AutoRemove = newVal;
	});

	watch(() => globalStore.ENABLE_REMEMBER_LAST_LAYOUT, (newVal) => {
		userSettings.RememberLastLayout = newVal;
	});

	onMounted(() => {
		globalStore.ENABLE_NOTIFICATIONS = userSettings.Notifications;
		globalStore.ENABLE_AUTO_REMOVE_STREAM = userSettings.AutoRemove;
		globalStore.ENABLE_REMEMBER_LAST_LAYOUT = userSettings.RememberLastLayout;

		if (ENABLE_DEBUG.value) globalStore.SHOW_DEBUG_MENU = true

	});
</script>

<template>
	<v-expand-transition>
		<v-card v-if="globalStore.listExpand" variant="elevated" class="share-card">
			<v-row class="d-flex justify-space-between align-center ma-0">
				<v-col cols="12" class="pa-5 pb-2 pt-2">
					<v-list-item class="pa-0" v-if="ENABLE_DEBUG">
						<v-switch
							label="Enable Debug Mode"
							v-model="globalStore.SHOW_DEBUG_MENU"
							inset
							color="deep-purple-darken-1"
						></v-switch>
					</v-list-item>
					<v-list-item class="pa-0">
						<v-switch
							label="Show Notifications"
							v-model="globalStore.ENABLE_NOTIFICATIONS"
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
