<script setup lang="ts">


const props = defineProps({
    error: Object
})
const route = useRoute()

const error = ref(props.error)

// console.log(route.path);

const path = route.path.substring(0, route.path.length)


const handleError = () => clearError({ redirect: '/' })

const pageurl = ref('')
const shareUrl = ref('')
onMounted(() => {
    pageurl.value = window.location.origin
    shareUrl.value = pageurl.value + '/share' + path

    console.log(window.location.origin)
    console.log(shareUrl.value)
})
// CIWPIJ6y3HB

const title = ref(`Octo.Party | Error ${error.value?.statusCode}`)

useSeoMeta({
    title: title.value,
    ogTitle: 'Octo.Party | Multi-Stream',
    twitterTitle: 'Octo.Party | Multi-Stream',
    twitterDescription: 'Web app for watching multiple Twitch streams at once, shareable with friends!',
    description: 'Web app for watching multiple Twitch streams at once, shareable with friends!',
    ogDescription: 'Web app for watching multiple Twitch streams at once, shareable with friends.',
    ogImage: '/favicon.svg',
    twitterImage: '/favicon.svg',
    ogUrl: 'https://octo.party',
    twitterCard: 'summary'
})

useHead({
    htmlAttrs: {
        lang: 'en'
    },
    link: [
        {
            rel: 'icon',
            type: 'image/svg',
            href: '/favicon.svg'
        }
    ],
})

</script>

<template>
    <main class="d-flex justify-center align-center flex-column" v-auto-animate>
        <!-- Your content here -->
        <img src="/logo.svg" alt="Logo" class="logo bop-animation" @click="handleError">
        <h1>Error {{ error?.statusCode }} :/</h1>
        <p>{{ error?.statusMessage }}</p>
        <div v-if="error?.statusCode === 404">
            <p><i><strong>"{{ path }}"</strong></i> doesn't exist</p>
            <p>
                Maybe you're looking for:
                <br>
                <i>
                    <a :href="shareUrl">{{ shareUrl }}</a>
                </i>
            </p>
        </div>
        <br>
        <v-btn prepend-icon="mdi-chevron-left" variant="flat" color="deep-purple-darken-1" @click="handleError">
            Go Back
        </v-btn>
    </main>
</template>

<style scoped>
/* Your styles here */
img {
    width: 200px;
    height: 200px;
    cursor: pointer;
    transition: all 0.25s ease-in-out;
}
img:hover {
    rotate: -5deg;
    filter: drop-shadow(0 0 4rem #8E24AA);
}

main {
    font-size: 2rem;
}

h1 {
    font-size: 4em;
}

.bop-animation {
    animation: bop 1s ease-in-out infinite alternate;
}

@keyframes bop {
    0% {
        transform: translateY(0);
    }
    100% {
        transform: translateY(-5%);
    }
}

</style>
