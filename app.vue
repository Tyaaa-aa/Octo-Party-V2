<script setup lang="ts">
useSeoMeta({
  title: 'Octo.Party',
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
  bodyAttrs: {
    class: `dark`
  }
})

</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
