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
	const filteredInactiveStreamers = computed(() => {
		const searchTerm = globalStore.searchedStreamer.trim().toUpperCase();
		return globalStore.inactiveStreamers.filter((streamer) => {
			const userLogin = streamer.user_login.toUpperCase();
			return userLogin.includes(searchTerm);
		});
	});
</script>

<template>
	<h4 v-if="filteredInactiveStreamers.length >= 1">
		Not Streaming ({{ filteredInactiveStreamers.length }})
	</h4>
	<v-list>
		<v-list-item
			v-for="(nonActStreamer, index) in filteredInactiveStreamers"
			:key="index"
			class="non-streaming_row"
		>
			<v-btn
				class="deletebtn"
				:class="{ 'deletebtn-hide': !globalStore.editMode }"
				variant="plain"
				icon="mdi-delete"
				color="red-accent-2"
				@click="(event: MouseEvent) => deleteStreamer(nonActStreamer.user_login, event)"
				v-auto-animate
			>
			</v-btn>
			<img
				:src="nonActStreamer.profile_picture"
				alt="Profile picture"
				class="profile_picture"
			/>
			{{ nonActStreamer.user_name }}
			<span
				v-if="isNotEnglish(nonActStreamer.user_name)"
				style="margin-left: 5px"
			>
				({{ nonActStreamer.user_login }})
			</span>
		</v-list-item>
		<div
			v-if="globalStore.octoData.length === 0"
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
