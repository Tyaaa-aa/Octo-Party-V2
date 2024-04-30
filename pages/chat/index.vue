<script setup lang="ts"></script>

<template>
	<div class="chatcontainer">
		<iframe
			id="twitch-chat-embed"
			src="https://www.twitch.tv/embed/pewdiepie/chat?parent=localhost&darkpopout"
			height="100%"
			width="100%"
		>
		</iframe>
	</div>
</template>
<style scoped>
	.chatcontainer {
		min-width: 234px;
		min-height: 200px;
		width: 992px;
		height: 787px;
		resize: horizontal;
		outline: 2px solid red;
	}
</style>
