<script setup lang="ts">
	const globalStore = useGlobalStateStore();
	const userSettings = useSettingStore();

	const tab = ref(null);
	const url = ref<string>("");

	onMounted(() => {
		url.value = window.location.hostname;
	});
</script>
<template>
	<v-card
		class="embed-twitch-item"
		:class="{
			'expand-solo':
				globalStore.embedsList.length === 1 && globalStore.isExpand,
			'embed-dragging': globalStore.isDragging,
			'chat-solo': globalStore.embedsList.length === 1,
			'chat-solo-expand':
				globalStore.isExpand && globalStore.embedsList.length === 1,
		}"
	>
		<div class="w-100 d-flex justify-center pt-1">
			<v-btn
				icon
				color="deep-purple-darken-1"
				:variant="userSettings.ChatLocation === 'left' ? 'flat' : 'plain'"
				@click="userSettings.ChatLocation = 'left'"
				class="ma-1"
			>
				<v-icon>mdi-chevron-left</v-icon>
			</v-btn>
			<v-btn
				icon
				color="deep-purple-darken-1"
				:variant="userSettings.ChatLocation === 'right' ? 'flat' : 'plain'"
				@click="userSettings.ChatLocation = 'right'"
				class="ma-1"
			>
				<v-icon>mdi-chevron-right</v-icon>
			</v-btn>
		</div>

		<v-tabs v-model="tab" color="deep-purple-lighten-1">
			<v-tab
				align-center
				v-for="streamer in globalStore.embedsList"
				:key="streamer"
				:value="streamer"
				class="font-weight-bold"
			>
				{{ streamer }}
			</v-tab>
		</v-tabs>

		<v-card class="chat-container" variant="flat">
			<v-window v-model="tab">
				<v-window-item
					v-for="streamer in globalStore.embedsList"
					:key="streamer"
					:value="streamer"
				>
					<iframe
						:src="
							'https://www.twitch.tv/embed/' +
							streamer +
							'/chat?darkpopout&parent=' +
							url
						"
						frameborder="0"
						width="100%"
						height="100%"
					></iframe>
				</v-window-item>
			</v-window>
		</v-card>
	</v-card>
</template>

<style scoped>
	.chat-solo {
		height: 100% !important;
		width: 30% !important;
	}

	.chat-container {
		height: 90%;
		padding: 10px;
	}
	.embeds-container-solo-chat .expand-solo .chat-container {
		height: 93%;
	}
</style>
