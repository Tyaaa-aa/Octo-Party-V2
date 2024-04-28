<script lang="ts" setup>
	const globalStore = useGlobalStateStore();
	const userSettings = useSettingStore();

	const expandEmbed = (streamer: string) => {
		// console.log(streamer);
		if (globalStore.isExpand && globalStore.expandedEmbed === streamer) {
			globalStore.isExpand = false;
			globalStore.expandedEmbed = "";
			return;
		}
		globalStore.isExpand = true;
		globalStore.expandedEmbed = streamer;
	};
</script>

<template>
	<draggable
		v-model="globalStore.embedsList"
		item-key="id"
		:class="{
			'embeds-container': !globalStore.isExpand,
			'embeds-container-expand': globalStore.isExpand,
			'embeds-container-solo': globalStore.embedsList.length === 1,
			'embeds-less4': globalStore.embedsList.length < 4 && !globalStore.isExpand,
		}"
		drag-class="drag"
		ghost-class="ghost"
		@start="globalStore.isDragging = true"
		@end="globalStore.isDragging = false"
		handle=".drag-btn"
	>
		<template #item="{ element }">
			<div
				class="embed-twitch-item"
				:class="{
					'embed-twitch-item expanded-embed':
						element === globalStore.expandedEmbed,
					'embed-twitch-item': !(element === globalStore.expandedEmbed),
					'expand-solo':
						globalStore.embedsList.length === 1 && globalStore.isExpand,
					'embed-dragging': globalStore.isDragging,
					'embed-solo': globalStore.embedsList.length === 1,
				}"
			>
				<EmbedTwitch :creator="element" :key="element" />
				<v-btn
					icon="mdi-close"
					@click="globalStore.removeEmbed(element)"
					class="close-btn"
					color="deep-purple-darken-1"
				></v-btn>
				<v-btn
					:icon="
						element === globalStore.expandedEmbed
							? 'mdi-arrow-collapse'
							: 'mdi-arrow-expand'
					"
					@click="expandEmbed(element)"
					class="expand-btn"
					color="deep-purple-darken-1"
				></v-btn>
				<v-btn
					icon="mdi-drag"
					class="drag-btn"
					color="grey-lighten-2"
					variant="text"
					v-if="
						// Show the drag button if there is more than 1 embed an embed is not expanded
						(!globalStore.isExpand && globalStore.embedsList.length > 1) ||
						// Show the drag button if there is more than 2 embeds an embed is expanded
						(globalStore.isExpand && globalStore.embedsList.length > 2)
					"
				></v-btn>
				<span class="embed-drag-box">{{ element }}</span>
			</div>
		</template>
	</draggable>
</template>

<style scoped>
	.embeds-container {
		width: 100%;
		display: grid;
		padding: 20px;
		padding-top: 40px;
		grid-template-columns: repeat(auto-fill, minmax(33vw, 1fr));
		gap: 10px;
		place-items: center;
	}
	.embeds-less4 {
		height: 100%;
	}
	.embeds-container-solo {
		grid-template-columns: 1fr;
		place-items: center;
		height: 100%;
	}
	.embed-twitch-item {
		margin: 0 auto;
		width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: 7px;
		overflow: hidden;
		position: relative;
		transition: all 0.2s ease-in-out;
		max-height: 46.5vh;
	}
	.embed-solo {
		height: 100%;
		width: unset;
	}
	.close-btn {
		position: absolute;
		top: 5px;
		right: 20px;
		opacity: 0;
		transform: translate(0, 0) scale(0.5);
	}
	.expand-btn {
		position: absolute;
		top: 5px;
		right: 70px;
		opacity: 0;
		transform: translate(0, 0) scale(0.5);
	}
	.drag-btn {
		position: absolute;
		top: 5px;
		right: 110px;
		opacity: 0;
		cursor: grab;
		transform: translate(0, 0) scale(0.5);
	}
	.drag-btn:active {
		cursor: grabbing;
	}
	.expanded-embed .drag-btn {
		display: none;
	}
	.embed-twitch-item:hover .close-btn,
	.embed-twitch-item:hover .expand-btn,
	.embed-twitch-item:hover .drag-btn {
		opacity: 1;
		transform: translate(0, 0) scale(0.7);
		transition: all 0.2s ease-in-out;
	}
	.close-btn:hover {
		filter: hue-rotate(80deg);
	}
	.embed-drag-box {
		opacity: 0;
		pointer-events: none;
		position: absolute;
		top: 0;
		left: 50%;
		width: 100%;
		height: 100%;
		padding: 5px 10px;
		background-image: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
		border-radius: 7px;
		transform: translateX(-50%);
		user-select: none;
		cursor: grab;
		transition: all 0.2s ease-in-out;
	}
	.embed-dragging .embed-drag-box {
		opacity: 1;
		pointer-events: auto;
	}
	.drag div {
		border-radius: 20px;
		background-color: darkgray;
	}
	.ghost {
		opacity: 0.5;
		border: 5px solid orange;
	}
	.embeds-container-expand {
		display: flex;
		position: absolute;
		top: 67.5%;
		flex-wrap: wrap;
		justify-content: center;
		overflow: auto;
		/* outline: 2px solid red; */
		max-height: 32.5%;
		width: 100%;
		gap: 10px;
		padding: 10px;
		padding-top: 0px;
	}
	.embeds-container-expand .embed-twitch-item {
		min-width: 300px;
		max-width: 500px;
		/* max-height: 30vh; */
		margin: 0;
		/* border: 2px solid red; */
	}
	.expanded-embed {
		width: unset;
		max-width: calc(100% - 45px) !important;
		max-height: 65% !important;
		height: 100% !important;
		position: fixed;
		top: 10px;
		left: 50%;
		transform: translateX(-50%);
		border-radius: 7px;
		z-index: 1;
		/* border: 2px solid red; */
	}
	.expand-solo {
		height: unset !important;
		max-height: 100vh !important;
		width: 98%;
		top: 50%;
		transform: translate(-50%, -50%);
		max-width: unset !important;
	}

	@media (max-width: 1574px) {
		.expanded-embed {
			max-height: 50% !important;
			height: auto !important;
			width: 100%;
		}

		.embeds-container-expand {
			top: 52.5%;
			height: 45%;
			min-height: 46%;
			padding-bottom: 0;
		}

		.embeds-container-expand {
			top: 52.5%;
		}

		.expand-solo {
			height: unset !important;
			max-height: 100vh !important;
			width: 98%;
			top: 50%;
			transform: translate(-50%, -50%);
			max-width: unset !important;
		}
		.expanded-embed .close-btn,
		.expanded-embed .expand-btn,
		.expanded-embed .drag-btn {
			top: 50px;
		}
	}

	@media (max-width: 1280px) {
		.embeds-container {
			grid-template-columns: 1fr;
			padding-left: 5px;
			padding-right: 5px;
		}
	}
</style>
