<script setup lang="ts">
    const globalStore = useGlobalStateStore();
</script>
<template>
	<v-snackbar
		:timeout="3000"
		color="red-darken-1"
		v-model="globalStore.isError"
		rounded="pill"
	>
		<span class="pr-md-5">{{ globalStore.errorMsg }}</span>
		<v-btn color="red-lighten-1" variant="flat" @click="globalStore.isError = false">
			Close
		</v-btn>
	</v-snackbar>

	<v-snackbar
		:timeout="3000"
		color="deep-purple-accent-4"
		v-model="globalStore.isSuccess"
		rounded="pill"
	>
		<span class="pr-md-5">{{ globalStore.successMsg }}</span>
		<v-btn color="deep-purple-accent-2" variant="flat" @click="globalStore.isSuccess = false">
			Close
		</v-btn>
	</v-snackbar>
</template>