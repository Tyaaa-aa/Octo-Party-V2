<script setup lang="ts">
	import QrcodeVue, { type Level, type RenderAs } from "qrcode.vue";
	const globalStore = useGlobalStateStore();

	const level = ref<Level>("M");
	const renderAs = ref<RenderAs>("canvas");

	const copySharedLink = () => {
		navigator.clipboard.writeText(globalStore.url).then(
			function () {
				/* clipboard successfully set */
				globalStore.isSuccess = true;
				globalStore.successMsg = "Link copied to clipboard!";
			},
			function () {
				/* clipboard write failed */
				globalStore.errorMsg = `Failed to copy link to clipboard: ${globalStore.url}`;
				globalStore.isError = true;
			}
		);
	};

	const closeQRCard = () => {
		globalStore.showShare = false;
		globalStore.shareLoading = false;
		globalStore.url = "";
		globalStore.QRvalue = "";
	};
</script>
<template>
	<v-expand-transition>
		<v-card
			v-if="globalStore.listExpand && globalStore.url"
			variant="elevated"
			class="share-card"
		>
			<v-row class="d-flex justify-space-between align-center ma-0">
				<v-col cols="5" class="pa-5">
					<qrcode-vue
						class="qrcode"
						:level="level"
						:render-as="renderAs"
						:value="globalStore.QRvalue"
					/>
				</v-col>
				<v-col cols="7" class="pa-5 pl-0">
					<v-text-field
						:value="globalStore.url"
						variant="solo-filled"
						append-inner-icon="mdi-content-copy"
						@click:append-inner="copySharedLink"
						@keydown.enter="copySharedLink"
						hide-details
						class="copy-url"
					></v-text-field>
				</v-col>
			</v-row>
			<v-btn
			icon="mdi-close"
			variant="plain"
			color="grey-lighten-5"
			class="close-btn"
			size="small"
			@click="closeQRCard">
			</v-btn>
		</v-card>
	</v-expand-transition>
</template>
<style scoped>
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
	.close-btn {
		position: absolute;
		top: 10px;
		right: 7px;
	}
</style>
