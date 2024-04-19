<script setup lang="ts">
    import type { Notification } from "@/types/index";
	const props = defineProps<{
		notiExpand: Boolean;
		ENABLE_NOTIFICATIONS: Boolean;
		activeNotifications: Notification[];
		addEmbed: (streamer_name: string) => void;
	}>();
</script>
<template>
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
							@click="$emit('clearAllNotifications')"
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
								@click="$emit('addEmbedFromNoti', notificationItem.streamer_name)"
							></v-btn>
							<v-btn
								variant="plain"
								icon="mdi-close"
								color="grey-lighten-1"
								@click="$emit('removeNoti', notificationItem.streamer_name)"
							></v-btn>
						</div>
					</v-list-item>
				</v-col>
			</v-row>
		</v-card>
	</v-expand-transition>
</template>
<style scoped>
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
