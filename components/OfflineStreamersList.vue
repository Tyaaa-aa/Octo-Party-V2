<script lang="ts" setup>
	import type { StreamerStatus } from "@/types/index.d.ts";
	const props = defineProps<{
		inactiveStreamers: Array<StreamerStatus>;
		editMode: boolean;
		removeShareItem: (streamer: string, event: MouseEvent) => void;
		octoStore: any;
	}>();
</script>

<template>
	<h4 v-if="inactiveStreamers.length >= 1">
		Not Streaming ({{ inactiveStreamers.length }})
	</h4>
	<v-list>
		<v-list-item
			v-for="(nonActStreamer, index) in inactiveStreamers"
			:key="index"
			class="non-streaming_row"
		>
			<v-btn
				class="deletebtn"
				:class="{ 'deletebtn-hide': !editMode }"
				variant="plain"
				icon="mdi-delete"
				color="red-accent-2"
				@click="(event: MouseEvent) => removeShareItem(nonActStreamer.user_name, event)"
				v-auto-animate
			>
			</v-btn>
			<img
				:src="nonActStreamer.profile_picture"
				alt="Profile picture"
				class="profile_picture"
			/>
			{{ nonActStreamer.user_name }}
		</v-list-item>
		<div
			v-if="octoStore.octoData.length === 0"
			class="mt-3 text-center"
			style="display: block"
		>
			<h2>Your list is empty :(</h2>
			<br />
			<!-- <span>You can add streamers by searching for them</span> -->
		</div>
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
</style>
