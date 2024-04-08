<script lang="ts" setup>
	import { customAlphabet } from "nanoid";

	// import  '/lib/twitch.v1.js'

	const props = defineProps<{
		creator: string;
	}>();

	const twitchEmbed = ref<string>("");

	const nanoid = customAlphabet(
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
		5
	);
	const generatedUUID = nanoid();
	const twitchEmbedID = `twitch-embed-${generatedUUID}`;

	onMounted(() => {
		// const parent = window.location.hostname;
		// twitchEmbed.value = `https://player.twitch.tv/?channel=${props.creator}&parent=${parent}`;
		// console.log(`EmbedTwitch mounted with creator: ${props.creator}`);
	});

	onUnmounted(() => {
		// console.log("Unmounting: " + generatedUUID);
		// console.log(`Unmounting: ${props.creator}`);
	});

	// const iframeSrc = computed(() => twitchEmbed.value);
	const iframeSrc = computed(
		() =>
			`https://player.twitch.tv/?channel=${props.creator}&parent=${window.location.hostname}`
	);
</script>

<template>
	<div :id="twitchEmbedID" class="twitch-embed">
		<iframe
			:src="iframeSrc"
			frameborder="0"
			allowfullscreen="true"
			scrolling="no"
		></iframe>
	</div>
</template>

<style scoped>
	/* .embed-twitch-item {
  margin: 0 auto;
  width: 50%;
  aspect-ratio: 16 / 9;
} */

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
