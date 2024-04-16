<script setup>
const props = defineProps({
    listExpand: Boolean,
    ENABLE_DEBUG: Boolean,
    SHOW_DEBUG_MENU: Boolean,
    ENABLE_NOTIFICATIONS: Boolean,
    ENABLE_AUTO_REMOVE_STREAM: Boolean,
});
</script>

<template>
	<v-expand-transition>
		<v-card v-if="props.listExpand" variant="elevated" class="share-card">
			<v-row class="d-flex justify-space-between align-center ma-0">
				<v-col cols="12" class="pa-5 pb-2 pt-2">
					<v-list-item class="pa-0" v-if="props.ENABLE_DEBUG">
						<v-switch
							label="Enable Debug Mode"
							v-model="props.SHOW_DEBUG_MENU"
							inset
							color="deep-purple-darken-1"
						></v-switch>
					</v-list-item>
					<v-list-item class="pa-0">
						<v-switch
							label="Show Notifications"
							v-model="props.ENABLE_NOTIFICATIONS"
							inset
							color="deep-purple-darken-1"
						></v-switch>
					</v-list-item>
					<v-list-item class="pa-0">
						<v-switch
							label="Auto Remove Offline Streams"
							v-model="props.ENABLE_AUTO_REMOVE_STREAM"
							inset
							color="deep-purple-darken-1"
						></v-switch>
					</v-list-item>
				</v-col>
			</v-row>
		</v-card>
	</v-expand-transition>
</template>
