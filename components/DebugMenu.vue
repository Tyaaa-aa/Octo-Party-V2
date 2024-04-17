<script setup>
	const props = defineProps({
		SHOW_DEBUG_MENU: Boolean,
	});
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
			v-if="props.SHOW_DEBUG_MENU"
		>
			<v-card>
				<v-row class="d-flex justify-space-between align-center ma-0">
					<v-col cols="12" class="pa-5 pb-2 pt-2">
						<v-list-item class="pa-0">
							<h5 style="color: orange">Debug Menu</h5>
						</v-list-item>
						<v-list-item class="pa-4" @click="$emit('debugAddStreamer')">
							Add Streamer
						</v-list-item>
						<v-list-item class="pa-4" @click="$emit('debugRemoveStreamer')">
							Remove Streamer
						</v-list-item>
						<v-list-item class="pa-4" @click="checkStreamerStatus()">
							Refresh List
						</v-list-item>
					</v-col>
				</v-row>
			</v-card>
		</div>
	</v-expand-transition>
</template>
