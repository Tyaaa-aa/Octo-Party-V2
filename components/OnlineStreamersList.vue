<script lang="ts" setup>
	const globalStore = useGlobalStateStore();
	const deleteStreamer = (item: string, event: MouseEvent) => {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		globalStore.removeMatchingStringFromOctoData(item);
		globalStore.activeStreamers = globalStore.activeStreamers.filter(
			(streamer) => streamer.user_login.toUpperCase() !== item.toUpperCase()
		);
		globalStore.inactiveStreamers = globalStore.inactiveStreamers.filter(
			(streamer) => streamer.user_login.toUpperCase() !== item.toUpperCase()
		);
	};
</script>

<template>
	<h4 v-if="globalStore.activeStreamers.length >= 1">
		Streaming ({{ globalStore.activeStreamers.length }})
	</h4>
	<v-list>
		<v-list-item
			v-for="(actStreamer, index) in globalStore.activeStreamers"
			:key="index"
			@click="globalStore.addEmbed(actStreamer.user_login)"
			class="streaming_row"
		>
			<v-btn
				class="deletebtn"
				:class="{ 'deletebtn-hide': !globalStore.editMode }"
				variant="plain"
				icon="mdi-delete"
				color="red-accent-2"
				@click="(event: MouseEvent) => deleteStreamer(actStreamer.user_login, event)"
				v-auto-animate
			>
			</v-btn>
			<img
				:src="actStreamer.profile_picture"
				alt="Profile picture"
				class="profile_picture"
			/>
			<span class="active_streamer">
				{{ actStreamer.user_name }}
				<span v-if="isNotEnglish(actStreamer.user_name)">
					({{ actStreamer.user_login }})
				</span>
			</span>
			<span class="streamer_views">{{ actStreamer.viewer_count }}</span>
		</v-list-item>
		<v-divider
			class="ma-3"
			v-if="globalStore.activeStreamers.length >= 1"
		></v-divider>
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
