<template>
	<v-container>
		<!-- Logo and Title -->
		<v-row align="center" >
			<v-col cols="12" class="text-center pa-5" style="max-width: 600px; margin: 0 auto;">
				<img src="/logo.svg" alt="Octo.Party Logo" class="logo mb-4" />
				<h1 class="display-2">About Octo.Party</h1>
				<p class="subtitle-1">
					Octo.Party is a straightforward solution for watching multiple Twitch streams at once. With Octo Party, you can easily create lists of Twitch streams to watch simultaneously, and generate shareable links to share with your friends.
				</p>
			</v-col>
		</v-row>

		<!-- Features -->
		<v-row>
			<v-col cols="12" md="7" class="mx-auto">
				<h2 class="headline">Features</h2>
				<ul class="pa-5">
					<li>
						Multi-Stream Viewing: Watch multiple Twitch streams concurrently
					</li>
					<li>
						Notifications: Get notified when your favorite streamer comes online
					</li>
					<li>
						Create Your Own List: Easily create and manage your list of Twitch
						streams
					</li>
					<li>
						Streamlined Experience: Enjoy a straightforward and intuitive
						interface for seamless viewing
					</li>
					<li>
						Shareable Lists: Create shareable links for your list to send your
						friends or to your other devices
					</li>
					<li>
						No Accounts: No need to sign up or login. Just add your favorite
						streamers and Octo.Party will save your data locally
					</li>
				</ul>
			</v-col>
		</v-row>

		<!-- Go Back Button -->
		<v-row>
			<v-col cols="12" class="text-center">
                <v-btn
					prepend-icon="mdi-chevron-left"
					variant="elevated"
					color="deep-purple-darken-1"
					@click="goToIndexPage"
				>
                    Go Back
				</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup>
	import { useRouter } from "vue-router";

	const router = useRouter();

	const goToIndexPage = () => {
		router.push("/");
	};
</script>

<style scoped>
	.logo {
		width: 150px;
		animation: fadeInDown 1s ease-out;
	}

	@keyframes fadeInDown {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
