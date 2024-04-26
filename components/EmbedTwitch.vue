<script lang="ts" setup>
	const globalStore = useGlobalStateStore();
	const userSettings = useSettingStore();
	const props = defineProps<{
		creator: string;
	}>();

	const twitchEmbedRef = ref<HTMLDivElement | null>(null);
	let embed: any;
	onMounted(() => {
		if (twitchEmbedRef.value && window.Twitch) {
			embed = new window.Twitch.Embed(twitchEmbedRef.value, {
				width: "100%",
				height: "100%",
				layout: "video",
				channel: props.creator,
				parent: window.location.hostname,
			});

			embed.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
				const player = embed.getPlayer();
				if (userSettings.Muted || globalStore.isExpand) {
					player.setMuted(true);
				} else {
					player.setMuted(false);
					player.setVolume(userSettings.Volume);
				}
				watch(
					() => userSettings.Volume,
					(newVal) => {
						player.setVolume(newVal);
					}
				);
				watch(
					() => userSettings.Muted,
					(muted) => {
						if (muted) {
							// Mute all when globally muted
							player.setMuted(true);
							return;
						}

						// Unmuting
						if (!userSettings.TheatreAudio) {
							player.setMuted(false);
							return;
						}

						if (!globalStore.isExpand) {
							player.setMuted(false);
							return;
						}

						const isEmbedExpanded =
							globalStore.expandedEmbed.toLowerCase() ===
							props.creator.toLowerCase();

						// Unmute only expanded stream
						if (isEmbedExpanded) {
							player.setMuted(false);
						} else {
							player.setMuted(true);
						}
					}
				);
				watch(
					() => globalStore.expandedEmbed,
					(newVal) => {
						// Return early if TheatreAudio is disabled or user is muted
						if (!userSettings.TheatreAudio || userSettings.Muted) return;

						// Check if the current embed matches the expanded embed
						const isExpandedEmbed =
							globalStore.isExpand &&
							props.creator.toLowerCase() === newVal.toLowerCase();

						// Unmute the player if it's the expanded embed
						if (isExpandedEmbed) {
							player.setMuted(false);
						}
						// Mute the player if it's not the expanded embed
						else {
							player.setMuted(true);
						}

						// If no embed is expanded, set the mute state based on user settings
						if (newVal === "") {
							player.setMuted(userSettings.Muted);
						}
					}
				);

				watch(
					() => userSettings.TheatreAudio,
					(newVal) => {
						if (newVal) {
							const isEmbedExpanded =
								globalStore.expandedEmbed.toLowerCase() ===
								props.creator.toLowerCase();
							if (isEmbedExpanded) {
								player.setMuted(false);
							} else {
								player.setMuted(true);
							}
						} else {
							player.setMuted(userSettings.Muted);
						}
					}
				);
			});
		}
	});

	onUnmounted(() => {
		embed.removeEventListener(window.Twitch.Embed.VIDEO_READY, () => {
			console.log("Removed");
		});
	});
</script>

<template>
	<div ref="twitchEmbedRef"></div>
</template>

<style scoped>
	div,
	#twitchEmbed,
	.twitch-embed,
	iframe {
		width: 100%;
		height: 100%;
	}

	.twitch-embed {
		position: relative;
	}

	.close-btn {
		position: absolute;
		top: 5px;
		right: 5px;
		opacity: 0;
		/* transform: translate(50%, -50%); */
	}

	.twitch-embed:hover .close-btn {
		opacity: 1;
	}

	.close-btn {
		position: absolute;
		top: 5px;
		right: 5px;
		opacity: 0;
		/* transform: translate(50%, -50%); */
	}

	.embed-twitch-item:hover .close-btn {
		opacity: 1;
	}
</style>
