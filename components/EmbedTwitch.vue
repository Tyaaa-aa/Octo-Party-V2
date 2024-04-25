<script lang="ts" setup>
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
				if (userSettings.Muted) {
					player.setMuted(true)
				} else {
					player.setMuted(false)
					player.setVolume(userSettings.Volume);
				}
				watch(() => userSettings.Volume, (newVal) => {
					player.setVolume(newVal);
				});
				watch(() => userSettings.Muted, (newVal) => {
					player.setMuted(newVal);
					if (!newVal) {
						player.setVolume(userSettings.Volume);
					}
				});
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
