<script setup lang="ts">
	interface Notification {
		streamer_name: string;
		view_count: string;
		timestamp: Date;
	}
	const props = defineProps<{
		listExpand: Boolean;
		isFullscreen: Boolean;
		notiExpand: Boolean;
		ENABLE_NOTIFICATIONS: Boolean;
		activeNotifications: Notification;
		handleFavsMenu: (action: string) => void;
		toggleFullscreen: () => void;
		toggleNoti: () => void;
	}>();
</script>
<template>
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
			:class="
				ENABLE_NOTIFICATIONS
					? 'fullscreen-btn'
					: 'fullscreen-btn fullscreen-btn-right'
			"
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
					@click="toggleNoti"
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
</template>
<style scoped>
	.btns-box {
		display: flex;
		gap: 10px;
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
</style>
