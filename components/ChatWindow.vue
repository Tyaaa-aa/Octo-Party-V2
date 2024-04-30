<script setup lang="ts">
	const globalStore = useGlobalStateStore();
	const userSettings = useSettingStore();

	const tab = ref(null);
</script>
<template>
	<v-card class="chat">
		<v-tabs v-model="tab" color="deep-purple-lighten-1">
			<v-tab
        align-center
				v-for="streamer in globalStore.embedsList"
				:key="streamer"
				:value="streamer"
			>
				{{ streamer }}
			</v-tab>
		</v-tabs>

		<v-card class="chat-container" variant="flat">
			<v-window v-model="tab">
				<v-window-item
				v-for="streamer in globalStore.embedsList"
				:key="streamer"
				:value="streamer">
        <iframe
        :src="'https://www.twitch.tv/embed/'+streamer+'/chat?darkpopout&parent=localhost'" frameborder="0" width="100%" height="100%"></iframe>
        </v-window-item>
			</v-window>
		</v-card>
	</v-card>
</template>

<style scoped>
	.chat {
		position: fixed;
		top: 5%;
		left: 50%;
		width: 600px;
		height: 900px;
	}

  .chat-container {
    height: 100%;
    padding: 10px;
  }
</style>
