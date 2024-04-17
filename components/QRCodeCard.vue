<script setup lang="ts">
	import QrcodeVue, { type Level, type RenderAs } from "qrcode.vue";

	const props = defineProps<{
		url: String;
		QRvalue: String;
		listExpand: Boolean;
	}>();

	const level = ref<Level>("M");
	const renderAs = ref<RenderAs>("canvas");
</script>
<template>
	<v-expand-transition>
		<v-card v-if="listExpand && url" variant="elevated" class="share-card">
			<v-row class="d-flex justify-space-between align-center ma-0">
				<v-col cols="5" class="pa-5">
					<qrcode-vue
						class="qrcode"
						:value="props.QRvalue"
						:level="level"
						:render-as="renderAs"
					/>
				</v-col>
				<v-col cols="7" class="pa-5 pl-0">
					<v-text-field
						:value="url"
						variant="solo-filled"
						append-inner-icon="mdi-content-copy"
						@click:append-inner="$emit('copySharedLink')"
						@keydown.enter="$emit('copySharedLink')"
						hide-details
						class="copy-url"
					></v-text-field>
				</v-col>
			</v-row>
		</v-card>
	</v-expand-transition>
</template>
<style>
	.share-card {
		width: 400px;
	}
	.qrcode {
		width: 100% !important;
		height: 100% !important;
		aspect-ratio: 1 / 1 !important;
		/* border: 2px solid red; */
	}

	.copy-url {
		/* border: 2px solid blue; */
		width: 100%;
	}
</style>
