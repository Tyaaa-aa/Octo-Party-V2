<script setup lang="ts">
	const props = defineProps({
		listExpand: Boolean,
		SHOW_DEBUG_MENU: Boolean,
	});

	const emit = defineEmits([
		"showDebugMenu",
		"enableNotifications",
		"enableAutoRemoveStream",
		"enableRememberLastLayout",
	]);

	const ENABLE_DEBUG = ref<boolean>(false);

	const showDebugMenu = ref<boolean>();
	const enableNotifications = ref<boolean>();
	const enableAutoRemoveStream = ref<boolean>();
	const enableRememberLastLayout = ref<boolean>();

	watch(showDebugMenu, (newVal) => {
		emit("showDebugMenu", newVal);
	});

	watch(enableNotifications, (newVal) => {
		emit("enableNotifications", newVal);
	});

	watch(enableAutoRemoveStream, (newVal) => {
		emit("enableAutoRemoveStream", newVal);
	});

	watch(enableRememberLastLayout, (newVal) => {
		emit("enableRememberLastLayout", newVal);
	});

	const userSettings = useSettingStore();

	onMounted(() => {
		enableNotifications.value = userSettings.Notifications;
		enableAutoRemoveStream.value = userSettings.AutoRemove;
		enableRememberLastLayout.value = userSettings.RememberLastLayout;

		if (ENABLE_DEBUG.value) {
			showDebugMenu.value = !showDebugMenu.value;
			emit("showDebugMenu", true);
		}
	});
</script>

<template>
	<v-expand-transition>
		<v-card v-if="listExpand" variant="elevated" class="share-card">
			<v-row class="d-flex justify-space-between align-center ma-0">
				<v-col cols="12" class="pa-5 pb-2 pt-2">
					<v-list-item class="pa-0" v-if="ENABLE_DEBUG">
						<v-switch
							label="Enable Debug Mode"
							v-model="showDebugMenu"
							inset
							color="deep-purple-darken-1"
						></v-switch>
					</v-list-item>
					<v-list-item class="pa-0">
						<v-switch
							label="Show Notifications"
							v-model="enableNotifications"
							inset
							color="deep-purple-darken-1"
						></v-switch>
					</v-list-item>
					<v-list-item class="pa-0">
						<v-switch
							label="Auto Remove Offline Streams"
							v-model="enableAutoRemoveStream"
							inset
							color="deep-purple-darken-1"
						></v-switch>
					</v-list-item>
					<v-list-item class="pa-0">
						<v-switch
							label="Remember Last Layout"
							v-model="enableRememberLastLayout"
							inset
							color="deep-purple-darken-1"
						></v-switch>
					</v-list-item>
				</v-col>
			</v-row>
		</v-card>
	</v-expand-transition>
</template>
