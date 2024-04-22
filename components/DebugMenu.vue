<script setup>
	const globalStore = useGlobalStateStore();

	const debugStreamer = "LinusTech";

	const debugRemoveStreamer = () => {
		console.log("Removing streamer");
		globalStore.activeStreamers = globalStore.activeStreamers.filter(
			(streamer) => streamer.user_name !== debugStreamer
		);
	};

	const debugAddStreamer = () => {
		console.log("Adding streamer");

		globalStore.activeStreamers = [
			...globalStore.activeStreamers,
			{
				user_login: debugStreamer,
				user_name: debugStreamer,
				viewer_count: 888888,
				profile_picture: "https://octo.party/logo.svg",
			},
		];
	};
</script>

<template>
	<v-expand-transition>
		<div
			id="debug"
			style="
				position: fixed;
				bottom: 90px;
				right: 460px;
				width: 300px;
				z-index: 99999;
			"
			v-if="globalStore.SHOW_DEBUG_MENU"
		>
			<v-card>
				<v-row class="d-flex justify-space-between align-center ma-0">
					<v-col cols="12" class="pa-5 pb-2 pt-2">
						<v-list-item class="pa-0">
							<h5 style="color: orange">Debug Menu</h5>
						</v-list-item>
						<v-list-item class="pa-4" @click="debugAddStreamer">
							Add Streamer
						</v-list-item>
						<v-list-item class="pa-4" @click="debugRemoveStreamer">
							Remove Streamer
						</v-list-item>
						<v-list-item
							class="pa-4"
							@click="
								globalStore.showErrorMessage('Error message from debug menu')
							"
						>
							Show Error Message
						</v-list-item>
						<v-list-item
							class="pa-4"
							@click="
								globalStore.showSuccessMessage(
									'Success message from debug menu'
								)
							"
						>
							Show Success Message
						</v-list-item>
						<v-list-item class="pa-4" @click="globalStore.url = 'https://tya.design/'">
							Show QR Code Card
						</v-list-item>
						<v-list-item class="pa-4" @click="$emit('refreshList')">
							Refresh List
						</v-list-item>
					</v-col>
				</v-row>
			</v-card>
		</div>
	</v-expand-transition>
</template>
