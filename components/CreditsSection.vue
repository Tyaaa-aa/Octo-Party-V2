<script setup lang="ts">
	const router = useRouter();
	const goToAboutPage = () => {
		router.push("about");
	};
</script>
<template>
	<v-row
		cols="6"
		class="d-flex align-center ma-0 mt-5"
		style="flex-direction: column"
	>
		<div class="d-flex flex-nowrap">
			<v-btn
				prepend-icon="mdi-github"
				stacked
				variant="plain"
				color="grey-darken-1"
				href="https://github.com/Tyaaa-aa/Octo-Party-V2/"
				target="_blank"
			>
				Github
			</v-btn>
			<v-btn
				prepend-icon="mdi-information-outline"
				stacked
				variant="plain"
				color="grey-darken-1"
				@click="goToAboutPage"
			>
				About
			</v-btn>
			<v-btn
				prepend-icon="mdi-currency-usd"
				stacked
				variant="plain"
				color="grey-darken-1"
				href="https://ko-fi.com/octoparty"
				target="_blank"
			>
				Tip
			</v-btn>
			<v-btn
				prepend-icon="mdi-bug-outline"
				stacked
				variant="plain"
				color="grey-darken-1"
				href="https://github.com/Tyaaa-aa/Octo-Party-V2/issues"
				target="_blank"
			>
				Bugs
			</v-btn>
		</div>
		<span class="pa-2 text-center">
			Concept by <a href="https://surya.place/" target="_blank">Surya</a> |
			Developed by <a href="https://tya.design/" target="_blank">Tya</a>
		</span>
	</v-row>
</template>
