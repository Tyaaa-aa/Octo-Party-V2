<script lang="ts" setup>
  import type { StreamerStatus } from "@/types/index.d.ts";
	const props = defineProps<{
		activeStreamers: Array<StreamerStatus>;
		editMode: boolean;
		removeShareItem: (streamer: string, event: MouseEvent) => void;
		addEmbed: (streamer_name: string) => void;
	}>();
</script>

<template>
	<h4 v-if="activeStreamers.length >= 1">
		Streaming ({{ activeStreamers.length }})
	</h4>
	<v-list>
		<v-list-item
			v-for="(actStreamer, index) in activeStreamers"
			:key="index"
			@click="addEmbed(actStreamer.user_name)"
			class="streaming_row"
		>
			<v-btn
				class="deletebtn"
				:class="{ 'deletebtn-hide': !editMode }"
				variant="plain"
				icon="mdi-delete"
				color="red-accent-2"
				@click="(event: MouseEvent) => removeShareItem(actStreamer.user_name, event)"
				v-auto-animate
			>
			</v-btn>
			<img
				:src="actStreamer.profile_picture"
				alt="Profile picture"
				class="profile_picture"
			/>
			<span class="active_streamer">{{ actStreamer.user_name }}</span>
			<span class="streamer_views">{{ actStreamer.viewer_count }}</span>
		</v-list-item>
		<v-divider class="ma-3" v-if="activeStreamers.length >= 1"></v-divider>
	</v-list>
</template>

<style scoped>
	.deletebtn {
		height: 25px !important;
		width: 25px !important;
		margin-right: 10px !important;
		transition: all 0.2s ease-in-out;
	}

	.deletebtn-hide {
		opacity: 0;
		width: 0px !important;
		margin-right: 0px !important;
		pointer-events: none;
		/* outline: 2px solid red; */
	}
	.profile_picture {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		margin-right: 13px;
	}
	.active_streamer,
	.streamer_views {
		flex-basis: 50%;
	}
	.streamer_views {
		text-align: right;
		padding-right: 23px;
	}
	.streamer_views::before {
		content: "";
		display: block;
		width: 8px;
		height: 8px;
		background-color: #eb0400;
		border-radius: 50%;
		position: absolute;
		top: 50%;
		right: 0px;
		transform: translate(-50%, -60%);
	}
</style>
