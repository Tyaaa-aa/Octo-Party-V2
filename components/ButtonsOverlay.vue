<script setup lang="ts">
	const globalStore = useGlobalStateStore();
	const userSettings = useSettingStore();

	const toggleNoti = () => (globalStore.notiExpand = !globalStore.notiExpand);
</script>
<template>
	<ClientOnly>
		<div class="btns-box">
			<v-btn
				:icon="!globalStore.listExpand ? 'mdi-menu' : 'mdi-close'"
				:class="
					!globalStore.listExpand ? 'main-btn' : 'main-btn main-btn-close'
				"
				variant="elevated"
				color="deep-purple-darken-1"
				@click="globalStore.handleMainMenu"
			>
			</v-btn>

			<v-btn
				:icon="
					userSettings.Chat ? 'mdi-message-outline' : 'mdi-message-off-outline'
				"
				variant="plain"
				color="grey-lighten-5"
				:class="
					globalStore.ENABLE_NOTIFICATIONS
						? 'chat-btn'
						: 'chat-btn chat-btn-right'
				"
				@click="userSettings.Chat = !userSettings.Chat"
			>
			</v-btn>
			<div
				:class="
					globalStore.ENABLE_NOTIFICATIONS
						? 'volumePanel'
						: 'volumePanel volumePanel-right'
				"
			>
				<VolumePanel />
			</div>
			<v-btn
				:icon="
					!globalStore.isFullscreen ? 'mdi-fullscreen' : 'mdi-fullscreen-exit'
				"
				:class="
					globalStore.ENABLE_NOTIFICATIONS
						? 'fullscreen-btn'
						: 'fullscreen-btn fullscreen-btn-right'
				"
				variant="plain"
				color="grey-lighten-5"
				@click="globalStore.toggleFullscreen"
			>
			</v-btn>
			<div>
				<v-expand-transition>
					<v-btn
						:icon="!globalStore.notiExpand ? 'mdi-bell-outline' : 'mdi-close'"
						:variant="!globalStore.notiExpand ? 'plain' : 'elevated'"
						:color="
							!globalStore.notiExpand
								? 'grey-lighten-5'
								: 'deep-purple-darken-1'
						"
						@click="toggleNoti"
						:class="
							!globalStore.notiExpand
								? 'toggleNotiBtn main-btn'
								: 'toggleNotiBtn main-btn main-btn-close'
						"
						v-if="globalStore.ENABLE_NOTIFICATIONS"
					>
					</v-btn>
				</v-expand-transition>
				<v-slide-y-transition>
					<span
						class="notiCount"
						v-if="
							globalStore.ENABLE_NOTIFICATIONS &&
							!globalStore.notiExpand &&
							globalStore.activeNotifications.length > 0
						"
						>{{ globalStore.activeNotifications.length }}
					</span>
				</v-slide-y-transition>
			</div>
		</div>
	</ClientOnly>
</template>
<style scoped>
	.btns-box {
		display: flex;
		gap: 10px;
	}

	.toggleNotiBtn {
		position: fixed;
		top: 15px;
		right: 20px;
	}
	.fullscreen-btn {
		position: fixed;
		top: 15px;
		right: 70px;
		transition: right 0.3s ease-in-out;
	}
	.fullscreen-btn-right {
		right: 20px;
	}
	.notiCount {
		position: fixed;
		top: 20px;
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
	.volumePanel {
		position: fixed;
		top: 15px;
		right: 170px;
		transition: right 0.3s ease-in-out;
	}
	.volumePanel-right {
		right: 120px;
	}

	.chat-btn {
		position: fixed;
		top: 15px;
		right: 120px;
		transition: right 0.3s ease-in-out;
	}
	.chat-btn-right {
		right: 70px;
	}
</style>
